import React from "react";
import { AdminPlaceholderPage } from "@/components/admin/AdminPlaceholderPage";

export default function NotificationsAdminPage() {
  return (
    <AdminPlaceholderPage
      title="System Notifications"
      category="Communication"
      description="Manage role-targeted alerts for students, teachers, and admission applicants."
      actionLabel="Send Notification"
      hrefPath="/admin/notifications"
    />
  );
}
