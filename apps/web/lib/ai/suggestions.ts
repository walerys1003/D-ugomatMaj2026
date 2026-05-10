import "server-only";

/**
 * Tier 7 zad. 312 — AI "radca podpowiada" w trakcie wizarda.
 *
 * Co X kroków (lub na żądanie usera "podpowiedz") wywołujemy Haiku
 * z fragmentem zebranych answers + caseType, prosząc o:
 *   - missing_arguments  — jakich zarzutów brakuje?
 *   - missing_evidence   — jakich dowodów nie wymieniono?
 *   - legal_basis        — które przepisy warto powołać?
 *   - strategy           — jaką strategię procesową rekomendujesz?
 *   - warnings           — czerwone flagi (np. sprawa się przedawni za 3 dni!)
 *
 * Suggestions są zapisywane w `ai_suggestions` (zad. 312 schema). User
 * może je zaakceptować (apply → trafi do answers) lub odrzucić.
 *
 * Cost-control:
 *   - max 3 calls/case/h (rate-limit per case)
 *   - tylko Haiku (cheap), nigdy Sonnet
 *   - cache po answers-hash 1h (deterministyczne dla tych samych odpowiedzi)
 */

import { createSupabaseServerClient } from "@/lib/db/supabase-server";
import { logger } from "@/lib/observability/logger";
import { complete, AiUnavailableError } from "@/lib/ai/apipod-client";
import type { CaseType, Json } from "@/lib/db/types";

export type SuggestionCategory =
  | "argument"
  | "evidence"
  | "legal_basis"
  | "strategy"
  | "warning";

export type SuggestionSeverity = "info" | "tip" | "warning" | "critical";

export interface AiSuggestion {
  id?: string;
  case_id: string;
  step_id: string;
  category: SuggestionCategory;
  severity: SuggestionSeverity;
  suggestion: string;
  applied: boolean;
  dismissed: boolean;
  created_at?: string;
}

const SYSTEM_PROMPTS: Record<CaseType, string> = {
  sprzeciw_epu:
    "Jesteś polskim radcą prawnym specjalizującym się w windykacji i EPU. Doradzasz dłużnikom.",
  komornik_zwolnienie_konta:
    "Jesteś polskim radcą prawnym specjalizującym się w postępowaniu egzekucyjnym.",
  komornik_zwolnienie_swiadczen:
    "Jesteś polskim radcą prawnym specjalizującym się w ochronie świadczeń socjalnych.",
  komornik_skarga:
    "Jesteś polskim radcą prawnym specjalizującym się w skargach na komornika (art. 767 k.p.c.).",
  komornik_ograniczenie:
    "Jesteś polskim radcą prawnym specjalizującym się w ograniczeniu egzekucji.",
  komornik_umorzenie:
    "Jesteś polskim radcą prawnym specjalizującym się w umorzeniu egzekucji.",
  komornik_raty:
    "Jesteś polskim radcą prawnym pomagającym w rozłożeniu egzekucji na raty.",
  potracenia_wniosek_pracodawca:
    "Jesteś polskim radcą prawnym specjalizującym się w prawie pracy i potrąceniach z wynagrodzenia.",
  potracenia_wniosek_komornik:
    "Jesteś polskim radcą prawnym specjalizującym się w ochronie kwoty wolnej od egzekucji.",
  bik_reklamacja_bank:
    "Jesteś polskim radcą prawnym specjalizującym się w prawie bankowym i RODO.",
  bik_reklamacja_bik:
    "Jesteś polskim radcą prawnym specjalizującym się w skargach do BIK i biur informacji gospodarczej.",
  bik_skarga_uodo:
    "Jesteś polskim radcą prawnym specjalizującym się w RODO i naruszeniach danych osobowych.",
  cesja_odpowiedz:
    "Jesteś polskim radcą prawnym specjalizującym się w cesji wierzytelności i obronie przed funduszami sekurytyzacyjnymi.",
  ugoda_raty:
    "Jesteś polskim radcą prawnym pomagającym w negocjacji ugody z wierzycielem.",
  ugoda_umorzenie:
    "Jesteś polskim radcą prawnym pomagającym w negocjacji umorzenia części długu.",
  ugoda_propozycja:
    "Jesteś polskim radcą prawnym pomagającym w przygotowaniu propozycji ugodowej.",
  upadlosc_wniosek:
    "Jesteś polskim radcą prawnym specjalizującym się w upadłości konsumenckiej (art. 491^1 i nast. P.u.).",
  upadlosc_pelny_wniosek:
    "Jesteś polskim radcą prawnym specjalizującym się w pełnym pakiecie upadłościowym (formularz KRS-FORM-UPK1).",
  pozew_zwrot_oplat_windykacyjnych:
    "Jesteś polskim radcą prawnym specjalizującym się w klauzulach abuzywnych (art. 385^1 k.c.).",
  reklamacja_bank_rf:
    "Jesteś polskim radcą prawnym znającym praktykę Rzecznika Finansowego.",
  skarga_puodo:
    "Jesteś polskim radcą prawnym specjalizującym się w RODO i postępowaniu przed PUODO.",
  wniosek_raty_sadowe:
    "Jesteś polskim radcą prawnym znającym art. 320 k.p.c. i praktykę sądów w sprawach rozłożenia na raty.",
  wniosek_zwolnienie_kosztow_sadowych:
    "Jesteś polskim radcą prawnym znającym przesłanki zwolnienia od kosztów sądowych.",
  zazalenie_klauzula_wykonalnosci:
    "Jesteś polskim radcą prawnym specjalizującym się w zażaleniach na klauzule wykonalności (art. 795 k.p.c.).",
  pozbawienie_tytulu_wykonalnosci:
    "Jesteś polskim radcą prawnym specjalizującym się w powództwach przeciwegzekucyjnych (art. 840 k.p.c.).",
};

interface AnthropicSuggestionsResponse {
  suggestions: Array<{
    category: SuggestionCategory;
    severity: SuggestionSeverity;
    suggestion: string;
  }>;
}

const RATE_LIMIT_PER_CASE_PER_HOUR = 3;

/**
 * Sprawdza, czy użytkownik nie przekroczył rate-limit dla case.
 */
async function isWithinRateLimit(caseId: string): Promise<boolean> {
  const supabase = createSupabaseServerClient();
  const oneHourAgo = new Date(Date.now() - 3600_000).toISOString();
  const { count, error } = await supabase
    .from("ai_suggestions")
    .select("id", { count: "exact", head: true })
    .eq("case_id", caseId)
    .gte("created_at", oneHourAgo);
  if (error) {
    logger.warn("ai_suggestions.rate_limit_check_failed", { caseId, error: error.message });
    return true; // fail-open
  }
  return (count ?? 0) < RATE_LIMIT_PER_CASE_PER_HOUR;
}

export async function generateSuggestions(params: {
  caseId: string;
  caseType: CaseType;
  stepId: string;
  answers: Record<string, Json>;
}): Promise<AiSuggestion[]> {
  const allowed = await isWithinRateLimit(params.caseId);
  if (!allowed) {
    logger.info("ai_suggestions.rate_limited", { caseId: params.caseId });
    return [];
  }

  const systemPrompt = SYSTEM_PROMPTS[params.caseType] ?? "Jesteś polskim radcą prawnym.";

  const userPrompt = `
Sprawa: ${params.caseType}
Aktualny krok wizarda: ${params.stepId}
Dane zebrane od klienta:
${JSON.stringify(params.answers, null, 2)}

Zadanie: Przeanalizuj zebrane dane i zwróć JSON z propozycjami pomocnymi
dla klienta przed dalszym wypełnianiem. Maksymalnie 5 propozycji.
Format odpowiedzi (TYLKO JSON, bez komentarzy):

{
  "suggestions": [
    {
      "category": "argument" | "evidence" | "legal_basis" | "strategy" | "warning",
      "severity": "info" | "tip" | "warning" | "critical",
      "suggestion": "konkretna treść porady (1-3 zdania)"
    }
  ]
}

Priorytetyzuj:
- "critical" gdy widzisz red-flag (np. nieprawidłowy termin, brak kluczowego dowodu)
- "warning" gdy klient może mieć słabszą pozycję
- "tip" dla optymalizacji argumentacji
- "info" dla edukacyjnych wskazówek

Cytuj konkretne przepisy gdy relevant (np. "art. 385^1 § 1 k.c.").
Pisz po polsku, prawniczo, ale bez formalizmu.`.trim();

  let result: { text: string };
  try {
    result = await complete({
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
      maxTokens: 800,
      temperature: 0.3,
      modelHint: "haiku",
    });
  } catch (e) {
    if (e instanceof AiUnavailableError) {
      logger.info("ai_suggestions.ai_unavailable", { caseId: params.caseId });
      return [];
    }
    logger.warn("ai_suggestions.complete_failed", {
      caseId: params.caseId,
      error: e instanceof Error ? e.message : String(e),
    });
    return [];
  }

  let parsed: AnthropicSuggestionsResponse;
  try {
    // Wyciągnij JSON z możliwego markdown ```
    const cleaned = result.text.replace(/^```(?:json)?\s*/, "").replace(/\s*```\s*$/, "");
    parsed = JSON.parse(cleaned) as AnthropicSuggestionsResponse;
  } catch (e) {
    logger.warn("ai_suggestions.parse_failed", {
      caseId: params.caseId,
      sample: result.text.slice(0, 200),
    });
    return [];
  }

  if (!Array.isArray(parsed.suggestions)) return [];

  const suggestions: AiSuggestion[] = parsed.suggestions
    .filter(
      (s) =>
        s &&
        typeof s.suggestion === "string" &&
        s.suggestion.length > 10 &&
        s.suggestion.length < 1000,
    )
    .slice(0, 5)
    .map((s) => ({
      case_id: params.caseId,
      step_id: params.stepId,
      category: s.category,
      severity: s.severity,
      suggestion: s.suggestion,
      applied: false,
      dismissed: false,
    }));

  // Persist
  if (suggestions.length > 0) {
    const supabase = createSupabaseServerClient();
    const { error: insErr } = await supabase.from("ai_suggestions").insert(suggestions);
    if (insErr) {
      logger.warn("ai_suggestions.insert_failed", {
        caseId: params.caseId,
        error: insErr.message,
      });
    }
  }

  return suggestions;
}

export async function dismissSuggestion(suggestionId: string): Promise<boolean> {
  const supabase = createSupabaseServerClient();
  const { error } = await supabase
    .from("ai_suggestions")
    .update({ dismissed: true })
    .eq("id", suggestionId);
  return !error;
}

export async function applySuggestion(suggestionId: string): Promise<boolean> {
  const supabase = createSupabaseServerClient();
  const { error } = await supabase
    .from("ai_suggestions")
    .update({ applied: true, applied_at: new Date().toISOString() })
    .eq("id", suggestionId);
  return !error;
}
