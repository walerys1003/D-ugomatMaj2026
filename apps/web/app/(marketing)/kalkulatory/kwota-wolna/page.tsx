/**
 * Tier 35 — Kalkulator kwoty wolnej od egzekucji (art. 87¹ i 87² KP).
 */
import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { KwotaWolnaCalculator } from "./calculator-client";

export const metadata: Metadata = {
  title: "Kalkulator kwoty wolnej od egzekucji — Długomat",
  description:
    "Sprawdź, ile komornik może maksymalnie zająć z Twojego wynagrodzenia. Art. 87¹ i 87² KP. Uwzględnia liczbę dzieci na utrzymaniu.",
  alternates: { canonical: "/kalkulatory/kwota-wolna" },
};

export default function KwotaWolnaPage() {
  return (
    <div className="bg-gradient-to-b from-ink-50 to-white pb-20 dark:from-dlugomat-950 dark:to-dlugomat-900">
      <section className="container py-12 lg:py-16">
        <nav aria-label="Okruszki" className="mb-6 text-fluid-xs text-ink-500">
          <Link href="/kalkulatory" className="hover:text-dlugomat-700">
            Kalkulatory
          </Link>
          <span className="mx-2 text-ink-300">/</span>
          <span className="text-ink-700 dark:text-ink-200">Kwota wolna od egzekucji</span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:gap-16">
          <div>
            <p className="mb-3 inline-flex items-center gap-2 text-fluid-xs font-semibold uppercase tracking-wider text-dlugomat-600 dark:text-dlugomat-300">
              <span className="h-px w-8 bg-dlugomat-600" />
              Kalkulator nr 2
            </p>
            <h1 className="font-display text-fluid-5xl font-bold leading-tight text-dlugomat-900 dark:text-ink-50">
              Ile komornik może realnie zająć?
            </h1>
            <p className="mt-5 text-fluid-lg leading-relaxed text-ink-700 dark:text-ink-200">
              Komornik nie może zająć wszystkiego. Kwota wolna od egzekucji jest ustawowo
              chroniona — minimum wynagrodzenia (alimenty: 40% min. wynagrodzenia) plus
              dodatek na każdą osobę na utrzymaniu.
            </p>
          </div>

          <Card elevation="pop">
            <CardContent className="p-6 lg:p-8">
              <KwotaWolnaCalculator />
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="container py-12">
        <Card elevation="pop" className="border-dlugomat-700/30 bg-gradient-to-br from-dlugomat-900 to-dlugomat-700 text-ink-50">
          <CardContent className="grid gap-6 p-10 lg:grid-cols-[2fr_1fr] lg:items-center">
            <div>
              <h2 className="font-display text-fluid-2xl font-bold leading-tight">
                Komornik zajmuje za dużo? Wyślij skargę.
              </h2>
              <p className="mt-3 text-fluid-base leading-relaxed text-ink-100/90">
                Moduł D3 KomornikShield generuje skargę na czynności komornika z dokładnym
                wskazaniem, ile naliczył ponad ustawowy limit.
              </p>
            </div>
            <Button asChild size="lg" variant="success" className="w-full">
              <Link href="/moduly/komornik">Otwórz D3 KomornikShield</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
