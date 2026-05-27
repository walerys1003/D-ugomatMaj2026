import Link from "next/link";
import { ArrowRight, ShieldCheck, Sparkles, Scan, FileSearch } from "lucide-react";

import { Section } from "@/components/ui/section";
import { Surface } from "@/components/ui/surface";
import { Badge } from "@/components/ui/badge";
import { Eyebrow, Heading, Text, Mono } from "@/components/ui/typography";

/**
 * ModulesGrid v5 — Skupienie zamiast rozproszenia.
 *
 * Vs v3 (audit V5 §3.4):
 *  - Z 8 modułów (1 hero row + 2 hero tiles + 6 standard) zostają tylko
 *    4 flagship: D2 (najpopularniejszy, gwiazda), D1 (darmowy lead magnet),
 *    D3 (kategoria komornicza), D5 (BIK).
 *  - Każda karta dostaje konkretny CTA — nie "Sprawdź" tylko np.
 *    "Sprawdź swój nakaz", "Sprawdź swój BIK". To zmienia tile z
 *    "tu możesz coś zobaczyć" na "tu możesz coś ZROBIĆ".
 *  - Pod 4 kafelkami pojawia się link "Zobacz wszystkie 8 modułów →"
 *    który prowadzi do /moduly (full catalog).
 *  - Ceny zsynchronizowane z PricingTeaser i podstronami modułów —
 *    single source of truth.
 *
 * Dlaczego 4 a nie 8?
 *  Audit §3.4: u typowego użytkownika landing 8 modułów = paraliż wyboru.
 *  D2 robi ~60% przychodu, D1 to lead magnet (free), reszta to long tail.
 *  Lepiej pokazać 4 z konkretnymi CTA niż 8 generic tiles.
 */
interface ModuleDef {
  code: "D1" | "D2" | "D3" | "D5";
  title: string;
  href: string;
  price: string;
  fromPrice?: boolean;
  badge?: { tone: "info" | "success" | "warning"; label: string; icon?: typeof Sparkles };
  desc: string;
  cta: string;
  ctaIcon?: typeof Scan;
}

const FLAGSHIP_MODULES: readonly ModuleDef[] = [
  {
    code: "D2",
    title: "Sprzeciwomat EPU",
    href: "/moduly/sprzeciw-epu",
    price: "159 PLN",
    badge: { tone: "info", label: "Najpopularniejszy", icon: Sparkles },
    desc:
      "Sprzeciw od nakazu zapłaty z e-Sądu. 14 dni na reakcję — pismo gotowe w 12 minut, z zarzutem przedawnienia i listą cytatów z KPC.",
    cta: "Sprawdź swój nakaz",
    ctaIcon: Scan,
  },
  {
    code: "D1",
    title: "Skaner Nakazu",
    href: "/skaner-nakazu",
    price: "0 PLN",
    badge: { tone: "success", label: "Darmowe", icon: ShieldCheck },
    desc:
      "Wczytaj nakaz lub list komorniczy, dowiedz się czy roszczenie jest przedawnione i jakie masz dokładnie opcje. Bez konta, bez karty.",
    cta: "Zeskanuj teraz",
    ctaIcon: Scan,
  },
  {
    code: "D3",
    title: "KomornikShield",
    href: "/moduly/komornik",
    price: "79 PLN",
    fromPrice: true,
    desc:
      "Skarga na czynności komornika, wniosek o ograniczenie egzekucji, odblokowanie kwoty wolnej. Sześć typów pism w jednym module.",
    cta: "Sprawdź swoją sprawę",
    ctaIcon: FileSearch,
  },
  {
    code: "D5",
    title: "BIK-Fix",
    href: "/moduly/bik",
    price: "129 PLN",
    desc:
      "Wniosek o korektę negatywnego wpisu w BIK plus pismo reklamacyjne do banku. Średni czas usunięcia błędnego wpisu — 30 dni.",
    cta: "Sprawdź swój BIK",
    ctaIcon: FileSearch,
  },
];

export function ModulesGrid() {
  return (
    <Section tone="muted" density="compact" aria-labelledby="modules-title">
      <header className="mx-auto max-w-2xl text-center">
        <Eyebrow tone="brand">Moduły</Eyebrow>
        <Heading level={1} id="modules-title" className="mt-3" as="h2">
          Cztery flagowe narzędzia — jedna tarcza
        </Heading>
        <Text size="base" tone="muted" className="mt-4">
          Pokazujemy najczęściej używane moduły. Pełny katalog
          ośmiu&nbsp;modułów D1–D8 — krok niżej.
        </Text>
      </header>

      <ul className="mt-14 grid gap-3 sm:grid-cols-2">
        {FLAGSHIP_MODULES.map((m) => (
          <li key={m.code}>
            <FlagshipTile m={m} />
          </li>
        ))}
      </ul>

      {/* "Zobacz wszystkie" link — prowadzi do pełnego katalogu */}
      <div className="mt-8 flex justify-center">
        <Link
          href="/moduly"
          className="group inline-flex items-center gap-2 text-[14px] font-semibold text-ink-900 transition-colors hover:text-dlugomat-700 dark:text-ink-800 dark:hover:text-dlugomat-300"
        >
          Zobacz wszystkie 8 modułów (D4 · D6 · D7 · D8)
          <ArrowRight
            className="size-3.5 transition-transform group-hover:translate-x-0.5"
            aria-hidden
          />
        </Link>
      </div>
    </Section>
  );
}

function FlagshipTile({ m }: { m: ModuleDef }) {
  const BadgeIcon = m.badge?.icon;
  const CtaIcon = m.ctaIcon;

  return (
    <Link
      href={m.href}
      className="group block h-full rounded-md focus-visible:shadow-shield-focus focus-visible:outline-none"
      aria-label={`${m.title} — ${m.cta}`}
    >
      <Surface
        elevation="raised"
        padded="lg"
        interactive
        className="relative flex h-full flex-col gap-3"
      >
        {/* Header: code + badge */}
        <div className="flex items-center justify-between gap-2">
          <Mono
            size="sm"
            tone="strong"
            className="rounded-sm bg-ink-900 px-1.5 py-0.5 text-white dark:bg-white dark:text-ink-900"
          >
            {m.code}
          </Mono>
          {m.badge ? (
            <Badge tone={m.badge.tone}>
              {BadgeIcon ? <BadgeIcon className="size-3" aria-hidden /> : null}
              <span>{m.badge.label}</span>
            </Badge>
          ) : null}
        </div>

        <Heading level={2} as="h3" className="mt-2">
          {m.title}
        </Heading>
        <Text size="base" tone="default">
          {m.desc}
        </Text>

        {/* Footer: price + CTA */}
        <div className="mt-auto flex items-center justify-between gap-3 border-t border-ink-200 pt-4">
          <div className="flex items-baseline gap-1">
            {m.fromPrice ? (
              <Mono size="xs" tone="muted">
                od
              </Mono>
            ) : null}
            <Mono size="base" tone="strong">
              {m.price}
            </Mono>
          </div>
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-dlugomat-700 transition-colors group-hover:text-dlugomat-900 dark:text-dlugomat-300 dark:group-hover:text-white">
            {CtaIcon ? <CtaIcon className="size-3.5" aria-hidden /> : null}
            {m.cta}
            <ArrowRight
              className="size-3.5 transition-transform group-hover:translate-x-0.5"
              aria-hidden
            />
          </span>
        </div>
      </Surface>
    </Link>
  );
}
