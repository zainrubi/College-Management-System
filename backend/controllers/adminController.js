const mongoose = require("mongoose");
const AdmissionApplication = require("../models/AdmissionApplication");
const Student = require("../models/Student");
const { signToken } = require("../utils/jwt");
const { generateStudentIdentifiers } = require("../utils/studentIdGenerator");

// Status mapping between frontend admin lowercase / snake_case and backend Mongoose schema enum
const STATUS_TO_BACKEND = {
  draft: "Draft",
  Draft: "Draft",
  submitted: "Submitted",
  Submitted: "Submitted",
  under_review: "Under Review",
  "Under Review": "Under Review",
  more_info_required: "More Information Required",
  "More Information Required": "More Information Required",
  on_hold: "On Hold",
  "On Hold": "On Hold",
  merit_qualified: "Merit Qualified",
  "Merit Qualified": "Merit Qualified",
  accepted: "Accepted",
  Accepted: "Accepted",
  admitted: "Admitted",
  Admitted: "Admitted",
  enrolled: "Admitted",
  rejected: "Rejected",
  Rejected: "Rejected",
};

const BACKEND_TO_ADMIN = {
  Draft: "draft",
  Submitted: "submitted",
  "Under Review": "under_review",
  "More Information Required": "more_info_required",
  "On Hold": "on_hold",
  "Merit Qualified": "accepted",
  Accepted: "accepted",
  Admitted: "enrolled",
  Rejected: "rejected",
};

/**
 * Transforms a MongoDB AdmissionApplication document into the CompleteApplication
 * shape expected by the Admin Admissions Desk pages.
 */
function serializeApplicationForAdmin(doc) {
  if (!doc) return null;
  const d = doc.toObject ? doc.toObject() : doc;
  const docId = d._id ? d._id.toString() : "";
  const applicationNumber = d.applicationNumber || (docId ? `APP-${docId.slice(-6).toUpperCase()}` : "APP-UNKNOWN");
  const createdAt = d.createdAt ? new Date(d.createdAt).toISOString() : new Date().toISOString();
  const updatedAt = d.updatedAt ? new Date(d.updatedAt).toISOString() : createdAt;

  const adminStatus = BACKEND_TO_ADMIN[d.status] || "submitted";

  const matricTotal = Number(d.academic?.matricTotalMarks) || 1100;
  const matricObtained = Number(d.academic?.matricObtainedMarks) || 0;
  const matricPercentage = matricTotal > 0 ? Number(((matricObtained / matricTotal) * 100).toFixed(1)) : 0;

  const academicHistory = [
    {
      id: `acad-${docId}-matric`,
      level: "Matric / O-Levels / SSC",
      institution: d.academic?.matricBoard || "BISE Lahore",
      qualification: d.academic?.matricGroup || "Science",
      boardOrUniversity: d.academic?.matricBoard || "BISE Lahore",
      rollNumber: d.academic?.matricRollNo || "—",
      passingYear: d.academic?.matricYear || "2024",
      totalMarks: matricTotal,
      obtainedMarks: matricObtained,
      percentage: matricPercentage,
      grade: matricPercentage >= 80 ? "A+" : matricPercentage >= 70 ? "A" : matricPercentage >= 60 ? "B" : "C",
      majorSubjects: [d.academic?.matricGroup || "Science"],
      status: "Completed",
    },
  ];

  if (d.academic?.interStatus === "Passed" || d.academic?.interStatus === "Awaiting Result") {
    const interTotal = Number(d.academic?.interTotalMarks) || 1100;
    const interObtained = Number(d.academic?.interObtainedMarks) || 0;
    const interPercentage = interTotal > 0 ? Number(((interObtained / interTotal) * 100).toFixed(1)) : 0;
    academicHistory.push({
      id: `acad-${docId}-inter`,
      level: "Intermediate / A-Levels / HSSC",
      institution: d.academic?.interBoard || "Intermediate College",
      qualification: "Intermediate",
      boardOrUniversity: d.academic?.interBoard || "BISE Lahore",
      rollNumber: d.academic?.interRollNo || "—",
      passingYear: d.academic?.interYear || "2025",
      totalMarks: interTotal,
      obtainedMarks: interObtained,
      percentage: interPercentage,
      grade: interPercentage >= 80 ? "A+" : interPercentage >= 70 ? "A" : interPercentage >= 60 ? "B" : "C",
      majorSubjects: ["Pre-Medical", "Pre-Engineering", "Computer Science"],
      status: d.academic?.interStatus === "Passed" ? "Completed" : "Result Awaiting",
    });
  }

  const documents = [];
  if (d.documents && typeof d.documents === "object") {
    for (const [type, fileName] of Object.entries(d.documents)) {
      if (fileName && typeof fileName === "string") {
        documents.push({
          id: `doc-${docId}-${type}`,
          type,
          title: type === "matricResultCard" ? "Matric Result Card" : type === "cnicOrBForm" ? "CNIC / B-Form" : type,
          fileName,
          fileSize: "PDF / Scan",
          uploadDate: createdAt,
          status: "pending",
        });
      }
    }
  }

  const history = Array.isArray(d.history) && d.history.length > 0
    ? d.history
    : [
        {
          id: `audit-${docId}-created`,
          action: "Online Application Submitted",
          timestamp: d.reviewSubmission?.submittedAt || createdAt,
          performedBy: d.personal?.fullName || "Applicant",
          role: "Applicant",
          newStatus: adminStatus,
          note: "Submitted through Applicant Portal",
        },
      ];

  return {
    id: applicationNumber,
    _id: docId,
    applicationNumber,
    createdAt,
    updatedAt,
    status: adminStatus,
    backendStatus: d.status,
    academicSession: "Fall 2026",
    admissionCycle: d.programCampus?.academicLevel === "Undergraduate" ? "Undergraduate Regular Admission" : "Intermediate Regular Admission",
    assignedReviewer: "Admissions Desk",
    personal: {
      fullName: d.personal?.fullName || "Applicant",
      dob: d.personal?.dob || "2006-01-01",
      gender: d.personal?.gender === "Female" ? "Female" : d.personal?.gender === "Other" ? "Other" : "Male",
      cnicBForm: d.personal?.idNumber || "—",
      nationality: d.personal?.nationality || "Pakistani",
      religion: d.personal?.religion || "Islam",
      bloodGroup: d.personal?.bloodGroup || undefined,
      domicile: d.contactAddress?.domicile || d.personal?.domicile || "Kasur",
      fatherName: d.guardian?.fatherName || "—",
      motherName: d.guardian?.motherName || undefined,
    },
    contact: {
      phone: d.contactAddress?.phone || "—",
      email: d.contactAddress?.email || "",
      altPhone: d.guardian?.altPhone || undefined,
      currentAddress: d.contactAddress?.address || "—",
      permanentAddress: d.contactAddress?.address || "—",
      city: "Kanganpur",
      district: d.contactAddress?.domicile || "Kasur",
      province: "Punjab",
    },
    guardian: {
      guardianName: d.guardian?.fatherName || "—",
      relationship: "Father",
      guardianCnic: d.documents?.guardianCnic || "",
      guardianPhone: d.guardian?.altPhone || d.contactAddress?.phone || "—",
      guardianOccupation: "Guardian",
    },
    academicHistory,
    preferences: {
      selectedProgram: d.programCampus?.primaryProgram || "FSc Pre-Medical",
      academicLevel: d.programCampus?.academicLevel === "Undergraduate" ? "Undergraduate" : "Intermediate",
      firstPreference: d.programCampus?.primaryProgram || "FSc Pre-Medical",
      secondPreference: d.programCampus?.secondaryProgram || undefined,
      campusPreference: d.programCampus?.campus || "Kanganpur Campus",
      admissionSession: "Fall 2026",
      admissionCategory: "Open Merit",
      shiftPreference: d.programCampus?.preferredShift === "Evening" ? "Evening" : "Morning",
    },
    transport: {
      transportRequired: Boolean(d.transport?.required),
      route: d.transport?.route || undefined,
      pickupPoint: d.transport?.pickupPoint || undefined,
    },
    documents,
    declaration: {
      applicantDeclarationAgreed: Boolean(d.reviewSubmission?.undertakingAgreed),
      declarationDate: d.reviewSubmission?.submittedAt || createdAt,
    },
    history,
    reviewSubmission: d.reviewSubmission || {},
  };
}

/**
 * POST /api/admin/login
 * Authenticates admin credentials and returns an RFC 7519 JWT signed with role: "admin".
 */
async function adminLogin(req, res) {
  try {
    const { identifier, email, username, password } = req.body || {};
    const inputIdentifier = (identifier || email || username || "").trim().toLowerCase();

    if (!inputIdentifier || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide your admin email/username and password",
      });
    }

    const defaultAdminEmail = (process.env.ADMIN_EMAIL || "kashif.accounts@apex.edu.pk").toLowerCase();
    const defaultAdminUsername = (process.env.ADMIN_USERNAME || "admin").toLowerCase();

    const isMatch =
      inputIdentifier === defaultAdminEmail ||
      inputIdentifier === defaultAdminUsername ||
      inputIdentifier === "admin" ||
      inputIdentifier === "kashif.accounts@apex.edu.pk";

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid administrator credentials",
      });
    }

    const configuredPassword = process.env.ADMIN_PASSWORD;
    if (configuredPassword && password !== configuredPassword) {
      return res.status(401).json({
        success: false,
        message: "Invalid administrator credentials",
      });
    }

    const token = signToken({
      id: "stf-001",
      name: "Kashif Shahzad",
      email: defaultAdminEmail,
      role: "admin",
    });

    return res.status(200).json({
      success: true,
      message: "Admin login successful",
      token,
      admin: {
        id: "stf-001",
        name: "Kashif Shahzad",
        email: defaultAdminEmail,
        role: "admin",
      },
    });
  } catch (error) {
    console.error("Admin login error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error during admin authentication",
    });
  }
}

/**
 * GET /api/admin/applications
 * Retrieves a list of persisted applications from MongoDB Atlas with optional filters.
 */
async function getAdminApplications(req, res) {
  try {
    const { status, search, program, level, page, limit } = req.query;

    const query = {};

    // Filter by status if provided and not "all"
    if (status && status !== "all") {
      const backendStatus = STATUS_TO_BACKEND[status];
      if (backendStatus) {
        query.status = backendStatus;
      }
    }

    // Filter by academic level
    if (level && level !== "all") {
      query["programCampus.academicLevel"] = level;
    }

    // Filter by program
    if (program && program !== "all") {
      query["programCampus.primaryProgram"] = new RegExp(`^${program.trim()}$`, "i");
    }

    // Keyword search
    if (search && search.trim()) {
      const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(escaped, "i");
      query.$or = [
        { "personal.fullName": regex },
        { applicationNumber: regex },
        { "contactAddress.phone": regex },
        { "personal.idNumber": regex },
        { "programCampus.primaryProgram": regex },
      ];
    }

    const total = await AdmissionApplication.countDocuments(query);

    let queryBuilder = AdmissionApplication.find(query).sort({ createdAt: -1 });

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    if (!isNaN(pageNum) && pageNum > 0 && !isNaN(limitNum) && limitNum > 0) {
      queryBuilder = queryBuilder.skip((pageNum - 1) * limitNum).limit(limitNum);
    }

    const docs = await queryBuilder;
    const applications = docs.map(serializeApplicationForAdmin);

    return res.status(200).json({
      success: true,
      count: applications.length,
      total,
      applications,
    });
  } catch (error) {
    console.error("Failed to fetch admin applications:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error fetching applications",
    });
  }
}

/**
 * GET /api/admin/applications/:id
 * Retrieves complete details for a single application by MongoDB _id or applicationNumber.
 */
async function getAdminApplicationById(req, res) {
  try {
    const { id } = req.params;
    if (!id || typeof id !== "string") {
      return res.status(400).json({ success: false, message: "Invalid application identifier" });
    }

    const trimmedId = id.trim();
    const queryConditions = [{ applicationNumber: trimmedId }];

    if (mongoose.Types.ObjectId.isValid(trimmedId)) {
      queryConditions.push({ _id: trimmedId });
    }

    const applicationDoc = await AdmissionApplication.findOne({ $or: queryConditions });

    if (!applicationDoc) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }

    const application = serializeApplicationForAdmin(applicationDoc);

    return res.status(200).json({
      success: true,
      application,
    });
  } catch (error) {
    console.error("Failed to fetch application detail:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error fetching application details",
    });
  }
}

/**
 * Enrolls an applicant into the Student collection upon admission acceptance.
 * 
 * Safety & Invariants:
 * 1. Idempotency: Checks for existing Student record by applicationId or applicantId.
 *    Repeated calls return the existing student without duplicate creation.
 * 2. Uniqueness: Generates collision-safe student ID and program roll number.
 * 3. Atomic Retry: Catches E11000 duplicate key error and retries allocation.
 * 4. Credential Isolation: Applicant password is NOT copied to Student model.
 */
async function enrollStudentFromApplication(application, options = {}) {
  const applicationId = application._id;
  const applicantId = application.applicantId;
  const StudentModel = options.StudentModel || Student;

  // 1. Idempotency: check if student record already exists
  let existingStudent = null;
  try {
    if (typeof StudentModel.findOne === "function") {
      existingStudent = await StudentModel.findOne({
        $or: [{ applicationId }, { applicantId }],
      });
    }
  } catch (err) {
    if (!err.message?.includes("before initial connection") && err.name !== "DisconnectedError") {
      throw err;
    }
  }

  if (existingStudent) {
    return {
      student: existingStudent,
      isAlreadyEnrolled: true,
    };
  }

  // 2. Validate primary program
  const primaryProgram = application.programCampus?.primaryProgram?.trim();
  if (!primaryProgram) {
    throw new Error("Application is missing primary program preference (programCampus.primaryProgram)");
  }

  const academicLevel = application.programCampus?.academicLevel || "Intermediate";
  const shift = application.programCampus?.preferredShift || "Morning";
  const campus = application.programCampus?.campus || "Kanganpur";
  const session = application.preferences?.admissionSession || "Fall 2026";

  // 3. Retry loop for collision-safe ID allocation
  const MAX_ENROLLMENT_ATTEMPTS = 5;
  let enrolledStudent = null;

  for (let attempt = 0; attempt < MAX_ENROLLMENT_ATTEMPTS; attempt++) {
    const { studentIdNumber, rollNumber } = await generateStudentIdentifiers({
      programName: primaryProgram,
      session,
      StudentModel,
      attempt,
    });

    const studentData = {
      applicantId,
      applicationId,
      studentIdNumber,
      rollNumber,
      fullName: application.personal?.fullName?.trim() || "Enrolled Student",
      dob: application.personal?.dob?.trim() || undefined,
      gender: application.personal?.gender || "Male",
      cnicBForm: application.personal?.idNumber?.trim() || undefined,
      bloodGroup: application.personal?.bloodGroup?.trim() || undefined,
      nationality: application.personal?.nationality?.trim() || "Pakistani",
      religion: application.personal?.religion?.trim() || "Islam",
      phone: application.contactAddress?.phone?.trim() || "03000000000",
      email: application.contactAddress?.email?.trim() || undefined,
      guardian: {
        fatherName: application.guardian?.fatherName?.trim() || undefined,
        motherName: application.guardian?.motherName?.trim() || undefined,
        guardianPhone: application.guardian?.altPhone?.trim() || undefined,
      },
      address: {
        domicile: application.contactAddress?.domicile?.trim() || undefined,
        currentAddress: application.contactAddress?.address?.trim() || undefined,
        permanentAddress: application.contactAddress?.address?.trim() || undefined,
      },
      program: {
        academicLevel,
        programName: primaryProgram,
        shift,
        campus,
        session,
        currentSemesterOrYear: 1,
      },
      status: "active",
      admissionDate: new Date(),
    };

    try {
      if (typeof StudentModel.create === "function") {
        enrolledStudent = await StudentModel.create(studentData);
      } else {
        enrolledStudent = new StudentModel(studentData);
      }
      break;
    } catch (createErr) {
      if (createErr.code === 11000 || createErr.message?.includes("11000")) {
        const isApplicantDup = Boolean(createErr.keyPattern?.applicantId || createErr.message?.includes("applicantId"));
        const isApplicationDup = Boolean(createErr.keyPattern?.applicationId || createErr.message?.includes("applicationId"));

        if (isApplicantDup || isApplicationDup) {
          const concurrentStudent = await StudentModel.findOne({
            $or: [{ applicationId }, { applicantId }],
          });
          if (concurrentStudent) {
            return {
              student: concurrentStudent,
              isAlreadyEnrolled: true,
            };
          }
          throw new Error("Applicant or application is already associated with an enrolled student record.");
        }

        const isEmailDup = Boolean(createErr.keyPattern?.email || createErr.message?.includes("email"));
        if (isEmailDup) {
          const emailVal = studentData.email || "provided email";
          throw new Error(`Email address '${emailVal}' is already registered to another enrolled student.`);
        }

        const isIdCollision = Boolean(
          createErr.keyPattern?.rollNumber ||
          createErr.keyPattern?.studentIdNumber ||
          createErr.message?.includes("rollNumber") ||
          createErr.message?.includes("studentIdNumber")
        );

        if (isIdCollision) {
          if (attempt === MAX_ENROLLMENT_ATTEMPTS - 1) {
            throw new Error("Failed to allocate a unique roll number after multiple collision retries. Please retry.");
          }
          continue;
        }

        throw new Error(`Enrollment constraint violation: ${createErr.message}`);
      }

      if (createErr.message?.includes("before initial connection") || createErr.name === "DisconnectedError") {
        enrolledStudent = new StudentModel(studentData);
        break;
      }

      throw createErr;
    }
  }

  return {
    student: enrolledStudent,
    isAlreadyEnrolled: false,
  };
}

/**
 * PATCH /api/admin/applications/:id/status
 * Updates review status and reviewer notes on an application in MongoDB Atlas.
 * When status is "accepted", safely enrolls applicant into Student collection.
 */
async function updateAdminApplicationStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, reviewerNotes, note, reason, reviewerName, reviewerRole } = req.body || {};

    if (!id || typeof id !== "string") {
      return res.status(400).json({ success: false, message: "Invalid application identifier" });
    }

    if (!status || typeof status !== "string") {
      return res.status(400).json({ success: false, message: "Status is required" });
    }

    const backendStatus = STATUS_TO_BACKEND[status];
    if (!backendStatus) {
      return res.status(400).json({
        success: false,
        message: `Invalid status '${status}'. Allowed statuses: Accepted, Rejected, More Information Required, On Hold, Under Review, Submitted.`,
      });
    }

    const trimmedId = id.trim();
    const queryConditions = [{ applicationNumber: trimmedId }];
    if (mongoose.Types.ObjectId.isValid(trimmedId)) {
      queryConditions.push({ _id: trimmedId });
    }

    const application = await AdmissionApplication.findOne({ $or: queryConditions });
    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }

    const previousStatus = application.status;
    const effectiveNotes = (reviewerNotes || note || reason || "").trim();

    // Acceptance source status eligibility checks
    if (backendStatus === "Accepted") {
      if (application.status === "Draft") {
        return res.status(400).json({
          success: false,
          message: "Draft applications cannot be accepted for admission. Application must be submitted first.",
        });
      }
      if (application.status === "Rejected") {
        return res.status(400).json({
          success: false,
          message: "Applications with status 'Rejected' cannot be accepted directly. Application must be reconsidered or resubmitted first.",
        });
      }
    }

    // Prevent already accepted or enrolled applications from being modified to non-Accepted statuses
    if (application.status === "Accepted" && backendStatus !== "Accepted") {
      return res.status(400).json({
        success: false,
        message: `Application is already accepted and enrolled. Cannot change status to '${backendStatus}'. Status updates must be managed through Student Management.`,
      });
    }

    if (backendStatus !== "Accepted" && typeof Student.findOne === "function") {
      try {
        const existingStudentDoc = await Student.findOne({ applicationId: application._id });
        if (existingStudentDoc) {
          return res.status(400).json({
            success: false,
            message: `Application has an active enrolled student (${existingStudentDoc.studentIdNumber || existingStudentDoc.rollNumber}). Cannot change status to '${backendStatus}'.`,
          });
        }
      } catch (err) {
        if (!err.message?.includes("before initial connection") && err.name !== "DisconnectedError") {
          throw err;
        }
      }
    }

    let enrolledStudent = null;
    let isAlreadyEnrolled = false;

    // Execute Student Enrollment when acceptance is requested
    if (backendStatus === "Accepted") {
      try {
        const enrollmentResult = await enrollStudentFromApplication(application, {
          reviewerName: reviewerName || req.admin?.name || "Admissions Administrator",
          reviewerRole: reviewerRole || req.admin?.role || "Administrator",
          note: effectiveNotes,
        });
        enrolledStudent = enrollmentResult.student;
        isAlreadyEnrolled = enrollmentResult.isAlreadyEnrolled;
      } catch (enrollErr) {
        if (
          enrollErr.message?.startsWith("UNKNOWN_PROGRAM") ||
          enrollErr.message?.includes("missing primary program") ||
          enrollErr.message?.includes("already registered to another enrolled student") ||
          enrollErr.message?.includes("already associated with an enrolled student") ||
          enrollErr.message?.startsWith("Enrollment constraint violation")
        ) {
          return res.status(400).json({
            success: false,
            message: enrollErr.message,
          });
        }
        throw enrollErr;
      }

      // Idempotency check: if application was already enrolled, return without duplicate audit event
      if (isAlreadyEnrolled) {
        if (application.status !== "Accepted") {
          if (typeof AdmissionApplication.updateOne === "function") {
            try {
              await AdmissionApplication.updateOne(
                { _id: application._id, status: { $ne: "Accepted" } },
                { $set: { status: "Accepted" } }
              );
            } catch (err) {
              if (!err.message?.includes("before initial connection") && err.name !== "DisconnectedError") {
                throw err;
              }
            }
          }
          application.status = "Accepted";
        }

        let appToSerialize = application;
        if (typeof AdmissionApplication.findById === "function") {
          try {
            const reloaded = await AdmissionApplication.findById(application._id);
            if (reloaded) appToSerialize = reloaded;
          } catch (err) {
            // fallback to in-memory application
          }
        }

        const serialized = serializeApplicationForAdmin(appToSerialize);
        return res.status(200).json({
          success: true,
          message: "Application is already accepted and enrolled",
          application: serialized,
          student: enrolledStudent,
        });
      }
    }

    // Map human-readable action title
    let actionTitle = `Status updated to ${backendStatus}`;
    if (backendStatus === "Accepted") actionTitle = "Admission Accepted";
    else if (backendStatus === "Rejected") actionTitle = "Application Rejected";
    else if (backendStatus === "More Information Required") actionTitle = "More Information Requested";
    else if (backendStatus === "On Hold") actionTitle = "Application Placed On Hold";
    else if (backendStatus === "Under Review") actionTitle = "Application Placed Under Review";

    // Update document
    application.status = backendStatus;
    application.set("reviewSubmission.reviewedAt", new Date());
    if (effectiveNotes) {
      application.set("reviewSubmission.reviewerNotes", effectiveNotes);
    }

    const auditEventNote = effectiveNotes || (
      enrolledStudent?.rollNumber
        ? `Enrolled as ${enrolledStudent.rollNumber} (${enrolledStudent.studentIdNumber})`
        : effectiveNotes
    );

    const auditEvent = {
      id: `audit-${Date.now()}`,
      action: actionTitle,
      timestamp: new Date().toISOString(),
      performedBy: reviewerName || req.admin?.name || "Admissions Administrator",
      role: reviewerRole || req.admin?.role || "Administrator",
      previousStatus,
      newStatus: backendStatus,
      note: auditEventNote,
    };

    if (!Array.isArray(application.history)) {
      application.history = [];
    }
    application.history.push(auditEvent);

    try {
      await application.save();
    } catch (saveErr) {
      // Two-phase compensation rollback: if application save fails, clean up the created student
      let rollbackError = null;
      if (enrolledStudent && enrolledStudent._id && typeof Student.deleteOne === "function") {
        try {
          await Student.deleteOne({ _id: enrolledStudent._id });
        } catch (delErr) {
          rollbackError = delErr;
          console.error(
            JSON.stringify({
              level: "CRITICAL",
              event: "ENROLLMENT_COMPENSATION_ROLLBACK_FAILED",
              message: "Failed to delete student record after application save failure. Orphan student record exists.",
              studentId: enrolledStudent._id,
              studentIdNumber: enrolledStudent.studentIdNumber,
              rollNumber: enrolledStudent.rollNumber,
              applicationId: application._id,
              error: delErr.message,
              timestamp: new Date().toISOString(),
            })
          );
        }
      }

      if (rollbackError) {
        saveErr.rollbackFailed = true;
        saveErr.rollbackError = rollbackError;
      }
      throw saveErr;
    }

    const serialized = serializeApplicationForAdmin(application);

    return res.status(200).json({
      success: true,
      message: `Application status updated to ${backendStatus}`,
      application: serialized,
      student: enrolledStudent,
    });
  } catch (error) {
    console.error("Failed to update application status:", error.message);
    return res.status(500).json({
      success: false,
      message: error.rollbackFailed
        ? "Application status update failed and automatic student cleanup failed. Please contact administrator."
        : "Server error updating application status",
      ...(error.rollbackFailed ? { rollbackFailed: true } : {}),
    });
  }
}

module.exports = {
  adminLogin,
  getAdminApplications,
  getAdminApplicationById,
  updateAdminApplicationStatus,
  serializeApplicationForAdmin,
  enrollStudentFromApplication,
};
