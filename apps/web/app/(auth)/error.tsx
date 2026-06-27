"use client";

import * as React from "react";
import Link from "next/link";
import { LockKeyhole } from "lucide-react";

import { Button } from "@/components/ui/button";
import { reportClientError } from "@/lib/observability/error-reporter";

/**
 * Audyt #18 — Auth route group error boundary.
 *
 * Grupa (auth) (logowanie / rejestracja / reset hasła) nie miała własnego
 * error boundary, więc każdy błąd wpadał do globalnego. Tutaj ton jest
 * uspokajający, bez ujawniania szczegółów technicznych użytkownikowi
 * niezalogowanemu — digest pokazujemy tylko w details do zgłoszenia.
 */
export default function AuthGroupError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    reportClientError(error, { boundary: "auth", extra: { severity: "medium" } });
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md items-center justify-center px-4 py-16">
      <div className="w-full rounded-2xl border border-err-200 bg-white p-8 shadow-sm dark:border-err-700/50 dark:bg-dlugomat-900">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-err-500/15 text-err-600 dark:text-err-300">
            <LockKeyhole className="h-5 w-5" aria-hidden="true" />
          </span>
          <h1 className="font-serif text-fluid-xl font-semibold text-ink-900 dark:text-white">
            Coś poszło nie tak
          </h1>
        </div>
        <p className="mt-4 text-fluid-sm text-ink-600 dark:text-ink-300">
          Nie udało się dokończyć operacji logowania. Spróbuj ponownie za chwilę —
          jeśli problem się powtarza, skontaktuj się z pomocą.
        </p>
        {error.digest ? (
          <p className="mt-3 text-fluid-xs text-ink-500">
            <strong>Kod zgłoszenia:</strong>{" "}
            <code className="font-mono">{error.digest}</code>
          </p>
        ) : null}
        <div className="mt-6 flex flex-wrap gap-2">
          <Button onClick={() => reset()}>Spróbuj ponownie</Button>
          <Button asChild variant="ghost">
            <Link href="/">Strona główna</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
