"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { BackToHome } from "@/components/ui/BackToHome";
import { MOCK_COLLEGE } from "@/lib/mock-data";
import {
  Lock,
  Mail,
  Phone,
  User,
  ArrowRight,
  GraduationCap,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  X,
} from "lucide-react";

// ─── Pakistan phone format helpers ───────────────────────────────────────────

/**
 * Normalises a typed phone string into a canonical "+92 3XX XXXXXXX" form.
 * Strips spaces, dashes, parentheses first, then attempts to match
 * the local variant (03xxxxxxxxx) or the international variant (+923xxxxxxxxx).
 */
function normalizePKPhone(raw: string): string {
  const stripped = raw.replace(/[\s\-().]/g, "");
  // Local format: 03XXXXXXXXX  (11 digits starting with 03)
  if (/^03\d{9}$/.test(stripped)) {
    return `+92 ${stripped.slice(1, 4)} ${stripped.slice(4)}`;
  }
  // International +92: +923XXXXXXXXX  (13 chars)
  if (/^\+923\d{9}$/.test(stripped)) {
    return `+92 ${stripped.slice(3, 6)} ${stripped.slice(6)}`;
  }
  // Already formatted "+92 3XX XXXXXXX"
  if (/^\+92 3\d{2} \d{7}$/.test(raw.trim())) {
    return raw.trim();
  }
  return raw; // return as-is if unrecognisable (validation will catch it)
}

/** Returns true if the phone resolves to a valid PK mobile number. */
function isValidPKPhone(raw: string): boolean {
  const stripped = raw.replace(/[\s\-().]/g, "");
  return (
    /^03\d{9}$/.test(stripped) ||
    /^\+923\d{9}$/.test(stripped)
  );
}

/** Format display as user types: insert spaces for readability. */
function formatPhoneInput(value: string): string {
  // Strip everything except digits and leading +
  let digits = value.replace(/[^\d+]/g, "");
  // If user typed local (0…), keep leading 0
  if (digits.startsWith("0")) {
    // 0 3XX XXXXXXX
    if (digits.length <= 4) return digits;
    if (digits.length <= 7) return `${digits.slice(0, 4)} ${digits.slice(4)}`;
    return `${digits.slice(0, 4)} ${digits.slice(4, 11)}`;
  }
  // If user typed +92…
  if (digits.startsWith("+92") || digits.startsWith("92")) {
    digits = digits.startsWith("+92") ? digits : `+${digits}`;
    if (digits.length <= 4) return digits;
    if (digits.length <= 7) return `${digits.slice(0, 4)} ${digits.slice(4)}`;
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 14)}`;
  }
  return value;
}

// ─── localStorage duplicate-check prototype helper ───────────────────────────
const REGISTERED_PHONES_KEY = "cms_registered_phones";

function isPhoneAlreadyRegistered(normalizedPhone: string): boolean {
  try {
    const stored = localStorage.getItem(REGISTERED_PHONES_KEY);
    if (stored) {
      const phones: string[] = JSON.parse(stored);
      if (phones.includes(normalizedPhone)) return true;
    }
    const authStored = localStorage.getItem("cms_demo_auth_user");
    if (authStored) {
      const user = JSON.parse(authStored) as { phone?: string };
      if (user.phone && normalizePKPhone(user.phone) === normalizedPhone) {
        return true;
      }
    }
    return false;
  } catch {
    return false;
  }
}

function registerPhone(normalizedPhone: string): void {
  try {
    const stored = localStorage.getItem(REGISTERED_PHONES_KEY);
    const phones: string[] = stored ? JSON.parse(stored) : [];
    if (!phones.includes(normalizedPhone)) {
      phones.push(normalizedPhone);
      localStorage.setItem(REGISTERED_PHONES_KEY, JSON.stringify(phones));
    }
  } catch {
    // ignore
  }
}

// ─── Password strength meter ──────────────────────────────────────────────────
function getPasswordStrength(pw: string): { level: 0 | 1 | 2 | 3; label: string; color: string } {
  if (pw.length === 0) return { level: 0, label: "", color: "" };
  if (pw.length < 6) return { level: 1, label: "Too short", color: "bg-rose-500" };
  const hasUpper = /[A-Z]/.test(pw);
  const hasDigit = /\d/.test(pw);
  const hasSpecial = /[^a-zA-Z0-9]/.test(pw);
  const strong = hasUpper && hasDigit && hasSpecial && pw.length >= 8;
  if (strong) return { level: 3, label: "Strong", color: "bg-emerald-500" };
  if (pw.length >= 6 && (hasDigit || hasUpper)) return { level: 2, label: "Moderate", color: "bg-amber-400" };
  return { level: 1, label: "Weak", color: "bg-rose-500" };
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function ApplicantRegisterPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [fullName, setFullName]         = useState("");
  const [phone, setPhone]               = useState("");
  const [email, setEmail]               = useState("");
  const [password, setPassword]         = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);
  const [error, setError]               = useState("");
  const [duplicatePhone, setDuplicatePhone] = useState(false);
  const [duplicateAnimKey, setDuplicateAnimKey] = useState(0);
  const [fieldErrors, setFieldErrors]   = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess]           = useState(false);
  const phoneInputRef = useRef<HTMLInputElement>(null);

  const strength = getPasswordStrength(password);

  // ── Inline field validation ──────────────────────────────────────────────
  const validateField = (name: string, value: string) => {
    const errs = { ...fieldErrors };
    switch (name) {
      case "fullName":
        errs.fullName = value.trim().length < 3 ? "Please enter your full name (at least 3 characters)." : "";
        break;
      case "phone":
        errs.phone = value && !isValidPKPhone(value)
          ? "Enter a valid Pakistan mobile number, e.g. 0312 3456789 or +92 312 3456789."
          : "";
        break;
      case "email":
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errs.email = "Enter a valid email address or leave this field empty.";
        } else {
          errs.email = "";
        }
        break;
      case "password":
        errs.password = value.length > 0 && value.length < 6 ? "Password must be at least 6 characters." : "";
        break;
      case "confirmPassword":
        errs.confirmPassword = value && value !== password ? "Passwords do not match." : "";
        break;
    }
    setFieldErrors(errs);
  };

  // ── Form submit ──────────────────────────────────────────────────────────
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const clearDuplicateAndSetError = (message: string) => {
      setDuplicatePhone(false);
      setError(message);
    };

    // Full validation pass
    if (fullName.trim().length < 3) {
      clearDuplicateAndSetError("Please enter your full name.");
      return;
    }
    if (!isValidPKPhone(phone)) {
      clearDuplicateAndSetError("Please enter a valid Pakistan mobile number (e.g. 0312 3456789).");
      return;
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      clearDuplicateAndSetError("The email address format is invalid. You may also leave it blank.");
      return;
    }
    if (password.length < 6) {
      clearDuplicateAndSetError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      clearDuplicateAndSetError("Passwords do not match. Please verify your entry.");
      return;
    }

    const normalizedPhone = normalizePKPhone(phone);

    // Duplicate phone: never create a second account
    if (isPhoneAlreadyRegistered(normalizedPhone)) {
      setError("");
      setDuplicatePhone(true);
      setDuplicateAnimKey((k) => k + 1);
      return;
    }

    setIsSubmitting(true);

    // Simulate async registration (replace with real API call later)
    setTimeout(() => {
      registerPhone(normalizedPhone);
      login("applicant", {
        name: fullName.trim(),
        email: email || undefined,
        phone: normalizedPhone,
      });
      setIsSubmitting(false);
      setSuccess(true);
      setTimeout(() => router.push("/admissions"), 900);
    }, 700);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col bg-background-secondary text-text-primary">
      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <div className="w-full px-4 pt-5 pb-2">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <BackToHome variant="button" />
          <span className="text-[11px] text-text-muted font-medium tracking-wide">
            Admissions Open — Fall 2026
          </span>
        </div>
      </div>

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-lg">

          {/* Institution branding strip */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-primary flex items-center justify-center shadow-sm shrink-0">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-primary leading-none">
                {MOCK_COLLEGE.name}
              </p>
              <p className="text-[10px] text-text-muted font-medium mt-0.5">
                {MOCK_COLLEGE.city} Campus · Admissions Portal
              </p>
            </div>
          </div>

          {/* Card */}
          <div className="bg-white border border-border shadow-xl">

            {/* Card header */}
            <div className="px-6 sm:px-8 pt-7 pb-6 border-b border-border">
              <div className="flex items-start gap-3">
                <div className="w-1 h-12 bg-primary shrink-0 mt-0.5" />
                <div>
                  <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-text-primary leading-tight">
                    Create Applicant Account
                  </h1>
                  <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                    Register to apply for Fall 2026 admission. Your phone number is your
                    primary account identifier.
                  </p>
                </div>
              </div>
            </div>

            {/* Form body */}
            <div className="px-6 sm:px-8 py-7 space-y-5">

              {/* ── Success state ── */}
              {success && (
                <div className="flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800">
                  <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-600" />
                  <div>
                    <p className="text-sm font-bold">Account created successfully!</p>
                    <p className="text-xs mt-0.5 text-emerald-700">
                      Redirecting you to your Applicant Portal…
                    </p>
                  </div>
                </div>
              )}

              {/* ── Global error (validation only — not duplicate phone) ── */}
              {error && !success && !duplicatePhone && (
                <div className="flex items-start gap-3 p-4 bg-rose-50 border border-rose-200 text-rose-700">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p className="text-xs font-semibold leading-relaxed">{error}</p>
                </div>
              )}

              {!success && (
                <form onSubmit={handleSubmit} noValidate className="space-y-5">

                  {/* Full Name */}
                  <FormField
                    label="Full Name"
                    required
                    error={fieldErrors.fullName}
                  >
                    <Input
                      id="reg-fullname"
                      type="text"
                      placeholder="e.g. Hamza Ahmed Khan"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      onBlur={(e) => validateField("fullName", e.target.value)}
                      required
                      leftIcon={<User className="w-4 h-4" />}
                      autoComplete="name"
                    />
                  </FormField>

                  {/* Phone Number — PRIMARY identifier */}
                  <div className="space-y-1">
                    <FormField
                      label="Mobile Number"
                      required
                      error={fieldErrors.phone}
                    >
                      <Input
                        ref={phoneInputRef}
                        id="reg-phone"
                        type="tel"
                        placeholder="0312 3456789 or +92 312 3456789"
                        value={phone}
                        onChange={(e) => {
                          const formatted = formatPhoneInput(e.target.value);
                          setPhone(formatted);
                          if (duplicatePhone) setDuplicatePhone(false);
                        }}
                        onBlur={(e) => validateField("phone", e.target.value)}
                        required
                        leftIcon={<Phone className="w-4 h-4" />}
                        autoComplete="tel"
                        maxLength={16}
                      />
                    </FormField>
                    <p className="text-[11px] text-text-muted pl-1">
                      Pakistan mobile number (Jazzcash, Telenor, Ufone, Zong, Warid).
                      This will be your <span className="font-semibold text-primary">login ID</span>.
                    </p>
                  </div>

                  {/* Email — OPTIONAL */}
                  <div className="space-y-1">
                    <FormField
                      label={
                        <span className="flex items-center gap-2">
                          Email Address
                          <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted bg-background-secondary border border-border px-1.5 py-0.5">
                            Optional
                          </span>
                        </span>
                      }
                      error={fieldErrors.email}
                    >
                      <Input
                        id="reg-email"
                        type="email"
                        placeholder="your.email@gmail.com (not required)"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onBlur={(e) => validateField("email", e.target.value)}
                        leftIcon={<Mail className="w-4 h-4" />}
                        autoComplete="email"
                      />
                    </FormField>
                    <p className="text-[11px] text-text-muted pl-1">
                      You can apply without an email address. If provided, admission
                      notifications may be sent here.
                    </p>
                  </div>

                  {/* Divider */}
                  <div className="flex items-center gap-3 pt-1">
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                      Set Password
                    </span>
                    <div className="flex-1 h-px bg-border" />
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <FormField
                      label="Password"
                      required
                      error={fieldErrors.password}
                    >
                      <div className="relative">
                        <Input
                          id="reg-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Minimum 6 characters"
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            validateField("password", e.target.value);
                          }}
                          required
                          leftIcon={<Lock className="w-4 h-4" />}
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-primary transition-colors"
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword
                            ? <EyeOff className="w-4 h-4" />
                            : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </FormField>

                    {/* Strength meter */}
                    {password.length > 0 && (
                      <div className="space-y-1 pl-1">
                        <div className="flex gap-1">
                          {[1, 2, 3].map((bar) => (
                            <div
                              key={bar}
                              className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                                strength.level >= bar ? strength.color : "bg-border"
                              }`}
                            />
                          ))}
                        </div>
                        <p className={`text-[11px] font-semibold ${
                          strength.level === 3 ? "text-emerald-600"
                          : strength.level === 2 ? "text-amber-600"
                          : "text-rose-600"
                        }`}>
                          {strength.label}
                          {strength.level === 1 && " — use letters, numbers & symbols"}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <FormField
                    label="Confirm Password"
                    required
                    error={fieldErrors.confirmPassword}
                  >
                    <div className="relative">
                      <Input
                        id="reg-confirm-password"
                        type={showConfirm ? "text" : "password"}
                        placeholder="Re-enter your password"
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          validateField("confirmPassword", e.target.value);
                        }}
                        required
                        leftIcon={<Lock className="w-4 h-4" />}
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-primary transition-colors"
                        aria-label={showConfirm ? "Hide password" : "Show password"}
                      >
                        {showConfirm
                          ? <EyeOff className="w-4 h-4" />
                          : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </FormField>

                  {/* Submit */}
                  <div className="pt-2">
                    <Button
                      type="submit"
                      variant="primary"
                      className="w-full rounded-none shadow-md hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300"
                      isLoading={isSubmitting}
                      rightIcon={<ArrowRight className="w-4 h-4" />}
                    >
                      Create Applicant Account
                    </Button>
                  </div>

                  {/* Data note */}
                  <p className="text-[10px] text-text-muted text-center leading-relaxed pt-1">
                    Your information is used solely for admission processing at{" "}
                    <span className="font-semibold">{MOCK_COLLEGE.name}</span>
                    {" "}and will not be shared with third parties.
                  </p>
                </form>
              )}
            </div>

            {/* Card footer */}
            <div className="px-6 sm:px-8 py-5 bg-background-secondary border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-text-secondary">
              <p>
                Already registered?{" "}
                <Link href="/login" className="text-primary font-semibold hover:underline">
                  Sign in to your portal →
                </Link>
              </p>
              <Link href="/admissions" className="text-text-muted hover:text-primary transition-colors">
                View admission info
              </Link>
            </div>
          </div>

          {/* Bottom copyright */}
          <p className="text-center text-[11px] text-text-muted mt-6">
            &copy; {new Date().getFullYear()} {MOCK_COLLEGE.name}. All rights reserved.
          </p>
        </div>
      </div>

      {/* Duplicate phone — viewport slide-up so Apply clicks always show the message */}
      {duplicatePhone && !success && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-end">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/40"
            aria-label="Dismiss account already exists message"
            onClick={() => setDuplicatePhone(false)}
          />
          <div
            key={duplicateAnimKey}
            role="alert"
            aria-live="assertive"
            className="relative w-full max-w-lg mx-auto bg-white border-t border-amber-200 shadow-[0_-12px_40px_rgba(15,23,42,0.18)] px-5 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]"
            style={{ animation: "sheetSlideUp 0.38s cubic-bezier(0.16, 1, 0.3, 1) both" }}
          >
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-border" />
            <button
              type="button"
              onClick={() => setDuplicatePhone(false)}
              className="absolute right-3 top-3 p-1.5 text-text-muted hover:text-text-primary transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
            <Alert variant="warning" title="Account Already Exists" className="rounded-none border-0 bg-transparent p-0">
              <p className="text-sm leading-relaxed">
                An applicant account already exists with this phone number.
                Please sign in to continue your admission application.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 pt-4">
                <Button
                  variant="primary"
                  size="sm"
                  className="rounded-none"
                  onClick={() => router.push("/login")}
                >
                  Sign In
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-none"
                  onClick={() => {
                    setDuplicatePhone(false);
                    setPhone("");
                    setFieldErrors((prev) => ({ ...prev, phone: "" }));
                    requestAnimationFrame(() => phoneInputRef.current?.focus());
                  }}
                >
                  Use a different number
                </Button>
              </div>
            </Alert>
          </div>
        </div>
      )}
    </div>
  );
}
