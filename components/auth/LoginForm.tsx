"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import { UserRole } from "@/types";
import { FormField } from "../ui/FormField";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { BackToHome } from "../ui/BackToHome";
import { MOCK_COLLEGE } from "@/lib/mock-data";
import { loginApplicant, getApplicantPortalDestination } from "@/lib/services/admission-service";
import {
  GraduationCap,
  Lock,
  Mail,
  UserCheck,
  ShieldCheck,
  ArrowRight,
  Phone,
  Eye,
  EyeOff,
  Sparkles,
} from "lucide-react";

export interface LoginFormProps {
  role: UserRole;
  title?: string;
  subtitle?: string;
  redirectUrl?: string;
}

/** Helper to filter digits only for applicant phone input (max 11 digits) */
function filterPhoneInput(value: string): string {
  return value.replace(/\D/g, "").slice(0, 11);
}

export function LoginForm({
  role,
  title,
  subtitle,
  redirectUrl,
}: LoginFormProps) {
  const router = useRouter();
  const { login } = useAuth();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const isApplicant = role === "applicant" || role === "public_visitor";

  const getRoleConfig = () => {
    switch (role) {
      case "student":
        return {
          defaultTitle: "Student Portal Sign In",
          defaultSubtitle:
            "Enter your Student Registration ID or college email to access your student dashboard.",
          identifierLabel: "Student ID or Institutional Email",
          identifierPlaceholder: "e.g. BCS-F24-014 or ali@student.apex.edu.pk",
          inputType: "text",
          icon: <GraduationCap className="w-6 h-6 text-primary" />,
          fieldIcon: <Mail className="w-4 h-4" />,
          targetRoute: "/student",
          demoCreds: "Demo Student ID: BCS-F24-014 | Pass: any",
          helperNote: undefined,
        };
      case "teacher":
        return {
          defaultTitle: "Faculty & Teacher Portal",
          defaultSubtitle:
            "Enter your Employee ID or faculty email to manage course handouts and attendance.",
          identifierLabel: "Employee ID or Faculty Email",
          identifierPlaceholder: "e.g. EMP-TCH-042 or shahbaz@apex.edu.pk",
          inputType: "text",
          icon: <UserCheck className="w-6 h-6 text-primary" />,
          fieldIcon: <Mail className="w-4 h-4" />,
          targetRoute: "/teacher",
          demoCreds: "Demo Employee ID: EMP-TCH-042 | Pass: any",
          helperNote: undefined,
        };
      case "admin":
        return {
          defaultTitle: "Administrator Portal",
          defaultSubtitle:
            "System administration console for managing college operations, fees, and personnel.",
          identifierLabel: "Admin Email or Username",
          identifierPlaceholder: "e.g. kashif.accounts@apex.edu.pk or admin",
          inputType: "text",
          icon: <ShieldCheck className="w-6 h-6 text-primary" />,
          fieldIcon: <ShieldCheck className="w-4 h-4" />,
          targetRoute: "/admin",
          demoCreds: "Demo Admin Email: kashif.accounts@apex.edu.pk | Pass: any",
          helperNote: undefined,
        };
      default:
        // APPLICANT ROLE
        return {
          defaultTitle: "Applicant Portal Sign In",
          defaultSubtitle:
            "Sign in using your mobile phone number and password to view or continue your admission application.",
          identifierLabel: "Registered Mobile Number",
          identifierPlaceholder: "03001234567",
          inputType: "tel",
          icon: <GraduationCap className="w-6 h-6 text-primary" />,
          fieldIcon: <Phone className="w-4 h-4" />,
          targetRoute: "/applicant",
          demoCreds: "Use your registered mobile number and password.",
          helperNote: undefined,
        };
    }
  };

  const config = getRoleConfig();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!identifier.trim()) {
      setErrorMsg(isApplicant ? "Mobile number must contain exactly 11 digits." : "Please enter your ID or Email.");
      return;
    }

    if (isApplicant && !/^\d{11}$/.test(identifier.trim())) {
      setErrorMsg("Mobile number must contain exactly 11 digits.");
      return;
    }

    if (!password.trim()) {
      setErrorMsg("Please enter your password.");
      return;
    }

    setIsSubmitting(true);

    if (isApplicant) {
      loginApplicant(identifier, password)
        .then((result) => {
          login("applicant", {
            name: result.fullName,
            phone: result.phone,
            email: result.email || "",
          });
          router.push(getApplicantPortalDestination(result.hasSubmittedApplication));
        })
        .catch((err: unknown) => {
          const code = err instanceof Error ? err.message : "";
          if (code === "ACCOUNT_NOT_FOUND") {
            setErrorMsg("No applicant account exists with this phone number. Please register to apply.");
          } else if (code === "INVALID_PHONE") {
            setErrorMsg("Mobile number must contain exactly 11 digits.");
          } else if (code === "INVALID_PASSWORD") {
            setErrorMsg("Incorrect password. Please try again or contact the admissions office.");
          } else {
            setErrorMsg("Unable to sign in. Please try again.");
          }
        })
        .finally(() => setIsSubmitting(false));
      return;
    }

    setTimeout(() => {
      login(role, {
        email: identifier.includes("@") ? identifier : `${identifier}@apex.edu.pk`,
        name: identifier || "Portal User",
      });
      setIsSubmitting(false);
      router.push(redirectUrl || config.targetRoute);
    }, 500);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-background-secondary text-text-primary p-4 sm:p-6 lg:p-8">
      {/* Top Header Row with Back to Home */}
      <div className="max-w-md w-full mx-auto flex items-center justify-between">
        <BackToHome variant="button" />
        <span className="text-xs text-slate-400 font-medium">Est. {MOCK_COLLEGE.establishedYear}</span>
      </div>

      {/* Main Login Card Container */}
      <div className="max-w-md w-full mx-auto my-auto py-8">
        <div className="bg-white rounded-2xl border border-border shadow-xl p-6 sm:p-8 space-y-6">
          {/* Header Brand & Icon */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-primary-light flex items-center justify-center mx-auto border border-primary/20 shadow-xs mb-3">
              {config.icon}
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-text-primary">
              {title || config.defaultTitle}
            </h1>
            <p className="text-xs text-text-secondary leading-relaxed">
              {subtitle || config.defaultSubtitle}
            </p>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-lg">
              {errorMsg}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <FormField label={config.identifierLabel} required>
                <Input
                  type={config.inputType}
                  inputMode={isApplicant ? "numeric" : "text"}
                  placeholder={config.identifierPlaceholder}
                  value={identifier}
                  onChange={(e) => {
                    if (isApplicant) {
                      setIdentifier(filterPhoneInput(e.target.value));
                    } else {
                      setIdentifier(e.target.value);
                    }
                  }}
                  required
                  leftIcon={config.fieldIcon}
                  autoComplete={isApplicant ? "tel" : "username"}
                  maxLength={isApplicant ? 11 : undefined}
                />
              </FormField>
              {config.helperNote && (
                <p className="text-[11px] text-text-muted pl-1">
                  {config.helperNote}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <FormField label="Password" required>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    leftIcon={<Lock className="w-4 h-4" />}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </FormField>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-text-secondary">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-border text-primary focus:ring-primary"
                />
                <span>Remember me</span>
              </label>

              <button
                type="button"
                onClick={() => alert("Password reset assistance is available at the admissions office or IT support helpline.")}
                className="text-primary hover:underline font-semibold cursor-pointer"
              >
                Forgot password?
              </button>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full mt-2"
              isLoading={isSubmitting}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              {isApplicant
                ? "Sign In to Applicant Portal"
                : role === "admin"
                  ? "Sign In to Admin Console"
                  : role === "teacher"
                    ? "Sign In to Faculty Portal"
                    : "Sign In to Student Portal"}
            </Button>
          </form>

          {/* Role specific registration policy notes */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500 space-y-2">
            {isApplicant ? (
              <p>
                Don&apos;t have an applicant account?{" "}
                <Link href="/register" className="text-primary font-semibold hover:underline">
                  Register as Applicant
                </Link>
              </p>
            ) : (
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Notice: {role.charAt(0).toUpperCase() + role.slice(1)} accounts are issued and managed by college administration. No public registration available.
              </p>
            )}

            {/* Development Mock Credential Banner */}
            <div className="p-2.5 rounded-md bg-background-secondary border border-border text-[11px] text-text-secondary font-mono flex items-center justify-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-accent-gold shrink-0" />
              <span>{config.demoCreds}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer copyright */}
      <div className="text-center text-xs text-slate-400 py-4">
        &copy; {new Date().getFullYear()} {MOCK_COLLEGE.name}. All rights reserved.
      </div>
    </div>
  );
}
