const assert = require("assert");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { signToken, verifyToken, getJwtSecret } = require("../utils/jwt");
const { registerApplicant, loginApplicant } = require("../controllers/applicantController");
const { protect } = require("../middleware/authMiddleware");
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

async function runTests() {
  console.log("─────────────────────────────────────────────────────────────");
  console.log("Running Authentication & Security Middleware Test Suite");
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
  const dummyPhone = "03001234567";
  const dummyPassword = "ValidPassword123!";
  const dummyHashedPassword = await bcrypt.hash(dummyPassword, 10);

  // ─── 1. JWT Unit Tests ──────────────────────────────────────────────────
  console.log("[1] JWT Signing & Verification Tests");

  await test("signToken generates a valid 3-part HS256 JWT containing claims", async () => {
    const token = signToken({ id: dummyApplicantId, phone: dummyPhone, role: "applicant" });
    assert.strictEqual(typeof token, "string");
    const parts = token.split(".");
    assert.strictEqual(parts.length, 3, "Token must have 3 parts separated by dots");

    const decoded = verifyToken(token);
    assert.strictEqual(decoded.id, dummyApplicantId);
    assert.strictEqual(decoded.phone, dummyPhone);
    assert.strictEqual(decoded.role, "applicant");
    assert.strictEqual(typeof decoded.iat, "number");
    assert.strictEqual(typeof decoded.exp, "number");
    assert(decoded.exp > decoded.iat, "Expiration must be greater than issue timestamp");
  });

  await test("verifyToken rejects tokens signed with a different secret", async () => {
    const token = signToken({ id: dummyApplicantId }, { secret: "wrong_secret_key" });
    assert.throws(
      () => verifyToken(token),
      (err) => err.name === "JsonWebTokenError" && err.message.includes("signature")
    );
  });

  await test("verifyToken rejects expired tokens", async () => {
    const token = signToken({ id: dummyApplicantId }, { expiresInSeconds: -10 });
    assert.throws(
      () => verifyToken(token),
      (err) => err.name === "TokenExpiredError"
    );
  });

  await test("verifyToken rejects malformed token strings", async () => {
    assert.throws(
      () => verifyToken("not.a.valid.jwt.token"),
      (err) => err.name === "JsonWebTokenError"
    );
    assert.throws(
      () => verifyToken(""),
      (err) => err.name === "JsonWebTokenError"
    );
  });

  await test("Missing JWT_SECRET fails safely without leaking secrets", async () => {
    const originalSecret = process.env.JWT_SECRET;
    delete process.env.JWT_SECRET;
    try {
      assert.throws(
        () => getJwtSecret(),
        (err) => err.message.includes("JWT_SECRET is not configured")
      );
    } finally {
      process.env.JWT_SECRET = originalSecret;
    }
  });

  // ─── 2. Applicant Registration Controller Tests ─────────────────────────
  console.log("\n[2] Applicant Registration Controller Tests");

  await test("registerApplicant rejects short or missing fullName with 400", async () => {
    const req = { body: { fullName: "Al", phone: dummyPhone, password: dummyPassword } };
    const res = createMockRes();
    await registerApplicant(req, res);
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.body.success, false);
    assert(res.body.message.includes("Full name must be at least 3 characters"));
  });

  await test("registerApplicant rejects non-11-digit phone numbers with 400", async () => {
    const req = { body: { fullName: "Valid Name", phone: "030012345", password: dummyPassword } };
    const res = createMockRes();
    await registerApplicant(req, res);
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.body.success, false);
    assert(res.body.message.includes("Phone must be exactly 11 digits"));
  });

  await test("registerApplicant rejects invalid email format with 400", async () => {
    const req = { body: { fullName: "Valid Name", phone: dummyPhone, email: "invalid-email-no-at", password: dummyPassword } };
    const res = createMockRes();
    await registerApplicant(req, res);
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.body.success, false);
    assert(res.body.message.includes("Invalid email address"));
  });

  await test("registerApplicant rejects password shorter than 6 characters with 400", async () => {
    const req = { body: { fullName: "Valid Name", phone: dummyPhone, password: "123" } };
    const res = createMockRes();
    await registerApplicant(req, res);
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.body.success, false);
    assert(res.body.message.includes("Password must be at least 6 characters"));
  });

  await test("registerApplicant returns 409 when phone number is already registered", async () => {
    const originalFindOne = Applicant.findOne;
    Applicant.findOne = () => ({
      lean: async () => ({ _id: dummyApplicantId, phone: dummyPhone }),
    });

    try {
      const req = { body: { fullName: "Duplicate User", phone: dummyPhone, password: dummyPassword } };
      const res = createMockRes();
      await registerApplicant(req, res);
      assert.strictEqual(res.statusCode, 409);
      assert.strictEqual(res.body.code, "PHONE_ALREADY_REGISTERED");
      assert(res.body.message.includes("already registered"));
    } finally {
      Applicant.findOne = originalFindOne;
    }
  });

  await test("registerApplicant returns 503 when database operation times out", async () => {
    const originalFindOne = Applicant.findOne;
    const originalCreate = Applicant.create;
    Applicant.findOne = () => ({ lean: async () => null });
    Applicant.create = async () => {
      const err = new Error("Operation `applicants.insertOne()` buffering timed out after 10000ms");
      err.name = "MongooseError";
      throw err;
    };

    try {
      const req = { body: { fullName: "Valid User", phone: dummyPhone, password: dummyPassword } };
      const res = createMockRes();
      await registerApplicant(req, res);
      assert.strictEqual(res.statusCode, 503);
      assert.strictEqual(res.body.code, "DATABASE_UNAVAILABLE");
      assert(res.body.message.includes("Database service is temporarily unavailable"));
    } finally {
      Applicant.findOne = originalFindOne;
      Applicant.create = originalCreate;
    }
  });

  await test("registerApplicant returns 201 with applicant profile on success", async () => {
    const originalFindOne = Applicant.findOne;
    const originalCreate = Applicant.create;
    Applicant.findOne = () => ({ lean: async () => null });
    Applicant.create = async (data) => ({
      _id: dummyApplicantId,
      fullName: data.fullName,
      phone: data.phone,
      email: data.email || null,
      createdAt: new Date().toISOString(),
    });

    try {
      const req = { body: { fullName: "Hamza Khan", phone: "03001234567", password: "Password123" } };
      const res = createMockRes();
      await registerApplicant(req, res);
      assert.strictEqual(res.statusCode, 201);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.applicant.phone, "03001234567");
      assert.strictEqual(res.body.applicant.fullName, "Hamza Khan");
      assert.strictEqual(res.body.applicant.id, dummyApplicantId);
    } finally {
      Applicant.findOne = originalFindOne;
      Applicant.create = originalCreate;
    }
  });

  // ─── 3. Login Controller Tests ──────────────────────────────────────────
  console.log("\n[3] Applicant Login Controller Tests");

  await test("loginApplicant rejects malformed or missing phone numbers with 400", async () => {
    const req = { body: { phone: "12345", password: dummyPassword } };
    const res = createMockRes();
    await loginApplicant(req, res);
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.body.success, false);
  });

  await test("loginApplicant rejects missing password with 400", async () => {
    const req = { body: { phone: dummyPhone, password: "" } };
    const res = createMockRes();
    await loginApplicant(req, res);
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.body.success, false);
  });

  await test("loginApplicant returns generic 401 for unknown phone (prevents enumeration)", async () => {
    // Stub findOne to simulate non-existent applicant
    const originalFindOne = Applicant.findOne;
    Applicant.findOne = () => ({
      select: async () => null,
    });

    try {
      const req = { body: { phone: "03009999999", password: dummyPassword } };
      const res = createMockRes();
      await loginApplicant(req, res);
      assert.strictEqual(res.statusCode, 401);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.message, "Invalid mobile number or password");
    } finally {
      Applicant.findOne = originalFindOne;
    }
  });

  await test("loginApplicant returns exact same generic 401 for incorrect password", async () => {
    // Stub findOne with mock applicant
    const originalFindOne = Applicant.findOne;
    Applicant.findOne = () => ({
      select: async () => ({
        _id: dummyApplicantId,
        phone: dummyPhone,
        fullName: "Test User",
        password: dummyHashedPassword,
        comparePassword: async (pwd) => bcrypt.compare(pwd, dummyHashedPassword),
      }),
    });

    try {
      const req = { body: { phone: dummyPhone, password: "WrongPassword123" } };
      const res = createMockRes();
      await loginApplicant(req, res);
      assert.strictEqual(res.statusCode, 401);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.message, "Invalid mobile number or password");
    } finally {
      Applicant.findOne = originalFindOne;
    }
  });

  await test("loginApplicant returns 200, JWT token, and sanitized profile for valid credentials", async () => {
    const originalFindOne = Applicant.findOne;
    Applicant.findOne = () => ({
      select: async () => ({
        _id: dummyApplicantId,
        phone: dummyPhone,
        fullName: "Test Candidate",
        email: "test@example.com",
        password: dummyHashedPassword,
        comparePassword: async (pwd) => bcrypt.compare(pwd, dummyHashedPassword),
      }),
    });

    try {
      const req = { body: { phone: dummyPhone, password: dummyPassword } };
      const res = createMockRes();
      await loginApplicant(req, res);
      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(typeof res.body.token, "string");
      assert.strictEqual(res.body.applicant.fullName, "Test Candidate");
      assert.strictEqual(res.body.applicant.phone, dummyPhone);
      // Ensure password or hash is NEVER returned
      assert.strictEqual(res.body.applicant.password, undefined);
      assert.strictEqual(res.body.password, undefined);
    } finally {
      Applicant.findOne = originalFindOne;
    }
  });

  // ─── 3. Auth Middleware Security Tests ──────────────────────────────────
  console.log("\n[3] Secure Auth Middleware Tests");

  await test("protect middleware rejects request with missing Authorization header", async () => {
    const req = { headers: {} };
    const res = createMockRes();
    let nextCalled = false;
    await protect(req, res, () => { nextCalled = true; });
    assert.strictEqual(res.statusCode, 401);
    assert.strictEqual(nextCalled, false);
  });

  await test("protect middleware rejects forged raw x-applicant-id header without valid token", async () => {
    const req = { headers: { "x-applicant-id": dummyApplicantId } };
    const res = createMockRes();
    let nextCalled = false;
    await protect(req, res, () => { nextCalled = true; });
    assert.strictEqual(res.statusCode, 401, "Raw x-applicant-id must be rejected");
    assert.strictEqual(nextCalled, false);
  });

  await test("protect middleware rejects token with invalid or forged signature", async () => {
    const forgedToken = signToken({ id: dummyApplicantId }, { secret: "attacker_secret" });
    const req = { headers: { authorization: `Bearer ${forgedToken}` } };
    const res = createMockRes();
    let nextCalled = false;
    await protect(req, res, () => { nextCalled = true; });
    assert.strictEqual(res.statusCode, 401);
    assert.strictEqual(nextCalled, false);
  });

  await test("protect middleware rejects expired token", async () => {
    const expiredToken = signToken({ id: dummyApplicantId }, { expiresInSeconds: -10 });
    const req = { headers: { authorization: `Bearer ${expiredToken}` } };
    const res = createMockRes();
    let nextCalled = false;
    await protect(req, res, () => { nextCalled = true; });
    assert.strictEqual(res.statusCode, 401);
    assert(res.body.message.includes("expired"));
    assert.strictEqual(nextCalled, false);
  });

  await test("protect middleware rejects attempt to spoof x-applicant-id conflicting with token", async () => {
    const legitimateToken = signToken({ id: dummyApplicantId });
    const victimApplicantId = new mongoose.Types.ObjectId().toString();

    const req = {
      headers: {
        authorization: `Bearer ${legitimateToken}`,
        "x-applicant-id": victimApplicantId, // Attacker trying to spoof victim's ID
      },
    };
    const res = createMockRes();
    let nextCalled = false;
    await protect(req, res, () => { nextCalled = true; });
    assert.strictEqual(res.statusCode, 403, "Conflicting header ID must be forbidden");
    assert.strictEqual(nextCalled, false);
  });

  await test("protect middleware successfully authenticates valid token and populates req.user", async () => {
    const validToken = signToken({ id: dummyApplicantId, phone: dummyPhone });
    const originalFindById = Applicant.findById;
    const mockApplicantDoc = {
      _id: dummyApplicantId,
      id: dummyApplicantId,
      fullName: "Verified Applicant",
      phone: dummyPhone,
    };
    Applicant.findById = async (id) => (id === dummyApplicantId ? mockApplicantDoc : null);

    try {
      const req = {
        headers: {
          authorization: `Bearer ${validToken}`,
        },
      };
      const res = createMockRes();
      let nextCalled = false;
      await protect(req, res, () => { nextCalled = true; });

      assert.strictEqual(nextCalled, true, "next() must be called for valid token");
      assert.strictEqual(req.user._id, dummyApplicantId);
      assert.strictEqual(req.user.fullName, "Verified Applicant");
    } finally {
      Applicant.findById = originalFindById;
    }
  });

  // ─── Test Summary ───────────────────────────────────────────────────────
  console.log("\n─────────────────────────────────────────────────────────────");
  console.log(`Test Results: ${passed}/${total} passed (${total - passed} failed)`);
  console.log("─────────────────────────────────────────────────────────────\n");

  if (passed !== total) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Unhandled test runner error:", err);
  process.exit(1);
});
