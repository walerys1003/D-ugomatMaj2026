import * as React from "react";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Tier 29 — Page-level skeleton patterns.
 * Używane w `loading.tsx` w app-routerze.
 */

export function PageSkeletonCards({ count = 4 }: { count?: number }) {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="rounded-xl border border-ink-200 p-4 dark:border-dlugomat-700">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="mt-2 h-7 w-32" />
            <Skeleton className="mt-3 h-3 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function PageSkeletonList({ rows = 5 }: { rows?: number }) {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4">
      <Skeleton className="h-8 w-48" />
      <div className="flex flex-col gap-2">
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-lg border border-ink-200 p-3 dark:border-dlugomat-700"
          >
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-8 w-20 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function PageSkeletonForm({ fields = 4 }: { fields?: number }) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <Skeleton className="h-8 w-56" />
      <Skeleton className="h-4 w-80" />
      <div className="flex flex-col gap-4">
        {Array.from({ length: fields }).map((_, i) => (
          <div key={i} className="flex flex-col gap-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
        ))}
        <Skeleton className="h-10 w-32 rounded-md" />
      </div>
    </div>
  );
}
