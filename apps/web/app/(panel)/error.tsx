"use client";

import * as React from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { reportClientError } from "@/lib/observability/error-reporter";

/**
 * Wave 6 / T001-013 — Panel route group error boundary.
 * Mocniejszy ton niż marketing — użytkownik panelu spodziewa się
 * konkretnej akcji recovery (reset, link do dashboardu, link do wsparcia).
 */
export default function PanelGroupError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    reportClientError(error, { boundary: "panel" });
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-2xl items-center justify-center px-4 py-16">
      <div className="w-full rounded-2xl border border-ink-200 bg-white p-8 shadow-sm dark:border-dlugomat-800 dark:bg-dlugomat-900">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-warn-500/15 text-warn-600 dark:text-warn-200">
            <AlertTriangle className="h-5 w-5" aria-hidden="true" />
          </span>
          <h1 className="font-serif text-fluid-2xl font-semibold text-ink-900 dark:text-white">
            Coś poszło nie tak
          </h1>
        </div>
        <p className="mt-4 text-fluid-sm text-ink-600 dark:text-ink-300">
          Spokojnie — Twoje dane są bezpieczne. Wystąpił przejściowy problem.
          Spróbuj ponownie lub przejdź do dashboardu.
        </p>
        {error.digest ? (
          <p className="mt-3 text-fluid-xs text-ink-500">
            Identyfikator: <code className="font-mono">{error.digest}</code>
          </p>
        ) : null}
        <div className="mt-6 flex flex-wrap gap-2">
          <Button onClick={() => reset()}>Spróbuj ponownie</Button>
          <Button asChild variant="ghost">
            <Link href="/panel">Panel</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/panel/wsparcie/zglos">Zgłoś problem</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
