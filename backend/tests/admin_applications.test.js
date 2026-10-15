const assert = require("assert");
const mongoose = require("mongoose");
const {
  adminLogin,
  getAdminApplications,
  getAdminApplicationById,
  updateAdminApplicationStatus,
} = require("../controllers/adminController");
const { protectAdmin } = require("../middleware/authMiddleware");
const AdmissionApplication = require("../models/AdmissionApplication");
const { signToken } = require("../utils/jwt");

// Set test environment secret and credentials if not already set
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = "test_jwt_secret_key_for_unit_tests_1234567890abcdef";
}
if (!process.env.ADMIN_PASSWORD) {
  process.env.ADMIN_PASSWORD = "password123";
}

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

function createSampleMongoApp(overrides = {}) {
  const id = new mongoose.Types.ObjectId();
  return {
    _id: id,
    applicantId: new mongoose.Types.ObjectId(),
    applicationNumber: overrides.applicationNumber || "APP-2026-8812",
    status: overrides.status || "Submitted",
    personal: {
      fullName: overrides.fullName || "Zainab Fatima",
      dob: "2006-03-21",
      gender: "Female",
      idType: "CNIC",
      idNumber: "35102-9876543-2",
      nationality: "Pakistani",
      religion: "Islam",
      bloodGroup: "O+",
      ...overrides.personal,
    },
    contactAddress: {
      phone: "03121234567",
      email: "zainab@example.com",
      domicile: "Kasur",
      address: "Chunian Road, Kanganpur",
      ...overrides.contactAddress,
    },
    guardian: {
      fatherName: "Muhammad Aslam",
      motherName: "Khadija Bibi",
      altPhone: "03129876543",
      ...overrides.guardian,
    },
    academic: {
      matricBoard: "BISE Lahore",
      matricRollNo: "774120",
      matricYear: "2024",
      matricGroup: "Science (Biology)",
      matricTotalMarks: "1100",
      matricObtainedMarks: "1015",
      interStatus: "Not Applicable (Applying for Inter)",
      ...overrides.academic,
    },
    programCampus: {
      academicLevel: overrides.academicLevel || "Intermediate",
      primaryProgram: overrides.primaryProgram || "FSc Pre-Medical",
      secondaryProgram: "ICS (Computer Science)",
      preferredShift: "Morning",
      campus: "Kanganpur",
      ...overrides.programCampus,
    },
    documents: {
      matricResultCard: "matric_card.pdf",
      cnicOrBForm: "cnic.pdf",
    },
    reviewSubmission: {
      undertakingAgreed: true,
      submittedAt: "2026-10-11T09:00:00.000Z",
      reviewerNotes: overrides.reviewerNotes || "",
      ...overrides.reviewSubmission,
    },
    history: overrides.history || [],
    createdAt: new Date("2026-10-11T09:00:00.000Z"),
    updatedAt: new Date("2026-10-11T09:00:00.000Z"),
    set: function (path, val) {
      if (typeof path === "string") {
        const parts = path.split(".");
        if (parts.length === 2) {
          this[parts[0]] = this[parts[0]] || {};
          this[parts[0]][parts[1]] = val;
        } else {
          this[path] = val;
        }
      }
    },
    save: async function () {
      return this;
    },
  };
}

async function runAdminTests() {
  console.log("─────────────────────────────────────────────────────────────");
  console.log("Running Admin Admissions API & Authorization Test Suite");
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

  const adminToken = signToken({ id: "stf-001", name: "Kashif Shahzad", role: "admin" });
  const applicantToken = signToken({ id: "app-123", role: "applicant" });

  // ─── 0. Admin Authentication Controller ────────────────────────────────
  console.log("[0] Admin Authentication Controller (adminLogin)");

  await test("adminLogin rejects missing identifier or password with HTTP 400", async () => {
    const req = { body: { identifier: "", password: "" } };
    const res = createMockRes();
    await adminLogin(req, res);
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.body.success, false);
    assert(res.body.message.includes("email/username and password"));
  });

  await test("adminLogin rejects invalid identifier with HTTP 401", async () => {
    const req = { body: { identifier: "unauthorized_user", password: "somepassword" } };
    const res = createMockRes();
    await adminLogin(req, res);
    assert.strictEqual(res.statusCode, 401);
    assert.strictEqual(res.body.success, false);
    assert.strictEqual(res.body.message, "Invalid administrator credentials");
  });

  await test("adminLogin rejects incorrect password with HTTP 401", async () => {
    const req = { body: { identifier: "admin", password: "definitely_wrong_password" } };
    const res = createMockRes();
    await adminLogin(req, res);
    assert.strictEqual(res.statusCode, 401);
    assert.strictEqual(res.body.success, false);
    assert.strictEqual(res.body.message, "Invalid administrator credentials");
  });

  await test("adminLogin fails safely with HTTP 500 when JWT_SECRET is missing", async () => {
    const originalSecret = process.env.JWT_SECRET;
    delete process.env.JWT_SECRET;
    try {
      const req = { body: { identifier: "admin", password: "password123" } };
      const res = createMockRes();
      await adminLogin(req, res);
      assert.strictEqual(res.statusCode, 500);
      assert.strictEqual(res.body.success, false);
      assert(res.body.message.includes("JWT_SECRET is not configured"));
    } finally {
      process.env.JWT_SECRET = originalSecret;
    }
  });

  await test("adminLogin fails safely with HTTP 500 when ADMIN_PASSWORD is missing (no fail-open)", async () => {
    const originalPassword = process.env.ADMIN_PASSWORD;
    delete process.env.ADMIN_PASSWORD;
    try {
      const req = { body: { identifier: "admin", password: "arbitrary_attempted_password" } };
      const res = createMockRes();
      await adminLogin(req, res);
      assert.strictEqual(res.statusCode, 500);
      assert.strictEqual(res.body.success, false);
      assert(res.body.message.includes("ADMIN_PASSWORD is not configured"));
    } finally {
      process.env.ADMIN_PASSWORD = originalPassword;
    }
  });

  await test("adminLogin returns 200, JWT token, and admin details for valid credentials", async () => {
    const req = { body: { identifier: "admin", password: "password123" } };
    const res = createMockRes();
    await adminLogin(req, res);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.success, true);
    assert(typeof res.body.token === "string" && res.body.token.length > 20);
    assert.strictEqual(res.body.admin.role, "admin");
    assert.strictEqual(res.body.admin.id, "stf-001");
  });

  // ─── 1. Admin Authentication & Role Authorization Middleware ────────────
  console.log("\n[1] Admin Authorization Middleware (protectAdmin)");

  await test("protectAdmin rejects unauthenticated requests with HTTP 401", async () => {
    const req = { headers: {} };
    const res = createMockRes();
    let nextCalled = false;
    await protectAdmin(req, res, () => { nextCalled = true; });

    assert.strictEqual(res.statusCode, 401);
    assert.strictEqual(nextCalled, false);
    assert(res.body.message.includes("missing token"));
  });

  await test("protectAdmin rejects applicant-role tokens with HTTP 403 Forbidden", async () => {
    const req = { headers: { authorization: `Bearer ${applicantToken}` } };
    const res = createMockRes();
    let nextCalled = false;
    await protectAdmin(req, res, () => { nextCalled = true; });

    assert.strictEqual(res.statusCode, 403);
    assert.strictEqual(nextCalled, false);
    assert.strictEqual(res.body.message, "Forbidden: Administrator role required");
  });

  await test("protectAdmin rejects forged or expired tokens with HTTP 401", async () => {
    const forgedToken = signToken({ role: "admin" }, { secret: "wrong_secret" });
    const req = { headers: { authorization: `Bearer ${forgedToken}` } };
    const res = createMockRes();
    let nextCalled = false;
    await protectAdmin(req, res, () => { nextCalled = true; });

    assert.strictEqual(res.statusCode, 401);
    assert.strictEqual(nextCalled, false);
    assert(res.body.message.includes("invalid or forged token"));
  });

  await test("protectAdmin permits verified admin tokens and attaches req.admin", async () => {
    const req = { headers: { authorization: `Bearer ${adminToken}` } };
    const res = createMockRes();
    let nextCalled = false;
    await protectAdmin(req, res, () => { nextCalled = true; });

    assert.strictEqual(nextCalled, true);
    assert.strictEqual(req.admin.role, "admin");
    assert.strictEqual(req.admin.id, "stf-001");
  });

  // ─── 2. Application Listing & Filtering (GET /api/admin/applications) ───
  console.log("\n[2] Applications Listing & Filtering (getAdminApplications)");

  await test("getAdminApplications returns serialized applications matching CompleteApplication format", async () => {
    const sampleApp = createSampleMongoApp();
    const originalFind = AdmissionApplication.find;
    const originalCount = AdmissionApplication.countDocuments;

    AdmissionApplication.countDocuments = async () => 1;
    AdmissionApplication.find = () => ({
      sort: () => [sampleApp],
    });

    try {
      const req = { query: {}, admin: { role: "admin" } };
      const res = createMockRes();
      await getAdminApplications(req, res);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.count, 1);
      assert.strictEqual(res.body.total, 1);

      const app = res.body.applications[0];
      assert.strictEqual(app.applicationNumber, "APP-2026-8812");
      assert.strictEqual(app.status, "submitted");
      assert.strictEqual(app.personal.fullName, "Zainab Fatima");
      assert.strictEqual(app.preferences.selectedProgram, "FSc Pre-Medical");
      assert.strictEqual(app.contact.phone, "03121234567");
      assert(Array.isArray(app.academicHistory), "Must provide academicHistory");
      assert.strictEqual(app.academicHistory[0].percentage, 92.3);
      assert(Array.isArray(app.documents), "Must provide documents");
    } finally {
      AdmissionApplication.find = originalFind;
      AdmissionApplication.countDocuments = originalCount;
    }
  });

  await test("getAdminApplications filters by status correctly", async () => {
    let capturedQuery = null;
    const originalFind = AdmissionApplication.find;
    const originalCount = AdmissionApplication.countDocuments;

    AdmissionApplication.countDocuments = async (q) => { capturedQuery = q; return 0; };
    AdmissionApplication.find = (q) => ({
      sort: () => [],
    });

    try {
      const req = { query: { status: "under_review" } };
      const res = createMockRes();
      await getAdminApplications(req, res);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(capturedQuery.status, "Under Review", "Must map under_review to Mongoose 'Under Review'");
    } finally {
      AdmissionApplication.find = originalFind;
      AdmissionApplication.countDocuments = originalCount;
    }
  });

  // ─── 3. Application Detail View (GET /api/admin/applications/:id) ───────
  console.log("\n[3] Single Application Lookup (getAdminApplicationById)");

  await test("getAdminApplicationById returns 404 for non-existent application", async () => {
    const originalFindOne = AdmissionApplication.findOne;
    AdmissionApplication.findOne = async () => null;

    try {
      const req = { params: { id: "APP-2026-9999" } };
      const res = createMockRes();
      await getAdminApplicationById(req, res);

      assert.strictEqual(res.statusCode, 404);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.message, "Application not found");
    } finally {
      AdmissionApplication.findOne = originalFindOne;
    }
  });

  await test("getAdminApplicationById returns 200 and complete details for valid ID", async () => {
    const sample = createSampleMongoApp({ applicationNumber: "APP-2026-7733" });
    const originalFindOne = AdmissionApplication.findOne;
    AdmissionApplication.findOne = async () => sample;

    try {
      const req = { params: { id: "APP-2026-7733" } };
      const res = createMockRes();
      await getAdminApplicationById(req, res);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.application.applicationNumber, "APP-2026-7733");
      assert.strictEqual(res.body.application.personal.fullName, "Zainab Fatima");
    } finally {
      AdmissionApplication.findOne = originalFindOne;
    }
  });

  // ─── 4. Status Update Actions (PATCH /api/admin/applications/:id/status) ─
  console.log("\n[4] Application Status Update & Audit Logging (updateAdminApplicationStatus)");

  await test("updateAdminApplicationStatus rejects invalid status values with HTTP 400", async () => {
    const req = {
      params: { id: "APP-2026-8812" },
      body: { status: "not_a_valid_status" },
    };
    const res = createMockRes();
    await updateAdminApplicationStatus(req, res);

    assert.strictEqual(res.statusCode, 400);
    assert(res.body.message.includes("Invalid status"));
  });

  await test("updateAdminApplicationStatus returns 404 if application does not exist", async () => {
    const originalFindOne = AdmissionApplication.findOne;
    AdmissionApplication.findOne = async () => null;

    try {
      const req = {
        params: { id: "APP-2026-9999" },
        body: { status: "accepted" },
      };
      const res = createMockRes();
      await updateAdminApplicationStatus(req, res);

      assert.strictEqual(res.statusCode, 404);
      assert.strictEqual(res.body.message, "Application not found");
    } finally {
      AdmissionApplication.findOne = originalFindOne;
    }
  });

  await test("updateAdminApplicationStatus successfully accepts application and appends audit history", async () => {
    const sample = createSampleMongoApp({ status: "Submitted" });
    let saved = false;
    sample.save = async function () {
      saved = true;
      return this;
    };

    const originalFindOne = AdmissionApplication.findOne;
    AdmissionApplication.findOne = async () => sample;

    try {
      const req = {
        params: { id: sample.applicationNumber },
        body: {
          status: "accepted",
          note: "Merit score verified. Approved for Fall 2026.",
          reviewerName: "Kashif Shahzad",
        },
        admin: { name: "Kashif Shahzad", role: "admin" },
      };
      const res = createMockRes();
      await updateAdminApplicationStatus(req, res);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(saved, true);
      assert.strictEqual(res.body.application.status, "accepted");
      assert.strictEqual(sample.status, "Accepted", "Backend Mongoose status must be 'Accepted'");
      assert.strictEqual(sample.reviewSubmission.reviewerNotes, "Merit score verified. Approved for Fall 2026.");
      assert(sample.history.length > 0, "Must append audit event");
      const latestAudit = sample.history[sample.history.length - 1];
      assert.strictEqual(latestAudit.action, "Admission Accepted");
      assert.strictEqual(latestAudit.newStatus, "Accepted");
    } finally {
      AdmissionApplication.findOne = originalFindOne;
    }
  });

  await test("updateAdminApplicationStatus successfully puts on hold with notes", async () => {
    const sample = createSampleMongoApp({ status: "Under Review" });
    const originalFindOne = AdmissionApplication.findOne;
    AdmissionApplication.findOne = async () => sample;

    try {
      const req = {
        params: { id: sample.applicationNumber },
        body: {
          status: "on_hold",
          note: "Awaiting original certificate verification.",
        },
        admin: { name: "Admin Officer", role: "admin" },
      };
      const res = createMockRes();
      await updateAdminApplicationStatus(req, res);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(sample.status, "On Hold");
      assert.strictEqual(sample.reviewSubmission.reviewerNotes, "Awaiting original certificate verification.");
    } finally {
      AdmissionApplication.findOne = originalFindOne;
    }
  });

  await test("updateAdminApplicationStatus successfully requests more information", async () => {
    const sample = createSampleMongoApp({ status: "Submitted" });
    const originalFindOne = AdmissionApplication.findOne;
    AdmissionApplication.findOne = async () => sample;

    try {
      const req = {
        params: { id: sample.applicationNumber },
        body: {
          status: "more_info_required",
          note: "Please upload a clearer scan of the B-Form.",
        },
        admin: { name: "Admissions Desk", role: "admin" },
      };
      const res = createMockRes();
      await updateAdminApplicationStatus(req, res);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(sample.status, "More Information Required");
    } finally {
      AdmissionApplication.findOne = originalFindOne;
    }
  });

  await test("updateAdminApplicationStatus successfully rejects application with reason", async () => {
    const sample = createSampleMongoApp({ status: "Submitted" });
    const originalFindOne = AdmissionApplication.findOne;
    AdmissionApplication.findOne = async () => sample;

    try {
      const req = {
        params: { id: sample.applicationNumber },
        body: {
          status: "rejected",
          reason: "Matric score below departmental cutoff.",
        },
        admin: { name: "Senior Registrar", role: "admin" },
      };
      const res = createMockRes();
      await updateAdminApplicationStatus(req, res);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(sample.status, "Rejected");
      assert.strictEqual(sample.reviewSubmission.reviewerNotes, "Matric score below departmental cutoff.");
    } finally {
      AdmissionApplication.findOne = originalFindOne;
    }
  });

  console.log("\n─────────────────────────────────────────────────────────────");
  console.log(`Admin Test Results: ${passed}/${total} passed (${total - passed} failed)`);
  console.log("─────────────────────────────────────────────────────────────\n");

  if (passed !== total) process.exit(1);
}

runAdminTests().catch((err) => {
  console.error("Admin test execution fatal error:", err);
  process.exit(1);
});
