const mongoose = require("mongoose");
const AdmissionApplication = require("../models/AdmissionApplication");
const { signToken } = require("../utils/jwt");

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
 * PATCH /api/admin/applications/:id/status
 * Updates review status and reviewer notes on an application in MongoDB Atlas.
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

    const auditEvent = {
      id: `audit-${Date.now()}`,
      action: actionTitle,
      timestamp: new Date().toISOString(),
      performedBy: reviewerName || req.admin?.name || "Admissions Administrator",
      role: reviewerRole || req.admin?.role || "Administrator",
      previousStatus,
      newStatus: backendStatus,
      note: effectiveNotes,
    };

    if (!Array.isArray(application.history)) {
      application.history = [];
    }
    application.history.push(auditEvent);

    await application.save();

    const serialized = serializeApplicationForAdmin(application);

    return res.status(200).json({
      success: true,
      message: `Application status updated to ${backendStatus}`,
      application: serialized,
    });
  } catch (error) {
    console.error("Failed to update application status:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error updating application status",
    });
  }
}

module.exports = {
  adminLogin,
  getAdminApplications,
  getAdminApplicationById,
  updateAdminApplicationStatus,
  serializeApplicationForAdmin,
};
