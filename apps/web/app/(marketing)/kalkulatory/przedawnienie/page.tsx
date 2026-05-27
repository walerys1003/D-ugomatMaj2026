/**
 * Tier 35 — Kalkulator przedawnienia roszczeń.
 *
 * Server-rendered shell + client component dla interaktywności.
 * Source: lib/calculators/legal-math.ts → calculateLimitation()
 */
import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PrzedawnienieCalculator } from "./calculator-client";

export const metadata: Metadata = {
  title: "Kalkulator przedawnienia roszczeń — Długomat",
  description:
    "Sprawdź w 30 sekund, czy roszczenie wobec Ciebie jest przedawnione. Art. 118 i 117 § 2¹ KC. Wyniki z podstawami prawnymi.",
  alternates: { canonical: "/kalkulatory/przedawnienie" },
};

export default function PrzedawnieniePage() {
  return (
    <div className="bg-gradient-to-b from-ink-50 to-white pb-20 dark:from-dlugomat-950 dark:to-dlugomat-900">
      <section className="container py-12 lg:py-16">
        <nav aria-label="Okruszki" className="mb-6 text-fluid-xs text-ink-500">
          <Link href="/kalkulatory" className="hover:text-dlugomat-700">
            Kalkulatory
          </Link>
          <span className="mx-2 text-ink-300">/</span>
          <span className="text-ink-700 dark:text-ink-200">Przedawnienie</span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:gap-16">
          <div>
            <p className="mb-3 inline-flex items-center gap-2 text-fluid-xs font-semibold uppercase tracking-wider text-dlugomat-600 dark:text-dlugomat-300">
              <span className="h-px w-8 bg-dlugomat-600" />
              Kalkulator nr 1
            </p>
            <h1 className="font-display text-fluid-5xl font-bold leading-tight text-dlugomat-900 dark:text-ink-50">
              Czy Twoje roszczenie jest przedawnione?
            </h1>
            <p className="mt-5 text-fluid-lg leading-relaxed text-ink-700 dark:text-ink-200">
              Wpisz datę wymagalności i typ roszczenia. Otrzymasz dokładną datę
              przedawnienia, liczbę dni pozostałych oraz cytowane podstawy prawne.
            </p>

            <div className="mt-8 space-y-4 text-fluid-sm text-ink-600 dark:text-ink-300">
              <div className="flex gap-3">
                <span aria-hidden className="mt-1 inline-block size-1.5 shrink-0 rounded-full bg-accent-500" />
                <p>
                  <strong className="text-ink-800 dark:text-ink-100">3 lata</strong> — roszczenia
                  konsumenckie i z działalności gospodarczej (art. 118 KC).
                </p>
              </div>
              <div className="flex gap-3">
                <span aria-hidden className="mt-1 inline-block size-1.5 shrink-0 rounded-full bg-accent-500" />
                <p>
                  <strong className="text-ink-800 dark:text-ink-100">6 lat</strong> — ogólne
                  roszczenia cywilne (od 9.07.2018).
                </p>
              </div>
              <div className="flex gap-3">
                <span aria-hidden className="mt-1 inline-block size-1.5 shrink-0 rounded-full bg-accent-500" />
                <p>
                  <strong className="text-ink-800 dark:text-ink-100">Koniec roku</strong> — okresy
                  ≥ 2 lat biegną do końca roku kalendarzowego.
                </p>
              </div>
            </div>
          </div>

          <Card elevation="pop">
            <CardContent className="p-6 lg:p-8">
              <PrzedawnienieCalculator />
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="container py-12">
        <Card elevation="subtle" className="border-l-4 border-l-warn-500 bg-warn-50 dark:bg-dlugomat-900">
          <CardContent className="p-6">
            <h2 className="font-display text-fluid-lg font-semibold text-warn-600">
              Uwaga: przerwanie biegu przedawnienia
            </h2>
            <p className="mt-2 text-fluid-sm text-ink-700 dark:text-ink-200">
              Bieg przedawnienia może zostać <strong>przerwany</strong>, jeśli np. uznałeś dług,
              złożyłeś wniosek o rozłożenie na raty, albo wierzyciel skierował sprawę do sądu.
              Wtedy termin biegnie od nowa. Zaznacz odpowiednie pole w kalkulatorze — uwzględnimy
              datę przerwania.
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="container py-12">
        <Card elevation="pop" className="border-dlugomat-700/30 bg-gradient-to-br from-dlugomat-900 to-dlugomat-700 text-ink-50">
          <CardContent className="grid gap-6 p-10 lg:grid-cols-[2fr_1fr] lg:items-center">
            <div>
              <h2 className="font-display text-fluid-2xl font-bold leading-tight">
                Roszczenie jest przedawnione? Wygeneruj sprzeciw EPU.
              </h2>
              <p className="mt-3 text-fluid-base leading-relaxed text-ink-100/90">
                Sam zarzut przedawnienia w sprzeciwie wystarczy, żeby sąd uchylił nakaz.
                Długomat D2 robi to za Ciebie — z cytowaniem podstawy prawnej i terminów.
              </p>
            </div>
            <Button asChild size="lg" variant="success" className="w-full">
              <Link href="/moduly/sprzeciw-epu">Otwórz moduł D2</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
