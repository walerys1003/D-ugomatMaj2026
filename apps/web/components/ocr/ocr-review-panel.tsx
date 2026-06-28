"use client";

/**
 * OcrReviewPanel — pokazuje wynik OCR + parsing po skanie.
 *
 * Tarcza:
 *   - Pokazuje wszystkie wykryte pola jasno, edytowalne via "Popraw" CTA.
 *   - PESEL maskowany (XXX*****1234) — kliknięcie "Pokaż" odsłania.
 *   - Confidence < 80% → spokojna informacja "Sprawdź dokładnie pola — skan był słabszej jakości"
 *   - CTA: "Przejdź do kreatora" → tworzy sprawę z pre-fillem.
 */
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff, AlertCircle, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { maskPesel } from "@/lib/ocr/parsers/common";
import { createCaseFromOcrAction } from "@/lib/ocr/ocr-actions";
import { useCsrfToken } from "@/lib/security/use-csrf";
import type {
  OcrPipelineResult,
  ParsedDocument,
  NakazParsed,
  KomornikParsed,
  BikParsed,
} from "@/lib/ocr/ocr-types";

interface OcrReviewPanelProps {
  result: OcrPipelineResult;
  /** Wymuś typ sprawy (override sniffera). */
  forceCaseType?: "sprzeciw_epu" | "komornik_skarga" | "bik_reklamacja_bank";
}

export function OcrReviewPanel({ result, forceCaseType }: OcrReviewPanelProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const csrf = useCsrfToken();

  const { parsed } = result;
  const lowConfidence = (result.confidence ?? 0) < 80;

  const handleStartCase = () => {
    setError(null);
    if (!csrf) {
      setError("Inicjalizacja sesji — odśwież stronę i spróbuj ponownie.");
      return;
    }
    startTransition(async () => {
      try {
        // Tier 5 zad. 203 — CSRF token do server action.
        const r = await createCaseFromOcrAction({
          ocrResultId: result.ocrResultId,
          forceCaseType,
          csrf,
        });
        router.push(r.redirectTo);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      }
    });
  };

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-sm font-medium text-shield-700">
          <Sparkles className="h-4 w-4" aria-hidden />
          Wynik analizy skanu
        </div>
        <h2 className="text-xl font-semibold text-shield-950">
          {humanIntent(parsed.intent)}
        </h2>
        <div className="flex flex-wrap items-center gap-3 text-xs text-ink-600">
          <span>
            OCR: <strong>{result.provider}</strong>
          </span>
          <span>
            Pewność: <strong className="font-mono tabular-nums">
              {Math.round(result.confidence)}%
            </strong>
          </span>
          {parsed.intent !== "unknown" && (
            <span>
              Kompletność danych:{" "}
              <strong className="font-mono tabular-nums">
                {(parsed as { completeness?: number }).completeness ?? 0}%
              </strong>
            </span>
          )}
        </div>
      </header>

      {lowConfidence && (
        <div
          role="alert"
          className="flex gap-3 rounded-lg border border-temporal-amber-200 bg-temporal-amber-50/70 p-3 text-sm"
        >
          <AlertCircle
            className="h-5 w-5 shrink-0 text-temporal-amber-700"
            aria-hidden
          />
          <p className="text-ink-800">
            Skan był słabszej jakości. Sprawdź dokładnie wszystkie pola
            i popraw je w kreatorze, jeżeli to konieczne.
          </p>
        </div>
      )}

      <ParsedFields parsed={parsed} />

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-temporal-red-200 bg-temporal-red-50 p-3 text-sm text-temporal-red-800"
        >
          {error}
        </div>
      )}

      <div className="flex flex-col gap-2 border-t border-shield-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-ink-600">
          Potwierdzasz, że dane będą używane wyłącznie do przygotowania pisma.
          Pełne wartości (np. PESEL) nie opuszczają Twojego konta.
        </p>
        <Button
          onClick={handleStartCase}
          disabled={isPending}
          className="self-end sm:self-auto"
        >
          {isPending ? "Tworzę sprawę…" : "Przejdź do kreatora"}
          <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
        </Button>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// ParsedFields — domain-aware listing
// -----------------------------------------------------------------------------
function ParsedFields({ parsed }: { parsed: ParsedDocument }) {
  if (parsed.intent === "nakaz_zaplaty") return <NakazFields p={parsed} />;
  if (parsed.intent === "pismo_komornika") return <KomornikFields p={parsed} />;
  if (parsed.intent === "raport_bik") return <BikFields p={parsed} />;
  return (
    <div className="rounded-lg border border-ink-200 bg-ink-50/60 p-4 text-sm">
      <p className="font-medium text-ink-900">
        Nie udało się rozpoznać typu dokumentu.
      </p>
      <ul className="mt-2 list-disc pl-5 text-ink-700">
        {parsed.hints.map((h, i) => (
          <li key={i}>{h}</li>
        ))}
      </ul>
    </div>
  );
}

function NakazFields({ p }: { p: NakazParsed }) {
  return (
    <dl className="grid grid-cols-1 gap-3 rounded-xl border border-shield-100 bg-white p-4 sm:grid-cols-2">
      <Field label="Sygnatura" value={p.sygnatura} />
      <Field label="Sąd" value={p.sad} />
      <Field label="Data nakazu" value={p.data_nakazu} />
      <Field label="Data doręczenia" value={p.data_doreczenia} />
      <Field label="Powód" value={p.powod_nazwa} />
      <Field label="Adres powoda" value={p.powod_adres} />
      <Field label="Pozwany" value={p.pozwany_nazwa} />
      <Field label="Adres pozwanego" value={p.pozwany_adres} />
      <PeselField pesel={p.pozwany_pesel} />
      <Field
        label="Należność główna"
        value={p.kwota_glowna != null ? formatPln(p.kwota_glowna) : null}
      />
      <Field
        label="Odsetki"
        value={p.kwota_odsetki != null ? formatPln(p.kwota_odsetki) : null}
      />
      <Field
        label="Koszty"
        value={p.kwota_koszty != null ? formatPln(p.kwota_koszty) : null}
      />
      <Field
        label="WPS razem"
        value={p.kwota_razem != null ? formatPln(p.kwota_razem) : null}
        emphasize
      />
    </dl>
  );
}

function KomornikFields({ p }: { p: KomornikParsed }) {
  return (
    <dl className="grid grid-cols-1 gap-3 rounded-xl border border-shield-100 bg-white p-4 sm:grid-cols-2">
      <Field label="Kancelaria komornicza" value={p.kancelaria_nazwa} />
      <Field label="Adres" value={p.kancelaria_adres} />
      <Field label="Sygnatura Km" value={p.sygnatura_km} />
      <Field label="Wierzyciel" value={p.wierzyciel} />
      <Field label="Typ zajęcia" value={humanZajecie(p.zajecie_typ)} />
      <Field
        label="Kwota dochodzona"
        value={
          p.kwota_dochodzona != null ? formatPln(p.kwota_dochodzona) : null
        }
        emphasize
      />
      <Field label="Data pisma" value={p.data_pisma} />
      <PeselField pesel={p.dluznik_pesel} />
    </dl>
  );
}

function BikFields({ p }: { p: BikParsed }) {
  return (
    <dl className="grid grid-cols-1 gap-3 rounded-xl border border-shield-100 bg-white p-4 sm:grid-cols-2">
      <Field label="Bank" value={p.bank_nazwa} />
      <Field label="Numer umowy" value={p.numer_umowy} />
      <Field
        label="Kwota kredytu / saldo"
        value={p.kwota_kredytu != null ? formatPln(p.kwota_kredytu) : null}
        emphasize
      />
      <Field label="Data wpisu" value={p.data_wpisu} />
      <Field label="Status" value={p.status_wpisu} />
      <Field
        label="Charakter nieprawidłowości"
        value={p.rodzaj_nieprawidlowosci}
        wide
      />
    </dl>
  );
}

function Field({
  label,
  value,
  emphasize,
  wide,
}: {
  label: string;
  value: string | null | undefined;
  emphasize?: boolean;
  wide?: boolean;
}) {
  const display = value ?? "—";
  return (
    <div className={cn("min-w-0", wide && "sm:col-span-2")}>
      <dt className="text-xs uppercase tracking-wide text-ink-500">
        {label}
      </dt>
      <dd
        className={cn(
          "mt-0.5 break-words text-sm text-shield-900",
          emphasize && "font-semibold tabular-nums",
          !value && "italic text-ink-400",
        )}
      >
        {display}
      </dd>
    </div>
  );
}

function PeselField({ pesel }: { pesel: string | null }) {
  const [show, setShow] = useState(false);
  if (!pesel) return <Field label="PESEL" value={null} />;
  return (
    <div className="min-w-0">
      <dt className="text-xs uppercase tracking-wide text-ink-500">PESEL</dt>
      <dd className="mt-0.5 flex items-center gap-2">
        <span className="font-mono tabular-nums text-sm text-shield-900">
          {show ? pesel : maskPesel(pesel)}
        </span>
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "Ukryj PESEL" : "Pokaż PESEL"}
          className="rounded p-1 text-ink-500 hover:bg-shield-50 hover:text-shield-700"
        >
          {show ? (
            <EyeOff className="h-3.5 w-3.5" />
          ) : (
            <Eye className="h-3.5 w-3.5" />
          )}
        </button>
      </dd>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Display helpers
// -----------------------------------------------------------------------------
function humanIntent(intent: ParsedDocument["intent"]): string {
  switch (intent) {
    case "nakaz_zaplaty":
      return "Nakaz zapłaty (EPU)";
    case "pismo_komornika":
      return "Pismo komornika";
    case "raport_bik":
      return "Raport BIK / pismo dot. wpisu BIK";
    case "unknown":
    default:
      return "Dokument nierozpoznany";
  }
}

function humanZajecie(z: KomornikParsed["zajecie_typ"]): string | null {
  if (!z) return null;
  return {
    rachunek_bankowy: "Zajęcie rachunku bankowego",
    wynagrodzenie: "Zajęcie wynagrodzenia",
    swiadczenia: "Zajęcie świadczeń (emerytura/renta/zasiłek)",
    ruchomosci: "Zajęcie ruchomości",
    nieruchomosc: "Zajęcie nieruchomości",
    inne: "Inne zajęcie",
  }[z];
}

function formatPln(n: number): string {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}
