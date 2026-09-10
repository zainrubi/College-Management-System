import React from "react";
import { AdminPlaceholderPage } from "@/components/admin/AdminPlaceholderPage";

export default function SettingsAdminPage() {
  return (
    <AdminPlaceholderPage
      title="System Settings & Configuration"
      category="System"
      description="Configure college branding, academic session parameters, and administrative preferences."
      actionLabel="Save Settings"
      hrefPath="/admin/settings"
    />
  );
}
