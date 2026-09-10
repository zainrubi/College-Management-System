import React from "react";
import { AdminPlaceholderPage } from "@/components/admin/AdminPlaceholderPage";

export default function ProgramsAdminPage() {
  return (
    <AdminPlaceholderPage
      title="Academic Programs"
      category="Academics"
      description="Define degree and higher secondary certification programs, annual fee structures, and durations."
      actionLabel="Create Program"
      hrefPath="/admin/programs"
    />
  );
}
