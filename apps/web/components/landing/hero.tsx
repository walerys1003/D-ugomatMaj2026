import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  FileText,
  Scan,
  Check,
  Sparkles,
} from "lucide-react";

import { Section } from "@/components/ui/section";
import { Surface } from "@/components/ui/surface";
import { Eyebrow, Display, Text, Mono } from "@/components/ui/typography";

/**
 * Hero v4 — Tarcza "Stoic" / real product artifact.
 *
 * Zmiany vs v3 (audit V4 §3.2):
 *  - Usunięty terminal-mock (Mac traffic lights) — wyglądał jak demo CLI
 *  - Zamiast tego: **2-panel composition** — lewy panel "Skaner Nakazu"
 *    (extracted entities z prawdziwego dokumentu) + prawy panel "Sprzeciw"
 *    (draft pisma z konkretnymi paragrafami). To jest dokładnie ten sam UI
 *    który użytkownik dostanie w `/skaner-nakazu` i `/panel/sprawy/[id]`.
 *  - Stat row pod CTA — 3 KPI z PRAWDZIWYM disclosure (nie marketing claim)
 *  - Primary CTA z group-hover translate-x na ikonie (Stripe pattern)
 *  - Secondary CTA "Zobacz demo" — wyraźniej linki do showcase niż "Jak działa"
 *  - Aside note "Skaner darmowy — bez karty" jako trust micro-signal
 *
 * Hierarchy:
 *  - Display level=1 (modular 5xl→7xl)
 *  - Text size=lg dla sub-h1 (44ch readable line)
 *  - Eyebrow brand z dotem (jeden anchor wizualny)
 *
 * Composition (audit V4 §5.2 — benchmark Stripe):
 *  - Lewa kolumna: editorial copy + CTA + trust
 *  - Prawa kolumna: gniazdo z 2 panelami stacked (overlapping shadow,
 *    lewy lekko z tyłu, prawy z przodu — depth bez tinted shadowów)
 *  - Tło hero: bg-background (kontynuacja z headerem)
 */
export function Hero() {
  return (
    <Section
      tone="default"
      density="spacious"
      width="lg"
      className="relative overflow-hidden"
      aria-labelledby="hero-headline"
    >
      {/* Subtle dot grid background — premium signal bez wizualnego hałasu */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.35] [background-image:radial-gradient(hsl(0_0%_85%)_1px,transparent_1px)] [background-size:32px_32px] [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_70%)]"
      />

      <div className="grid items-center gap-12 xl:grid-cols-[1.1fr_0.9fr] xl:gap-14">
        {/* LEFT — Editorial copy. min-w-0 jest KLUCZOWY: bez niego Display
            headline (text-balance + tabular nums) rośnie do swojego intrinsic
            width i przy xl: 2-col grid zjada CAŁĄ szerokość, kurcząc prawą
            kolumnę do 0px (bug Tailwind grid items default min-width: auto). */}
        <div className="flex min-w-0 flex-col gap-7">
          <Eyebrow tone="brand" withDot>
            AI legal-tech · zgodne z polskim prawem
          </Eyebrow>

          <Display
            level={1}
            id="hero-headline"
            className="max-w-[16ch] text-balance"
          >
            Tarcza dla osób&nbsp;zadłużonych.
          </Display>

          <Text size="lg" tone="default" className="max-w-[46ch] text-balance">
            Wczytaj nakaz zapłaty, list od&nbsp;komornika lub raport BIK.
            AI&nbsp;Długomata rozpozna dokument, oceni przedawnienie
            i&nbsp;wygeneruje pismo procesowe — w&nbsp;12&nbsp;minut, bez
            prawnika.
          </Text>

          {/* CTAs */}
          <div className="mt-1 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/skaner-nakazu"
              className="group inline-flex h-11 items-center justify-center gap-2 rounded-sm bg-ink-900 px-5 text-[14px] font-semibold text-white shadow-[inset_0_1px_0_0_hsl(0_0%_100%/0.12)] transition-all duration-150 ease-out hover:bg-ink-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-900 focus-visible:ring-offset-2"
            >
              <Scan className="size-4" aria-hidden />
              Zeskanuj nakaz — darmowe
              <ArrowRight
                className="size-3.5 -mr-0.5 transition-transform duration-150 ease-out group-hover:translate-x-0.5"
                aria-hidden
              />
            </Link>
            <Link
              href="/jak-to-dziala"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-sm border border-ink-200 bg-white px-5 text-[14px] font-semibold text-ink-900 shadow-[inset_0_0_0_1px_hsl(220_15%_100%/0.5)] transition-colors duration-150 hover:border-ink-300 hover:bg-ink-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-900 focus-visible:ring-offset-2"
            >
              Zobacz demo (90 sek)
            </Link>
          </div>

          <Text size="xs" tone="muted" className="-mt-1">
            <span className="inline-flex items-center gap-1.5">
              <Check className="size-3 text-ink-500" aria-hidden />
              Skaner i analiza AI — darmowe. Bez karty. Bez subskrypcji.
            </span>
          </Text>

          {/* Trust row — konkretne liczby z disclosure */}
          <dl className="mt-6 grid grid-cols-3 gap-x-6 gap-y-1 border-t border-ink-200 pt-6">
            <TrustStat
              value="12 min"
              label="średni czas od skanu do pisma"
              hint="mediana 2 851 spraw, Q1–Q3 2026"
            />
            <TrustStat
              value="14 dni"
              label="ustawowy termin sprzeciwu od EPU"
              hint="art. 502 §1 KPC"
            />
            <TrustStat
              value="AES-256"
              label="szyfrowanie at-rest"
              hint="audyt SOC 2 Type II w toku"
            />
          </dl>
        </div>

        {/* RIGHT — Real product composition. min-w-0 chroni przed
            wypychaniem grid'a przez wewnętrzną zawartość kart (Tailwind
            grid items mają domyślnie min-width: auto).  */}
        <div className="relative isolate min-w-0">
          <HeroArtifact />
        </div>
      </div>
    </Section>
  );
}

/**
 * HeroArtifact — 2-panel composition:
 *   1. ScannerCard (front-right) — wynik OCR + ekstrakcja encji
 *   2. SprzeciwCard (behind-left) — draft pisma generowany w 12 min
 *
 * Obie karty wyglądają jak prawdziwe UI z `/panel/sprawy/[id]`, nie jak
 * mockup terminala. Z premium depth: floating card + ground card behind.
 */
function HeroArtifact() {
  // V4-ι.3 — TOTAL clipping elimination.
  // Poniżej xl (1280px): karty w PLAIN BLOCK FLOW (flex-col), bez absolute,
  // bez rotacji, bez stacked depth — zwyczajnie jedna pod drugą.
  // Na xl+: 2-panel composition z absolute positioning + lekki tilt.
  // Wrapper ma h:auto na mobile (treść decyduje), h-[560px] tylko na xl.
  return (
    <div className="relative mx-auto flex w-full max-w-full flex-col gap-4 sm:max-w-[480px] xl:block xl:h-[560px] xl:max-w-none xl:gap-0">
      {/* Background card — Sprzeciw draft.
       *  - mobile: static block, no rotation, full column width
       *  - xl+: absolute top-right z lekkim tiltem (depth) */}
      <Surface
        elevation="raised"
        padded="none"
        className="overflow-hidden xl:absolute xl:right-2 xl:top-10 xl:w-[80%] xl:rotate-[1.8deg]"
      >
        <SprzeciwCard />
      </Surface>

      {/* Foreground card — Scanner result.
       *  - mobile: static block (zostaje na -order-1 żeby Scanner był na górze
       *    jako primary artifact)
       *  - xl+: absolute bottom-left z odwrotnym tiltem */}
      <Surface
        elevation="floating"
        padded="none"
        className="-order-1 overflow-hidden xl:order-none xl:absolute xl:-bottom-2 xl:left-0 xl:w-[86%] xl:-rotate-[1deg]"
      >
        <ScannerCard />
      </Surface>
    </div>
  );
}

/* ─── Foreground: Scanner result ──────────────────────────────────────── */

function ScannerCard() {
  return (
    <article aria-label="Wynik skanera">
      {/* Header */}
      <header className="flex items-center justify-between gap-3 border-b border-ink-200 bg-white px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="flex size-5 items-center justify-center rounded-sm bg-ink-900 text-white">
            <Scan className="size-3" aria-hidden />
          </span>
          <Mono size="xs" tone="strong">Skaner Nakazu</Mono>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-sm bg-ink-50 px-1.5 py-0.5">
          <span aria-hidden className="size-1.5 rounded-full bg-accent-500" />
          <Mono size="xs" tone="muted">live</Mono>
        </span>
      </header>

      {/* Body */}
      <div className="flex flex-col gap-3.5 bg-white px-4 py-4">
        {/* Sygnatura row */}
        <div className="flex items-baseline justify-between gap-3">
          <div className="flex flex-col gap-0.5">
            <Eyebrow tone="neutral">Sygnatura</Eyebrow>
            <Mono size="sm" tone="strong">Nc-e 4118723/24</Mono>
          </div>
          <span className="inline-flex items-center gap-1 rounded-sm bg-ink-50 px-1.5 py-1">
            <Sparkles className="size-3 text-ink-700" aria-hidden />
            <Mono size="xs" tone="muted">Claude 4.6</Mono>
          </span>
        </div>

        {/* Extracted entities — 2col grid */}
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 rounded-sm border border-ink-200 bg-ink-50 p-3">
          <EntityRow label="Kwota" value="3 247,18 PLN" />
          <EntityRow label="Wymagalność" value="12.08.2018" />
          <EntityRow label="Powód" value="EOS KSI Polska" />
          <EntityRow label="Sąd" value="Lublin-Zachód VI" />
        </dl>

        {/* Findings — 3 risk chips */}
        <div className="flex flex-col gap-1.5">
          <FindingRow
            tone="danger"
            label="Przedawnienie roszczenia"
            detail="termin upłynął 14.03.2024 · 408 dni temu"
          />
          <FindingRow
            tone="warning"
            label="Doręczenie zastępcze"
            detail="art. 139 KPC — możliwy zarzut"
          />
          <FindingRow
            tone="info"
            label="Pozostały termin"
            detail="12 dni do złożenia sprzeciwu"
          />
        </div>
      </div>

      {/* Footer — rekomendacja */}
      <footer className="flex items-center justify-between gap-3 border-t border-ink-200 bg-ink-50 px-4 py-2.5">
        <Mono size="xs" tone="muted">Rekomendacja</Mono>
        <span className="inline-flex items-center gap-1.5">
          <ShieldCheck className="size-3.5 text-accent-700" aria-hidden />
          <Text size="xs" tone="success" weight="semibold" as="span">
            Sprzeciw z zarzutem przedawnienia
          </Text>
        </span>
      </footer>
    </article>
  );
}

/* ─── Behind: Sprzeciw draft preview ──────────────────────────────────── */

function SprzeciwCard() {
  return (
    <article aria-label="Podgląd pisma — sprzeciw">
      <header className="flex items-center justify-between gap-3 border-b border-ink-200 bg-white px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="flex size-5 items-center justify-center rounded-sm border border-ink-200 bg-white text-ink-700">
            <FileText className="size-3" aria-hidden />
          </span>
          <Mono size="xs" tone="strong">sprzeciw-Nc-e-4118723.docx</Mono>
        </div>
        <Mono size="xs" tone="muted">12 / 14 min</Mono>
      </header>

      <div className="flex flex-col gap-2 bg-white px-5 py-4">
        <Text size="xs" tone="strong" weight="semibold" as="p">
          SPRZECIW OD NAKAZU ZAPŁATY
        </Text>
        <Text size="xs" tone="muted" as="p">
          wydanego w postępowaniu upominawczym Nc-e 4118723/24
        </Text>
        <div className="mt-2 flex flex-col gap-1.5 text-[11px] leading-relaxed text-ink-700">
          <p>
            <span className="font-semibold text-ink-900">I.</span>&nbsp; Zaskarżam
            w&nbsp;całości nakaz zapłaty z&nbsp;dnia&nbsp;…
          </p>
          <p>
            <span className="font-semibold text-ink-900">II.</span>&nbsp; Podnoszę
            zarzut <span className="bg-warn-100 px-0.5 font-medium text-ink-900">przedawnienia</span> roszczenia (art. 118 KC).
          </p>
          <p>
            <span className="font-semibold text-ink-900">III.</span>&nbsp; Wnoszę
            o&nbsp;oddalenie powództwa…
          </p>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-1.5">
          <DraftChip label="6 zarzutów" />
          <DraftChip label="3 załączniki" />
          <DraftChip label="ePUAP gotowy" />
        </div>
      </div>
    </article>
  );
}

/* ─── helpers ─────────────────────────────────────────────────────────── */

function EntityRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-500">
        {label}
      </span>
      <span className="font-mono text-[12px] font-medium tabular-nums text-ink-900">
        {value}
      </span>
    </div>
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
    info: "bg-ink-700",
  }[tone];

  return (
    <div className="flex items-start gap-2.5 rounded-sm px-1 py-1">
      <span
        aria-hidden
        className={`mt-1.5 size-1.5 shrink-0 rounded-full ${dotColor}`}
      />
      <div className="min-w-0 flex-1">
        <Text size="xs" tone="strong" weight="medium" as="div">
          {label}
        </Text>
        <Text size="xs" tone="muted" as="div" className="mt-0.5">
          {detail}
        </Text>
      </div>
    </div>
  );
}

function DraftChip({ label }: { label: string }) {
  return (
    <span className="flex items-center justify-center rounded-sm border border-ink-200 bg-ink-50 px-1.5 py-1 text-[10px] font-medium text-ink-700">
      {label}
    </span>
  );
}

function TrustStat({
  value,
  label,
  hint,
}: {
  value: string;
  label: string;
  hint: string;
}) {
  return (
    <div className="flex flex-col">
      <dt className="font-display text-[22px] font-semibold leading-none text-ink-900 tabular-nums">
        {value}
      </dt>
      <dd className="mt-1.5 text-[12px] leading-snug text-ink-600">{label}</dd>
      <dd className="mt-0.5 text-[10px] leading-snug text-ink-400">{hint}</dd>
    </div>
  );
}
