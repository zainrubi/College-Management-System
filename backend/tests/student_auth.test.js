const assert = require("assert");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { signToken, verifyToken } = require("../utils/jwt");
const { loginStudent, getStudentProfile } = require("../controllers/studentController");
const { protectStudent } = require("../middleware/authMiddleware");
const Student = require("../models/Student");

// Set test environment secret if not already set
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = "test_jwt_secret_key_for_unit_tests_1234567890abcdef";
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

// Helper to create mock Student document
function createSampleStudent(overrides = {}) {
  const studentId = new mongoose.Types.ObjectId();
  const applicantId = new mongoose.Types.ObjectId();
  const applicationId = new mongoose.Types.ObjectId();

  const doc = {
    _id: studentId,
    applicantId,
    applicationId,
    studentIdNumber: overrides.studentIdNumber || "AIST-STD-2026-0001",
    rollNumber: overrides.rollNumber || "BCS-F26-001",
    fullName: overrides.fullName || "Muhammad Ali Siddiqui",
    dob: "2006-04-12",
    gender: "Male",
    cnicBForm: "35102-1234567-1",
    bloodGroup: "B+",
    nationality: "Pakistani",
    religion: "Islam",
    phone: overrides.phone || "03001234567",
    email: overrides.email || "ali.siddiqui@student.apex.edu.pk",
    guardian: {
      fatherName: "Tariq Siddiqui",
      motherName: "Nasreen Bibi",
      guardianPhone: "03009876543",
    },
    address: {
      domicile: "Kasur",
      currentAddress: "Main Bazar, Kanganpur",
      permanentAddress: "Main Bazar, Kanganpur",
    },
    program: {
      academicLevel: "Undergraduate",
      programName: "BS Computer Science",
      shift: "Morning",
      campus: "Kanganpur",
      session: "Fall 2026",
      currentSemesterOrYear: 1,
    },
    status: overrides.status || "active",
    admissionDate: new Date("2026-08-15"),
    password: overrides.password, // undefined by default for newly enrolled students
    createdAt: new Date("2026-08-15"),
    updatedAt: new Date("2026-08-15"),
  };

  doc.comparePassword = async function (candidatePassword) {
    if (!this.password) {
      throw new Error("Password field not selected");
    }
    return bcrypt.compare(candidatePassword, this.password);
  };

  return doc;
}

async function runStudentAuthTests() {
  console.log("─────────────────────────────────────────────────────────────");
  console.log("Running Student Backend Authentication Test Suite (Step 6.3)");
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

  const validPassword = "StudentSecret123!";
  const validHashedPassword = await bcrypt.hash(validPassword, 10);

  const origFindOne = Student.findOne;
  const origFindById = Student.findById;

  function restoreMocks() {
    Student.findOne = origFindOne;
    Student.findById = origFindById;
  }

  // ─── 1. Login Controller Validation & Errors ─────────────────────────────
  console.log("[1] Student Login Controller Validation Tests");

  await test("loginStudent rejects missing identifier or password with HTTP 400", async () => {
    const res1 = createMockRes();
    await loginStudent({ body: {} }, res1);
    assert.strictEqual(res1.statusCode, 400);
    assert.strictEqual(res1.body.success, false);

    const res2 = createMockRes();
    await loginStudent({ body: { identifier: "BCS-F26-001" } }, res2);
    assert.strictEqual(res2.statusCode, 400);

    const res3 = createMockRes();
    await loginStudent({ body: { password: "somePassword" } }, res3);
    assert.strictEqual(res3.statusCode, 400);
  });

  await test("loginStudent returns generic 401 for unknown student (prevents enumeration)", async () => {
    Student.findOne = () => ({
      select: async () => null,
    });

    const res = createMockRes();
    await loginStudent({ body: { identifier: "UNKNOWN-ID", password: "Password123!" } }, res);

    assert.strictEqual(res.statusCode, 401);
    assert.strictEqual(res.body.success, false);
    assert.strictEqual(res.body.message, "Invalid credentials");
  });

  await test("loginStudent rejects unactivated account with clear 401 message (no password set)", async () => {
    const unactivatedStudent = createSampleStudent({ password: undefined });

    Student.findOne = () => ({
      select: async () => unactivatedStudent,
    });

    const res = createMockRes();
    await loginStudent({ body: { identifier: "BCS-F26-001", password: "Password123!" } }, res);

    assert.strictEqual(res.statusCode, 401);
    assert.strictEqual(res.body.success, false);
    assert.strictEqual(res.body.code, "ACCOUNT_NOT_ACTIVATED");
    assert.ok(res.body.message.includes("not been activated"));
  });

  await test("loginStudent rejects incorrect password with HTTP 401", async () => {
    const student = createSampleStudent({ password: validHashedPassword });

    Student.findOne = () => ({
      select: async () => student,
    });

    const res = createMockRes();
    await loginStudent({ body: { identifier: "BCS-F26-001", password: "WrongPassword!" } }, res);

    assert.strictEqual(res.statusCode, 401);
    assert.strictEqual(res.body.success, false);
    assert.strictEqual(res.body.message, "Invalid credentials");
  });

  await test("loginStudent rejects suspended or withdrawn student with HTTP 403 Forbidden", async () => {
    const suspendedStudent = createSampleStudent({
      status: "suspended",
      password: validHashedPassword,
    });

    Student.findOne = () => ({
      select: async () => suspendedStudent,
    });

    const res = createMockRes();
    await loginStudent({ body: { identifier: "BCS-F26-001", password: validPassword } }, res);

    assert.strictEqual(res.statusCode, 403);
    assert.strictEqual(res.body.success, false);
    assert.ok(res.body.message.includes("suspended"));
  });

  // ─── 2. Successful Login & JWT Issuance ──────────────────────────────────
  console.log("\n[2] Successful Student Login & Token Issuance");

  await test("loginStudent returns 200, JWT token, and sanitized profile without password", async () => {
    const activeStudent = createSampleStudent({ password: validHashedPassword });

    Student.findOne = () => ({
      select: async () => activeStudent,
    });

    const res = createMockRes();
    await loginStudent({ body: { identifier: "AIST-STD-2026-0001", password: validPassword } }, res);

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.token, "Must return signed JWT");

    // Verify token claims
    const decoded = verifyToken(res.body.token);
    assert.strictEqual(decoded.role, "student");
    assert.strictEqual(decoded.id, activeStudent._id.toString());
    assert.strictEqual(decoded.studentIdNumber, activeStudent.studentIdNumber);
    assert.strictEqual(decoded.rollNumber, activeStudent.rollNumber);

    // Verify profile output
    const profile = res.body.student;
    assert.strictEqual(profile.id.toString(), activeStudent._id.toString());
    assert.strictEqual(profile.studentIdNumber, "AIST-STD-2026-0001");
    assert.strictEqual(profile.rollNumber, "BCS-F26-001");
    assert.strictEqual(profile.fullName, "Muhammad Ali Siddiqui");
    assert.strictEqual(profile.password, undefined, "Password hash must never be returned");
  });

  await test("loginStudent allows flexible identifiers (rollNumber, studentIdNumber, email, phone)", async () => {
    const activeStudent = createSampleStudent({
      studentIdNumber: "AIST-STD-2026-0001",
      rollNumber: "BCS-F26-001",
      phone: "03001234567",
      email: "ali@apex.edu.pk",
      password: validHashedPassword,
    });

    let queriedCondition = null;
    Student.findOne = (query) => {
      queriedCondition = query;
      return {
        select: async () => activeStudent,
      };
    };

    // Test with rollNumber
    const resRoll = createMockRes();
    await loginStudent({ body: { rollNumber: "bcs-f26-001", password: validPassword } }, resRoll);
    assert.strictEqual(resRoll.statusCode, 200);

    // Test with phone
    const resPhone = createMockRes();
    await loginStudent({ body: { phone: "03001234567", password: validPassword } }, resPhone);
    assert.strictEqual(resPhone.statusCode, 200);

    // Test with email
    const resEmail = createMockRes();
    await loginStudent({ body: { email: "ali@apex.edu.pk", password: validPassword } }, resEmail);
    assert.strictEqual(resEmail.statusCode, 200);
  });

  // ─── 3. protectStudent Middleware Tests ─────────────────────────────────
  console.log("\n[3] protectStudent Middleware Security Tests");

  await test("protectStudent rejects missing Authorization header with HTTP 401", async () => {
    const req = { headers: {} };
    const res = createMockRes();
    let nextCalled = false;

    await protectStudent(req, res, () => { nextCalled = true; });

    assert.strictEqual(res.statusCode, 401);
    assert.strictEqual(nextCalled, false);
    assert.ok(res.body.message.includes("missing token"));
  });

  await test("protectStudent rejects expired token with HTTP 401", async () => {
    const expiredToken = signToken({ id: new mongoose.Types.ObjectId().toString(), role: "student" }, { expiresInSeconds: -10 });
    const req = { headers: { authorization: `Bearer ${expiredToken}` } };
    const res = createMockRes();
    let nextCalled = false;

    await protectStudent(req, res, () => { nextCalled = true; });

    assert.strictEqual(res.statusCode, 401);
    assert.strictEqual(nextCalled, false);
    assert.ok(res.body.message.includes("expired"));
  });

  await test("protectStudent rejects applicant-role tokens with HTTP 403 Forbidden", async () => {
    const applicantToken = signToken({ id: new mongoose.Types.ObjectId().toString(), role: "applicant" });
    const req = { headers: { authorization: `Bearer ${applicantToken}` } };
    const res = createMockRes();
    let nextCalled = false;

    await protectStudent(req, res, () => { nextCalled = true; });

    assert.strictEqual(res.statusCode, 403);
    assert.strictEqual(nextCalled, false);
    assert.ok(res.body.message.includes("Student role required"));
  });

  await test("protectStudent rejects admin-role tokens with HTTP 403 Forbidden", async () => {
    const adminToken = signToken({ id: new mongoose.Types.ObjectId().toString(), role: "admin" });
    const req = { headers: { authorization: `Bearer ${adminToken}` } };
    const res = createMockRes();
    let nextCalled = false;

    await protectStudent(req, res, () => { nextCalled = true; });

    assert.strictEqual(res.statusCode, 403);
    assert.strictEqual(nextCalled, false);
    assert.ok(res.body.message.includes("Student role required"));
  });

  await test("protectStudent rejects spoofed x-student-id conflicting with token", async () => {
    const realStudentId = new mongoose.Types.ObjectId().toString();
    const forgedStudentId = new mongoose.Types.ObjectId().toString();
    const validStudentToken = signToken({ id: realStudentId, role: "student" });

    const req = {
      headers: {
        authorization: `Bearer ${validStudentToken}`,
        "x-student-id": forgedStudentId,
      },
    };
    const res = createMockRes();
    let nextCalled = false;

    await protectStudent(req, res, () => { nextCalled = true; });

    assert.strictEqual(res.statusCode, 403);
    assert.strictEqual(nextCalled, false);
    assert.ok(res.body.message.includes("does not match authenticated token"));
  });

  await test("protectStudent rejects token when student is not found in database", async () => {
    const studentId = new mongoose.Types.ObjectId().toString();
    const token = signToken({ id: studentId, role: "student" });

    Student.findById = async () => null;

    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = createMockRes();
    let nextCalled = false;

    await protectStudent(req, res, () => { nextCalled = true; });

    assert.strictEqual(res.statusCode, 401);
    assert.strictEqual(nextCalled, false);
    assert.ok(res.body.message.includes("student not found"));
  });

  await test("protectStudent rejects token when student status is suspended", async () => {
    const studentDoc = createSampleStudent({ status: "suspended" });
    const token = signToken({ id: studentDoc._id.toString(), role: "student" });

    Student.findById = async () => studentDoc;

    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = createMockRes();
    let nextCalled = false;

    await protectStudent(req, res, () => { nextCalled = true; });

    assert.strictEqual(res.statusCode, 403);
    assert.strictEqual(nextCalled, false);
    assert.ok(res.body.message.includes("suspended"));
  });

  await test("protectStudent accepts valid token, populates req.student and calls next()", async () => {
    const activeStudent = createSampleStudent();
    const token = signToken({ id: activeStudent._id.toString(), role: "student" });

    Student.findById = async () => activeStudent;

    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = createMockRes();
    let nextCalled = false;

    await protectStudent(req, res, () => { nextCalled = true; });

    assert.strictEqual(nextCalled, true);
    assert.strictEqual(req.student._id.toString(), activeStudent._id.toString());
    assert.strictEqual(req.user._id.toString(), activeStudent._id.toString());
  });

  // ─── 4. Protected Student Profile Controller Tests ───────────────────────
  console.log("\n[4] Protected Profile Endpoint Tests");

  await test("getStudentProfile returns sanitized profile and never includes password", async () => {
    const sampleStudent = createSampleStudent({ password: validHashedPassword });

    const req = { student: sampleStudent };
    const res = createMockRes();

    await getStudentProfile(req, res);

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.student);

    const st = res.body.student;
    assert.strictEqual(st.id.toString(), sampleStudent._id.toString());
    assert.strictEqual(st.studentIdNumber, "AIST-STD-2026-0001");
    assert.strictEqual(st.rollNumber, "BCS-F26-001");
    assert.strictEqual(st.fullName, "Muhammad Ali Siddiqui");
    assert.strictEqual(st.phone, "03001234567");
    assert.strictEqual(st.email, "ali.siddiqui@student.apex.edu.pk");
    assert.strictEqual(st.program.programName, "BS Computer Science");
    assert.strictEqual(st.status, "active");
    assert.strictEqual(st.password, undefined, "Profile must never expose password hash");
  });

  await test("getStudentProfile rejects request when req.student is missing with HTTP 401", async () => {
    const req = {};
    const res = createMockRes();

    await getStudentProfile(req, res);

    assert.strictEqual(res.statusCode, 401);
    assert.strictEqual(res.body.success, false);
  });

  restoreMocks();

  console.log("\n─────────────────────────────────────────────────────────────");
  console.log(`Student Auth Results: ${passed} / ${total} passed (${total - passed} failed)`);
  console.log("─────────────────────────────────────────────────────────────\n");

  if (passed !== total) process.exit(1);
}

if (require.main === module) {
  runStudentAuthTests().catch((err) => {
    console.error("Student auth test fatal error:", err);
    process.exit(1);
  });
}

module.exports = { runStudentAuthTests };
