import React from "react";
import { AdminPlaceholderPage } from "@/components/admin/AdminPlaceholderPage";

export default function ReportsAdminPage() {
  return (
    <AdminPlaceholderPage
      title="Reports & Financial Analytics"
      category="Finance"
      description="Generate fee collection reports, outstanding balance ledgers, and academic statistics."
      actionLabel="Export Report"
      hrefPath="/admin/reports"
    />
  );
}
