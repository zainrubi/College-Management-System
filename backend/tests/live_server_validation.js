const assert = require("assert");
const http = require("http");
require("dotenv").config();
const { signToken } = require("../utils/jwt");

// Helper to send HTTP requests to live server
function request(options, bodyData) {
  return new Promise((resolve, reject) => {
    const defaultHeaders = {};
    if (bodyData !== undefined && !options.headers?.["Content-Type"]) {
      defaultHeaders["Content-Type"] = "application/json";
    }

    const req = http.request(
      {
        hostname: "localhost",
        port: 5000,
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
      },
      (res) => {
        let raw = "";
        res.on("data", (chunk) => (raw += chunk));
        res.on("end", () => {
          let json = null;
          try {
            json = JSON.parse(raw);
          } catch {
            // Non-JSON response
          }
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            raw,
            body: json,
          });
        });
      }
    );

    req.on("error", reject);

    if (bodyData !== undefined) {
      req.write(typeof bodyData === "string" ? bodyData : JSON.stringify(bodyData));
    }
    req.end();
  });
}

async function runLiveValidation() {
  console.log("═════════════════════════════════════════════════════════════");
  console.log("LIVE HTTP SERVER VALIDATION (http://localhost:5000)");
  console.log("═════════════════════════════════════════════════════════════\n");

  let passed = 0;
  let total = 0;

  async function check(name, fn) {
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

  // 1. Missing or malformed request body
  await check("Malformed request body returns HTTP 400 (SyntaxError caught by server)", async () => {
    const res = await request(
      {
        path: "/api/applicants/login",
        method: "POST",
        headers: { "Content-Type": "application/json" },
      },
      "not-valid-json-string"
    );
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.body.message, "Request body must be valid JSON");
  });

  await check("Missing request body (empty object) returns HTTP 400 validation error", async () => {
    const res = await request(
      { path: "/api/applicants/login", method: "POST" },
      {}
    );
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.body.success, false);
    assert(res.body.message.includes("11-digit mobile number"));
  });

  // 2. Invalid phone format
  await check("Invalid phone format returns HTTP 400", async () => {
    const res = await request(
      { path: "/api/applicants/login", method: "POST" },
      { phone: "12345", password: "SomePassword123" }
    );
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.body.success, false);
  });

  // 3. Unknown phone number
  await check("Unknown phone number returns generic HTTP 401", async () => {
    const res = await request(
      { path: "/api/applicants/login", method: "POST" },
      { phone: "03999999999", password: "SomePassword123" }
    );
    assert.strictEqual(res.statusCode, 401);
    assert.strictEqual(res.body.success, false);
    assert.strictEqual(res.body.message, "Invalid mobile number or password");
  });

  // 4. Incorrect password for existing account
  await check("Incorrect password for existing account returns identical generic HTTP 401", async () => {
    const res = await request(
      { path: "/api/applicants/login", method: "POST" },
      { phone: "03111234567", password: "DeliberatelyIncorrectPassword999" }
    );
    assert.strictEqual(res.statusCode, 401);
    assert.strictEqual(res.body.success, false);
    assert.strictEqual(res.body.message, "Invalid mobile number or password");
  });

  // 5. Missing JWT on protected route
  await check("Missing JWT on protected endpoint returns HTTP 401", async () => {
    const res = await request({ path: "/api/applications/me", method: "GET" });
    assert.strictEqual(res.statusCode, 401);
    assert.strictEqual(res.body.message, "Authentication required: missing token");
  });

  // 6. Malformed JWT on protected route
  await check("Malformed JWT token returns HTTP 401", async () => {
    const res = await request({
      path: "/api/applications/me",
      method: "GET",
      headers: { Authorization: "Bearer this.is.malformed" },
    });
    assert.strictEqual(res.statusCode, 401);
    assert(res.body.message.includes("invalid or forged token"));
  });

  // 7. Forged signature on protected route
  await check("Forged JWT (tampered signature) returns HTTP 401", async () => {
    const forgedToken = signToken(
      { id: "64f100000000000000000001" },
      { secret: "attacker_unauthorized_key" }
    );
    const res = await request({
      path: "/api/applications/me",
      method: "GET",
      headers: { Authorization: `Bearer ${forgedToken}` },
    });
    assert.strictEqual(res.statusCode, 401);
    assert(res.body.message.includes("invalid or forged token"));
  });

  // 8. Expired JWT on protected route
  await check("Expired JWT returns HTTP 401 token has expired", async () => {
    const expiredToken = signToken(
      { id: "64f100000000000000000001" },
      { expiresInSeconds: -60 }
    );
    const res = await request({
      path: "/api/applications/me",
      method: "GET",
      headers: { Authorization: `Bearer ${expiredToken}` },
    });
    assert.strictEqual(res.statusCode, 401);
    assert.strictEqual(res.body.message, "Authentication required: token has expired");
  });

  // 9. Attempt to bypass auth using raw x-applicant-id header
  await check("Raw x-applicant-id header without Bearer token is rejected with HTTP 401", async () => {
    const res = await request({
      path: "/api/applications/me",
      method: "GET",
      headers: { "x-applicant-id": "64f100000000000000000001" },
    });
    assert.strictEqual(res.statusCode, 401);
    assert.strictEqual(res.body.message, "Authentication required: missing token");
  });

  // 10. Attempt to spoof identity with conflicting x-applicant-id header
  await check("Valid Bearer token with conflicting x-applicant-id is rejected with HTTP 403 Forbidden", async () => {
    const legitToken = signToken({ id: "64f100000000000000000001" });
    const res = await request({
      path: "/api/applications/me",
      method: "GET",
      headers: {
        Authorization: `Bearer ${legitToken}`,
        "x-applicant-id": "64f100000000000000000002", // Conflicting victim ID
      },
    });
    assert.strictEqual(res.statusCode, 403);
    assert.strictEqual(
      res.body.message,
      "Forbidden: request header ID does not match authenticated token"
    );
  });

  console.log("\n═════════════════════════════════════════════════════════════");
  console.log(`Live Validation Results: ${passed}/${total} passed (${total - passed} failed)`);
  console.log("═════════════════════════════════════════════════════════════\n");

  if (passed !== total) process.exit(1);
}

runLiveValidation().catch((err) => {
  console.error("Live validation script error:", err.message);
  process.exit(1);
});
