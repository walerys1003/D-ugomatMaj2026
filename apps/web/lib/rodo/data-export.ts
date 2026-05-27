"use server";

/**
 * RODO art. 20 — Prawo do przenoszenia danych.
 *
 * Server action: exportUserDataAction()
 *   1. Auth check (guardAction)
 *   2. Pobiera wszystkie wiersze user'a z tabel:
 *      profiles, cases, documents, document_versions, deadlines,
 *      ocr_results, payments, notifications, case_events, validation_runs
 *   3. Maskuje wrażliwe pola (PESEL → XXX*****1234, raw_text OCR)
 *   4. Zwraca strukturalny JSON gotowy do pobrania
 *
 * Format: JSON Schema-like, czytelny dla człowieka i maszyny.
 * Cel: user może przekazać paczkę innemu administratorowi.
 *
 * UWAGA: rate-limit 2 / 5 min — eksport jest drogi.
 */
import {
  ActionRateLimitError,
  ActionUnauthenticatedError,
  guardAction,
} from "@/lib/security/server-action-guard";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";
import { assertCsrfFromFormData } from "@/lib/security/csrf";

export interface UserDataExport {
  generated_at: string;
  format_version: 1;
  user_id: string;
  profile: Record<string, unknown> | null;
  cases: Record<string, unknown>[];
  documents: Record<string, unknown>[];
  document_versions: Record<string, unknown>[];
  deadlines: Record<string, unknown>[];
  ocr_results: Record<string, unknown>[];
  payments: Record<string, unknown>[];
  notifications: Record<string, unknown>[];
  case_events: Record<string, unknown>[];
  validation_runs: Record<string, unknown>[];
  /** Lista pól zamaskowanych (transparentność dla usera). */
  masked_fields: string[];
  /** Liczba rekordów per tabela — szybka inspekcja kompletności. */
  counts: Record<string, number>;
}

const maskPesel = (pesel: string | null | undefined) => {
  if (!pesel || pesel.length !== 11) return null;
  return `${pesel.slice(0, 3)}*****${pesel.slice(-4)}`;
};

const maskOcrText = (text: string | null | undefined) => {
  if (!text) return null;
  // OCR może zawierać PESEL/kwoty osób trzecich; ucinamy do 200 znaków +
  // markujemy że było skrócone.
  if (text.length <= 200) return text;
  return `${text.slice(0, 200)}… [skrócone w eksporcie — pełną treść mamy w Storage]`;
};

export async function exportUserDataAction(input: {
  csrf: string;
}): Promise<UserDataExport> {
  // Tier 5 zad. 203 — CSRF check (akcja drogie: query do 10 tabel).
  await assertCsrfFromFormData({ csrf: input.csrf });

  // Rate-limit: 2 eksporty / 5 min (custom — drogie zapytanie do 10 tabel).
  let userId: string;
  try {
    const guard = await guardAction({
      profile: "auth",
      key: "rodo.export",
      customConfig: { capacity: 2, refillPerSec: 2 / 300 },
    });
    userId = guard.userId!;
  } catch (e) {
    if (e instanceof ActionRateLimitError || e instanceof ActionUnauthenticatedError) {
      throw new Error(e.message);
    }
    throw e;
  }

  const supabase = createSupabaseServerClient();
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;

  // RLS sam ogranicza do user_id, ale dla pewności każde zapytanie
  // używa explicit `.eq('user_id', userId)` (defense in depth).
  const [
    profileRes,
    casesRes,
    documentsRes,
    deadlinesRes,
    ocrRes,
    paymentsRes,
    notificationsRes,
    caseEventsRes,
    validationRunsRes,
  ] = await Promise.all([
    sb.from("profiles").select("*").eq("id", userId).maybeSingle(),
    sb.from("cases").select("*").eq("user_id", userId),
    sb.from("documents").select("*").eq("user_id", userId),
    sb.from("deadlines").select("*").eq("user_id", userId),
    sb.from("ocr_results").select("*").eq("user_id", userId),
    sb.from("payments").select("*").eq("user_id", userId),
    sb.from("notifications").select("*").eq("user_id", userId),
    sb.from("case_events").select("*").eq("user_id", userId),
    sb.from("validation_runs").select("*").eq("user_id", userId),
  ]);

  // document_versions wymaga JOIN przez documents
  const documentIds = (documentsRes.data ?? []).map((d) => (d as { id: string }).id);
  const { data: documentVersions } =
    documentIds.length > 0
      ? await sb
          .from("document_versions")
          .select("*")
          .in("document_id", documentIds)
      : { data: [] };

  // -------------------------------------------------------------------
  // Maskowanie wrażliwych pól
  // -------------------------------------------------------------------
  const cases = (casesRes.data ?? []).map((c) => {
    const row = c as Record<string, unknown> & {
      pozwany_pesel_enc: string | null;
    };
    return {
      ...row,
      // pozwany_pesel_enc to ciphertext — w eksporcie zostawiamy info
      // bez wartości (user nie potrzebuje encrypted blob).
      pozwany_pesel_enc: row.pozwany_pesel_enc ? "[encrypted_at_rest]" : null,
    };
  });

  const ocrResults = (ocrRes.data ?? []).map((o) => {
    const row = o as Record<string, unknown> & { raw_text: string | null };
    return {
      ...row,
      raw_text: maskOcrText(row.raw_text),
    };
  });

  const profile = profileRes.data
    ? {
        ...(profileRes.data as Record<string, unknown>),
      }
    : null;

  const out: UserDataExport = {
    generated_at: new Date().toISOString(),
    format_version: 1,
    user_id: userId,
    profile,
    cases,
    documents: (documentsRes.data ?? []) as Record<string, unknown>[],
    document_versions: (documentVersions ?? []) as Record<string, unknown>[],
    deadlines: (deadlinesRes.data ?? []) as Record<string, unknown>[],
    ocr_results: ocrResults,
    payments: (paymentsRes.data ?? []) as Record<string, unknown>[],
    notifications: (notificationsRes.data ?? []) as Record<string, unknown>[],
    case_events: (caseEventsRes.data ?? []) as Record<string, unknown>[],
    validation_runs: (validationRunsRes.data ?? []) as Record<string, unknown>[],
    masked_fields: [
      "cases.pozwany_pesel_enc → '[encrypted_at_rest]' (klucz pozostaje w sejfie)",
      "ocr_results.raw_text → skracany do 200 znaków",
    ],
    counts: {
      cases: casesRes.data?.length ?? 0,
      documents: documentsRes.data?.length ?? 0,
      document_versions: documentVersions?.length ?? 0,
      deadlines: deadlinesRes.data?.length ?? 0,
      ocr_results: ocrRes.data?.length ?? 0,
      payments: paymentsRes.data?.length ?? 0,
      notifications: notificationsRes.data?.length ?? 0,
      case_events: caseEventsRes.data?.length ?? 0,
      validation_runs: validationRunsRes.data?.length ?? 0,
    },
  };

  // Ślad audytowy — eksport jest istotnym zdarzeniem (RODO art. 30).
  // Nie blokujemy odpowiedzi, jeśli logowanie zawiedzie.
  try {
    if (cases[0]) {
      const firstCaseId = (cases[0] as { id: string }).id;
      await sb.from("case_events").insert({
        case_id: firstCaseId,
        user_id: userId,
        actor: "user",
        event_type: "rodo_data_exported",
        metadata: {
          counts: out.counts,
          format_version: out.format_version,
        },
      });
    }
  } catch {
    /* best-effort */
  }

  return out;
}

/** Helper: pakuje export do Blob → JSON string + suggested filename. */
export async function exportUserDataAsJson(input: {
  csrf: string;
}): Promise<{
  json: string;
  filename: string;
}> {
  // Tier 5 zad. 203 — CSRF token przekazywany w dół do exportUserDataAction.
  const data = await exportUserDataAction({ csrf: input.csrf });
  const json = JSON.stringify(data, null, 2);
  const stamp = data.generated_at.slice(0, 10);
  const filename = `dlugomat_dane_${stamp}.json`;
  return { json, filename };
}
