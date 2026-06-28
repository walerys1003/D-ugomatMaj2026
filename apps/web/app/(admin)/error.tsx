"use client";

import * as React from "react";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { reportClientError } from "@/lib/observability/error-reporter";

/**
 * Wave 6 / T001-015 — Admin route group error boundary.
 * Bardziej techniczny ton — admini chcą widzieć digest i mogą go zgłosić.
 */
export default function AdminGroupError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    reportClientError(error, { boundary: "admin", extra: { severity: "high" } });
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-2xl items-center justify-center px-4 py-16">
      <div className="w-full rounded-2xl border border-err-200 bg-white p-8 shadow-sm dark:border-err-700/50 dark:bg-dlugomat-900">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-err-500/15 text-err-600 dark:text-err-300">
            <ShieldAlert className="h-5 w-5" aria-hidden="true" />
          </span>
          <h1 className="font-serif text-fluid-2xl font-semibold text-ink-900 dark:text-white">
            Błąd w panelu administracyjnym
          </h1>
        </div>
        <p className="mt-4 text-fluid-sm text-ink-600 dark:text-ink-300">
          Wystąpił błąd podczas wczytywania sekcji administracyjnej.
          Zdarzenie zostało automatycznie zgłoszone do Sentry.
        </p>
        {error.digest ? (
          <p className="mt-3 text-fluid-xs text-ink-500">
            <strong>Digest:</strong>{" "}
            <code className="font-mono">{error.digest}</code>
          </p>
        ) : null}
        <details className="mt-3 text-fluid-xs text-ink-500">
          <summary className="cursor-pointer select-none">
            Szczegóły techniczne
          </summary>
          <pre className="mt-2 max-h-32 overflow-auto rounded bg-ink-50 p-2 font-mono text-fluid-xs dark:bg-dlugomat-950">
            {error.message}
          </pre>
        </details>
        <div className="mt-6 flex flex-wrap gap-2">
          <Button onClick={() => reset()}>Spróbuj ponownie</Button>
          <Button asChild variant="ghost">
            <Link href="/admin/dashboard">Dashboard admin</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/admin/errors">Lista błędów</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
