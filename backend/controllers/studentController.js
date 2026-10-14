const crypto = require("crypto");
const Student = require("../models/Student");
const Applicant = require("../models/Applicant");
const FeeVoucher = require("../models/FeeVoucher");
const { signToken, verifyToken } = require("../utils/jwt");

/**
 * Normalizes input identifier and builds flexible lookup query conditions
 * for Student records (Student ID, Roll Number, Phone, or Email).
 */
function buildStudentLookupQuery(identifier) {
  if (!identifier || typeof identifier !== "string") {
    return { _id: null };
  }
  const trimmed = identifier.trim().slice(0, 100);
  const upper = trimmed.toUpperCase();

  const conditions = [
    { studentIdNumber: upper },
    { rollNumber: upper },
  ];

  if (/^[0-9]{11}$/.test(trimmed)) {
    conditions.push({ phone: trimmed });
  }

  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    conditions.push({ email: trimmed.toLowerCase() });
  }

  return { $or: conditions };
}

/**
 * POST /api/students/request-activation (alias: /api/students/initiate-activation)
 * Initiates the student account activation workflow.
 * Verifies identity securely:
 * - Either via authenticated applicant JWT (req.user matching student.applicantId),
 * - Or by verifying the applicant's private password + phone against the linked Applicant account.
 * Rejects Student ID/CNIC alone to prevent unauthorized takeovers from public merit lists.
 * Generates a cryptographically secure, single-use, 15-minute activation token.
 */
async function requestStudentActivation(req, res) {
  try {
    const { identifier, studentId, rollNumber, phone, applicantPassword } = req.body || {};
    const rawIdentifier = (
      typeof identifier === "string" ? identifier :
      typeof studentId === "string" ? studentId :
      typeof rollNumber === "string" ? rollNumber : ""
    ).trim();

    if (!rawIdentifier) {
      return res.status(400).json({
        success: false,
        message: "Please provide your student identifier (Student ID or Roll Number)",
      });
    }

    const query = buildStudentLookupQuery(rawIdentifier);

    let student = null;
    if (typeof Student.findOne === "function") {
      student = await Student.findOne(query).select("+password +activationTokenHash +activationTokenExpires");
    }

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Enrolled student record not found",
      });
    }

    // Eligibility check: already activated accounts cannot be reactivated
    if (student.isActivated || student.password) {
      return res.status(400).json({
        success: false,
        code: "ALREADY_ACTIVATED",
        message: "Student account is already activated. Please sign in directly.",
      });
    }

    // Eligibility check: suspended or withdrawn accounts cannot be activated
    if (student.status !== "active") {
      return res.status(403).json({
        success: false,
        message: `Cannot activate student account with status '${student.status}'.`,
      });
    }

    // Identity Verification Check:
    // Determine if authenticated via applicant JWT session
    let authenticatedApplicantId = null;
    if (req.user && (req.user._id || req.user.id)) {
      authenticatedApplicantId = req.user._id || req.user.id;
    } else if (req.headers && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : authHeader.trim();
      try {
        const decoded = verifyToken(token);
        if (decoded?.role === "applicant") {
          authenticatedApplicantId = decoded.id || decoded._id || decoded.sub;
        }
      } catch {
        // Fall back to credential verification below
      }
    }

    if (authenticatedApplicantId) {
      // Verified applicant session matches student's applicantId
      const isOwner = String(student.applicantId) === String(authenticatedApplicantId);
      if (!isOwner) {
        return res.status(403).json({
          success: false,
          message: "Forbidden: authenticated applicant does not own this student record",
        });
      }
    } else {
      // Public activation request: requires applicant phone and private applicant password
      const rawPhone = (phone || "").trim();
      if (!rawPhone || !applicantPassword || typeof applicantPassword !== "string") {
        return res.status(400).json({
          success: false,
          message: "Please provide your registered mobile number and Applicant account password to verify identity",
        });
      }

      let applicant = null;
      if (typeof Applicant.findById === "function") {
        applicant = await Applicant.findById(student.applicantId).select("+password");
      }

      if (!applicant || applicant.phone !== rawPhone) {
        return res.status(401).json({
          success: false,
          message: "Verification failed: applicant credentials do not match student records",
        });
      }

      const isMatch = await applicant.comparePassword(applicantPassword);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: "Verification failed: invalid applicant password",
        });
      }
    }

    // Cryptographically secure, single-use activation token generation
    const rawActivationToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawActivationToken).digest("hex");

    student.activationTokenHash = tokenHash;
    student.activationTokenExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes TTL

    await student.save();

    return res.status(200).json({
      success: true,
      message: "Activation token generated successfully. Please set your new student password within 15 minutes.",
      activationToken: rawActivationToken,
      expiresInMinutes: 15,
      student: {
        id: student._id,
        studentIdNumber: student.studentIdNumber,
        rollNumber: student.rollNumber,
        fullName: student.fullName,
      },
    });
  } catch (error) {
    console.error("Student activation request failed:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error initiating account activation",
    });
  }
}

/**
 * POST /api/students/activate (alias: /api/students/set-password)
 * Completes student account activation and sets initial student password.
 * Validates the single-use activation token against stored SHA-256 hash.
 * Hashes new password with bcrypt via Student schema pre-save hook.
 * Invalidates token to guarantee single-use.
 */
async function activateStudentAccount(req, res) {
  try {
    const { activationToken, password, confirmPassword } = req.body || {};

    if (!activationToken || typeof activationToken !== "string" || !activationToken.trim()) {
      return res.status(400).json({
        success: false,
        message: "Activation token is required",
      });
    }

    if (!password || typeof password !== "string" || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    if (confirmPassword && (typeof confirmPassword !== "string" || password !== confirmPassword)) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    const tokenHash = crypto.createHash("sha256").update(activationToken.trim()).digest("hex");

    let student = null;
    if (typeof Student.findOne === "function") {
      student = await Student.findOne({ activationTokenHash: tokenHash })
        .select("+password +activationTokenHash +activationTokenExpires");
    }

    if (!student) {
      return res.status(400).json({
        success: false,
        message: "Invalid or unrecognized activation token",
      });
    }

    // Check expiration
    if (!student.activationTokenExpires || student.activationTokenExpires < new Date()) {
      // Clear expired token
      student.activationTokenHash = undefined;
      student.activationTokenExpires = undefined;
      await student.save();

      return res.status(400).json({
        success: false,
        message: "Activation token has expired. Please request a new activation token.",
      });
    }

    // Eligibility check
    if (student.isActivated || student.password) {
      student.activationTokenHash = undefined;
      student.activationTokenExpires = undefined;
      await student.save();

      return res.status(400).json({
        success: false,
        code: "ALREADY_ACTIVATED",
        message: "Student account is already activated. Please sign in directly.",
      });
    }

    if (student.status !== "active") {
      return res.status(403).json({
        success: false,
        message: `Cannot activate student account with status '${student.status}'.`,
      });
    }

    // Set new password (pre-save hook hashes with bcrypt)
    student.password = password;
    student.isActivated = true;
    student.activatedAt = new Date();
    // Invalidate token immediately (single-use guarantee)
    student.activationTokenHash = undefined;
    student.activationTokenExpires = undefined;

    await student.save();

    return res.status(200).json({
      success: true,
      message: "Student account activated successfully. You can now log in with your new password.",
      student: {
        id: student._id,
        studentIdNumber: student.studentIdNumber,
        rollNumber: student.rollNumber,
        fullName: student.fullName,
        isActivated: true,
      },
    });
  } catch (error) {
    console.error("Student account activation failed:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error activating student account",
    });
  }
}

/**
 * POST /api/students/login
 * Authenticates an enrolled student using Student ID, Roll Number, Email, or Phone.
 * Validates password using Student model comparePassword.
 * Checks account activation and status (rejects suspended accounts).
 * Issues signed JWT with role "student".
 */
async function loginStudent(req, res) {
  try {
    const { identifier, studentId, rollNumber, email, phone, password } = req.body || {};
    const rawIdentifier = identifier || studentId || rollNumber || email || phone;

    if (
      !rawIdentifier ||
      typeof rawIdentifier !== "string" ||
      !rawIdentifier.trim() ||
      !password ||
      typeof password !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide your student identifier (Student ID, Roll Number, Email, or Phone) and password",
      });
    }

    const query = buildStudentLookupQuery(rawIdentifier);

    let student = null;
    if (typeof Student.findOne === "function") {
      student = await Student.findOne(query).select("+password");
    }

    // Generic 401 error for unknown student to prevent enumeration
    if (!student) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Safe handling for newly enrolled students whose initial password has not been set yet
    if (!student.password || student.isActivated === false) {
      return res.status(401).json({
        success: false,
        code: "ACCOUNT_NOT_ACTIVATED",
        message: "Student account has not been activated. Please complete initial password setup before logging in.",
      });
    }

    // Compare password with bcrypt hash on Student model
    const isMatch = await student.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Verify account status
    if (student.status !== "active") {
      return res.status(403).json({
        success: false,
        message: `Student account is ${student.status}. Login not permitted.`,
      });
    }

    // Generate signed JWT token with student claims
    const token = signToken({
      id: student._id.toString(),
      studentIdNumber: student.studentIdNumber,
      rollNumber: student.rollNumber,
      role: "student",
    });

    // Return sanitized profile (never exposing password hash)
    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      student: {
        id: student._id,
        studentIdNumber: student.studentIdNumber,
        rollNumber: student.rollNumber,
        fullName: student.fullName,
        phone: student.phone,
        email: student.email,
        program: student.program,
        status: student.status,
        admissionDate: student.admissionDate,
      },
    });
  } catch (error) {
    if (error.message?.includes("JWT_SECRET")) {
      console.error("Student login configuration error: JWT_SECRET missing");
      return res.status(500).json({
        success: false,
        message: "Server configuration error",
      });
    }

    console.error("Student login failed:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error — try again",
    });
  }
}

/**
 * GET /api/students/profile
 * Returns the authenticated student's full profile without sensitive fields.
 * Protected by protectStudent middleware.
 */
async function getStudentProfile(req, res) {
  try {
    const student = req.student || req.user;
    if (!student) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: student session not found",
      });
    }

    return res.status(200).json({
      success: true,
      student: {
        id: student._id,
        applicantId: student.applicantId,
        applicationId: student.applicationId,
        studentIdNumber: student.studentIdNumber,
        rollNumber: student.rollNumber,
        fullName: student.fullName,
        dob: student.dob,
        gender: student.gender,
        cnicBForm: student.cnicBForm,
        bloodGroup: student.bloodGroup,
        nationality: student.nationality,
        religion: student.religion,
        phone: student.phone,
        email: student.email,
        guardian: student.guardian,
        address: student.address,
        program: student.program,
        status: student.status,
        admissionDate: student.admissionDate,
        createdAt: student.createdAt,
        updatedAt: student.updatedAt,
      },
    });
  } catch (error) {
    console.error("Failed to retrieve student profile:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error retrieving student profile",
    });
  }
}

/**
 * GET /api/students/vouchers
 * Retrieves all fee vouchers belonging strictly to the authenticated student.
 * Protected by protectStudent middleware.
 * Never trusts client-supplied query/params; enforces ownership via req.student._id.
 */
async function getStudentVouchers(req, res) {
  try {
    const student = req.student || req.user;
    if (!student || !student._id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: student session not found",
      });
    }

    // Explicitly query strictly by the authenticated student ID
    const vouchers = await FeeVoucher.find({ studentId: student._id })
      .sort({ issueDate: -1, createdAt: -1 })
      .lean();

    let unpaidCount = 0;
    let totalOutstandingPKR = 0;
    let totalPaidPKR = 0;

    const formattedVouchers = (vouchers || []).map((v) => {
      const isCancelled = v.status === "cancelled";
      const totalAmount = Number(v.totalAmountPKR) || 0;
      const paidAmount = Number(v.paidAmountPKR) || 0;
      // Calculate outstanding amounts consistently using max(totalAmountPKR - paidAmountPKR, 0)
      const outstandingAmount = isCancelled ? 0 : Math.max(0, totalAmount - paidAmount);

      totalPaidPKR += paidAmount;

      if (!isCancelled) {
        totalOutstandingPKR += outstandingAmount;
        if (["unpaid", "partially_paid", "overdue", "extended"].includes(v.status) || outstandingAmount > 0) {
          unpaidCount += 1;
        }
      }

      return {
        id: v._id ? v._id.toString() : "",
        voucherNumber: v.voucherNumber,
        studentId: v.studentId ? v.studentId.toString() : "",
        studentRollNumber: v.studentRollNumber,
        studentName: v.studentName,
        programName: v.programName,
        academicSessionName: v.academicSessionName,
        items: (v.items || []).map((item) => ({
          id: item._id ? item._id.toString() : "",
          title: item.title,
          category: item.category,
          amountPKR: Number(item.amountPKR) || 0,
        })),
        subtotalPKR: Number(v.subtotalPKR) || 0,
        discountPKR: Number(v.discountPKR) || 0,
        totalAmountPKR: totalAmount,
        paidAmountPKR: paidAmount,
        outstandingAmountPKR: outstandingAmount,
        issueDate: v.issueDate,
        originalDueDate: v.originalDueDate,
        finalAllowedDate: v.finalAllowedDate,
        concession: v.concession || null,
        paymentRecords: (v.paymentRecords || []).map((record) => ({
          id: record._id ? record._id.toString() : undefined,
          receiptNumber: record.receiptNumber,
          transactionReference: record.transactionReference,
          amountPaidPKR: Number(record.amountPaidPKR) || 0,
          paymentDate: record.paymentDate,
          paymentMethod: record.paymentMethod,
          verifiedByAdminName: record.verifiedByAdminName,
          verifiedAt: record.verifiedAt,
        })),
        status: v.status,
        remarks: v.remarks,
        createdAt: v.createdAt,
        updatedAt: v.updatedAt,
      };
    });

    return res.status(200).json({
      success: true,
      vouchers: formattedVouchers,
      summary: {
        totalVouchers: formattedVouchers.length,
        unpaidCount,
        pendingCount: unpaidCount,
        totalOutstandingPKR,
        totalPaidPKR,
      },
    });
  } catch (error) {
    console.error("Failed to retrieve student vouchers:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error retrieving fee vouchers",
    });
  }
}

module.exports = {
  loginStudent,
  getStudentProfile,
  getStudentVouchers,
  requestStudentActivation,
  activateStudentAccount,
  buildStudentLookupQuery,
};
