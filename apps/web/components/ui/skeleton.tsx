import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Skeleton — calm shimmer used while data loads. Reduced-motion safe
 * (animation is disabled globally via prefers-reduced-motion in globals.css).
 */
export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="status"
      aria-label="Ładowanie"
      className={cn(
        "animate-pulse rounded-md bg-iron-200/70 dark:bg-dlugomat-850/70",
        className
      )}
      {...props}
    />
  );
}

export function Spinner({
  size = 16,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <span
      role="status"
      aria-label="Ładowanie"
      style={{ width: size, height: size }}
      className={cn(
        "inline-block animate-spin rounded-full border-2 border-current border-r-transparent",
        className
      )}
    />
  );
}
