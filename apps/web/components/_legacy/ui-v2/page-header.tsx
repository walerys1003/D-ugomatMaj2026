import * as React from "react";
import { cn } from "@/lib/utils";
import { Breadcrumbs, type BreadcrumbItem } from "./breadcrumbs";

/**
 * PageHeader — uniform page top section across panel + admin.
 * Combines breadcrumbs + eyebrow + title + lead + actions in one slot.
 */
export interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  breadcrumbs,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <header className={cn("flex flex-col gap-2", className)}>
      {breadcrumbs && breadcrumbs.length > 0 ? (
        <Breadcrumbs items={breadcrumbs} />
      ) : null}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          {eyebrow ? (
            <p className="text-fluid-sm font-semibold uppercase tracking-wider text-dlugomat-600">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="text-fluid-3xl font-bold tracking-tight text-dlugomat-900 dark:text-white">
            {title}
          </h1>
          {description ? (
            <p className="max-w-2xl text-fluid-base text-iron-600 dark:text-iron-300">
              {description}
            </p>
          ) : null}
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>
    </header>
  );
}
