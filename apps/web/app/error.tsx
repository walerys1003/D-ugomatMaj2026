"use client";

import * as React from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { reportClientError } from "@/lib/observability/error-reporter";

/**
 * Tier 5.5 — App Router error boundary (route segment).
 *
 * Pokazuje spokojny komunikat zgodny z archetypem „Tarcza" — bez paniki,
 * bez technicznych szczegółów. Surowy stack idzie tylko do
 * reportClientError (server log / Sentry).
 */
export default function GlobalRouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    reportClientError(error, { boundary: "app-route" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-50/60 px-4 py-16 dark:bg-dlugomat-950">
      <div className="max-w-lg rounded-2xl border border-ink-200 bg-white p-8 shadow-lg dark:border-dlugomat-800 dark:bg-dlugomat-900">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-warn-500/15 text-warn-600 dark:text-warn-200">
            <AlertTriangle className="h-5 w-5" />
          </span>
          <h1 className="font-serif text-fluid-2xl font-semibold text-ink-900 dark:text-white">
            Coś poszło nie tak
          </h1>
        </div>
        <p className="mt-4 text-fluid-sm text-ink-600 dark:text-ink-300">
          Spokojnie — Twoje dane są bezpieczne. Wystąpił przejściowy problem
          podczas wczytywania tej strony. Spróbuj ponownie lub wróć do panelu.
        </p>
        {error.digest ? (
          <p className="mt-3 text-fluid-xs text-ink-500">
            Identyfikator błędu:{" "}
            <code className="font-mono">{error.digest}</code>
          </p>
        ) : null}
        <div className="mt-6 flex flex-wrap gap-2">
          <Button onClick={() => reset()}>Spróbuj ponownie</Button>
          <Button asChild variant="ghost">
            <Link href="/">Wróć na stronę główną</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
