import * as React from "react";
import { AlertOctagon, RefreshCcw } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * ErrorState — surface for "we tried, something failed" moments.
 * Always shows a retry CTA + plain Polish message.
 */
export interface ErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: React.ReactNode;
  retryHref?: string;
  retryLabel?: string;
  onRetry?: () => void;
  errorCode?: string;
}

export function ErrorState({
  title = "Coś poszło nie tak",
  description = "Nie udało się załadować danych. Spróbuj ponownie — jeśli problem się utrzyma, skontaktuj się ze wsparciem.",
  retryHref,
  retryLabel = "Spróbuj ponownie",
  onRetry,
  errorCode,
  className,
  ...props
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-danger-200 bg-danger-50/40 p-8 text-center",
        "dark:border-danger-500/30 dark:bg-danger-500/10",
        className,
      )}
      {...props}
    >
      <div
        aria-hidden
        className="grid size-12 place-items-center rounded-xl bg-danger-100 text-danger-700 dark:bg-danger-500/20 dark:text-danger-100"
      >
        <AlertOctagon className="size-6" />
      </div>
      <div className="flex flex-col gap-1">
        <h4 className="text-fluid-lg font-semibold text-danger-900 dark:text-danger-100">
          {title}
        </h4>
        <p className="max-w-md text-fluid-sm text-iron-700 dark:text-iron-200">
          {description}
        </p>
        {errorCode ? (
          <p className="mt-1 text-fluid-xs font-mono text-iron-500">
            kod: {errorCode}
          </p>
        ) : null}
      </div>
      {retryHref ? (
        <a
          href={retryHref}
          className="inline-flex items-center gap-2 rounded-lg bg-dlugomat-700 px-5 py-2 text-fluid-sm font-semibold text-white hover:bg-dlugomat-800 focus-visible:outline-none focus-visible:shadow-shield-focus"
        >
          <RefreshCcw className="size-4" aria-hidden />
          {retryLabel}
        </a>
      ) : onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 rounded-lg bg-dlugomat-700 px-5 py-2 text-fluid-sm font-semibold text-white hover:bg-dlugomat-800 focus-visible:outline-none focus-visible:shadow-shield-focus"
        >
          <RefreshCcw className="size-4" aria-hidden />
          {retryLabel}
        </button>
      ) : null}
    </div>
  );
}
