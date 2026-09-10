import React from "react";
import { AdminPlaceholderPage } from "@/components/admin/AdminPlaceholderPage";

export default function StudentsAdminPage() {
  return (
    <AdminPlaceholderPage
      title="Student Management"
      category="People"
      description="Manage student enrollment records, profiles, and registration numbers."
      actionLabel="Add Student"
      hrefPath="/admin/students"
    />
  );
}
