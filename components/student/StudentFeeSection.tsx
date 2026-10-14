"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  getStudentVouchers,
  FeeVoucher,
  StudentVouchersSummary,
  VoucherStatus,
  StudentAuthError,
} from "@/lib/services/student-service";
import { useAuth } from "@/lib/auth/AuthContext";
import { formatPKR, formatDate, getStatusBadgeVariant, cn } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  CreditCard,
  CheckCircle2,
  Clock,
  Calendar,
  Receipt,
  ChevronDown,
  ChevronUp,
  Printer,
  RefreshCw,
  Copy,
  Check,
  ShieldAlert,
  Tag,
  Info,
  DollarSign,
  Layers,
} from "lucide-react";

export interface StudentFeeSectionProps {
  onSummaryChange?: (summary: StudentVouchersSummary) => void;
  className?: string;
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
      // Ignore clipboard write failures in restricted browser environments
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

function formatCategory(category: string): string {
  switch (category?.toLowerCase()) {
    case "tuition":
      return "Tuition";
    case "admission":
      return "Admission";
    case "examination":
      return "Examination";
    case "transport":
      return "Transport";
    case "event":
      return "Event / Activity";
    case "lab":
      return "Computer & Science Lab";
    case "library":
      return "Library";
    default:
      return category ? category.charAt(0).toUpperCase() + category.slice(1) : "General Fee";
  }
}

function getStatusLabel(status: VoucherStatus): string {
  switch (status) {
    case "paid":
      return "Paid in Full";
    case "unpaid":
      return "Unpaid";
    case "partially_paid":
      return "Partially Paid";
    case "extended":
      return "Extended";
    case "overdue":
      return "Overdue";
    case "cancelled":
      return "Cancelled";
    default:
      return String(status).toUpperCase();
  }
}

export function StudentFeeSection({ onSummaryChange, className }: StudentFeeSectionProps) {
  const router = useRouter();
  const { logout } = useAuth();

  const [vouchers, setVouchers] = useState<FeeVoucher[] | null>(null);
  const [summary, setSummary] = useState<StudentVouchersSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<StudentAuthError | null>(null);
  const [isRateLimited, setIsRateLimited] = useState<boolean>(false);
  const [expandedVoucherIds, setExpandedVoucherIds] = useState<Set<string>>(new Set());
  const [printableVoucher, setPrintableVoucher] = useState<FeeVoucher | null>(null);

  const fetchVouchers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      setIsRateLimited(false);

      const response = await getStudentVouchers();
      setVouchers(response.vouchers);
      setSummary(response.summary);
      onSummaryChange?.(response.summary);
    } catch (err: unknown) {
      const authErr = err as StudentAuthError;
      if (
        authErr.code === "SESSION_EXPIRED" ||
        authErr.code === "UNAUTHORIZED" ||
        authErr.status === 401 ||
        authErr.status === 403
      ) {
        logout();
        router.push("/student/login");
        return;
      }

      if (authErr.code === "RATE_LIMITED" || authErr.status === 429) {
        setIsRateLimited(true);
      }

      setError(authErr);
    } finally {
      setIsLoading(false);
    }
  }, [logout, onSummaryChange, router]);

  useEffect(() => {
    let active = true;

    getStudentVouchers()
      .then((response) => {
        if (!active) return;
        setVouchers(response.vouchers);
        setSummary(response.summary);
        onSummaryChange?.(response.summary);
        setIsLoading(false);
      })
      .catch((err: unknown) => {
        if (!active) return;
        setIsLoading(false);
        const authErr = err as StudentAuthError;
        if (
          authErr.code === "SESSION_EXPIRED" ||
          authErr.code === "UNAUTHORIZED" ||
          authErr.status === 401 ||
          authErr.status === 403
        ) {
          logout();
          router.push("/student/login");
          return;
        }
        if (authErr.code === "RATE_LIMITED" || authErr.status === 429) {
          setIsRateLimited(true);
        }
        setError(authErr);
      });

    return () => {
      active = false;
    };
  }, [logout, onSummaryChange, router]);

  const toggleExpand = (id: string) => {
    setExpandedVoucherIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Next upcoming due date calculation
  const upcomingDueDateInfo = useMemo(() => {
    if (!vouchers || vouchers.length === 0) {
      return { value: "No Pending Dues", subtext: "No vouchers recorded" };
    }

    const pendingVouchers = vouchers.filter((v) => {
      const outstanding = v.outstandingAmountPKR ?? Math.max(0, v.totalAmountPKR - v.paidAmountPKR);
      return (
        ["unpaid", "partially_paid", "extended", "overdue"].includes(v.status) ||
        outstanding > 0
      );
    });

    if (pendingVouchers.length === 0) {
      return { value: "All Settled", subtext: "No pending vouchers" };
    }

    // Find the earliest due date
    const now = new Date();
    let earliestDate: Date | null = null;
    let isEarliestExtended = false;

    for (const v of pendingVouchers) {
      const targetDateStr = v.finalAllowedDate || v.originalDueDate;
      if (!targetDateStr) continue;
      const d = new Date(targetDateStr);
      if (isNaN(d.getTime())) continue;

      if (!earliestDate || d.getTime() < earliestDate.getTime()) {
        earliestDate = d;
        isEarliestExtended = Boolean(v.concession?.isGranted || (v.finalAllowedDate && v.originalDueDate && v.finalAllowedDate !== v.originalDueDate));
      }
    }

    if (!earliestDate) {
      return { value: "Pending Settlement", subtext: "Due date not specified" };
    }

    const diffDays = Math.ceil((earliestDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    let subtext = "";
    if (diffDays < 0) {
      subtext = `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) === 1 ? "" : "s"}`;
    } else if (diffDays === 0) {
      subtext = "Due today";
    } else {
      subtext = `Due in ${diffDays} day${diffDays === 1 ? "" : "s"}${isEarliestExtended ? " (Extended)" : ""}`;
    }

    return {
      value: formatDate(earliestDate),
      subtext,
    };
  }, [vouchers]);

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <section id="fees" aria-labelledby="fees-heading" className={cn("space-y-6 scroll-mt-20", className)}>
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 id="fees-heading" className="text-xl font-bold tracking-tight text-text-primary flex items-center gap-2">
            <Receipt className="w-5 h-5 text-primary shrink-0" />
            Fee Vouchers & Payment Status
          </h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Review official college fee vouchers, itemized fee breakdowns, concession dates, and verified payment records.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw className={cn("w-3.5 h-3.5", isLoading && "animate-spin")} />}
            onClick={() => fetchVouchers()}
            disabled={isLoading}
          >
            Refresh Fees
          </Button>
        </div>
      </div>

      {/* Rate Limit Warning Banner */}
      {isRateLimited && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-4 h-4 shrink-0 text-amber-600" />
            <div>
              <p className="font-semibold">Request Limit Exceeded</p>
              <p className="text-amber-800/90 mt-0.5">
                Too many voucher requests received in a short interval. Please wait a few moments before refreshing.
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            onClick={() => fetchVouchers()}
            className="text-xs bg-white shrink-0"
          >
            Retry Now
          </Button>
        </div>
      )}

      {/* Loading State */}
      {isLoading && !vouchers && (
        <div className="py-12">
          <LoadingState label="Loading authenticated fee vouchers from college server..." />
        </div>
      )}

      {/* General Error State (when vouchers not available) */}
      {!isLoading && error && !vouchers && (
        <ErrorState
          title="Unable to load fee vouchers"
          description={
            isRateLimited
              ? "Fee service is temporarily rate-limited. Please wait a few moments and try again."
              : error.message || "Could not retrieve fee records from college server. Please try again."
          }
          onRetry={fetchVouchers}
        />
      )}

      {/* Populated / Valid States */}
      {vouchers && (
        <>
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Outstanding"
              value={formatPKR(summary?.totalOutstandingPKR ?? 0)}
              icon={<CreditCard className="w-5 h-5 text-rose-600" />}
              subtext={
                (summary?.totalOutstandingPKR ?? 0) > 0
                  ? "Requires settlement"
                  : "All current fees settled"
              }
            />
            <StatCard
              title="Total Paid"
              value={formatPKR(summary?.totalPaidPKR ?? 0)}
              icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
              subtext="Verified college payments"
            />
            <StatCard
              title="Pending Vouchers"
              value={summary?.unpaidCount ?? 0}
              icon={<Clock className="w-5 h-5 text-amber-600" />}
              subtext={
                (summary?.unpaidCount ?? 0) === 1
                  ? "1 voucher active"
                  : `${summary?.unpaidCount ?? 0} vouchers active`
              }
            />
            <StatCard
              title="Upcoming Due Date"
              value={upcomingDueDateInfo.value}
              icon={<Calendar className="w-5 h-5 text-primary" />}
              subtext={upcomingDueDateInfo.subtext}
            />
          </div>

          {/* Valid Empty List State (distinguished from error) */}
          {vouchers.length === 0 ? (
            <EmptyState
              icon={<Receipt className="w-10 h-10 text-slate-400" />}
              title="No Fee Vouchers Issued"
              description="There are currently no fee vouchers issued for your enrolled student account. When new vouchers are generated by the Accounts Office, they will be displayed here."
              actionLabel="Check Again"
              onAction={fetchVouchers}
            />
          ) : (
            /* Vouchers List */
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-text-secondary px-1">
                <span>
                  Showing <strong>{vouchers.length}</strong> official voucher{vouchers.length === 1 ? "" : "s"}
                </span>
                <span>Click a voucher to expand its itemized breakdown</span>
              </div>

              {vouchers.map((voucher) => {
                const isExpanded = expandedVoucherIds.has(voucher.id);
                const outstanding =
                  voucher.outstandingAmountPKR ??
                  Math.max(0, voucher.totalAmountPKR - voucher.paidAmountPKR);
                const hasConcession = Boolean(
                  voucher.concession &&
                    (voucher.concession.isGranted ||
                      voucher.concession.discountAmountPKR ||
                      voucher.concession.newAllowedDate ||
                      voucher.concession.reason)
                );
                const hasPaymentRecords = Boolean(
                  voucher.paymentRecords && voucher.paymentRecords.length > 0
                );

                return (
                  <Card key={voucher.id} className="overflow-hidden border-border transition-all hover:border-slate-300 dark:hover:border-slate-700">
                    {/* Top Row / Card Bar */}
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => toggleExpand(voucher.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          toggleExpand(voucher.id);
                        }
                      }}
                      className="p-5 cursor-pointer bg-white dark:bg-slate-900 select-none flex flex-col md:flex-row md:items-center justify-between gap-4"
                      aria-expanded={isExpanded}
                    >
                      {/* Left Block: Number & Badges */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm sm:text-base text-text-primary tracking-tight">
                            {voucher.voucherNumber}
                          </span>
                          <CopyButton text={voucher.voucherNumber} label="Voucher Number" />
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant={getStatusBadgeVariant(voucher.status)}>
                            {getStatusLabel(voucher.status)}
                          </Badge>

                          {hasConcession && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800">
                              <Info className="w-3 h-3" /> Concession / Extension
                            </span>
                          )}

                          {voucher.academicSessionName && (
                            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                              {voucher.academicSessionName}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Middle & Right Block: Amounts, Dates, and Expansion */}
                      <div className="flex items-center justify-between md:justify-end gap-6 flex-wrap">
                        {/* Dates */}
                        <div className="text-left md:text-right text-xs">
                          <div className="text-text-secondary">
                            Issue: <span className="text-text-primary font-medium">{formatDate(voucher.issueDate)}</span>
                          </div>
                          <div className="mt-0.5">
                            {hasConcession && voucher.finalAllowedDate && voucher.originalDueDate && voucher.finalAllowedDate !== voucher.originalDueDate ? (
                              <span className="text-indigo-700 dark:text-indigo-400 font-semibold">
                                Extended Due: {formatDate(voucher.finalAllowedDate)}
                              </span>
                            ) : (
                              <span className={cn(outstanding > 0 ? "text-amber-800 dark:text-amber-400 font-medium" : "text-text-secondary")}>
                                Due: {formatDate(voucher.finalAllowedDate || voucher.originalDueDate)}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Amount Pills */}
                        <div className="text-left md:text-right">
                          <div className="text-xs text-text-secondary">Total: {formatPKR(voucher.totalAmountPKR)}</div>
                          <div className="text-sm font-bold">
                            {outstanding > 0 ? (
                              <span className="text-rose-600 dark:text-rose-400">
                                Due: {formatPKR(outstanding)}
                              </span>
                            ) : (
                              <span className="text-emerald-600 dark:text-emerald-400">
                                Paid in Full
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Expand Button / Indicator */}
                        <div className="flex items-center gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="p-1.5 h-8 w-8 text-text-secondary hover:text-text-primary shrink-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleExpand(voucher.id);
                            }}
                            aria-label={isExpanded ? "Collapse voucher details" : "Expand voucher details"}
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Expandable Breakdown Drawer */}
                    {isExpanded && (
                      <div className="border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 p-5 space-y-5 animate-in fade-in duration-200">
                        {/* Concession / Extension Detail Alert */}
                        {hasConcession && (
                          <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200/80 dark:bg-indigo-950/30 dark:border-indigo-800/60 text-xs space-y-2">
                            <div className="flex items-center justify-between font-semibold text-indigo-900 dark:text-indigo-200">
                              <span className="flex items-center gap-1.5">
                                <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                Official Extension & Concession Record
                              </span>
                              {voucher.concession?.discountAmountPKR ? (
                                <Badge variant="success" size="sm">
                                  Fee Discount: {formatPKR(voucher.concession.discountAmountPKR)}
                                </Badge>
                              ) : null}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-indigo-950 dark:text-indigo-300">
                              <div>
                                <span className="text-text-secondary">Original Due Date:</span>{" "}
                                <span className="line-through">{formatDate(voucher.concession?.originalDueDate || voucher.originalDueDate)}</span>
                              </div>
                              <div>
                                <span className="text-text-secondary">Approved Final Deadline:</span>{" "}
                                <span className="font-bold text-indigo-700 dark:text-indigo-300">
                                  {formatDate(voucher.concession?.newAllowedDate || voucher.finalAllowedDate)}
                                </span>
                              </div>
                              {voucher.concession?.grantedByAdminName && (
                                <div>
                                  <span className="text-text-secondary">Authorized By:</span>{" "}
                                  <span>{voucher.concession.grantedByAdminName}</span>
                                </div>
                              )}
                            </div>

                            {voucher.concession?.reason && (
                              <p className="text-indigo-900/90 dark:text-indigo-300/90 italic pt-1 border-t border-indigo-200/60 dark:border-indigo-800/40">
                                <strong>Reason on file:</strong> {voucher.concession.reason}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Itemized Fee Breakdown Table */}
                        <div className="space-y-2">
                          <h4 className="text-xs font-semibold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
                            <Layers className="w-3.5 h-3.5 text-primary" /> Itemized Fee Breakdown
                          </h4>

                          <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900">
                            <table className="w-full text-xs">
                              <thead>
                                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-text-secondary font-semibold">
                                  <th className="py-2.5 px-4 text-left">Fee Item</th>
                                  <th className="py-2.5 px-4 text-left">Category</th>
                                  <th className="py-2.5 px-4 text-right">Amount (PKR)</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {voucher.items.map((item, idx) => (
                                  <tr key={item.id || idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                                    <td className="py-2.5 px-4 font-medium text-text-primary">
                                      {item.title}
                                    </td>
                                    <td className="py-2.5 px-4 text-text-secondary">
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px]">
                                        <Tag className="w-3 h-3 text-slate-400" />
                                        {formatCategory(item.category)}
                                      </span>
                                    </td>
                                    <td className="py-2.5 px-4 text-right font-mono font-medium text-text-primary">
                                      {formatPKR(item.amountPKR)}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                              <tfoot className="bg-slate-50/80 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800">
                                <tr>
                                  <td colSpan={2} className="py-2 px-4 text-text-secondary text-right">
                                    Subtotal:
                                  </td>
                                  <td className="py-2 px-4 text-right font-mono font-semibold text-text-primary">
                                    {formatPKR(voucher.subtotalPKR)}
                                  </td>
                                </tr>
                                {voucher.discountPKR > 0 && (
                                  <tr>
                                    <td colSpan={2} className="py-1 px-4 text-emerald-700 dark:text-emerald-400 text-right">
                                      Concession / Discount:
                                    </td>
                                    <td className="py-1 px-4 text-right font-mono font-semibold text-emerald-700 dark:text-emerald-400">
                                      -{formatPKR(voucher.discountPKR)}
                                    </td>
                                  </tr>
                                )}
                                <tr className="border-t border-slate-200 dark:border-slate-700">
                                  <td colSpan={2} className="py-2.5 px-4 font-bold text-text-primary text-right">
                                    Total Payable:
                                  </td>
                                  <td className="py-2.5 px-4 text-right font-mono font-bold text-base text-primary">
                                    {formatPKR(voucher.totalAmountPKR)}
                                  </td>
                                </tr>
                                {voucher.paidAmountPKR > 0 && (
                                  <tr>
                                    <td colSpan={2} className="py-1 px-4 text-emerald-700 dark:text-emerald-400 text-right">
                                      Total Amount Paid:
                                    </td>
                                    <td className="py-1 px-4 text-right font-mono font-semibold text-emerald-700 dark:text-emerald-400">
                                      {formatPKR(voucher.paidAmountPKR)}
                                    </td>
                                  </tr>
                                )}
                                <tr>
                                  <td colSpan={2} className="py-2 px-4 font-bold text-right text-text-primary">
                                    Remaining Outstanding:
                                  </td>
                                  <td className="py-2 px-4 text-right font-mono font-bold text-sm">
                                    {outstanding > 0 ? (
                                      <span className="text-rose-600 dark:text-rose-400">{formatPKR(outstanding)}</span>
                                    ) : (
                                      <span className="text-emerald-600 dark:text-emerald-400">PKR 0 (Settled)</span>
                                    )}
                                  </td>
                                </tr>
                              </tfoot>
                            </table>
                          </div>
                        </div>

                        {/* Verified Payment Records */}
                        <div className="space-y-2">
                          <h4 className="text-xs font-semibold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
                            <DollarSign className="w-3.5 h-3.5 text-emerald-600" /> Payment & Settlement Records
                          </h4>

                          {hasPaymentRecords ? (
                            <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800">
                              {voucher.paymentRecords!.map((record, rIdx) => (
                                <div key={record.id || rIdx} className="p-3 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <span className="font-semibold text-text-primary">
                                        Receipt #{record.receiptNumber || "N/A"}
                                      </span>
                                      {record.receiptNumber && (
                                        <CopyButton text={record.receiptNumber} label="Receipt Number" />
                                      )}
                                      <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300">
                                        {record.paymentMethod || "Verified"}
                                      </span>
                                    </div>
                                    <div className="text-text-secondary text-[11px] flex items-center gap-3">
                                      <span>Date: {formatDate(record.paymentDate || "")}</span>
                                      {record.transactionReference && (
                                        <span>Txn Ref: {record.transactionReference}</span>
                                      )}
                                      {record.verifiedByAdminName && (
                                        <span>Verified by: {record.verifiedByAdminName}</span>
                                      )}
                                    </div>
                                  </div>

                                  <div className="text-right sm:text-right font-mono font-bold text-emerald-700 dark:text-emerald-400 text-sm">
                                    {formatPKR(record.amountPaidPKR)}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="p-3.5 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-xs text-text-secondary bg-white/60 dark:bg-slate-900/40">
                              No payment settlement transactions recorded for this voucher yet.
                            </div>
                          )}
                        </div>

                        {/* Remarks if present */}
                        {voucher.remarks && (
                          <div className="p-3 rounded-lg bg-slate-100/70 dark:bg-slate-800/50 text-xs text-text-secondary italic">
                            <strong>Note / Remarks:</strong> {voucher.remarks}
                          </div>
                        )}

                        {/* Action Toolbar */}
                        <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                          <span className="text-[11px] text-text-secondary">
                            Official voucher copy generated by College Accounts System.
                          </span>

                          <Button
                            variant="outline"
                            size="sm"
                            leftIcon={<Printer className="w-3.5 h-3.5" />}
                            onClick={() => setPrintableVoucher(voucher)}
                          >
                            Print Official Voucher
                          </Button>
                        </div>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Printable Voucher Modal */}
      {printableVoucher && (
        <Modal
          isOpen={Boolean(printableVoucher)}
          onClose={() => setPrintableVoucher(null)}
          title={`Printable Fee Voucher — ${printableVoucher.voucherNumber}`}
          description="Printable document generated for student academic and financial records."
          size="xl"
          footer={
            <div className="flex items-center justify-between w-full">
              <span className="text-xs text-text-secondary">
                Apex College Accounts Office • Financial Liability Record
              </span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setPrintableVoucher(null)}>
                  Close
                </Button>
                <Button variant="primary" size="sm" leftIcon={<Printer className="w-3.5 h-3.5" />} onClick={handlePrint}>
                  Print Voucher
                </Button>
              </div>
            </div>
          }
        >
          {/* Printable Document Container with print-specific styling */}
          <div id="printable-voucher-document" className="p-4 sm:p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-6 text-text-primary">
            {/* Institution Letterhead */}
            <div className="text-center pb-4 border-b-2 border-slate-800 dark:border-slate-200">
              <div className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100 uppercase">
                Apex College
              </div>
              <div className="text-xs font-semibold uppercase tracking-widest text-text-secondary mt-0.5">
                College Management System • Fee Collection Branch
              </div>
              <div className="mt-2 inline-block px-3 py-1 rounded bg-slate-100 dark:bg-slate-800 text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700">
                Official Student Fee Voucher (Printable Copy)
              </div>
            </div>

            {/* Voucher & Student Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
              <div>
                <span className="text-text-secondary block">Student Name:</span>
                <span className="font-bold text-sm text-text-primary">{printableVoucher.studentName}</span>
              </div>
              <div>
                <span className="text-text-secondary block">Roll Number:</span>
                <span className="font-mono font-bold text-sm text-text-primary">{printableVoucher.studentRollNumber}</span>
              </div>
              <div>
                <span className="text-text-secondary block">Voucher Number:</span>
                <span className="font-mono font-bold text-sm text-primary">{printableVoucher.voucherNumber}</span>
              </div>
              <div>
                <span className="text-text-secondary block">Academic Program:</span>
                <span className="font-medium text-text-primary">{printableVoucher.programName}</span>
              </div>
              <div>
                <span className="text-text-secondary block">Academic Session:</span>
                <span className="font-medium text-text-primary">{printableVoucher.academicSessionName || "Current Session"}</span>
              </div>
              <div>
                <span className="text-text-secondary block">Current Status:</span>
                <Badge variant={getStatusBadgeVariant(printableVoucher.status)} size="sm">
                  {getStatusLabel(printableVoucher.status)}
                </Badge>
              </div>
              <div>
                <span className="text-text-secondary block">Issue Date:</span>
                <span className="font-medium text-text-primary">{formatDate(printableVoucher.issueDate)}</span>
              </div>
              <div>
                <span className="text-text-secondary block">Original Due Date:</span>
                <span className="font-medium text-text-primary">{formatDate(printableVoucher.originalDueDate)}</span>
              </div>
              <div>
                <span className="text-text-secondary block">Final Allowed Date:</span>
                <span className="font-bold text-text-primary">{formatDate(printableVoucher.finalAllowedDate)}</span>
              </div>
            </div>

            {/* Extension/Concession Details if Present */}
            {printableVoucher.concession && (
              <div className="p-3 rounded-lg bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 text-xs">
                <span className="font-bold text-indigo-900 dark:text-indigo-200 block">
                  Concession / Extension Documentation:
                </span>
                <div className="mt-1 flex flex-wrap items-center gap-4 text-indigo-950 dark:text-indigo-300 text-[11px]">
                  <span>New Allowed Date: <strong>{formatDate(printableVoucher.concession.newAllowedDate || printableVoucher.finalAllowedDate)}</strong></span>
                  {printableVoucher.concession.discountAmountPKR ? (
                    <span>Discount Granted: <strong>{formatPKR(printableVoucher.concession.discountAmountPKR)}</strong></span>
                  ) : null}
                  {printableVoucher.concession.reason && (
                    <span>Reason: <em>{printableVoucher.concession.reason}</em></span>
                  )}
                  {printableVoucher.concession.grantedByAdminName && (
                    <span>Authorized by: <strong>{printableVoucher.concession.grantedByAdminName}</strong></span>
                  )}
                </div>
              </div>
            )}

            {/* Itemized Table */}
            <div>
              <table className="w-full text-xs border border-slate-300 dark:border-slate-700">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800 border-b border-slate-300 dark:border-slate-700 font-bold text-text-primary">
                    <th className="py-2 px-3 text-left w-12">#</th>
                    <th className="py-2 px-3 text-left">Description</th>
                    <th className="py-2 px-3 text-left">Fee Category</th>
                    <th className="py-2 px-3 text-right">Amount (PKR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {printableVoucher.items.map((item, idx) => (
                    <tr key={item.id || idx}>
                      <td className="py-2 px-3 text-text-secondary font-mono">{idx + 1}</td>
                      <td className="py-2 px-3 font-medium text-text-primary">{item.title}</td>
                      <td className="py-2 px-3 text-text-secondary">{formatCategory(item.category)}</td>
                      <td className="py-2 px-3 text-right font-mono font-medium">{formatPKR(item.amountPKR)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="border-t-2 border-slate-400 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/80 text-xs font-semibold">
                  <tr>
                    <td colSpan={3} className="py-1.5 px-3 text-right text-text-secondary">Subtotal:</td>
                    <td className="py-1.5 px-3 text-right font-mono">{formatPKR(printableVoucher.subtotalPKR)}</td>
                  </tr>
                  {printableVoucher.discountPKR > 0 && (
                    <tr>
                      <td colSpan={3} className="py-1.5 px-3 text-right text-emerald-700 dark:text-emerald-400">
                        Discount / Concession:
                      </td>
                      <td className="py-1.5 px-3 text-right font-mono text-emerald-700 dark:text-emerald-400">
                        -{formatPKR(printableVoucher.discountPKR)}
                      </td>
                    </tr>
                  )}
                  <tr className="border-t border-slate-300 dark:border-slate-700 font-bold text-sm">
                    <td colSpan={3} className="py-2 px-3 text-right text-text-primary">Total Amount Payable:</td>
                    <td className="py-2 px-3 text-right font-mono text-primary font-bold">{formatPKR(printableVoucher.totalAmountPKR)}</td>
                  </tr>
                  {printableVoucher.paidAmountPKR > 0 && (
                    <tr>
                      <td colSpan={3} className="py-1.5 px-3 text-right text-emerald-700 dark:text-emerald-400">
                        Amount Paid to Date:
                      </td>
                      <td className="py-1.5 px-3 text-right font-mono text-emerald-700 dark:text-emerald-400">
                        {formatPKR(printableVoucher.paidAmountPKR)}
                      </td>
                    </tr>
                  )}
                  <tr className="border-t border-slate-300 dark:border-slate-700 font-bold text-sm">
                    <td colSpan={3} className="py-2 px-3 text-right text-text-primary">Net Outstanding Balance:</td>
                    <td className="py-2 px-3 text-right font-mono">
                      {printableVoucher.outstandingAmountPKR ?? Math.max(0, printableVoucher.totalAmountPKR - printableVoucher.paidAmountPKR) > 0 ? (
                        <span className="text-rose-600 dark:text-rose-400">
                          {formatPKR(printableVoucher.outstandingAmountPKR ?? Math.max(0, printableVoucher.totalAmountPKR - printableVoucher.paidAmountPKR))}
                        </span>
                      ) : (
                        <span className="text-emerald-600 dark:text-emerald-400">PKR 0 (Settled)</span>
                      )}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Verified Payments on Document */}
            {printableVoucher.paymentRecords && printableVoucher.paymentRecords.length > 0 && (
              <div className="text-xs space-y-1">
                <span className="font-bold text-text-primary block">Recorded Payments:</span>
                <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 divide-y divide-slate-100 dark:divide-slate-800">
                  {printableVoucher.paymentRecords.map((r, i) => (
                    <div key={r.id || i} className="py-1 flex items-center justify-between text-[11px]">
                      <span>Receipt: <strong>{r.receiptNumber}</strong> • Method: {r.paymentMethod} • Date: {formatDate(r.paymentDate || "")}</span>
                      <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">{formatPKR(r.amountPaidPKR)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Institutional Compliance Notice */}
            <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[11px] text-text-secondary space-y-1">
              <p className="font-semibold text-text-primary">Instructions & Notice for Students:</p>
              <p>1. Present this printable voucher at the College Accounts Office or authorized fee counters for fee processing.</p>
              <p>2. Retain verified payment receipts and stamped counterfoils as official proof of fee settlement.</p>
              <p>3. Payments made after the final allowed date are subject to late fee surcharges as per college policy.</p>
              <p>4. For queries regarding fee installments or concession requests, contact the Accounts & Finance Department.</p>
            </div>

            {/* Signatures Area */}
            <div className="pt-8 flex items-center justify-between text-xs text-text-secondary border-t border-dashed border-slate-300 dark:border-slate-700">
              <div className="text-center">
                <div className="w-36 border-b border-slate-400 dark:border-slate-600 mb-1" />
                <span>Student / Depositor Signature</span>
              </div>
              <div className="text-center">
                <div className="w-36 border-b border-slate-400 dark:border-slate-600 mb-1" />
                <span>Accounts Officer Stamp & Signature</span>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </section>
  );
}
