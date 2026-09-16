"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  X,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Clock,
  HelpCircle,
  PauseCircle,
  User,
  Phone,
  Mail,
  Calendar,
  CreditCard,
  Building2,
  GraduationCap,
  Bus,
  FileText,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Check,
} from "lucide-react";
import { CompleteApplication, ApplicationStatus } from "@/types/applications";
import {
  APPLICATION_STATUS_CONFIG,
  getApplicationLifecycleStatus,
} from "@/lib/mock-data/applications-data";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface ApplicationPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: CompleteApplication | null;
  onActionComplete?: (updatedApp: CompleteApplication) => void;
  onPerformAction?: (
    appId: string,
    action: "accept" | "reject" | "request_info" | "put_on_hold",
    data?: { reason?: string; note?: string }
  ) => void;
}

export function ApplicationPreviewModal({
  isOpen,
  onClose,
  application,
  onActionComplete,
  onPerformAction,
}: ApplicationPreviewModalProps) {
  const router = useRouter();

  // Action dialog state inside modal
  const [activeAction, setActiveAction] = useState<
    "none" | "accept_confirm" | "reject_form" | "request_info_form" | "hold_form"
  >("none");
  const [actionReason, setActionReason] = useState("");
  const [rejectionPreset, setRejectionPreset] = useState("Academic criteria not fulfilled");
  const [rejectionError, setRejectionError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !application) return null;

  const lifecycleStatus = getApplicationLifecycleStatus(application.status);
  const statusConfig = APPLICATION_STATUS_CONFIG[lifecycleStatus] || {
    label: lifecycleStatus,
    variant: "default",
    badgeClass: "bg-slate-100 text-slate-700",
    bgLight: "bg-slate-50",
    borderLight: "border-slate-200",
    textDark: "text-slate-800",
  };

  const primaryAcademic = application.academicHistory[0] || null;

  const handleOpenFullDetail = () => {
    onClose();
    router.push(`/admin/applications/${application.id}`);
  };

  const handleAccept = () => {
    if (!actionReason.trim()) {
      setRejectionError("Please provide the acceptance reason.");
      return;
    }
    if (isSubmitting) return;
    if (onPerformAction) {
      setIsSubmitting(true);
      onPerformAction(application.id, "accept", { reason: actionReason.trim() });
      setIsSubmitting(false);
      setActiveAction("none");
      setActionReason("");
      setRejectionError(null);
    }
  };

  const handleReject = () => {
    if (!actionReason.trim()) {
      setRejectionError("Please provide the reason for rejection.");
      return;
    }
    if (isSubmitting) return;
    if (onPerformAction) {
      setIsSubmitting(true);
      const fullReason = actionReason.trim()
        ? `${rejectionPreset}: ${actionReason.trim()}`
        : rejectionPreset;
      onPerformAction(application.id, "reject", { reason: fullReason });
      setIsSubmitting(false);
      setActiveAction("none");
      setActionReason("");
      setRejectionError(null);
    }
  };

  const handleRequestInfo = () => {
    if (!actionReason.trim()) {
      setRejectionError("Please specify the information required from the applicant.");
      return;
    }
    if (isSubmitting) return;
    if (onPerformAction) {
      setIsSubmitting(true);
      onPerformAction(application.id, "request_info", { note: actionReason.trim() });
      setIsSubmitting(false);
      setActiveAction("none");
      setActionReason("");
      setRejectionError(null);
    }
  };

  const handlePutOnHold = () => {
    if (!actionReason.trim()) {
      setRejectionError("Please provide the hold reason.");
      return;
    }
    if (isSubmitting) return;
    if (onPerformAction) {
      setIsSubmitting(true);
      onPerformAction(application.id, "put_on_hold", { note: actionReason.trim() });
      setIsSubmitting(false);
      setActiveAction("none");
      setActionReason("");
      setRejectionError(null);
    }
  };

  const openAction = (action: typeof activeAction) => {
    setActionReason("");
    setRejectionError(null);
    setActiveAction(action);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Main Modal Container */}
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-border z-10 overflow-hidden flex flex-col my-auto max-h-[92vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-[#075E68] to-[#087F8C] text-white flex items-center justify-between gap-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-white/15 border border-white/25 backdrop-blur-md flex items-center justify-center text-white shrink-0">
              <FileText className="w-5 h-5 text-accent-gold-light" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold tracking-tight truncate">
                  {application.personal.fullName}
                </h2>
                <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-white/20 text-white border border-white/30">
                  {application.applicationNumber}
                </span>
              </div>
              <p className="text-xs text-white/80 truncate mt-0.5">
                {application.preferences.selectedProgram} · {application.preferences.admissionSession}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusConfig.badgeClass}`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
              {statusConfig.label}
            </span>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/15 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 bg-background-secondary/40 text-text-primary text-sm">
          {/* Top Quick Strip */}
          <div className="bg-white rounded-xl p-4 border border-border shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-full overflow-hidden bg-primary-light border-2 border-primary/20 shrink-0 relative flex items-center justify-center">
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
              <div>
                <h3 className="font-bold text-text-primary text-base">
                  {application.personal.fullName}
                </h3>
                <p className="text-xs text-text-secondary mt-0.5 flex items-center gap-3 flex-wrap">
                  <span>Gender: <strong>{application.personal.gender}</strong></span>
                  <span>DOB: <strong>{application.personal.dob}</strong></span>
                  <span>CNIC: <strong className="font-mono">{application.personal.cnicBForm}</strong></span>
                </p>
              </div>
            </div>

            <div className="text-right sm:text-right text-xs">
              <p className="text-text-muted">Applied On</p>
              <p className="font-bold text-text-primary mt-0.5">
                {new Date(application.createdAt).toLocaleDateString("en-PK", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>

          {/* Action Overlay / Prompt Form when action is active */}
          {activeAction !== "none" && (
            <div className="portal-dialog-in bg-white rounded-xl p-4 sm:p-5 border-2 border-primary shadow-md">
              {activeAction === "accept_confirm" && (
                <div>
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-text-primary text-sm sm:text-base">
                        Accept this applicant?
                      </h4>
                      <p className="text-xs text-text-secondary mt-1">
                        Are you sure you want to approve and offer admission to{" "}
                        <span className="font-semibold text-text-primary">{application.personal.fullName}</span> for{" "}
                        <span className="font-semibold text-primary">{application.preferences.selectedProgram}</span>?
                        This will record an acceptance audit event and update the status to <strong>Accepted</strong>.
                      </p>

                      <div className="mt-3">
                        <label htmlFor="acceptance-reason" className="text-xs font-semibold text-text-primary block mb-1">
                          Acceptance Reason <span className="text-rose-600">*</span>
                        </label>
                        <textarea
                          id="acceptance-reason"
                          rows={2}
                          value={actionReason}
                          onChange={(e) => {
                            setActionReason(e.target.value);
                            if (e.target.value.trim()) setRejectionError(null);
                          }}
                          placeholder="e.g. Meets the academic merit and document verification requirements."
                          className={`w-full text-xs p-3 border rounded-lg bg-background-secondary focus:bg-white focus:outline-none focus:border-primary ${rejectionError ? "border-rose-400" : "border-border"}`}
                        />
                        {rejectionError && <p className="text-xs text-rose-600 mt-1">{rejectionError}</p>}
                      </div>

                      <div className="flex items-center justify-end gap-2 mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setActiveAction("none");
                            setActionReason("");
                            setRejectionError(null);
                          }}
                          disabled={isSubmitting}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white"
                          onClick={handleAccept}
                          disabled={isSubmitting}
                          leftIcon={<CheckCircle2 className="w-4 h-4" />}
                        >
                          {isSubmitting ? "Accepting..." : "Confirm & Accept"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeAction === "reject_form" && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-rose-700 font-bold text-sm">
                    <XCircle className="w-5 h-5" />
                    Reject Application — Reason Required
                  </div>
                  <p className="text-xs text-text-secondary">
                    Please specify a rejection reason. The application data will remain preserved permanently in the audit history.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-text-primary block mb-1">
                        Rejection Category
                      </label>
                      <select
                        value={rejectionPreset}
                        onChange={(e) => setRejectionPreset(e.target.value)}
                        className="w-full text-xs px-3 py-2 border border-border rounded-lg bg-background-secondary focus:bg-white focus:outline-none focus:border-primary"
                      >
                        <option value="Academic criteria not fulfilled">Academic criteria / Marks below cutoff</option>
                        <option value="Incomplete or forged documentation">Incomplete or unverified documentation</option>
                        <option value="Quota / Available seats filled">Program quota/seats exhausted</option>
                        <option value="Age / Ineligibility criteria">Ineligible for selected degree track</option>
                        <option value="Failed admission interview">Interview performance below required score</option>
                        <option value="Other administrative reason">Other administrative reason</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-text-primary block mb-1">
                        Rejection Reason
                      </label>
                      <textarea
                        rows={2}
                        id="rejection-reason"
                        aria-describedby={rejectionError ? "rejection-reason-error" : undefined}
                        aria-invalid={Boolean(rejectionError)}
                        placeholder="e.g. Scored below 60% threshold for FSc Pre-Medical"
                        value={actionReason}
                        onChange={(e) => {
                          setActionReason(e.target.value);
                          if (e.target.value.trim()) setRejectionError(null);
                        }}
                        className={`w-full text-xs px-3 py-2 border rounded-lg bg-background-secondary focus:bg-white focus:outline-none focus:border-primary ${rejectionError ? "border-rose-400" : "border-border"}`}
                      />
                      {rejectionError && <p id="rejection-reason-error" className="text-xs text-rose-600 mt-1">{rejectionError}</p>}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setActiveAction("none");
                        setActionReason("");
                        setRejectionError(null);
                      }}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-rose-600 hover:bg-rose-700 text-white border-transparent"
                      onClick={handleReject}
                      disabled={isSubmitting}
                      leftIcon={<XCircle className="w-4 h-4" />}
                    >
                      {isSubmitting ? "Rejecting..." : "Confirm Rejection"}
                    </Button>
                  </div>
                </div>
              )}

              {activeAction === "request_info_form" && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-purple-700 font-bold text-sm">
                    <HelpCircle className="w-5 h-5" />
                    Request More Information from Applicant
                  </div>
                  <p className="text-xs text-text-secondary">
                    Provide instructions for what the applicant needs to upload, fix, or clarify. Status will change to <strong>More Info Required</strong>.
                  </p>

                  <label htmlFor="information-required" className="text-xs font-semibold text-text-primary block">
                    Information Required <span className="text-rose-600">*</span>
                  </label>
                  <textarea
                    id="information-required"
                    aria-describedby={rejectionError ? "information-required-error" : undefined}
                    aria-invalid={Boolean(rejectionError)}
                    rows={2}
                    value={actionReason}
                    onChange={(e) => {
                      setActionReason(e.target.value);
                      if (e.target.value.trim()) setRejectionError(null);
                    }}
                    placeholder="e.g. Please re-upload a clear, readable color scan of your Intermediate Part-II result card and father's CNIC."
                    className={`w-full text-xs p-3 border rounded-lg bg-background-secondary focus:bg-white focus:outline-none focus:border-primary ${rejectionError ? "border-rose-400" : "border-border"}`}
                  />
                  {rejectionError && <p id="information-required-error" className="text-xs text-rose-600">{rejectionError}</p>}

                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setActiveAction("none");
                        setActionReason("");
                      }}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      className="bg-purple-700 hover:bg-purple-800 text-white"
                      onClick={handleRequestInfo}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Sending..." : "Send Request to Applicant"}
                    </Button>
                  </div>
                </div>
              )}

              {activeAction === "hold_form" && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-orange-700 font-bold text-sm">
                    <PauseCircle className="w-5 h-5" />
                    Put Application On Hold
                  </div>
                  <p className="text-xs text-text-secondary">
                    Specify the administrative reason for placing this application on hold (e.g., waiting for second merit list or board verification).
                  </p>

                  <label htmlFor="hold-reason" className="text-xs font-semibold text-text-primary block">
                    Hold Reason <span className="text-rose-600">*</span>
                  </label>
                  <input
                    id="hold-reason"
                    aria-describedby={rejectionError ? "hold-reason-error" : undefined}
                    aria-invalid={Boolean(rejectionError)}
                    type="text"
                    value={actionReason}
                    onChange={(e) => setActionReason(e.target.value)}
                    placeholder="e.g. Awaiting board gazette verification for special quota."
                    className={`w-full text-xs px-3 py-2 border rounded-lg bg-background-secondary focus:bg-white focus:outline-none focus:border-primary ${rejectionError ? "border-rose-400" : "border-border"}`}
                  />
                  {rejectionError && <p id="hold-reason-error" className="text-xs text-rose-600">{rejectionError}</p>}

                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setActiveAction("none");
                        setActionReason("");
                      }}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      className="bg-orange-600 hover:bg-orange-700 text-white"
                      onClick={handlePutOnHold}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Updating..." : "Put On Hold"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 6 Structured Overview Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 1. PERSONAL INFORMATION */}
            <div className="bg-white rounded-xl p-4 border border-border shadow-xs">
              <div className="flex items-center gap-2 pb-2.5 mb-3 border-b border-border/80 text-primary font-bold text-xs uppercase tracking-wider">
                <User className="w-4 h-4 text-accent-gold" />
                Personal Information
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-border/40">
                  <span className="text-text-muted">Full Name:</span>
                  <span className="font-semibold text-text-primary text-right">{application.personal.fullName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/40">
                  <span className="text-text-muted">App ID:</span>
                  <span className="font-mono font-bold text-primary text-right">{application.applicationNumber}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/40">
                  <span className="text-text-muted">Date of Birth:</span>
                  <span className="font-medium text-text-primary text-right">{application.personal.dob || "Not provided"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/40">
                  <span className="text-text-muted">Gender:</span>
                  <span className="font-medium text-text-primary text-right">{application.personal.gender}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/40">
                  <span className="text-text-muted">CNIC / B-Form:</span>
                  <span className="font-mono font-medium text-text-primary text-right">{application.personal.cnicBForm}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/40">
                  <span className="text-text-muted">Phone Number:</span>
                  <span className="font-mono font-medium text-text-primary text-right">{application.contact.phone}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-text-muted">Email Address:</span>
                  <span className="font-medium text-text-primary truncate max-w-[200px] text-right">{application.contact.email || "Not provided"}</span>
                </div>
              </div>
            </div>

            {/* 2. GUARDIAN INFORMATION */}
            <div className="bg-white rounded-xl p-4 border border-border shadow-xs">
              <div className="flex items-center gap-2 pb-2.5 mb-3 border-b border-border/80 text-primary font-bold text-xs uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-accent-gold" />
                Guardian Information
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-border/40">
                  <span className="text-text-muted">Father/Guardian:</span>
                  <span className="font-semibold text-text-primary text-right">{application.guardian.guardianName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/40">
                  <span className="text-text-muted">Relationship:</span>
                  <span className="font-medium text-text-primary text-right">{application.guardian.relationship}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/40">
                  <span className="text-text-muted">Guardian Phone:</span>
                  <span className="font-mono font-medium text-text-primary text-right">{application.guardian.guardianPhone}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/40">
                  <span className="text-text-muted">Guardian CNIC:</span>
                  <span className="font-mono font-medium text-text-primary text-right">{application.guardian.guardianCnic || "Not collected"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/40">
                  <span className="text-text-muted">Occupation:</span>
                  <span className="font-medium text-text-primary text-right">{application.guardian.guardianOccupation || "Not provided"}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-text-muted">Monthly Income:</span>
                  <span className="font-medium text-text-primary text-right">{application.guardian.guardianMonthlyIncome || "Not provided"}</span>
                </div>
              </div>
            </div>

            {/* 3. ACADEMIC SUMMARY */}
            <div className="bg-white rounded-xl p-4 border border-border shadow-xs">
              <div className="flex items-center gap-2 pb-2.5 mb-3 border-b border-border/80 text-primary font-bold text-xs uppercase tracking-wider">
                <GraduationCap className="w-4 h-4 text-accent-gold" />
                Academic Summary
              </div>
              {primaryAcademic ? (
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-border/40">
                    <span className="text-text-muted">Latest Qualification:</span>
                    <span className="font-semibold text-text-primary text-right">{primaryAcademic.qualification}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border/40">
                    <span className="text-text-muted">Previous Institution:</span>
                    <span className="font-medium text-text-primary text-right truncate max-w-[210px]">{primaryAcademic.institution}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border/40">
                    <span className="text-text-muted">Board / University:</span>
                    <span className="font-medium text-text-primary text-right">{primaryAcademic.boardOrUniversity}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border/40">
                    <span className="text-text-muted">Passing Year:</span>
                    <span className="font-medium text-text-primary text-right">{primaryAcademic.passingYear}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-text-muted">Marks & Percentage:</span>
                    <span className="font-bold text-primary text-right">
                      {primaryAcademic.obtainedMarks} / {primaryAcademic.totalMarks} ({primaryAcademic.percentage}%) · Grade {primaryAcademic.grade}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-text-muted italic py-2">No academic records submitted.</p>
              )}
            </div>

            {/* 4. ADMISSION INFORMATION */}
            <div className="bg-white rounded-xl p-4 border border-border shadow-xs">
              <div className="flex items-center gap-2 pb-2.5 mb-3 border-b border-border/80 text-primary font-bold text-xs uppercase tracking-wider">
                <Building2 className="w-4 h-4 text-accent-gold" />
                Admission Information
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-border/40">
                  <span className="text-text-muted">Selected Program:</span>
                  <span className="font-bold text-primary text-right">{application.preferences.selectedProgram}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/40">
                  <span className="text-text-muted">Preferred Campus:</span>
                  <span className="font-medium text-text-primary text-right">{application.preferences.campusPreference}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/40">
                  <span className="text-text-muted">Admission Session:</span>
                  <span className="font-medium text-text-primary text-right">{application.preferences.admissionSession}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/40">
                  <span className="text-text-muted">Application Date:</span>
                  <span className="font-medium text-text-primary text-right">
                    {new Date(application.createdAt).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-text-muted">Current Status:</span>
                  <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${statusConfig.badgeClass}`}>
                    {statusConfig.label}
                  </span>
                </div>
              </div>
            </div>

            {/* 5. TRANSPORT */}
            <div className="bg-white rounded-xl p-4 border border-border shadow-xs">
              <div className="flex items-center gap-2 pb-2.5 mb-3 border-b border-border/80 text-primary font-bold text-xs uppercase tracking-wider">
                <Bus className="w-4 h-4 text-accent-gold" />
                Transport Facility
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-border/40">
                  <span className="text-text-muted">Transport Required:</span>
                  <span className={`font-semibold ${application.transport.transportRequired ? "text-emerald-700" : "text-text-secondary"}`}>
                    {application.transport.transportRequired ? "Yes (College Bus)" : "No (Self Transport)"}
                  </span>
                </div>
                {application.transport.transportRequired && (
                  <>
                    <div className="flex justify-between py-1 border-b border-border/40">
                      <span className="text-text-muted">Selected Route:</span>
                      <span className="font-medium text-text-primary text-right">{application.transport.route || "To be allocated"}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-text-muted">Pickup Location:</span>
                      <span className="font-medium text-text-primary text-right">{application.transport.pickupLocation || "Not specified"}</span>
                    </div>
                  </>
                )}
                {!application.transport.transportRequired && (
                  <p className="text-xs text-text-muted italic py-1">Applicant will arrange private commuting.</p>
                )}
              </div>
            </div>

            {/* 6. DOCUMENT SUMMARY */}
            <div className="bg-white rounded-xl p-4 border border-border shadow-xs">
              <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-border/80">
                <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
                  <FileText className="w-4 h-4 text-accent-gold" />
                  Document Summary ({application.documents.length})
                </div>
              </div>
              <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                {application.documents.length === 0 ? (
                  <p className="text-xs text-text-muted italic">No documents uploaded.</p>
                ) : (
                  application.documents.map((doc) => {
                    const isVerified = doc.status === "verified";
                    const isReupload = doc.status === "reupload_requested";
                    return (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-1.5 rounded-lg bg-background-secondary border border-border/60 text-xs"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText className="w-3.5 h-3.5 text-primary shrink-0" />
                          <span className="font-medium text-text-primary truncate text-[11px]">{doc.title || doc.type}</span>
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
                          {isVerified ? "Verified" : isReupload ? "Re-upload" : "Pending Review"}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions — 6 Clear Actions as specified */}
        <div className="px-5 sm:px-6 py-3.5 bg-white border-t border-border flex flex-wrap items-center justify-between gap-2.5 shrink-0">
          {/* Primary View Full Page Action */}
          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenFullDetail}
            leftIcon={<ArrowRight className="w-4 h-4" />}
            className="shadow-xs font-semibold"
          >
            More Details
          </Button>

          {/* Administrative Decision Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {application.status !== "accepted" && application.status !== "enrolled" && (
              <Button
                variant="outline"
                size="sm"
                className="text-emerald-700 border-emerald-300 hover:bg-emerald-600 hover:text-white"
                leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                onClick={() => openAction("accept_confirm")}
              >
                Accept Admission
              </Button>
            )}

            {application.status !== "rejected" && (
              <Button
                variant="outline"
                size="sm"
                className="text-rose-600 border-rose-200 hover:bg-rose-600 hover:text-white"
                leftIcon={<XCircle className="w-3.5 h-3.5" />}
                onClick={() => openAction("reject_form")}
              >
                Reject Application
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              className="text-purple-700 border-purple-200 hover:bg-purple-50"
              leftIcon={<HelpCircle className="w-3.5 h-3.5" />}
              onClick={() => openAction("request_info_form")}
            >
              Request More Info
            </Button>

            {application.status !== "on_hold" && (
              <Button
                variant="outline"
                size="sm"
                className="text-orange-700 border-orange-200 hover:bg-orange-50"
                leftIcon={<PauseCircle className="w-3.5 h-3.5" />}
                  onClick={() => openAction("hold_form")}
              >
                Put On Hold
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-text-secondary hover:text-text-primary"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
