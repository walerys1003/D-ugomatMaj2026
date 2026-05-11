import * as React from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Pagination — server-component-friendly pagination with sliding window.
 * Always renders first/last page, plus ±2 around current.
 */
export interface PaginationProps {
  page: number;
  totalPages: number;
  hrefFor: (page: number) => string;
  className?: string;
  itemsLabel?: string; // "spraw", "pism", ...
  totalItems?: number;
}

function buildPages(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const set = new Set<number>([1, total, current, current - 1, current + 1, 2, total - 1]);
  const arr = Array.from(set)
    .filter((n) => n >= 1 && n <= total)
    .sort((a, b) => a - b);
  const out: (number | "…")[] = [];
  for (let i = 0; i < arr.length; i++) {
    out.push(arr[i]!);
    if (i < arr.length - 1 && arr[i + 1]! - arr[i]! > 1) out.push("…");
  }
  return out;
}

export function Pagination({
  page,
  totalPages,
  hrefFor,
  className,
  itemsLabel = "wpisów",
  totalItems,
}: PaginationProps) {
  if (totalPages <= 1) return null;
  const pages = buildPages(page, totalPages);

  return (
    <nav
      aria-label="Paginacja"
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 text-fluid-sm",
        className,
      )}
    >
      <span className="text-iron-500">
        Strona{" "}
        <strong className="tabular-nums text-iron-900 dark:text-iron-50">
          {page}
        </strong>{" "}
        z{" "}
        <strong className="tabular-nums text-iron-900 dark:text-iron-50">
          {totalPages}
        </strong>
        {typeof totalItems === "number" ? (
          <>
            {" · "}
            <span className="tabular-nums">
              {totalItems.toLocaleString("pl-PL")} {itemsLabel}
            </span>
          </>
        ) : null}
      </span>
      <ul className="flex items-center gap-1">
        <li>
          <PageLink
            href={hrefFor(Math.max(1, page - 1))}
            disabled={page === 1}
            aria-label="Poprzednia strona"
          >
            <ChevronLeft className="size-4" />
          </PageLink>
        </li>
        {pages.map((p, i) =>
          p === "…" ? (
            <li key={`gap-${i}`} aria-hidden>
              <span className="grid size-9 place-items-center text-iron-400">
                <MoreHorizontal className="size-4" />
              </span>
            </li>
          ) : (
            <li key={p}>
              <PageLink
                href={hrefFor(p)}
                active={p === page}
                aria-label={`Strona ${p}`}
                aria-current={p === page ? "page" : undefined}
              >
                <span className="tabular-nums">{p}</span>
              </PageLink>
            </li>
          ),
        )}
        <li>
          <PageLink
            href={hrefFor(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            aria-label="Następna strona"
          >
            <ChevronRight className="size-4" />
          </PageLink>
        </li>
      </ul>
    </nav>
  );
}

function PageLink({
  href,
  active,
  disabled,
  children,
  ...rest
}: {
  href: string;
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
} & React.AriaAttributes) {
  const cls = cn(
    "grid size-9 place-items-center rounded-md border text-fluid-sm font-semibold transition",
    "focus-visible:outline-none focus-visible:shadow-shield-focus",
    active
      ? "border-dlugomat-700 bg-dlugomat-700 text-white"
      : disabled
        ? "pointer-events-none border-iron-200 text-iron-300 dark:border-iron-800"
        : "border-iron-200 bg-white text-iron-700 hover:border-dlugomat-400 hover:text-dlugomat-700 dark:border-iron-800 dark:bg-iron-950 dark:text-iron-200",
  );
  if (disabled) {
    return (
      <span className={cls} {...rest}>
        {children}
      </span>
    );
  }
  return (
    <Link href={href} className={cls} {...rest}>
      {children}
    </Link>
  );
}
