const { randomInt } = require("crypto");
const mongoose = require("mongoose");
const AdmissionApplication = require("../models/AdmissionApplication");

const FORM_FIELDS = {
    personal: ["fullName", "dob", "gender", "idType", "idNumber", "nationality", "religion", "bloodGroup"],
    contactAddress: ["phone", "email", "domicile", "address"],
    guardian: ["fatherName", "motherName", "altPhone"],
    academic: [
        "matricBoard", "matricRollNo", "matricYear", "matricGroup", "matricTotalMarks", "matricObtainedMarks",
        "interStatus", "interBoard", "interRollNo", "interYear", "interTotalMarks", "interObtainedMarks",
    ],
    programCampus: ["academicLevel", "primaryProgram", "secondaryProgram", "preferredShift", "campus"],
    transport: ["required", "route", "pickupPoint"],
    documents: ["matricResultCard", "cnicOrBForm", "guardianCnic", "photo"],
    reviewSubmission: ["undertakingAgreed"],
};

function getApplicantId(req) {
    const id = req.user?._id || req.user?.id;
    return id && mongoose.Types.ObjectId.isValid(id) ? id : null;
}

function getFormData(body) {
    const data = {};

    for (const [section, fields] of Object.entries(FORM_FIELDS)) {
        const sectionInput = body[section];
        const source = sectionInput && typeof sectionInput === "object" && !Array.isArray(sectionInput)
            ? sectionInput
            : body;
        const values = {};

        for (const field of fields) {
            if (Object.prototype.hasOwnProperty.call(source, field)) {
                values[field] = source[field];
            }
        }

        if (Object.keys(values).length) data[section] = values;
    }

    return data;
}

function toDottedUpdates(data) {
    const updates = {};
    for (const [section, values] of Object.entries(data)) {
        for (const [field, value] of Object.entries(values)) {
            updates[`${section}.${field}`] = value;
        }
    }
    return updates;
}

function validateForSubmission(application) {
    const errors = {};
    const requireText = (path, label, minimumLength = 1) => {
        const value = path.split(".").reduce((current, part) => current?.[part], application);
        if (typeof value !== "string" || value.trim().length < minimumLength) {
            errors[path] = `${label} is required${minimumLength > 1 ? ` and must be at least ${minimumLength} characters` : ""}`;
        }
    };

    requireText("personal.fullName", "Full name", 3);
    requireText("personal.dob", "Date of birth");
    requireText("personal.idType", "Identification type");
    requireText("personal.idNumber", "Identification number");
    requireText("personal.nationality", "Nationality");
    requireText("personal.religion", "Religion");
    requireText("contactAddress.domicile", "Domicile");
    requireText("contactAddress.address", "Address", 6);
    requireText("guardian.fatherName", "Father's name", 3);
    requireText("guardian.motherName", "Mother's name", 3);
    requireText("academic.matricBoard", "Matric board");
    requireText("academic.matricRollNo", "Matric roll number");
    requireText("academic.matricYear", "Matric passing year");
    requireText("academic.matricGroup", "Matric group");
    requireText("programCampus.academicLevel", "Academic level");
    requireText("programCampus.primaryProgram", "Primary program");
    requireText("programCampus.preferredShift", "Preferred shift");
    requireText("documents.matricResultCard", "Matric result card");
    requireText("documents.cnicOrBForm", "CNIC or B-Form document");

    for (const path of ["contactAddress.phone", "guardian.altPhone"]) {
        const value = path.split(".").reduce((current, part) => current?.[part], application);
        if (typeof value !== "string" || !/^\d{11}$/.test(value.trim())) {
            errors[path] = "Mobile number must contain exactly 11 digits";
        }
    }

    const email = application.contactAddress?.email;
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        errors["contactAddress.email"] = "Please provide a valid email address";
    }

    const totalMarks = Number(application.academic?.matricTotalMarks);
    const obtainedMarks = Number(application.academic?.matricObtainedMarks);
    if (!Number.isFinite(totalMarks) || totalMarks <= 0) {
        errors["academic.matricTotalMarks"] = "Total marks must be greater than 0";
    }
    if (!Number.isFinite(obtainedMarks) || obtainedMarks <= 0 || obtainedMarks > totalMarks) {
        errors["academic.matricObtainedMarks"] = "Enter valid obtained marks not exceeding total marks";
    }

    if (application.academic?.interStatus === "Passed") {
        requireText("academic.interBoard", "Intermediate board/college");
        requireText("academic.interRollNo", "Intermediate roll number");
        requireText("academic.interYear", "Intermediate passing year");
        const intermediateTotal = Number(application.academic?.interTotalMarks);
        const intermediateObtained = Number(application.academic?.interObtainedMarks);
        if (!Number.isFinite(intermediateTotal) || intermediateTotal <= 0) {
            errors["academic.interTotalMarks"] = "Intermediate total marks must be greater than 0";
        }
        if (!Number.isFinite(intermediateObtained) || intermediateObtained <= 0 || intermediateObtained > intermediateTotal) {
            errors["academic.interObtainedMarks"] = "Enter valid intermediate obtained marks not exceeding total marks";
        }
    }

    if (application.reviewSubmission?.undertakingAgreed !== true) {
        errors["reviewSubmission.undertakingAgreed"] = "You must agree to the undertaking before submitting";
    }

    return errors;
}

function newApplicationNumber() {
    return `APP-${new Date().getFullYear()}-${randomInt(1000, 10000)}`;
}

function handleControllerError(res, error, operation) {
    if (error?.code === 11000) {
        return res.status(409).json({ message: "An application with this number already exists" });
    }

    if (error?.name === "ValidationError" || error?.name === "CastError") {
        return res.status(400).json({
            message: error.name === "ValidationError"
                ? Object.values(error.errors)[0]?.message || "Invalid application data"
                : "Invalid application data",
        });
    }

    console.error(`${operation} failed:`, error.message);
    return res.status(500).json({ message: "Server error — try again" });
}

async function createAdmissionApplication(req, res) {
    const applicantId = getApplicantId(req);
    if (!applicantId) return res.status(401).json({ message: "Authentication required" });
    if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
        return res.status(400).json({ message: "Request body must be an application object" });
    }

    try {
        const existing = await AdmissionApplication.findOne({
            applicantId,
            status: { $ne: "Rejected" },
        }).sort({ updatedAt: -1 });
        if (existing) {
            return res.status(409).json({ message: "You already have an active application", application: existing });
        }

        const application = await AdmissionApplication.create({
            applicantId,
            ...getFormData(req.body),
            status: "Draft",
        });
        return res.status(201).json({ message: "Draft application created", application });
    } catch (error) {
        return handleControllerError(res, error, "Application creation");
    }
}

async function getMyAdmissionApplication(req, res) {
    const applicantId = getApplicantId(req);
    if (!applicantId) return res.status(401).json({ message: "Authentication required" });

    try {
        const application = await AdmissionApplication.findOne({ applicantId }).sort({ updatedAt: -1 });
        if (!application) return res.status(404).json({ message: "No application found" });
        return res.status(200).json({ application });
    } catch (error) {
        return handleControllerError(res, error, "Application lookup");
    }
}

async function updateAdmissionDraft(req, res) {
    const applicantId = getApplicantId(req);
    if (!applicantId) return res.status(401).json({ message: "Authentication required" });
    if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
        return res.status(400).json({ message: "Request body must be an application object" });
    }

    try {
        const application = await AdmissionApplication.findOne({ applicantId, status: "Draft" }).sort({ updatedAt: -1 });
        if (!application) {
            const existing = await AdmissionApplication.findOne({ applicantId }).sort({ updatedAt: -1 });
            if (!existing) return res.status(404).json({ message: "No application found" });
            return res.status(409).json({ message: "Submitted applications cannot be edited" });
        }

        application.set(toDottedUpdates(getFormData(req.body)));
        await application.save();
        return res.status(200).json({ message: "Draft application saved", application });
    } catch (error) {
        return handleControllerError(res, error, "Draft update");
    }
}

async function submitAdmissionApplication(req, res) {
    const applicantId = getApplicantId(req);
    if (!applicantId) return res.status(401).json({ message: "Authentication required" });
    if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
        return res.status(400).json({ message: "Request body must be an application object" });
    }

    try {
        const application = await AdmissionApplication.findOne({ applicantId, status: "Draft" }).sort({ updatedAt: -1 });
        if (!application) {
            const existing = await AdmissionApplication.findOne({ applicantId }).sort({ updatedAt: -1 });
            if (!existing) return res.status(404).json({ message: "No application found" });
            return res.status(409).json({ message: "This application has already been submitted" });
        }

        application.set(toDottedUpdates(getFormData(req.body)));
        const errors = validateForSubmission(application);
        if (Object.keys(errors).length) {
            return res.status(400).json({ message: "Application is incomplete", errors });
        }

        application.applicationNumber = newApplicationNumber();
        application.status = "Submitted";
        application.set("reviewSubmission.submittedAt", new Date().toISOString());
        await application.save();
        return res.status(200).json({ message: "Application submitted successfully", application });
    } catch (error) {
        return handleControllerError(res, error, "Application submission");
    }
}

module.exports = {
    createAdmissionApplication,
    getMyAdmissionApplication,
    updateAdmissionDraft,
    submitAdmissionApplication,
};