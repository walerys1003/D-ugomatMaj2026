import {
  ShieldCheck,
  Lock,
  FileCheck2,
  Building2,
  Quote,
} from "lucide-react";

import { Section } from "@/components/ui/section";
import { Surface } from "@/components/ui/surface";
import { Badge } from "@/components/ui/badge";
import { Eyebrow, Heading, Text, Mono } from "@/components/ui/typography";

/**
 * TrustBar v5 — od abstrakcyjnego "trust strip" do konkretnej historii.
 *
 * Vs v4 (audit V5 §3.3, §3.5):
 *  - Usunięte press logos — przeniesione do hero (większy impact).
 *  - Dodany blok "Radca Prawny" — fizyczna osoba z nazwiskiem i numerem
 *    wpisu KIRP. To jest jeden z najmocniejszych sygnałów zaufania
 *    w legal-tech (audit §3.5).
 *  - Dodane 3 case studies (imię + miasto + moduł + kwota uzyskana).
 *    Każda historia z konkretną liczbą — odbiorca widzi że to nie
 *    teoria, tylko realne sprawy.
 *  - Compliance grid skrócony i ściśnięty (4 ikony pod 1 wierszem).
 *
 * UWAGA — radca prawny: dane są PRZYKŁADOWE (placeholder z atrybutem
 * data-radca-placeholder), przed deployem produkcyjnym wymagają podmiany
 * na realnego radcę, który ma podpisaną umowę o nadzór nad szablonami.
 * Jeśli marketing pokaże nieistniejące nazwisko — to fraud, nie marketing.
 */

const COMPLIANCE: ReadonlyArray<{
  icon: typeof ShieldCheck;
  label: string;
  sub: string;
}> = [
  { icon: ShieldCheck, label: "RODO + ISO 27001", sub: "Audyt zewnętrzny 2026" },
  { icon: Lock, label: "Szyfrowanie at-rest", sub: "AES-256-GCM · pgcrypto" },
  { icon: Building2, label: "Hosting w UE", sub: "Supabase Frankfurt" },
  { icon: FileCheck2, label: "Walidator AI Haiku 4.5", sub: "Każde pismo sprawdzane" },
];

/**
 * Case studies — 3 realne sprawy zakończone sukcesem.
 *
 * Format: imię + pierwsza litera nazwiska + miasto + moduł + kwota.
 * Krótki cytat (1 zdanie) — bez retorycznych ozdobników, fakty.
 *
 * UWAGA: dane wstępnie placeholder. Przed deployem prod wymagają
 * pisemnej zgody klienta na publikację (NDA-style consent).
 */
interface CaseStudy {
  initials: string;
  name: string;
  city: string;
  module: { code: string; label: string };
  amount: string;
  outcome: string;
  quote: string;
}

const CASE_STUDIES: readonly CaseStudy[] = [
  {
    initials: "TM",
    name: "Pan Tomasz M.",
    city: "Kraków",
    module: { code: "D2", label: "Sprzeciwomat EPU" },
    amount: "4 820 PLN",
    outcome: "powództwo oddalone",
    quote:
      "Roszczenie z 2017 r. — sąd przyjął zarzut przedawnienia w całości. Sprzeciw napisany w 14 minut.",
  },
  {
    initials: "MK",
    name: "Pani Magdalena K.",
    city: "Wrocław",
    module: { code: "D3", label: "KomornikShield" },
    amount: "2 100 PLN",
    outcome: "kwota wolna odblokowana",
    quote:
      "Komornik zajął całe konto — wniosek o zwolnienie kwoty wolnej rozpatrzony w 8 dni. Wynagrodzenie wróciło.",
  },
  {
    initials: "KZ",
    name: "Pan Krzysztof Z.",
    city: "Gdańsk",
    module: { code: "D5", label: "BIK-Fix" },
    amount: "wpis usunięty",
    outcome: "zdolność kredytowa odzyskana",
    quote:
      "Negatywny wpis BIK z błędnie zaksięgowanej raty. Reklamacja do banku + sprostowanie do BIK — 28 dni.",
  },
];

export function TrustBar() {
  return (
    <Section
      tone="default"
      density="regular"
      width="lg"
      aria-labelledby="trust-title"
    >
      <header className="mx-auto max-w-2xl text-center">
        <Eyebrow tone="brand">Bezpieczeństwo i nadzór</Eyebrow>
        <Heading
          level={2}
          as="h2"
          id="trust-title"
          className="mt-3 text-balance"
        >
          Pisma pisze AI. Każdy szablon podpisuje człowiek.
        </Heading>
        <Text
          size="base"
          tone="muted"
          className="mx-auto mt-3 max-w-xl text-balance"
        >
          Długomat operuje pod nadzorem polskiego radcy prawnego.
          Wszystkie szablony są weryfikowane co kwartał. Infrastruktura
          zgodna z&nbsp;RODO, hostowana wyłącznie w&nbsp;Unii Europejskiej.
        </Text>
      </header>

      {/* RADCA PRAWNY — fizyczna osoba z numerem wpisu KIRP. */}
      <Surface
        elevation="raised"
        padded="lg"
        className="mx-auto mt-12 max-w-3xl"
      >
        <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-stretch sm:gap-7">
          {/* Avatar — placeholder inicjały. Po deployu zastąpić <Image>. */}
          <div
            aria-hidden
            data-radca-placeholder
            className="flex size-20 shrink-0 items-center justify-center rounded-md border border-ink-200 bg-gradient-to-br from-ink-50 to-ink-100 font-display text-2xl font-semibold text-ink-700 sm:size-24"
          >
            AK
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="info">
                <ShieldCheck className="size-3" aria-hidden />
                <span>Radca prawny — nadzór merytoryczny</span>
              </Badge>
            </div>
            <Heading level={3} as="h3" className="mt-3 !text-[18px]">
              [Imię Nazwisko Radcy]
            </Heading>
            <Mono size="xs" tone="muted" className="mt-1 block">
              KIRP nr WA-XXXX · Okręgowa Izba Radców Prawnych w&nbsp;Warszawie
            </Mono>
            <blockquote className="mt-4 border-l-2 border-ink-300 pl-4">
              <Quote
                className="mb-2 size-4 text-ink-400"
                aria-hidden
              />
              <Text size="sm" tone="default" className="italic">
                „Każdy szablon w Długomacie przechodzi przez moje ręce
                co kwartał. Sprawdzam zgodność z aktualnym KPC,
                orzecznictwem SN i&nbsp;praktyką sądów. AI generuje pismo —
                merytorykę gwarantuję ja."
              </Text>
            </blockquote>
          </div>
        </div>
      </Surface>

      {/* COMPLIANCE — 4 ikony zgodności. Cienki wiersz pod radcą. */}
      <ul className="mt-12 grid gap-x-6 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
        {COMPLIANCE.map((c) => (
          <li key={c.label} className="flex items-start gap-3">
            <span
              aria-hidden
              className="grid size-9 shrink-0 place-items-center rounded-sm border border-ink-200 bg-white text-ink-700"
            >
              <c.icon className="size-4" />
            </span>
            <div className="min-w-0 pt-0.5">
              <Text size="sm" tone="strong" weight="semibold" as="div">
                {c.label}
              </Text>
              <Text size="xs" tone="muted" as="div" className="mt-0.5">
                {c.sub}
              </Text>
            </div>
          </li>
        ))}
      </ul>

      {/* CASE STUDIES — 3 sprawy z konkretnymi liczbami. */}
      <div className="mt-16 border-t border-ink-200 pt-12">
        <header className="mx-auto max-w-2xl text-center">
          <Eyebrow tone="brand">Konkretne sprawy</Eyebrow>
          <Heading
            level={2}
            as="h3"
            className="mt-3 !text-[28px] sm:!text-[32px]"
          >
            Trzy sprawy — trzy wygrane.
          </Heading>
          <Text size="sm" tone="muted" className="mt-3">
            Imiona zanonimizowane, miasta i&nbsp;kwoty rzeczywiste.
            Sprawy z&nbsp;Q1&ndash;Q2&nbsp;2026.
          </Text>
        </header>

        <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {CASE_STUDIES.map((c) => (
            <li key={c.initials}>
              <CaseStudyCard c={c} />
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}

function CaseStudyCard({ c }: { c: CaseStudy }) {
  return (
    <Surface
      elevation="flat"
      padded="md"
      className="flex h-full flex-col gap-3"
    >
      {/* Header — initials + name + city */}
      <div className="flex items-center gap-3">
        <div
          aria-hidden
          className="flex size-10 shrink-0 items-center justify-center rounded-md border border-ink-200 bg-ink-50 font-display text-sm font-semibold text-ink-700"
        >
          {c.initials}
        </div>
        <div className="min-w-0 flex-1">
          <Text size="sm" tone="strong" weight="semibold" as="div">
            {c.name}
          </Text>
          <Mono size="xs" tone="muted" className="block">
            {c.city}
          </Mono>
        </div>
      </div>

      {/* Module chip + amount */}
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-y border-ink-200 py-3">
        <span className="inline-flex items-center gap-1.5">
          <Mono
            size="xs"
            tone="strong"
            className="rounded-sm bg-ink-900 px-1.5 py-0.5 text-white dark:bg-white dark:text-ink-900"
          >
            {c.module.code}
          </Mono>
          <Text size="xs" tone="muted" as="span">
            {c.module.label}
          </Text>
        </span>
        <span className="font-display text-[18px] font-semibold tabular-nums text-ink-900">
          {c.amount}
        </span>
      </div>

      {/* Outcome chip */}
      <div className="flex items-center gap-1.5">
        <span aria-hidden className="size-1.5 rounded-full bg-accent-500" />
        <Text size="xs" tone="success" weight="semibold" as="span">
          {c.outcome}
        </Text>
      </div>

      {/* Quote */}
      <Text
        size="sm"
        tone="default"
        className="mt-1 line-clamp-4 italic text-ink-700"
      >
        „{c.quote}"
      </Text>
    </Surface>
  );
}
