import * as React from "react";
import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * InlineBanner — non-modal alert ribbon used inside page content (above tables,
 * below page header). Carries semantic tone + optional dismiss.
 */
export type BannerTone = "info" | "success" | "warning" | "danger";

export interface InlineBannerProps
  extends React.HTMLAttributes<HTMLDivElement> {
  tone?: BannerTone;
  title: string;
  description?: React.ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
  action?: React.ReactNode;
}

const STYLES: Record<
  BannerTone,
  { wrap: string; icon: React.ReactNode; ring: string }
> = {
  info: {
    wrap: "border-dlugomat-200 bg-dlugomat-50/60 dark:border-dlugomat-700 dark:bg-dlugomat-900/40",
    ring: "bg-dlugomat-100 text-dlugomat-700 dark:bg-dlugomat-850 dark:text-dlugomat-300",
    icon: <Info className="size-5" aria-hidden />,
  },
  success: {
    wrap: "border-accent-200 bg-accent-50/40 dark:border-accent-600/40 dark:bg-accent-700/10",
    ring: "bg-accent-100 text-accent-700 dark:bg-accent-700/20 dark:text-accent-300",
    icon: <CheckCircle2 className="size-5" aria-hidden />,
  },
  warning: {
    wrap: "border-warn-300 bg-warn-100/60 dark:border-warn-500/40 dark:bg-warn-500/10",
    ring: "bg-warn-100 text-warn-600 dark:bg-warn-500/20",
    icon: <AlertTriangle className="size-5" aria-hidden />,
  },
  danger: {
    wrap: "border-danger-200 bg-danger-50/60 dark:border-danger-500/40 dark:bg-danger-500/10",
    ring: "bg-danger-100 text-danger-700 dark:bg-danger-500/20 dark:text-danger-100",
    icon: <AlertTriangle className="size-5" aria-hidden />,
  },
};

export function InlineBanner({
  tone = "info",
  title,
  description,
  dismissible,
  onDismiss,
  action,
  className,
  ...props
}: InlineBannerProps) {
  const s = STYLES[tone];
  return (
    <div
      role={tone === "danger" || tone === "warning" ? "alert" : "status"}
      className={cn(
        "flex items-start gap-3 rounded-xl border p-4",
        s.wrap,
        className,
      )}
      {...props}
    >
      <span
        aria-hidden
        className={cn("grid size-9 shrink-0 place-items-center rounded-lg", s.ring)}
      >
        {s.icon}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="text-fluid-sm font-semibold text-iron-900 dark:text-iron-50">
          {title}
        </span>
        {description ? (
          <p className="text-fluid-sm text-iron-700 dark:text-iron-200">
            {description}
          </p>
        ) : null}
        {action ? <div className="mt-1">{action}</div> : null}
      </div>
      {dismissible ? (
        <button
          type="button"
          aria-label="Zamknij komunikat"
          onClick={onDismiss}
          className="shrink-0 rounded p-1 text-iron-500 hover:bg-iron-100 focus-visible:outline-none focus-visible:shadow-shield-focus dark:hover:bg-dlugomat-900"
        >
          <X className="size-4" />
        </button>
      ) : null}
    </div>
  );
}
