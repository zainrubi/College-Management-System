import React from "react";
import { AdminPlaceholderPage } from "@/components/admin/AdminPlaceholderPage";

export default function HandoutsAdminPage() {
  return (
    <AdminPlaceholderPage
      title="Course Handouts & Study Material"
      category="Academics"
      description="Manage study materials, lecture slides, and course syllabi uploaded by faculty."
      actionLabel="Upload Material"
      hrefPath="/admin/handouts"
    />
  );
}
