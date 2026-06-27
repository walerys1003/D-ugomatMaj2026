import type { Metadata } from "next";
import Link from "next/link";
import { KeyRound } from "lucide-react";

import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "404 · Logowanie",
  robots: { index: false, follow: false },
};

/**
 * Audyt #18 — 404 dedykowane dla segmentu (auth).
 *
 * Kierujemy użytkownika z powrotem do logowania lub na stronę główną.
 * Brak indexu w robots (strony auth nie powinny trafiać do wyników).
 */
export default function AuthNotFound() {
  return (
    <main className="flex min-h-[60vh] items-center justify-center px-4 py-16">
      <div className="mx-auto max-w-md text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-300">
          <KeyRound className="h-6 w-6" />
        </span>
        <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-ink-500">
          Auth · 404
        </p>
        <h1 className="mt-1 font-serif text-2xl font-semibold text-ink-900 dark:text-white">
          Nie znaleziono strony
        </h1>
        <p className="mt-3 text-sm text-ink-600 dark:text-ink-300">
          Ten adres logowania nie istnieje lub wygasł. Wróć do ekranu logowania,
          aby kontynuować.
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Button asChild>
            <Link href="/sign-in">Zaloguj się</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/">Strona główna</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
