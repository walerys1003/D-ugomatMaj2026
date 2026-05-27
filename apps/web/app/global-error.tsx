"use client";

import * as React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

/**
 * Tier 30 — Global error fallback (Next.js App Router).
 * Renderowany gdy błąd przejdzie przez wszystkie error boundaries.
 * UWAGA: musi zawierać <html> i <body>.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    try {
      const Sentry = (globalThis as any).Sentry;
      if (Sentry?.captureException) {
        Sentry.captureException(error);
      }
    } catch {
      /* tolerable */
    }
  }, [error]);

  return (
    <html lang="pl">
      <body className="bg-ink-50 antialiased">
        <main className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center gap-4 px-6 text-center">
          <div className="rounded-full bg-rose-100 p-4 text-rose-600">
            <AlertTriangle className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold text-ink-900">Wystąpił krytyczny błąd</h1>
          <p className="text-ink-600">
            Strona spotkała się z nieoczekiwanym problemem. Nasi inżynierowie zostali automatycznie powiadomieni.
          </p>
          {error.digest && (
            <code className="rounded bg-ink-100 px-2 py-1 font-mono text-xs text-ink-700">
              Digest: {error.digest}
            </code>
          )}
          <div className="flex gap-2">
            <button
              onClick={reset}
              className="inline-flex items-center gap-2 rounded-md bg-dlugomat-600 px-4 py-2 text-sm font-medium text-white hover:bg-dlugomat-700"
            >
              <RefreshCw className="h-4 w-4" />
              Spróbuj ponownie
            </button>
            <a
              href="/"
              className="inline-flex items-center gap-2 rounded-md border border-ink-300 px-4 py-2 text-sm font-medium text-ink-700 hover:bg-ink-100"
            >
              Strona główna
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
