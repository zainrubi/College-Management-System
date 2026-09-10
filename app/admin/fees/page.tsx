import React from "react";
import { AdminPlaceholderPage } from "@/components/admin/AdminPlaceholderPage";

export default function FeesAdminPage() {
  return (
    <AdminPlaceholderPage
      title="Fee Management"
      category="Finance"
      description="Configure tuition fee structures, admission charges, exam fees, and transport plans."
      actionLabel="Create Fee Structure"
      hrefPath="/admin/fees"
    />
  );
}
