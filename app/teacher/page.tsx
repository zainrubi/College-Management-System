"use client";

import React from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { TeacherLayout } from "@/components/layouts/TeacherLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { BackToHome } from "@/components/ui/BackToHome";

export default function TeacherPortalHomePage() {
  return (
    <ProtectedRoute allowedRoles={["teacher"]}>
      <TeacherLayout>
        <PageHeader
          title="Teacher Portal"
          subtitle="Access your teaching schedule, attendance tools, and academic resources."
          breadcrumbs={[{ label: "Teacher Portal", href: "/teacher" }, { label: "Dashboard" }]}
          badge={<Badge variant="success">Authenticated Teacher</Badge>}
          actions={<BackToHome variant="button" />}
        />

        <Card>
          <CardHeader>
            <CardTitle>Teacher Portal Active</CardTitle>
            <CardDescription>Role-based authorization confirmed for Teacher account.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-500">
              Teaching schedule, attendance, and academic resource features will be available here.
            </p>
          </CardContent>
        </Card>
      </TeacherLayout>
    </ProtectedRoute>
  );
}
