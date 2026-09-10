import React from "react";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Plus, Users, GraduationCap, Receipt, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function AdminDashboardPage() {
  return (
    <AdminLayout>
      <PageHeader
        title="Admin Console"
        subtitle="Central management shell for college administrative operations, academic programs, and financial records."
        breadcrumbs={[
          { label: "Admin Portal", href: "/admin" },
          { label: "Dashboard Overview" },
        ]}
        badge={<Badge variant="success">Step 5 Active Shell</Badge>}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              Export Audit Log
            </Button>
            <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
              Quick Action
            </Button>
          </div>
        }
      />

      {/* Placeholder Shell Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <div className="w-10 h-10 rounded-lg bg-primary-light text-primary flex items-center justify-center font-bold mb-2">
              <Users className="w-5 h-5" />
            </div>
            <CardTitle>People Management Shell</CardTitle>
            <CardDescription>
              Placeholder container for Student records, Applicant submissions, and Teacher rosters.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Link
              href="/admin/students"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-primary hover:text-primary hover:underline"
            >
              Test Student Navigation <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="w-10 h-10 rounded-lg bg-primary-light text-primary flex items-center justify-center font-bold mb-2">
              <GraduationCap className="w-5 h-5" />
            </div>
            <CardTitle>Academics Shell</CardTitle>
            <CardDescription>
              Placeholder container for Programs, Subjects, Course curriculum, and Attendance.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Link
              href="/admin/programs"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-primary hover:text-primary hover:underline"
            >
              Test Programs Navigation <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="w-10 h-10 rounded-lg bg-primary-light text-primary flex items-center justify-center font-bold mb-2">
              <Receipt className="w-5 h-5" />
            </div>
            <CardTitle>Financial System Shell</CardTitle>
            <CardDescription>
              Placeholder container for Fee Structures, Fee Vouchers, Payment receipts, and Concessions.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Link
              href="/admin/fees"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-primary hover:text-primary hover:underline"
            >
              Test Fee Navigation <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
