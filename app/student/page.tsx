"use client";

import React, { useEffect, useState, useCallback } from "react";
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
import { StudentProfileSection } from "@/components/student/StudentProfileSection";
import { ErrorState } from "@/components/ui/ErrorState";
import { Button } from "@/components/ui/Button";
import { getStatusBadgeVariant } from "@/lib/utils";
import { AlertCircle, RefreshCw } from "lucide-react";

function StudentDashboardContent() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<StudentProfileData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      setLoadError(null);
      const data = await getStudentProfile();
      setProfile(data);
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
      setLoadError(
        authErr.message || "Failed to load live profile from college server. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  }, [logout, router]);

  useEffect(() => {
    let active = true;

    getStudentProfile()
      .then((data) => {
        if (!active) return;
        setProfile(data);
        setIsLoading(false);
      })
      .catch((err: unknown) => {
        if (!active) return;
        setIsLoading(false);
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
        setLoadError(
          authErr.message || "Failed to load live profile from college server. Please try again."
        );
      });

    return () => {
      active = false;
    };
  }, [logout, router]);

  const studentName = profile?.fullName || user?.name || "Student";
  const rollNumber = profile?.rollNumber || user?.rollNumber || "";
  const email = profile?.email || user?.email || "";
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
        badge={
          <Badge variant={getStatusBadgeVariant(status)}>
            {status === "active" ? "Active Enrolled Student" : status.toUpperCase()}
          </Badge>
        }
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />}
              onClick={() => fetchProfile()}
              disabled={isLoading}
            >
              Refresh
            </Button>
            <BackToHome variant="button" />
          </div>
        }
      />

      {loadError && profile && (
        <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>{loadError}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            onClick={() => fetchProfile()}
            className="text-xs shrink-0 bg-white"
          >
            Retry Live Sync
          </Button>
        </div>
      )}

      {isLoading && !profile ? (
        <div className="py-12">
          <LoadingState label="Loading student enrollment profile..." />
        </div>
      ) : loadError && !profile ? (
        <ErrorState
          title="Unable to load student profile"
          description={loadError}
          onRetry={fetchProfile}
        />
      ) : !profile ? (
        <ErrorState
          title="Student Profile Not Found"
          description="Could not locate an active enrollment record for this account."
          onRetry={fetchProfile}
        />
      ) : (
        <div className="space-y-6">
          {/* Complete Live Profile Sections */}
          <StudentProfileSection profile={profile} />

          {/* Reserved Space for Subsequent Modules */}
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
