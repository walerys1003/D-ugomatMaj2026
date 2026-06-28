import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind class names with proper precedence.
 * The single canonical class-name helper across the app.
 *
 * @example
 *   cn("p-2", condition && "p-4", "text-red-500")
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Format a PLN amount: 1234.5 -> "1 234,50 zł".
 * Used everywhere money is shown (cases, invoices, calculators).
 */
export function formatPLN(amount: number, opts?: { withCurrency?: boolean }): string {
  const withCurrency = opts?.withCurrency ?? true;
  const formatter = new Intl.NumberFormat("pl-PL", {
    style: withCurrency ? "currency" : "decimal",
    currency: "PLN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return formatter.format(amount);
}

/**
 * Polish-locale date formatting helpers.
 */
export function formatDatePL(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}

export function formatDateTimePL(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

/**
 * Days remaining until a deadline (positive = future, negative = overdue).
 * Used by the deadline-countdown widget and the urgency colour rules.
 */
export function daysUntil(target: Date | string, now: Date = new Date()): number {
  const t = typeof target === "string" ? new Date(target) : target;
  const ms = t.getTime() - now.getTime();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

/**
 * Map "days remaining" to a status token used by the design system.
 * Brand spec §3.2.3: amber 3–7 d, red <3 d / overdue, neutral otherwise.
 */
export type UrgencyStatus = "overdue" | "critical" | "warning" | "normal";

export function urgencyFromDays(daysLeft: number): UrgencyStatus {
  if (daysLeft < 0) return "overdue";
  if (daysLeft < 3) return "critical";
  if (daysLeft <= 7) return "warning";
  return "normal";
}
