import React from "react";
import { AdminPlaceholderPage } from "@/components/admin/AdminPlaceholderPage";

export default function AttendanceAdminPage() {
  return (
    <AdminPlaceholderPage
      title="Attendance Records"
      category="Academics"
      description="Monitor class attendance percentage, absence reports, and leave approvals."
      actionLabel="View Summary"
      hrefPath="/admin/attendance"
    />
  );
}
