import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/ui/section";
import { Surface } from "@/components/ui/surface";
import {
  Display,
  Eyebrow,
  Heading,
  Mono,
  Text,
} from "@/components/ui/typography";

/**
 * PricingTeaser v5 — Pricing zunifikowany z taksonomią modułów D1..D8.
 *
 * Vs v4 (audit V5 §4.2 — KRYTYCZNE):
 *  - Likwidacja sprzeczności "od 119 PLN / pismo" vs "159 PLN" w D2 modules.tsx.
 *  - Każdy wiersz cennika pokazuje DOKŁADNĄ cenę modułu — taką samą jak
 *    w ModulesGrid i na podstronach /moduly/*.
 *  - Trzykolumnowy układ "tier" zastąpiony tabelą per-moduł (8 wierszy).
 *  - Wyróżnione 2 wiersze (D1 darmowe + D2 najpopularniejszy) jak hero tiles
 *    w ModulesGrid — wizualna ciągłość między sekcjami.
 *  - Disclaimer pod tabelą: "Bez subskrypcji. Płacisz tylko za to,
 *    czego użyjesz." (zostawiamy zalety modelu z v4 ale w jednym miejscu).
 *
 * Single source of truth dla ceny: ten plik + components/landing/modules.tsx
 * + apps/web/lib/cases/case-types.ts (priceGrosze field) — wszystkie trzy
 * pokazują tę samą liczbę. Jakakolwiek zmiana wymaga update w trzech miejscach.
 */
interface PricingRow {
  code: "D1" | "D2" | "D3" | "D4" | "D5" | "D6" | "D7" | "D8";
  name: string;
  href: string;
  price: string;
  fromPrice?: boolean;
  desc: string;
  highlight?: "free" | "popular";
}

const PRICING: readonly PricingRow[] = [
  {
    code: "D1",
    name: "Skaner Nakazu",
    href: "/skaner-nakazu",
    price: "0 PLN",
    desc: "OCR + ocena przedawnienia + rekomendacja kolejnego kroku. Bez rejestracji.",
    highlight: "free",
  },
  {
    code: "D2",
    name: "Sprzeciwomat EPU",
    href: "/moduly/sprzeciw-epu",
    price: "159 PLN",
    desc: "Sprzeciw od nakazu zapłaty z e-Sądu. 14 dni na reakcję.",
    highlight: "popular",
  },
  {
    code: "D3",
    name: "KomornikShield",
    href: "/moduly/komornik",
    price: "79 PLN",
    fromPrice: true,
    desc: "Skarga na czynności komornika, ograniczenie egzekucji, kwota wolna.",
  },
  {
    code: "D4",
    name: "PotrąceniaStop",
    href: "/moduly/potracenia",
    price: "79 PLN",
    fromPrice: true,
    desc: "Wstrzymanie zajęcia wynagrodzenia, odblokowanie kwoty wolnej.",
  },
  {
    code: "D5",
    name: "BIK-Fix",
    href: "/moduly/bik",
    price: "129 PLN",
    desc: "Wniosek o korektę negatywnego wpisu w BIK + pismo do banku.",
  },
  {
    code: "D6",
    name: "CesjaCheck",
    href: "/moduly/cesja",
    price: "149 PLN",
    desc: "Weryfikacja umowy cesji, zarzut braku legitymacji procesowej.",
  },
  {
    code: "D7",
    name: "UgodoMat",
    href: "/moduly/ugoda",
    price: "119 PLN",
    desc: "Propozycja ugody z wierzycielem — kapitał, odsetki, raty, harmonogram.",
  },
  {
    code: "D8",
    name: "Upadłość-Lite",
    href: "/moduly/upadlosc",
    price: "249 PLN",
    desc: "Wniosek o upadłość konsumencką — formularz, uzasadnienie, spis majątku.",
  },
];

export function PricingTeaser() {
  return (
    <Section tone="default" density="compact" aria-labelledby="pricing-title">
      <header className="mx-auto max-w-2xl text-center">
        <Eyebrow tone="brand">Cennik</Eyebrow>
        <Display level={2} id="pricing-title" className="mt-3">
          Płacisz raz, za konkretne pismo.
        </Display>
        <Text size="base" tone="muted" className="mx-auto mt-4 max-w-xl">
          Bez subskrypcji. Bez ukrytych kosztów. Każdy moduł ma cenę
          jak na karcie produktu — nic się nie zmienia w&nbsp;koszyku.
        </Text>
      </header>

      <Surface
        elevation="raised"
        padded="none"
        className="mt-12 overflow-hidden"
      >
        <ul role="list" className="divide-y divide-ink-200">
          {PRICING.map((row) => (
            <li key={row.code}>
              <PricingItemLink row={row} />
            </li>
          ))}
        </ul>
      </Surface>

      {/* Footer note + secondary CTA do pełnego cennika */}
      <div className="mt-8 flex flex-col items-center gap-4 text-center">
        <Text size="sm" tone="muted" className="max-w-xl">
          Pakiety modułów (np. KomornikShield 4-w-1) oraz faktura VAT —
          szczegóły na stronie cennika.
        </Text>
        <Button asChild variant="secondary" size="md">
          <Link href="/cennik" className="gap-2">
            Pełny cennik i pakiety
            <ArrowRight className="size-3.5" aria-hidden />
          </Link>
        </Button>
      </div>
    </Section>
  );
}

function PricingItemLink({ row }: { row: PricingRow }) {
  const isFree = row.highlight === "free";
  const isPopular = row.highlight === "popular";

  return (
    <Link
      href={row.href}
      className="group block focus-visible:outline-none focus-visible:bg-ink-50"
      aria-label={`${row.name} — ${row.price}`}
    >
      <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4 px-4 py-4 transition-colors hover:bg-ink-50 sm:px-6 sm:py-5">
        {/* Module code chip */}
        <Mono
          size="xs"
          tone="strong"
          className={
            isFree || isPopular
              ? "rounded-sm bg-ink-900 px-1.5 py-0.5 text-white dark:bg-white dark:text-ink-900"
              : "rounded-sm border border-ink-200 bg-ink-50 px-1.5 py-0.5 dark:bg-ink-100"
          }
        >
          {row.code}
        </Mono>

        {/* Name + desc */}
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Heading level={3} as="h3" className="!text-[16px]">
              {row.name}
            </Heading>
            {isFree ? (
              <Badge tone="success">
                <ShieldCheck className="size-3" aria-hidden />
                <span>Darmowe</span>
              </Badge>
            ) : null}
            {isPopular ? <Badge tone="info">Najpopularniejsze</Badge> : null}
          </div>
          <Text size="sm" tone="muted" className="mt-1 line-clamp-2">
            {row.desc}
          </Text>
        </div>

        {/* Price + arrow */}
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-baseline gap-1">
            {row.fromPrice ? (
              <Mono size="xs" tone="muted">
                od
              </Mono>
            ) : null}
            <span className="font-display text-[20px] font-semibold tabular-nums text-ink-900">
              {row.price}
            </span>
          </div>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-dlugomat-700 transition-colors group-hover:text-dlugomat-900 dark:text-dlugomat-300 dark:group-hover:text-white">
            Sprawdź
            <ArrowRight
              className="size-3 transition-transform group-hover:translate-x-0.5"
              aria-hidden
            />
          </span>
        </div>
      </div>
    </Link>
  );
}
