import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

/**
 * Hero v2 - premium minimalist (Design System Tarcza, Tier 62-landing)
 *
 * Bez Framer Motion bouncy, bez gradient hero-tarcza.
 * Spokojna, techniczna kompozycja: tlo iron-50, KPI strip, dwa CTA, mockup karty sprawy.
 */
export function Hero() {
  return (
    <section
      aria-labelledby="hero-headline"
      className="relative overflow-hidden border-b border-dlugomat-100 bg-white"
    >
      <div className="container relative grid gap-12 px-6 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-16 lg:py-24">
        <div className="flex flex-col gap-6">
          <Badge tone="info" withDot>
            Sztuczna inteligencja zgodna z polskim prawem
          </Badge>

          <h1
            id="hero-headline"
            className="max-w-2xl font-display text-4xl tracking-tight text-dlugomat-900 sm:text-5xl"
          >
            Tarcza dla osob zadluzonych. Pismo procesowe gotowe w 12 minut.
          </h1>

          <p className="max-w-xl text-base text-dlugomat-600">
            Wczytaj nakaz, list od komornika lub raport BIK. Dlugomat rozpozna dokument,
            oceni przedawnienie i wygeneruje pismo procesowe dopasowane do Twojej sprawy.
            Bez prawnika, bez kolejek, bez paniki.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button asChild size="lg" variant="primary">
              <Link href="/skaner-nakazu">Zeskanuj nakaz - DARMOWE</Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/jak-to-dziala">Zobacz jak to dziala</Link>
            </Button>
          </div>

          <dl
            aria-label="Najwazniejsze wskazniki platformy"
            className="mt-6 grid grid-cols-3 gap-4 border-t border-dlugomat-100 pt-6"
          >
            <div>
              <dt className="text-xs uppercase tracking-wide text-dlugomat-500">Sredni czas</dt>
              <dd className="mt-1 font-display text-xl text-dlugomat-900">12 min</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-dlugomat-500">Walidacja AI</dt>
              <dd className="mt-1 font-display text-xl text-dlugomat-900">94%</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-dlugomat-500">Szyfrowanie</dt>
              <dd className="mt-1 font-display text-xl text-dlugomat-900">AES-256</dd>
            </div>
          </dl>
        </div>

        <HeroVisual />
      </div>
    </section>
  );
}

function HeroVisual() {
  const steps = [
    { label: "OCR rozpoznal sygnature i wierzyciela", value: 100 },
    { label: "Wykryto zarzut przedawnienia (3 lata)", value: 92 },
    { label: "Pismo wygenerowane i zwalidowane", value: 100 },
  ];

  return (
    <Card elevation="pop" className="relative mx-auto w-full max-w-md p-6">
      <header className="flex items-center justify-between">
        <span className="font-mono text-xs uppercase tracking-wider text-dlugomat-500">
          Sprawa #DLG-2026-00187
        </span>
        <Badge tone="warning" withDot>
          5 dni do terminu
        </Badge>
      </header>

      <h2 className="mt-4 font-display text-xl text-dlugomat-900">
        Sprzeciw od nakazu zaplaty (EPU)
      </h2>
      <p className="mt-1 text-sm text-dlugomat-600">
        Dochodzony dlug: 4 218,00 PLN - prawdopodobne przedawnienie
      </p>

      <ul className="mt-5 space-y-3">
        {steps.map((s) => (
          <li key={s.label} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-dlugomat-700">{s.label}</span>
              <span className="font-mono text-xs text-dlugomat-900">{s.value}%</span>
            </div>
            <div
              role="progressbar"
              aria-valuenow={s.value}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={s.label}
              className="h-1.5 w-full overflow-hidden rounded-full bg-dlugomat-100"
            >
              <div className="h-full rounded-full bg-accent-500" style={{ width: `${s.value}%` }} />
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-5 flex items-center justify-between rounded-md bg-dlugomat-50 px-4 py-3">
        <span className="text-xs uppercase tracking-wide text-dlugomat-500">Pismo PDF</span>
        <span className="font-mono text-xs text-dlugomat-900">sprzeciw_epu_v3.pdf</span>
      </div>
    </Card>
  );
}
