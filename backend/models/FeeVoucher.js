const mongoose = require("mongoose");

/**
 * Fee Item Subdocument Schema
 * Represents an itemized fee component (e.g. tuition, lab fund, examination charge).
 */
const feeItemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Fee item title is required"],
      trim: true,
      minlength: [2, "Fee item title must be at least 2 characters"],
      maxlength: [120, "Fee item title cannot exceed 120 characters"],
    },
    category: {
      type: String,
      required: [true, "Fee category is required"],
      enum: {
        values: [
          "tuition",
          "admission",
          "examination",
          "transport",
          "event",
          "lab",
          "library",
          "other",
        ],
        message: "Category must be tuition, admission, examination, transport, event, lab, library, or other",
      },
      default: "tuition",
    },
    amountPKR: {
      type: Number,
      required: [true, "Fee item amount in PKR is required"],
      min: [0, "Fee item amount cannot be negative"],
    },
  },
  { _id: true }
);

/**
 * Concession / Extension Subdocument Schema
 * Preserves the original college due date and documents the administrative rationale,
 * authorized administrator, and new extended payment deadline.
 */
const concessionSchema = new mongoose.Schema(
  {
    isGranted: {
      type: Boolean,
      default: false,
    },
    originalDueDate: {
      type: Date,
    },
    newAllowedDate: {
      type: Date,
    },
    discountAmountPKR: {
      type: Number,
      default: 0,
      min: [0, "Concession discount cannot be negative"],
    },
    reason: {
      type: String,
      trim: true,
      maxlength: [500, "Concession reason cannot exceed 500 characters"],
    },
    grantedByAdminId: {
      type: String,
      trim: true,
    },
    grantedByAdminName: {
      type: String,
      trim: true,
    },
    grantedAt: {
      type: Date,
    },
  },
  { _id: false }
);

/**
 * Payment Record Subdocument Schema
 * Represents an offline or verified settlement record (e.g., Bank Challan, JazzCash, Easypaisa).
 */
const paymentRecordSchema = new mongoose.Schema(
  {
    receiptNumber: {
      type: String,
      trim: true,
      uppercase: true,
    },
    transactionReference: {
      type: String,
      trim: true,
    },
    amountPaidPKR: {
      type: Number,
      required: [true, "Payment amount in PKR is required"],
      min: [0, "Payment amount cannot be negative"],
    },
    paymentDate: {
      type: Date,
      default: Date.now,
    },
    paymentMethod: {
      type: String,
      enum: {
        values: [
          "Bank Challan",
          "Bank Account",
          "JazzCash",
          "Easypaisa",
          "Cash (Accounts Office)",
        ],
        message: "Payment method must be Bank Challan, Bank Account, JazzCash, Easypaisa, or Cash (Accounts Office)",
      },
      default: "Bank Challan",
    },
    verifiedByAdminId: {
      type: String,
      trim: true,
    },
    verifiedByAdminName: {
      type: String,
      trim: true,
    },
    verifiedAt: {
      type: Date,
    },
  },
  { _id: true }
);

/**
 * FeeVoucher Schema
 * Official college fee voucher representing financial liability, itemized breakdowns,
 * preserved due dates, concessions, and payment settlements.
 */
const feeVoucherSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: [true, "Student reference is required"],
      index: true,
    },
    voucherNumber: {
      type: String,
      required: [true, "Voucher number is required"],
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    studentRollNumber: {
      type: String,
      required: [true, "Student roll number is required"],
      trim: true,
      uppercase: true,
      index: true,
    },
    studentName: {
      type: String,
      required: [true, "Student name is required"],
      trim: true,
      minlength: [3, "Student name must be at least 3 characters"],
      maxlength: [100, "Student name cannot exceed 100 characters"],
    },
    programName: {
      type: String,
      required: [true, "Program name is required"],
      trim: true,
    },
    academicSessionName: {
      type: String,
      trim: true,
    },
    items: {
      type: [feeItemSchema],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: "Fee voucher must contain at least one fee item",
      },
    },
    subtotalPKR: {
      type: Number,
      required: [true, "Subtotal amount is required"],
      min: [0, "Subtotal amount cannot be negative"],
    },
    discountPKR: {
      type: Number,
      default: 0,
      min: [0, "Discount amount cannot be negative"],
    },
    totalAmountPKR: {
      type: Number,
      required: [true, "Total payable amount is required"],
      min: [0, "Total payable amount cannot be negative"],
    },
    paidAmountPKR: {
      type: Number,
      default: 0,
      min: [0, "Paid amount cannot be negative"],
    },
    issueDate: {
      type: Date,
      default: Date.now,
      required: [true, "Issue date is required"],
    },
    originalDueDate: {
      type: Date,
      required: [true, "Original due date is required"],
      index: true,
    },
    finalAllowedDate: {
      type: Date,
      required: [true, "Final allowed payment date is required"],
      index: true,
    },
    status: {
      type: String,
      enum: {
        values: ["unpaid", "paid", "partially_paid", "overdue", "extended", "cancelled"],
        message: "Status must be unpaid, paid, partially_paid, overdue, extended, or cancelled",
      },
      default: "unpaid",
      index: true,
    },
    concession: {
      type: concessionSchema,
      default: () => ({ isGranted: false, discountAmountPKR: 0 }),
    },
    paymentRecords: {
      type: [paymentRecordSchema],
      default: [],
    },
    remarks: {
      type: String,
      trim: true,
      maxlength: [500, "Remarks cannot exceed 500 characters"],
    },
  },
  { timestamps: true, bufferCommands: false }
);

// Compound indexes for student dashboard and accounts reporting
feeVoucherSchema.index({ studentId: 1, status: 1 });
feeVoucherSchema.index({ studentRollNumber: 1, status: 1 });
feeVoucherSchema.index({ finalAllowedDate: 1, status: 1 });

/**
 * Pre-validation lifecycle hook:
 * 1. Automatically initializes finalAllowedDate from originalDueDate if not explicitly provided.
 * 2. Auto-calculates subtotalPKR from items if not provided.
 * 3. Auto-calculates totalAmountPKR from subtotalPKR - discountPKR if not provided.
 */
feeVoucherSchema.pre("validate", function () {
  if (this.originalDueDate && !this.finalAllowedDate) {
    this.finalAllowedDate = this.originalDueDate;
  }
  if (this.subtotalPKR === undefined && Array.isArray(this.items) && this.items.length > 0) {
    this.subtotalPKR = this.items.reduce((acc, item) => acc + (Number(item.amountPKR) || 0), 0);
  }
  if (this.totalAmountPKR === undefined && this.subtotalPKR !== undefined) {
    const discount = Number(this.discountPKR) || 0;
    this.totalAmountPKR = Math.max(0, this.subtotalPKR - discount);
  }
});

/**
 * Instance method to grant an extension or concession while strictly preserving originalDueDate.
 */
feeVoucherSchema.methods.grantConcession = function ({
  newAllowedDate,
  discountAmountPKR = 0,
  reason,
  grantedByAdminId,
  grantedByAdminName,
}) {
  if (!newAllowedDate) {
    throw new Error("New allowed date is required to grant an extension");
  }

  // Preserve the immutable original due date
  const original = this.originalDueDate;

  this.concession = {
    isGranted: true,
    originalDueDate: original,
    newAllowedDate: new Date(newAllowedDate),
    discountAmountPKR: Number(discountAmountPKR) || 0,
    reason: reason || "",
    grantedByAdminId: grantedByAdminId || "",
    grantedByAdminName: grantedByAdminName || "",
    grantedAt: new Date(),
  };

  this.finalAllowedDate = new Date(newAllowedDate);

  if (discountAmountPKR > 0) {
    this.discountPKR = Number(discountAmountPKR);
    this.totalAmountPKR = Math.max(0, this.subtotalPKR - this.discountPKR);
  }

  if (this.status !== "paid" && this.status !== "cancelled") {
    this.status = "extended";
  }

  return this;
};

module.exports = mongoose.model("FeeVoucher", feeVoucherSchema);
