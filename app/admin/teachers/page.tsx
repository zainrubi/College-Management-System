import React from "react";
import { AdminPlaceholderPage } from "@/components/admin/AdminPlaceholderPage";

export default function TeachersAdminPage() {
  return (
    <AdminPlaceholderPage
      title="Teachers & Staff Management"
      category="People"
      description="Manage faculty profiles, department designations, and employee records."
      actionLabel="Add Teacher"
      hrefPath="/admin/teachers"
    />
  );
}
