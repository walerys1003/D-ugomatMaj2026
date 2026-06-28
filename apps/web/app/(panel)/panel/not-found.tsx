import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

/**
 * Tier 61 - 404 page dla segmentu (panel)
 * Spokojny ton, dwa wyjscia: dashboard albo wsparcie.
 */
export default function PanelNotFound() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center px-6 py-16">
      <Card elevation="pop" className="w-full max-w-xl p-10 text-center">
        <p className="font-mono text-xs uppercase tracking-wider text-dlugomat-500">404 - panel</p>
        <h1 className="mt-4 font-display text-3xl text-dlugomat-900">Nie znalezlismy tej strony</h1>
        <p className="mt-3 text-sm text-dlugomat-600">
          Zasob nie istnieje lub zostal przeniesiony. Sprawdz adres, wroc do panelu glownego
          albo skorzystaj z wyszukiwarki globalnej.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button variant="primary" size="md" asChild>
            <Link href="/panel">Powrot do panelu</Link>
          </Button>
          <Button variant="secondary" size="md" asChild>
            <Link href="/szukaj">Wyszukiwarka globalna</Link>
          </Button>
          <Button variant="ghost" size="md" asChild>
            <Link href="/panel/wsparcie">Zglos problem</Link>
          </Button>
        </div>
      </Card>
    </main>
  );
}
