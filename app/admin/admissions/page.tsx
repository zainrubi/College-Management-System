"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";
import {
  Search,
  Download,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  Phone,
  GraduationCap,
  FileText,
  Users,
  ChevronUp,
  ChevronDown,
  RefreshCw,
  HelpCircle,
  PauseCircle,
  UserCheck,
  AlertTriangle,
  Mail,
  ClipboardList,
  ExternalLink,
} from "lucide-react";
import { CompleteApplication, ApplicationStatus } from "@/types/applications";
import {
  getStoredApplications,
  executeApplicationAction,
  APPLICATION_STATUS_CONFIG,
  getApplicationLifecycleStatus,
} from "@/lib/mock-data/applications-data";
import { ApplicationPreviewModal } from "@/components/admin/admissions/ApplicationPreviewModal";

const PAGE_SIZE = 10;
type SortField = "applicationNumber" | "applicantName" | "createdAt" | "marks";
type SortDir = "asc" | "desc";

const normalizeProgramValue = (value: string) => value.trim().replace(/\s+/g, " ").toLocaleLowerCase();

export default function AdminAdmissionsPage() {
  const [applications, setApplications] = useState<CompleteApplication[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [filterProgram, setFilterProgram] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [filterLevel, setFilterLevel] = useState("all");

  const statusFilterLabels: Record<string, string> = {
    draft: "draft",
    submitted: "submitted / pending",
    under_review: "under review",
    more_info_required: "more information required",
    on_hold: "on hold",
    accepted: "accepted",
    rejected: "rejected",
    withdrawn: "withdrawn",
  };

  // Sort
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Preview Modal state
  const [selectedApp, setSelectedApp] = useState<CompleteApplication | null>(null);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);

  // Success message toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    setApplications(getStoredApplications());
    setIsLoaded(true);
  }, []);

  const refreshApplications = () => {
    setApplications(getStoredApplications());
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Perform quick action from modal or table
  const handlePerformAction = (
    appId: string,
    action: "accept" | "reject" | "request_info" | "put_on_hold",
    data?: { reason?: string; note?: string }
  ) => {
    if ((action === "accept" || action === "reject" || action === "request_info" || action === "put_on_hold") && !(data?.reason || data?.note)?.trim()) {
      return;
    }

    let newStatus: ApplicationStatus = "submitted";
    let actionTitle = "Application Updated";
    let note = data?.reason || data?.note;

    if (action === "accept") {
      newStatus = "accepted";
      actionTitle = "Admission Accepted";
      note = note || "Admission approved by Admin.";
    } else if (action === "reject") {
      newStatus = "rejected";
      actionTitle = "Application Rejected";
    } else if (action === "request_info") {
      newStatus = "more_info_required";
      actionTitle = "More Information Requested";
    } else if (action === "put_on_hold") {
      newStatus = "on_hold";
      actionTitle = "Application Placed On Hold";
    }

    const updated = executeApplicationAction(appId, newStatus, actionTitle, note);
    if (updated) {
      refreshApplications();
      setSelectedApp(updated);
      showToast(`Application ${updated.applicationNumber} updated to ${APPLICATION_STATUS_CONFIG[newStatus]?.label || newStatus}.`);
    }
  };

  const allPrograms = useMemo(() => {
    return [...new Set(applications.map((a) => a.preferences.selectedProgram))].sort();
  }, [applications]);

  // Computed stats
  const stats = useMemo(() => {
    const total = applications.length;
    const lifecycleStatuses = applications.map((application) => getApplicationLifecycleStatus(application.status));
    const count = (status: ApplicationStatus) => lifecycleStatuses.filter((value) => value === status).length;
    return {
      total,
      draft: count("draft"),
      submitted: count("submitted"),
      underReview: count("under_review"),
      moreInfoRequired: count("more_info_required"),
      onHold: count("on_hold"),
      accepted: count("accepted"),
      rejected: count("rejected"),
      withdrawn: count("withdrawn"),
    };
  }, [applications]);

  const statusMatchesFilter = (status: ApplicationStatus) => {
    return filterStatus === "all" || getApplicationLifecycleStatus(status) === filterStatus;
  };

  // Filter -> sort -> paginate
  const filtered = useMemo(() => {
    return applications.filter((app) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        app.personal.fullName.toLowerCase().includes(q) ||
        app.applicationNumber.toLowerCase().includes(q) ||
        app.contact.phone.includes(q) ||
        app.preferences.selectedProgram.toLowerCase().includes(q) ||
        app.personal.cnicBForm.includes(q);

      const matchProgram =
        filterProgram === "all" ||
        normalizeProgramValue(app.preferences.selectedProgram) === normalizeProgramValue(filterProgram);
      const matchStatus = statusMatchesFilter(app.status);
      const matchLevel = filterLevel === "all" || app.preferences.academicLevel === filterLevel;

      const appDate = new Date(app.createdAt);
      const matchDateFrom = !filterDateFrom || appDate >= new Date(filterDateFrom);
      const matchDateTo = !filterDateTo || appDate <= new Date(filterDateTo);

      return matchSearch && matchProgram && matchStatus && matchLevel && matchDateFrom && matchDateTo;
    });
  }, [applications, search, filterProgram, filterStatus, filterLevel, filterDateFrom, filterDateTo]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let cmp = 0;
      if (sortField === "createdAt") {
        cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (sortField === "marks") {
        const marksA = a.academicHistory[0]?.percentage || 0;
        const marksB = b.academicHistory[0]?.percentage || 0;
        cmp = marksA - marksB;
      } else if (sortField === "applicantName") {
        cmp = a.personal.fullName.localeCompare(b.personal.fullName);
      } else if (sortField === "applicationNumber") {
        cmp = a.applicationNumber.localeCompare(b.applicationNumber);
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paginated = sorted.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
    setCurrentPage(1);
  };

  const handleFilterChange = () => setCurrentPage(1);

  const resetFilters = () => {
    setSearch("");
    setFilterProgram("all");
    setFilterStatus("all");
    setFilterLevel("all");
    setFilterDateFrom("");
    setFilterDateTo("");
    setCurrentPage(1);
  };

  const hasActiveFilters =
    search ||
    filterProgram !== "all" ||
    filterStatus !== "all" ||
    filterLevel !== "all" ||
    filterDateFrom ||
    filterDateTo;

  const handleSummaryFilter = (status: string) => {
    setFilterStatus(status);
    setCurrentPage(1);
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronUp className="w-3.5 h-3.5 text-slate-300 ml-1 inline" />;
    return sortDir === "asc" ? (
      <ChevronUp className="w-3.5 h-3.5 text-primary ml-1 inline" />
    ) : (
      <ChevronDown className="w-3.5 h-3.5 text-primary ml-1 inline" />
    );
  };

  return (
    <AdminLayout>
      {/* ── Toast Notification ────────────────────────────────────────────── */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl border border-white/10 flex items-center gap-3 text-xs font-semibold animate-in slide-in-from-bottom-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          {toastMessage}
        </div>
      )}

      {/* ── Page Header ───────────────────────────────────────────────────── */}
      <PageHeader
        title="Admission Applications"
        subtitle="Review, filter, preview, and process student applications for Fall 2026 admissions."
        breadcrumbs={[
          { label: "Admin Portal", href: "/admin" },
          { label: "People", href: "/admin/students" },
          { label: "Admissions" },
        ]}
        badge={
          <Badge variant="info" dot>
            {stats.total} Total Applications
          </Badge>
        }
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Download className="w-4 h-4" />}
              onClick={() => alert("Exporting applications as CSV…")}
            >
              Export CSV
            </Button>
          </div>
        }
      />

      {/* ── Stats Strip ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-6">
        {[
          { label: "Total Applications", value: stats.total, statusFilter: "all", icon: <Users className="w-5 h-5 text-primary" />, bg: "bg-primary-light/60 border-primary/20" },
          { label: "Submitted / Pending", value: stats.submitted, statusFilter: "submitted", icon: <ClipboardList className="w-5 h-5 text-sky-600" />, bg: "bg-sky-50 border-sky-200" },
          { label: "Under Review", value: stats.underReview, statusFilter: "under_review", icon: <Clock className="w-5 h-5 text-amber-600" />, bg: "bg-amber-50 border-amber-200" },
          { label: "On Hold", value: stats.onHold, statusFilter: "on_hold", icon: <PauseCircle className="w-5 h-5 text-orange-600" />, bg: "bg-orange-50 border-orange-200" },
          { label: "Accepted", value: stats.accepted, statusFilter: "accepted", icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />, bg: "bg-emerald-50 border-emerald-200" },
          { label: "Rejected", value: stats.rejected, statusFilter: "rejected", icon: <XCircle className="w-5 h-5 text-rose-600" />, bg: "bg-rose-50 border-rose-200" },
        ].map((s) => (
          <button
            key={s.label}
            type="button"
            onClick={() => handleSummaryFilter(s.statusFilter)}
            aria-pressed={filterStatus === s.statusFilter}
            className={`rounded-xl border p-3.5 sm:p-4 flex items-center gap-3 text-left cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-sm ${s.bg} ${
              filterStatus === s.statusFilter ? "ring-2 ring-primary ring-offset-1 shadow-sm" : ""
            }`}
          >
            <div className="shrink-0">{s.icon}</div>
            <div>
              <p className="text-xl sm:text-2xl font-extrabold text-text-primary leading-none">{s.value}</p>
              <p className="text-xs text-text-secondary mt-0.5 font-medium">{s.label}</p>
            </div>
          </button>
        ))}
      </div>

      {/* ── Filters & Search ──────────────────────────────────────────────── */}
      <div className="bg-white border border-border rounded-xl p-4 mb-4 space-y-3 shadow-xs">
        {/* Row 1: search + quick status + level */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by applicant name, app number, phone, CNIC, or program…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                handleFilterChange();
              }}
              className="w-full pl-9 pr-4 py-2.5 text-sm rounded-lg bg-background-secondary border border-border focus:outline-none focus:border-primary focus:bg-white transition-colors"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              handleFilterChange();
            }}
            className="px-3 py-2.5 text-sm rounded-lg border border-border bg-white focus:outline-none focus:border-primary text-text-primary"
          >
            <option value="all">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="submitted">Submitted / Pending</option>
            <option value="under_review">Under Review</option>
            <option value="more_info_required">More Information Required</option>
            <option value="on_hold">On Hold</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
            <option value="withdrawn">Withdrawn</option>
          </select>

          <select
            value={filterLevel}
            onChange={(e) => {
              setFilterLevel(e.target.value);
              handleFilterChange();
            }}
            className="px-3 py-2.5 text-sm rounded-lg border border-border bg-white focus:outline-none focus:border-primary text-text-primary"
          >
            <option value="all">All Academic Levels</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Undergraduate">Undergraduate</option>
          </select>
        </div>

        {/* Row 2: program + date range */}
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={filterProgram}
            onChange={(e) => {
              setFilterProgram(e.target.value);
              handleFilterChange();
            }}
            className="flex-1 px-3 py-2.5 text-sm rounded-lg border border-border bg-white focus:outline-none focus:border-primary text-text-primary"
          >
            <option value="all">All Degree Programs</option>
            {allPrograms.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-2">
            <label className="text-xs text-text-secondary whitespace-nowrap font-medium">From:</label>
            <input
              type="date"
              value={filterDateFrom}
              onChange={(e) => {
                setFilterDateFrom(e.target.value);
                handleFilterChange();
              }}
              className="px-3 py-2 text-xs rounded-lg border border-border bg-white focus:outline-none focus:border-primary text-text-primary"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-text-secondary whitespace-nowrap font-medium">To:</label>
            <input
              type="date"
              value={filterDateTo}
              onChange={(e) => {
                setFilterDateTo(e.target.value);
                handleFilterChange();
              }}
              className="px-3 py-2 text-xs rounded-lg border border-border bg-white focus:outline-none focus:border-primary text-text-primary"
            />
          </div>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:text-rose-800 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors whitespace-nowrap"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Clear Filters
            </button>
          )}
        </div>

        {/* Results summary */}
        <div className="flex items-center justify-between text-xs text-text-secondary border-t border-border pt-2">
          <span>
            Showing <strong className="text-text-primary font-semibold">{sorted.length}</strong> of{" "}
            <strong className="text-text-primary font-semibold">{applications.length}</strong> applications
          </span>
          <span className="hidden sm:inline">
            Sorted by <strong className="text-text-primary font-semibold capitalize">{sortField}</strong> (
            {sortDir === "asc" ? "ascending" : "descending"})
          </span>
        </div>
      </div>

      {/* ── Data Table ────────────────────────────────────────────────────── */}
      <div className="bg-white border border-border rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-slate-50 border-b border-border text-xs font-semibold uppercase tracking-wider text-text-secondary">
              <tr>
                <th
                  className="px-4 py-3.5 cursor-pointer select-none whitespace-nowrap"
                  onClick={() => handleSort("applicationNumber")}
                >
                  <span className="inline-flex items-center gap-0.5">
                    App. No <SortIcon field="applicationNumber" />
                  </span>
                </th>
                <th
                  className="px-4 py-3.5 cursor-pointer select-none whitespace-nowrap"
                  onClick={() => handleSort("applicantName")}
                >
                  <span className="inline-flex items-center gap-0.5">
                    Applicant Name <SortIcon field="applicantName" />
                  </span>
                </th>
                <th className="px-4 py-3.5 whitespace-nowrap">Phone & CNIC</th>
                <th className="px-4 py-3.5 whitespace-nowrap">Program</th>
                <th
                  className="px-4 py-3.5 cursor-pointer select-none whitespace-nowrap"
                  onClick={() => handleSort("createdAt")}
                >
                  <span className="inline-flex items-center gap-0.5">
                    Date <SortIcon field="createdAt" />
                  </span>
                </th>
                <th
                  className="px-4 py-3.5 cursor-pointer select-none whitespace-nowrap"
                  onClick={() => handleSort("marks")}
                >
                  <span className="inline-flex items-center gap-0.5">
                    Marks % <SortIcon field="marks" />
                  </span>
                </th>
                <th className="px-4 py-3.5 whitespace-nowrap">Status</th>
                <th className="px-4 py-3.5 text-center whitespace-nowrap">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3 text-text-muted">
                      <Search className="w-10 h-10 opacity-30" />
                      <p className="text-sm font-semibold">
                        {filterStatus === "all"
                          ? "No applications match your filters"
                          : `No ${statusFilterLabels[filterStatus] || "applications"} applications found.`}
                      </p>
                      <button onClick={resetFilters} className="text-xs text-primary hover:underline font-medium">
                        Clear all filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                paginated.map((app) => {
                  const lifecycleStatus = getApplicationLifecycleStatus(app.status);
                  const statusCfg = APPLICATION_STATUS_CONFIG[lifecycleStatus] || {
                    label: lifecycleStatus,
                    badgeClass: "bg-slate-100 text-slate-700",
                  };
                  const primaryAcad = app.academicHistory[0];
                  const marks = primaryAcad?.percentage || 0;

                  return (
                    <tr key={app.id} className="hover:bg-primary-light/20 transition-colors group">
                      {/* App Number */}
                      <td className="px-4 py-3.5 align-middle">
                        <span className="font-mono text-xs font-bold text-primary">{app.applicationNumber}</span>
                      </td>

                      {/* Applicant Name + Avatar */}
                      <td className="px-4 py-3.5 align-middle">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full overflow-hidden bg-primary-light text-primary flex items-center justify-center font-bold text-xs shrink-0 border border-primary/20">
                            {app.personal.photoUrl ? (
                              <img
                                src={app.personal.photoUrl}
                                alt={app.personal.fullName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              app.personal.fullName.charAt(0)
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-text-primary text-sm">{app.personal.fullName}</p>
                            <p className="text-[11px] text-text-muted">
                              {app.personal.gender} · {app.preferences.academicLevel}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Phone & CNIC */}
                      <td className="px-4 py-3.5 align-middle">
                        <p className="font-mono text-xs text-text-primary">{app.contact.phone}</p>
                        <p className="font-mono text-[11px] text-text-muted">{app.personal.cnicBForm}</p>
                      </td>

                      {/* Program */}
                      <td className="px-4 py-3.5 align-middle">
                        <div>
                          <p className="text-xs font-semibold text-text-primary">{app.preferences.selectedProgram}</p>
                          <p className="text-[10px] text-text-muted mt-0.5">
                            {primaryAcad?.qualification.split("(")[0]?.trim() || "Applicant"}
                          </p>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3.5 align-middle">
                        <span className="text-xs text-text-secondary whitespace-nowrap">
                          {new Date(app.createdAt).toLocaleDateString("en-PK", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </td>

                      {/* Marks */}
                      <td className="px-4 py-3.5 align-middle">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-xs font-bold ${
                              marks >= 75 ? "text-emerald-700" : marks >= 50 ? "text-amber-700" : "text-rose-600"
                            }`}
                          >
                            {marks}%
                          </span>
                          {marks < 50 && <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5 align-middle">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${statusCfg.badgeClass}`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                          {statusCfg.label}
                        </span>
                      </td>

                      {/* Actions: View opens Modal; Also provides direct detail link */}
                      <td className="px-4 py-3.5 align-middle">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedApp(app);
                              setPreviewModalOpen(true);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-primary border border-primary/30 hover:bg-primary hover:text-white rounded-lg transition-colors shadow-2xs"
                            title="Quick View Main Information"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View</span>
                          </button>

                          <Link
                            href={`/admin/applications/${app.id}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-text-secondary border border-border hover:bg-slate-100 rounded-lg transition-colors"
                            title="Open Full Detailed Application"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {sorted.length > 0 && (
          <div className="px-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={sorted.length}
              pageSize={PAGE_SIZE}
            />
          </div>
        )}
      </div>

      {/* ── APPLICATION PREVIEW MODAL ────────────────────────────────────── */}
      <ApplicationPreviewModal
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        application={selectedApp}
        onPerformAction={handlePerformAction}
      />
    </AdminLayout>
  );
}
