/**
 * Wave 6 / T001-002 — Global root loading.tsx
 *
 * Renderowany przez Next.js App Router automatycznie kiedy root layout
 * czeka na server components na góre drzewa (np. cookies/headers).
 * Zgodne z archetypem "Tarcza" — spokojny, nie panikujący.
 *
 * Server component (no `"use client"`).
 */
export default function RootLoading() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Ładowanie strony"
      className="flex min-h-screen items-center justify-center bg-ink-50/60 px-4 py-16 dark:bg-dlugomat-950"
    >
      <div className="w-full max-w-lg rounded-2xl border border-ink-200 bg-white p-8 shadow-sm dark:border-dlugomat-800 dark:bg-dlugomat-900">
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="h-10 w-10 animate-pulse rounded-full bg-dlugomat-100 dark:bg-dlugomat-800"
          />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-2/3 animate-pulse rounded bg-ink-200 dark:bg-dlugomat-800" />
            <div className="h-3 w-1/3 animate-pulse rounded bg-ink-100 dark:bg-dlugomat-800/60" />
          </div>
        </div>
        <div className="mt-6 space-y-2">
          <div className="h-3 w-full animate-pulse rounded bg-ink-100 dark:bg-dlugomat-800/60" />
          <div className="h-3 w-5/6 animate-pulse rounded bg-ink-100 dark:bg-dlugomat-800/60" />
          <div className="h-3 w-3/4 animate-pulse rounded bg-ink-100 dark:bg-dlugomat-800/60" />
        </div>
        <span className="sr-only">Wczytuję zawartość strony…</span>
      </div>
    </div>
  );
}
