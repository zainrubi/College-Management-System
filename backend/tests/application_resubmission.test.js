const assert = require("assert");
const mongoose = require("mongoose");
const {
  submitAdmissionApplication,
  updateAdmissionDraft,
} = require("../controllers/admissionApplicationController");
const AdmissionApplication = require("../models/AdmissionApplication");

// Helper to create mock Express response object
function createMockRes() {
  const res = {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.body = data;
      return this;
    },
  };
  return res;
}

function getValidSubmissionPayload(overrides = {}) {
  return {
    personal: {
      fullName: "Muhammad Ali Khan",
      dob: "2006-05-14",
      gender: "Male",
      idType: "B-Form / Juvenile Card",
      idNumber: "35102-1234567-1",
      nationality: "Pakistani",
      religion: "Islam",
      bloodGroup: "B+",
      ...overrides.personal,
    },
    contactAddress: {
      phone: "03001234567",
      email: "applicant@example.com",
      domicile: "Kasur",
      address: "Main Bazar Kanganpur, District Kasur",
      ...overrides.contactAddress,
    },
    guardian: {
      fatherName: "Tariq Mahmood Khan",
      motherName: "Nasreen Akhtar",
      altPhone: "03009876543",
      ...overrides.guardian,
    },
    academic: {
      matricBoard: "BISE Lahore",
      matricRollNo: "884920",
      matricYear: "2024",
      matricGroup: "Science (Biology)",
      matricTotalMarks: "1100",
      matricObtainedMarks: "982",
      interStatus: "Not Applicable (Applying for Inter)",
      ...overrides.academic,
    },
    programCampus: {
      academicLevel: "Intermediate",
      primaryProgram: "FSc Pre-Medical",
      secondaryProgram: "ICS (Computer Science)",
      preferredShift: "Morning",
      campus: "Kanganpur",
      ...overrides.programCampus,
    },
    documents: {
      matricResultCard: "matric_result_884920.pdf",
      cnicOrBForm: "bform_3510212345671.pdf",
      ...overrides.documents,
    },
    reviewSubmission: {
      undertakingAgreed: true,
      ...overrides.reviewSubmission,
    },
  };
}

function createMockApplicationDoc(initialData) {
  const doc = {
    _id: initialData._id || new mongoose.Types.ObjectId(),
    applicantId: initialData.applicantId,
    applicationNumber: initialData.applicationNumber || "APP-2026-9001",
    status: initialData.status || "More Information Required",
    personal: { ...initialData.personal },
    contactAddress: { ...initialData.contactAddress },
    guardian: { ...initialData.guardian },
    academic: { ...initialData.academic },
    programCampus: { ...initialData.programCampus },
    documents: { ...initialData.documents },
    reviewSubmission: { ...initialData.reviewSubmission },
    history: Array.isArray(initialData.history) ? [...initialData.history] : [],
    set: function (data, val) {
      if (typeof data === "string") {
        const parts = data.split(".");
        if (parts.length === 2) {
          this[parts[0]] = this[parts[0]] || {};
          this[parts[0]][parts[1]] = val;
        } else {
          this[data] = val;
        }
      } else if (data && typeof data === "object") {
        for (const [k, v] of Object.entries(data)) {
          const parts = k.split(".");
          if (parts.length === 2) {
            this[parts[0]] = this[parts[0]] || {};
            this[parts[0]][parts[1]] = v;
          } else {
            this[k] = v;
          }
        }
      }
    },
    save: async function () {
      return this;
    },
  };
  return doc;
}

async function runApplicationResubmissionTests() {
  console.log("─────────────────────────────────────────────────────────────");
  console.log("Running Phase 5 Application Feedback & Resubmission Test Suite");
  console.log("─────────────────────────────────────────────────────────────\n");

  let passed = 0;
  let total = 0;

  async function test(name, fn) {
    total++;
    try {
      await fn();
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ❌ FAIL: ${name}`);
      console.error(`     Error: ${err.message}\n`);
    }
  }

  const legitApplicantId = new mongoose.Types.ObjectId().toString();
  const victimApplicantId = new mongoose.Types.ObjectId().toString();

  // ─── 1. Security & Identity Boundary ──────────────────────────────────────
  console.log("[1] Security & Identity Isolation");

  await test("1. Applicant cannot update another applicant's application (identifies strictly from req.user._id)", async () => {
    let queriedApplicantId = null;
    const originalFindOne = AdmissionApplication.findOne;
    AdmissionApplication.findOne = (query) => {
      queriedApplicantId = query.applicantId;
      return {
        sort: async () => null, // No application found for legit applicant
      };
    };

    try {
      const req = {
        user: { _id: legitApplicantId },
        body: {
          applicantId: victimApplicantId, // Attacker tries to inject victim's applicantId
          personal: { fullName: "Hacked Name" },
        },
      };
      const res = createMockRes();
      await updateAdmissionDraft(req, res);

      // Verify that backend queried solely with legitApplicantId from JWT
      assert.strictEqual(
        queriedApplicantId,
        legitApplicantId,
        "Controller must query using req.user._id, never body.applicantId",
      );
      assert.notStrictEqual(
        queriedApplicantId,
        victimApplicantId,
        "Controller must not use body.applicantId",
      );
    } finally {
      AdmissionApplication.findOne = originalFindOne;
    }
  });

  // ─── 2. Draft Behavior Preservation ───────────────────────────────────────
  console.log("\n[2] Draft Behavior Preservation");

  await test("2. Draft behavior remains unchanged: drafts can be updated and submitted normally", async () => {
    const draftDoc = createMockApplicationDoc({
      applicantId: legitApplicantId,
      status: "Draft",
      applicationNumber: undefined,
      personal: { fullName: "Original Draft" },
    });

    const originalFindOne = AdmissionApplication.findOne;
    AdmissionApplication.findOne = (query) => ({
      sort: async () => {
        if (query.status === "Draft" && query.applicantId === legitApplicantId) {
          return draftDoc;
        }
        return null;
      },
    });

    try {
      // Step A: Update draft
      const updateReq = {
        user: { _id: legitApplicantId },
        body: { personal: { fullName: "Updated Draft Name" } },
      };
      const updateRes = createMockRes();
      await updateAdmissionDraft(updateReq, updateRes);
      assert.strictEqual(updateRes.statusCode, 200);
      assert.strictEqual(draftDoc.personal.fullName, "Updated Draft Name");

      // Step B: Submit draft
      const submitReq = {
        user: { _id: legitApplicantId },
        body: getValidSubmissionPayload({ personal: { fullName: "Final Draft Name" } }),
      };
      const submitRes = createMockRes();
      await submitAdmissionApplication(submitReq, submitRes);
      assert.strictEqual(submitRes.statusCode, 200);
      assert.strictEqual(draftDoc.status, "Submitted");
      assert(/^APP-\d{4}-\d{4,5}$/.test(draftDoc.applicationNumber));
    } finally {
      AdmissionApplication.findOne = originalFindOne;
    }
  });

  // ─── 3. Resubmission Workflow for "More Information Required" ────────────
  console.log("\n[3] More Information Required Resubmission Workflow");

  await test("3. An application marked 'More Information Required' can be corrected and resubmitted", async () => {
    const existingDoc = createMockApplicationDoc({
      applicantId: legitApplicantId,
      applicationNumber: "APP-2026-7788",
      status: "More Information Required",
      personal: {
        fullName: "Ahmad Raza",
        dob: "2006-03-20",
        gender: "Male",
        idType: "CNIC",
        idNumber: "35102-9988776-1",
        nationality: "Pakistani",
        religion: "Islam",
      },
      contactAddress: {
        phone: "03001234567",
        domicile: "Kasur",
        address: "Kanganpur City",
      },
      guardian: {
        fatherName: "Muhammad Raza",
        motherName: "Razia Bibi",
        altPhone: "03007654321",
      },
      academic: {
        matricBoard: "BISE Lahore",
        matricRollNo: "112233",
        matricYear: "2024",
        matricGroup: "Science (Biology)",
        matricTotalMarks: "1100",
        matricObtainedMarks: "950",
        interStatus: "Not Applicable (Applying for Inter)",
      },
      programCampus: {
        academicLevel: "Intermediate",
        primaryProgram: "FSc Pre-Medical",
        secondaryProgram: "None",
        preferredShift: "Morning",
        campus: "Kanganpur",
      },
      documents: {
        matricResultCard: "old_blurry_matric.pdf",
        cnicOrBForm: "cnic_scan.pdf",
      },
      reviewSubmission: {
        undertakingAgreed: true,
        reviewerNotes: "Please upload a clear scan of your Matric Result Card.",
        reviewedAt: "2026-10-10T14:30:00.000Z",
      },
      history: [
        {
          action: "Status Changed to More Information Required",
          previousStatus: "Under Review",
          newStatus: "More Information Required",
          role: "Admin",
          note: "Please upload a clear scan of your Matric Result Card.",
          timestamp: "2026-10-10T14:30:00.000Z",
        },
      ],
    });

    const originalFindOne = AdmissionApplication.findOne;
    AdmissionApplication.findOne = (query) => ({
      sort: async () => {
        if (query.status === "Draft") return null;
        if (query.status === "More Information Required") return existingDoc;
        return null;
      },
    });

    try {
      // 1. Correct document via updateAdmissionDraft
      const patchReq = {
        user: { _id: legitApplicantId },
        body: {
          documents: { matricResultCard: "new_clear_matric_scan.pdf" },
        },
      };
      const patchRes = createMockRes();
      await updateAdmissionDraft(patchReq, patchRes);
      assert.strictEqual(patchRes.statusCode, 200);
      assert.strictEqual(existingDoc.documents.matricResultCard, "new_clear_matric_scan.pdf");

      // 2. Resubmit application
      const resubmitReq = {
        user: { _id: legitApplicantId },
        body: {
          resubmissionNote: "Uploaded verified high-resolution Matric result card scan.",
          reviewSubmission: { undertakingAgreed: true },
        },
      };
      const resubmitRes = createMockRes();
      await submitAdmissionApplication(resubmitReq, resubmitRes);

      assert.strictEqual(resubmitRes.statusCode, 200);
      assert.strictEqual(resubmitRes.body.application.status, "Submitted");
      assert.strictEqual(resubmitRes.body.message, "Application resubmitted successfully");
    } finally {
      AdmissionApplication.findOne = originalFindOne;
    }
  });

  // ─── 4. Rejection of Unauthorized State Transitions ───────────────────────
  console.log("\n[4] Unauthorized Status Rejections");

  const unauthorizedStatuses = ["Submitted", "Under Review", "Accepted", "Rejected", "On Hold"];
  for (const unauthStatus of unauthorizedStatuses) {
    await test(`4. Application with status '${unauthStatus}' cannot be resubmitted or edited (HTTP 409)`, async () => {
      const lockedDoc = createMockApplicationDoc({
        applicantId: legitApplicantId,
        status: unauthStatus,
        applicationNumber: "APP-2026-5544",
      });

      const originalFindOne = AdmissionApplication.findOne;
      AdmissionApplication.findOne = (query) => ({
        sort: async () => {
          if (query?.status === "Draft" || query?.status === "More Information Required") {
            return null;
          }
          return lockedDoc;
        },
      });

      try {
        // Attempt draft update
        const patchReq = {
          user: { _id: legitApplicantId },
          body: { personal: { fullName: "Illegal Edit" } },
        };
        const patchRes = createMockRes();
        await updateAdmissionDraft(patchReq, patchRes);
        assert.strictEqual(patchRes.statusCode, 409);
        assert(patchRes.body.message.includes("cannot be edited"));

        // Attempt submission
        const submitReq = {
          user: { _id: legitApplicantId },
          body: getValidSubmissionPayload(),
        };
        const submitRes = createMockRes();
        await submitAdmissionApplication(submitReq, submitRes);
        assert.strictEqual(submitRes.statusCode, 409);
      } finally {
        AdmissionApplication.findOne = originalFindOne;
      }
    });
  }

  // ─── 5. Validation Enforcement on Resubmission ────────────────────────────
  console.log("\n[5] Server-Side Validation on Resubmission");

  await test("5. Invalid changes on resubmission are rejected with HTTP 400", async () => {
    const docNeedingInfo = createMockApplicationDoc({
      applicantId: legitApplicantId,
      status: "More Information Required",
      documents: { matricResultCard: "" }, // Missing required doc
    });

    const originalFindOne = AdmissionApplication.findOne;
    AdmissionApplication.findOne = (query) => ({
      sort: async () => {
        if (query.status === "Draft") return null;
        if (query.status === "More Information Required") return docNeedingInfo;
        return null;
      },
    });

    try {
      const req = {
        user: { _id: legitApplicantId },
        body: {
          documents: { matricResultCard: "" }, // Still invalid
          reviewSubmission: { undertakingAgreed: true },
        },
      };
      const res = createMockRes();
      await submitAdmissionApplication(req, res);
      assert.strictEqual(res.statusCode, 400);
      assert.strictEqual(res.body.message, "Application is incomplete");
      assert(res.body.errors["documents.matricResultCard"]);
    } finally {
      AdmissionApplication.findOne = originalFindOne;
    }
  });

  // ─── 6. Application Number & Field Preservation ───────────────────────────
  console.log("\n[6] Preservation of Application Number & Unchanged Data");

  await test("6. Resubmission preserves original applicationNumber and unchanged fields", async () => {
    const originalAppNumber = "APP-2026-4433";
    const originalDocId = new mongoose.Types.ObjectId();
    const existingDoc = createMockApplicationDoc({
      _id: originalDocId,
      applicantId: legitApplicantId,
      applicationNumber: originalAppNumber,
      status: "More Information Required",
      personal: {
        fullName: "Hassan Ali",
        dob: "2006-01-10",
        gender: "Male",
        idType: "CNIC",
        idNumber: "35102-1111111-1",
        nationality: "Pakistani",
        religion: "Islam",
      },
      contactAddress: {
        phone: "03001112233",
        domicile: "Kasur",
        address: "Original Permanent Address",
      },
      guardian: {
        fatherName: "Ali Muhammad",
        motherName: "Fatima Bibi",
        altPhone: "03004445566",
      },
      academic: {
        matricBoard: "BISE Lahore",
        matricRollNo: "654321",
        matricYear: "2024",
        matricGroup: "Science (Biology)",
        matricTotalMarks: "1100",
        matricObtainedMarks: "1010",
        interStatus: "Not Applicable (Applying for Inter)",
      },
      programCampus: {
        academicLevel: "Intermediate",
        primaryProgram: "FSc Pre-Medical",
        secondaryProgram: "None",
        preferredShift: "Morning",
        campus: "Kanganpur",
      },
      documents: {
        matricResultCard: "matric_card.pdf",
        cnicOrBForm: "cnic_scan.pdf",
      },
      reviewSubmission: {
        undertakingAgreed: true,
      },
    });

    const originalFindOne = AdmissionApplication.findOne;
    AdmissionApplication.findOne = (query) => ({
      sort: async () => {
        if (query.status === "Draft") return null;
        if (query.status === "More Information Required") return existingDoc;
        return null;
      },
    });

    try {
      // Applicant only updates contact address
      const req = {
        user: { _id: legitApplicantId },
        body: {
          contactAddress: { address: "Updated Corrected Address, Kanganpur" },
          reviewSubmission: { undertakingAgreed: true },
        },
      };
      const res = createMockRes();
      await submitAdmissionApplication(req, res);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(
        existingDoc.applicationNumber,
        originalAppNumber,
        "Application number must remain identical",
      );
      assert.strictEqual(
        existingDoc._id.toString(),
        originalDocId.toString(),
        "MongoDB _id must be preserved",
      );
      assert.strictEqual(
        existingDoc.personal.fullName,
        "Hassan Ali",
        "Unchanged personal data must be preserved",
      );
      assert.strictEqual(
        existingDoc.academic.matricRollNo,
        "654321",
        "Unchanged academic data must be preserved",
      );
      assert.strictEqual(
        existingDoc.contactAddress.address,
        "Updated Corrected Address, Kanganpur",
        "Updated field must be applied",
      );
    } finally {
      AdmissionApplication.findOne = originalFindOne;
    }
  });

  // ─── 7. History & Reviewer Notes Preservation ─────────────────────────────
  console.log("\n[7] Reviewer Notes & Audit History Preservation");

  await test("7. Previous reviewer notes and history entries remain available after resubmission", async () => {
    const originalReviewerNotes = "Father contact number is unreachable. Please provide active alternate.";
    const existingDoc = createMockApplicationDoc({
      applicantId: legitApplicantId,
      status: "More Information Required",
      personal: {
        fullName: "Zainab Bibi",
        dob: "2006-08-15",
        gender: "Female",
        idType: "B-Form / Juvenile Card",
        idNumber: "35102-7777777-2",
        nationality: "Pakistani",
        religion: "Islam",
      },
      contactAddress: {
        phone: "03007778899",
        domicile: "Kasur",
        address: "Ward 5 Kanganpur",
      },
      guardian: {
        fatherName: "Tariq Mahmood",
        motherName: "Sultana Begum",
        altPhone: "03001234567",
      },
      academic: {
        matricBoard: "BISE Lahore",
        matricRollNo: "998877",
        matricYear: "2024",
        matricGroup: "Arts / General",
        matricTotalMarks: "1100",
        matricObtainedMarks: "890",
        interStatus: "Not Applicable (Applying for Inter)",
      },
      programCampus: {
        academicLevel: "Intermediate",
        primaryProgram: "I.Com (Commerce)",
        secondaryProgram: "None",
        preferredShift: "Morning",
        campus: "Kanganpur",
      },
      documents: {
        matricResultCard: "matric.pdf",
        cnicOrBForm: "bform.pdf",
      },
      reviewSubmission: {
        undertakingAgreed: true,
        reviewerNotes: originalReviewerNotes,
        reviewedAt: "2026-10-09T10:00:00.000Z",
      },
      history: [
        {
          action: "Status Changed to More Information Required",
          previousStatus: "Under Review",
          newStatus: "More Information Required",
          role: "Admin",
          note: originalReviewerNotes,
          timestamp: "2026-10-09T10:00:00.000Z",
        },
      ],
    });

    const originalFindOne = AdmissionApplication.findOne;
    AdmissionApplication.findOne = (query) => ({
      sort: async () => {
        if (query.status === "Draft") return null;
        if (query.status === "More Information Required") return existingDoc;
        return null;
      },
    });

    try {
      const req = {
        user: { _id: legitApplicantId },
        body: {
          guardian: { altPhone: "03009998877" },
          resubmissionNote: "Updated father mobile number with active SIM.",
          reviewSubmission: { undertakingAgreed: true },
        },
      };
      const res = createMockRes();
      await submitAdmissionApplication(req, res);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(
        existingDoc.reviewSubmission.reviewerNotes,
        originalReviewerNotes,
        "Previous reviewer notes must not be erased",
      );
      assert(
        existingDoc.history.length >= 2,
        "History array must preserve previous audit records",
      );
      assert.strictEqual(
        existingDoc.history[0].note,
        originalReviewerNotes,
        "First history entry must remain intact",
      );
    } finally {
      AdmissionApplication.findOne = originalFindOne;
    }
  });

  // ─── 8. Successful Resubmission Transitions & Audit Trail ─────────────────
  console.log("\n[8] Status Transition to 'Submitted' & Audit Event Appending");

  await test("8. Resubmission transitions status to 'Submitted', logs resubmittedAt, and appends audit event", async () => {
    const existingDoc = createMockApplicationDoc({
      applicantId: legitApplicantId,
      status: "More Information Required",
      personal: {
        fullName: "Bilal Khan",
        dob: "2006-04-12",
        gender: "Male",
        idType: "CNIC",
        idNumber: "35102-3333333-1",
        nationality: "Pakistani",
        religion: "Islam",
      },
      contactAddress: {
        phone: "03003334455",
        domicile: "Kasur",
        address: "Kanganpur",
      },
      guardian: {
        fatherName: "Khan Muhammad",
        motherName: "Amina Khan",
        altPhone: "03005556677",
      },
      academic: {
        matricBoard: "BISE Lahore",
        matricRollNo: "334455",
        matricYear: "2024",
        matricGroup: "Science (Computer)",
        matricTotalMarks: "1100",
        matricObtainedMarks: "920",
        interStatus: "Not Applicable (Applying for Inter)",
      },
      programCampus: {
        academicLevel: "Intermediate",
        primaryProgram: "ICS (Computer Science)",
        secondaryProgram: "None",
        preferredShift: "Morning",
        campus: "Kanganpur",
      },
      documents: {
        matricResultCard: "matric.pdf",
        cnicOrBForm: "cnic.pdf",
      },
      reviewSubmission: { undertakingAgreed: true },
      history: [],
    });

    const originalFindOne = AdmissionApplication.findOne;
    AdmissionApplication.findOne = (query) => ({
      sort: async () => {
        if (query.status === "Draft") return null;
        if (query.status === "More Information Required") return existingDoc;
        return null;
      },
    });

    try {
      const applicantNote = "Provided corrected contact numbers and re-checked all fields.";
      const req = {
        user: { _id: legitApplicantId },
        body: {
          resubmissionNote: applicantNote,
          reviewSubmission: { undertakingAgreed: true },
        },
      };
      const res = createMockRes();
      await submitAdmissionApplication(req, res);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(existingDoc.status, "Submitted");
      assert(existingDoc.reviewSubmission.resubmittedAt, "resubmittedAt timestamp must be recorded");

      const latestAudit = existingDoc.history[existingDoc.history.length - 1];
      assert(latestAudit, "History entry must be appended");
      assert.strictEqual(latestAudit.action, "Application Resubmitted");
      assert.strictEqual(latestAudit.previousStatus, "More Information Required");
      assert.strictEqual(latestAudit.newStatus, "Submitted");
      assert.strictEqual(latestAudit.role, "Applicant");
      assert.strictEqual(latestAudit.note, applicantNote);
      assert(latestAudit.timestamp, "Audit event must have a timestamp");
    } finally {
      AdmissionApplication.findOne = originalFindOne;
    }
  });

  // ─── 9. Duplicate Resubmission Prevention ─────────────────────────────────
  console.log("\n[9] Duplicate / Inappropriate Resubmission Prevention");

  await test("9. Duplicate resubmission attempt immediately after transition is rejected (HTTP 409 Conflict)", async () => {
    // Application is already transitioned back to "Submitted"
    const alreadyResubmittedDoc = createMockApplicationDoc({
      applicantId: legitApplicantId,
      status: "Submitted",
      applicationNumber: "APP-2026-9999",
    });

    const originalFindOne = AdmissionApplication.findOne;
    AdmissionApplication.findOne = (query) => ({
      sort: async () => {
        // No Draft exists
        if (query.status === "Draft") return null;
        // No More Information Required exists
        if (query.status === "More Information Required") return null;
        // Existing application query returns the already-submitted document
        return alreadyResubmittedDoc;
      },
    });

    try {
      const req = {
        user: { _id: legitApplicantId },
        body: {
          resubmissionNote: "Trying to resubmit a second time",
          reviewSubmission: { undertakingAgreed: true },
        },
      };
      const res = createMockRes();
      await submitAdmissionApplication(req, res);

      assert.strictEqual(res.statusCode, 409);
      assert.strictEqual(res.body.message, "This application has already been submitted");
    } finally {
      AdmissionApplication.findOne = originalFindOne;
    }
  });

  console.log("\n─────────────────────────────────────────────────────────────");
  console.log(`Results: ${passed} / ${total} tests passed`);
  console.log("─────────────────────────────────────────────────────────────\n");

  if (passed !== total) {
    process.exit(1);
  }
}

if (require.main === module) {
  runApplicationResubmissionTests().catch((err) => {
    console.error("Fatal test error:", err);
    process.exit(1);
  });
}

module.exports = { runApplicationResubmissionTests };
