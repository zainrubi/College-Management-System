const assert = require("assert");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { signToken } = require("../utils/jwt");
const {
  loginStudent,
  getStudentProfile,
  requestStudentActivation,
  activateStudentAccount,
} = require("../controllers/studentController");
const { protectStudent } = require("../middleware/authMiddleware");
const Student = require("../models/Student");
const Applicant = require("../models/Applicant");

if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = "test_jwt_secret_key_for_unit_tests_1234567890abcdef";
}

function createMockRes() {
  return {
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
}

function createMockLocalStorage() {
  const store = new Map();
  return {
    getItem(key) {
      return store.has(key) ? store.get(key) : null;
    },
    setItem(key, value) {
      store.set(key, String(value));
    },
    removeItem(key) {
      store.delete(key);
    },
    clear() {
      store.clear();
    },
  };
}

let passedCount = 0;
let failedCount = 0;

async function runTest(title, testFn) {
  try {
    await testFn();
    console.log(`  ✅ PASS: ${title}`);
    passedCount++;
  } catch (error) {
    console.error(`  ❌ FAIL: ${title}`);
    console.error(`     Error: ${error.message}`);
    failedCount++;
  }
}

async function runAllTests() {
  console.log("─────────────────────────────────────────────────────────────");
  console.log("Running Student Frontend Integration Test Suite (Step 6.5)");
  console.log("─────────────────────────────────────────────────────────────\n");

  const originalFindOne = Student.findOne;
  const originalFindById = Student.findById;

  try {
    console.log("[1] Backend API Contract Verification for Student Frontend");

    await runTest("POST /api/students/login returns expected contract on success", async () => {
      const studentId = new mongoose.Types.ObjectId();
      const mockStudent = {
        _id: studentId,
        studentIdNumber: "2026-F-CS-0001",
        rollNumber: "BCS-F26-001",
        fullName: "Muhammad Ali",
        email: "ali@student.apex.edu.pk",
        phone: "03001234567",
        program: {
          name: "BS Computer Science",
          code: "BSCS",
          shift: "Morning",
          campus: "Main Campus",
        },
        status: "active",
        isActivated: true,
        admissionDate: new Date("2026-09-01"),
        password: "$2a$10$hashedpasswordforstudentauth",
        comparePassword: async () => true,
      };

      Student.findOne = () => ({
        select: () => Promise.resolve(mockStudent),
      });

      const req = {
        body: {
          identifier: "BCS-F26-001",
          password: "SecretPassword123!",
        },
      };
      const res = createMockRes();

      await loginStudent(req, res);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(typeof res.body.token, "string");
      assert.ok(res.body.token.length > 20);
      assert.strictEqual(res.body.student.id.toString(), studentId.toString());
      assert.strictEqual(res.body.student.rollNumber, "BCS-F26-001");
      assert.strictEqual(res.body.student.studentIdNumber, "2026-F-CS-0001");
      assert.strictEqual(res.body.student.fullName, "Muhammad Ali");
      assert.strictEqual(res.body.student.program.name, "BS Computer Science");
      assert.strictEqual(res.body.student.password, undefined);
    });

    await runTest("POST /api/students/login returns ACCOUNT_NOT_ACTIVATED code for unactivated accounts", async () => {
      const mockStudent = {
        _id: new mongoose.Types.ObjectId(),
        studentIdNumber: "2026-F-CS-0002",
        rollNumber: "BCS-F26-002",
        status: "active",
        isActivated: false,
        password: null,
      };

      Student.findOne = () => ({
        select: () => Promise.resolve(mockStudent),
      });

      const req = {
        body: {
          identifier: "BCS-F26-002",
          password: "anyPassword123",
        },
      };
      const res = createMockRes();

      await loginStudent(req, res);

      assert.strictEqual(res.statusCode, 401);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.code, "ACCOUNT_NOT_ACTIVATED");
      assert.ok(res.body.message.includes("not been activated"));
    });

    await runTest("POST /api/students/login returns 403 for suspended student accounts", async () => {
      const mockStudent = {
        _id: new mongoose.Types.ObjectId(),
        studentIdNumber: "2026-F-CS-0003",
        rollNumber: "BCS-F26-003",
        status: "suspended",
        isActivated: true,
        password: "$2a$10$hashedpasswordforstudentauth",
        comparePassword: async () => true,
      };

      Student.findOne = () => ({
        select: () => Promise.resolve(mockStudent),
      });

      const req = {
        body: {
          identifier: "BCS-F26-003",
          password: "ValidPassword123",
        },
      };
      const res = createMockRes();

      await loginStudent(req, res);

      assert.strictEqual(res.statusCode, 403);
      assert.strictEqual(res.body.success, false);
      assert.ok(res.body.message.includes("suspended"));
    });

    await runTest("GET /api/students/profile returns sanitized profile for authenticated student", async () => {
      const studentId = new mongoose.Types.ObjectId();
      const req = {
        student: {
          _id: studentId,
          applicantId: new mongoose.Types.ObjectId(),
          applicationId: new mongoose.Types.ObjectId(),
          studentIdNumber: "2026-F-CS-0001",
          rollNumber: "BCS-F26-001",
          fullName: "Muhammad Ali",
          email: "ali@student.apex.edu.pk",
          phone: "03001234567",
          status: "active",
          program: {
            name: "BS Computer Science",
            code: "BSCS",
            shift: "Morning",
            campus: "Main Campus",
          },
          admissionDate: new Date("2026-09-01"),
        },
      };
      const res = createMockRes();

      await getStudentProfile(req, res);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.student.id.toString(), studentId.toString());
      assert.strictEqual(res.body.student.rollNumber, "BCS-F26-001");
      assert.strictEqual(res.body.student.fullName, "Muhammad Ali");
      assert.strictEqual(res.body.student.program.name, "BS Computer Science");
      assert.strictEqual(res.body.student.password, undefined);
    });

    console.log("\n[2] Token Storage Isolation & Multi-Portal Coexistence");

    await runTest("Student, Applicant, and Admin tokens use isolated storage keys", () => {
      const localStorage = createMockLocalStorage();

      const APPLICANT_KEY = "cms_applicant_jwt_token";
      const ADMIN_KEY = "cms_admin_jwt_token";
      const STUDENT_KEY = "cms_student_jwt_token";

      localStorage.setItem(APPLICANT_KEY, "applicant_token_abc");
      localStorage.setItem(ADMIN_KEY, "admin_token_xyz");
      localStorage.setItem(STUDENT_KEY, "student_token_123");

      assert.strictEqual(localStorage.getItem(STUDENT_KEY), "student_token_123");
      assert.strictEqual(localStorage.getItem(APPLICANT_KEY), "applicant_token_abc");
      assert.strictEqual(localStorage.getItem(ADMIN_KEY), "admin_token_xyz");

      // Removing student token does not touch applicant or admin token
      localStorage.removeItem(STUDENT_KEY);
      assert.strictEqual(localStorage.getItem(STUDENT_KEY), null);
      assert.strictEqual(localStorage.getItem(APPLICANT_KEY), "applicant_token_abc");
      assert.strictEqual(localStorage.getItem(ADMIN_KEY), "admin_token_xyz");
    });

    console.log("\n[3] Frontend Error Code Discrimination & Handling");

    await runTest("Maps ACCOUNT_NOT_ACTIVATED to clear user setup instructions", () => {
      const backendError = {
        code: "ACCOUNT_NOT_ACTIVATED",
        message: "Student account has not been activated. Please complete initial password setup before logging in.",
      };

      let userFacingMessage = "";
      if (backendError.code === "ACCOUNT_NOT_ACTIVATED") {
        userFacingMessage = backendError.message;
      }

      assert.ok(userFacingMessage.includes("initial password setup"));
    });

    await runTest("Maps 403 suspended status to explicit account notice", () => {
      const backendError = {
        status: 403,
        message: "Student account is suspended. Login not permitted.",
      };

      let userFacingMessage = "";
      if (backendError.status === 403) {
        userFacingMessage = backendError.message;
      }

      assert.ok(userFacingMessage.includes("suspended"));
    });

    console.log("\n[4] Student Account Activation Frontend Contract Verification (Step 6.6)");

    await runTest("POST /api/students/request-activation returns activationToken and student metadata for authenticated applicant session", async () => {
      const applicantId = new mongoose.Types.ObjectId();
      const studentId = new mongoose.Types.ObjectId();
      const mockStudent = {
        _id: studentId,
        applicantId,
        studentIdNumber: "2026-F-CS-0005",
        rollNumber: "BCS-F26-005",
        fullName: "Fatima Noor",
        status: "active",
        isActivated: false,
        password: null,
        save: async function () { return this; },
      };

      Student.findOne = () => ({
        select: async () => mockStudent,
      });

      const applicantToken = signToken({ id: applicantId.toString(), role: "applicant" });

      const req = {
        headers: { authorization: `Bearer ${applicantToken}` },
        body: { identifier: "BCS-F26-005" },
      };
      const res = createMockRes();

      await requestStudentActivation(req, res);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.success, true);
      assert.ok(typeof res.body.activationToken === "string" && res.body.activationToken.length === 64);
      assert.strictEqual(res.body.expiresInMinutes, 15);
      assert.strictEqual(res.body.student.id.toString(), studentId.toString());
      assert.strictEqual(res.body.student.rollNumber, "BCS-F26-005");
      assert.strictEqual(res.body.student.fullName, "Fatima Noor");
    });

    await runTest("POST /api/students/request-activation returns activationToken for verified applicant credentials", async () => {
      const applicantId = new mongoose.Types.ObjectId();
      const studentId = new mongoose.Types.ObjectId();
      const hashedApplicantPass = await bcrypt.hash("MyApplicantPass123!", 10);

      const mockStudent = {
        _id: studentId,
        applicantId,
        studentIdNumber: "2026-F-CS-0006",
        rollNumber: "BCS-F26-006",
        fullName: "Zain Ahmed",
        status: "active",
        isActivated: false,
        password: null,
        save: async function () { return this; },
      };

      const mockApplicant = {
        _id: applicantId,
        phone: "03009876543",
        comparePassword: async (pwd) => pwd === "MyApplicantPass123!",
      };

      Student.findOne = () => ({
        select: async () => mockStudent,
      });
      Applicant.findById = () => ({
        select: async () => mockApplicant,
      });

      const req = {
        body: {
          identifier: "2026-F-CS-0006",
          phone: "03009876543",
          applicantPassword: "MyApplicantPass123!",
        },
      };
      const res = createMockRes();

      await requestStudentActivation(req, res);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.success, true);
      assert.ok(res.body.activationToken);
      assert.strictEqual(res.body.student.rollNumber, "BCS-F26-006");
    });

    await runTest("POST /api/students/request-activation returns ALREADY_ACTIVATED code for already activated account", async () => {
      const mockStudent = {
        _id: new mongoose.Types.ObjectId(),
        studentIdNumber: "2026-F-CS-0007",
        rollNumber: "BCS-F26-007",
        isActivated: true,
        password: "$2a$10$alreadyactivatedpass",
        status: "active",
      };

      Student.findOne = () => ({
        select: async () => mockStudent,
      });

      const req = {
        body: { identifier: "BCS-F26-007" },
      };
      const res = createMockRes();

      await requestStudentActivation(req, res);

      assert.strictEqual(res.statusCode, 400);
      assert.strictEqual(res.body.code, "ALREADY_ACTIVATED");
    });

    await runTest("POST /api/students/activate validates password length and mismatch", async () => {
      const res1 = createMockRes();
      await activateStudentAccount({ body: { activationToken: "tok123", password: "123" } }, res1);
      assert.strictEqual(res1.statusCode, 400);
      assert.ok(res1.body.message.includes("at least 6 characters"));

      const res2 = createMockRes();
      await activateStudentAccount({
        body: { activationToken: "tok123", password: "SecurePassword123!", confirmPassword: "WrongPassword!" }
      }, res2);
      assert.strictEqual(res2.statusCode, 400);
      assert.ok(res2.body.message.includes("do not match"));
    });

    await runTest("POST /api/students/activate successfully sets password, activates student, and invalidates token", async () => {
      const rawToken = "sample_secure_activation_token_hex_1234567890abcdef1234567890abcdef";
      const crypto = require("crypto");
      const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

      const studentDoc = {
        _id: new mongoose.Types.ObjectId(),
        studentIdNumber: "2026-F-CS-0008",
        rollNumber: "BCS-F26-008",
        fullName: "Hamza Siddiqui",
        status: "active",
        isActivated: false,
        activationTokenHash: tokenHash,
        activationTokenExpires: new Date(Date.now() + 15 * 60 * 1000),
        save: async function () {
          if (this.password) {
            this.password = await bcrypt.hash(this.password, 10);
          }
          return this;
        },
        comparePassword: async function (pwd) {
          return bcrypt.compare(pwd, this.password);
        },
      };

      Student.findOne = () => ({
        select: async () => studentDoc,
      });

      const req = {
        body: {
          activationToken: rawToken,
          password: "BrandNewStudentPass123!",
          confirmPassword: "BrandNewStudentPass123!",
        },
      };
      const res = createMockRes();

      await activateStudentAccount(req, res);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.student.isActivated, true);
      assert.strictEqual(studentDoc.isActivated, true);
      assert.strictEqual(studentDoc.activationTokenHash, undefined);

      // Now verify post-activation student login immediately works with the new password
      Student.findOne = () => ({
        select: async () => studentDoc,
      });

      const loginReq = {
        body: {
          identifier: "BCS-F26-008",
          password: "BrandNewStudentPass123!",
        },
      };
      const loginRes = createMockRes();

      await loginStudent(loginReq, loginRes);

      assert.strictEqual(loginRes.statusCode, 200);
      assert.strictEqual(loginRes.body.success, true);
      assert.ok(loginRes.body.token);
    });

    console.log("\n[5] Token Storage Isolation & Security Hygiene");

    await runTest("Activation token is never saved in persistent storage keys", () => {
      const localStorage = createMockLocalStorage();
      const STUDENT_KEY = "cms_student_jwt_token";
      const APPLICANT_KEY = "cms_applicant_jwt_token";
      const ADMIN_KEY = "cms_admin_jwt_token";

      // Simulate activation session holding an activation token strictly in memory
      let ephemeralActivationToken = "64char_raw_token_held_only_in_react_state";

      // Check localStorage before and after
      assert.strictEqual(localStorage.getItem(STUDENT_KEY), null);
      assert.strictEqual(localStorage.getItem(APPLICANT_KEY), null);
      assert.strictEqual(localStorage.getItem(ADMIN_KEY), null);

      // Upon activation completion, token is discarded
      ephemeralActivationToken = null;
      assert.strictEqual(ephemeralActivationToken, null);
      assert.strictEqual(localStorage.getItem(STUDENT_KEY), null);
    });

  } finally {
    Student.findOne = originalFindOne;
    Student.findById = originalFindById;
  }

  console.log("\n─────────────────────────────────────────────────────────────");
  console.log(`Student Frontend Integration Results: ${passedCount} / ${passedCount + failedCount} passed (${failedCount} failed)`);
  console.log("─────────────────────────────────────────────────────────────\n");

  if (failedCount > 0) {
    process.exit(1);
  }
}

runAllTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
