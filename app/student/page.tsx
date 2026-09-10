"use client";

import React from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { StudentLayout } from "@/components/layouts/StudentLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { BackToHome } from "@/components/ui/BackToHome";

export default function StudentPortalHomePage() {
  return (
    <ProtectedRoute allowedRoles={["student"]}>
      <StudentLayout>
        <PageHeader
          title="Student Portal"
          subtitle="Welcome to your student portal. Access your fee vouchers, attendance records, and study handouts."
          breadcrumbs={[
            { label: "Student Portal", href: "/student" },
            { label: "Dashboard" },
          ]}
          badge={<Badge variant="success">Authenticated Student</Badge>}
          actions={<BackToHome variant="button" />}
        />

        <Card>
          <CardHeader>
            <CardTitle>Student Portal Active</CardTitle>
            <CardDescription>
              Role-based authorization confirmed for Student account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-500">
              Feature dashboards for Student Fees, Attendance, and Handouts will be built in subsequent development stages.
            </p>
          </CardContent>
        </Card>
      </StudentLayout>
    </ProtectedRoute>
  );
}
