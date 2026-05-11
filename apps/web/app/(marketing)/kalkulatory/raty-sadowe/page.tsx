import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RatySadoweCalculator } from "./calculator-client";

export const metadata: Metadata = {
  title: "Kalkulator zwolnienia z kosztów sądowych | Długomat",
  description:
    "Sprawdź swoje szanse na zwolnienie z kosztów sądowych lub rozłożenie opłaty na raty zgodnie z art. 100-103 UKSC.",
};

export default function RatySadowePage() {
  return (
    <main className="bg-iron-50 dark:bg-iron-950 pb-24">
      <section className="border-b border-iron-200 dark:border-iron-800 bg-white dark:bg-iron-900">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <p className="text-xs uppercase tracking-wider text-iron-500 mb-3">
            Kalkulatory prawne · 4 z 5
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-semibold text-iron-900 dark:text-iron-50 mb-4">
            Zwolnienie z kosztów sądowych i raty
          </h1>
          <p className="text-lg text-iron-700 dark:text-iron-300 max-w-2xl">
            Wstępna ocena szans na zwolnienie z kosztów sądowych w całości,
            w części lub rozłożenie opłaty na raty (art. 100-103 UKSC).
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-10 max-w-4xl">
        <RatySadoweCalculator />
      </section>

      <section className="container mx-auto px-4 max-w-4xl">
        <Card elevation="subtle">
          <CardHeader>
            <CardTitle>Pamiętaj</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-iron-700 dark:text-iron-300">
            <p>
              Ostateczną decyzję podejmuje sąd. Wniosek musi zawierać oświadczenie
              o stanie rodzinnym, majątku, dochodach i źródłach utrzymania
              (oficjalny formularz).
            </p>
            <Link
              href="/kalkulatory/koszty-postepowania"
              className="inline-flex items-center gap-2 text-sm font-medium text-accent-700 hover:text-accent-800"
            >
              ← Sprawdź wysokość opłaty sądowej
            </Link>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
