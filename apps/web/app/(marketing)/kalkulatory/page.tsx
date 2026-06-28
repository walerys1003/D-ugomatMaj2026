import type { Metadata } from "next";
import Link from "next/link";
import { Calculator, ShieldCheck, Banknote, Landmark } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CalculatorRachunek,
  CalculatorWynagrodzenie,
  CalculatorEmerytura,
} from "@/components/calculators";
import {
  resolveMinWage,
  resolveMinPension,
  ufgBankAccountLimitGrosze,
} from "@/lib/calculators";

export const metadata: Metadata = {
  title: "Kalkulatory kwoty wolnej od zajęcia — Długomat",
  description:
    "Trzy darmowe kalkulatory: kwota wolna z rachunku bankowego (art. 54 PB), z wynagrodzenia (art. 87, 87¹ KP) i z emerytury / renty (art. 139–141 ustawy o FUS). Aktualne stawki 2025/2026.",
  alternates: { canonical: "/kalkulatory" },
};

function formatPLN(grosze: number): string {
  return `${(grosze / 100).toFixed(2).replace(".", ",")} zł`;
}

export default function KalkulatoryPage() {
  // Snapshot stałych prawnych dla nagłówka — pokazuje, że dane są aktualne.
  const minWage = resolveMinWage();
  const minPension = resolveMinPension();
  const ufgLimit = ufgBankAccountLimitGrosze();

  return (
    <main className="container mx-auto px-4 py-12 lg:py-16">
      {/* Hero */}
      <header className="mx-auto max-w-3xl text-center">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-ink-200 bg-ink-50 px-3 py-1 text-xs font-medium uppercase tracking-wide text-ink-600 dark:border-dlugomat-800 dark:bg-dlugomat-900 dark:text-ink-300">
          <Calculator className="h-3.5 w-3.5" aria-hidden />
          Kalkulatory prawne
        </div>
        <h1 className="text-fluid-3xl font-semibold tracking-tight text-ink-900 dark:text-ink-100">
          Sprawdź ile <span className="text-gold-700">naprawdę</span> może
          zająć komornik
        </h1>
        <p className="mt-4 text-fluid-base text-ink-600 dark:text-ink-300">
          Trzy darmowe kalkulatory oparte na aktualnych przepisach. Wpisz
          swoje dane — zobaczysz konkretne kwoty chronione, które wierzyciel
          musi pozostawić Ci do dyspozycji.
        </p>
      </header>

      {/* Snapshot stałych prawnych */}
      <section
        aria-labelledby="legal-snapshot"
        className="mx-auto mt-10 max-w-4xl"
      >
        <h2 id="legal-snapshot" className="sr-only">
          Aktualne stałe prawne
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-md border border-ink-200 bg-ink-50 p-4 dark:border-dlugomat-800 dark:bg-dlugomat-900">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-ink-500">
              <Banknote className="h-4 w-4" aria-hidden />
              Min. wynagrodzenie
            </div>
            <div className="mt-1 text-lg font-semibold text-ink-900 dark:text-ink-100">
              {formatPLN(minWage.bruttoGrosze)}
            </div>
            <div className="text-xs text-ink-500">brutto, od {minWage.validFrom}</div>
          </div>
          <div className="rounded-md border border-ink-200 bg-ink-50 p-4 dark:border-dlugomat-800 dark:bg-dlugomat-900">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-ink-500">
              <ShieldCheck className="h-4 w-4" aria-hidden />
              Limit UFG (75% min. wynagr.)
            </div>
            <div className="mt-1 text-lg font-semibold text-ink-900 dark:text-ink-100">
              {formatPLN(ufgLimit)}
            </div>
            <div className="text-xs text-ink-500">art. 54 ust. 1 PB, miesięcznie</div>
          </div>
          <div className="rounded-md border border-ink-200 bg-ink-50 p-4 dark:border-dlugomat-800 dark:bg-dlugomat-900">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-ink-500">
              <Landmark className="h-4 w-4" aria-hidden />
              Najniższa emerytura
            </div>
            <div className="mt-1 text-lg font-semibold text-ink-900 dark:text-ink-100">
              {formatPLN(minPension.bruttoGrosze)}
            </div>
            <div className="text-xs text-ink-500">brutto, od {minPension.validFrom}</div>
          </div>
        </div>
      </section>

      {/* Kalkulatory */}
      <section
        aria-labelledby="calc-rachunek"
        className="mx-auto mt-12 max-w-4xl scroll-mt-20"
        id="rachunek"
      >
        <h2
          id="calc-rachunek"
          className="mb-4 text-2xl font-semibold text-ink-900 dark:text-ink-100"
        >
          1. Kalkulator kwoty wolnej z rachunku bankowego
        </h2>
        <CalculatorRachunek />
      </section>

      <section
        aria-labelledby="calc-wynagrodzenie"
        className="mx-auto mt-12 max-w-4xl scroll-mt-20"
        id="wynagrodzenie"
      >
        <h2
          id="calc-wynagrodzenie"
          className="mb-4 text-2xl font-semibold text-ink-900 dark:text-ink-100"
        >
          2. Kalkulator kwoty wolnej z wynagrodzenia
        </h2>
        <CalculatorWynagrodzenie />
      </section>

      <section
        aria-labelledby="calc-emerytura"
        className="mx-auto mt-12 max-w-4xl scroll-mt-20"
        id="emerytura"
      >
        <h2
          id="calc-emerytura"
          className="mb-4 text-2xl font-semibold text-ink-900 dark:text-ink-100"
        >
          3. Kalkulator kwoty wolnej z emerytury / renty
        </h2>
        <CalculatorEmerytura />
      </section>

      {/* CTA do modułów */}
      <section className="mx-auto mt-16 max-w-4xl">
        <Card elevation="pop" urgency="success">
          <CardHeader>
            <CardTitle>Kwota wolna nie jest stosowana? Mamy gotowe pisma.</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-ink-700 dark:text-ink-200">
              Jeśli komornik lub pracodawca ignoruje przepisy o kwocie wolnej —
              skorzystaj z naszych modułów. Generator AI przygotuje pismo
              zgodne z aktualnym stanem prawnym w 12 minut.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/moduly/komornik">D3 KomornikShield → 79 zł</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="/moduly/potracenia">D4 PotrąceniaStop → 49 zł</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Dyskleimer prawny */}
      <section className="mx-auto mt-12 max-w-4xl">
        <p className="text-xs text-ink-500 dark:text-ink-400">
          <strong>Informacja:</strong> Kalkulatory mają charakter informacyjny
          i nie stanowią porady prawnej w rozumieniu ustawy o radcach
          prawnych ani ustawy o adwokaturze. Wyniki opierają się na
          publicznych stawkach minimalnego wynagrodzenia (Dz.U.) oraz
          komunikatach Prezesa ZUS o wysokości najniższej emerytury.
          W indywidualnych sprawach zalecamy konsultację z radcą prawnym
          lub adwokatem.
        </p>
      </section>
    </main>
  );
}
