const assert = require("assert");
const mongoose = require("mongoose");
const FeeVoucher = require("../models/FeeVoucher");
const { getStudentVouchers } = require("../controllers/studentController");
const { protectStudent } = require("../middleware/authMiddleware");
const { signToken } = require("../utils/jwt");

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

async function runAllTests() {
  console.log("─────────────────────────────────────────────────────────────");
  console.log("Running Student Fee Vouchers API Test Suite (Step 7.3 Task 2)");
  console.log("─────────────────────────────────────────────────────────────\n");

  const originalFind = FeeVoucher.find;

  try {
    // ─── 1. Identity Derivation & Cross-Student Isolation ────────────────────
    console.log("[1] Identity Derivation & Cross-Student Isolation");

    await runTest("Authenticated student receives only their own vouchers", async () => {
      const studentAId = new mongoose.Types.ObjectId();
      const studentBId = new mongoose.Types.ObjectId();

      const voucherA1 = {
        _id: new mongoose.Types.ObjectId(),
        voucherNumber: "VCH-2026-0001",
        studentId: studentAId,
        studentRollNumber: "BCS-F26-001",
        studentName: "Student Alpha",
        programName: "BS Computer Science",
        academicSessionName: "Fall 2026",
        items: [{ _id: new mongoose.Types.ObjectId(), title: "Tuition Fee", category: "tuition", amountPKR: 45000 }],
        subtotalPKR: 45000,
        discountPKR: 0,
        totalAmountPKR: 45000,
        paidAmountPKR: 45000,
        status: "paid",
        issueDate: new Date("2026-08-01"),
        originalDueDate: new Date("2026-08-15"),
        finalAllowedDate: new Date("2026-08-15"),
        paymentRecords: [
          {
            receiptNumber: "RCP-001",
            amountPaidPKR: 45000,
            paymentMethod: "Bank Challan",
            paymentDate: new Date("2026-08-10"),
          },
        ],
      };

      const voucherA2 = {
        _id: new mongoose.Types.ObjectId(),
        voucherNumber: "VCH-2026-0002",
        studentId: studentAId,
        studentRollNumber: "BCS-F26-001",
        studentName: "Student Alpha",
        programName: "BS Computer Science",
        academicSessionName: "Fall 2026",
        items: [{ _id: new mongoose.Types.ObjectId(), title: "Exam Fee", category: "examination", amountPKR: 5000 }],
        subtotalPKR: 5000,
        discountPKR: 0,
        totalAmountPKR: 5000,
        paidAmountPKR: 0,
        status: "unpaid",
        issueDate: new Date("2026-08-01"),
        originalDueDate: new Date("2026-08-20"),
        finalAllowedDate: new Date("2026-08-20"),
        paymentRecords: [],
      };

      const voucherB1 = {
        _id: new mongoose.Types.ObjectId(),
        voucherNumber: "VCH-2026-0099",
        studentId: studentBId,
        studentRollNumber: "BCS-F26-099",
        studentName: "Student Beta",
        programName: "BS Computer Science",
        items: [{ title: "Tuition Fee", category: "tuition", amountPKR: 50000 }],
        totalAmountPKR: 50000,
        paidAmountPKR: 0,
        status: "unpaid",
      };

      const allVouchers = [voucherA1, voucherA2, voucherB1];

      // Mock FeeVoucher.find to enforce standard mongoose query chaining
      FeeVoucher.find = function (query) {
        return {
          sort() {
            return {
              lean: async () => {
                return allVouchers.filter(
                  (v) => v.studentId.toString() === query.studentId.toString()
                );
              },
            };
          },
        };
      };

      const req = {
        student: { _id: studentAId, rollNumber: "BCS-F26-001", fullName: "Student Alpha" },
      };
      const res = createMockRes();

      await getStudentVouchers(req, res);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.vouchers.length, 2);
      assert.strictEqual(res.body.vouchers[0].voucherNumber, "VCH-2026-0001");
      assert.strictEqual(res.body.vouchers[1].voucherNumber, "VCH-2026-0002");

      // Verify Student B's voucher is nowhere in Student A's result
      const containsStudentB = res.body.vouchers.some(
        (v) => v.studentId === studentBId.toString() || v.voucherNumber === "VCH-2026-0099"
      );
      assert.strictEqual(containsStudentB, false, "Student A must never see Student B's vouchers");
    });

    await runTest("Ignores client-supplied studentId parameter and enforces req.student ownership", async () => {
      const authenticatedStudentId = new mongoose.Types.ObjectId();
      const spoofedStudentId = new mongoose.Types.ObjectId();
      let queryUsed = null;

      FeeVoucher.find = function (query) {
        queryUsed = query;
        return {
          sort() {
            return {
              lean: async () => [],
            };
          },
        };
      };

      const req = {
        student: { _id: authenticatedStudentId },
        query: { studentId: spoofedStudentId.toString() },
        params: { studentId: spoofedStudentId.toString() },
        headers: { "x-student-id": spoofedStudentId.toString() },
      };
      const res = createMockRes();

      await getStudentVouchers(req, res);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(
        queryUsed.studentId.toString(),
        authenticatedStudentId.toString(),
        "Query must strictly filter by req.student._id, ignoring any client-supplied IDs"
      );
    });

    // ─── 2. Authentication Rejection Tests ────────────────────────────────────
    console.log("\n[2] Authentication & Session Rejection");

    await runTest("Rejects request with HTTP 401 when req.student is missing", async () => {
      const req = { student: null, user: null };
      const res = createMockRes();

      await getStudentVouchers(req, res);

      assert.strictEqual(res.statusCode, 401);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.message, "Unauthorized: student session not found");
    });

    await runTest("protectStudent middleware rejects unauthenticated requests with HTTP 401", async () => {
      const req = { headers: {} };
      const res = createMockRes();
      let nextCalled = false;

      await protectStudent(req, res, () => {
        nextCalled = true;
      });

      assert.strictEqual(nextCalled, false);
      assert.strictEqual(res.statusCode, 401);
      assert.ok(res.body.message.includes("missing token"));
    });

    await runTest("protectStudent middleware rejects applicant or admin tokens with HTTP 403", async () => {
      const applicantToken = signToken({ id: "app-123", role: "applicant" });
      const req = { headers: { authorization: `Bearer ${applicantToken}` } };
      const res = createMockRes();
      let nextCalled = false;

      await protectStudent(req, res, () => {
        nextCalled = true;
      });

      assert.strictEqual(nextCalled, false);
      assert.strictEqual(res.statusCode, 403);
      assert.ok(res.body.message.includes("Student role required"));
    });

    // ─── 3. Empty Voucher List & Zeroed Summaries ──────────────────────────────
    console.log("\n[3] Empty Voucher List Handling");

    await runTest("Empty voucher list returns valid zeroed summaries", async () => {
      const studentId = new mongoose.Types.ObjectId();

      FeeVoucher.find = function () {
        return {
          sort() {
            return {
              lean: async () => [],
            };
          },
        };
      };

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

    // ─── 4. Summary Totals & Status Calculations ──────────────────────────────
    console.log("\n[4] Status-Specific Calculations & Outstanding Amounts");

    await runTest("Correctly calculates summaries across paid, unpaid, partially_paid, overdue, extended, and cancelled vouchers", async () => {
      const studentId = new mongoose.Types.ObjectId();

      const mockVouchers = [
        // 1. Paid voucher (total 50,000, paid 50,000) -> outstanding: 0, pending: no
        {
          _id: new mongoose.Types.ObjectId(),
          voucherNumber: "VCH-PAID-01",
          studentId,
          totalAmountPKR: 50000,
          paidAmountPKR: 50000,
          status: "paid",
        },
        // 2. Unpaid voucher (total 45,000, paid 0) -> outstanding: 45,000, pending: yes
        {
          _id: new mongoose.Types.ObjectId(),
          voucherNumber: "VCH-UNPAID-01",
          studentId,
          totalAmountPKR: 45000,
          paidAmountPKR: 0,
          status: "unpaid",
        },
        // 3. Partially paid voucher (total 50,000, paid 20,000) -> outstanding: 30,000, pending: yes
        {
          _id: new mongoose.Types.ObjectId(),
          voucherNumber: "VCH-PARTIAL-01",
          studentId,
          totalAmountPKR: 50000,
          paidAmountPKR: 20000,
          status: "partially_paid",
        },
        // 4. Overdue voucher (total 25,000, paid 0) -> outstanding: 25,000, pending: yes
        {
          _id: new mongoose.Types.ObjectId(),
          voucherNumber: "VCH-OVERDUE-01",
          studentId,
          totalAmountPKR: 25000,
          paidAmountPKR: 0,
          status: "overdue",
        },
        // 5. Extended voucher (total 40,000, paid 0) -> outstanding: 40,000, pending: yes
        {
          _id: new mongoose.Types.ObjectId(),
          voucherNumber: "VCH-EXTENDED-01",
          studentId,
          totalAmountPKR: 40000,
          paidAmountPKR: 0,
          status: "extended",
        },
        // 6. Cancelled voucher (total 35,000, paid 0) -> voided liability: outstanding: 0, pending: no
        {
          _id: new mongoose.Types.ObjectId(),
          voucherNumber: "VCH-CANCELLED-01",
          studentId,
          totalAmountPKR: 35000,
          paidAmountPKR: 0,
          status: "cancelled",
        },
      ];

      FeeVoucher.find = function () {
        return {
          sort() {
            return {
              lean: async () => mockVouchers,
            };
          },
        };
      };

      const req = { student: { _id: studentId } };
      const res = createMockRes();

      await getStudentVouchers(req, res);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.vouchers.length, 6);

      // Verify individual outstanding calculations
      const vouchersMap = new Map(res.body.vouchers.map((v) => [v.voucherNumber, v]));
      assert.strictEqual(vouchersMap.get("VCH-PAID-01").outstandingAmountPKR, 0);
      assert.strictEqual(vouchersMap.get("VCH-UNPAID-01").outstandingAmountPKR, 45000);
      assert.strictEqual(vouchersMap.get("VCH-PARTIAL-01").outstandingAmountPKR, 30000);
      assert.strictEqual(vouchersMap.get("VCH-OVERDUE-01").outstandingAmountPKR, 25000);
      assert.strictEqual(vouchersMap.get("VCH-EXTENDED-01").outstandingAmountPKR, 40000);
      assert.strictEqual(vouchersMap.get("VCH-CANCELLED-01").outstandingAmountPKR, 0);

      // Verify aggregate summary counters
      // Total vouchers: 6
      assert.strictEqual(res.body.summary.totalVouchers, 6);
      // Unpaid/pending count: unpaid (1) + partially_paid (1) + overdue (1) + extended (1) = 4
      assert.strictEqual(res.body.summary.unpaidCount, 4);
      assert.strictEqual(res.body.summary.pendingCount, 4);
      // Total outstanding: 45000 + 30000 + 25000 + 40000 = 140000
      assert.strictEqual(res.body.summary.totalOutstandingPKR, 140000);
      // Total paid: 50000 + 20000 = 70000
      assert.strictEqual(res.body.summary.totalPaidPKR, 70000);
    });

    await runTest("Safely clamps outstanding amount when paidAmount exceeds totalAmount", async () => {
      const studentId = new mongoose.Types.ObjectId();

      // Case where paidAmount is somehow greater than totalAmount
      const mockVoucher = {
        _id: new mongoose.Types.ObjectId(),
        voucherNumber: "VCH-OVERPAID",
        studentId,
        totalAmountPKR: 10000,
        paidAmountPKR: 12000,
        status: "paid",
      };

      FeeVoucher.find = function () {
        return {
          sort() {
            return {
              lean: async () => [mockVoucher],
            };
          },
        };
      };

      const req = { student: { _id: studentId } };
      const res = createMockRes();

      await getStudentVouchers(req, res);

      assert.strictEqual(res.statusCode, 200);
      // max(total - paid, 0) => max(10000 - 12000, 0) = 0
      assert.strictEqual(res.body.vouchers[0].outstandingAmountPKR, 0);
    });

    // ─── 5. Error Handling & Security Sanitization ────────────────────────────
    console.log("\n[5] Safe Error Handling & Sanitization");

    await runTest("Handles database or query errors safely with HTTP 500", async () => {
      const studentId = new mongoose.Types.ObjectId();

      FeeVoucher.find = function () {
        return {
          sort() {
            return {
              lean: async () => {
                throw new Error("MongoDB connection timeout during find()");
              },
            };
          },
        };
      };

      const req = { student: { _id: studentId } };
      const res = createMockRes();

      await getStudentVouchers(req, res);

      assert.strictEqual(res.statusCode, 500);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.message, "Server error retrieving fee vouchers");
    });

  } finally {
    FeeVoucher.find = originalFind;
  }

  console.log("\n─────────────────────────────────────────────────────────────");
  console.log(`Student Vouchers API Results: ${passedCount} / ${passedCount + failedCount} passed (${failedCount} failed)`);
  console.log("─────────────────────────────────────────────────────────────\n");

  if (failedCount > 0) {
    process.exit(1);
  }
}

if (require.main === module) {
  runAllTests().catch((err) => {
    console.error("Test execution fatal error:", err);
    process.exit(1);
  });
}

module.exports = { runAllTests };
