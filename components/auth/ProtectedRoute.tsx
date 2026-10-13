"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import { UserRole } from "@/types";
import { UnauthorizedView } from "./UnauthorizedView";
import { LoadingState } from "../ui/LoadingState";

export interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

/**
 * CLIENT-SIDE ROUTE GUARD
 * 
 * Verifies authentication and role authorization against AuthContext.
 * Automatically redirects unauthenticated users visiting student-only pages to /student/login.
 */
export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading, hasRole } = useAuth();
  const router = useRouter();

  const isStudentOnly = allowedRoles.length === 1 && allowedRoles[0] === "student";

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !user)) {
      if (isStudentOnly) {
        router.push("/student/login");
      }
    }
  }, [isLoading, isAuthenticated, user, isStudentOnly, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background-secondary">
        <LoadingState label="Verifying portal authorization..." />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    if (isStudentOnly) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-background-secondary">
          <LoadingState label="Redirecting to Student Sign In..." />
        </div>
      );
    }
    return <UnauthorizedView reason="unauthenticated" allowedRoles={allowedRoles} />;
  }

  if (!hasRole(allowedRoles)) {
    return <UnauthorizedView reason="unauthorized" allowedRoles={allowedRoles} />;
  }

  return <>{children}</>;
}
