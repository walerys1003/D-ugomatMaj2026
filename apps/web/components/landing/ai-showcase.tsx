import { Sparkles, ShieldCheck, FileText, ArrowRight } from "lucide-react";

import { Section } from "@/components/ui/section";
import { Surface } from "@/components/ui/surface";
import { Badge } from "@/components/ui/badge";
import { Kbd } from "@/components/ui/kbd";
import { Divider } from "@/components/ui/divider";
import { Eyebrow, Heading, Text, Mono } from "@/components/ui/typography";

/**
 * AIShowcase v3 — Tarcza Stoic "terminal-grade".
 *
 * Vs v2:
 *  - Wszystkie typography przez primitivy (Eyebrow/Heading/Text/Mono).
 *  - Surface uses ink-200 border (true neutral, brak niebieskiego tintu).
 *  - Tighter padding (Surface padded=sm zamiast md — 16 zamiast 20).
 *  - Center column ma terminal-style header z dot indicator (Linear/Raycast).
 *  - Mono primitive zamiast inline font-mono text-[0.78rem] magic numbers.
 *  - Heading level=1 dla h2 (modular 4xl/5xl), tone=brand spawn dla "AI w pracy".
 *  - Layout grid 3-col bez przesadnych ratio (1:1:1 zamiast 1.05:1:1.05).
 *  - Wszystko 8pt grid w gap (gap-3, gap-4, mt-12).
 */

const FINDINGS: ReadonlyArray<{
  label: string;
  tone: "danger" | "warning" | "success" | "info";
  detail: string;
  level: string;
}> = [
  {
    label: "Przedawnienie roszczenia",
    tone: "danger",
    detail: "Termin upłynął 14.03.2024 — 408 dni temu",
    level: "krytyczne",
  },
  {
    label: "Brak doręczenia osobistego",
    tone: "warning",
    detail: "Doręczenie zastępcze na adres zameldowania",
    level: "uwaga",
  },
  {
    label: "Termin sprzeciwu",
    tone: "info",
    detail: "Pozostało 12 dni (do 09.06.2026)",
    level: "info",
  },
  {
    label: "Sygnatura sprawdzona w EPU",
    tone: "success",
    detail: "Nc-e 4118723/24 · Sąd Rejonowy Lublin-Zachód",
    level: "ok",
  },
];

export function AIShowcase() {
  return (
    <Section tone="muted" density="regular" surface aria-labelledby="ai-showcase-title">
      <header className="mx-auto max-w-2xl text-center">
        <Eyebrow tone="brand" withDot>
          AI w pracy
        </Eyebrow>
        <Heading level={1} id="ai-showcase-title" as="h2" className="mt-3">
          Od skanu nakazu do gotowego sprzeciwu — w&nbsp;jednym oknie
        </Heading>
        <Text size="base" tone="muted" className="mt-4">
          AI Długomata nie pisze ogólników. Czyta każdy paragraf, sprawdza terminy w&nbsp;kalendarzu
          sądowym, wykrywa przedawnienie i&nbsp;komponuje pismo procesowe na podstawie 14&nbsp;sprawdzonych szablonów.
        </Text>
      </header>

      <div className="mt-14 grid gap-3 lg:grid-cols-3 lg:items-stretch">
        {/* Kolumna 1 — DOKUMENT WEJŚCIOWY */}
        <Surface elevation="raised" padded="none" className="flex flex-col overflow-hidden">
          <ColumnHeader
            icon={<FileText className="size-3.5" aria-hidden />}
            tone="neutral"
            label="Nakaz zapłaty (EPU)"
            badge={<Badge tone="neutral">PDF · 2 str.</Badge>}
          />
          <div className="flex flex-1 flex-col gap-3 p-5">
            <Mono size="xs" tone="muted">
              Sygn. akt: <span className="text-ink-800 dark:text-ink-800">Nc-e 4118723/24</span>
            </Mono>
            <div className="rounded border-l-2 border-danger-500 bg-danger-50 px-3 py-2.5 dark:bg-danger-500/10">
              <Mono size="sm" tone="default" className="leading-relaxed">
                „Nakazuje pozwanemu zapłatę kwoty{" "}
                <mark className="bg-warn-100 px-1 not-italic font-semibold text-ink-900 dark:bg-warn-500/20 dark:text-white">
                  3 247,18 PLN
                </mark>{" "}
                wraz z&nbsp;odsetkami od dnia{" "}
                <mark className="bg-warn-100 px-1 not-italic font-semibold text-ink-900 dark:bg-warn-500/20 dark:text-white">
                  12.08.2018
                </mark>
                …"
              </Mono>
            </div>
            <Mono size="xs" tone="muted">
              Powód: <span className="text-ink-800 dark:text-ink-800">Ultimo Portfolio S.A.</span>
            </Mono>
            <Mono size="xs" tone="muted">
              Wierzytelność pierwotna: <span className="text-ink-800 dark:text-ink-800">Plus GSM (T-Mobile)</span>
            </Mono>
            <div className="mt-auto flex items-center gap-1.5 pt-2">
              <Kbd>⌘</Kbd>
              <Kbd>O</Kbd>
              <Text size="xs" tone="muted" as="span">
                aby otworzyć inny dokument
              </Text>
            </div>
          </div>
        </Surface>

        {/* Kolumna 2 — ANALIZA AI */}
        <Surface elevation="raised" padded="none" className="flex flex-col overflow-hidden">
          <ColumnHeader
            icon={<Sparkles className="size-3.5" aria-hidden />}
            tone="brand"
            label="Analiza AI · 4,2 s"
            badge={
              <span className="inline-flex items-center gap-1">
                <span aria-hidden className="size-1.5 animate-pulse rounded-full bg-accent-500" />
                <Mono size="xs" tone="muted">live</Mono>
              </span>
            }
          />
          <div className="flex flex-1 flex-col gap-3 p-5">
            <ul className="flex flex-col gap-3">
              {FINDINGS.map((f) => (
                <li key={f.label} className="flex items-start gap-2.5">
                  <Badge tone={f.tone} className="mt-0.5 shrink-0 capitalize">
                    <span
                      aria-hidden
                      className={`size-1.5 rounded-full ${
                        f.tone === "danger"
                          ? "bg-danger-500"
                          : f.tone === "warning"
                            ? "bg-warn-500"
                            : f.tone === "success"
                              ? "bg-accent-500"
                              : "bg-dlugomat-500"
                      }`}
                    />
                    {f.level}
                  </Badge>
                  <div className="min-w-0">
                    <Text size="sm" tone="strong" weight="medium" as="div">
                      {f.label}
                    </Text>
                    <Text size="xs" tone="muted" as="div" className="mt-0.5">
                      {f.detail}
                    </Text>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </Surface>

        {/* Kolumna 3 — PISMO WYJŚCIOWE */}
        <Surface elevation="raised" padded="none" className="flex flex-col overflow-hidden">
          <ColumnHeader
            icon={<ShieldCheck className="size-3.5" aria-hidden />}
            tone="success"
            label="Sprzeciw od nakazu"
            badge={<Badge tone="success">DOCX · gotowe</Badge>}
          />
          <div className="flex flex-1 flex-col gap-3 p-5">
            <div className="space-y-2 font-serif text-[13px] leading-relaxed text-ink-800 dark:text-ink-800">
              <p className="text-center font-semibold uppercase tracking-wide text-ink-700 dark:text-ink-700">
                Sprzeciw
              </p>
              <p className="text-center text-ink-500">od nakazu zapłaty w EPU</p>
              <Mono size="xs" tone="muted" className="block">
                Sygn. akt: Nc-e 4118723/24
              </Mono>
              <p className="mt-3 text-ink-700 dark:text-ink-700">
                Niniejszym, działając w imieniu własnym, wnoszę sprzeciw od nakazu zapłaty
                wydanego dnia 02.05.2026 r., zaskarżając go w&nbsp;całości.
              </p>
              <p className="text-ink-700 dark:text-ink-700">
                <span className="font-semibold text-ink-900 dark:text-ink-900">Zarzuty:</span> przedawnienie
                roszczenia (art. 118 k.c. — termin 3-letni dla świadczeń okresowych)…
              </p>
            </div>
            <div className="mt-auto flex items-center justify-between gap-2 pt-2">
              <Mono size="xs" tone="muted">
                Strona 1 z 4 · 14 cytatów
              </Mono>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-dlugomat-700 dark:text-dlugomat-300">
                Wyślij
                <ArrowRight className="size-3.5" aria-hidden />
              </span>
            </div>
          </div>
        </Surface>
      </div>

      <Text size="xs" tone="muted" className="mx-auto mt-10 max-w-2xl text-center">
        Każde pismo przechodzi walidację drugim modelem (Claude Haiku 4.5) i&nbsp;kontrolę zgodności
        z&nbsp;KPC przed pokazaniem użytkownikowi. Nigdy nie pokazujemy „surowego" outputu.
      </Text>
    </Section>
  );
}

// =========================================================================
// ColumnHeader — wspólny pasek nagłówka kolumny (window-chrome look)
// =========================================================================

function ColumnHeader({
  icon,
  tone,
  label,
  badge,
}: {
  icon: React.ReactNode;
  tone: "neutral" | "brand" | "success";
  label: string;
  badge?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-ink-200 bg-ink-50 px-4 py-2.5 dark:border-ink-200 dark:bg-ink-100">
      <span className="inline-flex items-center gap-2">
        <span
          className={
            tone === "brand"
              ? "text-dlugomat-700 dark:text-dlugomat-300"
              : tone === "success"
                ? "text-accent-700 dark:text-accent-300"
                : "text-ink-500"
          }
        >
          {icon}
        </span>
        <Eyebrow tone={tone === "neutral" ? "neutral" : tone}>{label}</Eyebrow>
      </span>
      {badge}
    </div>
  );
}
