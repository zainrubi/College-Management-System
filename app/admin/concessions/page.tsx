import React from "react";
import { AdminPlaceholderPage } from "@/components/admin/AdminPlaceholderPage";

export default function ConcessionsAdminPage() {
  return (
    <AdminPlaceholderPage
      title="Fee Concessions & Extensions"
      category="Finance"
      description="Grant due-date extensions while preserving original due dates, manage scholarships, and record administrative approval notes."
      actionLabel="Grant Extension"
      hrefPath="/admin/concessions"
    />
  );
}
