import Link from "next/link";
import { Sparkles, FileText, CheckCircle2, ArrowRight, Scan } from "lucide-react";

import { Section } from "@/components/ui/section";
import { Surface } from "@/components/ui/surface";
import { Badge } from "@/components/ui/badge";
import { Eyebrow, Heading, Text, Mono } from "@/components/ui/typography";

/**
 * AIShowcase v5 — "AI w pracy" zredukowane do jednej konwersacji.
 *
 * Vs v3 (audit V5 §3.6):
 *  - Z 3 kolumn (dokument → analiza → pismo) zostają tylko 2 (dokument
 *    + analiza). Trzecia kolumna (pismo) była redundantna względem
 *    hero-artifact, który już pokazuje sprzeciw. Powtórzenie = redundancja
 *    informacji = scroll fatigue.
 *  - Pod 2-panelowym mockupem ląduje pasek 3 walidacji
 *    (Haiku 4.5 / KPC / ISAP) — każdy z odznaką ✓. To bezpośredni dowód
 *    "jak działa kontrola jakości", którego brakowało.
 *  - Sekcja kończy się konkretnym CTA "Zeskanuj swój nakaz" — nie pozwala
 *    użytkownikowi "przewinąć dalej i zapomnieć". Showcase teraz prowadzi
 *    do akcji.
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

/**
 * Validation checkmarks shown directly below the mockup.
 * Each item is a concrete, technical guarantee — not marketing copy.
 */
const VALIDATIONS: ReadonlyArray<{ label: string; detail: string }> = [
  {
    label: "Walidator Haiku 4.5",
    detail:
      "Drugi model AI sprawdza kompletność i spójność pisma — zanim zobaczysz wynik.",
  },
  {
    label: "Zgodność z KPC",
    detail:
      "Każdy zarzut sprawdzany pod kątem aktualnej wersji Kodeksu postępowania cywilnego.",
  },
  {
    label: "Cytaty z ISAP",
    detail:
      "Powoływane orzeczenia pobierane z urzędowej bazy ISAP — bez halucynacji.",
  },
];

export function AIShowcase() {
  return (
    <Section
      tone="muted"
      density="regular"
      surface
      aria-labelledby="ai-showcase-title"
    >
      <header className="mx-auto max-w-2xl text-center">
        <Eyebrow tone="brand" withDot>
          AI w pracy
        </Eyebrow>
        <Heading
          level={1}
          id="ai-showcase-title"
          as="h2"
          className="mt-3"
        >
          Od skanu nakazu do diagnozy — w&nbsp;jednym oknie
        </Heading>
        <Text size="base" tone="muted" className="mt-4">
          AI Długomata nie pisze ogólników. Czyta każdy paragraf,
          sprawdza terminy w&nbsp;kalendarzu sądowym i&nbsp;wykrywa
          przedawnienie zanim klikniesz „dalej".
        </Text>
      </header>

      {/* 2-panel mockup — dokument po lewej, analiza po prawej. */}
      <div className="mt-14 grid gap-3 lg:grid-cols-2 lg:items-stretch">
        {/* DOKUMENT WEJŚCIOWY */}
        <Surface
          elevation="raised"
          padded="none"
          className="flex flex-col overflow-hidden"
        >
          <ColumnHeader
            icon={<FileText className="size-3.5" aria-hidden />}
            tone="neutral"
            label="Nakaz zapłaty (EPU)"
            badge={<Badge tone="neutral">PDF · 2 str.</Badge>}
          />
          <div className="flex flex-1 flex-col gap-3 p-5">
            <Mono size="xs" tone="muted">
              Sygn. akt:{" "}
              <span className="text-ink-800 dark:text-ink-800">
                Nc-e 4118723/24
              </span>
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
              Powód:{" "}
              <span className="text-ink-800 dark:text-ink-800">
                Ultimo Portfolio S.A.
              </span>
            </Mono>
            <Mono size="xs" tone="muted">
              Wierzytelność pierwotna:{" "}
              <span className="text-ink-800 dark:text-ink-800">
                Plus GSM (T-Mobile)
              </span>
            </Mono>
            <Mono size="xs" tone="muted" className="mt-auto pt-2">
              Doręczenie 27.05.2026 · zastępcze (art. 139 KPC)
            </Mono>
          </div>
        </Surface>

        {/* ANALIZA AI */}
        <Surface
          elevation="raised"
          padded="none"
          className="flex flex-col overflow-hidden"
        >
          <ColumnHeader
            icon={<Sparkles className="size-3.5" aria-hidden />}
            tone="brand"
            label="Analiza AI · 4,2 s"
            badge={
              <span className="inline-flex items-center gap-1">
                <span
                  aria-hidden
                  className="size-1.5 animate-pulse rounded-full bg-accent-500"
                />
                <Mono size="xs" tone="muted">
                  live
                </Mono>
              </span>
            }
          />
          <div className="flex flex-1 flex-col gap-3 p-5">
            <ul className="flex flex-col gap-3">
              {FINDINGS.map((f) => (
                <li key={f.label} className="flex items-start gap-2.5">
                  <Badge
                    tone={f.tone}
                    className="mt-0.5 shrink-0 capitalize"
                  >
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
                    <Text
                      size="sm"
                      tone="strong"
                      weight="medium"
                      as="div"
                    >
                      {f.label}
                    </Text>
                    <Text
                      size="xs"
                      tone="muted"
                      as="div"
                      className="mt-0.5"
                    >
                      {f.detail}
                    </Text>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </Surface>
      </div>

      {/* 3 walidacje — checkmark grid pod mockupem */}
      <ul className="mt-10 grid gap-4 sm:grid-cols-3">
        {VALIDATIONS.map((v) => (
          <li
            key={v.label}
            className="flex items-start gap-2.5 rounded-md border border-ink-200 bg-white p-4 dark:bg-card"
          >
            <CheckCircle2
              className="mt-0.5 size-4 shrink-0 text-accent-700"
              aria-hidden
            />
            <div className="min-w-0">
              <Text
                size="sm"
                tone="strong"
                weight="semibold"
                as="div"
              >
                {v.label}
              </Text>
              <Text
                size="xs"
                tone="muted"
                as="div"
                className="mt-1"
              >
                {v.detail}
              </Text>
            </div>
          </li>
        ))}
      </ul>

      {/* CTA do skanera — sekcja AI w pracy kończy się konkretną akcją. */}
      <div className="mx-auto mt-10 flex max-w-xl flex-col items-center gap-3 text-center">
        <Text size="sm" tone="muted">
          Chcesz zobaczyć to samo na swoim dokumencie? Skaner jest darmowy.
        </Text>
        <Link
          href="/skaner-nakazu"
          className="group inline-flex h-11 items-center justify-center gap-2 rounded-sm bg-ink-900 px-5 text-[14px] font-semibold text-white shadow-[inset_0_1px_0_0_hsl(0_0%_100%/0.12)] transition-all duration-150 ease-out hover:bg-ink-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-900 focus-visible:ring-offset-2"
        >
          <Scan className="size-4" aria-hidden />
          Zeskanuj swój nakaz
          <ArrowRight
            className="size-3.5 -mr-0.5 transition-transform duration-150 ease-out group-hover:translate-x-0.5"
            aria-hidden
          />
        </Link>
      </div>
    </Section>
  );
}

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
