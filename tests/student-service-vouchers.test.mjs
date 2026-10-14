import assert from "node:assert";
import {
  getStudentVouchers,
  getStudentToken,
  setStudentToken,
  removeStudentToken,
  STUDENT_TOKEN_STORAGE_KEY,
  APPLICANT_TOKEN_STORAGE_KEY,
} from "../lib/services/student-service.ts";

// In-memory mock localStorage implementation for Node test environment
function createMockStorage() {
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
    console.error(`     Error: ${error.message}\n`);
    failedCount++;
  }
}

async function runSuite() {
  console.log("─────────────────────────────────────────────────────────────");
  console.log("Running Student Fee Voucher Service Test Suite (Step 7.3 Task 3)");
  console.log("─────────────────────────────────────────────────────────────\n");

  const originalFetch = globalThis.fetch;
  const mockStorage = createMockStorage();
  globalThis.window = { localStorage: mockStorage };

  try {
    console.log("[1] Authentication & Token Handling");

    await runTest("Rejects with UNAUTHORIZED when no student token is provided or stored", async () => {
      mockStorage.clear();
      await assert.rejects(
        async () => {
          await getStudentVouchers();
        },
        (err) => {
          assert.strictEqual(err.code, "UNAUTHORIZED");
          assert.ok(err.message.includes("No active student authentication token found"));
          return true;
        }
      );
    });

    await runTest("Uses custom token if provided explicitly in function call", async () => {
      mockStorage.clear();
      let capturedAuthHeader = null;

      globalThis.fetch = async (url, options) => {
        capturedAuthHeader = options.headers?.Authorization;
        return {
          ok: true,
          status: 200,
          json: async () => ({
            success: true,
            vouchers: [],
            summary: {
              totalVouchers: 0,
              unpaidCount: 0,
              pendingCount: 0,
              totalOutstandingPKR: 0,
              totalPaidPKR: 0,
            },
          }),
        };
      };

      const customToken = "explicitly_provided_jwt_token_abc";
      const result = await getStudentVouchers(customToken);

      assert.strictEqual(capturedAuthHeader, `Bearer ${customToken}`);
      assert.strictEqual(result.success, true);
    });

    await runTest("Reads student token from cms_student_jwt_token storage key by default", async () => {
      mockStorage.clear();
      mockStorage.setItem(STUDENT_TOKEN_STORAGE_KEY, "stored_student_jwt_token_xyz");
      let capturedAuthHeader = null;

      globalThis.fetch = async (url, options) => {
        capturedAuthHeader = options.headers?.Authorization;
        return {
          ok: true,
          status: 200,
          json: async () => ({
            success: true,
            vouchers: [],
            summary: {
              totalVouchers: 0,
              unpaidCount: 0,
              pendingCount: 0,
              totalOutstandingPKR: 0,
              totalPaidPKR: 0,
            },
          }),
        };
      };

      await getStudentVouchers();
      assert.strictEqual(capturedAuthHeader, "Bearer stored_student_jwt_token_xyz");
    });

    console.log("\n[2] Successful Voucher Fetching & Summary Parsing");

    await runTest("Successfully fetches, maps, and returns populated vouchers and summary", async () => {
      mockStorage.setItem(STUDENT_TOKEN_STORAGE_KEY, "active_student_token");

      const backendVoucher = {
        id: "vch_001",
        voucherNumber: "VCH-2026-0042",
        studentId: "std_001",
        studentRollNumber: "BCS-F26-042",
        studentName: "Ayesha Noor",
        programName: "BS Computer Science",
        academicSessionName: "Fall 2026",
        items: [
          { id: "item_1", title: "Tuition Fee", category: "tuition", amountPKR: 45000 },
          { id: "item_2", title: "Lab Charges", category: "lab", amountPKR: 5000 },
        ],
        subtotalPKR: 50000,
        discountPKR: 5000,
        totalAmountPKR: 45000,
        paidAmountPKR: 15000,
        outstandingAmountPKR: 30000,
        issueDate: "2026-09-01T00:00:00.000Z",
        originalDueDate: "2026-09-20T00:00:00.000Z",
        finalAllowedDate: "2026-09-30T00:00:00.000Z",
        concession: {
          isGranted: true,
          originalDueDate: "2026-09-20T00:00:00.000Z",
          newAllowedDate: "2026-09-30T00:00:00.000Z",
          discountAmountPKR: 5000,
          reason: "Merit scholarship",
          grantedByAdminName: "Prof. Tariq",
        },
        paymentRecords: [
          {
            id: "pay_rec_1",
            receiptNumber: "RCP-2026-001",
            transactionReference: "TXN-987654",
            amountPaidPKR: 15000,
            paymentDate: "2026-09-15T00:00:00.000Z",
            paymentMethod: "Bank Challan",
            verifiedByAdminName: "Accounts Office",
          },
        ],
        status: "partially_paid",
        remarks: "First installment settled",
        createdAt: "2026-09-01T10:00:00.000Z",
        updatedAt: "2026-09-15T12:00:00.000Z",
      };

      globalThis.fetch = async (url) => {
        assert.ok(url.includes("/api/students/vouchers"));
        return {
          ok: true,
          status: 200,
          json: async () => ({
            success: true,
            vouchers: [backendVoucher],
            summary: {
              totalVouchers: 1,
              unpaidCount: 1,
              pendingCount: 1,
              totalOutstandingPKR: 30000,
              totalPaidPKR: 15000,
            },
          }),
        };
      };

      const result = await getStudentVouchers();

      assert.strictEqual(result.success, true);
      assert.strictEqual(result.vouchers.length, 1);
      assert.strictEqual(result.vouchers[0].id, "vch_001");
      assert.strictEqual(result.vouchers[0].voucherNumber, "VCH-2026-0042");
      assert.strictEqual(result.vouchers[0].studentRollNumber, "BCS-F26-042");
      assert.strictEqual(result.vouchers[0].outstandingAmountPKR, 30000);
      assert.strictEqual(result.vouchers[0].items.length, 2);
      assert.strictEqual(result.vouchers[0].paymentRecords.length, 1);
      assert.strictEqual(result.vouchers[0].concession?.isGranted, true);

      assert.strictEqual(result.summary.totalVouchers, 1);
      assert.strictEqual(result.summary.unpaidCount, 1);
      assert.strictEqual(result.summary.pendingCount, 1);
      assert.strictEqual(result.summary.totalOutstandingPKR, 30000);
      assert.strictEqual(result.summary.totalPaidPKR, 15000);
    });

    console.log("\n[3] Empty Result Distinction & No Fake Fallbacks");

    await runTest("Distinguishes empty voucher list from errors and does not inject fake data", async () => {
      mockStorage.setItem(STUDENT_TOKEN_STORAGE_KEY, "active_student_token");

      globalThis.fetch = async () => ({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          vouchers: [],
          summary: {
            totalVouchers: 0,
            unpaidCount: 0,
            pendingCount: 0,
            totalOutstandingPKR: 0,
            totalPaidPKR: 0,
          },
        }),
      });

      const result = await getStudentVouchers();

      assert.strictEqual(result.success, true);
      assert.deepStrictEqual(result.vouchers, []);
      assert.strictEqual(result.summary.totalVouchers, 0);
      assert.strictEqual(result.summary.totalOutstandingPKR, 0);
      assert.strictEqual(result.summary.totalPaidPKR, 0);
    });

    console.log("\n[4] Authentication Error Handling (401 & 403)");

    await runTest("Handles HTTP 401: clears student token, preserves applicant token, throws SESSION_EXPIRED", async () => {
      mockStorage.setItem(STUDENT_TOKEN_STORAGE_KEY, "expired_student_token");
      mockStorage.setItem(APPLICANT_TOKEN_STORAGE_KEY, "applicant_token_should_stay");

      globalThis.fetch = async () => ({
        ok: false,
        status: 401,
        json: async () => ({
          success: false,
          message: "Student session expired or unauthorized. Please sign in again.",
        }),
      });

      await assert.rejects(
        async () => {
          await getStudentVouchers();
        },
        (err) => {
          assert.strictEqual(err.code, "SESSION_EXPIRED");
          assert.strictEqual(err.status, 401);
          assert.ok(err.message.includes("Student session expired"));
          return true;
        }
      );

      // Student token must be removed
      assert.strictEqual(mockStorage.getItem(STUDENT_TOKEN_STORAGE_KEY), null);
      // Applicant token must remain untouched
      assert.strictEqual(mockStorage.getItem(APPLICANT_TOKEN_STORAGE_KEY), "applicant_token_should_stay");
    });

    await runTest("Handles HTTP 403: clears student token and throws SESSION_EXPIRED", async () => {
      mockStorage.setItem(STUDENT_TOKEN_STORAGE_KEY, "forbidden_student_token");

      globalThis.fetch = async () => ({
        ok: false,
        status: 403,
        json: async () => ({
          success: false,
          message: "Access forbidden",
        }),
      });

      await assert.rejects(
        async () => {
          await getStudentVouchers();
        },
        (err) => {
          assert.strictEqual(err.code, "SESSION_EXPIRED");
          assert.strictEqual(err.status, 403);
          return true;
        }
      );

      assert.strictEqual(mockStorage.getItem(STUDENT_TOKEN_STORAGE_KEY), null);
    });

    console.log("\n[5] Rate Limiting Error Handling (HTTP 429)");

    await runTest("Handles HTTP 429: throws RATE_LIMITED with status 429 and keeps student token intact", async () => {
      mockStorage.setItem(STUDENT_TOKEN_STORAGE_KEY, "rate_limited_student_token");

      globalThis.fetch = async () => ({
        ok: false,
        status: 429,
        json: async () => ({
          success: false,
          code: "TOO_MANY_REQUESTS",
          message: "Too many requests. Please try again later.",
        }),
      });

      await assert.rejects(
        async () => {
          await getStudentVouchers();
        },
        (err) => {
          assert.strictEqual(err.code, "RATE_LIMITED");
          assert.strictEqual(err.status, 429);
          assert.ok(err.message.includes("Too many requests"));
          return true;
        }
      );

      // Rate limiting is temporary; user session should NOT be wiped
      assert.strictEqual(mockStorage.getItem(STUDENT_TOKEN_STORAGE_KEY), "rate_limited_student_token");
    });

    console.log("\n[6] Network Failure & Server Error Handling");

    await runTest("Handles network error by throwing NETWORK_ERROR", async () => {
      mockStorage.setItem(STUDENT_TOKEN_STORAGE_KEY, "active_student_token");

      globalThis.fetch = async () => {
        throw new TypeError("Failed to fetch");
      };

      await assert.rejects(
        async () => {
          await getStudentVouchers();
        },
        (err) => {
          assert.strictEqual(err.code, "NETWORK_ERROR");
          assert.ok(err.message.includes("Unable to connect to college server"));
          return true;
        }
      );
    });

    await runTest("Handles HTTP 500 server error by throwing SERVER_ERROR", async () => {
      mockStorage.setItem(STUDENT_TOKEN_STORAGE_KEY, "active_student_token");

      globalThis.fetch = async () => ({
        ok: false,
        status: 500,
        json: async () => ({
          success: false,
          message: "Server error retrieving fee vouchers",
        }),
      });

      await assert.rejects(
        async () => {
          await getStudentVouchers();
        },
        (err) => {
          assert.strictEqual(err.code, "SERVER_ERROR");
          assert.strictEqual(err.status, 500);
          assert.ok(err.message.includes("Server error"));
          return true;
        }
      );
    });

    console.log("\n[7] Malformed Server Response Validation");

    await runTest("Rejects when success is false or missing in 200 OK response", async () => {
      mockStorage.setItem(STUDENT_TOKEN_STORAGE_KEY, "active_student_token");

      globalThis.fetch = async () => ({
        ok: true,
        status: 200,
        json: async () => ({
          success: false,
          vouchers: [],
          summary: { totalVouchers: 0, totalOutstandingPKR: 0 },
        }),
      });

      await assert.rejects(
        async () => {
          await getStudentVouchers();
        },
        (err) => {
          assert.strictEqual(err.code, "MALFORMED_RESPONSE");
          return true;
        }
      );
    });

    await runTest("Rejects when vouchers array is missing or not an Array", async () => {
      mockStorage.setItem(STUDENT_TOKEN_STORAGE_KEY, "active_student_token");

      globalThis.fetch = async () => ({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          vouchers: null,
          summary: { totalVouchers: 0, totalOutstandingPKR: 0 },
        }),
      });

      await assert.rejects(
        async () => {
          await getStudentVouchers();
        },
        (err) => {
          assert.strictEqual(err.code, "MALFORMED_RESPONSE");
          return true;
        }
      );
    });

    await runTest("Rejects when summary counters are missing or not numbers", async () => {
      mockStorage.setItem(STUDENT_TOKEN_STORAGE_KEY, "active_student_token");

      globalThis.fetch = async () => ({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          vouchers: [],
          summary: { totalVouchers: "not-a-number" },
        }),
      });

      await assert.rejects(
        async () => {
          await getStudentVouchers();
        },
        (err) => {
          assert.strictEqual(err.code, "MALFORMED_RESPONSE");
          return true;
        }
      );
    });

    console.log("\n[8] Token Privacy & Secret Redaction");

    await runTest("Never exposes JWT token in error messages across all error conditions", async () => {
      const sensitiveToken = "super_secret_jwt_token_payload_9876543210";
      mockStorage.setItem(STUDENT_TOKEN_STORAGE_KEY, sensitiveToken);

      const errorGenerators = [
        async () => {
          // Network error
          globalThis.fetch = async () => { throw new Error("DNS resolution failed"); };
          await getStudentVouchers();
        },
        async () => {
          // 401 error
          globalThis.fetch = async () => ({
            ok: false,
            status: 401,
            json: async () => ({ message: "Unauthorized" }),
          });
          await getStudentVouchers();
        },
        async () => {
          // 429 error
          globalThis.fetch = async () => ({
            ok: false,
            status: 429,
            json: async () => ({ message: "Rate limit reached" }),
          });
          await getStudentVouchers();
        },
        async () => {
          // 500 error
          globalThis.fetch = async () => ({
            ok: false,
            status: 500,
            json: async () => ({ message: "Database connection failed" }),
          });
          await getStudentVouchers();
        },
        async () => {
          // Malformed
          globalThis.fetch = async () => ({
            ok: true,
            status: 200,
            json: async () => ({ corrupt: true }),
          });
          await getStudentVouchers();
        },
      ];

      for (const gen of errorGenerators) {
        try {
          await gen();
          assert.fail("Generator should have thrown");
        } catch (err) {
          assert.strictEqual(err.message.includes(sensitiveToken), false);
          assert.strictEqual(JSON.stringify(err).includes(sensitiveToken), false);
        }
      }
    });

  } finally {
    globalThis.fetch = originalFetch;
    delete globalThis.window;
  }

  console.log("\n─────────────────────────────────────────────────────────────");
  console.log(`Student Fee Voucher Service Results: ${passedCount} / ${passedCount + failedCount} passed (${failedCount} failed)`);
  console.log("─────────────────────────────────────────────────────────────\n");

  if (failedCount > 0) {
    process.exit(1);
  }
}

runSuite().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
