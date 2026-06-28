import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * EmptyState — primitive for "no data yet" surfaces. Always pairs an
 * icon/illustration slot with a clear next action (CTA), per design
 * spec: never show a void without telling the user what to do.
 */
export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 rounded-xl",
        "border border-dashed border-ink-200 dark:border-dlugomat-800",
        "bg-ink-50/60 dark:bg-dlugomat-900/40",
        "p-8 text-center",
        className
      )}
      {...props}
    >
      {icon ? (
        <div
          aria-hidden
          className="grid size-12 place-items-center rounded-xl bg-dlugomat-100 text-dlugomat-700 dark:bg-dlugomat-850 dark:text-dlugomat-300"
        >
          {icon}
        </div>
      ) : null}
      <div className="flex flex-col gap-1">
        <h4 className="text-fluid-lg font-semibold text-dlugomat-900 dark:text-ink-50">
          {title}
        </h4>
        {description ? (
          <p className="max-w-md text-fluid-sm text-ink-600 dark:text-ink-300">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
