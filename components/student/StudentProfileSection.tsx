"use client";

import React, { useState } from "react";
import { StudentProfileData } from "@/lib/services/student-service";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatDate, getStatusBadgeVariant } from "@/lib/utils";
import {
  GraduationCap,
  User,
  BookOpen,
  Calendar,
  Building,
  Clock,
  Phone,
  Mail,
  MapPin,
  Shield,
  Heart,
  Globe,
  Award,
  CheckCircle2,
  FileText,
  Copy,
  Check,
} from "lucide-react";

export interface StudentProfileSectionProps {
  profile: StudentProfileData;
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (typeof navigator !== "undefined" && navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // Ignore clipboard write errors in restricted contexts
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={copied ? "Copied!" : `Copy ${label}`}
      aria-label={copied ? "Copied" : `Copy ${label}`}
      className="p-1 rounded-md text-text-secondary hover:text-text-primary hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors shrink-0"
    >
      {copied ? (
        <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
      ) : (
        <Copy className="w-3.5 h-3.5" />
      )}
    </button>
  );
}

interface DetailItemProps {
  label: string;
  value?: string | number | null;
  icon?: React.ReactNode;
  mono?: boolean;
  badge?: boolean;
  badgeVariant?: "default" | "success" | "warning" | "danger" | "info" | "secondary";
  helper?: string;
  emptyLabel?: string;
  copyable?: boolean;
}

function DetailItem({
  label,
  value,
  icon,
  mono = false,
  badge = false,
  badgeVariant = "secondary",
  helper,
  emptyLabel = "Not recorded",
  copyable = false,
}: DetailItemProps) {
  const isPresent =
    value !== undefined &&
    value !== null &&
    String(value).trim() !== "" &&
    String(value).trim() !== "N/A";

  const displayValue = isPresent ? String(value).trim() : null;

  return (
    <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/60 dark:bg-slate-900/50 dark:border-slate-800 transition-colors">
      <div className="flex items-center justify-between gap-1.5 text-xs text-text-secondary mb-1">
        <div className="flex items-center gap-1.5 min-w-0">
          {icon && <span className="text-primary shrink-0">{icon}</span>}
          <span className="font-medium truncate">{label}</span>
        </div>
        {displayValue && copyable && (
          <CopyButton text={displayValue} label={label} />
        )}
      </div>
      <div className="mt-0.5">
        {displayValue ? (
          badge ? (
            <Badge variant={badgeVariant} size="sm">
              {displayValue}
            </Badge>
          ) : (
            <p
              className={`text-sm font-semibold text-text-primary break-words ${
                mono ? "font-mono tracking-tight" : ""
              }`}
            >
              {displayValue}
            </p>
          )
        ) : (
          <p className="text-xs text-slate-400 dark:text-slate-500 italic">
            {emptyLabel}
          </p>
        )}
      </div>
      {helper && isPresent && (
        <p className="text-[11px] text-text-secondary mt-1">{helper}</p>
      )}
    </div>
  );
}

export function StudentProfileSection({ profile }: StudentProfileSectionProps) {
  // Safe extraction of program details without invented defaults
  const program = profile.program;
  const programName = program?.programName || program?.name || null;
  const academicLevel = program?.academicLevel || null;
  const session = program?.session || null;
  const shift = program?.shift || null;
  const campus = program?.campus || null;
  const currentSemesterOrYear = program?.currentSemesterOrYear ?? null;

  // Term label: Intermediate uses "Year X", Undergraduate uses "Semester X"
  const isInter = academicLevel ? academicLevel.toLowerCase().includes("intermediate") : false;
  const termLabel =
    currentSemesterOrYear !== null && currentSemesterOrYear !== undefined
      ? isInter
        ? `Year ${currentSemesterOrYear}`
        : `Semester ${currentSemesterOrYear}`
      : null;

  // Safe extraction of address fields
  const addressObj = typeof profile.address === "object" && profile.address !== null ? profile.address : null;
  const addressStr = typeof profile.address === "string" ? profile.address : null;
  const domicile = addressObj?.domicile || (profile as unknown as { domicile?: string }).domicile || null;
  const currentAddress = addressObj?.currentAddress || addressStr || null;
  const permanentAddress = addressObj?.permanentAddress || addressStr || null;

  // Safe extraction of guardian fields
  const guardian = profile.guardian;
  const fatherName = guardian?.fatherName || guardian?.name || (profile as unknown as { guardianName?: string }).guardianName || null;
  const motherName = guardian?.motherName || null;
  const guardianPhone = guardian?.guardianPhone || guardian?.phone || (profile as unknown as { guardianPhone?: string }).guardianPhone || null;
  const guardianRelation = guardian?.relation || null;

  // Enrollment Status
  const status = profile.status || "active";
  const statusVariant = getStatusBadgeVariant(status);

  // Formatted date values
  const formattedDob = profile.dob ? formatDate(profile.dob) : null;
  const formattedAdmissionDate = profile.admissionDate ? formatDate(profile.admissionDate) : null;

  return (
    <div className="space-y-6">
      {/* ── Top Key Metric Cards ────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Roll Number Card */}
        <div className="p-4 rounded-2xl bg-white border border-border shadow-[0_1px_2px_rgba(17,24,39,0.04)] dark:bg-slate-900 flex items-center justify-between">
          <div className="min-w-0 pr-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
              Official Roll No.
            </p>
            <div className="flex items-center gap-1.5 mt-1">
              <p className="text-lg font-bold font-mono text-text-primary truncate">
                {profile.rollNumber || "—"}
              </p>
              {profile.rollNumber && (
                <CopyButton text={profile.rollNumber} label="Roll Number" />
              )}
            </div>
            <span className="text-[11px] text-text-secondary">Academic Identifier</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-primary-light text-primary flex items-center justify-center shrink-0">
            <GraduationCap className="w-6 h-6" />
          </div>
        </div>

        {/* Student ID Card */}
        <div className="p-4 rounded-2xl bg-white border border-border shadow-[0_1px_2px_rgba(17,24,39,0.04)] dark:bg-slate-900 flex items-center justify-between">
          <div className="min-w-0 pr-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
              Student ID
            </p>
            <div className="flex items-center gap-1.5 mt-1">
              <p className="text-lg font-bold font-mono text-text-primary truncate">
                {profile.studentIdNumber || "—"}
              </p>
              {profile.studentIdNumber && (
                <CopyButton text={profile.studentIdNumber} label="Student ID" />
              )}
            </div>
            <span className="text-[11px] text-text-secondary">Registration No.</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-primary-light text-primary flex items-center justify-center shrink-0">
            <User className="w-6 h-6" />
          </div>
        </div>

        {/* Program Card */}
        <div className="p-4 rounded-2xl bg-white border border-border shadow-[0_1px_2px_rgba(17,24,39,0.04)] dark:bg-slate-900 flex items-center justify-between">
          <div className="min-w-0 pr-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
              Enrolled Program
            </p>
            <p className="text-base font-bold text-text-primary mt-1 truncate" title={programName || "Not assigned"}>
              {programName || "—"}
            </p>
            <span className="text-[11px] text-text-secondary capitalize">
              {academicLevel || "Level not set"}
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-primary-light text-primary flex items-center justify-center shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>

        {/* Term & Session Card */}
        <div className="p-4 rounded-2xl bg-white border border-border shadow-[0_1px_2px_rgba(17,24,39,0.04)] dark:bg-slate-900 flex items-center justify-between">
          <div className="min-w-0 pr-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
              Session & Term
            </p>
            <p className="text-lg font-bold text-text-primary mt-1">
              {termLabel || "—"}
            </p>
            <span className="text-[11px] text-text-secondary truncate block">
              {[session, shift ? `(${shift})` : null].filter(Boolean).join(" ") || "Session not set"}
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-primary-light text-primary flex items-center justify-center shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* ── Section 1: Academic & Program Details ───────────────────── */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle>Academic Enrollment Details</CardTitle>
                <Badge variant={statusVariant} size="sm">
                  {status.toUpperCase()}
                </Badge>
              </div>
              <CardDescription>
                Official degree program credentials and registration records confirmed by Admissions.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Verified Enrolled
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <DetailItem
              label="Academic Program"
              value={programName}
              emptyLabel="Not assigned"
              icon={<BookOpen className="w-4 h-4" />}
            />
            <DetailItem
              label="Academic Level"
              value={academicLevel}
              emptyLabel="Not assigned"
              icon={<Award className="w-4 h-4" />}
            />
            <DetailItem
              label="Academic Session"
              value={session}
              emptyLabel="Not assigned"
              icon={<Calendar className="w-4 h-4" />}
            />
            <DetailItem
              label="Current Progress"
              value={termLabel}
              emptyLabel="Not assigned"
              icon={<Clock className="w-4 h-4" />}
            />
            <DetailItem
              label="Campus Location"
              value={campus}
              emptyLabel="Not assigned"
              icon={<Building className="w-4 h-4" />}
            />
            <DetailItem
              label="Class Shift"
              value={shift}
              emptyLabel="Not assigned"
              icon={<Clock className="w-4 h-4" />}
            />
            <DetailItem
              label="Admission Date"
              value={formattedAdmissionDate}
              emptyLabel="Not recorded"
              icon={<Calendar className="w-4 h-4" />}
            />
            <DetailItem
              label="Enrollment Status"
              value={status}
              badge={true}
              badgeVariant={statusVariant}
              icon={<FileText className="w-4 h-4" />}
            />
          </div>
        </CardContent>
      </Card>

      {/* ── Section 2: Personal Identification Details ──────────────── */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Personal Identification Details</CardTitle>
              <CardDescription>
                Verified demographic records and national identity documentation.
              </CardDescription>
            </div>
            <div className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-text-secondary">
              <User className="w-4 h-4" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            <DetailItem
              label="Full Legal Name"
              value={profile.fullName}
              icon={<User className="w-4 h-4" />}
            />
            <DetailItem
              label="Student Registration ID"
              value={profile.studentIdNumber}
              mono={true}
              copyable={true}
              emptyLabel="Not assigned"
              icon={<Award className="w-4 h-4" />}
            />
            <DetailItem
              label="Official Roll Number"
              value={profile.rollNumber}
              mono={true}
              copyable={true}
              emptyLabel="Not assigned"
              icon={<GraduationCap className="w-4 h-4" />}
            />
            <DetailItem
              label="Date of Birth"
              value={formattedDob}
              icon={<Calendar className="w-4 h-4" />}
            />
            <DetailItem
              label="Gender"
              value={profile.gender}
              icon={<User className="w-4 h-4" />}
            />
            <DetailItem
              label="CNIC / B-Form Number"
              value={profile.cnicBForm}
              mono={true}
              copyable={true}
              icon={<FileText className="w-4 h-4" />}
            />
            <DetailItem
              label="Blood Group"
              value={profile.bloodGroup}
              badge={Boolean(profile.bloodGroup)}
              badgeVariant="danger"
              icon={<Heart className="w-4 h-4" />}
            />
            <DetailItem
              label="Nationality"
              value={profile.nationality}
              icon={<Globe className="w-4 h-4" />}
            />
            <DetailItem
              label="Religion"
              value={profile.religion}
              icon={<Shield className="w-4 h-4" />}
            />
          </div>
        </CardContent>
      </Card>

      {/* ── Section 3: Contact & Address Information ────────────────── */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Contact & Residence</CardTitle>
              <CardDescription>
                Registered mobile phone, student email, and official residential addresses.
              </CardDescription>
            </div>
            <div className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-text-secondary">
              <MapPin className="w-4 h-4" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            <DetailItem
              label="Registered Mobile Phone"
              value={profile.phone}
              mono={true}
              copyable={true}
              icon={<Phone className="w-4 h-4" />}
            />
            <DetailItem
              label="Email Address"
              value={profile.email}
              copyable={true}
              icon={<Mail className="w-4 h-4" />}
            />
            <DetailItem
              label="Domicile District"
              value={domicile}
              icon={<Building className="w-4 h-4" />}
            />
            <div className="sm:col-span-2 lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
              <DetailItem
                label="Current Residential Address"
                value={currentAddress}
                icon={<MapPin className="w-4 h-4" />}
              />
              <DetailItem
                label="Permanent Address"
                value={permanentAddress}
                icon={<MapPin className="w-4 h-4" />}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Section 4: Parent & Guardian Details ─────────────────────── */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Parent & Guardian Information</CardTitle>
              <CardDescription>
                Official guardian records and emergency contact details on file with the college.
              </CardDescription>
            </div>
            <div className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-text-secondary">
              <Shield className="w-4 h-4" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            <DetailItem
              label="Father's Name"
              value={fatherName}
              icon={<User className="w-4 h-4" />}
            />
            <DetailItem
              label="Mother's Name"
              value={motherName}
              icon={<User className="w-4 h-4" />}
            />
            <DetailItem
              label="Guardian Emergency Contact"
              value={guardianPhone}
              mono={true}
              copyable={true}
              icon={<Phone className="w-4 h-4" />}
            />
            {guardianRelation && (
              <DetailItem
                label="Relationship to Student"
                value={guardianRelation}
                icon={<Shield className="w-4 h-4" />}
              />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
