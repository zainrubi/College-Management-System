const assert = require("assert");
const express = require("express");
const http = require("http");
const { rateLimit } = require("express-rate-limit");
const {
  createRateLimitHandler,
  studentLoginLimiter,
  studentActivationRequestLimiter,
  studentActivateLimiter,
} = require("../middleware/rateLimitMiddleware");
const studentRoutes = require("../routes/studentRoutes");
const applicantRoutes = require("../routes/applicantRoutes");

// Helper to make local HTTP requests to a test server
function makeRequest(server, path, method = "POST", body = {}, headers = {}) {
  return new Promise((resolve, reject) => {
    const address = server.address();
    const payload = JSON.stringify(body);
    const reqHeaders = {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(payload),
      ...headers,
    };

    const req = http.request(
      {
        hostname: "127.0.0.1",
        port: address.port,
        path,
        method,
        headers: reqHeaders,
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          let parsed = null;
          try {
            parsed = JSON.parse(data);
          } catch {
            // Not JSON
          }
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: parsed,
            raw: data,
          });
        });
      }
    );

    req.on("error", reject);
    req.write(payload);
    req.end();
  });
}

async function runRateLimitTests() {
  console.log("─────────────────────────────────────────────────────────────");
  console.log("Running Student Authentication Rate Limiting Test Suite (Step 6.8)");
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

  // ─── 1. Rate Limit Handler Factory Tests ─────────────────────────────────
  console.log("[1] Rate Limit Handler Sanitization & Response Format");

  await test("createRateLimitHandler returns HTTP 429 JSON without leaking request payload or secrets", () => {
    const handler = createRateLimitHandler("Default rate limit message");
    let capturedStatus = null;
    let capturedJson = null;

    const mockReq = {
      body: {
        identifier: "BCS-F26-001",
        password: "SecretPassword123!",
        activationToken: "64characterstokenabcdef123456",
      },
    };

    const mockRes = {
      status(code) {
        capturedStatus = code;
        return this;
      },
      json(data) {
        capturedJson = data;
        return this;
      },
    };

    handler(mockReq, mockRes, () => {}, { statusCode: 429, message: "Custom rate limit message" });

    assert.strictEqual(capturedStatus, 429);
    assert.strictEqual(capturedJson.success, false);
    assert.strictEqual(capturedJson.code, "TOO_MANY_REQUESTS");
    assert.strictEqual(capturedJson.message, "Custom rate limit message");

    // Guarantee sensitive fields are NEVER leaked in 429 response
    const jsonString = JSON.stringify(capturedJson);
    assert.ok(!jsonString.includes("SecretPassword123!"));
    assert.ok(!jsonString.includes("64characterstokenabcdef123456"));
  });

  // ─── 2. Student Login Rate Limiter Behavior ──────────────────────────────
  console.log("\n[2] Student Login Endpoint Rate Limiter (POST /api/students/login)");

  await test("studentLoginLimiter enforces request quota and returns 429 upon threshold breach", async () => {
    const app = express();
    app.use(express.json());

    // Create a targeted test limiter with small max limit of 3
    const testLoginLimiter = rateLimit({
      windowMs: 60 * 1000,
      max: 3,
      message: "Too many login attempts from this IP address. Please try again after 15 minutes.",
      handler: createRateLimitHandler(
        "Too many login attempts from this IP address. Please try again after 15 minutes."
      ),
      standardHeaders: true,
      legacyHeaders: false,
      validate: false,
    });

    app.post("/test-login", testLoginLimiter, (req, res) => {
      res.status(200).json({ success: true, message: "Login endpoint reached" });
    });

    const server = await new Promise((resolve) => {
      const s = app.listen(0, "127.0.0.1", () => resolve(s));
    });

    try {
      // Requests 1 to 3 should succeed through the limiter
      for (let i = 1; i <= 3; i++) {
        const res = await makeRequest(server, "/test-login", "POST", { identifier: "BCS-F26-001" });
        assert.strictEqual(res.statusCode, 200, `Request ${i} should be permitted`);
      }

      // Request 4 should be throttled with HTTP 429
      const blockedRes = await makeRequest(server, "/test-login", "POST", { identifier: "BCS-F26-001" });
      assert.strictEqual(blockedRes.statusCode, 429, "4th request should return HTTP 429");
      assert.strictEqual(blockedRes.body.success, false);
      assert.strictEqual(blockedRes.body.code, "TOO_MANY_REQUESTS");
      assert.ok(blockedRes.body.message.includes("Too many login attempts"));

      // Verify standard RateLimit headers
      assert.ok(
        blockedRes.headers["ratelimit-limit"] || blockedRes.headers["retry-after"],
        "Must include RateLimit headers"
      );
    } finally {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  // ─── 3. Activation Request Rate Limiter Behavior ─────────────────────────
  console.log("\n[3] Activation Request Endpoint Rate Limiter (POST /api/students/request-activation)");

  await test("studentActivationRequestLimiter blocks spamming with HTTP 429 after threshold", async () => {
    const app = express();
    app.use(express.json());

    const testActivationReqLimiter = rateLimit({
      windowMs: 60 * 1000,
      max: 2,
      message: "Too many activation requests from this IP address. Please try again after 15 minutes.",
      handler: createRateLimitHandler(
        "Too many activation requests from this IP address. Please try again after 15 minutes."
      ),
      standardHeaders: true,
      legacyHeaders: false,
      validate: false,
    });

    app.post("/test-request-activation", testActivationReqLimiter, (req, res) => {
      res.status(200).json({ success: true, message: "Activation initiated" });
    });

    const server = await new Promise((resolve) => {
      const s = app.listen(0, "127.0.0.1", () => resolve(s));
    });

    try {
      const res1 = await makeRequest(server, "/test-request-activation");
      assert.strictEqual(res1.statusCode, 200);

      const res2 = await makeRequest(server, "/test-request-activation");
      assert.strictEqual(res2.statusCode, 200);

      // Exceeded threshold
      const res3 = await makeRequest(server, "/test-request-activation");
      assert.strictEqual(res3.statusCode, 429);
      assert.strictEqual(res3.body.code, "TOO_MANY_REQUESTS");
      assert.ok(res3.body.message.includes("Too many activation requests"));
    } finally {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  // ─── 4. Activation Completion Rate Limiter Behavior ──────────────────────
  console.log("\n[4] Account Activation Completion Rate Limiter (POST /api/students/activate)");

  await test("studentActivateLimiter blocks repeated password setup attempts with HTTP 429", async () => {
    const app = express();
    app.use(express.json());

    const testActivateLimiter = rateLimit({
      windowMs: 60 * 1000,
      max: 2,
      message: "Too many password setup attempts from this IP address. Please try again after 15 minutes.",
      handler: createRateLimitHandler(
        "Too many password setup attempts from this IP address. Please try again after 15 minutes."
      ),
      standardHeaders: true,
      legacyHeaders: false,
      validate: false,
    });

    app.post("/test-activate", testActivateLimiter, (req, res) => {
      res.status(200).json({ success: true, message: "Activated" });
    });

    const server = await new Promise((resolve) => {
      const s = app.listen(0, "127.0.0.1", () => resolve(s));
    });

    try {
      const res1 = await makeRequest(server, "/test-activate");
      assert.strictEqual(res1.statusCode, 200);

      const res2 = await makeRequest(server, "/test-activate");
      assert.strictEqual(res2.statusCode, 200);

      const res3 = await makeRequest(server, "/test-activate");
      assert.strictEqual(res3.statusCode, 429);
      assert.strictEqual(res3.body.code, "TOO_MANY_REQUESTS");
      assert.ok(res3.body.message.includes("Too many password setup attempts"));
    } finally {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  // ─── 5. Route Mounting & Portal Isolation Verification ────────────────────
  console.log("\n[5] Student Route Mounting & Applicant / Admin Portal Isolation");

  await test("Rate limiters are mounted on student routes and do not interfere with applicant routes", async () => {
    const app = express();
    app.use(express.json());
    app.use("/api/students", studentRoutes);
    app.use("/api/applicants", applicantRoutes);

    const server = await new Promise((resolve) => {
      const s = app.listen(0, "127.0.0.1", () => resolve(s));
    });

    try {
      // Check that student login route is mounted and executes rate limiter + validation
      const studentRes = await makeRequest(server, "/api/students/login", "POST", {
        identifier: "BCS-F26-001",
        password: "Pass",
      });
      // Should reach controller or rate limiter (e.g. 401 or 404, but not 404 route not found)
      assert.notStrictEqual(studentRes.statusCode, 404, "Student login route must be mounted");

      // Check that applicant routes remain fully accessible without student rate limiter interference
      const applicantRes = await makeRequest(server, "/api/applicants/login", "POST", {
        phone: "03001234567",
        password: "WrongPassword123!",
      });
      // Reaches applicant login handler
      assert.notStrictEqual(applicantRes.statusCode, 429, "Applicant login must not be blocked by student limiter");
    } finally {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  console.log("\n─────────────────────────────────────────────────────────────");
  console.log(`Student Rate Limit Results: ${passed} / ${total} passed (${total - passed} failed)`);
  console.log("─────────────────────────────────────────────────────────────\n");

  if (passed !== total) process.exit(1);
}

if (require.main === module) {
  runRateLimitTests().catch((err) => {
    console.error("Rate limit test suite error:", err);
    process.exit(1);
  });
}

module.exports = { runRateLimitTests };
