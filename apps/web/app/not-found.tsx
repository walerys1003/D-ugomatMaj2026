import type { Metadata } from "next";
import Link from "next/link";
import { ShieldQuestion } from "lucide-react";

import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Strona nie istnieje (404)",
  robots: { index: false, follow: false },
};

/**
 * Tier 5.5 — App Router 404 boundary.
 *
 * Spokojny ton zgodny z archetypem „Tarcza" — nie strofuje, oferuje
 * dwa pewne wyjścia (panel albo strona główna).
 */
export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-50/60 px-4 py-16 dark:bg-dlugomat-950">
      <div className="max-w-lg rounded-2xl border border-ink-200 bg-white p-8 text-center shadow-lg dark:border-dlugomat-800 dark:bg-dlugomat-900">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-dlugomat-100 text-dlugomat-700 dark:bg-dlugomat-800 dark:text-dlugomat-200">
          <ShieldQuestion className="h-6 w-6" />
        </span>
        <p className="mt-4 text-fluid-xs font-semibold uppercase tracking-wider text-ink-500">
          Błąd 404
        </p>
        <h1 className="mt-1 font-serif text-fluid-3xl font-semibold text-ink-900 dark:text-white">
          Nie znaleźliśmy tej strony
        </h1>
        <p className="mt-3 text-fluid-sm text-ink-600 dark:text-ink-300">
          Adres mógł zostać zmieniony lub link jest nieprawidłowy.
          Wszystkie Twoje sprawy są bezpieczne — wróć do panelu, aby
          kontynuować pracę.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Button asChild>
            <Link href="/panel">Mój panel</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/">Strona główna</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
