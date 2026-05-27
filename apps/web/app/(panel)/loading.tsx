/**
 * Wave 6 / T001-012 — Panel route group loading.tsx
 * Dashboard-shaped skeleton: sidebar + topbar + content cards.
 */
export default function PanelGroupLoading() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Ładowanie panelu"
      className="min-h-screen bg-ink-50/60 dark:bg-dlugomat-950"
    >
      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6">
        {/* Sidebar skeleton */}
        <aside className="hidden w-60 shrink-0 space-y-2 md:block">
          <div className="h-8 w-32 animate-pulse rounded bg-ink-200 dark:bg-dlugomat-800" />
          <div className="mt-6 space-y-1.5">
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div
                key={i}
                className="h-9 w-full animate-pulse rounded-lg bg-ink-100 dark:bg-dlugomat-800/60"
              />
            ))}
          </div>
        </aside>

        {/* Main content skeleton */}
        <main className="min-w-0 flex-1 space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-8 w-64 animate-pulse rounded bg-ink-200 dark:bg-dlugomat-800" />
              <div className="h-4 w-48 animate-pulse rounded bg-ink-100 dark:bg-dlugomat-800/60" />
            </div>
            <div className="h-10 w-32 animate-pulse rounded-lg bg-dlugomat-200 dark:bg-dlugomat-700" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-2xl border border-ink-200 bg-white p-5 dark:border-dlugomat-800 dark:bg-dlugomat-900"
              >
                <div className="h-3 w-20 animate-pulse rounded bg-ink-100 dark:bg-dlugomat-800/60" />
                <div className="mt-3 h-7 w-24 animate-pulse rounded bg-ink-200 dark:bg-dlugomat-800" />
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-ink-200 bg-white p-6 dark:border-dlugomat-800 dark:bg-dlugomat-900">
            <div className="h-5 w-40 animate-pulse rounded bg-ink-200 dark:bg-dlugomat-800" />
            <div className="mt-4 space-y-3">
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-12 w-full animate-pulse rounded-lg bg-ink-100 dark:bg-dlugomat-800/60"
                />
              ))}
            </div>
          </div>
        </main>
      </div>
      <span className="sr-only">Wczytuję panel…</span>
    </div>
  );
}
