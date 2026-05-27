import Link from "next/link";
import { ArrowRight, ShieldCheck, Sparkles } from "lucide-react";

import { Section } from "@/components/ui/section";
import { Surface } from "@/components/ui/surface";
import { Badge } from "@/components/ui/badge";
import { Eyebrow, Heading, Text, Mono } from "@/components/ui/typography";

interface ModuleDef {
  code: "D1" | "D2" | "D3" | "D4" | "D5" | "D6" | "D7" | "D8";
  title: string;
  href: string;
  price: string;
  highlight?: "free" | "popular";
  desc: string;
}

const MODULES: readonly ModuleDef[] = [
  { code: "D1", title: "Skaner Nakazu", href: "/skaner-nakazu", price: "DARMOWE", highlight: "free",
    desc: "Wczytaj nakaz, sprawdź czy roszczenie jest przedawnione i dowiedz się jakie masz opcje." },
  { code: "D2", title: "Sprzeciwomat EPU", href: "/moduly/sprzeciw-epu", price: "159 PLN", highlight: "popular",
    desc: "Sprzeciw od nakazu zapłaty z e-Sądu. 14 dni na reakcję — pismo w 12 minut." },
  { code: "D3", title: "KomornikShield", href: "/moduly/komornik", price: "od 79 PLN",
    desc: "Skarga na czynności komornika, wniosek o ograniczenie egzekucji, kwota wolna." },
  { code: "D4", title: "PotrąceniaStop", href: "/moduly/potracenia", price: "od 79 PLN",
    desc: "Wstrzymaj zajęcie wynagrodzenia, odblokuj kwotę wolną na koncie bankowym." },
  { code: "D5", title: "BIK-Fix", href: "/moduly/bik", price: "129 PLN",
    desc: "Wniosek o korektę negatywnego wpisu w BIK plus pismo do banku. Średnio 30 dni." },
  { code: "D6", title: "CesjaCheck", href: "/moduly/cesja", price: "149 PLN",
    desc: "Weryfikacja umowy cesji i zarzut braku legitymacji procesowej. Fundusz na bok." },
  { code: "D7", title: "UgodoMat", href: "/moduly/ugoda", price: "119 PLN",
    desc: "Propozycja ugody z wierzycielem — kapitał, odsetki, raty. Harmonogram w PDF." },
  { code: "D8", title: "Upadłość-Lite", href: "/moduly/upadlosc", price: "249 PLN",
    desc: "Wniosek o upadłość konsumencką — formularz, uzasadnienie i spis majątku." },
] as const;

/**
 * ModulesGrid v3 — Tarcza Stoic "bento".
 *
 * Vs v2:
 *  - Bento layout: D1 (free) i D2 (popular) jako "hero tiles" zajmujące
 *    podwójną szerokość, reszta jako standardowe tiles. Pattern Vercel/
 *    Anthropic — wyróżnia 2 najważniejsze moduły wizualnie, nie tylko
 *    badge'em.
 *  - Surface elevation="raised" + interactive zamiast Card subtle/pop +
 *    urgency strip (urgency był nadużywany dla "decorative", v3 reserved
 *    dla deadlines).
 *  - Mono primitive dla kodu modułu (D1..D8) zamiast custom font-mono span.
 *  - Heading level=3 dla card title (consistent z HowItWorks).
 *  - Section compact density (48/64/80) zamiast hardcoded py-20.
 */
export function ModulesGrid() {
  const heroes = MODULES.filter((m) => m.highlight);
  const standard = MODULES.filter((m) => !m.highlight);

  return (
    <Section tone="muted" density="compact" aria-labelledby="modules-title">
      <header className="mx-auto max-w-2xl text-center">
        <Eyebrow tone="brand">Moduły</Eyebrow>
        <Heading level={1} id="modules-title" className="mt-3" as="h2">
          Osiem narzędzi — jedna tarcza
        </Heading>
        <Text size="base" tone="muted" className="mt-4">
          Każdy moduł rozwiązuje jeden problem. Płacisz tylko za to, czego potrzebujesz.
        </Text>
      </header>

      {/* Hero row — D1 + D2 jako duże tiles */}
      <div className="mt-14 grid gap-3 lg:grid-cols-2">
        {heroes.map((m) => (
          <HeroTile key={m.code} m={m} />
        ))}
      </div>

      {/* Standard row — D3..D8 */}
      <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {standard.map((m) => (
          <li key={m.code}>
            <StandardTile m={m} />
          </li>
        ))}
      </ul>
    </Section>
  );
}

function HeroTile({ m }: { m: ModuleDef }) {
  return (
    <Link
      href={m.href}
      className="group block rounded-md focus-visible:shadow-shield-focus focus-visible:outline-none"
      aria-label={`Sprawdź moduł ${m.title}`}
    >
      <Surface
        elevation="raised"
        padded="lg"
        interactive
        className="relative flex h-full flex-col gap-3"
      >
        <div className="flex items-center justify-between gap-2">
          <Mono
            size="sm"
            tone="strong"
            className="rounded-sm bg-ink-900 px-1.5 py-0.5 text-white dark:bg-white dark:text-ink-900"
          >
            {m.code}
          </Mono>
          {m.highlight === "free" ? (
            <Badge tone="success">
              <ShieldCheck className="size-3" aria-hidden />
              <span>Darmowe</span>
            </Badge>
          ) : (
            <Badge tone="info">
              <Sparkles className="size-3" aria-hidden />
              <span>Najpopularniejsze</span>
            </Badge>
          )}
        </div>

        <Heading level={2} as="h3" className="mt-2">
          {m.title}
        </Heading>
        <Text size="base" tone="default">
          {m.desc}
        </Text>

        <div className="mt-auto flex items-center justify-between border-t border-ink-200 pt-4 dark:border-ink-200">
          <Mono size="base" tone="strong">{m.price}</Mono>
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-dlugomat-700 transition-colors group-hover:text-dlugomat-900 dark:text-dlugomat-300 dark:group-hover:text-white">
            Sprawdź
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </span>
        </div>
      </Surface>
    </Link>
  );
}

function StandardTile({ m }: { m: ModuleDef }) {
  return (
    <Link
      href={m.href}
      className="group block h-full rounded-md focus-visible:shadow-shield-focus focus-visible:outline-none"
      aria-label={`Sprawdź moduł ${m.title}`}
    >
      <Surface
        elevation="flat"
        padded="md"
        interactive
        className="flex h-full flex-col gap-2"
      >
        <div className="flex items-center justify-between">
          <Mono
            size="xs"
            tone="muted"
            className="rounded-sm border border-ink-200 bg-ink-50 px-1.5 py-0.5 dark:bg-ink-100"
          >
            {m.code}
          </Mono>
          <Mono size="xs" tone="muted">{m.price}</Mono>
        </div>
        <Heading level={3} as="h3" className="mt-1">
          {m.title}
        </Heading>
        <Text size="sm" tone="default" className="line-clamp-3">
          {m.desc}
        </Text>
        <span className="mt-auto inline-flex items-center gap-1.5 pt-2 text-xs font-semibold text-dlugomat-700 transition-colors group-hover:text-dlugomat-900 dark:text-dlugomat-300 dark:group-hover:text-white">
          Sprawdź
          <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" aria-hidden />
        </span>
      </Surface>
    </Link>
  );
}
