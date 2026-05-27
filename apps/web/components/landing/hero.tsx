import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";

import { Section } from "@/components/ui/section";
import { Surface } from "@/components/ui/surface";
import { Button } from "@/components/ui/button";
import { Eyebrow, Display, Text, Mono, Stat } from "@/components/ui/typography";

/**
 * Hero v3 — Tarcza "Stoic" editorial.
 *
 * Filozofia:
 *   - Editorial copy left, real artifact right.
 *   - Zero fake progress bars (v2 anti-pattern, signal "template UI").
 *   - Mock prawej kolumny = realny snippet wyniku analizy AI (JSON-like)
 *     z konkretnymi danymi sprawy — wygląda jak żywy output, nie demo.
 *   - Typography: Display level=1 (5xl mobile, 7xl desktop) zamiast
 *     surowego text-4xl sm:text-5xl.
 *   - Stat row pod CTA — 3 KPI z prawdziwym tonem brand (był losowy).
 *   - Container width=lg (1200px) explicit, padding 80/96/112 (Section
 *     spacious v3) zamiast hardcoded py-16 lg:py-24.
 */
export function Hero() {
  return (
    <Section
      tone="default"
      density="spacious"
      width="lg"
      aria-labelledby="hero-headline"
    >
      <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
        {/* LEFT — Editorial copy */}
        <div className="flex flex-col gap-6">
          <Eyebrow tone="brand" withDot>
            AI legal-tech · zgodne z polskim prawem
          </Eyebrow>

          <Display
            level={1}
            id="hero-headline"
            className="max-w-[18ch] text-balance"
          >
            Tarcza dla osób&nbsp;zadłużonych.
          </Display>

          <Text size="lg" tone="default" className="max-w-[44ch] text-balance">
            Wczytaj nakaz, list od&nbsp;komornika lub raport BIK. AI Długomata
            rozpozna dokument, oceni przedawnienie i&nbsp;wygeneruje pismo
            procesowe — w&nbsp;12&nbsp;minut, bez prawnika.
          </Text>

          <div className="mt-2 flex flex-wrap items-center gap-3">
            <Button asChild size="lg">
              <Link href="/skaner-nakazu" className="gap-2">
                <ShieldCheck className="size-4" aria-hidden />
                Zeskanuj nakaz — darmowe
              </Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link href="/jak-to-dziala" className="gap-2">
                Zobacz jak to działa
                <ArrowRight className="size-3.5" aria-hidden />
              </Link>
            </Button>
          </div>

          {/* KPI row — Stat primitive */}
          <dl className="mt-8 grid grid-cols-3 gap-x-6 gap-y-4 border-t border-ink-200 pt-6 dark:border-ink-200">
            <Stat
              size="sm"
              value="12 min"
              label="średni czas"
              tone="default"
            />
            <Stat
              size="sm"
              value="94%"
              label="walidacja AI"
              tone="success"
            />
            <Stat
              size="sm"
              value="AES-256"
              label="szyfrowanie"
              tone="default"
            />
          </dl>
        </div>

        {/* RIGHT — Real artifact: AI analysis output */}
        <HeroArtifact />
      </div>
    </Section>
  );
}

/**
 * HeroArtifact — wymiana fake-progress mocka v2 na realny "AI output card".
 *
 * Wzór: Linear's "what your team is shipping" hero card. Pokazujemy structured
 * wynik analizy AI z konkretnym przypadkiem (Nc-e 4118723/24), nie generyczne
 * "100% complete" paski. To samo czego użytkownik dostanie w panelu po
 * uruchomieniu Skanera.
 */
function HeroArtifact() {
  return (
    <Surface
      elevation="floating"
      padded="none"
      className="relative overflow-hidden"
    >
      {/* Card header — pasek "okno aplikacji" Mac-style traffic lights */}
      <div className="flex items-center justify-between border-b border-ink-200 bg-ink-50 px-4 py-2.5 dark:border-ink-200 dark:bg-ink-100">
        <div className="flex items-center gap-1.5">
          <span aria-hidden className="size-2.5 rounded-full bg-ink-300" />
          <span aria-hidden className="size-2.5 rounded-full bg-ink-300" />
          <span aria-hidden className="size-2.5 rounded-full bg-ink-300" />
        </div>
        <Mono size="xs" tone="muted">
          analiza-skanera.dlugomat
        </Mono>
        <span className="inline-flex items-center gap-1">
          <span aria-hidden className="size-1.5 rounded-full bg-accent-500" />
          <Mono size="xs" tone="muted">live</Mono>
        </span>
      </div>

      {/* Card body */}
      <div className="flex flex-col gap-5 p-5">
        {/* Top row — case identifier */}
        <div className="flex items-baseline justify-between gap-3">
          <div className="flex flex-col gap-0.5">
            <Eyebrow tone="neutral">Sprawa</Eyebrow>
            <Mono size="base" tone="strong">Nc-e 4118723/24</Mono>
          </div>
          <Text size="xs" tone="muted" weight="medium">
            wykryto 4 ryzyka
          </Text>
        </div>

        {/* Document quote — "AI cite source" pattern */}
        <div className="rounded border-l-2 border-dlugomat-500 bg-ink-50 px-3 py-2 dark:bg-ink-100">
          <Text size="sm" tone="default" className="italic">
            „Nakazuje pozwanemu zapłatę kwoty <span className="font-semibold text-ink-900 dark:text-white not-italic">3 247,18 PLN</span>{" "}
            wraz z&nbsp;odsetkami od dnia <span className="font-semibold text-ink-900 dark:text-white not-italic">12.08.2018</span>…"
          </Text>
        </div>

        {/* Findings list */}
        <ul className="flex flex-col gap-2.5">
          <FindingRow tone="danger" label="Przedawnienie roszczenia" detail="termin upłynął 14.03.2024 (408 dni)" />
          <FindingRow tone="warning" label="Brak doręczenia osobistego" detail="doręczenie zastępcze na adres zameldowania" />
          <FindingRow tone="info" label="Termin sprzeciwu" detail="12 dni — do 09.06.2026" />
        </ul>

        {/* Footer — recommendation chip */}
        <div className="-mx-5 -mb-5 mt-1 flex items-center justify-between gap-3 border-t border-ink-200 bg-ink-50 px-5 py-3 dark:border-ink-200 dark:bg-ink-100">
          <Text size="xs" tone="muted">Rekomendacja AI</Text>
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="size-3.5 text-accent-700 dark:text-accent-300" aria-hidden />
            <Text size="sm" tone="success" weight="semibold" as="span">
              Złóż sprzeciw — zarzut przedawnienia
            </Text>
          </span>
        </div>
      </div>
    </Surface>
  );
}

function FindingRow({
  tone,
  label,
  detail,
}: {
  tone: "danger" | "warning" | "info";
  label: string;
  detail: string;
}) {
  const dotColor = {
    danger: "bg-danger-500",
    warning: "bg-warn-500",
    info: "bg-dlugomat-500",
  }[tone];

  return (
    <li className="flex items-start gap-2.5">
      <span
        aria-hidden
        className={`mt-1.5 size-1.5 shrink-0 rounded-full ${dotColor}`}
      />
      <div className="min-w-0">
        <Text size="sm" tone="strong" weight="medium" as="div">
          {label}
        </Text>
        <Text size="xs" tone="muted" as="div" className="mt-0.5">
          {detail}
        </Text>
      </div>
    </li>
  );
}
