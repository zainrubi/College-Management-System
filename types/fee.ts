export type FeeCategory =
  | "tuition"
  | "admission"
  | "examination"
  | "transport"
  | "event"
  | "lab"
  | "library"
  | "other";

export interface FeeType {
  id: string;
  name: string;
  category: FeeCategory;
  defaultAmountPKR: number;
  description?: string;
}

export interface FeeStructure {
  id: string;
  programId: string;
  programName: string;
  academicSessionId: string;
  academicSessionName: string;
  items: {
    feeTypeId: string;
    feeTypeName: string;
    amountPKR: number;
  }[];
  totalAnnualAmountPKR: number;
}

export interface StudentFeePlan {
  id: string;
  studentId: string;
  totalFeePKR: number;
  discountAmountPKR: number;
  discountReason?: string;
  netFeePKR: number;
  installmentCount: number;
}

export interface FeeVoucherItem {
  id: string;
  title: string;
  category: FeeCategory;
  amountPKR: number;
}

export interface Concession {
  id: string;
  voucherId: string;
  originalDueDate: string;
  newAllowedDate: string;
  discountAmountPKR?: number;
  reason: string;
  grantedByAdminId: string;
  grantedByAdminName: string;
  grantedAtTimestamp: string;
}

export type VoucherStatus =
  | "unpaid"
  | "paid"
  | "partially_paid"
  | "overdue"
  | "extended"
  | "cancelled";

export interface FeeVoucher {
  id: string; // e.g. VCH-2026-0891
  voucherNumber: string;
  studentId: string;
  studentName: string;
  studentRollNumber: string;
  programName: string;
  academicSessionName: string;
  items: FeeVoucherItem[];
  subtotalPKR: number;
  discountPKR: number;
  totalAmountPKR: number;
  paidAmountPKR: number;
  issueDate: string;
  originalDueDate: string; // CRITICAL: Preserved original due date
  finalAllowedDate: string; // Modified only if concession/extension is granted
  concession?: Concession; // Details of extension/concession if granted
  status: VoucherStatus;
  remarks?: string;
}

export type PaymentMethod = "JazzCash" | "Easypaisa" | "Bank Account";

export type PaymentStatus = "completed" | "pending" | "failed" | "refunded";

export interface Payment {
  id: string; // e.g. PAY-99823
  voucherId: string;
  voucherNumber: string;
  studentId: string;
  studentName: string;
  amountPKR: number;
  paymentDate: string;
  paymentTime: string;
  method: PaymentMethod;
  transactionReference: string; // e.g. "TXN-9981244321"
  status: PaymentStatus;
  gatewayResponseMock?: string;
}

export interface PaymentReceipt {
  id: string;
  receiptNumber: string; // e.g. RCP-2026-4412
  paymentId: string;
  voucherId: string;
  voucherNumber: string;
  studentId: string;
  studentName: string;
  studentRollNumber: string;
  programName: string;
  amountPaidPKR: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  transactionReference: string;
  issuedAt: string;
}

export interface Installment {
  id: string;
  studentId: string;
  installmentNumber: number;
  totalInstallments: number;
  amountPKR: number;
  dueDate: string;
  status: "pending" | "paid" | "overdue";
  relatedVoucherId?: string;
}
