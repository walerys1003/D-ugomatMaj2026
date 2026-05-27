/**
 * /panel/skaner — D1 Skaner Nakazu (darmowy moduł).
 *
 * Server component — sprawdza auth, ładuje historię ostatnich skanów,
 * deleguje główną interakcję do `SkanerClient`.
 *
 * UX:
 *   1. Krótka introdukcja (Tarcza ton — spokój, brak panic-driven copy)
 *   2. Dropzone + opcjonalny override typu dokumentu
 *   3. Review screen po OCR
 *   4. Lista ostatnich skanów (do 10) z linkiem do sprawy (jeśli powiązany)
 *
 * NIE pobieramy tu opłat — D1 jest celowo darmowy.
 */
import Link from "next/link";
import { redirect } from "next/navigation";
import { ScanLine, History, ShieldCheck } from "lucide-react";

import { createSupabaseServerClient } from "@/lib/db/supabase-server";
import { SkanerClient } from "@/components/ocr/skaner-client";
import type { OcrResultRow, ParsedDocument } from "@/lib/db/types";
import type { OcrIntent } from "@/lib/ocr/ocr-types";

export const metadata = {
  title: "Skaner nakazu — Długomat",
  description:
    "Wgraj skan nakazu, pisma komornika lub raportu BIK — wyciągniemy dane i pokażemy, co możesz z tym zrobić.",
};

export const dynamic = "force-dynamic";

export default async function SkanerPage() {
  const supabase = createSupabaseServerClient();
  const { data: userResult } = await supabase.auth.getUser();
  if (!userResult.user) {
    redirect("/logowanie?next=/panel/skaner");
  }

  const { data: history } = await supabase
    .from("ocr_results")
    .select(
      "id, original_filename, provider, confidence, status, case_id, extracted_data, created_at",
    )
    .eq("user_id", userResult.user.id)
    .order("created_at", { ascending: false })
    .limit(10);

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <header className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-shield-600">
          <ScanLine className="h-4 w-4" aria-hidden />
          D1 — Skaner nakazu (darmowy)
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-shield-950 sm:text-4xl">
          Wrzuć skan — sprawdzimy, z czym masz do czynienia.
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-ink-700">
          Skaner rozpoznaje <strong>nakazy zapłaty (EPU)</strong>,{" "}
          <strong>pisma komorników</strong> i{" "}
          <strong>raporty BIK</strong>. Wyciągamy z nich kluczowe dane —
          sygnatura, kwota, daty, strony — i podpowiadamy, jakie pismo możesz
          przygotować w Długomacie.
        </p>
        <div className="flex items-center gap-2 rounded-lg border border-shield-100 bg-shield-50/40 px-3 py-2 text-xs text-shield-800">
          <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden />
          Skan jest darmowy. Płacisz dopiero, jeśli wygenerujesz gotowe pismo.
        </div>
      </header>

      <SkanerClient />

      {/* Historia skanów */}
      {history && history.length > 0 && (
        <section className="space-y-3 border-t border-shield-100 pt-6">
          <h2 className="flex items-center gap-2 text-base font-semibold text-shield-900">
            <History className="h-4 w-4 text-ink-500" aria-hidden />
            Ostatnie skany
          </h2>
          <ul className="divide-y divide-shield-100 rounded-xl border border-shield-100 bg-white">
            {history.map((row) => (
              <HistoryRow key={row.id} row={row} />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

// -----------------------------------------------------------------------------
// Internal — historia skanów
// -----------------------------------------------------------------------------
function HistoryRow({
  row,
}: {
  row: Pick<
    OcrResultRow,
    | "id"
    | "original_filename"
    | "provider"
    | "confidence"
    | "status"
    | "case_id"
    | "extracted_data"
    | "created_at"
  >;
}) {
  const extracted = (row.extracted_data as {
    intent?: OcrIntent;
    parsed?: ParsedDocument;
  }) ?? {};
  const intent = extracted.intent ?? "unknown";
  const conf = Math.round(row.confidence ?? 0);

  return (
    <li className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-shield-900">
          {row.original_filename}
        </p>
        <p className="text-xs text-ink-600">
          {humanIntent(intent)} &middot;{" "}
          <span className="font-mono tabular-nums">{conf}%</span> &middot;{" "}
          {formatDateTime(row.created_at)}
        </p>
      </div>
      <div className="flex items-center gap-3 text-xs">
        <span
          className={`rounded-full px-2 py-0.5 ${
            row.status === "completed"
              ? "bg-hope-50 text-hope-800"
              : row.status === "failed"
                ? "bg-temporal-red-50 text-temporal-red-700"
                : "bg-ink-100 text-ink-700"
          }`}
        >
          {row.status}
        </span>
        {row.case_id ? (
          <Link
            href={`/panel/sprawa/${row.case_id}`}
            className="font-medium text-shield-700 underline-offset-2 hover:underline"
          >
            Otwórz sprawę →
          </Link>
        ) : (
          <span className="text-ink-400">brak sprawy</span>
        )}
      </div>
    </li>
  );
}

function humanIntent(intent: OcrIntent): string {
  return (
    {
      nakaz_zaplaty: "Nakaz zapłaty (EPU)",
      pismo_komornika: "Pismo komornika",
      raport_bik: "Raport BIK",
      umowa_pozyczki: "Umowa pożyczki",
      pismo_sadowe: "Pismo sądowe",
      unknown: "Dokument",
    }[intent] ?? "Dokument"
  );
}

function formatDateTime(iso: string): string {
  try {
    return new Intl.DateTimeFormat("pl-PL", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}
