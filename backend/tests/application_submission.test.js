const assert = require("assert");
const mongoose = require("mongoose");
const { submitAdmissionApplication } = require("../controllers/admissionApplicationController");
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

async function runApplicationSubmissionTests() {
  console.log("─────────────────────────────────────────────────────────────");
  console.log("Running Admission Application Submission Test Suite");
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

  const dummyApplicantId = new mongoose.Types.ObjectId().toString();

  // ─── 1. Authentication & Payload Validation ──────────────────────────────
  console.log("[1] Authentication & Request Payload Validation");

  await test("submitAdmissionApplication rejects unauthenticated requests with HTTP 401", async () => {
    const req = { user: null, body: getValidSubmissionPayload() };
    const res = createMockRes();
    await submitAdmissionApplication(req, res);
    assert.strictEqual(res.statusCode, 401);
    assert.strictEqual(res.body.message, "Authentication required");
  });

  await test("submitAdmissionApplication rejects non-object or null request body with HTTP 400", async () => {
    const req = { user: { _id: dummyApplicantId }, body: null };
    const res = createMockRes();
    await submitAdmissionApplication(req, res);
    assert.strictEqual(res.statusCode, 400);
    assert(res.body.message.includes("application object"));
  });

  await test("submitAdmissionApplication rejects array body with HTTP 400", async () => {
    const req = { user: { _id: dummyApplicantId }, body: [] };
    const res = createMockRes();
    await submitAdmissionApplication(req, res);
    assert.strictEqual(res.statusCode, 400);
  });

  // ─── 2. Data Validation For Submission ──────────────────────────────────
  console.log("\n[2] Comprehensive Field Validation For Submission");

  await test("submitAdmissionApplication returns 400 with missing required personal fields", async () => {
    const incompletePayload = getValidSubmissionPayload({
      personal: { fullName: "A", dob: "", idNumber: "" },
    });
    // Stub findOne to simulate existing draft
    const originalFindOne = AdmissionApplication.findOne;
    AdmissionApplication.findOne = () => ({
      sort: async () => ({
        set: function (data) { Object.assign(this, data); },
        personal: {},
        contactAddress: {},
        guardian: {},
        academic: {},
        programCampus: {},
        documents: {},
        reviewSubmission: {},
      }),
    });

    try {
      const req = { user: { _id: dummyApplicantId }, body: incompletePayload };
      const res = createMockRes();
      await submitAdmissionApplication(req, res);
      assert.strictEqual(res.statusCode, 400);
      assert.strictEqual(res.body.message, "Application is incomplete");
      assert(res.body.errors["personal.fullName"]);
      assert(res.body.errors["personal.dob"]);
      assert(res.body.errors["personal.idNumber"]);
    } finally {
      AdmissionApplication.findOne = originalFindOne;
    }
  });

  await test("submitAdmissionApplication rejects invalid 11-digit contact and guardian phone numbers", async () => {
    const badPhonePayload = getValidSubmissionPayload({
      contactAddress: { phone: "0300123" }, // Not 11 digits
      guardian: { altPhone: "invalidphone" },
    });
    const originalFindOne = AdmissionApplication.findOne;
    AdmissionApplication.findOne = () => ({
      sort: async () => ({
        set: function (data) { Object.assign(this, data); },
      }),
    });

    try {
      const req = { user: { _id: dummyApplicantId }, body: badPhonePayload };
      const res = createMockRes();
      await submitAdmissionApplication(req, res);
      assert.strictEqual(res.statusCode, 400);
      assert(res.body.errors["contactAddress.phone"]);
      assert(res.body.errors["guardian.altPhone"]);
    } finally {
      AdmissionApplication.findOne = originalFindOne;
    }
  });

  await test("submitAdmissionApplication rejects invalid matric marks (obtained > total)", async () => {
    const badMarksPayload = getValidSubmissionPayload({
      academic: { matricTotalMarks: "1100", matricObtainedMarks: "1200" },
    });
    const originalFindOne = AdmissionApplication.findOne;
    AdmissionApplication.findOne = () => ({
      sort: async () => ({
        set: function (data) { Object.assign(this, data); },
      }),
    });

    try {
      const req = { user: { _id: dummyApplicantId }, body: badMarksPayload };
      const res = createMockRes();
      await submitAdmissionApplication(req, res);
      assert.strictEqual(res.statusCode, 400);
      assert(res.body.errors["academic.matricObtainedMarks"]);
    } finally {
      AdmissionApplication.findOne = originalFindOne;
    }
  });

  await test("submitAdmissionApplication validates intermediate fields when interStatus is Passed", async () => {
    const passedInterIncompletePayload = getValidSubmissionPayload({
      academic: {
        interStatus: "Passed",
        interBoard: "",
        interRollNo: "",
        interYear: "",
        interTotalMarks: "0",
        interObtainedMarks: "",
      },
    });
    const originalFindOne = AdmissionApplication.findOne;
    AdmissionApplication.findOne = () => ({
      sort: async () => ({
        set: function (data) {
          for (const [k, v] of Object.entries(data)) {
            const parts = k.split(".");
            if (parts.length === 2) {
              this[parts[0]] = this[parts[0]] || {};
              this[parts[0]][parts[1]] = v;
            } else {
              this[k] = v;
            }
          }
        },
      }),
    });

    try {
      const req = { user: { _id: dummyApplicantId }, body: passedInterIncompletePayload };
      const res = createMockRes();
      await submitAdmissionApplication(req, res);
      assert.strictEqual(res.statusCode, 400);
      assert(res.body.errors["academic.interBoard"]);
      assert(res.body.errors["academic.interRollNo"]);
      assert(res.body.errors["academic.interYear"]);
      assert(res.body.errors["academic.interTotalMarks"]);
    } finally {
      AdmissionApplication.findOne = originalFindOne;
    }
  });

  await test("submitAdmissionApplication requires document uploads (matricResultCard, cnicOrBForm)", async () => {
    const missingDocsPayload = getValidSubmissionPayload({
      documents: { matricResultCard: "", cnicOrBForm: "" },
    });
    const originalFindOne = AdmissionApplication.findOne;
    AdmissionApplication.findOne = () => ({
      sort: async () => ({
        set: function (data) { Object.assign(this, data); },
      }),
    });

    try {
      const req = { user: { _id: dummyApplicantId }, body: missingDocsPayload };
      const res = createMockRes();
      await submitAdmissionApplication(req, res);
      assert.strictEqual(res.statusCode, 400);
      assert(res.body.errors["documents.matricResultCard"]);
      assert(res.body.errors["documents.cnicOrBForm"]);
    } finally {
      AdmissionApplication.findOne = originalFindOne;
    }
  });

  await test("submitAdmissionApplication requires undertaking agreement before submission", async () => {
    const noUndertakingPayload = getValidSubmissionPayload({
      reviewSubmission: { undertakingAgreed: false },
    });
    const originalFindOne = AdmissionApplication.findOne;
    AdmissionApplication.findOne = () => ({
      sort: async () => ({
        set: function (data) { Object.assign(this, data); },
      }),
    });

    try {
      const req = { user: { _id: dummyApplicantId }, body: noUndertakingPayload };
      const res = createMockRes();
      await submitAdmissionApplication(req, res);
      assert.strictEqual(res.statusCode, 400);
      assert(res.body.errors["reviewSubmission.undertakingAgreed"]);
    } finally {
      AdmissionApplication.findOne = originalFindOne;
    }
  });

  // ─── 3. Submission Transition & Status Handling ─────────────────────────
  console.log("\n[3] Draft-to-Submitted Lifecycle & Duplicate Prevention");

  await test("submitAdmissionApplication transitions existing Draft to Submitted and assigns official APP number", async () => {
    let saved = false;
    const mockDraft = {
      _id: new mongoose.Types.ObjectId(),
      applicantId: dummyApplicantId,
      status: "Draft",
      applicationNumber: undefined,
      reviewSubmission: {},
      set: function (data, val) {
        if (typeof data === "string") {
          const parts = data.split(".");
          if (parts.length === 2) {
            this[parts[0]] = this[parts[0]] || {};
            this[parts[0]][parts[1]] = val;
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
        saved = true;
        return this;
      },
    };

    const originalFindOne = AdmissionApplication.findOne;
    AdmissionApplication.findOne = (query) => ({
      sort: async () => {
        if (query.status === "Draft") return mockDraft;
        return null;
      },
    });

    try {
      const req = {
        user: { _id: dummyApplicantId },
        body: getValidSubmissionPayload(),
      };
      const res = createMockRes();
      await submitAdmissionApplication(req, res);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(saved, true, "Application must be saved to DB");
      assert.strictEqual(res.body.message, "Application submitted successfully");
      assert.strictEqual(res.body.application.status, "Submitted");
      assert(
        /^APP-\d{4}-\d{4,5}$/.test(res.body.application.applicationNumber),
        `Application number format (${res.body.application.applicationNumber}) must match APP-YYYY-XXXX`,
      );
      assert(res.body.application.reviewSubmission?.submittedAt, "submittedAt must be recorded");
    } finally {
      AdmissionApplication.findOne = originalFindOne;
    }
  });

  await test("submitAdmissionApplication rejects duplicate submission with HTTP 409 Conflict", async () => {
    const existingSubmitted = {
      _id: new mongoose.Types.ObjectId(),
      applicantId: dummyApplicantId,
      status: "Submitted",
      applicationNumber: "APP-2026-1049",
    };

    const originalFindOne = AdmissionApplication.findOne;
    AdmissionApplication.findOne = (query) => ({
      sort: async () => {
        // No draft exists
        if (query.status === "Draft") return null;
        // But an application already exists
        return existingSubmitted;
      },
    });

    try {
      const req = {
        user: { _id: dummyApplicantId },
        body: getValidSubmissionPayload(),
      };
      const res = createMockRes();
      await submitAdmissionApplication(req, res);

      assert.strictEqual(res.statusCode, 409);
      assert.strictEqual(res.body.message, "This application has already been submitted");
    } finally {
      AdmissionApplication.findOne = originalFindOne;
    }
  });

  await test("submitAdmissionApplication creates and submits when no prior draft existed", async () => {
    const originalFindOne = AdmissionApplication.findOne;
    AdmissionApplication.findOne = () => ({
      sort: async () => null, // Neither draft nor submitted exists yet
    });

    // Mock save on newly instantiated AdmissionApplication
    const originalSave = AdmissionApplication.prototype.save;
    let saved = false;
    AdmissionApplication.prototype.save = async function () {
      saved = true;
      return this;
    };

    try {
      const req = {
        user: { _id: dummyApplicantId },
        body: getValidSubmissionPayload(),
      };
      const res = createMockRes();
      await submitAdmissionApplication(req, res);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(saved, true);
      assert.strictEqual(res.body.message, "Application submitted successfully");
      assert.strictEqual(res.body.application.status, "Submitted");
      assert(/^APP-\d{4}-\d{4,5}$/.test(res.body.application.applicationNumber));
    } finally {
      AdmissionApplication.findOne = originalFindOne;
      AdmissionApplication.prototype.save = originalSave;
    }
  });

  // ─── 4. Security: Identity Derivation From JWT Claims ───────────────────
  console.log("\n[4] Identity Verification & Anti-Tampering Security");

  await test("submitAdmissionApplication derives applicant identity solely from req.user._id", async () => {
    const legitimateApplicantId = new mongoose.Types.ObjectId().toString();
    const attackerClaimedId = new mongoose.Types.ObjectId().toString();

    let queryApplicantId = null;
    const originalFindOne = AdmissionApplication.findOne;
    AdmissionApplication.findOne = (query) => {
      if (query && query.applicantId !== undefined) {
        queryApplicantId = query.applicantId;
      }
      return {
        sort: async () => null,
      };
    };

    const originalSave = AdmissionApplication.prototype.save;
    AdmissionApplication.prototype.save = async function () {
      return this;
    };

    try {
      const payload = getValidSubmissionPayload();
      // Attacker attempts to inject someone else's applicantId in the payload
      payload.applicantId = attackerClaimedId;

      const req = {
        user: { _id: legitimateApplicantId },
        body: payload,
      };
      const res = createMockRes();
      await submitAdmissionApplication(req, res);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(
        queryApplicantId,
        legitimateApplicantId,
        "Controller must query using authenticated req.user._id, not body.applicantId",
      );
      assert.strictEqual(
        String(res.body.application.applicantId),
        legitimateApplicantId,
        "Created application must be bound to authenticated req.user._id",
      );
    } finally {
      AdmissionApplication.findOne = originalFindOne;
      AdmissionApplication.prototype.save = originalSave;
    }
  });

  console.log("\n─────────────────────────────────────────────────────────────");
  console.log(`Test Results: ${passed}/${total} passed (${total - passed} failed)`);
  console.log("─────────────────────────────────────────────────────────────\n");

  if (passed !== total) process.exit(1);
}

runApplicationSubmissionTests().catch((err) => {
  console.error("Test execution fatal error:", err);
  process.exit(1);
});
