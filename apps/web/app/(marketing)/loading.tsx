/**
 * Wave 6 / T001-010 — Marketing route group loading.tsx
 * Renderowane gdy server components w (marketing)/* czekają na dane.
 */
export default function MarketingLoading() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Ładowanie strony marketingowej"
      className="mx-auto max-w-6xl px-4 py-16 sm:py-24"
    >
      <div className="space-y-6">
        {/* Hero skeleton */}
        <div className="h-6 w-32 animate-pulse rounded-full bg-ink-200 dark:bg-dlugomat-800" />
        <div className="h-12 w-3/4 animate-pulse rounded-xl bg-ink-200 dark:bg-dlugomat-800" />
        <div className="h-12 w-1/2 animate-pulse rounded-xl bg-ink-200 dark:bg-dlugomat-800" />
        <div className="h-4 w-2/3 animate-pulse rounded bg-ink-100 dark:bg-dlugomat-800/60" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-ink-100 dark:bg-dlugomat-800/60" />
        <div className="mt-8 flex gap-3">
          <div className="h-11 w-32 animate-pulse rounded-lg bg-dlugomat-200 dark:bg-dlugomat-700" />
          <div className="h-11 w-32 animate-pulse rounded-lg bg-ink-200 dark:bg-dlugomat-800" />
        </div>
      </div>
      {/* Cards skeleton */}
      <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-ink-200 bg-white p-6 dark:border-dlugomat-800 dark:bg-dlugomat-900"
          >
            <div className="h-10 w-10 animate-pulse rounded-lg bg-ink-200 dark:bg-dlugomat-800" />
            <div className="mt-4 h-5 w-2/3 animate-pulse rounded bg-ink-200 dark:bg-dlugomat-800" />
            <div className="mt-3 space-y-2">
              <div className="h-3 w-full animate-pulse rounded bg-ink-100 dark:bg-dlugomat-800/60" />
              <div className="h-3 w-5/6 animate-pulse rounded bg-ink-100 dark:bg-dlugomat-800/60" />
            </div>
          </div>
        ))}
      </div>
      <span className="sr-only">Wczytuję stronę marketingową…</span>
    </div>
  );
}
