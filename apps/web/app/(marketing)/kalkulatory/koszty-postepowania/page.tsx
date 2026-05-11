import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KosztyPostepowaniaCalculator } from "./calculator-client";

export const metadata: Metadata = {
  title: "Kalkulator kosztów postępowania sądowego | Długomat",
  description:
    "Oblicz opłatę sądową od pozwu, koszty komornicze i całkowity szacunek kosztów postępowania cywilnego zgodnie z UKSC.",
};

export default function KosztyPostepowaniaPage() {
  return (
    <main className="bg-iron-50 dark:bg-iron-950 pb-24">
      <section className="border-b border-iron-200 dark:border-iron-800 bg-white dark:bg-iron-900">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <p className="text-xs uppercase tracking-wider text-iron-500 mb-3">
            Kalkulatory prawne · 3 z 5
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-semibold text-iron-900 dark:text-iron-50 mb-4">
            Kalkulator kosztów postępowania
          </h1>
          <p className="text-lg text-iron-700 dark:text-iron-300 max-w-2xl">
            Oszacuj, ile zapłacisz za pozew, apelację i komornika. Wszystkie stawki
            zgodnie z aktualną ustawą o kosztach sądowych w sprawach cywilnych.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-10 max-w-4xl">
        <KosztyPostepowaniaCalculator />
      </section>

      <section className="container mx-auto px-4 max-w-4xl">
        <Card elevation="subtle">
          <CardHeader>
            <CardTitle>Nie stać Cię na opłatę?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-iron-700 dark:text-iron-300">
            <p>
              Możesz złożyć wniosek o zwolnienie z kosztów sądowych w całości lub
              w części, albo o rozłożenie opłaty na raty (art. 100-103 UKSC).
            </p>
            <Link
              href="/kalkulatory/raty-sadowe"
              className="inline-flex items-center gap-2 text-sm font-medium text-accent-700 hover:text-accent-800"
            >
              Sprawdź szanse na zwolnienie z kosztów →
            </Link>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
