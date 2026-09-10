"use client";

import React from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { UserRole } from "@/types";
import { UnauthorizedView } from "./UnauthorizedView";
import { LoadingState } from "../ui/LoadingState";

export interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

/**
 * CLIENT-SIDE ROUTE GUARD PROTOTYPE
 * 
 * Verifies authentication and role authorization against AuthContext.
 * Note: Server-side authorization check must be implemented in Next.js middleware
 * or server actions after backend session cookies are introduced.
 */
export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading, hasRole } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background-secondary">
        <LoadingState label="Verifying portal authorization..." />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <UnauthorizedView reason="unauthenticated" allowedRoles={allowedRoles} />;
  }

  if (!hasRole(allowedRoles)) {
    return <UnauthorizedView reason="unauthorized" allowedRoles={allowedRoles} />;
  }

  return <>{children}</>;
}
