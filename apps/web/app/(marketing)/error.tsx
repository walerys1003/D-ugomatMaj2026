"use client";

import * as React from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { reportClientError } from "@/lib/observability/error-reporter";

/**
 * Wave 6 / T001-011 — Marketing route group error boundary.
 * Mniej formalny ton niż panel — pokazuje fallback CTA do strony głównej.
 */
export default function MarketingError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    reportClientError(error, { boundary: "marketing" });
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-2xl items-center justify-center px-4 py-16">
      <div className="w-full rounded-2xl border border-ink-200 bg-white p-8 text-center shadow-sm dark:border-dlugomat-800 dark:bg-dlugomat-900">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-warn-500/15 text-warn-600 dark:text-warn-200">
          <AlertTriangle className="h-6 w-6" aria-hidden="true" />
        </span>
        <h1 className="mt-4 font-serif text-fluid-2xl font-semibold text-ink-900 dark:text-white">
          Strona chwilowo niedostępna
        </h1>
        <p className="mt-3 text-fluid-sm text-ink-600 dark:text-ink-300">
          Coś poszło nie tak. Twoje konto i dane pozostają bezpieczne —
          spróbuj ponownie lub przejdź do strony głównej.
        </p>
        {error.digest ? (
          <p className="mt-3 text-fluid-xs text-ink-500">
            ID błędu: <code className="font-mono">{error.digest}</code>
          </p>
        ) : null}
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Button onClick={() => reset()}>Spróbuj ponownie</Button>
          <Button asChild variant="ghost">
            <Link href="/">Strona główna</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
