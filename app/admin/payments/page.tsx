import React from "react";
import { AdminPlaceholderPage } from "@/components/admin/AdminPlaceholderPage";

export default function PaymentsAdminPage() {
  return (
    <AdminPlaceholderPage
      title="Payment Transactions"
      category="Finance"
      description="Track confirmed transactions, payment methods (JazzCash, Easypaisa, Bank Account), and issue payment receipts."
      actionLabel="Record Manual Payment"
      hrefPath="/admin/payments"
    />
  );
}
