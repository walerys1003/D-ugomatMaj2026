import * as React from "react";
import { FileText, Scan, ShieldCheck, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Mono, Text } from "@/components/ui/typography";

/**
 * DocumentArtifact — kanoniczny „żywy artefakt" produktu (redesign 02 §5.2,
 * 03 §2 Hero, 04 §8 strona sprawy).
 *
 * Zamiast dekoracyjnej ilustracji pokazujemy REALNY widok pracy produktu:
 *  - panel SCAN: wyekstrahowane encje z nakazu (sygnatura, wierzyciel, kwota,
 *    termin) — dokładnie to, co zwraca `api/ai/ocr` (docs/redesign/01 §1.1)
 *  - panel DRAFT: fragment wygenerowanego pisma z cytatem przepisu — to, co
 *    zwraca `api/ai/generate` (01 §1.5)
 *
 * Buduje powagę i zaufanie lepiej niż grafika: „to wygląda jak prawdziwe
 * narzędzie kancelarii", nie jak landing startupu.
 *
 * Wyłącznie tokeny kanoniczne (02 §8): ink-*, dlugomat-*, accent-*, warn-*.
 * Zero iron-*, zero --v5-*.
 */

export interface ScanEntity {
  label: string;
  value: string;
  /** mono → renderuje wartość monospaced (sygnatura, kwota, ID) */
  mono?: boolean;
  /** tone steruje akcentem etykiety — warn dla terminu, brand dla kwoty */
  tone?: "default" | "brand" | "warn" | "success";
}

export interface DocumentArtifactProps {
  /** Encje pokazane w panelu skanera */
  entities?: ScanEntity[];
  /** Tytuł draftu pisma (np. „Sprzeciw od nakazu zapłaty") */
  draftTitle?: string;
  /** Akapity fragmentu pisma */
  draftParagraphs?: string[];
  className?: string;
}

const DEFAULT_ENTITIES: ScanEntity[] = [
  { label: "Sygnatura akt", value: "Nc-e 1234567/24", mono: true },
  { label: "Wierzyciel", value: "Fundusz Sekurytyzacyjny X" },
  { label: "Kwota roszczenia", value: "4 218,00 zł", mono: true, tone: "brand" },
  { label: "Termin sprzeciwu", value: "14 dni", mono: true, tone: "warn" },
];

const DEFAULT_PARAGRAPHS = [
  "Wnoszę sprzeciw od nakazu zapłaty w całości i zaskarżam go w punktach 1–2.",
  "Podnoszę zarzut przedawnienia roszczenia (art. 118 k.c.) — termin upłynął przed wniesieniem pozwu.",
  "Kwestionuję legitymację czynną powoda z tytułu cesji wierzytelności (art. 509 k.c.).",
];

const ENTITY_LABEL_TONE: Record<NonNullable<ScanEntity["tone"]>, string> = {
  default: "text-ink-500",
  brand: "text-dlugomat-700 dark:text-dlugomat-300",
  warn: "text-warn-600 dark:text-warn-500",
  success: "text-accent-700 dark:text-accent-300",
};

export function DocumentArtifact({
  entities = DEFAULT_ENTITIES,
  draftTitle = "Sprzeciw od nakazu zapłaty (EPU)",
  draftParagraphs = DEFAULT_PARAGRAPHS,
  className,
}: DocumentArtifactProps) {
  return (
    <div className={cn("relative", className)} aria-hidden="false">
      {/* Panel 1 — SKANER (z tyłu, lekko przesunięty) */}
      <div className="absolute -left-2 top-6 hidden w-[62%] rounded-lg border border-ink-200 bg-card shadow-md lg:block">
        <ArtifactHeader icon={Scan} label="Skaner nakazu" badge="OCR + AI" />
        <dl className="space-y-2.5 px-4 py-4">
          {entities.map((e) => (
            <div key={e.label} className="flex items-baseline justify-between gap-3">
              <dt
                className={cn(
                  "text-[12px] font-medium uppercase tracking-[0.04em]",
                  ENTITY_LABEL_TONE[e.tone ?? "default"]
                )}
              >
                {e.label}
              </dt>
              <dd className="min-w-0 text-right">
                {e.mono ? (
                  <Mono size="sm" tone="strong">
                    {e.value}
                  </Mono>
                ) : (
                  <span className="truncate text-[13px] font-medium text-ink-800">
                    {e.value}
                  </span>
                )}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Panel 2 — DRAFT PISMA (z przodu) */}
      <div className="relative ml-auto w-full rounded-lg border border-ink-200 bg-card shadow-lg lg:w-[72%]">
        <ArtifactHeader icon={FileText} label={draftTitle} badge="Gotowe" badgeTone="success" />
        <div className="space-y-3 px-4 py-4">
          {draftParagraphs.map((p, i) => (
            <Text key={i} size="sm" tone="default" className="leading-relaxed">
              {p}
            </Text>
          ))}
          <div className="mt-3 flex items-center gap-2 border-t border-ink-150 pt-3">
            <ShieldCheck className="size-3.5 text-accent-600" aria-hidden />
            <span className="text-[12px] font-medium text-ink-500">
              Cytaty zweryfikowane przez walidator (anty-halucynacja)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ArtifactHeader({
  icon: Icon,
  label,
  badge,
  badgeTone = "brand",
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  badge: string;
  badgeTone?: "brand" | "success";
}) {
  return (
    <div className="flex items-center justify-between gap-2 border-b border-ink-150 px-4 py-2.5">
      <span className="flex min-w-0 items-center gap-2">
        <Icon className="size-3.5 shrink-0 text-dlugomat-600" />
        <span className="truncate text-[12.5px] font-semibold text-ink-800">{label}</span>
      </span>
      <span
        className={cn(
          "inline-flex shrink-0 items-center gap-1 rounded-sm px-1.5 py-0.5 text-[10.5px] font-semibold uppercase tracking-wide",
          badgeTone === "success"
            ? "bg-accent-100 text-accent-700 dark:bg-accent-700/20 dark:text-accent-300"
            : "bg-dlugomat-100 text-dlugomat-700 dark:bg-dlugomat-700/20 dark:text-dlugomat-300"
        )}
      >
        {badgeTone === "success" ? <Check className="size-2.5" /> : null}
        {badge}
      </span>
    </div>
  );
}
