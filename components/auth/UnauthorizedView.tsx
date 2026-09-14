"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthContext";
import { UserRole } from "@/types";
import { ShieldAlert, LogIn, ArrowRight } from "lucide-react";
import { BackToHome } from "../ui/BackToHome";
import { Button } from "../ui/Button";

export interface UnauthorizedViewProps {
  reason: "unauthenticated" | "unauthorized";
  allowedRoles?: UserRole[];
}

export function UnauthorizedView({ reason, allowedRoles = [] }: UnauthorizedViewProps) {
  const { user } = useAuth();

  const portalRouteMap: Record<UserRole, string> = {
    public_visitor: "/",
    applicant: "/applicant?tab=application",
    student: "/student",
    teacher: "/teacher",
    admin: "/admin",
  };

  const currentPortalRoute = user ? portalRouteMap[user.role] : "/";

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background-secondary text-text-primary">
      <div className="max-w-md w-full bg-white rounded-2xl border border-border shadow-xl p-6 sm:p-8 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-xs">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold tracking-tight text-text-primary">
            {reason === "unauthenticated"
              ? "Authentication Required"
              : "Access Denied"}
          </h2>
          <p className="text-xs text-text-secondary leading-relaxed">
            {reason === "unauthenticated"
              ? "Please log in to continue accessing this protected portal area."
              : `You don't have permission to access this portal. This area is reserved for ${allowedRoles.join(", ")} accounts.`}
          </p>
        </div>

        <div className="pt-2 flex flex-col gap-2.5">
          {reason === "unauthenticated" ? (
            <Link href="/login" className="w-full">
              <Button variant="primary" className="w-full" leftIcon={<LogIn className="w-4 h-4" />}>
                Go to Sign In
              </Button>
            </Link>
          ) : user ? (
            <Link href={currentPortalRoute} className="w-full">
              <Button variant="primary" className="w-full" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Go to Your Portal ({user.role})
              </Button>
            </Link>
          ) : null}

          <div className="pt-2 border-t border-border flex justify-center">
            <BackToHome />
          </div>
        </div>
      </div>
    </div>
  );
}
