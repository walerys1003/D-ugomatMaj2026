import * as React from "react";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Breadcrumbs — wayfinding component. Always pairs with proper aria-label
 * and uses <nav> landmark. Last item is rendered as <span aria-current="page">.
 */
export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbsProps extends React.HTMLAttributes<HTMLElement> {
  items: BreadcrumbItem[];
  showHome?: boolean;
}

export function Breadcrumbs({
  items,
  showHome = true,
  className,
  ...props
}: BreadcrumbsProps) {
  const all: BreadcrumbItem[] = showHome
    ? [{ label: "Pulpit", href: "/panel" }, ...items]
    : items;

  return (
    <nav
      aria-label="Ścieżka nawigacji"
      className={cn("flex items-center gap-1 text-fluid-sm", className)}
      {...props}
    >
      <ol className="flex flex-wrap items-center gap-1">
        {all.map((it, i) => {
          const isLast = i === all.length - 1;
          return (
            <li key={`${it.label}-${i}`} className="flex items-center gap-1">
              {i === 0 && showHome ? (
                <Home aria-hidden className="size-3.5 text-iron-500" />
              ) : null}
              {isLast || !it.href ? (
                <span
                  aria-current={isLast ? "page" : undefined}
                  className={cn(
                    isLast
                      ? "font-semibold text-iron-900 dark:text-iron-50"
                      : "text-iron-500",
                  )}
                >
                  {it.label}
                </span>
              ) : (
                <Link
                  href={it.href}
                  className="text-iron-500 hover:text-dlugomat-700 hover:underline dark:hover:text-dlugomat-300"
                >
                  {it.label}
                </Link>
              )}
              {!isLast ? (
                <ChevronRight aria-hidden className="size-3.5 text-iron-400" />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
