import React from "react";
import { AdminPlaceholderPage } from "@/components/admin/AdminPlaceholderPage";

export default function CoursesAdminPage() {
  return (
    <AdminPlaceholderPage
      title="Course Offerings"
      category="Academics"
      description="Assign course codes, semester allocations, and faculty instructors."
      actionLabel="Add Course"
      hrefPath="/admin/courses"
    />
  );
}
