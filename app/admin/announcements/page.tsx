import React from "react";
import { AdminPlaceholderPage } from "@/components/admin/AdminPlaceholderPage";

export default function AnnouncementsAdminPage() {
  return (
    <AdminPlaceholderPage
      title="Campus Announcements"
      category="Communication"
      description="Post campus-wide notices, academic calendar updates, and examination schedules."
      actionLabel="Create Announcement"
      hrefPath="/admin/announcements"
    />
  );
}
