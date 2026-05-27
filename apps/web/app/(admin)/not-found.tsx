import type { Metadata } from "next";
import Link from "next/link";
import { ShieldX } from "lucide-react";

import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "404 · Admin",
  robots: { index: false, follow: false },
};

/**
 * W10-5 — 404 dedykowane dla segmentu (admin).
 *
 * Suchy ton, brak marketingowych zachęt — kierujemy z powrotem do dashboardu
 * lub do listy uprawnionych modułów. Brak indexu w robots (RBAC).
 */
export default function AdminNotFound() {
  return (
    <main className="flex min-h-[60vh] items-center justify-center px-4 py-16">
      <div className="mx-auto max-w-md text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-300">
          <ShieldX className="h-6 w-6" />
        </span>
        <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-ink-500">
          Admin · 404
        </p>
        <h1 className="mt-1 font-serif text-2xl font-semibold text-ink-900 dark:text-white">
          Nie znaleziono modułu admin
        </h1>
        <p className="mt-3 text-sm text-ink-600 dark:text-ink-300">
          Adres mógł zostać zmieniony, moduł został wycofany lub nie masz do
          niego uprawnień. Sprawdź listę dostępnych modułów w panelu.
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Button asChild>
            <Link href="/admin">Panel admin</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/panel">Mój panel</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
