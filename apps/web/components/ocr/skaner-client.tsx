"use client";

/**
 * SkanerClient — client wrapper dla strony /panel/skaner (D1 Skaner Nakazu).
 *
 * Odpowiedzialność:
 *   - Trzyma stan ostatniego wyniku OCR (per sesja)
 *   - Pokazuje OcrDropzone gdy brak wyniku
 *   - Pokazuje OcrReviewPanel gdy wynik jest dostępny
 *   - Pozwala wybrać typ sprawy ręcznie (jeżeli sniffer się pomylił)
 *
 * D1 jest darmowy — celowo NIE pobieramy tu opłaty. Cena zostaje dopiero
 * na finalnym pismie (D2 = sprzeciw EPU = 149 zł, D5 = BIK-Fix = 99 zł).
 * Skaner ma być punktem wejścia: user wrzuca skan → my mówimy "to jest
 * nakaz EPU, oto co możesz z tym zrobić", bez ściągania kasy za sam skan.
 */
import { useState } from "react";
import { ScanLine, Lock, Wifi } from "lucide-react";

import { OcrDropzone } from "./ocr-dropzone";
import { OcrReviewPanel } from "./ocr-review-panel";
import type { OcrIntent, OcrPipelineResult } from "@/lib/ocr/ocr-types";

type ForceCaseType = "sprzeciw_epu" | "komornik_skarga" | "bik_reklamacja_bank";

const FORCE_OPTIONS: Array<{
  value: ForceCaseType;
  label: string;
  intent: OcrIntent;
}> = [
  { value: "sprzeciw_epu", label: "Nakaz zapłaty → Sprzeciw EPU (D2)", intent: "nakaz_zaplaty" },
  { value: "komornik_skarga", label: "Pismo komornika → Skarga (D3)", intent: "pismo_komornika" },
  { value: "bik_reklamacja_bank", label: "Wpis BIK → Reklamacja (D5)", intent: "raport_bik" },
];

export function SkanerClient() {
  const [result, setResult] = useState<OcrPipelineResult | null>(null);
  const [forced, setForced] = useState<ForceCaseType | undefined>(undefined);
  const [intentHint, setIntentHint] = useState<OcrIntent>("unknown");

  return (
    <div className="space-y-6">
      {/* Wskazówka — wybór typu (opcjonalny override) */}
      {!result && (
        <div className="rounded-2xl border border-shield-100 bg-white p-5">
          <h2 className="flex items-center gap-2 text-sm font-medium text-shield-700">
            <ScanLine className="h-4 w-4" aria-hidden />
            Wybierz typ dokumentu (opcjonalnie)
          </h2>
          <p className="mt-1 text-xs text-iron-600">
            Jeśli wiesz, jaki dokument skanujesz — zaznacz to tutaj. Pomaga to
            naszemu parserowi. Jeśli nie wiesz — zostaw "Wykryj automatycznie",
            poradzimy sobie.
          </p>

          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <IntentChip
              label="Wykryj automatycznie"
              active={intentHint === "unknown"}
              onClick={() => {
                setIntentHint("unknown");
                setForced(undefined);
              }}
            />
            {FORCE_OPTIONS.map((opt) => (
              <IntentChip
                key={opt.value}
                label={opt.label}
                active={intentHint === opt.intent}
                onClick={() => {
                  setIntentHint(opt.intent);
                  setForced(opt.value);
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Dropzone */}
      {!result && (
        <OcrDropzone
          intentHint={intentHint}
          onResult={(r) => setResult(r)}
          ctaText="Przeciągnij skan tutaj — albo kliknij, by wybrać"
        />
      )}

      {/* Privacy reassurance — Tarcza */}
      {!result && (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <PrivacyTile
            icon={<Lock className="h-4 w-4 text-shield-600" aria-hidden />}
            title="OCR lokalnie w przeglądarce"
            body="Tekst rozpoznawany jest na Twoim urządzeniu — PESEL nie opuszcza go w trakcie analizy."
          />
          <PrivacyTile
            icon={<Wifi className="h-4 w-4 text-shield-600" aria-hidden />}
            title="Skan szyfrowany"
            body="Plik trafia do prywatnego bucketa Supabase — widzisz go tylko Ty."
          />
          <PrivacyTile
            icon={<ScanLine className="h-4 w-4 text-shield-600" aria-hidden />}
            title="Skan jest darmowy"
            body="D1 Skaner Nakazu nie ma opłat. Płacisz dopiero za gotowe pismo (jeśli zdecydujesz się je wygenerować)."
          />
        </ul>
      )}

      {/* Review */}
      {result && (
        <div className="rounded-2xl border border-shield-100 bg-white p-5">
          <OcrReviewPanel result={result} forceCaseType={forced} />
          <div className="mt-4 border-t border-shield-50 pt-3 text-right">
            <button
              type="button"
              onClick={() => setResult(null)}
              className="text-xs font-medium text-shield-700 underline-offset-2 hover:underline"
            >
              Wczytaj inny skan
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// -----------------------------------------------------------------------------
// Subcomponents
// -----------------------------------------------------------------------------
function IntentChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
        active
          ? "border-shield-500 bg-shield-50 text-shield-900"
          : "border-iron-200 bg-white text-iron-800 hover:border-shield-300 hover:bg-shield-50/40"
      }`}
    >
      {label}
    </button>
  );
}

function PrivacyTile({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <li className="rounded-xl border border-shield-100 bg-shield-50/30 p-4">
      <div className="flex items-center gap-2 text-sm font-medium text-shield-900">
        {icon}
        {title}
      </div>
      <p className="mt-1 text-xs leading-relaxed text-iron-700">{body}</p>
    </li>
  );
}
