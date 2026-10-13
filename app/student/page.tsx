"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { StudentLayout } from "@/components/layouts/StudentLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { BackToHome } from "@/components/ui/BackToHome";
import { LoadingState } from "@/components/ui/LoadingState";
import { useAuth } from "@/lib/auth/AuthContext";
import { getStudentProfile, StudentProfileData, StudentAuthError } from "@/lib/services/student-service";
import { GraduationCap, User, BookOpen, Building, AlertCircle } from "lucide-react";

function StudentDashboardContent() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<StudentProfileData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      try {
        setIsLoading(true);
        setLoadError(null);
        const data = await getStudentProfile();
        if (isMounted) {
          setProfile(data);
        }
      } catch (err: unknown) {
        const authErr = err as StudentAuthError;
        if (
          authErr.code === "SESSION_EXPIRED" ||
          authErr.code === "UNAUTHORIZED" ||
          authErr.status === 401 ||
          authErr.status === 403
        ) {
          logout();
          router.push("/student/login");
          return;
        }
        if (isMounted) {
          setLoadError(
            authErr.message || "Failed to load live profile. Displaying cached session details."
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [logout, router]);

  const studentName = profile?.fullName || user?.name || "Student";
  const rollNumber = profile?.rollNumber || user?.rollNumber || "N/A";
  const studentIdNumber = profile?.studentIdNumber || user?.studentIdNumber || "N/A";
  const programName = profile?.program?.name || user?.programName || "Enrolled Program";
  const campus = profile?.program?.campus || "Main Campus";
  const shift = profile?.program?.shift || "Morning";
  const email = profile?.email || user?.email || "";
  const phone = profile?.phone || user?.phone || "";
  const status = profile?.status || "active";

  return (
    <StudentLayout
      studentName={studentName}
      studentRollNumber={rollNumber}
      studentEmail={email}
    >
      <PageHeader
        title={`Welcome, ${studentName}`}
        subtitle="Access your academic enrollment profile, official roll number, and student credentials."
        breadcrumbs={[
          { label: "Student Portal", href: "/student" },
          { label: "Dashboard" },
        ]}
        badge={<Badge variant="success">Active Enrolled Student</Badge>}
        actions={<BackToHome variant="button" />}
      />

      {loadError && (
        <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
          <span>{loadError}</span>
        </div>
      )}

      {isLoading ? (
        <div className="py-12">
          <LoadingState label="Loading student enrollment profile..." />
        </div>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Enrollment Profile</CardTitle>
                  <CardDescription>
                    Official academic details from college admissions.
                  </CardDescription>
                </div>
                <Badge variant={status === "active" ? "success" : "secondary"}>
                  {status.toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 dark:bg-slate-900/50 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                    <GraduationCap className="w-4 h-4 text-primary" />
                    <span>Roll Number</span>
                  </div>
                  <p className="text-sm font-semibold font-mono text-text-primary">
                    {rollNumber}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 dark:bg-slate-900/50 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                    <User className="w-4 h-4 text-primary" />
                    <span>Student ID</span>
                  </div>
                  <p className="text-sm font-semibold font-mono text-text-primary">
                    {studentIdNumber}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 dark:bg-slate-900/50 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                    <BookOpen className="w-4 h-4 text-primary" />
                    <span>Degree / Program</span>
                  </div>
                  <p className="text-sm font-semibold text-text-primary">
                    {programName}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 dark:bg-slate-900/50 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                    <Building className="w-4 h-4 text-primary" />
                    <span>Campus & Shift</span>
                  </div>
                  <p className="text-sm font-semibold text-text-primary">
                    {campus} ({shift})
                  </p>
                </div>
              </div>

              {(email || phone) && (
                <div className="mt-4 pt-4 border-t border-border flex flex-wrap gap-4 text-xs text-slate-500">
                  {email && (
                    <div>
                      <span className="font-medium text-text-secondary">Email:</span> {email}
                    </div>
                  )}
                  {phone && (
                    <div>
                      <span className="font-medium text-text-secondary">Phone:</span> {phone}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Academic Portal Services</CardTitle>
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
        </div>
      )}
    </StudentLayout>
  );
}

export default function StudentPortalHomePage() {
  return (
    <ProtectedRoute allowedRoles={["student"]}>
      <StudentDashboardContent />
    </ProtectedRoute>
  );
}
