import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * LoadingState — generic "fetching" surface with optional message.
 * Use over EmptyState/ErrorState fallback during initial loads.
 */
export function LoadingState({
  message = "Wczytywanie…",
  className,
}: {
  message?: string;
  className?: string;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-iron-200 bg-iron-50/60 p-8 text-center",
        "dark:border-dlugomat-800 dark:bg-dlugomat-900/40",
        className,
      )}
    >
      <Loader2
        aria-hidden
        className="size-7 animate-spin text-dlugomat-600 dark:text-dlugomat-300"
      />
      <span className="text-fluid-sm text-iron-600 dark:text-iron-300">
        {message}
      </span>
    </div>
  );
}

/**
 * SkeletonRow — pre-formatted skeleton for table rows.
 */
export function SkeletonRow({ cols = 4 }: { cols?: number }) {
  return (
    <tr aria-hidden>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-5 py-3">
          <span className="block h-3 w-full max-w-[12rem] animate-pulse rounded bg-iron-200 dark:bg-dlugomat-800" />
        </td>
      ))}
    </tr>
  );
}

/**
 * SkeletonCard — block placeholder for card-based grids.
 */
export function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <div
      aria-hidden
      className="flex flex-col gap-3 rounded-xl border border-iron-200 bg-white p-5 shadow-card dark:border-iron-800 dark:bg-iron-950"
    >
      <span className="h-4 w-2/3 animate-pulse rounded bg-iron-200 dark:bg-dlugomat-800" />
      {Array.from({ length: lines }).map((_, i) => (
        <span
          key={i}
          className="h-3 w-full animate-pulse rounded bg-iron-100 dark:bg-dlugomat-900"
          style={{ width: `${100 - i * 12}%` }}
        />
      ))}
    </div>
  );
}
