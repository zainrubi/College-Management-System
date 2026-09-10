import React from "react";
import { AdminPlaceholderPage } from "@/components/admin/AdminPlaceholderPage";

export default function VouchersAdminPage() {
  return (
    <AdminPlaceholderPage
      title="Fee Vouchers"
      category="Finance"
      description="Generate and issue student fee vouchers, track original due dates, and monitor payment statuses."
      actionLabel="Generate Vouchers"
      hrefPath="/admin/vouchers"
    />
  );
}
