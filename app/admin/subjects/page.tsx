import React from "react";
import { AdminPlaceholderPage } from "@/components/admin/AdminPlaceholderPage";

export default function SubjectsAdminPage() {
  return (
    <AdminPlaceholderPage
      title="Subjects Catalog"
      category="Academics"
      description="Manage core and elective subject definitions across academic departments."
      actionLabel="Add Subject"
      hrefPath="/admin/subjects"
    />
  );
}
