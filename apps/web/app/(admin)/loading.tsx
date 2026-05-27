/**
 * Wave 6 / T001-014 — Admin route group loading.tsx
 * Admin-shaped skeleton: dense table + filters + KPIs.
 */
export default function AdminGroupLoading() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Ładowanie panelu administracyjnego"
      className="min-h-screen bg-ink-50/60 dark:bg-dlugomat-950"
    >
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-3 w-20 animate-pulse rounded bg-ink-100 dark:bg-dlugomat-800/60" />
            <div className="h-7 w-72 animate-pulse rounded bg-ink-200 dark:bg-dlugomat-800" />
          </div>
          <div className="flex gap-2">
            <div className="h-9 w-32 animate-pulse rounded-lg bg-ink-200 dark:bg-dlugomat-800" />
            <div className="h-9 w-24 animate-pulse rounded-lg bg-dlugomat-200 dark:bg-dlugomat-700" />
          </div>
        </div>

        {/* KPI row */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="rounded-xl border border-ink-200 bg-white p-4 dark:border-dlugomat-800 dark:bg-dlugomat-900"
            >
              <div className="h-3 w-16 animate-pulse rounded bg-ink-100 dark:bg-dlugomat-800/60" />
              <div className="mt-2 h-6 w-20 animate-pulse rounded bg-ink-200 dark:bg-dlugomat-800" />
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-8 w-24 animate-pulse rounded-full bg-ink-100 dark:bg-dlugomat-800/60"
            />
          ))}
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-2xl border border-ink-200 bg-white dark:border-dlugomat-800 dark:bg-dlugomat-900">
          <div className="flex items-center gap-4 border-b border-ink-200 px-4 py-3 dark:border-dlugomat-800">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-3 w-20 animate-pulse rounded bg-ink-100 dark:bg-dlugomat-800/60"
              />
            ))}
          </div>
          {[0, 1, 2, 3, 4, 5, 6, 7].map((row) => (
            <div
              key={row}
              className="flex items-center gap-4 border-b border-ink-100 px-4 py-3 last:border-0 dark:border-dlugomat-800/60"
            >
              {[0, 1, 2, 3, 4].map((c) => (
                <div
                  key={c}
                  className="h-4 w-20 animate-pulse rounded bg-ink-100 dark:bg-dlugomat-800/60"
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      <span className="sr-only">Wczytuję panel administracyjny…</span>
    </div>
  );
}
