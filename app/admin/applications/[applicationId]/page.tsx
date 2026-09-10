"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  HelpCircle,
  PauseCircle,
  Download,
  Printer,
  FileText,
  User,
  Phone,
  Mail,
  MapPin,
  Building2,
  GraduationCap,
  Bus,
  ShieldCheck,
  AlertTriangle,
  History,
  Eye,
  Calendar,
  CreditCard,
  Check,
  ExternalLink,
  ChevronRight,
  Info,
  Sparkles,
} from "lucide-react";
import {
  CompleteApplication,
  ApplicationStatus,
  SubmittedDocument,
  ApplicationAuditEvent,
} from "@/types/applications";
import {
  findApplicationById,
  executeApplicationAction,
  APPLICATION_STATUS_CONFIG,
  updateStoredApplication,
} from "@/lib/mock-data/applications-data";

interface PageProps {
  params: Promise<{
    applicationId: string;
  }>;
}

export default function AdminApplicationDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const applicationId = resolvedParams.applicationId;
  const router = useRouter();

  const [application, setApplication] = useState<CompleteApplication | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showHoldModal, setShowHoldModal] = useState(false);
  const [selectedDocPreview, setSelectedDocPreview] = useState<SubmittedDocument | null>(null);

  // Form Inputs
  const [rejectionPreset, setRejectionPreset] = useState("Academic criteria / Marks below cutoff");
  const [rejectionNotes, setRejectionNotes] = useState("");
  const [requestInfoNotes, setRequestInfoNotes] = useState("");
  const [holdNotes, setHoldNotes] = useState("");
  const [rejectionError, setRejectionError] = useState<string | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    const loaded = findApplicationById(applicationId);
    setApplication(loaded);
    setLoading(false);
  }, [applicationId]);

  const refreshData = () => {
    const reloaded = findApplicationById(applicationId);
    if (reloaded) setApplication(reloaded);
  };

  const showSuccessBanner = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(null), 5000);
  };

  // Administrative Actions
  const handleAcceptAdmission = () => {
    if (!application) return;
    const updated = executeApplicationAction(
      application.id,
      "accepted",
      "Admission Accepted",
      `Admission confirmed for ${application.preferences.selectedProgram}. Fee voucher scheduled.`,
      "Admin (Admissions Directorate)",
      "Senior Registrar"
    );
    if (updated) {
      setApplication(updated);
      setShowAcceptModal(false);
      showSuccessBanner(`Application ${application.applicationNumber} has been marked as Accepted.`);
    }
  };

  const handleRejectApplication = () => {
    if (!application) return;
    const reasonDetails = rejectionNotes.trim();
    if (!reasonDetails) {
      setRejectionError("Please provide the reason for rejection.");
      return;
    }
    const finalReason = `${rejectionPreset} — ${reasonDetails}`;

    const updated = executeApplicationAction(
      application.id,
      "rejected",
      "Application Rejected",
      finalReason,
      "Admin (Admissions Directorate)",
      "Senior Registrar"
    );
    if (updated) {
      setApplication(updated);
      setShowRejectModal(false);
      setRejectionNotes("");
      setRejectionError(null);
      showSuccessBanner(`Application ${application.applicationNumber} status set to Rejected.`);
    }
  };

  const handleRequestInfo = () => {
    if (!application || !requestInfoNotes.trim()) return;
    const updated = executeApplicationAction(
      application.id,
      "more_info_required",
      "More Information Requested",
      requestInfoNotes.trim(),
      "Admin (Admissions Officer)",
      "Admissions Staff"
    );
    if (updated) {
      setApplication(updated);
      setShowInfoModal(false);
      setRequestInfoNotes("");
      showSuccessBanner(`Request sent to applicant. Status changed to More Info Required.`);
    }
  };

  const handlePutOnHold = () => {
    if (!application || !holdNotes.trim()) return;
    const updated = executeApplicationAction(
      application.id,
      "on_hold",
      "Application Placed On Hold",
      holdNotes.trim(),
      "Admin (Admissions Officer)",
      "Admissions Staff"
    );
    if (updated) {
      setApplication(updated);
      setShowHoldModal(false);
      setHoldNotes("");
      showSuccessBanner(`Application ${application.applicationNumber} has been placed on hold.`);
    }
  };

  const handleDocumentVerificationToggle = (docId: string, newStatus: "verified" | "rejected" | "reupload_requested") => {
    if (!application) return;
    const updated = updateStoredApplication(application.id, (prev) => ({
      ...prev,
      documents: prev.documents.map((d) => (d.id === docId ? { ...d, status: newStatus } : d)),
    }));
    if (updated) {
      setApplication(updated);
      if (selectedDocPreview && selectedDocPreview.id === docId) {
        setSelectedDocPreview({ ...selectedDocPreview, status: newStatus });
      }
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-3">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-sm font-medium text-text-secondary">Loading complete application...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!application) {
    return (
      <AdminLayout>
        <div className="max-w-xl mx-auto py-16 text-center space-y-4">
          <div className="w-14 h-14 bg-rose-50 border border-rose-200 text-rose-600 rounded-full flex items-center justify-center mx-auto">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-text-primary">Application Not Found</h2>
          <p className="text-sm text-text-secondary">
            The requested application identifier <strong className="font-mono">{applicationId}</strong> does not exist or has been relocated.
          </p>
          <div className="pt-2">
            <Link href="/admin/admissions">
              <Button variant="primary" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                Return to Admissions List
              </Button>
            </Link>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const statusConfig = APPLICATION_STATUS_CONFIG[application.status] || {
    label: application.status,
    variant: "default",
    badgeClass: "bg-slate-100 text-slate-700",
    bgLight: "bg-slate-50",
    borderLight: "border-slate-200",
    textDark: "text-slate-800",
  };

  return (
    <AdminLayout>
      {/* ── Notification Banner if action recently performed ─────────────── */}
      {actionSuccessMsg && (
        <div className="portal-success mb-4 p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5 text-sm font-medium">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            {actionSuccessMsg}
          </div>
          <button
            onClick={() => setActionSuccessMsg(null)}
            className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ── Navigation Breadcrumb & Back Action ───────────────────────────── */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <Link
          href="/admin/admissions"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-dark transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Admission Applications
        </Link>
        <span className="text-xs text-text-muted hidden sm:inline">
          Application Ref: <strong className="font-mono text-text-primary">{application.applicationNumber}</strong>
        </span>
      </div>

      {/* ── Sticky Top Action Bar / Page Header ───────────────────────────── */}
      <div className="bg-white border border-border rounded-2xl p-5 mb-6 shadow-xs sticky top-16 z-20 backdrop-blur-md bg-white/95 transition-all">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Applicant Identification */}
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-14 h-14 rounded-full overflow-hidden bg-primary-light border-2 border-primary/20 shrink-0 relative flex items-center justify-center shadow-xs">
              {application.personal.photoUrl ? (
                <img
                  src={application.personal.photoUrl}
                  alt={application.personal.fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-7 h-7 text-primary" />
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-extrabold text-text-primary tracking-tight truncate">
                  {application.personal.fullName}
                </h1>
                <span className="px-2.5 py-0.5 rounded-md text-xs font-mono font-bold bg-primary-light text-primary border border-primary/20">
                  {application.applicationNumber}
                </span>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusConfig.badgeClass}`}>
                  <span className="w-2 h-2 rounded-full bg-current"></span>
                  {statusConfig.label}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-text-secondary mt-1 flex-wrap">
                <span>Program: <strong className="text-text-primary">{application.preferences.selectedProgram}</strong></span>
                <span>Session: <strong className="text-text-primary">{application.preferences.admissionSession}</strong></span>
                <span>Campus: <strong className="text-text-primary">{application.preferences.campusPreference}</strong></span>
              </div>
            </div>
          </div>

          {/* Action Button Strip */}
          <div className="flex flex-wrap items-center gap-2 border-t lg:border-t-0 pt-3 lg:pt-0 border-border">
            {application.status !== "accepted" && application.status !== "enrolled" && (
              <Button
                variant="primary"
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs font-semibold"
                leftIcon={<CheckCircle2 className="w-4 h-4" />}
                onClick={() => setShowAcceptModal(true)}
              >
                Accept Admission
              </Button>
            )}

            {application.status !== "rejected" && (
              <Button
                variant="outline"
                size="sm"
                className="text-rose-600 border-rose-200 hover:bg-rose-600 hover:text-white"
                leftIcon={<XCircle className="w-4 h-4" />}
                onClick={() => setShowRejectModal(true)}
              >
                Reject Application
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              className="text-purple-700 border-purple-200 hover:bg-purple-50"
              leftIcon={<HelpCircle className="w-4 h-4" />}
              onClick={() => setShowInfoModal(true)}
            >
              Request More Info
            </Button>

            {application.status !== "on_hold" && (
              <Button
                variant="outline"
                size="sm"
                className="text-orange-700 border-orange-200 hover:bg-orange-50"
                leftIcon={<PauseCircle className="w-4 h-4" />}
                onClick={() => setShowHoldModal(true)}
              >
                Put On Hold
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              leftIcon={<Printer className="w-4 h-4" />}
              onClick={() => window.print()}
              title="Print Application Docket"
            >
              Print
            </Button>
          </div>
        </div>
      </div>

      {/* ── Main Structured Layout: 9 Mandatory Sections + Audit Trail ─────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Sections A through I */}
        <div className="lg:col-span-2 space-y-6">
          {/* ══════════════════════════════════════════════════════════════
              SECTION A — APPLICATION OVERVIEW
          ══════════════════════════════════════════════════════════════ */}
          <section className="bg-white border border-border rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-border">
              <div className="flex items-center gap-2 text-primary font-bold text-sm tracking-wide uppercase">
                <span className="w-2 h-4 bg-accent-gold rounded-full inline-block"></span>
                SECTION A — APPLICATION OVERVIEW
              </div>
              <span className="text-xs text-text-muted">General Docket</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="p-3 bg-background-secondary rounded-xl border border-border/70">
                <p className="text-[10px] uppercase font-bold text-text-muted tracking-wider">Application Number</p>
                <p className="font-mono font-bold text-primary text-sm mt-0.5">{application.applicationNumber}</p>
              </div>

              <div className="p-3 bg-background-secondary rounded-xl border border-border/70">
                <p className="text-[10px] uppercase font-bold text-text-muted tracking-wider">Application Date</p>
                <p className="font-semibold text-text-primary text-sm mt-0.5">
                  {new Date(application.createdAt).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </div>

              <div className="p-3 bg-background-secondary rounded-xl border border-border/70">
                <p className="text-[10px] uppercase font-bold text-text-muted tracking-wider">Last Updated</p>
                <p className="font-semibold text-text-primary text-sm mt-0.5">
                  {application.updatedAt
                    ? new Date(application.updatedAt).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" })
                    : "Original"}
                </p>
              </div>

              <div className="p-3 bg-background-secondary rounded-xl border border-border/70">
                <p className="text-[10px] uppercase font-bold text-text-muted tracking-wider">Admission Session</p>
                <p className="font-semibold text-text-primary text-sm mt-0.5">{application.preferences.admissionSession}</p>
              </div>

              <div className="p-3 bg-background-secondary rounded-xl border border-border/70">
                <p className="text-[10px] uppercase font-bold text-text-muted tracking-wider">Program Applied</p>
                <p className="font-bold text-text-primary text-sm mt-0.5 truncate" title={application.preferences.selectedProgram}>
                  {application.preferences.selectedProgram}
                </p>
              </div>

              <div className="p-3 bg-background-secondary rounded-xl border border-border/70">
                <p className="text-[10px] uppercase font-bold text-text-muted tracking-wider">Academic Level</p>
                <p className="font-semibold text-text-primary text-sm mt-0.5">{application.preferences.academicLevel}</p>
              </div>

              <div className="p-3 bg-background-secondary rounded-xl border border-border/70">
                <p className="text-[10px] uppercase font-bold text-text-muted tracking-wider">Campus</p>
                <p className="font-semibold text-text-primary text-sm mt-0.5">{application.preferences.campusPreference}</p>
              </div>

              <div className="p-3 bg-background-secondary rounded-xl border border-border/70">
                <p className="text-[10px] uppercase font-bold text-text-muted tracking-wider">Current Status</p>
                <div className="mt-1">
                  <Badge variant={statusConfig.variant} dot size="sm">
                    {statusConfig.label}
                  </Badge>
                </div>
              </div>
            </div>
          </section>

          {/* ══════════════════════════════════════════════════════════════
              SECTION B — PERSONAL INFORMATION
          ══════════════════════════════════════════════════════════════ */}
          <section className="bg-white border border-border rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-border">
              <div className="flex items-center gap-2 text-primary font-bold text-sm tracking-wide uppercase">
                <span className="w-2 h-4 bg-accent-gold rounded-full inline-block"></span>
                SECTION B — PERSONAL INFORMATION
              </div>
              <span className="text-xs text-text-muted">Applicant Identity</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-5 items-start">
              {/* Photo */}
              <div className="shrink-0 flex flex-col items-center gap-2">
                <div className="w-28 h-28 rounded-xl overflow-hidden bg-background-secondary border-2 border-border shadow-xs">
                  {application.personal.photoUrl ? (
                    <img
                      src={application.personal.photoUrl}
                      alt={application.personal.fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-text-muted text-xs">
                      <User className="w-8 h-8 opacity-40 mb-1" />
                      No Photo
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-text-muted font-medium">Passport Photo</span>
              </div>

              {/* Grid of Personal Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1 text-xs w-full">
                <div className="p-2.5 bg-background-secondary rounded-lg border border-border/60">
                  <span className="text-text-muted block text-[11px]">Full Name</span>
                  <span className="font-bold text-text-primary text-sm">{application.personal.fullName}</span>
                </div>

                <div className="p-2.5 bg-background-secondary rounded-lg border border-border/60">
                  <span className="text-text-muted block text-[11px]">Father's Name</span>
                  <span className="font-semibold text-text-primary">{application.personal.fatherName || "Not provided"}</span>
                </div>

                <div className="p-2.5 bg-background-secondary rounded-lg border border-border/60">
                  <span className="text-text-muted block text-[11px]">Mother's Name</span>
                  <span className="font-semibold text-text-primary">{application.personal.motherName || "Not provided"}</span>
                </div>

                <div className="p-2.5 bg-background-secondary rounded-lg border border-border/60">
                  <span className="text-text-muted block text-[11px]">Date of Birth</span>
                  <span className="font-semibold text-text-primary">{application.personal.dob || "Not provided"}</span>
                </div>

                <div className="p-2.5 bg-background-secondary rounded-lg border border-border/60">
                  <span className="text-text-muted block text-[11px]">Gender</span>
                  <span className="font-semibold text-text-primary">{application.personal.gender}</span>
                </div>

                <div className="p-2.5 bg-background-secondary rounded-lg border border-border/60">
                  <span className="text-text-muted block text-[11px]">CNIC / B-Form Number</span>
                  <span className="font-mono font-bold text-primary">{application.personal.cnicBForm}</span>
                </div>

                <div className="p-2.5 bg-background-secondary rounded-lg border border-border/60">
                  <span className="text-text-muted block text-[11px]">Nationality</span>
                  <span className="font-semibold text-text-primary">{application.personal.nationality}</span>
                </div>

                <div className="p-2.5 bg-background-secondary rounded-lg border border-border/60">
                  <span className="text-text-muted block text-[11px]">Religion</span>
                  <span className="font-semibold text-text-primary">{application.personal.religion || "Not provided"}</span>
                </div>

                <div className="p-2.5 bg-background-secondary rounded-lg border border-border/60">
                  <span className="text-text-muted block text-[11px]">Blood Group</span>
                  <span className="font-semibold text-text-primary">{application.personal.bloodGroup || "Not provided"}</span>
                </div>

                <div className="p-2.5 bg-background-secondary rounded-lg border border-border/60">
                  <span className="text-text-muted block text-[11px]">Domicile District</span>
                  <span className="font-semibold text-text-primary">{application.personal.domicile || "Not provided"}</span>
                </div>

                <div className="p-2.5 bg-background-secondary rounded-lg border border-border/60">
                  <span className="text-text-muted block text-[11px]">Marital Status</span>
                  <span className="font-semibold text-text-primary">{application.personal.maritalStatus || "Not provided"}</span>
                </div>
              </div>
            </div>
          </section>

          {/* ══════════════════════════════════════════════════════════════
              SECTION C — CONTACT INFORMATION
          ══════════════════════════════════════════════════════════════ */}
          <section className="bg-white border border-border rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-border">
              <div className="flex items-center gap-2 text-primary font-bold text-sm tracking-wide uppercase">
                <span className="w-2 h-4 bg-accent-gold rounded-full inline-block"></span>
                SECTION C — CONTACT INFORMATION
              </div>
              <span className="text-xs text-text-muted">Communication Coordinates</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-background-secondary rounded-xl border border-border/60">
                <span className="text-text-muted flex items-center gap-1.5 mb-1 font-semibold">
                  <Phone className="w-3.5 h-3.5 text-primary" /> Primary Phone
                </span>
                <span className="font-mono font-bold text-text-primary text-sm">{application.contact.phone}</span>
              </div>

              <div className="p-3 bg-background-secondary rounded-xl border border-border/60">
                <span className="text-text-muted flex items-center gap-1.5 mb-1 font-semibold">
                  <Phone className="w-3.5 h-3.5 text-text-muted" /> Alternate Phone
                </span>
                <span className="font-mono text-text-primary">{application.contact.altPhone || "Not provided"}</span>
              </div>

              <div className="p-3 bg-background-secondary rounded-xl border border-border/60">
                <span className="text-text-muted flex items-center gap-1.5 mb-1 font-semibold">
                  <Mail className="w-3.5 h-3.5 text-primary" /> Email Address
                </span>
                <span className="font-semibold text-text-primary truncate block">{application.contact.email || "Not provided"}</span>
              </div>

              <div className="p-3 bg-background-secondary rounded-xl border border-border/60 sm:col-span-2">
                <span className="text-text-muted flex items-center gap-1.5 mb-1 font-semibold">
                  <MapPin className="w-3.5 h-3.5 text-primary" /> Current / Postal Address
                </span>
                <span className="font-medium text-text-primary">{application.contact.currentAddress || "Not provided"}</span>
              </div>

              <div className="p-3 bg-background-secondary rounded-xl border border-border/60">
                <span className="text-text-muted block mb-1 font-semibold">City & District</span>
                <span className="font-medium text-text-primary">{application.contact.city}, {application.contact.district}</span>
              </div>

              <div className="p-3 bg-background-secondary rounded-xl border border-border/60 sm:col-span-2">
                <span className="text-text-muted flex items-center gap-1.5 mb-1 font-semibold">
                  <MapPin className="w-3.5 h-3.5 text-text-muted" /> Permanent Address
                </span>
                <span className="font-medium text-text-primary">{application.contact.permanentAddress || "Not provided"}</span>
              </div>

              <div className="p-3 bg-background-secondary rounded-xl border border-border/60">
                <span className="text-text-muted block mb-1 font-semibold">Province & Postal Code</span>
                <span className="font-medium text-text-primary">
                  {application.contact.province} {application.contact.postalCode ? `(${application.contact.postalCode})` : ""}
                </span>
              </div>
            </div>
          </section>

          {/* ══════════════════════════════════════════════════════════════
              SECTION D — PARENT / GUARDIAN INFORMATION
          ══════════════════════════════════════════════════════════════ */}
          <section className="bg-white border border-border rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-border">
              <div className="flex items-center gap-2 text-primary font-bold text-sm tracking-wide uppercase">
                <span className="w-2 h-4 bg-accent-gold rounded-full inline-block"></span>
                SECTION D — PARENT / GUARDIAN INFORMATION
              </div>
              <span className="text-xs text-text-muted">Guardian Records</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-background-secondary rounded-xl border border-border/60">
                <span className="text-text-muted block mb-1">Guardian Name</span>
                <span className="font-bold text-text-primary text-sm">{application.guardian.guardianName}</span>
              </div>

              <div className="p-3 bg-background-secondary rounded-xl border border-border/60">
                <span className="text-text-muted block mb-1">Relationship</span>
                <span className="font-semibold text-text-primary">{application.guardian.relationship}</span>
              </div>

              <div className="p-3 bg-background-secondary rounded-xl border border-border/60">
                <span className="text-text-muted block mb-1">Guardian Phone</span>
                <span className="font-mono font-semibold text-text-primary">{application.guardian.guardianPhone}</span>
              </div>

              <div className="p-3 bg-background-secondary rounded-xl border border-border/60">
                <span className="text-text-muted block mb-1">Guardian CNIC</span>
                <span className="font-mono font-medium text-text-primary">{application.guardian.guardianCnic || "Not provided"}</span>
              </div>

              <div className="p-3 bg-background-secondary rounded-xl border border-border/60">
                <span className="text-text-muted block mb-1">Occupation</span>
                <span className="font-semibold text-text-primary">{application.guardian.guardianOccupation || "Not provided"}</span>
              </div>

              <div className="p-3 bg-background-secondary rounded-xl border border-border/60">
                <span className="text-text-muted block mb-1">Monthly Income</span>
                <span className="font-semibold text-text-primary">{application.guardian.guardianMonthlyIncome || "Not provided"}</span>
              </div>

              <div className="p-3 bg-background-secondary rounded-xl border border-border/60 sm:col-span-2">
                <span className="text-text-muted block mb-1">Guardian Address</span>
                <span className="font-medium text-text-primary">{application.guardian.guardianAddress || "Same as applicant current address"}</span>
              </div>

              <div className="p-3 bg-background-secondary rounded-xl border border-border/60">
                <span className="text-text-muted block mb-1">Emergency Contact</span>
                <span className="font-medium text-text-primary">
                  {application.guardian.emergencyContactName ? `${application.guardian.emergencyContactName} (${application.guardian.emergencyContactPhone || ""})` : "Not provided"}
                </span>
              </div>
            </div>
          </section>

          {/* ══════════════════════════════════════════════════════════════
              SECTION E — ACADEMIC HISTORY (Supports multiple records)
          ══════════════════════════════════════════════════════════════ */}
          <section className="bg-white border border-border rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-border">
              <div className="flex items-center gap-2 text-primary font-bold text-sm tracking-wide uppercase">
                <span className="w-2 h-4 bg-accent-gold rounded-full inline-block"></span>
                SECTION E — ACADEMIC HISTORY
              </div>
              <span className="text-xs text-text-muted">{application.academicHistory.length} Record(s) Submitted</span>
            </div>

            {application.academicHistory.length === 0 ? (
              <p className="text-xs text-text-muted italic py-4 text-center">No academic history records submitted.</p>
            ) : (
              <div className="space-y-4">
                {application.academicHistory.map((acad, idx) => (
                  <div
                    key={acad.id || idx}
                    className="p-4 rounded-xl border border-border bg-background-secondary/50 space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs">
                          {idx + 1}
                        </span>
                        <h3 className="font-bold text-text-primary text-sm">{acad.qualification}</h3>
                        <span className="text-xs text-text-muted font-normal">({acad.level})</span>
                      </div>
                      <span className="text-xs font-bold text-primary bg-primary-light px-2.5 py-0.5 rounded-full border border-primary/20">
                        {acad.obtainedMarks} / {acad.totalMarks} ({acad.percentage}%) · Grade {acad.grade}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div>
                        <span className="text-text-muted block text-[11px]">Institution</span>
                        <span className="font-semibold text-text-primary">{acad.institution}</span>
                      </div>

                      <div>
                        <span className="text-text-muted block text-[11px]">Board / University</span>
                        <span className="font-semibold text-text-primary">{acad.boardOrUniversity}</span>
                      </div>

                      <div>
                        <span className="text-text-muted block text-[11px]">Roll Number</span>
                        <span className="font-mono font-semibold text-text-primary">{acad.rollNumber || "Not provided"}</span>
                      </div>

                      <div>
                        <span className="text-text-muted block text-[11px]">Passing Year</span>
                        <span className="font-semibold text-text-primary">{acad.passingYear}</span>
                      </div>
                    </div>

                    {acad.majorSubjects && acad.majorSubjects.length > 0 && (
                      <div className="pt-1 border-t border-border/40 flex items-center gap-2 flex-wrap text-xs">
                        <span className="text-text-muted text-[11px] font-semibold">Major Subjects / Group:</span>
                        {acad.majorSubjects.map((sub, sidx) => (
                          <span
                            key={sidx}
                            className="px-2 py-0.5 rounded-md bg-white border border-border text-text-primary text-[11px] font-medium"
                          >
                            {sub}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ══════════════════════════════════════════════════════════════
              SECTION F — PROGRAM / ADMISSION PREFERENCES
          ══════════════════════════════════════════════════════════════ */}
          <section className="bg-white border border-border rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-border">
              <div className="flex items-center gap-2 text-primary font-bold text-sm tracking-wide uppercase">
                <span className="w-2 h-4 bg-accent-gold rounded-full inline-block"></span>
                SECTION F — PROGRAM & ADMISSION PREFERENCES
              </div>
              <span className="text-xs text-text-muted">Choice of Study</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-background-secondary rounded-xl border border-border/60">
                <span className="text-text-muted block mb-1">Selected Program</span>
                <span className="font-bold text-primary text-sm">{application.preferences.selectedProgram}</span>
              </div>

              <div className="p-3 bg-background-secondary rounded-xl border border-border/60">
                <span className="text-text-muted block mb-1">1st Preference</span>
                <span className="font-semibold text-text-primary">{application.preferences.firstPreference}</span>
              </div>

              <div className="p-3 bg-background-secondary rounded-xl border border-border/60">
                <span className="text-text-muted block mb-1">2nd Preference</span>
                <span className="font-semibold text-text-primary">{application.preferences.secondPreference || "Not provided"}</span>
              </div>

              <div className="p-3 bg-background-secondary rounded-xl border border-border/60">
                <span className="text-text-muted block mb-1">Campus Preference</span>
                <span className="font-semibold text-text-primary">{application.preferences.campusPreference}</span>
              </div>

              <div className="p-3 bg-background-secondary rounded-xl border border-border/60">
                <span className="text-text-muted block mb-1">Admission Category / Quota</span>
                <span className="font-semibold text-text-primary">{application.preferences.admissionCategory}</span>
              </div>

              <div className="p-3 bg-background-secondary rounded-xl border border-border/60">
                <span className="text-text-muted block mb-1">Shift / Timing</span>
                <span className="font-semibold text-text-primary">{application.preferences.shiftPreference || "Morning"}</span>
              </div>
            </div>
          </section>

          {/* ══════════════════════════════════════════════════════════════
              SECTION G — TRANSPORT INFORMATION
          ══════════════════════════════════════════════════════════════ */}
          <section className="bg-white border border-border rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-border">
              <div className="flex items-center gap-2 text-primary font-bold text-sm tracking-wide uppercase">
                <span className="w-2 h-4 bg-accent-gold rounded-full inline-block"></span>
                SECTION G — TRANSPORT INFORMATION
              </div>
              <span className="text-xs text-text-muted">Commuting Facility</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-background-secondary rounded-xl border border-border/60">
                <span className="text-text-muted block mb-1">Transport Required</span>
                <span className={`font-bold ${application.transport.transportRequired ? "text-emerald-700" : "text-text-secondary"}`}>
                  {application.transport.transportRequired ? "Yes (College Bus)" : "No (Self Transport)"}
                </span>
              </div>

              <div className="p-3 bg-background-secondary rounded-xl border border-border/60">
                <span className="text-text-muted block mb-1">Allocated Route</span>
                <span className="font-semibold text-text-primary">{application.transport.route || "Not required / Not allocated"}</span>
              </div>

              <div className="p-3 bg-background-secondary rounded-xl border border-border/60">
                <span className="text-text-muted block mb-1">Pickup Stop / Location</span>
                <span className="font-semibold text-text-primary">{application.transport.pickupLocation || "Not provided"}</span>
              </div>

              {application.transport.notes && (
                <div className="p-3 bg-background-secondary rounded-xl border border-border/60 sm:col-span-3">
                  <span className="text-text-muted block mb-1">Transport Notes</span>
                  <span className="font-medium text-text-primary">{application.transport.notes}</span>
                </div>
              )}
            </div>
          </section>

          {/* ══════════════════════════════════════════════════════════════
              SECTION H — DOCUMENTS (With preview action & verification)
          ══════════════════════════════════════════════════════════════ */}
          <section className="bg-white border border-border rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-border">
              <div className="flex items-center gap-2 text-primary font-bold text-sm tracking-wide uppercase">
                <span className="w-2 h-4 bg-accent-gold rounded-full inline-block"></span>
                SECTION H — SUBMITTED DOCUMENTS
              </div>
              <span className="text-xs text-text-muted">{application.documents.length} Document(s) Uploaded</span>
            </div>

            {application.documents.length === 0 ? (
              <p className="text-xs text-text-muted italic py-4 text-center">No documents have been uploaded for this application.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {application.documents.map((doc) => {
                  const isVerified = doc.status === "verified";
                  const isReupload = doc.status === "reupload_requested";
                  return (
                    <div
                      key={doc.id}
                      className="p-3.5 rounded-xl border border-border bg-background-secondary/60 hover:bg-background-secondary transition-colors flex flex-col justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-primary-light text-primary flex items-center justify-center shrink-0 border border-primary/20">
                              <FileText className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-bold text-text-primary truncate text-xs">{doc.title || doc.type}</h4>
                              <p className="text-[11px] text-text-muted font-mono truncate">{doc.fileName} · {doc.fileSize}</p>
                            </div>
                          </div>

                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 border ${
                              isVerified
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : isReupload
                                ? "bg-purple-50 text-purple-700 border-purple-200"
                                : "bg-amber-50 text-amber-700 border-amber-200"
                            }`}
                          >
                            {isVerified ? "Verified" : isReupload ? "Re-upload" : "Pending"}
                          </span>
                        </div>

                        {doc.rejectionReason && (
                          <div className="mt-2 p-2 bg-purple-50 border border-purple-200 rounded-md text-[11px] text-purple-900">
                            <strong>Note:</strong> {doc.rejectionReason}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-border/50 text-[11px]">
                        <span className="text-text-muted">Uploaded: {doc.uploadDate}</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setSelectedDocPreview(doc)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 font-semibold text-primary hover:bg-primary-light rounded-md transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Preview
                          </button>
                          <button
                            onClick={() => alert(`Downloading ${doc.fileName}…`)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 font-semibold text-text-secondary hover:bg-slate-200 rounded-md transition-colors"
                            title="Download document"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* ══════════════════════════════════════════════════════════════
              SECTION I — DECLARATION / ADDITIONAL INFORMATION
          ══════════════════════════════════════════════════════════════ */}
          <section className="bg-white border border-border rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-border">
              <div className="flex items-center gap-2 text-primary font-bold text-sm tracking-wide uppercase">
                <span className="w-2 h-4 bg-accent-gold rounded-full inline-block"></span>
                SECTION I — DECLARATION & ADDITIONAL INFORMATION
              </div>
              <span className="text-xs text-text-muted">Applicant Undertaking</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-background-secondary rounded-xl border border-border/60 flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3 h-3" />
                </div>
                <div>
                  <p className="font-semibold text-text-primary">Applicant Undertaking & Truthfulness Declaration</p>
                  <p className="text-text-muted text-[11px] mt-0.5">
                    {application.declaration.applicantDeclarationAgreed
                      ? `Agreed and electronically signed on ${new Date(application.declaration.declarationDate).toLocaleString("en-PK")}`
                      : "Pending signature"}
                  </p>
                </div>
              </div>

              {application.declaration.specialCircumstances && (
                <div className="p-3 bg-background-secondary rounded-xl border border-border/60">
                  <span className="text-text-muted block text-[11px] font-semibold mb-0.5">Special Circumstances / Quota Request</span>
                  <p className="font-medium text-text-primary">{application.declaration.specialCircumstances}</p>
                </div>
              )}

              {application.declaration.extracurricularActivities && (
                <div className="p-3 bg-background-secondary rounded-xl border border-border/60">
                  <span className="text-text-muted block text-[11px] font-semibold mb-0.5">Extracurricular Activities & Achievements</span>
                  <p className="font-medium text-text-primary">{application.declaration.extracurricularActivities}</p>
                </div>
              )}

              {application.declaration.customAnswers && application.declaration.customAnswers.length > 0 && (
                <div className="p-3 bg-background-secondary rounded-xl border border-border/60 space-y-2">
                  <span className="text-text-muted block text-[11px] font-semibold">Admission Questionnaire Responses</span>
                  {application.declaration.customAnswers.map((qa, qidx) => (
                    <div key={qidx} className="bg-white p-2.5 rounded-lg border border-border/70 text-xs">
                      <p className="font-semibold text-text-primary">{qa.question}</p>
                      <p className="text-text-secondary mt-1 italic">"{qa.answer}"</p>
                    </div>
                  ))}
                </div>
              )}

              {application.declaration.notes && (
                <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl">
                  <span className="text-amber-800 block text-[11px] font-bold uppercase tracking-wider mb-0.5">Applicant / Admin Note</span>
                  <p className="text-amber-950">{application.declaration.notes}</p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Right 1 Column: Section J — Application History & Audit Trail + Quick Stats */}
        <div className="space-y-6">
          {/* Quick Summary Card */}
          <div className="bg-white border border-border rounded-2xl p-5 shadow-xs">
            <div className="flex items-center gap-2 pb-3 mb-3 border-b border-border text-primary font-bold text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-accent-gold" />
              Review Summary
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-text-muted">Assigned Reviewer</span>
                <span className="font-medium text-text-primary text-right">{application.assignedReviewer || "Unassigned"}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-text-muted">Cycle</span>
                <span className="font-medium text-text-primary text-right">{application.admissionCycle}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-text-muted">Total Documents</span>
                <span className="font-bold text-text-primary text-right">{application.documents.length}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-text-muted">Verified Documents</span>
                <span className="font-bold text-emerald-700 text-right">
                  {application.documents.filter((d) => d.status === "verified").length} / {application.documents.length}
                </span>
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════════
              SECTION J / AUDIT TRAIL — APPLICATION HISTORY
          ══════════════════════════════════════════════════════════════ */}
          <div className="bg-white border border-border rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-border">
              <div className="flex items-center gap-2 text-primary font-bold text-sm tracking-wide uppercase">
                <History className="w-4 h-4 text-accent-gold" />
                APPLICATION HISTORY / AUDIT TRAIL
              </div>
              <span className="text-xs text-text-muted">{application.history.length} Event(s)</span>
            </div>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
              {application.history.map((event, idx) => (
                <div
                  key={event.id || idx}
                  className="portal-fade-up relative group text-xs"
                  style={{ animationDelay: `${idx * 60}ms` }}
                >
                  {/* Timeline Dot */}
                  <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-white border-2 border-primary group-hover:scale-110 transition-transform"></div>

                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-bold text-text-primary text-xs">{event.action}</h4>
                      <span className="text-[10px] text-text-muted whitespace-nowrap">
                        {new Date(event.timestamp).toLocaleDateString("en-PK", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    </div>

                    <p className="text-[11px] text-text-secondary mt-0.5">
                      By <strong className="text-text-primary">{event.performedBy}</strong> ({event.role})
                    </p>

                    {event.note && (
                      <div className="mt-1.5 p-2 rounded-md bg-background-secondary border border-border/70 text-[11px] text-text-secondary">
                        {event.note}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── MODALS FOR ACTIONS ────────────────────────────────────────────── */}

      {/* 1. Accept Admission Confirmation Modal */}
      <Modal
        isOpen={showAcceptModal}
        onClose={() => setShowAcceptModal(false)}
        title="Accept this applicant?"
        size="md"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button variant="outline" size="sm" onClick={() => setShowAcceptModal(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
              onClick={handleAcceptAdmission}
            >
              Confirm & Issue Admission
            </Button>
          </div>
        }
      >
        <div className="space-y-3 text-sm">
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-emerald-900">Confirm admission for this applicant</p>
              <p className="text-xs text-emerald-800 mt-0.5">
                You are about to accept admission for <strong className="font-semibold">{application.personal.fullName}</strong> in program <strong className="font-semibold">{application.preferences.selectedProgram}</strong>.
              </p>
            </div>
          </div>

          <p className="text-xs text-text-secondary">
            This action will update the application status to <strong>Accepted</strong> and append a permanent event to the application's audit history. All submitted applicant data is safely preserved.
          </p>
        </div>
      </Modal>

      {/* 2. Reject Application Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => {
          setShowRejectModal(false);
          setRejectionError(null);
        }}
        title="Reject Admission Application"
        size="md"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button variant="outline" size="sm" onClick={() => setShowRejectModal(false)}>
              Cancel
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-rose-600 hover:bg-rose-700 text-white border-transparent font-semibold"
              leftIcon={<XCircle className="w-4 h-4" />}
              onClick={handleRejectApplication}
            >
              Confirm Rejection
            </Button>
          </div>
        }
      >
        <div className="space-y-4 text-sm">
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3">
            <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-rose-900">Application Rejection Required Rationale</p>
              <p className="text-xs text-rose-800 mt-0.5">
                The application record and all submitted data will remain preserved in the system archives for accountability.
              </p>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-text-primary block mb-1">
              Select Primary Rejection Reason <span className="text-rose-600">*</span>
            </label>
            <select
              value={rejectionPreset}
              onChange={(e) => setRejectionPreset(e.target.value)}
              className="w-full text-xs px-3 py-2.5 border border-border rounded-lg bg-background-secondary focus:bg-white focus:outline-none focus:border-primary text-text-primary"
            >
              <option value="Academic criteria / Marks below cutoff">Academic criteria / Marks below required cutoff</option>
              <option value="Incomplete or unverified documentation">Incomplete or unverified documentation</option>
              <option value="Program quota / seats exhausted">Program quota / available seats exhausted</option>
              <option value="Ineligible for selected degree track">Ineligible for selected degree track</option>
              <option value="Failed admission interview">Interview performance below required criteria</option>
              <option value="Other administrative reason">Other administrative reason</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-text-primary block mb-1">
              Additional Details / Administrative Remarks
            </label>
            <textarea
              rows={2}
              value={rejectionNotes}
              onChange={(e) => {
                setRejectionNotes(e.target.value);
                if (e.target.value.trim()) setRejectionError(null);
              }}
              placeholder="e.g. Scored 48.5% which is below the 60% minimum requirement for FSc."
              className={`w-full text-xs p-3 border rounded-lg bg-background-secondary focus:bg-white focus:outline-none focus:border-primary text-text-primary ${rejectionError ? "border-rose-400" : "border-border"}`}
            />
            {rejectionError && <p className="text-xs text-rose-600 mt-1">{rejectionError}</p>}
          </div>
        </div>
      </Modal>

      {/* 3. Request More Info Modal */}
      <Modal
        isOpen={showInfoModal}
        onClose={() => setShowInfoModal(false)}
        title="Request Additional Information"
        size="md"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button variant="outline" size="sm" onClick={() => setShowInfoModal(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="bg-purple-700 hover:bg-purple-800 text-white font-semibold"
              leftIcon={<HelpCircle className="w-4 h-4" />}
              disabled={!requestInfoNotes.trim()}
              onClick={handleRequestInfo}
            >
              Send Request to Applicant
            </Button>
          </div>
        }
      >
        <div className="space-y-4 text-sm">
          <p className="text-xs text-text-secondary">
            Provide clear guidance on what missing information, corrected document scan, or clarification is requested from the applicant. Status will update to <strong>More Info Required</strong>.
          </p>

          <div>
            <label className="text-xs font-bold text-text-primary block mb-1">
              Message to Applicant <span className="text-rose-600">*</span>
            </label>
            <textarea
              rows={3}
              value={requestInfoNotes}
              onChange={(e) => setRequestInfoNotes(e.target.value)}
              placeholder="e.g. Please re-upload a clear, non-blurry scan of your official BISE Intermediate Result Card and your father's CNIC copy."
              className="w-full text-xs p-3 border border-border rounded-lg bg-background-secondary focus:bg-white focus:outline-none focus:border-primary text-text-primary"
            />
          </div>
        </div>
      </Modal>

      {/* 4. Put On Hold Modal */}
      <Modal
        isOpen={showHoldModal}
        onClose={() => setShowHoldModal(false)}
        title="Put Application On Hold"
        size="md"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button variant="outline" size="sm" onClick={() => setShowHoldModal(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="bg-orange-600 hover:bg-orange-700 text-white font-semibold"
              leftIcon={<PauseCircle className="w-4 h-4" />}
              disabled={!holdNotes.trim()}
              onClick={handlePutOnHold}
            >
              Place On Hold
            </Button>
          </div>
        }
      >
        <div className="space-y-4 text-sm">
          <p className="text-xs text-text-secondary">
            Specify the administrative reason for placing this application on hold (such as awaiting 2nd merit list or board gazette verification). Status will update to <strong>On Hold</strong>.
          </p>

          <div>
            <label className="text-xs font-bold text-text-primary block mb-1">
              Hold Reason <span className="text-rose-600">*</span>
            </label>
            <textarea
              rows={2}
              value={holdNotes}
              onChange={(e) => setHoldNotes(e.target.value)}
              placeholder="e.g. Awaiting release of second merit list quota allocation."
              className="w-full text-xs p-3 border border-border rounded-lg bg-background-secondary focus:bg-white focus:outline-none focus:border-primary text-text-primary"
            />
          </div>
        </div>
      </Modal>

      {/* 5. Document Viewer & Verification Modal */}
      {selectedDocPreview && (
        <Modal
          isOpen={!!selectedDocPreview}
          onClose={() => setSelectedDocPreview(null)}
          title={`Document Preview — ${selectedDocPreview.title || selectedDocPreview.type}`}
          size="lg"
          footer={
            <div className="flex flex-wrap items-center justify-between gap-3 w-full">
              <div className="flex items-center gap-2">
                <span className="text-xs text-text-secondary font-medium">Verify Document:</span>
                <Button
                  variant="outline"
                  size="sm"
                  className={selectedDocPreview.status === "verified" ? "bg-emerald-50 text-emerald-700 border-emerald-300 font-bold" : "text-emerald-700 border-emerald-300"}
                  leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                  onClick={() => handleDocumentVerificationToggle(selectedDocPreview.id, "verified")}
                >
                  Mark Verified
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className={selectedDocPreview.status === "reupload_requested" ? "bg-purple-50 text-purple-700 border-purple-300 font-bold" : "text-purple-700 border-purple-300"}
                  leftIcon={<HelpCircle className="w-3.5 h-3.5" />}
                  onClick={() => handleDocumentVerificationToggle(selectedDocPreview.id, "reupload_requested")}
                >
                  Request Re-upload
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Download className="w-4 h-4" />}
                  onClick={() => alert(`Downloading ${selectedDocPreview.fileName}…`)}
                >
                  Download
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setSelectedDocPreview(null)}>
                  Close
                </Button>
              </div>
            </div>
          }
        >
          <div className="space-y-4">
            {/* Preview Box */}
            <div className="h-72 bg-slate-900 rounded-xl flex flex-col items-center justify-center p-6 text-white text-center border border-slate-700">
              {selectedDocPreview.fileUrl ? (
                <img
                  src={selectedDocPreview.fileUrl}
                  alt={selectedDocPreview.title}
                  className="max-h-full max-w-full object-contain rounded-lg"
                />
              ) : (
                <div className="space-y-3">
                  <FileText className="w-16 h-16 text-accent-gold mx-auto opacity-80" />
                  <div>
                    <p className="font-bold text-sm text-white">{selectedDocPreview.fileName}</p>
                    <p className="text-xs text-slate-400 mt-1">{selectedDocPreview.type} · {selectedDocPreview.fileSize}</p>
                  </div>
                  <span className="inline-block px-3 py-1 bg-white/10 rounded-full text-xs text-white/80 border border-white/20">
                    Document ready for verification
                  </span>
                </div>
              )}
            </div>

            {/* Document metadata table */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-background-secondary p-3.5 rounded-xl border border-border">
              <div>
                <span className="text-text-muted block text-[10px] uppercase font-bold">Document Type</span>
                <span className="font-semibold text-text-primary">{selectedDocPreview.type}</span>
              </div>
              <div>
                <span className="text-text-muted block text-[10px] uppercase font-bold">File Size</span>
                <span className="font-semibold text-text-primary">{selectedDocPreview.fileSize}</span>
              </div>
              <div>
                <span className="text-text-muted block text-[10px] uppercase font-bold">Upload Date</span>
                <span className="font-semibold text-text-primary">{selectedDocPreview.uploadDate}</span>
              </div>
              <div>
                <span className="text-text-muted block text-[10px] uppercase font-bold">Status</span>
                <span className="font-bold capitalize text-primary">{selectedDocPreview.status.replace(/_/g, " ")}</span>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </AdminLayout>
  );
}
