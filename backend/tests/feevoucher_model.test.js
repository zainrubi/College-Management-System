const assert = require("assert");
const mongoose = require("mongoose");
const FeeVoucher = require("../models/FeeVoucher");

function getValidFeeVoucherData(overrides = {}) {
  const dummyStudentId = new mongoose.Types.ObjectId();
  const baseDueDate = new Date("2026-09-15T00:00:00.000Z");

  return {
    studentId: dummyStudentId,
    voucherNumber: "VCH-2026-0001",
    studentRollNumber: "BCS-F26-001",
    studentName: "Muhammad Ali Siddiqui",
    programName: "BS Computer Science",
    academicSessionName: "Fall 2026",
    items: [
      {
        title: "Tuition Fee (Semester 1)",
        category: "tuition",
        amountPKR: 45000,
      },
      {
        title: "Semester Examination Fee",
        category: "examination",
        amountPKR: 5000,
      },
      {
        title: "Computer Lab Maintenance",
        category: "lab",
        amountPKR: 4000,
      },
    ],
    subtotalPKR: 54000,
    discountPKR: 4000,
    totalAmountPKR: 50000,
    paidAmountPKR: 0,
    issueDate: new Date("2026-08-20T00:00:00.000Z"),
    originalDueDate: baseDueDate,
    finalAllowedDate: baseDueDate,
    status: "unpaid",
    ...overrides,
  };
}

async function validateDoc(voucher) {
  try {
    await voucher.validate();
    return undefined;
  } catch (err) {
    return err;
  }
}

async function runFeeVoucherModelTests() {
  console.log("─────────────────────────────────────────────────────────────");
  console.log("Running FeeVoucher Model & Schema Test Suite");
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

  // ─── 1. Complete Document Validation & Defaults ─────────────────────────────
  console.log("[1] Valid Instantiation & Default Value Handling");

  await test("1. Complete valid fee voucher payload validates successfully in-memory", async () => {
    const voucher = new FeeVoucher(getValidFeeVoucherData());
    const err = await validateDoc(voucher);
    assert.strictEqual(err, undefined, "Expected no validation errors for valid voucher");
    assert.strictEqual(voucher.voucherNumber, "VCH-2026-0001");
    assert.strictEqual(voucher.status, "unpaid", "Default status should be unpaid");
    assert.strictEqual(voucher.paidAmountPKR, 0, "Default paidAmountPKR should be 0");
    assert.strictEqual(voucher.discountPKR, 4000);
    assert.strictEqual(voucher.items.length, 3);
  });

  await test("2. Default values populate when optional fields are omitted", async () => {
    const minimalData = {
      studentId: new mongoose.Types.ObjectId(),
      voucherNumber: "VCH-2026-0002",
      studentRollNumber: "BCS-F26-002",
      studentName: "Zahid Qureshi",
      programName: "FSc Pre-Medical",
      items: [
        {
          title: "Quarterly Tuition Installment",
          category: "tuition",
          amountPKR: 25000,
        },
      ],
      originalDueDate: new Date("2026-09-30"),
    };

    const voucher = new FeeVoucher(minimalData);
    const err = await validateDoc(voucher);
    assert.strictEqual(err, undefined, "Minimal payload must pass validation");
    assert.strictEqual(voucher.status, "unpaid", "Default status should be unpaid");
    assert.strictEqual(voucher.paidAmountPKR, 0, "Default paidAmountPKR should be 0");
    assert.strictEqual(voucher.discountPKR, 0, "Default discountPKR should be 0");
    assert.strictEqual(voucher.subtotalPKR, 25000, "Subtotal should auto-calculate from items");
    assert.strictEqual(voucher.totalAmountPKR, 25000, "Total should auto-calculate from subtotal - discount");
    assert.strictEqual(
      voucher.finalAllowedDate.getTime(),
      voucher.originalDueDate.getTime(),
      "finalAllowedDate should auto-initialize to originalDueDate"
    );
    assert.strictEqual(voucher.academicSessionName, undefined, "academicSessionName should not be hardcoded");
    assert.strictEqual(voucher.concession.isGranted, false);
    assert.deepStrictEqual(voucher.paymentRecords, []);
  });

  // ─── 2. Required Field Constraints ──────────────────────────────────────────
  console.log("\n[2] Required Field Constraints");

  await test("3. Fails validation when studentId is missing", async () => {
    const data = getValidFeeVoucherData({ studentId: undefined });
    const voucher = new FeeVoucher(data);
    const err = await validateDoc(voucher);
    assert(err && err.errors["studentId"], "studentId must be required");
    assert.strictEqual(err.errors["studentId"].message, "Student reference is required");
  });

  await test("4. Fails validation when voucherNumber is missing", async () => {
    const data = getValidFeeVoucherData({ voucherNumber: undefined });
    const voucher = new FeeVoucher(data);
    const err = await validateDoc(voucher);
    assert(err && err.errors["voucherNumber"], "voucherNumber must be required");
    assert.strictEqual(err.errors["voucherNumber"].message, "Voucher number is required");
  });

  await test("5. Fails validation when studentRollNumber is missing", async () => {
    const data = getValidFeeVoucherData({ studentRollNumber: undefined });
    const voucher = new FeeVoucher(data);
    const err = await validateDoc(voucher);
    assert(err && err.errors["studentRollNumber"], "studentRollNumber must be required");
    assert.strictEqual(err.errors["studentRollNumber"].message, "Student roll number is required");
  });

  await test("6. Fails validation when studentName is missing or too short", async () => {
    const dataMissing = getValidFeeVoucherData({ studentName: undefined });
    const errMissing = await validateDoc(new FeeVoucher(dataMissing));
    assert(errMissing && errMissing.errors["studentName"]);

    const dataShort = getValidFeeVoucherData({ studentName: "Ab" });
    const errShort = await validateDoc(new FeeVoucher(dataShort));
    assert(errShort && errShort.errors["studentName"]);
    assert.strictEqual(errShort.errors["studentName"].message, "Student name must be at least 3 characters");
  });

  await test("7. Fails validation when programName is missing", async () => {
    const data = getValidFeeVoucherData({ programName: undefined });
    const voucher = new FeeVoucher(data);
    const err = await validateDoc(voucher);
    assert(err && err.errors["programName"], "programName must be required");
    assert.strictEqual(err.errors["programName"].message, "Program name is required");
  });

  await test("8. Fails validation when items array is empty or missing", async () => {
    const dataEmpty = getValidFeeVoucherData({ items: [] });
    const errEmpty = await validateDoc(new FeeVoucher(dataEmpty));
    assert(errEmpty && errEmpty.errors["items"]);
    assert.strictEqual(errEmpty.errors["items"].message, "Fee voucher must contain at least one fee item");
  });

  await test("9. Fails validation when fee item title is missing", async () => {
    const data = getValidFeeVoucherData({
      items: [{ category: "tuition", amountPKR: 30000 }],
    });
    const voucher = new FeeVoucher(data);
    const err = await validateDoc(voucher);
    assert(err && err.errors["items.0.title"]);
    assert.strictEqual(err.errors["items.0.title"].message, "Fee item title is required");
  });

  await test("10. Fails validation when originalDueDate is missing", async () => {
    const data = getValidFeeVoucherData({ originalDueDate: undefined, finalAllowedDate: undefined });
    const voucher = new FeeVoucher(data);
    const err = await validateDoc(voucher);
    assert(err && err.errors["originalDueDate"], "originalDueDate must be required");
    assert.strictEqual(err.errors["originalDueDate"].message, "Original due date is required");
  });

  // ─── 3. Enum Values & Categories ───────────────────────────────────────────
  console.log("\n[3] Fee Categories & Voucher Status Enumeration");

  await test("11. Accepts all valid FeeCategory enum values", async () => {
    const validCategories = [
      "tuition",
      "admission",
      "examination",
      "transport",
      "event",
      "lab",
      "library",
      "other",
    ];

    for (const cat of validCategories) {
      const voucher = new FeeVoucher(
        getValidFeeVoucherData({
          items: [{ title: `${cat} Fee`, category: cat, amountPKR: 1000 }],
        })
      );
      const err = await validateDoc(voucher);
      assert.strictEqual(err, undefined, `Expected category '${cat}' to be valid`);
    }
  });

  await test("12. Rejects unrecognized fee category enum values", async () => {
    const voucher = new FeeVoucher(
      getValidFeeVoucherData({
        items: [{ title: "Sports Gala", category: "entertainment", amountPKR: 1500 }],
      })
    );
    const err = await validateDoc(voucher);
    assert(err && err.errors["items.0.category"]);
    assert.ok(err.errors["items.0.category"].message.includes("Category must be tuition"));
  });

  await test("13. Accepts all valid VoucherStatus enum values", async () => {
    const validStatuses = ["unpaid", "paid", "partially_paid", "overdue", "extended", "cancelled"];

    for (const status of validStatuses) {
      const voucher = new FeeVoucher(getValidFeeVoucherData({ status }));
      const err = await validateDoc(voucher);
      assert.strictEqual(err, undefined, `Expected status '${status}' to be valid`);
      assert.strictEqual(voucher.status, status);
    }
  });

  await test("14. Rejects invalid voucher status enum values", async () => {
    const voucher = new FeeVoucher(getValidFeeVoucherData({ status: "processing" }));
    const err = await validateDoc(voucher);
    assert(err && err.errors["status"]);
    assert.ok(err.errors["status"].message.includes("Status must be unpaid, paid"));
  });

  // ─── 4. Non-Negative Monetary Constraints ──────────────────────────────────
  console.log("\n[4] Non-Negative Monetary Validation");

  await test("15. Rejects negative amountPKR in fee items", async () => {
    const voucher = new FeeVoucher(
      getValidFeeVoucherData({
        items: [{ title: "Tuition", category: "tuition", amountPKR: -500 }],
      })
    );
    const err = await validateDoc(voucher);
    assert(err && err.errors["items.0.amountPKR"]);
    assert.strictEqual(err.errors["items.0.amountPKR"].message, "Fee item amount cannot be negative");
  });

  await test("16. Rejects negative subtotalPKR, discountPKR, totalAmountPKR, or paidAmountPKR", async () => {
    const voucherSub = new FeeVoucher(getValidFeeVoucherData({ subtotalPKR: -100 }));
    const errSub = await validateDoc(voucherSub);
    assert(errSub && errSub.errors["subtotalPKR"]);

    const voucherDisc = new FeeVoucher(getValidFeeVoucherData({ discountPKR: -50 }));
    const errDisc = await validateDoc(voucherDisc);
    assert(errDisc && errDisc.errors["discountPKR"]);

    const voucherTot = new FeeVoucher(getValidFeeVoucherData({ totalAmountPKR: -10 }));
    const errTot = await validateDoc(voucherTot);
    assert(errTot && errTot.errors["totalAmountPKR"]);

    const voucherPaid = new FeeVoucher(getValidFeeVoucherData({ paidAmountPKR: -5 }));
    const errPaid = await validateDoc(voucherPaid);
    assert(errPaid && errPaid.errors["paidAmountPKR"]);
  });

  // ─── 5. Concession, Extensions & Preserving Original Due Date ───────────────
  console.log("\n[5] Concession Extensions & Preserving Original Due Date");

  await test("17. grantConcession preserves originalDueDate and shifts finalAllowedDate", async () => {
    const originalDate = new Date("2026-08-10T00:00:00.000Z");
    const extensionDate = new Date("2026-08-25T00:00:00.000Z");

    const voucher = new FeeVoucher(
      getValidFeeVoucherData({
        originalDueDate: originalDate,
        finalAllowedDate: originalDate,
        subtotalPKR: 45000,
        discountPKR: 0,
        totalAmountPKR: 45000,
        status: "unpaid",
      })
    );

    // Call grantConcession helper method
    voucher.grantConcession({
      newAllowedDate: extensionDate,
      discountAmountPKR: 5000,
      reason: "Father formal request due to delayed salary disbursement",
      grantedByAdminId: "stf-001",
      grantedByAdminName: "Kashif Shahzad",
    });

    const err = await validateDoc(voucher);
    assert.strictEqual(err, undefined, "Concession extension must pass validation");

    // CRITICAL: originalDueDate must remain completely untouched
    assert.strictEqual(
      voucher.originalDueDate.getTime(),
      originalDate.getTime(),
      "originalDueDate must be preserved unchanged"
    );

    // finalAllowedDate must be updated to the extension deadline
    assert.strictEqual(
      voucher.finalAllowedDate.getTime(),
      extensionDate.getTime(),
      "finalAllowedDate must reflect the extended date"
    );

    // Concession record verification
    assert.strictEqual(voucher.concession.isGranted, true);
    assert.strictEqual(voucher.concession.originalDueDate.getTime(), originalDate.getTime());
    assert.strictEqual(voucher.concession.newAllowedDate.getTime(), extensionDate.getTime());
    assert.strictEqual(voucher.concession.discountAmountPKR, 5000);
    assert.strictEqual(voucher.concession.grantedByAdminId, "stf-001");
    assert.strictEqual(voucher.concession.grantedByAdminName, "Kashif Shahzad");
    assert.strictEqual(voucher.discountPKR, 5000);
    assert.strictEqual(voucher.totalAmountPKR, 40000, "totalAmountPKR should reflect new discount");
    assert.strictEqual(voucher.status, "extended");
  });

  await test("18. Rejects negative discountAmountPKR in concession", async () => {
    const voucher = new FeeVoucher(
      getValidFeeVoucherData({
        concession: {
          isGranted: true,
          discountAmountPKR: -1000,
          reason: "Invalid discount",
        },
      })
    );
    const err = await validateDoc(voucher);
    assert(err && err.errors["concession.discountAmountPKR"]);
    assert.strictEqual(
      err.errors["concession.discountAmountPKR"].message,
      "Concession discount cannot be negative"
    );
  });

  // ─── 6. Payment Records Validation ──────────────────────────────────────────
  console.log("\n[6] Payment Records Subdocuments");

  await test("19. Validates verified payment record entries with offline methods", async () => {
    const voucher = new FeeVoucher(
      getValidFeeVoucherData({
        paidAmountPKR: 50000,
        status: "paid",
        paymentRecords: [
          {
            receiptNumber: "RCP-2026-0001",
            transactionReference: "JC-99882104512",
            amountPaidPKR: 50000,
            paymentMethod: "JazzCash",
            verifiedByAdminId: "stf-001",
            verifiedByAdminName: "Kashif Shahzad",
            verifiedAt: new Date(),
          },
        ],
      })
    );

    const err = await validateDoc(voucher);
    assert.strictEqual(err, undefined, "Valid payment record must pass validation");
    assert.strictEqual(voucher.paymentRecords.length, 1);
    assert.strictEqual(voucher.paymentRecords[0].receiptNumber, "RCP-2026-0001");
    assert.strictEqual(voucher.paymentRecords[0].paymentMethod, "JazzCash");
    assert.strictEqual(voucher.paymentRecords[0].amountPaidPKR, 50000);
  });

  await test("20. Rejects invalid payment method in payment records", async () => {
    const voucher = new FeeVoucher(
      getValidFeeVoucherData({
        paymentRecords: [
          {
            amountPaidPKR: 10000,
            paymentMethod: "Credit Card Online", // Not in allowed enum
          },
        ],
      })
    );

    const err = await validateDoc(voucher);
    assert(err && err.errors["paymentRecords.0.paymentMethod"]);
    assert.ok(err.errors["paymentRecords.0.paymentMethod"].message.includes("Payment method must be"));
  });

  await test("21. Rejects negative amountPaidPKR in payment records", async () => {
    const voucher = new FeeVoucher(
      getValidFeeVoucherData({
        paymentRecords: [
          {
            amountPaidPKR: -5000,
            paymentMethod: "Bank Challan",
          },
        ],
      })
    );

    const err = await validateDoc(voucher);
    assert(err && err.errors["paymentRecords.0.amountPaidPKR"]);
    assert.strictEqual(
      err.errors["paymentRecords.0.amountPaidPKR"].message,
      "Payment amount cannot be negative"
    );
  });

  // ─── 7. Schema Indexes & Architecture Conformity ───────────────────────────
  console.log("\n[7] Index Definitions & Architecture Conformity");

  await test("22. Schema indexes are properly registered for student queries and uniqueness", async () => {
    const vchPath = FeeVoucher.schema.path("voucherNumber");
    assert.strictEqual(vchPath.options.unique, true, "voucherNumber must have unique index");
    assert.strictEqual(vchPath.options.trim, true, "voucherNumber must be trimmed");
    assert.strictEqual(vchPath.options.uppercase, true, "voucherNumber must be uppercase");

    const stdIdPath = FeeVoucher.schema.path("studentId");
    assert.strictEqual(stdIdPath.options.index, true, "studentId must be indexed");
    assert.strictEqual(stdIdPath.options.ref, "Student", "studentId must reference Student model");

    const rollPath = FeeVoucher.schema.path("studentRollNumber");
    assert.strictEqual(rollPath.options.index, true, "studentRollNumber must be indexed");

    // Inspect compound indexes
    const indexes = FeeVoucher.schema.indexes();
    const hasStudentStatusIndex = indexes.some(
      ([fields]) => fields.studentId === 1 && fields.status === 1
    );
    assert.strictEqual(hasStudentStatusIndex, true, "Compound index { studentId: 1, status: 1 } must exist");

    const hasRollStatusIndex = indexes.some(
      ([fields]) => fields.studentRollNumber === 1 && fields.status === 1
    );
    assert.strictEqual(hasRollStatusIndex, true, "Compound index { studentRollNumber: 1, status: 1 } must exist");
  });

  await test("23. Schema does not assume non-existent Admin Mongoose model", async () => {
    const adminIdPath = FeeVoucher.schema.path("concession.grantedByAdminId");
    assert.strictEqual(
      adminIdPath.instance,
      "String",
      "grantedByAdminId must be a String identifier matching project architecture"
    );
    assert.strictEqual(
      adminIdPath.options.ref,
      undefined,
      "grantedByAdminId must not reference non-existent Admin/User model"
    );
  });

  console.log("\n─────────────────────────────────────────────────────────────");
  console.log(`FeeVoucher Model Results: ${passed} / ${total} passed (${total - passed} failed)`);
  console.log("─────────────────────────────────────────────────────────────\n");

  if (passed !== total) process.exit(1);
}

if (require.main === module) {
  runFeeVoucherModelTests().catch((err) => {
    console.error("FeeVoucher test suite fatal error:", err);
    process.exit(1);
  });
}

module.exports = { runFeeVoucherModelTests };
