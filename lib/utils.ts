import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines multiple class names with Tailwind CSS conflict resolution.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Formats a numeric value into Pakistani Rupee (PKR) currency string.
 * Example: 45000 -> "PKR 45,000"
 */
export function formatPKR(amount: number): string {
  return `PKR ${new Intl.NumberFormat("en-PK", {
    maximumFractionDigits: 0,
  }).format(amount)}`;
}

/**
 * Formats a date string or Date object into readable format.
 * Example: "2026-08-10" -> "10 Aug 2026"
 */
export function formatDate(dateInput: string | Date): string {
  if (!dateInput) return "N/A";
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return String(dateInput);

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

/**
 * Maps common status strings to appropriate Tailwind color classes for badges.
 */
export function getStatusBadgeVariant(
  status: string
): "default" | "success" | "warning" | "danger" | "info" | "secondary" {
  const normalized = status.toLowerCase();

  if (
    ["active", "paid", "approved", "confirmed", "present", "passed"].includes(
      normalized
    )
  ) {
    return "success";
  }

  if (
    [
      "pending",
      "extended",
      "concession",
      "in_review",
      "late",
      "partially_paid",
    ].includes(normalized)
  ) {
    return "warning";
  }

  if (
    ["overdue", "unpaid", "rejected", "cancelled", "absent", "failed"].includes(
      normalized
    )
  ) {
    return "danger";
  }

  if (["info", "draft", "submitted", "leave"].includes(normalized)) {
    return "info";
  }

  return "secondary";
}
