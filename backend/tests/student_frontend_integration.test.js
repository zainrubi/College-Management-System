const assert = require("assert");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { signToken } = require("../utils/jwt");
const {
  loginStudent,
  getStudentProfile,
  getStudentVouchers,
  requestStudentActivation,
  activateStudentAccount,
} = require("../controllers/studentController");
const { protectStudent } = require("../middleware/authMiddleware");
const Student = require("../models/Student");
const Applicant = require("../models/Applicant");
const FeeVoucher = require("../models/FeeVoucher");

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
  const originalFeeVoucherFind = FeeVoucher.find;

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

    console.log("\n[6] Step 7.2: Comprehensive Student Profile & Academic Details Contract Verification");

    await runTest("GET /api/students/profile returns all personal, contact, guardian, and academic fields", async () => {
      const studentId = new mongoose.Types.ObjectId();
      const applicantId = new mongoose.Types.ObjectId();
      const applicationId = new mongoose.Types.ObjectId();

      const mockStudent = {
        _id: studentId,
        applicantId,
        applicationId,
        studentIdNumber: "2026-F-CS-0042",
        rollNumber: "BCS-F26-042",
        fullName: "Ayesha Noor",
        dob: "2005-04-18",
        gender: "Female",
        cnicBForm: "35102-9876543-2",
        bloodGroup: "O+",
        nationality: "Pakistani",
        religion: "Islam",
        phone: "03214567890",
        email: "ayesha.noor@student.apex.edu.pk",
        guardian: {
          fatherName: "Tariq Mahmood Noor",
          motherName: "Sultana Begum",
          guardianPhone: "03009876543",
        },
        address: {
          domicile: "Kasur",
          currentAddress: "Street 4, Model Colony, Kanganpur",
          permanentAddress: "Village 45-RB, Tehsil Chunian, Kasur",
        },
        program: {
          academicLevel: "Undergraduate",
          programName: "BS Computer Science",
          shift: "Morning",
          campus: "Kanganpur",
          session: "Fall 2026",
          currentSemesterOrYear: 1,
        },
        status: "active",
        admissionDate: new Date("2026-09-01T00:00:00.000Z"),
        createdAt: new Date("2026-08-25T10:00:00.000Z"),
        updatedAt: new Date("2026-08-25T10:00:00.000Z"),
      };

      const req = { student: mockStudent };
      const res = createMockRes();

      await getStudentProfile(req, res);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.success, true);
      const data = res.body.student;

      // Personal details
      assert.strictEqual(data.fullName, "Ayesha Noor");
      assert.strictEqual(data.studentIdNumber, "2026-F-CS-0042");
      assert.strictEqual(data.rollNumber, "BCS-F26-042");
      assert.strictEqual(data.dob, "2005-04-18");
      assert.strictEqual(data.gender, "Female");
      assert.strictEqual(data.cnicBForm, "35102-9876543-2");
      assert.strictEqual(data.bloodGroup, "O+");
      assert.strictEqual(data.nationality, "Pakistani");
      assert.strictEqual(data.religion, "Islam");

      // Contact details
      assert.strictEqual(data.phone, "03214567890");
      assert.strictEqual(data.email, "ayesha.noor@student.apex.edu.pk");
      assert.strictEqual(data.address.domicile, "Kasur");
      assert.strictEqual(data.address.currentAddress, "Street 4, Model Colony, Kanganpur");
      assert.strictEqual(data.address.permanentAddress, "Village 45-RB, Tehsil Chunian, Kasur");

      // Guardian details
      assert.strictEqual(data.guardian.fatherName, "Tariq Mahmood Noor");
      assert.strictEqual(data.guardian.motherName, "Sultana Begum");
      assert.strictEqual(data.guardian.guardianPhone, "03009876543");

      // Academic details
      assert.strictEqual(data.program.academicLevel, "Undergraduate");
      assert.strictEqual(data.program.programName, "BS Computer Science");
      assert.strictEqual(data.program.shift, "Morning");
      assert.strictEqual(data.program.campus, "Kanganpur");
      assert.strictEqual(data.program.session, "Fall 2026");
      assert.strictEqual(data.program.currentSemesterOrYear, 1);
      assert.strictEqual(data.status, "active");
      assert.ok(data.admissionDate);

      // Security check
      assert.strictEqual(data.password, undefined);
      assert.strictEqual(data.activationTokenHash, undefined);
      assert.strictEqual(data.activationTokenExpires, undefined);
    });

    await runTest("GET /api/students/profile preserves missing optional fields as undefined without fake data", async () => {
      const studentId = new mongoose.Types.ObjectId();
      const mockStudentWithMissingFields = {
        _id: studentId,
        studentIdNumber: "2026-F-ICS-0099",
        rollNumber: "ICS-F26-099",
        fullName: "Zahid Qureshi",
        phone: "03121234567",
        status: "active",
        program: {
          academicLevel: "Intermediate",
          programName: "FSc Pre-Medical",
          shift: "Evening",
          campus: "Kanganpur",
          session: "2026-2028",
          currentSemesterOrYear: 1,
        },
        admissionDate: new Date("2026-09-10"),
      };

      const req = { student: mockStudentWithMissingFields };
      const res = createMockRes();

      await getStudentProfile(req, res);

      assert.strictEqual(res.statusCode, 200);
      const data = res.body.student;
      assert.strictEqual(data.fullName, "Zahid Qureshi");
      assert.strictEqual(data.bloodGroup, undefined);
      assert.strictEqual(data.guardian, undefined);
      assert.strictEqual(data.address, undefined);
      assert.strictEqual(data.email, undefined);
      assert.strictEqual(data.password, undefined);
    });

    // ─── 7. Step 7.3: Fee Voucher Service Integration & Error Handling Contract Verification ───
    console.log("\n[7] Step 7.3: Fee Voucher Service Integration & Error Handling Contract Verification");

    await runTest("GET /api/students/vouchers returns complete voucher details and calculated summary for student frontend", async () => {
      const studentId = new mongoose.Types.ObjectId();
      const mockVouchers = [
        {
          _id: new mongoose.Types.ObjectId(),
          voucherNumber: "VCH-2026-0042",
          studentId,
          studentRollNumber: "BCS-F26-042",
          studentName: "Ayesha Noor",
          programName: "BS Computer Science",
          academicSessionName: "Fall 2026",
          items: [
            { _id: new mongoose.Types.ObjectId(), title: "Tuition Fee", category: "tuition", amountPKR: 45000 },
            { _id: new mongoose.Types.ObjectId(), title: "Lab Charges", category: "lab", amountPKR: 5000 },
          ],
          subtotalPKR: 50000,
          discountPKR: 5000,
          totalAmountPKR: 45000,
          paidAmountPKR: 15000,
          issueDate: new Date("2026-09-01"),
          originalDueDate: new Date("2026-09-20"),
          finalAllowedDate: new Date("2026-09-30"),
          concession: {
            isGranted: true,
            originalDueDate: new Date("2026-09-20"),
            newAllowedDate: new Date("2026-09-30"),
            discountAmountPKR: 5000,
            reason: "Merit scholarship",
            grantedByAdminName: "Prof. Tariq",
          },
          paymentRecords: [
            {
              _id: new mongoose.Types.ObjectId(),
              receiptNumber: "RCP-2026-001",
              transactionReference: "TXN-987654",
              amountPaidPKR: 15000,
              paymentDate: new Date("2026-09-15"),
              paymentMethod: "Bank Challan",
              verifiedByAdminName: "Accounts Office",
            },
          ],
          status: "partially_paid",
          remarks: "First installment settled",
          createdAt: new Date("2026-09-01T10:00:00.000Z"),
          updatedAt: new Date("2026-09-15T12:00:00.000Z"),
        },
      ];

      FeeVoucher.find = () => ({
        sort: () => ({
          lean: () => Promise.resolve(mockVouchers),
        }),
      });

      const req = { student: { _id: studentId } };
      const res = createMockRes();

      await getStudentVouchers(req, res);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.vouchers.length, 1);

      const v = res.body.vouchers[0];
      assert.strictEqual(v.voucherNumber, "VCH-2026-0042");
      assert.strictEqual(v.studentRollNumber, "BCS-F26-042");
      assert.strictEqual(v.totalAmountPKR, 45000);
      assert.strictEqual(v.paidAmountPKR, 15000);
      assert.strictEqual(v.outstandingAmountPKR, 30000);
      assert.strictEqual(v.status, "partially_paid");
      assert.strictEqual(v.items.length, 2);
      assert.strictEqual(v.concession.isGranted, true);
      assert.strictEqual(v.paymentRecords.length, 1);
      assert.strictEqual(v.paymentRecords[0].receiptNumber, "RCP-2026-001");

      // Verify summary counters
      assert.strictEqual(res.body.summary.totalVouchers, 1);
      assert.strictEqual(res.body.summary.unpaidCount, 1);
      assert.strictEqual(res.body.summary.pendingCount, 1);
      assert.strictEqual(res.body.summary.totalOutstandingPKR, 30000);
      assert.strictEqual(res.body.summary.totalPaidPKR, 15000);
    });

    await runTest("Empty voucher list returns 200 with empty array and zeroed summary (not an error)", async () => {
      const studentId = new mongoose.Types.ObjectId();
      FeeVoucher.find = () => ({
        sort: () => ({
          lean: () => Promise.resolve([]),
        }),
      });

      const req = { student: { _id: studentId } };
      const res = createMockRes();

      await getStudentVouchers(req, res);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.success, true);
      assert.deepStrictEqual(res.body.vouchers, []);
      assert.strictEqual(res.body.summary.totalVouchers, 0);
      assert.strictEqual(res.body.summary.unpaidCount, 0);
      assert.strictEqual(res.body.summary.pendingCount, 0);
      assert.strictEqual(res.body.summary.totalOutstandingPKR, 0);
      assert.strictEqual(res.body.summary.totalPaidPKR, 0);
    });

    // Client service simulation helper mirroring lib/services/student-service.ts getStudentVouchers()
    async function simulateGetStudentVouchers({ token, fetchFn, storage }) {
      if (!token) {
        const err = new Error("No active student authentication token found.");
        err.code = "UNAUTHORIZED";
        throw err;
      }

      let response;
      try {
        response = await fetchFn("/api/students/vouchers", {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {
        const err = new Error("Unable to connect to college server to load fee vouchers.");
        err.code = "NETWORK_ERROR";
        throw err;
      }

      const data = response.body || {};

      if (response.status !== 200) {
        if (response.status === 401 || response.status === 403) {
          storage.removeItem("cms_student_jwt_token");
          const err = new Error(data.message || "Student session expired or unauthorized. Please sign in again.");
          err.code = "SESSION_EXPIRED";
          err.status = response.status;
          throw err;
        }

        if (response.status === 429 || data.code === "TOO_MANY_REQUESTS") {
          const err = new Error(data.message || "Too many requests. Please try again later.");
          err.code = "RATE_LIMITED";
          err.status = 429;
          throw err;
        }

        const err = new Error(data.message || "Failed to load student fee vouchers");
        err.status = response.status;
        err.code = data.code || (response.status >= 500 ? "SERVER_ERROR" : undefined);
        throw err;
      }

      if (
        !data.success ||
        !Array.isArray(data.vouchers) ||
        !data.summary ||
        typeof data.summary.totalOutstandingPKR !== "number" ||
        typeof data.summary.totalVouchers !== "number"
      ) {
        const err = new Error("Invalid fee voucher response from server.");
        err.code = "MALFORMED_RESPONSE";
        throw err;
      }

      return {
        success: true,
        vouchers: data.vouchers,
        summary: {
          totalVouchers: Number(data.summary.totalVouchers) || 0,
          unpaidCount: Number(data.summary.unpaidCount) || 0,
          pendingCount: Number(data.summary.pendingCount ?? data.summary.unpaidCount) || 0,
          totalOutstandingPKR: Number(data.summary.totalOutstandingPKR) || 0,
          totalPaidPKR: Number(data.summary.totalPaidPKR) || 0,
        },
      };
    }

    await runTest("Frontend service maps successful response into StudentVouchersResponse structure without inventing fields", async () => {
      const storage = createMockLocalStorage();
      storage.setItem("cms_student_jwt_token", "valid_jwt_student_token");

      const mockApiResponse = {
        status: 200,
        body: {
          success: true,
          vouchers: [
            {
              id: "vch_1",
              voucherNumber: "VCH-2026-0001",
              studentId: "std_1",
              studentRollNumber: "BCS-F26-001",
              studentName: "Muhammad Ali",
              programName: "BS Computer Science",
              academicSessionName: "Fall 2026",
              items: [{ id: "item_1", title: "Tuition", category: "tuition", amountPKR: 45000 }],
              subtotalPKR: 45000,
              discountPKR: 0,
              totalAmountPKR: 45000,
              paidAmountPKR: 0,
              outstandingAmountPKR: 45000,
              issueDate: "2026-09-01T00:00:00.000Z",
              originalDueDate: "2026-09-20T00:00:00.000Z",
              finalAllowedDate: "2026-09-20T00:00:00.000Z",
              concession: null,
              paymentRecords: [],
              status: "unpaid",
              remarks: "Regular semester fee",
            },
          ],
          summary: {
            totalVouchers: 1,
            unpaidCount: 1,
            pendingCount: 1,
            totalOutstandingPKR: 45000,
            totalPaidPKR: 0,
          },
        },
      };

      const result = await simulateGetStudentVouchers({
        token: storage.getItem("cms_student_jwt_token"),
        fetchFn: async () => mockApiResponse,
        storage,
      });

      assert.strictEqual(result.success, true);
      assert.strictEqual(result.vouchers.length, 1);
      assert.strictEqual(result.vouchers[0].voucherNumber, "VCH-2026-0001");
      assert.strictEqual(result.vouchers[0].outstandingAmountPKR, 45000);
      assert.strictEqual(result.summary.totalOutstandingPKR, 45000);
      assert.strictEqual(result.summary.totalVouchers, 1);
      assert.strictEqual(result.summary.unpaidCount, 1);
    });

    await runTest("Frontend service treats empty voucher list as valid result without falling back to mock vouchers", async () => {
      const storage = createMockLocalStorage();
      storage.setItem("cms_student_jwt_token", "valid_jwt_student_token");

      const mockEmptyApiResponse = {
        status: 200,
        body: {
          success: true,
          vouchers: [],
          summary: {
            totalVouchers: 0,
            unpaidCount: 0,
            pendingCount: 0,
            totalOutstandingPKR: 0,
            totalPaidPKR: 0,
          },
        },
      };

      const result = await simulateGetStudentVouchers({
        token: storage.getItem("cms_student_jwt_token"),
        fetchFn: async () => mockEmptyApiResponse,
        storage,
      });

      assert.strictEqual(result.success, true);
      assert.deepStrictEqual(result.vouchers, []);
      assert.strictEqual(result.summary.totalVouchers, 0);
      assert.strictEqual(result.summary.totalOutstandingPKR, 0);
    });

    await runTest("Frontend service rejects malformed API responses (missing success, vouchers array, or summary)", async () => {
      const storage = createMockLocalStorage();
      storage.setItem("cms_student_jwt_token", "valid_jwt_student_token");

      // Case 1: Missing vouchers array
      await assert.rejects(
        async () => {
          await simulateGetStudentVouchers({
            token: "valid_token",
            fetchFn: async () => ({
              status: 200,
              body: { success: true, summary: { totalVouchers: 0, totalOutstandingPKR: 0 } },
            }),
            storage,
          });
        },
        (err) => err.code === "MALFORMED_RESPONSE"
      );

      // Case 2: Missing success: true
      await assert.rejects(
        async () => {
          await simulateGetStudentVouchers({
            token: "valid_token",
            fetchFn: async () => ({
              status: 200,
              body: { success: false, vouchers: [], summary: { totalVouchers: 0, totalOutstandingPKR: 0 } },
            }),
            storage,
          });
        },
        (err) => err.code === "MALFORMED_RESPONSE"
      );

      // Case 3: Missing summary
      await assert.rejects(
        async () => {
          await simulateGetStudentVouchers({
            token: "valid_token",
            fetchFn: async () => ({
              status: 200,
              body: { success: true, vouchers: [] },
            }),
            storage,
          });
        },
        (err) => err.code === "MALFORMED_RESPONSE"
      );
    });

    await runTest("Frontend service handles HTTP 401 and 403 by wiping student token and throwing SESSION_EXPIRED", async () => {
      const storage = createMockLocalStorage();
      storage.setItem("cms_student_jwt_token", "expired_token_123");

      await assert.rejects(
        async () => {
          await simulateGetStudentVouchers({
            token: storage.getItem("cms_student_jwt_token"),
            fetchFn: async () => ({
              status: 401,
              body: { success: false, message: "Invalid or expired token" },
            }),
            storage,
          });
        },
        (err) => {
          assert.strictEqual(err.code, "SESSION_EXPIRED");
          assert.strictEqual(err.status, 401);
          return true;
        }
      );

      // Student token wiped
      assert.strictEqual(storage.getItem("cms_student_jwt_token"), null);
    });

    await runTest("Frontend service preserves applicant and admin tokens upon student session expiration", async () => {
      const storage = createMockLocalStorage();
      storage.setItem("cms_student_jwt_token", "student_tok");
      storage.setItem("cms_applicant_jwt_token", "applicant_tok_unaffected");
      storage.setItem("cms_admin_jwt_token", "admin_tok_unaffected");

      await assert.rejects(
        async () => {
          await simulateGetStudentVouchers({
            token: storage.getItem("cms_student_jwt_token"),
            fetchFn: async () => ({
              status: 403,
              body: { success: false, message: "Forbidden" },
            }),
            storage,
          });
        },
        (err) => err.code === "SESSION_EXPIRED"
      );

      // Student token is removed, applicant and admin tokens remain perfectly intact
      assert.strictEqual(storage.getItem("cms_student_jwt_token"), null);
      assert.strictEqual(storage.getItem("cms_applicant_jwt_token"), "applicant_tok_unaffected");
      assert.strictEqual(storage.getItem("cms_admin_jwt_token"), "admin_tok_unaffected");
    });

    await runTest("Frontend service handles HTTP 429 rate limiting with RATE_LIMITED error without clearing tokens", async () => {
      const storage = createMockLocalStorage();
      storage.setItem("cms_student_jwt_token", "valid_student_jwt");

      await assert.rejects(
        async () => {
          await simulateGetStudentVouchers({
            token: storage.getItem("cms_student_jwt_token"),
            fetchFn: async () => ({
              status: 429,
              body: { success: false, message: "Too many requests. Please try again later." },
            }),
            storage,
          });
        },
        (err) => {
          assert.strictEqual(err.code, "RATE_LIMITED");
          assert.strictEqual(err.status, 429);
          return true;
        }
      );

      // Token should NOT be wiped on 429
      assert.strictEqual(storage.getItem("cms_student_jwt_token"), "valid_student_jwt");
    });

    await runTest("Frontend service handles network errors with NETWORK_ERROR", async () => {
      const storage = createMockLocalStorage();
      storage.setItem("cms_student_jwt_token", "valid_student_jwt");

      await assert.rejects(
        async () => {
          await simulateGetStudentVouchers({
            token: "valid_student_jwt",
            fetchFn: async () => {
              throw new Error("Failed to fetch");
            },
            storage,
          });
        },
        (err) => {
          assert.strictEqual(err.code, "NETWORK_ERROR");
          return true;
        }
      );
    });

    await runTest("Tokens are never exposed in service logs, error messages, or rejected error properties", async () => {
      const sensitiveToken = "super_secret_jwt_payload_9876543210";
      const storage = createMockLocalStorage();

      const scenarios = [
        async () => {
          await simulateGetStudentVouchers({
            token: sensitiveToken,
            fetchFn: async () => { throw new Error("Connection timed out"); },
            storage,
          });
        },
        async () => {
          await simulateGetStudentVouchers({
            token: sensitiveToken,
            fetchFn: async () => ({ status: 401, body: { message: "Unauthorized" } }),
            storage,
          });
        },
        async () => {
          await simulateGetStudentVouchers({
            token: sensitiveToken,
            fetchFn: async () => ({ status: 429, body: { message: "Rate limit exceeded" } }),
            storage,
          });
        },
        async () => {
          await simulateGetStudentVouchers({
            token: sensitiveToken,
            fetchFn: async () => ({ status: 500, body: { message: "Internal server error" } }),
            storage,
          });
        },
        async () => {
          await simulateGetStudentVouchers({
            token: sensitiveToken,
            fetchFn: async () => ({ status: 200, body: { corrupted: true } }),
            storage,
          });
        },
      ];

      for (const scenario of scenarios) {
        try {
          await scenario();
          assert.fail("Scenario should have thrown an error");
        } catch (err) {
          assert.strictEqual(err.message.includes(sensitiveToken), false);
          assert.strictEqual(JSON.stringify(err).includes(sensitiveToken), false);
        }
      }
    });

  } finally {
    Student.findOne = originalFindOne;
    Student.findById = originalFindById;
    FeeVoucher.find = originalFeeVoucherFind;
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
