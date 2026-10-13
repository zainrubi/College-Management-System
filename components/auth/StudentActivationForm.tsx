"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import {
  requestStudentActivation,
  activateStudentAccount,
  getApplicantToken,
  StudentAuthError,
} from "@/lib/services/student-service";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { BackToHome } from "@/components/ui/BackToHome";
import { MOCK_COLLEGE } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import {
  GraduationCap,
  Lock,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Phone,
  Eye,
  EyeOff,
  AlertCircle,
  KeyRound,
  Check,
  X,
  UserCheck,
  Clock,
  Sparkles,
} from "lucide-react";

type ActivationStep = "verify" | "set_password" | "success";

function filterPhoneInput(value: string): string {
  return value.replace(/\D/g, "").slice(0, 11);
}

export function StudentActivationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  // Active applicant session detection
  const storedApplicantToken = typeof window !== "undefined" ? getApplicantToken() : null;
  const hasActiveApplicantSession =
    user?.role === "applicant" && !!(user.token || storedApplicantToken);

  // Flow step management
  const [step, setStep] = useState<ActivationStep>("verify");

  // Step 1: Verification Form State
  const [identifier, setIdentifier] = useState("");
  const [phone, setPhone] = useState("");
  const [applicantPassword, setApplicantPassword] = useState("");
  const [showApplicantPassword, setShowApplicantPassword] = useState(false);
  const [useActiveSession, setUseActiveSession] = useState(true);

  // Security Note: Token is held strictly in volatile component state.
  // It is never written to localStorage, cookies, or printed to the DOM/logs.
  const [activationToken, setActivationToken] = useState<string | null>(null);

  // Verified student details returned by Step 1
  const [verifiedStudent, setVerifiedStudent] = useState<{
    id: string;
    studentIdNumber: string;
    rollNumber: string;
    fullName: string;
  } | null>(null);

  // Step 2: Password Setup State
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Submission & Feedback State
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isAlreadyActivated, setIsAlreadyActivated] = useState(false);

  // Populate identifier from URL query param if redirected from login
  useEffect(() => {
    const queryIdentifier =
      searchParams.get("identifier") ||
      searchParams.get("id") ||
      searchParams.get("rollNumber");
    if (queryIdentifier) {
      setIdentifier(queryIdentifier.trim());
    }
  }, [searchParams]);

  // If user has active applicant session, default phone to applicant phone
  useEffect(() => {
    if (hasActiveApplicantSession && user?.phone) {
      setPhone(filterPhoneInput(user.phone));
    }
  }, [hasActiveApplicantSession, user?.phone]);

  // Password validation helpers
  const isLengthValid = newPassword.length >= 6;
  const doPasswordsMatch =
    confirmPassword.length > 0 && newPassword === confirmPassword;
  const hasMismatch =
    confirmPassword.length > 0 && newPassword !== confirmPassword;

  // Handle Step 1: Request Activation / Identity Verification
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setIsAlreadyActivated(false);

    const trimmedIdentifier = identifier.trim();
    if (!trimmedIdentifier) {
      setErrorMsg("Please enter your Student ID or Roll Number.");
      return;
    }

    const shouldUseSession = hasActiveApplicantSession && useActiveSession;

    if (!shouldUseSession) {
      const trimmedPhone = phone.trim();
      if (!trimmedPhone || trimmedPhone.length !== 11) {
        setErrorMsg("Please enter a valid 11-digit registered mobile number (e.g. 03001234567).");
        return;
      }
      if (!applicantPassword) {
        setErrorMsg("Please enter your Applicant account password.");
        return;
      }
    }

    setIsLoading(true);

    try {
      const activeToken = shouldUseSession
        ? user?.token || storedApplicantToken || undefined
        : undefined;

      const result = await requestStudentActivation({
        identifier: trimmedIdentifier,
        phone: shouldUseSession ? undefined : phone.trim(),
        applicantPassword: shouldUseSession ? undefined : applicantPassword,
        applicantToken: activeToken,
      });

      // Securely store token strictly in component memory state
      setActivationToken(result.activationToken);
      setVerifiedStudent(result.student);
      setStep("set_password");
      setErrorMsg("");
    } catch (err: unknown) {
      const authErr = err as StudentAuthError;
      if (authErr.code === "ALREADY_ACTIVATED") {
        setIsAlreadyActivated(true);
        setErrorMsg(
          authErr.message ||
            "This student account has already been activated. You can sign in directly."
        );
      } else if (authErr.code === "STUDENT_NOT_FOUND") {
        setErrorMsg(
          "Enrolled student record not found. Please double-check your Student ID or Roll Number."
        );
      } else if (authErr.code === "INVALID_APPLICANT_CREDENTIALS") {
        setErrorMsg(
          "Verification failed: applicant credentials do not match student records. Please check your mobile number and password."
        );
      } else if (authErr.code === "FORBIDDEN") {
        setErrorMsg(
          authErr.message ||
            "Access forbidden: your applicant account is not linked to this student record."
        );
      } else {
        setErrorMsg(
          authErr.message || "Failed to verify student identity. Please try again."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Step 2: Set Initial Password
  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!activationToken) {
      setErrorMsg("Activation session has expired. Please verify your identity again.");
      setStep("verify");
      return;
    }

    if (!isLengthValid) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg("Passwords do not match. Please verify both fields.");
      return;
    }

    setIsLoading(true);

    try {
      const result = await activateStudentAccount({
        activationToken,
        password: newPassword,
        confirmPassword,
      });

      // Wipe security token immediately upon success
      setActivationToken(null);
      setNewPassword("");
      setConfirmPassword("");
      setVerifiedStudent({
        id: result.student.id,
        studentIdNumber: result.student.studentIdNumber,
        rollNumber: result.student.rollNumber,
        fullName: result.student.fullName,
      });
      setStep("success");
      setErrorMsg("");
    } catch (err: unknown) {
      const authErr = err as StudentAuthError;
      if (authErr.code === "ALREADY_ACTIVATED") {
        setIsAlreadyActivated(true);
        setErrorMsg(
          "Student account is already activated. Please sign in directly."
        );
      } else if (authErr.message?.toLowerCase().includes("expired")) {
        setErrorMsg(
          "Activation token has expired (15-minute limit). Please re-verify your identity to request a fresh token."
        );
        // Wipe expired token
        setActivationToken(null);
        setStep("verify");
      } else {
        setErrorMsg(authErr.message || "Failed to set initial password. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Reset back to Step 1 securely
  const handleBackToVerify = () => {
    setActivationToken(null);
    setNewPassword("");
    setConfirmPassword("");
    setErrorMsg("");
    setStep("verify");
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-background-secondary text-text-primary p-4 sm:p-6 lg:p-8">
      {/* Top Header Row with Navigation */}
      <div className="max-w-md w-full mx-auto flex items-center justify-between">
        <BackToHome variant="button" />
        <span className="text-xs text-slate-400 font-medium">
          Est. {MOCK_COLLEGE.establishedYear}
        </span>
      </div>

      {/* Main Activation Card Container */}
      <div className="max-w-md w-full mx-auto my-auto py-8">
        <div className="bg-white rounded-2xl border border-border shadow-xl p-6 sm:p-8 space-y-6">
          {/* Header Brand & Icon */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-primary-light flex items-center justify-center mx-auto border border-primary/20 shadow-xs mb-3">
              {step === "success" ? (
                <ShieldCheck className="w-6 h-6 text-emerald-600" />
              ) : (
                <KeyRound className="w-6 h-6 text-primary" />
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-text-primary">
              {step === "verify" && "Activate Student Account"}
              {step === "set_password" && "Set Initial Password"}
              {step === "success" && "Account Activated!"}
            </h1>
            <p className="text-xs text-text-secondary leading-relaxed">
              {step === "verify" &&
                "Newly admitted students: verify your enrolled identity to establish your initial student portal password."}
              {step === "set_password" &&
                "Identity verified. Choose a secure password for accessing your student dashboard, handouts, and fee vouchers."}
              {step === "success" &&
                "Your student account is active. You can now sign in using your official Roll Number or Student ID."}
            </p>
          </div>

          {/* Stepper Progress Indicator */}
          {step !== "success" && (
            <div className="flex items-center justify-center gap-2 pt-1 pb-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold">
                <span
                  className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-colors",
                    step === "verify"
                      ? "bg-primary text-white"
                      : "bg-emerald-500 text-white"
                  )}
                >
                  {step === "set_password" ? "✓" : "1"}
                </span>
                <span className={step === "verify" ? "text-primary" : "text-emerald-600"}>
                  Identity Verification
                </span>
              </div>

              <div className="w-8 h-0.5 bg-slate-200" />

              <div className="flex items-center gap-1.5 text-xs font-semibold">
                <span
                  className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-colors",
                    step === "set_password"
                      ? "bg-primary text-white"
                      : "bg-slate-100 text-slate-400 border border-slate-200"
                  )}
                >
                  2
                </span>
                <span
                  className={
                    step === "set_password" ? "text-primary" : "text-slate-400"
                  }
                >
                  Set Password
                </span>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {errorMsg && (
            <div
              className={cn(
                "p-3.5 border text-xs font-semibold rounded-xl space-y-2",
                isAlreadyActivated
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                  : "bg-rose-50 border-rose-200 text-rose-700"
              )}
            >
              <div className="flex items-start gap-2">
                <AlertCircle
                  className={cn(
                    "w-4 h-4 shrink-0 mt-0.5",
                    isAlreadyActivated ? "text-emerald-600" : "text-rose-500"
                  )}
                />
                <div className="flex-1 space-y-2">
                  <p className="leading-relaxed">{errorMsg}</p>
                  {isAlreadyActivated && (
                    <div className="pt-2 border-t border-emerald-200">
                      <Link
                        href="/student/login"
                        className="inline-flex items-center gap-1.5 font-bold text-emerald-900 bg-emerald-200/80 hover:bg-emerald-200 px-3 py-1.5 rounded-md transition-colors"
                      >
                        <span>Proceed to Student Login</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════ */}
          {/* STEP 1: IDENTITY VERIFICATION                                     */}
          {/* ══════════════════════════════════════════════════════════════════ */}
          {step === "verify" && (
            <form onSubmit={handleVerify} className="space-y-4">
              {/* Authenticated Applicant Session Card */}
              {hasActiveApplicantSession && (
                <div className="p-3.5 bg-primary-light/50 border border-primary/20 rounded-xl space-y-2.5">
                  <div className="flex items-start gap-2.5">
                    <UserCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <p className="font-semibold text-primary-dark">
                        Signed in as Applicant
                      </p>
                      <p className="text-text-secondary text-[11px]">
                        {user.name} {user.phone ? `(${user.phone})` : ""}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1 border-t border-primary/10">
                    <label className="flex items-center gap-2 text-xs text-text-primary cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={useActiveSession}
                        onChange={(e) => setUseActiveSession(e.target.checked)}
                        className="rounded border-border text-primary focus:ring-primary"
                      />
                      <span className="font-medium">
                        Verify using current applicant session
                      </span>
                    </label>
                  </div>
                </div>
              )}

              {/* Student Identifier Field */}
              <div className="space-y-1">
                <FormField
                  label="Student ID or Roll Number"
                  required
                >
                  <Input
                    type="text"
                    placeholder="e.g. BCS-F26-001 or 2026-F-CS-0001"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                    leftIcon={<GraduationCap className="w-4 h-4" />}
                    autoComplete="username"
                  />
                </FormField>
                <p className="text-[11px] text-text-muted pl-1">
                  Provided on your official College Admission Letter or notification.
                </p>
              </div>

              {/* Manual Applicant Credentials (if not using active session) */}
              {(!hasActiveApplicantSession || !useActiveSession) && (
                <div className="space-y-4 pt-1 border-t border-slate-100">
                  <div className="space-y-1">
                    <FormField
                      label="Registered Applicant Mobile Number"
                      required
                    >
                      <Input
                        type="tel"
                        inputMode="numeric"
                        placeholder="03001234567"
                        value={phone}
                        onChange={(e) => setPhone(filterPhoneInput(e.target.value))}
                        required
                        leftIcon={<Phone className="w-4 h-4" />}
                        autoComplete="tel"
                        maxLength={11}
                      />
                    </FormField>
                    <p className="text-[11px] text-text-muted pl-1">
                      The 11-digit mobile number used when submitting your admission application.
                    </p>
                  </div>

                  <div className="space-y-1">
                    <FormField
                      label="Applicant Account Password"
                      required
                    >
                      <div className="relative">
                        <Input
                          type={showApplicantPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={applicantPassword}
                          onChange={(e) => setApplicantPassword(e.target.value)}
                          required
                          leftIcon={<Lock className="w-4 h-4" />}
                          autoComplete="current-password"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowApplicantPassword(!showApplicantPassword)
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                          aria-label={
                            showApplicantPassword
                              ? "Hide password"
                              : "Show password"
                          }
                        >
                          {showApplicantPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </FormField>
                    <p className="text-[11px] text-text-muted pl-1">
                      Your admission applicant portal password.
                    </p>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                className="w-full mt-2"
                isLoading={isLoading}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Verify Identity & Continue
              </Button>

              <div className="text-center pt-2">
                <Link
                  href="/student/login"
                  className="inline-flex items-center gap-1.5 text-xs text-text-secondary hover:text-text-primary transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Student Portal Login</span>
                </Link>
              </div>
            </form>
          )}

          {/* ══════════════════════════════════════════════════════════════════ */}
          {/* STEP 2: SET INITIAL PASSWORD                                      */}
          {/* ══════════════════════════════════════════════════════════════════ */}
          {step === "set_password" && (
            <form onSubmit={handleActivate} className="space-y-4">
              {/* Verified Identity Summary Card */}
              {verifiedStudent && (
                <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                      Identity Verified
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      15m session
                    </span>
                  </div>
                  <div className="text-xs space-y-1 text-text-primary">
                    <p className="font-bold text-sm text-text-primary">
                      {verifiedStudent.fullName}
                    </p>
                    <p className="text-text-secondary">
                      Roll Number:{" "}
                      <span className="font-semibold text-text-primary font-mono">
                        {verifiedStudent.rollNumber}
                      </span>
                    </p>
                    <p className="text-text-secondary">
                      Student ID:{" "}
                      <span className="font-semibold text-text-primary font-mono">
                        {verifiedStudent.studentIdNumber}
                      </span>
                    </p>
                  </div>
                </div>
              )}

              {/* New Password */}
              <div className="space-y-1">
                <FormField label="New Student Password" required>
                  <div className="relative">
                    <Input
                      type={showNewPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      leftIcon={<Lock className="w-4 h-4" />}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                      aria-label={
                        showNewPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showNewPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </FormField>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1">
                <FormField label="Confirm Password" required>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      leftIcon={<Lock className="w-4 h-4" />}
                      autoComplete="new-password"
                      error={hasMismatch ? "Passwords do not match" : undefined}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                      aria-label={
                        showConfirmPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </FormField>
              </div>

              {/* Password Requirements Checklist */}
              <div className="p-3 rounded-lg bg-background-secondary border border-border text-xs space-y-1.5">
                <div className="flex items-center gap-2">
                  {isLengthValid ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  ) : (
                    <span className="w-3.5 h-3.5 rounded-full border border-slate-300 inline-block shrink-0" />
                  )}
                  <span
                    className={
                      isLengthValid
                        ? "text-emerald-700 font-medium"
                        : "text-text-secondary"
                    }
                  >
                    At least 6 characters in length
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {doPasswordsMatch ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  ) : hasMismatch ? (
                    <X className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  ) : (
                    <span className="w-3.5 h-3.5 rounded-full border border-slate-300 inline-block shrink-0" />
                  )}
                  <span
                    className={
                      doPasswordsMatch
                        ? "text-emerald-700 font-medium"
                        : hasMismatch
                          ? "text-rose-600 font-medium"
                          : "text-text-secondary"
                    }
                  >
                    Passwords match
                  </span>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full mt-2"
                isLoading={isLoading}
                disabled={!isLengthValid || !doPasswordsMatch}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Activate Account & Save Password
              </Button>

              <div className="flex items-center justify-between pt-2 text-xs">
                <button
                  type="button"
                  onClick={handleBackToVerify}
                  className="inline-flex items-center gap-1 text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Cancel / Re-verify</span>
                </button>

                <Link
                  href="/student/login"
                  className="text-primary hover:underline font-semibold"
                >
                  Student Login
                </Link>
              </div>
            </form>
          )}

          {/* ══════════════════════════════════════════════════════════════════ */}
          {/* STEP 3: SUCCESS STATE                                             */}
          {/* ══════════════════════════════════════════════════════════════════ */}
          {step === "success" && (
            <div className="space-y-6 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h2 className="text-xl font-bold text-text-primary">
                  Activation Completed
                </h2>
                <p className="text-xs text-text-secondary leading-relaxed max-w-sm mx-auto">
                  Your student password has been created and your account is now fully active. You may now sign in to your student dashboard.
                </p>
              </div>

              {verifiedStudent && (
                <div className="p-4 rounded-xl bg-background-secondary border border-border text-left text-xs space-y-1.5">
                  <p className="font-bold text-text-primary text-sm">
                    {verifiedStudent.fullName}
                  </p>
                  <div className="flex items-center justify-between pt-1 border-t border-border">
                    <span className="text-text-secondary">Roll Number:</span>
                    <span className="font-mono font-bold text-text-primary">
                      {verifiedStudent.rollNumber}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary">Student ID:</span>
                    <span className="font-mono font-bold text-text-primary">
                      {verifiedStudent.studentIdNumber}
                    </span>
                  </div>
                </div>
              )}

              <div className="space-y-3 pt-2">
                <Link href="/student/login" className="block w-full">
                  <Button
                    variant="primary"
                    className="w-full"
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Proceed to Student Login
                  </Button>
                </Link>

                <Link href="/" className="block w-full">
                  <Button variant="ghost" className="w-full text-xs" size="sm">
                    Return to College Homepage
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* Security architecture and production readiness notice */}
          <div className="pt-4 border-t border-slate-100 text-center text-[11px] text-slate-500 space-y-2">
            <div className="p-3 bg-amber-50/70 border border-amber-200/60 rounded-xl text-left space-y-1 text-amber-900">
              <div className="flex items-center gap-1.5 font-bold text-amber-950">
                <AlertCircle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                <span>Security Notice — Development / Staging Mode</span>
              </div>
              <p className="text-[11px] leading-relaxed text-amber-800">
                This activation flow is operating in local development mode with in-response token generation. Production readiness requires integrating an out-of-band delivery service (e.g. verified SMS gateway or transactional email service) to dispatch activation links securely.
              </p>
            </div>
            <p className="text-[10px] text-slate-400">
              College security policy: Student passwords must be kept confidential. Never share your credentials.
            </p>
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
