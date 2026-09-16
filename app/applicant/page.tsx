"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { MOCK_COLLEGE } from "@/lib/mock-data";
import {
  GraduationCap,
  LogOut,
  Home,
  FileText,
  Clock,
  User,
  FolderCheck,
  HelpCircle,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Upload,
  AlertCircle,
  Save,
  Send,
  Phone,
  LayoutDashboard,
  Bell,
  Mail,
  Building2,
  Award,
  ShieldCheck,
  Download,
  Check,
  MapPin,
} from "lucide-react";
import { Input } from "@/components/ui/Input";
import { FormField } from "@/components/ui/FormField";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Alert } from "@/components/ui/Alert";
import { LoadingState } from "@/components/ui/LoadingState";
import {
  DEFAULT_APPLICANT_APPLICATION,
  getApplication,
  saveApplication,
  submitApplication,
  syncApplicantStatusFromAdmin,
  type ApplicantApplicationData,
} from "@/lib/services/admission-service";

// ─── TYPES & LOCAL STORAGE KEYS ──────────────────────────────────────────────
const APPLICATION_STORAGE_KEY = "cms_applicant_admission_data";

type ApplicationData = ApplicantApplicationData;

const DEFAULT_APP_DATA: ApplicationData = DEFAULT_APPLICANT_APPLICATION;

const FORM_STEPS = [
  { step: 1, title: "Personal", fullTitle: "Personal Information", description: "Identity & personal details" },
  { step: 2, title: "Contact & Address", fullTitle: "Contact & Address", description: "Phone, email & address" },
  { step: 3, title: "Guardian", fullTitle: "Parent / Guardian", description: "Emergency contact" },
  { step: 4, title: "Academic", fullTitle: "Academic Information", description: "Educational history" },
  { step: 5, title: "Preferences", fullTitle: "Program & Preferences", description: "Discipline & shift" },
  { step: 6, title: "Review & Submit", fullTitle: "Documents & Review", description: "Verification & submit" },
];

export default function ApplicantDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={["applicant"]}>
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center bg-background-secondary">
            <LoadingState label="Loading applicant portal..." />
          </div>
        }
      >
        <ApplicantDashboardContent />
      </Suspense>
    </ProtectedRoute>
  );
}

function ApplicantDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, logout } = useAuth();

  const [activeTab, setActiveTab] = useState<
    "dashboard" | "application" | "status" | "personal" | "documents" | "help"
  >("dashboard");

  const [formStep, setFormStep] = useState<number>(1);
  const [appData, setAppData] = useState<ApplicationData>(DEFAULT_APP_DATA);
  const [saveToast, setSaveToast] = useState<string | null>(null);

  useEffect(() => {
    const requestedTab = searchParams.get("tab");
    const validTabs = ["dashboard", "application", "status", "personal", "documents", "help"] as const;
    if (requestedTab && validTabs.includes(requestedTab as (typeof validTabs)[number])) {
      setActiveTab(requestedTab as typeof activeTab);
      return;
    }
    setActiveTab("dashboard");
  }, [searchParams]);

  // Step validation state
  const [stepErrors, setStepErrors] = useState<Record<string, string>>({});
  const [stepErrorMessage, setStepErrorMessage] = useState<string | null>(null);

  // Load persisted application data or prefill user details
  useEffect(() => {
    let cancelled = false;
    getApplication()
      .then((stored) => syncApplicantStatusFromAdmin(stored))
      .then((stored) => {
        if (cancelled) return;
        if (stored) {
          setAppData(stored);
          return;
        }
        if (user) {
          setAppData((prev) => ({
            ...prev,
            fullName: user.name || "",
            email: user.email && !user.email.endsWith("@apex.edu.pk") ? user.email : "",
            phone: user.phone || "",
          }));
        }
      })
      .catch(() => {
        // Prototype storage is best-effort.
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  // Save progress helper
  const saveProgress = (newData: Partial<ApplicationData>) => {
    const updated = { ...appData, ...newData };
    setAppData(updated);
    void saveApplication(newData, appData);
  };

  const handleSaveDraft = () => {
    saveProgress({});
    setSaveToast("Draft saved successfully.");
    setTimeout(() => setSaveToast(null), 3000);
  };

  // Step restriction & validation helper
  const validateStep = (step: number): { valid: boolean; errors: Record<string, string> } => {
    const errors: Record<string, string> = {};

    if (step === 1) {
      if (!appData.fullName.trim() || appData.fullName.trim().length < 3) {
        errors.fullName = "Please enter your full name (at least 3 characters).";
      }
      if (!appData.dob) {
        errors.dob = "Date of birth is required.";
      }
      if (!appData.idNumber.trim()) {
        errors.idNumber = `Please enter a valid ${appData.idType} number.`;
      }
      if (!appData.nationality.trim()) {
        errors.nationality = "Nationality is required.";
      }
      if (!appData.religion.trim()) {
        errors.religion = "Religion is required.";
      }
    } else if (step === 2) {
      if (!appData.phone.trim() || !/^\d{11}$/.test(appData.phone.trim())) {
        errors.phone = "Mobile number must contain exactly 11 digits.";
      }
      if (!appData.domicile.trim()) {
        errors.domicile = "Domicile district is required.";
      }
      if (!appData.address.trim() || appData.address.trim().length < 6) {
        errors.address = "Please enter your full permanent postal address.";
      }
    } else if (step === 3) {
      if (!appData.fatherName.trim() || appData.fatherName.trim().length < 3) {
        errors.fatherName = "Please enter your father's full name.";
      }
      if (!appData.motherName.trim() || appData.motherName.trim().length < 3) {
        errors.motherName = "Please enter your mother's full name.";
      }
      if (!appData.altPhone.trim() || !/^\d{11}$/.test(appData.altPhone.trim())) {
        errors.altPhone = "Mobile number must contain exactly 11 digits.";
      }
    } else if (step === 4) {
      if (!appData.matricBoard.trim()) {
        errors.matricBoard = "Matric examination board is required.";
      }
      if (!appData.matricRollNo.trim()) {
        errors.matricRollNo = "Matric roll number is required.";
      }
      if (!appData.matricYear.trim()) {
        errors.matricYear = "Passing year is required.";
      }
      if (!appData.matricGroup.trim()) {
        errors.matricGroup = "Academic group is required.";
      }
      if (!appData.matricTotalMarks || Number(appData.matricTotalMarks) <= 0) {
        errors.matricTotalMarks = "Total marks must be greater than 0.";
      }
      if (
        !appData.matricObtainedMarks ||
        Number(appData.matricObtainedMarks) <= 0 ||
        Number(appData.matricObtainedMarks) > Number(appData.matricTotalMarks)
      ) {
        errors.matricObtainedMarks = "Enter valid obtained marks (cannot exceed total marks).";
      }

      if (appData.academicLevel === "Undergraduate" && appData.interStatus === "Passed") {
        if (!appData.interBoard?.trim()) {
          errors.interBoard = "Intermediate board/college is required.";
        }
        if (!appData.interRollNo?.trim()) {
          errors.interRollNo = "Intermediate roll number is required.";
        }
        if (!appData.interObtainedMarks?.trim()) {
          errors.interObtainedMarks = "Intermediate obtained marks are required.";
        }
      }
    } else if (step === 5) {
      if (!appData.academicLevel) {
        errors.academicLevel = "Please select an academic level.";
      }
      if (!appData.primaryProgram) {
        errors.primaryProgram = "Please select a primary program preference.";
      }
      if (!appData.preferredShift) {
        errors.preferredShift = "Please select a preferred shift.";
      }
    } else if (step === 6) {
      if (!appData.documents.matricResultCard) {
        errors.matricResultCard = "Please upload a scan of your Matric Result Card.";
      }
      if (!appData.documents.cnicOrBForm) {
        errors.cnicOrBForm = "Please upload a scan of your CNIC or B-Form document.";
      }
    }

    return { valid: Object.keys(errors).length === 0, errors };
  };

  const handleStepChange = (targetStep: number) => {
    if (targetStep < 1 || targetStep > 6) return;
    if (targetStep > formStep + 1) return;

    // If moving backwards or staying on current step, allow freely
    if (targetStep <= formStep) {
      setStepErrors({});
      setStepErrorMessage(null);
      setFormStep(targetStep);
      return;
    }

    // Check if current step passes validation before moving forward
    const { valid, errors } = validateStep(formStep);
    if (!valid) {
      setStepErrors(errors);
      setStepErrorMessage(
        "Please fill in all required fields marked with * before moving to the next step."
      );
      window.scrollTo({ top: 260, behavior: "smooth" });
      return;
    }

    // Step valid: proceed to target step
    saveProgress({});
    setStepErrors({});
    setStepErrorMessage(null);
    setFormStep(targetStep);
    window.scrollTo({ top: 260, behavior: "smooth" });
  };

  // Submit Application
  const handleSubmitApplication = () => {
    for (let s = 1; s <= 6; s++) {
      const { valid, errors } = validateStep(s);
      if (!valid) {
        setStepErrors(errors);
        setStepErrorMessage(
          s === 6
            ? "Please upload all required documents before submitting."
            : `Please complete required fields in Step ${s} before submitting.`
        );
        setFormStep(s);
        window.scrollTo({ top: 260, behavior: "smooth" });
        return;
      }
    }

    if (!appData.undertakingAgreed) {
      setStepErrorMessage("You must agree to the undertaking declaration before submitting.");
      window.scrollTo({ top: 260, behavior: "smooth" });
      return;
    }

    void submitApplication(appData).then((finalData) => {
      setAppData(finalData);
      setActiveTab("status");
      setSaveToast("Application submitted successfully! Admissions can now review it.");
      setTimeout(() => setSaveToast(null), 4000);
    });
  };

  const hasApplication = Boolean(
    appData.appId ||
      appData.fullName.trim() ||
      appData.idNumber.trim() ||
      appData.phone.trim() ||
      appData.email.trim() ||
      appData.primaryProgram.trim() ||
      appData.matricRollNo.trim()
  );

  const dashboardProgress = (() => {
    if (!hasApplication) return 0;
    switch (appData.status) {
      case "Draft":
        return 25;
      case "Submitted":
        return 55;
      case "Under Review":
        return 75;
      case "More Information Required":
        return 68;
      case "On Hold":
        return 62;
      case "Accepted":
      case "Admitted":
      case "Merit Qualified":
        return 100;
      case "Rejected":
        return 88;
      default:
        return 50;
    }
  })();

  const dashboardStatusText = (() => {
    if (!hasApplication) return "No application started";
    if (appData.status === "Draft") return "Draft in progress";
    if (appData.status === "Submitted") return "Submitted and pending review";
    if (appData.status === "Under Review") return "Under review by admissions";
    if (appData.status === "More Information Required") return "Updated information required";
    if (appData.status === "On Hold") return "Application on hold";
    if (appData.status === "Accepted" || appData.status === "Admitted" || appData.status === "Merit Qualified") return "Offer ready for next step";
    if (appData.status === "Rejected") return "Application not accepted";
    return appData.status;
  })();

  const dashboardNotifications = [
    {
      title: "Application status",
      detail:
        appData.status === "Draft"
          ? "Your application is still being prepared. Please complete and submit it to move forward."
          : appData.status === "Submitted"
            ? "Your application has been submitted successfully and is awaiting review by the admissions office."
            : appData.status === "Under Review"
              ? "The admissions team is reviewing your academic records and supporting details."
              : appData.status === "More Information Required"
                ? "The college has requested additional details before continuing with your application."
                : appData.status === "On Hold"
                  ? "Your application is currently on hold. Please review the message below for the next step."
                  : appData.status === "Accepted" || appData.status === "Admitted" || appData.status === "Merit Qualified"
                    ? "Your application has progressed to an offer or admission decision stage."
                    : appData.status === "Rejected"
                      ? "This application is not continuing in the current cycle. Please review the reason provided."
                      : "Application updates will appear here once the admissions office processes your file.",
    },
    {
      title: "Next action",
      detail:
        !hasApplication
          ? "Start your application to begin the admissions process."
          : appData.status === "Draft"
            ? "Complete the remaining admission steps and submit the form when ready."
            : appData.status === "Submitted"
              ? "Track your application and wait for the admissions review cycle to complete."
              : appData.status === "More Information Required"
                ? "Update the form with the required information and resubmit the relevant fields."
                : appData.status === "On Hold"
                  ? "Review the hold reason and follow the admissions instruction provided."
                  : appData.status === "Accepted" || appData.status === "Admitted"
                    ? "Prepare for the future student enrollment steps and admissions instructions."
                    : "Review your application status and follow the current admissions guidance.",
    },
  ];

  const openApplicationFlow = (target: "application" | "status") => {
    setActiveTab(target);
    router.push(`/applicant?tab=${target}`);
  };

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden bg-background-secondary text-text-primary">

      {/* ── HEADER ────────────────────────────────────────────────────────── */}
      <header className="bg-primary-dark text-white border-b border-primary/30 sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between gap-4">

            {/* Left: Logo & Brand */}
            <div className="flex min-w-0 items-center gap-3">
              <div className="w-9 h-9 bg-accent-gold flex items-center justify-center text-primary-dark font-extrabold shadow-sm shrink-0">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h1 className="truncate text-sm font-extrabold tracking-tight uppercase leading-none text-white">
                  {MOCK_COLLEGE.name}
                </h1>
                <p className="text-[10px] text-white/70 tracking-widest font-semibold uppercase mt-0.5">
                  Applicant Portal · Fall 2026
                </p>
              </div>
            </div>

            {/* Center / Right: User Info & Actions */}
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="hidden md:flex flex-col text-right">
                <span className="text-xs font-bold text-white leading-none">
                  {user?.name || appData.fullName || "Applicant"}
                </span>
                <span className="text-[10px] font-mono text-accent-gold mt-1">
                  ID: {appData.appId || "Draft Application"}
                </span>
              </div>

              <div className="h-6 w-px bg-white/20 hidden sm:block" />

              <Link
                href="/"
                className="inline-flex min-h-11 items-center gap-1.5 whitespace-nowrap px-3 text-xs text-white/90 hover:text-white hover:bg-white/10 transition-colors border border-white/20"
              >
                <Home className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Back to Home</span>
              </Link>

              <button
                onClick={() => {
                  logout();
                  router.push("/login");
                }}
                className="inline-flex min-h-11 items-center gap-1.5 whitespace-nowrap px-3 text-xs text-rose-200 hover:text-white hover:bg-rose-600/30 transition-colors border border-rose-400/30"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* ── SUB-HEADER BANNER ──────────────────────────────────────────────── */}
      <div className="bg-white border-b border-border py-4 px-4 sm:px-6 lg:px-8 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-light text-primary flex items-center justify-center font-bold text-sm shrink-0 border border-primary/20">
              {user?.name ? user.name.charAt(0).toUpperCase() : "A"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-text-primary">
                  Welcome, {user?.name || "Applicant"}
                </h2>
                <Badge
                  variant={
                    appData.status === "Rejected"
                      ? "danger"
                      : appData.status === "Submitted" || appData.status === "Under Review" || appData.status === "Admitted" || appData.status === "Merit Qualified"
                        ? "success"
                        : "warning"
                  }
                  className="text-[10px] uppercase font-bold"
                >
                  {appData.status}
                </Badge>
              </div>
              <p className="text-xs text-text-secondary mt-0.5">
                Primary Phone: <span className="font-semibold text-text-primary font-mono">{user?.phone || appData.phone || "Not set"}</span>
                {appData.appId && (
                  <span className="ml-3">
                    Application #: <span className="font-bold text-primary font-mono">{appData.appId}</span>
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Quick status button */}
          {appData.status === "Draft" ? (
            <button
              onClick={handleSaveDraft}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-primary bg-primary-light hover:bg-primary/20 border border-primary/30 transition-colors self-start sm:self-auto"
            >
              <Save className="w-3.5 h-3.5" />
              Save Progress
            </button>
          ) : (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Application Submitted ({appData.submittedAt})</span>
            </div>
          )}
        </div>
      </div>

      {/* ── MAIN TAB NAVIGATION ───────────────────────────────────────────── */}
      <div className="bg-white border-b border-border sticky top-16 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 sm:space-x-4 overflow-x-auto no-scrollbar py-2">
            {[
              { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
              { id: "application", label: "Application Form", icon: FileText },
              { id: "status", label: "Application Status", icon: Clock },
              { id: "personal", label: "Personal Information", icon: User },
              { id: "documents", label: "Documents", icon: FolderCheck },
              { id: "help", label: "Help & Support", icon: HelpCircle },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex min-h-11 items-center gap-2 px-4 text-xs font-bold whitespace-nowrap transition-all border-b-2 ${isActive
                      ? "border-primary text-primary bg-primary-light/40"
                      : "border-transparent text-text-secondary hover:text-text-primary hover:bg-background-secondary"
                    }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-primary" : "text-text-muted"}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* ── TOAST NOTIFICATION ───────────────────────────────────────────── */}
      {saveToast && (
        <div className="portal-success fixed bottom-6 right-6 z-50 bg-primary-dark text-white px-5 py-3 shadow-2xl border border-accent-gold flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-accent-gold" />
          <span className="text-xs font-semibold">{saveToast}</span>
        </div>
      )}

      {/* ── BODY CONTENT ─────────────────────────────────────────────────── */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {activeTab === "dashboard" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-[1.4fr_0.9fr] gap-6">
              <section className="bg-white border border-border p-6 sm:p-8 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-[0.24em] text-accent-gold">Applicant Dashboard</span>
                    <h3 className="mt-3 text-2xl sm:text-3xl font-extrabold text-text-primary">
                      Welcome back, {user?.name || appData.fullName || "Applicant"}
                    </h3>
                    <p className="mt-2 text-sm text-text-secondary">
                      {dashboardStatusText}. {hasApplication ? "Your admissions record is active and ready for review." : "Start your admission application to begin the process."}
                    </p>
                  </div>
                  <span className={`inline-flex items-center px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider border ${
                    appData.status === "Rejected"
                      ? "border-rose-300 bg-rose-50 text-rose-700"
                      : appData.status === "Submitted" || appData.status === "Under Review" || appData.status === "Accepted" || appData.status === "Admitted" || appData.status === "Merit Qualified"
                        ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                        : appData.status === "More Information Required"
                          ? "border-violet-300 bg-violet-50 text-violet-700"
                          : appData.status === "On Hold"
                            ? "border-orange-300 bg-orange-50 text-orange-700"
                            : "border-amber-300 bg-amber-50 text-amber-700"
                  }`}>
                    {appData.status || "No Application"}
                  </span>
                </div>

                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  {!hasApplication && (
                    <button
                      onClick={() => openApplicationFlow("application")}
                      className="inline-flex items-center justify-center gap-2 min-h-11 bg-primary text-white px-5 text-xs font-bold uppercase tracking-wider hover:bg-primary-dark transition-colors"
                    >
                      Start Application
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                  {hasApplication && appData.status === "Draft" && (
                    <button
                      onClick={() => openApplicationFlow("application")}
                      className="inline-flex items-center justify-center gap-2 min-h-11 bg-primary text-white px-5 text-xs font-bold uppercase tracking-wider hover:bg-primary-dark transition-colors"
                    >
                      Continue Application
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                  {(appData.status === "Submitted" || appData.status === "Under Review" || appData.status === "More Information Required" || appData.status === "On Hold" || appData.status === "Accepted" || appData.status === "Admitted" || appData.status === "Merit Qualified" || appData.status === "Rejected") && (
                    <button
                      onClick={() => openApplicationFlow("status")}
                      className="inline-flex items-center justify-center gap-2 min-h-11 bg-primary text-white px-5 text-xs font-bold uppercase tracking-wider hover:bg-primary-dark transition-colors"
                    >
                      {appData.status === "More Information Required" ? "Update Application" : appData.status === "Accepted" || appData.status === "Admitted" || appData.status === "Merit Qualified" ? "View Next Steps" : "View Application"}
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </section>

              <aside className="bg-white border border-border p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <h4 className="text-sm font-extrabold uppercase tracking-wide text-text-primary">Account Information</h4>
                  <div className="w-8 h-8 bg-primary-light border border-primary/20 flex items-center justify-center text-primary">
                    <User className="w-4 h-4" />
                  </div>
                </div>

                <div className="mt-5 space-y-4 text-xs">
                  <div>
                    <p className="text-text-muted uppercase tracking-wider font-bold">Applicant Name</p>
                    <p className="mt-1 text-sm font-bold text-text-primary">{user?.name || appData.fullName || "Not provided"}</p>
                  </div>
                  <div>
                    <p className="text-text-muted uppercase tracking-wider font-bold">Mobile Number</p>
                    <p className="mt-1 text-sm font-bold text-text-primary font-mono">{user?.phone || appData.phone || "Not provided"}</p>
                  </div>
                  <div>
                    <p className="text-text-muted uppercase tracking-wider font-bold">Email</p>
                    <p className="mt-1 text-sm font-bold text-text-primary break-all">{user?.email || appData.email || "Not provided"}</p>
                  </div>
                </div>
              </aside>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white border border-border p-5 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Application Number</p>
                <p className="mt-2 text-lg font-extrabold text-primary font-mono">{appData.appId || "Not assigned yet"}</p>
              </div>
              <div className="bg-white border border-border p-5 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Status</p>
                <p className="mt-2 text-lg font-extrabold text-text-primary">{appData.status || "No Application"}</p>
              </div>
              <div className="bg-white border border-border p-5 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Submitted Date</p>
                <p className="mt-2 text-lg font-extrabold text-text-primary">{appData.submittedAt || "Not submitted"}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-6">
              <section className="bg-white border border-border p-6 shadow-sm">
                <div className="flex items-center justify-between gap-3 border-b border-border pb-4">
                  <h4 className="text-sm font-extrabold uppercase tracking-wide text-text-primary">Application Progress</h4>
                  <span className="text-xs font-bold text-primary">{dashboardProgress}%</span>
                </div>

                <div className="mt-5">
                  <div className="h-2 w-full bg-background-secondary border border-border">
                    <div className="h-full bg-primary" style={{ width: `${dashboardProgress}%` }} />
                  </div>
                  <p className="mt-4 text-xs text-text-secondary">
                    {hasApplication
                      ? "Your application record is progressing through the admissions workflow."
                      : "No application has been created yet. Your progress will update here once you begin."}
                  </p>
                </div>

                <div className="mt-6 space-y-3">
                  {[
                    "Profile details",
                    "Academic information",
                    "Program preference",
                    "Document verification",
                    "Admissions review",
                  ].map((step, index) => {
                    const isComplete = index < Math.max(1, Math.round(dashboardProgress / 20));
                    return (
                      <div key={step} className="flex items-center gap-3 text-xs">
                        <span className={`w-5 h-5 flex items-center justify-center border ${isComplete ? "bg-primary border-primary text-white" : "border-border bg-background-secondary text-text-muted"}`}>
                          {isComplete ? <Check className="w-3 h-3" /> : index + 1}
                        </span>
                        <span className={isComplete ? "font-bold text-text-primary" : "text-text-secondary"}>{step}</span>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className="bg-white border border-border p-6 shadow-sm">
                <div className="flex items-center justify-between gap-3 border-b border-border pb-4">
                  <h4 className="text-sm font-extrabold uppercase tracking-wide text-text-primary">Important Message</h4>
                  <Bell className="w-4 h-4 text-primary" />
                </div>
                <div className="mt-5 space-y-4">
                  {dashboardNotifications.map((item) => (
                    <div key={item.title} className="border border-border bg-background-secondary p-4">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">{item.title}</p>
                      <p className="mt-2 text-xs text-text-secondary leading-relaxed">{item.detail}</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {hasApplication && (
              <section className="bg-white border border-border p-6 shadow-sm">
                <div className="flex items-center justify-between gap-3 border-b border-border pb-4">
                  <h4 className="text-sm font-extrabold uppercase tracking-wide text-text-primary">Application Summary</h4>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary">{appData.status}</span>
                </div>

                <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                  <div className="border border-border bg-background-secondary p-4">
                    <p className="text-text-muted uppercase tracking-wider font-bold">Application Number</p>
                    <p className="mt-2 font-bold text-text-primary break-all">{appData.appId || "Pending"}</p>
                  </div>
                  <div className="border border-border bg-background-secondary p-4">
                    <p className="text-text-muted uppercase tracking-wider font-bold">Program</p>
                    <p className="mt-2 font-bold text-text-primary">{appData.primaryProgram || "Not selected"}</p>
                  </div>
                  <div className="border border-border bg-background-secondary p-4">
                    <p className="text-text-muted uppercase tracking-wider font-bold">Submitted</p>
                    <p className="mt-2 font-bold text-text-primary">{appData.submittedAt || "Not submitted"}</p>
                  </div>
                  <div className="border border-border bg-background-secondary p-4">
                    <p className="text-text-muted uppercase tracking-wider font-bold">Action</p>
                    <button
                      onClick={() => openApplicationFlow(appData.status === "Draft" ? "application" : "status")}
                      className="mt-2 text-primary font-bold hover:text-primary-dark"
                    >
                      {appData.status === "Draft" ? "Continue" : "View status"}
                    </button>
                  </div>
                </div>
              </section>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 1: ADMISSION APPLICATION FORM (MULTI-STEP)                            */}
        {/* ========================================================================= */}
        {activeTab === "application" && (
          <div className="space-y-6">

            {/* Six-step progress navigator */}
            <div className="bg-white border border-border p-4 sm:p-5 shadow-xs">
              <div className="flex items-center justify-between gap-1 sm:gap-2">
                {FORM_STEPS.map((s) => {
                  const isDone = formStep > s.step;
                  const isCurrent = formStep === s.step;
                  return (
                    <React.Fragment key={s.step}>
                      <button
                        onClick={() => handleStepChange(s.step)}
                        aria-current={isCurrent ? "step" : undefined}
                        className={`group flex min-w-0 flex-1 min-h-11 flex-col items-center justify-center gap-1 text-center transition-all ${isCurrent
                            ? "text-primary"
                            : isDone
                              ? "text-emerald-700"
                              : "text-text-muted hover:text-text-secondary"
                          }`}
                      >
                        <span
                          className={`flex h-8 w-8 items-center justify-center rounded-full border text-xs font-extrabold transition-all duration-300 ${isCurrent
                              ? "border-primary bg-primary text-white shadow-sm scale-110"
                              : isDone
                                ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                                : "border-border bg-background-secondary"
                            }`}
                        >
                          {isDone ? <Check className="w-3.5 h-3.5" /> : String(s.step).padStart(2, "0")}
                        </span>
                        <span className="hidden text-[11px] font-bold sm:block truncate max-w-full px-1">
                          {s.title}
                        </span>
                        <span className="sr-only">{s.description}</span>
                      </button>
                      {s.step < 6 && (
                        <span
                          className={`h-px flex-1 ${formStep > s.step ? "bg-emerald-300" : "bg-border"}`}
                          aria-hidden="true"
                        />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
              <div className="mt-3 flex items-center justify-between gap-3 border-t border-border pt-3 sm:hidden">
                <span className="text-xs font-bold text-text-primary">
                  {String(formStep).padStart(2, "0")} {FORM_STEPS[formStep - 1]?.fullTitle}
                </span>
                <span className="text-[11px] font-semibold text-text-muted">
                  Step {formStep} of 6 · {6 - formStep} remaining
                </span>
              </div>
            </div>

            {/* Step Restriction Error Banner */}
            {stepErrorMessage && (
              <div className="portal-validation p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-3">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{stepErrorMessage}</span>
              </div>
            )}

            {/* Application Locked Alert if Submitted */}
            {appData.status !== "Draft" && (
              <Alert variant="info" title="Application Submitted" className="rounded-none">
                Your application (ID: <span className="font-bold">{appData.appId}</span>) has been submitted on {appData.submittedAt}. You can review your details below or check status in the Application Status tab.
              </Alert>
            )}

            {/* FORM CARDS BY STEP */}
            <div className="bg-white border border-border shadow-md">

              {/* ── STEP 1: PERSONAL INFORMATION ────────────────────────────────── */}
              {formStep === 1 && (
                <div className="portal-step-in p-6 sm:p-8 space-y-6">
                  <div className="border-b border-border pb-4">
                    <h3 className="text-lg font-extrabold text-text-primary flex items-center gap-2">
                      <User className="w-5 h-5 text-primary" />
                      Step 1: Personal Information
                    </h3>
                    <p className="text-xs text-text-secondary mt-1">
                      Enter your personal bio data as registered on your official B-Form / CNIC.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

                    {/* Applicant Full Name */}
                    <FormField label="Applicant Full Name" required error={stepErrors.fullName}>
                      <Input
                        type="text"
                        placeholder="e.g. Hamza Ahmed Khan"
                        value={appData.fullName}
                        onChange={(e) => {
                          saveProgress({ fullName: e.target.value });
                          if (stepErrors.fullName) setStepErrors({ ...stepErrors, fullName: "" });
                        }}
                        disabled={appData.status !== "Draft"}
                      />
                    </FormField>

                    {/* Date of Birth */}
                    <FormField label="Date of Birth" required error={stepErrors.dob}>
                      <Input
                        type="date"
                        value={appData.dob}
                        onChange={(e) => {
                          saveProgress({ dob: e.target.value });
                          if (stepErrors.dob) setStepErrors({ ...stepErrors, dob: "" });
                        }}
                        disabled={appData.status !== "Draft"}
                      />
                    </FormField>

                    {/* Gender */}
                    <FormField label="Gender" required error={stepErrors.gender}>
                      <Select
                        value={appData.gender}
                        onChange={(e) => saveProgress({ gender: e.target.value })}
                        disabled={appData.status !== "Draft"}
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </Select>
                    </FormField>

                    {/* ID Document Type */}
                    <FormField label="Identity Document Type" required>
                      <Select
                        value={appData.idType}
                        onChange={(e) => saveProgress({ idType: e.target.value as any })}
                        disabled={appData.status !== "Draft"}
                      >
                        <option value="B-Form / Juvenile Card">B-Form / Juvenile Card (Under 18)</option>
                        <option value="CNIC">National ID Card (CNIC)</option>
                      </Select>
                    </FormField>

                    {/* CNIC / B-Form Number */}
                    <FormField label={`${appData.idType} Number`} required error={stepErrors.idNumber}>
                      <Input
                        type="text"
                        placeholder="e.g. 35102-1234567-1"
                        value={appData.idNumber}
                        onChange={(e) => {
                          saveProgress({ idNumber: e.target.value });
                          if (stepErrors.idNumber) setStepErrors({ ...stepErrors, idNumber: "" });
                        }}
                        disabled={appData.status !== "Draft"}
                      />
                    </FormField>

                    {/* Nationality */}
                    <FormField label="Nationality" required error={stepErrors.nationality}>
                      <Input
                        type="text"
                        placeholder="Pakistani"
                        value={appData.nationality}
                        onChange={(e) => {
                          saveProgress({ nationality: e.target.value });
                          if (stepErrors.nationality) setStepErrors({ ...stepErrors, nationality: "" });
                        }}
                        disabled={appData.status !== "Draft"}
                      />
                    </FormField>

                    {/* Religion */}
                    <FormField label="Religion" required error={stepErrors.religion}>
                      <Select
                        value={appData.religion}
                        onChange={(e) => saveProgress({ religion: e.target.value })}
                        disabled={appData.status !== "Draft"}
                      >
                        <option value="Islam">Islam</option>
                        <option value="Christianity">Christianity</option>
                        <option value="Hinduism">Hinduism</option>
                        <option value="Other">Other</option>
                      </Select>
                    </FormField>

                    {/* Blood Group */}
                    <FormField
                      label={
                        <span className="flex items-center gap-2">
                          Blood Group
                          <span className="text-[10px] font-bold text-text-muted bg-background-secondary border border-border px-1.5 py-0.5">
                            Optional
                          </span>
                        </span>
                      }
                    >
                      <Select
                        value={appData.bloodGroup}
                        onChange={(e) => saveProgress({ bloodGroup: e.target.value })}
                        disabled={appData.status !== "Draft"}
                      >
                        <option value="">Select Blood Group...</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                      </Select>
                    </FormField>

                  </div>
                </div>
              )}

              {/* ── STEP 2: CONTACT & ADDRESS ────────────────────────────────────── */}
              {formStep === 2 && (
                <div className="portal-step-in p-6 sm:p-8 space-y-6">
                  <div className="border-b border-border pb-4">
                    <h3 className="text-lg font-extrabold text-text-primary flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-primary" />
                      Step 2: Contact & Address
                    </h3>
                    <p className="text-xs text-text-secondary mt-1">
                      Provide your active mobile number, optional email, and current permanent residential address.
                    </p>
                  </div>

                  {/* Contact Numbers & Email */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-primary">
                      Contact Information
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

                      {/* Applicant Primary Phone */}
                      <FormField label="Applicant Mobile Number" required error={stepErrors.phone}>
                        <Input
                          type="tel"
                          inputMode="numeric"
                          maxLength={11}
                          placeholder="03001234567"
                          value={appData.phone}
                          onChange={(e) => {
                            const filtered = e.target.value.replace(/\D/g, "").slice(0, 11);
                            saveProgress({ phone: filtered });
                            if (stepErrors.phone) setStepErrors({ ...stepErrors, phone: "" });
                          }}
                          disabled={appData.status !== "Draft"}
                        />
                      </FormField>

                      {/* Email (Optional) */}
                      <FormField
                        label={
                          <span className="flex items-center gap-2">
                            Email Address
                            <span className="text-[10px] font-bold text-text-muted bg-background-secondary border border-border px-1.5 py-0.5">
                              Optional
                            </span>
                          </span>
                        }
                      >
                        <Input
                          type="email"
                          placeholder="applicant@gmail.com (optional)"
                          value={appData.email}
                          onChange={(e) => saveProgress({ email: e.target.value })}
                          disabled={appData.status !== "Draft"}
                        />
                      </FormField>

                    </div>
                  </div>

                  {/* Residential Address & Domicile */}
                  <div className="space-y-4 border-t border-border pt-6">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-primary">
                      Residential Address & Domicile
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <FormField label="Domicile District" required error={stepErrors.domicile}>
                        <Select
                          value={appData.domicile}
                          onChange={(e) => {
                            saveProgress({ domicile: e.target.value });
                            if (stepErrors.domicile) setStepErrors({ ...stepErrors, domicile: "" });
                          }}
                          disabled={appData.status !== "Draft"}
                        >
                          <option value="Kasur">Kasur</option>
                          <option value="Lahore">Lahore</option>
                          <option value="Okara">Okara</option>
                          <option value="Pakpattan">Pakpattan</option>
                          <option value="Sahiwal">Sahiwal</option>
                          <option value="Other">Other District</option>
                        </Select>
                      </FormField>
                    </div>

                    <FormField label="Permanent Postal Address" required error={stepErrors.address}>
                      <Textarea
                        placeholder="House/Street address, Tehsil Kanganpur, District Kasur..."
                        value={appData.address}
                        onChange={(e) => {
                          saveProgress({ address: e.target.value });
                          if (stepErrors.address) setStepErrors({ ...stepErrors, address: "" });
                        }}
                        disabled={appData.status !== "Draft"}
                        rows={4}
                      />
                    </FormField>
                  </div>
                </div>
              )}

              {/* ── STEP 3: PARENT / GUARDIAN INFORMATION ─────────────────────────── */}
              {formStep === 3 && (
                <div className="portal-step-in p-6 sm:p-8 space-y-6">
                  <div className="border-b border-border pb-4">
                    <h3 className="text-lg font-extrabold text-text-primary flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-primary" />
                      Step 3: Parent / Guardian Information
                    </h3>
                    <p className="text-xs text-text-secondary mt-1">
                      Provide parent or legal guardian details for emergency contact and official college records.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

                    {/* Father's Name */}
                    <FormField label="Father's Full Name" required error={stepErrors.fatherName}>
                      <Input
                        type="text"
                        placeholder="e.g. Tariq Mahmood Khan"
                        value={appData.fatherName}
                        onChange={(e) => {
                          saveProgress({ fatherName: e.target.value });
                          if (stepErrors.fatherName) setStepErrors({ ...stepErrors, fatherName: "" });
                        }}
                        disabled={appData.status !== "Draft"}
                      />
                    </FormField>

                    {/* Mother's Name */}
                    <FormField label="Mother's Full Name" required error={stepErrors.motherName}>
                      <Input
                        type="text"
                        placeholder="e.g. Parveen Akhtar"
                        value={appData.motherName}
                        onChange={(e) => {
                          saveProgress({ motherName: e.target.value });
                          if (stepErrors.motherName) setStepErrors({ ...stepErrors, motherName: "" });
                        }}
                        disabled={appData.status !== "Draft"}
                      />
                    </FormField>

                    {/* Father / Guardian Phone */}
                    <FormField label="Father / Guardian Mobile Number" required error={stepErrors.altPhone} className="sm:col-span-2">
                      <Input
                        type="tel"
                        inputMode="numeric"
                        maxLength={11}
                        placeholder="03001234567"
                        value={appData.altPhone}
                        onChange={(e) => {
                          const filtered = e.target.value.replace(/\D/g, "").slice(0, 11);
                          saveProgress({ altPhone: filtered });
                          if (stepErrors.altPhone) setStepErrors({ ...stepErrors, altPhone: "" });
                        }}
                        disabled={appData.status !== "Draft"}
                      />
                    </FormField>

                  </div>
                </div>
              )}

              {/* ── STEP 4: ACADEMIC QUALIFICATIONS ─────────────────────────────── */}
              {formStep === 4 && (
                <div className="portal-step-in p-6 sm:p-8 space-y-6">
                  <div className="border-b border-border pb-4">
                    <h3 className="text-lg font-extrabold text-text-primary flex items-center gap-2">
                      <Award className="w-5 h-5 text-primary" />
                      Step 4: Academic Information
                    </h3>
                    <p className="text-xs text-text-secondary mt-1">
                      Enter your Matriculation / Secondary Education credentials and result marks.
                    </p>
                  </div>

                  {/* Matric Section */}
                  <div className="p-5 bg-background-secondary border border-border space-y-4">
                    <h4 className="text-sm font-bold text-primary uppercase tracking-wider">
                      Matriculation / SSC / O-Level Records
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

                      <FormField label="Examination Board" required error={stepErrors.matricBoard}>
                        <Select
                          value={appData.matricBoard}
                          onChange={(e) => saveProgress({ matricBoard: e.target.value })}
                          disabled={appData.status !== "Draft"}
                        >
                          <option value="BISE Lahore">BISE Lahore</option>
                          <option value="BISE Multan">BISE Multan</option>
                          <option value="BISE Gujranwala">BISE Gujranwala</option>
                          <option value="BISE Sahiwal">BISE Sahiwal</option>
                          <option value="FBISE Islamabad">FBISE Islamabad</option>
                          <option value="Cambridge O-Levels">Cambridge O-Levels</option>
                          <option value="Other Board">Other BISE Board</option>
                        </Select>
                      </FormField>

                      <FormField label="Matric Roll Number" required error={stepErrors.matricRollNo}>
                        <Input
                          type="text"
                          placeholder="e.g. 481029"
                          value={appData.matricRollNo}
                          onChange={(e) => {
                            saveProgress({ matricRollNo: e.target.value });
                            if (stepErrors.matricRollNo) setStepErrors({ ...stepErrors, matricRollNo: "" });
                          }}
                          disabled={appData.status !== "Draft"}
                        />
                      </FormField>

                      <FormField label="Passing Year" required error={stepErrors.matricYear}>
                        <Input
                          type="text"
                          placeholder="2024"
                          value={appData.matricYear}
                          onChange={(e) => {
                            saveProgress({ matricYear: e.target.value });
                            if (stepErrors.matricYear) setStepErrors({ ...stepErrors, matricYear: "" });
                          }}
                          disabled={appData.status !== "Draft"}
                        />
                      </FormField>

                      <FormField label="Academic Group" required error={stepErrors.matricGroup}>
                        <Select
                          value={appData.matricGroup}
                          onChange={(e) => saveProgress({ matricGroup: e.target.value })}
                          disabled={appData.status !== "Draft"}
                        >
                          <option value="Science (Biology)">Science Group (Biology)</option>
                          <option value="Science (Computer)">Science Group (Computer Science)</option>
                          <option value="Arts / General">Arts / General Group</option>
                        </Select>
                      </FormField>

                      <FormField label="Total Marks" required error={stepErrors.matricTotalMarks}>
                        <Input
                          type="number"
                          placeholder="1100"
                          value={appData.matricTotalMarks}
                          onChange={(e) => {
                            saveProgress({ matricTotalMarks: e.target.value });
                            if (stepErrors.matricTotalMarks) setStepErrors({ ...stepErrors, matricTotalMarks: "" });
                          }}
                          disabled={appData.status !== "Draft"}
                        />
                      </FormField>

                      <FormField label="Obtained Marks" required error={stepErrors.matricObtainedMarks}>
                        <Input
                          type="number"
                          placeholder="e.g. 985"
                          value={appData.matricObtainedMarks}
                          onChange={(e) => {
                            saveProgress({ matricObtainedMarks: e.target.value });
                            if (stepErrors.matricObtainedMarks) setStepErrors({ ...stepErrors, matricObtainedMarks: "" });
                          }}
                          disabled={appData.status !== "Draft"}
                        />
                      </FormField>

                    </div>

                    {/* Percentage calculation display */}
                    {appData.matricObtainedMarks && appData.matricTotalMarks && (
                      <div className="p-3 bg-white border border-border inline-block text-xs font-semibold text-text-primary">
                        Calculated Score:{" "}
                        <span className="text-primary font-bold text-sm">
                          {((Number(appData.matricObtainedMarks) / Number(appData.matricTotalMarks)) * 100).toFixed(2)}%
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Intermediate Section (if applicable) */}
                  <div className="p-5 bg-background-secondary border border-border space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-primary uppercase tracking-wider">
                        Intermediate / HSSC / A-Level (For BS Applicants)
                      </h4>
                      <span className="text-[10px] font-bold text-text-muted bg-white px-2 py-0.5 border border-border">
                        Required only for BS/BBA
                      </span>
                    </div>

                    <FormField label="Intermediate Result Status" required>
                      <Select
                        value={appData.interStatus}
                        onChange={(e) => saveProgress({ interStatus: e.target.value as any })}
                        disabled={appData.status !== "Draft"}
                      >
                        <option value="Not Applicable (Applying for Inter)">Not Applicable (Applying for 1st Year Inter)</option>
                        <option value="Awaiting Result">Awaiting Part-II Result (Applying for BS)</option>
                        <option value="Passed">Passed Intermediate (FSc / ICS / I.Com)</option>
                      </Select>
                    </FormField>

                    {appData.interStatus !== "Not Applicable (Applying for Inter)" && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
                        <FormField label="Inter Board / College" error={stepErrors.interBoard}>
                          <Input
                            type="text"
                            placeholder="e.g. BISE Lahore / Superior College"
                            value={appData.interBoard || ""}
                            onChange={(e) => saveProgress({ interBoard: e.target.value })}
                            disabled={appData.status !== "Draft"}
                          />
                        </FormField>

                        <FormField label="Inter Roll Number" error={stepErrors.interRollNo}>
                          <Input
                            type="text"
                            placeholder="e.g. 192834"
                            value={appData.interRollNo || ""}
                            onChange={(e) => saveProgress({ interRollNo: e.target.value })}
                            disabled={appData.status !== "Draft"}
                          />
                        </FormField>

                        <FormField label="Obtained / Expected Marks" error={stepErrors.interObtainedMarks}>
                          <Input
                            type="number"
                            placeholder="e.g. 910"
                            value={appData.interObtainedMarks || ""}
                            onChange={(e) => saveProgress({ interObtainedMarks: e.target.value })}
                            disabled={appData.status !== "Draft"}
                          />
                        </FormField>
                      </div>
                    )}
                  </div>

                </div>
              )}

              {/* ── STEP 5: PROGRAM & PREFERENCES ───────────────────────────────── */}
              {formStep === 5 && (
                <div className="portal-step-in p-6 sm:p-8 space-y-6">
                  <div className="border-b border-border pb-4">
                    <h3 className="text-lg font-extrabold text-text-primary flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-primary" />
                      Step 5: Program & Campus Preferences
                    </h3>
                    <p className="text-xs text-text-secondary mt-1">
                      Choose your intended academic discipline and program preferences for Fall 2026.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

                    {/* Academic Level */}
                    <FormField label="Academic Level" required error={stepErrors.academicLevel} className="sm:col-span-2">
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <button
                          type="button"
                          onClick={() => saveProgress({ academicLevel: "Intermediate" })}
                          disabled={appData.status !== "Draft"}
                          className={`min-h-20 p-4 text-left border transition-all ${appData.academicLevel === "Intermediate"
                              ? "border-primary bg-primary-light/50 font-bold"
                              : "border-border hover:border-text-muted"
                            }`}
                        >
                          <p className="text-sm text-text-primary font-bold">Intermediate (2 Years)</p>
                          <p className="text-xs text-text-secondary mt-0.5">FSc Pre-Medical, Pre-Engg, ICS, I.Com</p>
                        </button>

                        <button
                          type="button"
                          onClick={() => saveProgress({ academicLevel: "Undergraduate" })}
                          disabled={appData.status !== "Draft"}
                          className={`min-h-20 p-4 text-left border transition-all ${appData.academicLevel === "Undergraduate"
                              ? "border-primary bg-primary-light/50 font-bold"
                              : "border-border hover:border-text-muted"
                            }`}
                        >
                          <p className="text-sm text-text-primary font-bold">Undergraduate (4 Years BS)</p>
                          <p className="text-xs text-text-secondary mt-0.5">BS CS, BS SE, BBA Degrees</p>
                        </button>
                      </div>
                    </FormField>

                    {/* Primary Program Choice */}
                    <FormField label="Primary Choice Program" required error={stepErrors.primaryProgram}>
                      <Select
                        value={appData.primaryProgram}
                        onChange={(e) => saveProgress({ primaryProgram: e.target.value })}
                        disabled={appData.status !== "Draft"}
                      >
                        {appData.academicLevel === "Intermediate" ? (
                          <>
                            <option value="ICS (Computer Science)">ICS (Physics & Computer Science)</option>
                            <option value="FSc Pre-Medical">FSc Pre-Medical</option>
                            <option value="FSc Pre-Engineering">FSc Pre-Engineering</option>
                            <option value="I.Com (Commerce)">I.Com (Commerce & Accounts)</option>
                          </>
                        ) : (
                          <>
                            <option value="BS Computer Science (BSCS)">BS Computer Science (BSCS)</option>
                            <option value="BS Software Engineering (BSSE)">BS Software Engineering (BSSE)</option>
                            <option value="Bachelor of Business Administration (BBA)">Bachelor of Business Administration (BBA)</option>
                          </>
                        )}
                      </Select>
                    </FormField>

                    {/* Secondary Preference */}
                    <FormField label="Secondary Preference Program">
                      <Select
                        value={appData.secondaryProgram}
                        onChange={(e) => saveProgress({ secondaryProgram: e.target.value })}
                        disabled={appData.status !== "Draft"}
                      >
                        <option value="None">None (Single Preference)</option>
                        {appData.academicLevel === "Intermediate" ? (
                          <>
                            <option value="ICS (Computer Science)">ICS (Computer Science)</option>
                            <option value="FSc Pre-Engineering">FSc Pre-Engineering</option>
                            <option value="FSc Pre-Medical">FSc Pre-Medical</option>
                            <option value="I.Com (Commerce)">I.Com (Commerce)</option>
                          </>
                        ) : (
                          <>
                            <option value="BS Software Engineering (BSSE)">BS Software Engineering (BSSE)</option>
                            <option value="BS Computer Science (BSCS)">BS Computer Science (BSCS)</option>
                            <option value="Bachelor of Business Administration (BBA)">Bachelor of Business Administration (BBA)</option>
                          </>
                        )}
                      </Select>
                    </FormField>

                    {/* Shift */}
                    <FormField label="Preferred Campus Shift" required error={stepErrors.preferredShift}>
                      <Select
                        value={appData.preferredShift}
                        onChange={(e) => saveProgress({ preferredShift: e.target.value })}
                        disabled={appData.status !== "Draft"}
                      >
                        <option value="Morning">Morning Shift (8:00 AM - 1:30 PM)</option>
                        <option value="Evening">Evening Shift (1:30 PM - 5:00 PM)</option>
                      </Select>
                    </FormField>

                  </div>
                </div>
              )}

              {/* ── STEP 6: DOCUMENTS & REVIEW ──────────────────────────────────── */}
              {formStep === 6 && (
                <div className="portal-step-in p-6 sm:p-8 space-y-8">
                  <div className="border-b border-border pb-4">
                    <h3 className="text-lg font-extrabold text-text-primary flex items-center gap-2">
                      <FolderCheck className="w-5 h-5 text-primary" />
                      Step 6: Documents & Review
                    </h3>
                    <p className="text-xs text-text-secondary mt-1">
                      Upload required verification documents and review your application details before final submission.
                    </p>
                  </div>

                  {/* Section A: Document Uploads */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-primary">
                      Required Verification Documents
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {[
                        { key: "matricResultCard", title: "Matriculation Result Card / Certificate", desc: "Clear scan of BISE SSC result card", required: true },
                        { key: "cnicOrBForm", title: "CNIC or B-Form Document", desc: "Front & back scan of NADRA card / B-Form", required: true },
                        { key: "guardianCnic", title: "Father / Guardian CNIC", desc: "NADRA CNIC of parent or guardian", required: false },
                        { key: "photo", title: "Passport Size Photograph", desc: "Recent color photo with blue background", required: false },
                      ].map((doc) => {
                        const isUploaded = !!appData.documents[doc.key as keyof typeof appData.documents];
                        const hasError = !!stepErrors[doc.key];
                        return (
                          <div key={doc.key} className={`min-w-0 p-5 border space-y-3 ${hasError ? "border-rose-500 bg-rose-50/50" : "border-border bg-background-secondary"}`}>
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <h4 className="text-xs font-bold text-text-primary">
                                  {doc.title} {doc.required && <span className="text-rose-500">*</span>}
                                </h4>
                                <p className="text-[11px] text-text-secondary">{doc.desc}</p>
                              </div>
                              {isUploaded ? (
                                <span className="portal-success text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 border border-emerald-300">
                                  Uploaded
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 border border-amber-300">
                                  Pending
                                </span>
                              )}
                            </div>

                            {hasError && (
                              <p className="text-xs font-medium text-rose-600">{stepErrors[doc.key]}</p>
                            )}

                            {appData.status === "Draft" && (
                              <label className="inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 border border-border bg-white px-3 text-center text-xs font-semibold text-text-primary transition-colors hover:border-primary">
                                <Upload className="w-3.5 h-3.5 text-primary" />
                                <span>{isUploaded ? "Replace File" : "Choose File to Upload"}</span>
                                <input
                                  type="file"
                                  accept="image/*,.pdf"
                                  className="hidden"
                                  onChange={(e) => {
                                    if (e.target.files?.[0]) {
                                      const newDocs = {
                                        ...appData.documents,
                                        [doc.key]: e.target.files[0].name,
                                      };
                                      saveProgress({ documents: newDocs });
                                      if (stepErrors[doc.key]) {
                                        const nextErr = { ...stepErrors };
                                        delete nextErr[doc.key];
                                        setStepErrors(nextErr);
                                      }
                                    }
                                  }}
                                />
                              </label>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Section B: Application Summary Preview */}
                  <div className="space-y-4 border-t border-border pt-6">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-primary">
                      Application Summary Preview
                    </h4>
                    <div className="bg-background-secondary border border-border p-6 space-y-4 text-xs">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-text-secondary">
                        <div>
                          <span className="font-semibold text-text-primary block">Applicant Name</span>
                          {appData.fullName || "Not specified"}
                        </div>
                        <div>
                          <span className="font-semibold text-text-primary block">Father's Name</span>
                          {appData.fatherName || "Not specified"}
                        </div>
                        <div>
                          <span className="font-semibold text-text-primary block">Identity Doc</span>
                          {appData.idType}: {appData.idNumber || "Not specified"}
                        </div>
                        <div>
                          <span className="font-semibold text-text-primary block">Contact Mobile</span>
                          {appData.phone || "Not specified"}
                        </div>
                        <div>
                          <span className="font-semibold text-text-primary block">Guardian Phone</span>
                          {appData.altPhone || "Not specified"}
                        </div>
                        <div>
                          <span className="font-semibold text-text-primary block">Address & Domicile</span>
                          {appData.address ? `${appData.address} (${appData.domicile})` : "Not specified"}
                        </div>
                        <div>
                          <span className="font-semibold text-text-primary block">Primary Discipline</span>
                          {appData.primaryProgram} ({appData.academicLevel})
                        </div>
                        <div>
                          <span className="font-semibold text-text-primary block">Preferred Shift</span>
                          {appData.preferredShift || "Morning"}
                        </div>
                        <div>
                          <span className="font-semibold text-text-primary block">Matric Marks</span>
                          {appData.matricObtainedMarks} / {appData.matricTotalMarks} ({appData.matricBoard})
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section C: Undertaking Declaration */}
                  <div className="p-4 bg-amber-50/60 border border-amber-200 text-xs space-y-3">
                    <label className="flex items-start gap-3 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={appData.undertakingAgreed}
                        onChange={(e) => saveProgress({ undertakingAgreed: e.target.checked })}
                        disabled={appData.status !== "Draft"}
                        className="mt-0.5 text-primary border-border focus:ring-primary"
                      />
                      <span className="text-text-primary font-medium leading-relaxed">
                        I hereby declare that all information provided in this application is true and complete to the best of my knowledge. I agree to comply with the rules and regulations of Superior Colleges Kanganpur Campus.
                      </span>
                    </label>
                  </div>

                  {/* Section D: Final Submission Action */}
                  {appData.status === "Draft" ? (
                    <Button
                      variant="primary"
                      className="w-full sm:w-auto px-8 py-3 font-bold uppercase tracking-wider text-xs rounded-none"
                      disabled={!appData.undertakingAgreed || !appData.fullName || !appData.idNumber}
                      onClick={handleSubmitApplication}
                      rightIcon={<Send className="w-4 h-4" />}
                    >
                      Submit Official Admission Application
                    </Button>
                  ) : (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                      Your application has been submitted and locked for review.
                    </div>
                  )}
                </div>
              )}

              {/* CARD FOOTER NAVIGATION */}
              <div className="flex items-center justify-between gap-3 px-4 py-4 bg-background-secondary border-t border-border sm:px-6">
                <button
                  onClick={() => handleStepChange(formStep - 1)}
                  disabled={formStep === 1}
                  className="inline-flex min-h-11 items-center gap-1.5 text-xs font-bold text-text-secondary hover:text-text-primary disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous Step</span>
                </button>

                <div className="text-xs font-bold text-text-muted">
                  Step {formStep} of 6
                </div>

                {formStep < 6 ? (
                  <button
                    onClick={() => handleStepChange(formStep + 1)}
                    className="inline-flex min-h-11 items-center gap-1.5 text-xs font-bold text-primary hover:text-primary-dark disabled:opacity-40"
                  >
                    <span>Save & Continue</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <div className="text-xs font-bold text-text-muted hidden sm:block">
                    Final Step · Review & Submit
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: APPLICATION STATUS TRACKER                                         */}
        {/* ========================================================================= */}
        {activeTab === "status" && (
          <div className="portal-fade-up space-y-8">
            {appData.status === "Rejected" && (
              <Alert variant="error" title="Application Not Accepted" className="rounded-none">
                This application was reviewed and not accepted for the current admission cycle. Contact the admissions office if you need guidance on next steps.
              </Alert>
            )}

            <div className="bg-white border border-border p-6 sm:p-8 space-y-6 shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
                <div>
                  <span className="text-[10px] font-mono font-bold text-accent-gold uppercase tracking-wider">
                    Official Status Tracker
                  </span>
                  <h3 className="text-xl font-extrabold text-text-primary mt-1">
                    Application Lifecycle Progress
                  </h3>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Track your application status in real-time.
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <span className="text-xs text-text-muted block">Application ID</span>
                  <span className="text-base font-extrabold font-mono text-primary">
                    {appData.appId || "APP-2026-DRAFT"}
                  </span>
                </div>
              </div>

              {/* Progress Bar Timeline */}
              <div className="space-y-6 pt-4">
                {[
                  { title: "Application Submitted", desc: "Online application submitted successfully", done: appData.status !== "Draft" },
                  { title: "Under Committee Review", desc: "Documents and credentials verified by admissions desk", done: appData.status === "Submitted" || appData.status === "Under Review" || appData.status === "Merit Qualified" || appData.status === "Admitted" },
                  { title: "Departmental Merit Qualification", desc: "Calculated against BISE / HEC merit thresholds", done: appData.status === "Merit Qualified" || appData.status === "Admitted" },
                  { title: "Bank Fee Voucher Generated", desc: "Pay official fee voucher at designated bank branch", done: appData.status === "Admitted" },
                  { title: "Official Enrollment & Student ID", desc: "Welcome to Superior Colleges Kanganpur Campus!", done: appData.status === "Admitted" },
                ].map((item, idx) => (
                  <div
                    key={item.title}
                    className="portal-fade-up flex items-start gap-4"
                    style={{ animationDelay: `${idx * 70}ms` }}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${item.done ? "bg-primary text-white" : "bg-background-secondary border border-border text-text-muted"
                      }`}>
                      {item.done ? <Check className="w-4 h-4" /> : idx + 1}
                    </div>
                    <div className="pt-0.5">
                      <p className={`text-sm font-bold ${item.done ? "text-text-primary" : "text-text-muted"}`}>
                        {item.title}
                      </p>
                      <p className="text-xs text-text-secondary">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Voucher Action Card if submitted */}
              {appData.status !== "Draft" && (
                <div className="p-6 bg-primary-light/40 border border-primary/30 flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
                  <div>
                    <h4 className="text-sm font-bold text-primary">Download Admission Fee Voucher</h4>
                    <p className="text-xs text-text-secondary mt-0.5">
                      Generate your official bank fee voucher for Fall 2026 enrollment.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-primary text-primary hover:bg-primary hover:text-white rounded-none shrink-0"
                    leftIcon={<Download className="w-4 h-4" />}
                    onClick={() => alert("Downloading official Bank Admission Fee Voucher PDF...")}
                  >
                    Download Fee Voucher PDF
                  </Button>
                </div>
              )}

            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: PERSONAL INFORMATION SUMMARY                                       */}
        {/* ========================================================================= */}
        {activeTab === "personal" && (
          <div className="bg-white border border-border p-6 sm:p-8 space-y-6 shadow-md">
            <h3 className="text-lg font-extrabold text-text-primary border-b border-border pb-4">
              Registered Profile Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-xs">
              <div className="p-4 bg-background-secondary border border-border">
                <span className="text-text-muted block uppercase text-[10px] font-bold">Full Name</span>
                <span className="text-sm font-bold text-text-primary">{appData.fullName || "Not provided"}</span>
              </div>
              <div className="p-4 bg-background-secondary border border-border">
                <span className="text-text-muted block uppercase text-[10px] font-bold">Father's Name</span>
                <span className="text-sm font-bold text-text-primary">{appData.fatherName || "Not provided"}</span>
              </div>
              <div className="p-4 bg-background-secondary border border-border">
                <span className="text-text-muted block uppercase text-[10px] font-bold">ID Number ({appData.idType})</span>
                <span className="text-sm font-bold text-text-primary font-mono">{appData.idNumber || "Not provided"}</span>
              </div>
              <div className="p-4 bg-background-secondary border border-border">
                <span className="text-text-muted block uppercase text-[10px] font-bold">Primary Phone</span>
                <span className="text-sm font-bold text-text-primary font-mono">{user?.phone || appData.phone}</span>
              </div>
              <div className="p-4 bg-background-secondary border border-border">
                <span className="text-text-muted block uppercase text-[10px] font-bold">Guardian Phone</span>
                <span className="text-sm font-bold text-text-primary font-mono">{appData.altPhone || "Not provided"}</span>
              </div>
              <div className="p-4 bg-background-secondary border border-border">
                <span className="text-text-muted block uppercase text-[10px] font-bold">Email Address</span>
                <span className="text-sm font-bold text-text-primary">{appData.email || "Not provided (Optional)"}</span>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="rounded-none border-primary text-primary"
              onClick={() => setActiveTab("application")}
            >
              Edit Details in Application Form
            </Button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: DOCUMENTS MANAGEMENT                                               */}
        {/* ========================================================================= */}
        {activeTab === "documents" && (
          <div className="bg-white border border-border p-6 sm:p-8 space-y-6 shadow-md">
            <h3 className="text-lg font-extrabold text-text-primary border-b border-border pb-4">
              Uploaded Credentials & Documents
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.entries(appData.documents).map(([key, filename]) => (
                <div key={key} className="p-4 bg-background-secondary border border-border flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-text-primary capitalize">{key}</p>
                    <p className="text-[11px] text-text-secondary font-mono mt-0.5">{filename}</p>
                  </div>
                  <Badge variant="success" className="text-[10px]">Verified</Badge>
                </div>
              ))}
              {Object.keys(appData.documents).length === 0 && (
                <p className="text-xs text-text-muted italic col-span-2">
                  No documents uploaded yet. Please use the Application Form tab to upload required files.
                </p>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: HELP & SUPPORT                                                     */}
        {/* ========================================================================= */}
        {activeTab === "help" && (
          <div className="bg-white border border-border p-6 sm:p-8 space-y-6 shadow-md">
            <h3 className="text-lg font-extrabold text-text-primary border-b border-border pb-4">
              Admissions Helpline & Support
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
              <div className="p-5 border border-border bg-background-secondary text-center space-y-2">
                <Phone className="w-6 h-6 text-primary mx-auto" />
                <h4 className="font-bold text-text-primary">Telephone Helpline</h4>
                <p className="font-mono text-text-secondary">{MOCK_COLLEGE.contactPhone}</p>
              </div>
              <div className="p-5 border border-border bg-background-secondary text-center space-y-2">
                <Mail className="w-6 h-6 text-accent-gold mx-auto" />
                <h4 className="font-bold text-text-primary">Admissions Email</h4>
                <p className="font-mono text-text-secondary">{MOCK_COLLEGE.contactEmail}</p>
              </div>
              <div className="p-5 border border-border bg-background-secondary text-center space-y-2">
                <Building2 className="w-6 h-6 text-primary mx-auto" />
                <h4 className="font-bold text-text-primary">Campus Visit</h4>
                <p className="text-text-secondary">Main Admissions Office, {MOCK_COLLEGE.city}</p>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* ── FOOTER ────────────────────────────────────────────────────────── */}
      <footer className="bg-white border-t border-border py-6 text-center text-xs text-text-muted mt-auto">
        <p>&copy; {new Date().getFullYear()} {MOCK_COLLEGE.name}. All rights reserved.</p>
      </footer>

    </div>
  );
}
