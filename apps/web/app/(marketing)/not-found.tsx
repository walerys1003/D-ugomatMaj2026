import type { Metadata } from "next";
import Link from "next/link";
import { Search, Home, BookOpen, Calculator } from "lucide-react";

import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Strona nie istnieje (404) | Długomat",
  description:
    "Strona, której szukasz, nie istnieje. Sprawdź bazę wiedzy lub wróć na stronę główną.",
  robots: { index: false, follow: false },
};

/**
 * W10-5 — 404 dedykowane dla segmentu (marketing).
 *
 * Pełniejsza nawigacja niż globalne not-found.tsx — zachęcamy do eksploracji
 * baza wiedzy + kalkulatory + cennik, bo to są nasze high-value entry points
 * z organicznego SEO.
 */
export default function MarketingNotFound() {
  return (
    <main className="flex min-h-[60vh] items-center justify-center bg-ink-50/40 px-4 py-20 dark:bg-dlugomat-950">
      <div className="mx-auto max-w-2xl text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-dlugomat-100 text-dlugomat-700 dark:bg-dlugomat-800 dark:text-dlugomat-200">
          <Search className="h-7 w-7" />
        </span>
        <p className="mt-4 text-fluid-xs font-semibold uppercase tracking-wider text-ink-500">
          Błąd 404
        </p>
        <h1 className="mt-1 font-serif text-fluid-4xl font-semibold text-ink-900 dark:text-white">
          Nie znaleźliśmy tej strony
        </h1>
        <p className="mt-3 text-fluid-base text-ink-600 dark:text-ink-300">
          Adres mógł zostać zmieniony lub link jest nieprawidłowy. Spróbuj
          poniższych ścieżek — w bazie wiedzy mamy ponad 25 artykułów o długach,
          komorniku i sprzeciwie EPU.
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <Link
            href="/baza-wiedzy"
            className="group rounded-xl border border-ink-200 bg-white p-4 text-left transition hover:border-dlugomat-300 hover:bg-dlugomat-50 dark:border-dlugomat-800 dark:bg-dlugomat-900 dark:hover:border-dlugomat-700"
          >
            <BookOpen className="h-5 w-5 text-dlugomat-600 group-hover:text-dlugomat-700" />
            <div className="mt-2 font-semibold text-ink-900 dark:text-white">
              Baza wiedzy
            </div>
            <div className="mt-1 text-fluid-xs text-ink-600 dark:text-ink-400">
              25+ artykułów prawnych
            </div>
          </Link>

          <Link
            href="/kalkulatory"
            className="group rounded-xl border border-ink-200 bg-white p-4 text-left transition hover:border-dlugomat-300 hover:bg-dlugomat-50 dark:border-dlugomat-800 dark:bg-dlugomat-900 dark:hover:border-dlugomat-700"
          >
            <Calculator className="h-5 w-5 text-dlugomat-600 group-hover:text-dlugomat-700" />
            <div className="mt-2 font-semibold text-ink-900 dark:text-white">
              Kalkulatory
            </div>
            <div className="mt-1 text-fluid-xs text-ink-600 dark:text-ink-400">
              Odsetki, kwota wolna, ROI
            </div>
          </Link>

          <Link
            href="/cennik"
            className="group rounded-xl border border-ink-200 bg-white p-4 text-left transition hover:border-dlugomat-300 hover:bg-dlugomat-50 dark:border-dlugomat-800 dark:bg-dlugomat-900 dark:hover:border-dlugomat-700"
          >
            <Home className="h-5 w-5 text-dlugomat-600 group-hover:text-dlugomat-700" />
            <div className="mt-2 font-semibold text-ink-900 dark:text-white">
              Cennik
            </div>
            <div className="mt-1 text-fluid-xs text-ink-600 dark:text-ink-400">
              Plany od 0 zł / miesiąc
            </div>
          </Link>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-2">
          <Button asChild>
            <Link href="/">Strona główna</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/kontakt">Kontakt</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
