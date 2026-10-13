const assert = require("assert");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { signToken, verifyToken } = require("../utils/jwt");
const {
  requestStudentActivation,
  activateStudentAccount,
  loginStudent,
} = require("../controllers/studentController");
const Student = require("../models/Student");
const Applicant = require("../models/Applicant");

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
  const applicantId = overrides.applicantId || new mongoose.Types.ObjectId();
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
    phone: overrides.phone || "03001234567",
    email: overrides.email || "ali@example.com",
    program: {
      academicLevel: "Undergraduate",
      programName: "BS Computer Science",
      shift: "Morning",
      campus: "Kanganpur",
      session: "Fall 2026",
      currentSemesterOrYear: 1,
    },
    status: overrides.status || "active",
    isActivated: overrides.isActivated || false,
    activatedAt: overrides.activatedAt || undefined,
    password: overrides.password, // undefined for newly enrolled
    activationTokenHash: overrides.activationTokenHash,
    activationTokenExpires: overrides.activationTokenExpires,
  };

  doc.save = async function () {
    if (this.password && !this.password.startsWith("$2a$") && !this.password.startsWith("$2b$")) {
      this.password = await bcrypt.hash(this.password, 10);
    }
    return this;
  };

  doc.comparePassword = async function (candidatePassword) {
    if (!this.password) {
      throw new Error("Password field not selected");
    }
    return bcrypt.compare(candidatePassword, this.password);
  };

  return doc;
}

// Helper to create mock Applicant document
function createSampleApplicant(overrides = {}) {
  const applicantId = overrides._id || new mongoose.Types.ObjectId();

  const doc = {
    _id: applicantId,
    fullName: "Muhammad Ali Siddiqui",
    phone: overrides.phone || "03001234567",
    email: "ali@example.com",
    password: overrides.password || "$2a$10$hashedapplicantpassword123456",
  };

  doc.comparePassword = async function (candidatePassword) {
    if (!this.password) {
      throw new Error("Password field not selected");
    }
    return bcrypt.compare(candidatePassword, this.password);
  };

  return doc;
}

async function runStudentActivationTests() {
  console.log("─────────────────────────────────────────────────────────────");
  console.log("Running Student Account Activation Test Suite (Step 6.4)");
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

  const applicantRawPassword = "ApplicantSecret123!";
  const applicantHashedPassword = await bcrypt.hash(applicantRawPassword, 10);

  const origFindOneStudent = Student.findOne;
  const origFindByIdApplicant = Applicant.findById;

  function restoreMocks() {
    Student.findOne = origFindOneStudent;
    Applicant.findById = origFindByIdApplicant;
  }

  // ─── 1. Activation Request Validation & Identity Verification ───────────
  console.log("[1] Activation Request Validation & Identity Verification");

  await test("requestStudentActivation rejects missing student identifier with HTTP 400", async () => {
    const res = createMockRes();
    await requestStudentActivation({ body: {} }, res);

    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.body.success, false);
    assert.ok(res.body.message.includes("student identifier"));
  });

  await test("requestStudentActivation returns 404 for unknown student identifier", async () => {
    Student.findOne = () => ({
      select: async () => null,
    });

    const res = createMockRes();
    await requestStudentActivation({ body: { identifier: "UNKNOWN-001" } }, res);

    assert.strictEqual(res.statusCode, 404);
    assert.strictEqual(res.body.success, false);
    assert.ok(res.body.message.includes("not found"));
  });

  await test("requestStudentActivation rejects already activated account with HTTP 400", async () => {
    const activatedStudent = createSampleStudent({
      isActivated: true,
      password: "$2a$10$existinghashedpassword123",
    });

    Student.findOne = () => ({
      select: async () => activatedStudent,
    });

    const res = createMockRes();
    await requestStudentActivation({ body: { identifier: "BCS-F26-001" } }, res);

    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.body.code, "ALREADY_ACTIVATED");
    assert.ok(res.body.message.includes("already activated"));
  });

  await test("requestStudentActivation rejects suspended student with HTTP 403", async () => {
    const suspendedStudent = createSampleStudent({ status: "suspended" });

    Student.findOne = () => ({
      select: async () => suspendedStudent,
    });

    const res = createMockRes();
    await requestStudentActivation({ body: { identifier: "BCS-F26-001" } }, res);

    assert.strictEqual(res.statusCode, 403);
    assert.ok(res.body.message.includes("suspended"));
  });

  await test("requestStudentActivation rejects request without applicant credentials or session", async () => {
    const student = createSampleStudent();

    Student.findOne = () => ({
      select: async () => student,
    });

    const res = createMockRes();
    await requestStudentActivation({ body: { identifier: "BCS-F26-001" } }, res);

    assert.strictEqual(res.statusCode, 400);
    assert.ok(res.body.message.includes("registered mobile number and Applicant account password"));
  });

  await test("requestStudentActivation rejects invalid applicant password with HTTP 401", async () => {
    const applicant = createSampleApplicant({ phone: "03001234567", password: applicantHashedPassword });
    const student = createSampleStudent({ applicantId: applicant._id, phone: "03001234567" });

    Student.findOne = () => ({
      select: async () => student,
    });
    Applicant.findById = () => ({
      select: async () => applicant,
    });

    const res = createMockRes();
    await requestStudentActivation({
      body: {
        identifier: "BCS-F26-001",
        phone: "03001234567",
        applicantPassword: "WrongPassword!",
      },
    }, res);

    assert.strictEqual(res.statusCode, 401);
    assert.strictEqual(res.body.success, false);
    assert.ok(res.body.message.includes("invalid applicant password"));
  });

  await test("requestStudentActivation rejects mismatching applicant phone with HTTP 401", async () => {
    const applicant = createSampleApplicant({ phone: "03001234567", password: applicantHashedPassword });
    const student = createSampleStudent({ applicantId: applicant._id, phone: "03001234567" });

    Student.findOne = () => ({
      select: async () => student,
    });
    Applicant.findById = () => ({
      select: async () => applicant,
    });

    const res = createMockRes();
    await requestStudentActivation({
      body: {
        identifier: "BCS-F26-001",
        phone: "03119999999", // Different phone
        applicantPassword: applicantRawPassword,
      },
    }, res);

    assert.strictEqual(res.statusCode, 401);
    assert.ok(res.body.message.includes("credentials do not match"));
  });

  // ─── 2. Successful Token Issuance ────────────────────────────────────────
  console.log("\n[2] Cryptographically Secure Activation Token Issuance");

  await test("requestStudentActivation generates secure token when verified via applicant credentials", async () => {
    const applicant = createSampleApplicant({ phone: "03001234567", password: applicantHashedPassword });
    const student = createSampleStudent({ applicantId: applicant._id, phone: "03001234567" });

    Student.findOne = () => ({
      select: async () => student,
    });
    Applicant.findById = () => ({
      select: async () => applicant,
    });

    const res = createMockRes();
    await requestStudentActivation({
      body: {
        identifier: "AIST-STD-2026-0001",
        phone: "03001234567",
        applicantPassword: applicantRawPassword,
      },
    }, res);

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.activationToken, "Must return raw activation token to user");
    assert.strictEqual(res.body.activationToken.length, 64, "Token should be 32 bytes hex (64 chars)");
    assert.strictEqual(res.body.expiresInMinutes, 15);

    // Verify stored token is SHA-256 hash, NOT raw token
    const expectedHash = crypto.createHash("sha256").update(res.body.activationToken).digest("hex");
    assert.strictEqual(student.activationTokenHash, expectedHash);
    assert(student.activationTokenExpires > new Date());
  });

  await test("requestStudentActivation generates token when verified via authenticated applicant JWT", async () => {
    const applicantId = new mongoose.Types.ObjectId();
    const student = createSampleStudent({ applicantId });

    Student.findOne = () => ({
      select: async () => student,
    });

    const applicantToken = signToken({ id: applicantId.toString(), role: "applicant" });

    const req = {
      headers: { authorization: `Bearer ${applicantToken}` },
      body: { identifier: "BCS-F26-001" },
    };
    const res = createMockRes();

    await requestStudentActivation(req, res);

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.activationToken);
  });

  await test("requestStudentActivation rejects applicant JWT if applicant does not own the student record", async () => {
    const applicantIdOwner = new mongoose.Types.ObjectId();
    const applicantIdAttacker = new mongoose.Types.ObjectId();
    const student = createSampleStudent({ applicantId: applicantIdOwner });

    Student.findOne = () => ({
      select: async () => student,
    });

    const attackerToken = signToken({ id: applicantIdAttacker.toString(), role: "applicant" });

    const req = {
      headers: { authorization: `Bearer ${attackerToken}` },
      body: { identifier: "BCS-F26-001" },
    };
    const res = createMockRes();

    await requestStudentActivation(req, res);

    assert.strictEqual(res.statusCode, 403);
    assert.ok(res.body.message.includes("does not own this student record"));
  });

  // ─── 3. Account Activation & Password Setup ─────────────────────────────
  console.log("\n[3] Account Activation & Password Setup (activateStudentAccount)");

  await test("activateStudentAccount rejects missing token or short password with HTTP 400", async () => {
    const res1 = createMockRes();
    await activateStudentAccount({ body: {} }, res1);
    assert.strictEqual(res1.statusCode, 400);

    const res2 = createMockRes();
    await activateStudentAccount({ body: { activationToken: "token123", password: "123" } }, res2);
    assert.strictEqual(res2.statusCode, 400);
    assert.ok(res2.body.message.includes("at least 6 characters"));

    const res3 = createMockRes();
    await activateStudentAccount({
      body: { activationToken: "token123", password: "Password123!", confirmPassword: "MismatchPassword!" },
    }, res3);
    assert.strictEqual(res3.statusCode, 400);
    assert.ok(res3.body.message.includes("do not match"));
  });

  await test("activateStudentAccount rejects invalid or unrecognized activation token", async () => {
    Student.findOne = () => ({
      select: async () => null,
    });

    const res = createMockRes();
    await activateStudentAccount({
      body: { activationToken: "non_existent_token_1234567890", password: "NewStudentPassword123!" },
    }, res);

    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.body.success, false);
    assert.ok(res.body.message.includes("Invalid or unrecognized"));
  });

  await test("activateStudentAccount rejects expired activation token and clears it", async () => {
    const expiredStudent = createSampleStudent({
      activationTokenHash: "some_hash",
      activationTokenExpires: new Date(Date.now() - 60000), // Expired 1 min ago
    });

    Student.findOne = () => ({
      select: async () => expiredStudent,
    });

    const res = createMockRes();
    await activateStudentAccount({
      body: { activationToken: "expired_token_abc", password: "NewStudentPassword123!" },
    }, res);

    assert.strictEqual(res.statusCode, 400);
    assert.ok(res.body.message.includes("token has expired"));
    assert.strictEqual(expiredStudent.activationTokenHash, undefined, "Expired token must be wiped");
  });

  await test("activateStudentAccount sets bcrypt password, marks isActivated, and wipes token", async () => {
    const rawToken = "valid_activation_token_hex_string_123456";
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

    const student = createSampleStudent({
      activationTokenHash: tokenHash,
      activationTokenExpires: new Date(Date.now() + 10 * 60 * 1000), // Valid for 10 mins
    });

    Student.findOne = () => ({
      select: async () => student,
    });

    const newStudentPassword = "OfficialStudent2026!";

    const res = createMockRes();
    await activateStudentAccount({
      body: { activationToken: rawToken, password: newStudentPassword },
    }, res);

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.student.isActivated, true);
    assert.strictEqual(res.body.student.password, undefined, "Password must not be returned");

    // Verify document mutations
    assert.strictEqual(student.isActivated, true);
    assert(student.activatedAt instanceof Date);
    assert.strictEqual(student.activationTokenHash, undefined, "Token must be invalidated");
    assert.strictEqual(student.activationTokenExpires, undefined);
    assert.ok(student.password.startsWith("$2a$") || student.password.startsWith("$2b$"), "Password must be bcrypt hashed");

    // Verify password matches bcrypt comparison
    const isMatch = await student.comparePassword(newStudentPassword);
    assert.strictEqual(isMatch, true);
  });

  await test("Single-use guarantee: Re-using the same activation token is immediately rejected", async () => {
    // When the student has already been activated and token wiped
    Student.findOne = () => ({
      select: async () => null, // Token hash no longer matches any document
    });

    const res = createMockRes();
    await activateStudentAccount({
      body: { activationToken: "valid_activation_token_hex_string_123456", password: "AnotherPassword123!" },
    }, res);

    assert.strictEqual(res.statusCode, 400);
    assert.ok(res.body.message.includes("Invalid or unrecognized activation token"));
  });

  // ─── 4. End-to-End Post-Activation Login ─────────────────────────────────
  console.log("\n[4] Post-Activation Student Login Verification");

  await test("Student can log in immediately after successful activation", async () => {
    const activeStudentPassword = "MyActivatedPassword123!";
    const hashedPassword = await bcrypt.hash(activeStudentPassword, 10);

    const activatedStudent = createSampleStudent({
      isActivated: true,
      password: hashedPassword,
    });

    Student.findOne = () => ({
      select: async () => activatedStudent,
    });

    const res = createMockRes();
    await loginStudent({
      body: { identifier: activatedStudent.studentIdNumber, password: activeStudentPassword },
    }, res);

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.token);

    const decoded = verifyToken(res.body.token);
    assert.strictEqual(decoded.role, "student");
    assert.strictEqual(decoded.studentIdNumber, activatedStudent.studentIdNumber);
  });

  restoreMocks();

  console.log("\n─────────────────────────────────────────────────────────────");
  console.log(`Student Activation Results: ${passed} / ${total} passed (${total - passed} failed)`);
  console.log("─────────────────────────────────────────────────────────────\n");

  if (passed !== total) process.exit(1);
}

if (require.main === module) {
  runStudentActivationTests().catch((err) => {
    console.error("Student activation test fatal error:", err);
    process.exit(1);
  });
}

module.exports = { runStudentActivationTests };
