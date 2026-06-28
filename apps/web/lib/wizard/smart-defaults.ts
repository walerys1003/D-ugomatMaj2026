import "server-only";

/**
 * Tier 7 zad. 311 — Smart defaults w polach wizarda.
 *
 * Pre-populuje pola wizarda na podstawie:
 *   1. Profilu użytkownika (auth.users metadata: nazwisko, adres)
 *   2. Poprzednich spraw (case-level: powod_nazwa, sad — często ten sam)
 *   3. Heurystyk per-case-type (np. data nakazu = today-12d → 2 dni do terminu)
 *
 * Zasada: nigdy nie nadpisujemy answer'a, który już istnieje.
 * Defaultsy są **suggestions** — user widzi prefilled pole i może edytować.
 */

import type { CaseType, Json } from "@/lib/db/types";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";
import { logger } from "@/lib/observability/logger";

export interface SmartDefaultsResult {
  defaults: Record<string, Json>;
  source: Record<string, "profile" | "previous_case" | "heuristic">;
}

/**
 * Pobiera defaultsy dla nowego wizarda. Łączy kilka źródeł:
 *
 *  - profile  → personal_data, address (z cases.user_id LATEST 1)
 *  - history  → ostatnia sprawa tego samego typu od tego usera
 *  - heuristic → np. data_doreczenia ≈ today-12d dla EPU
 */
export async function getSmartDefaults(
  userId: string,
  caseType: CaseType,
): Promise<SmartDefaultsResult> {
  const defaults: Record<string, Json> = {};
  const source: Record<string, "profile" | "previous_case" | "heuristic"> = {};

  const supabase = createSupabaseServerClient();

  // 1) Profile-level defaults — z najnowszej sprawy
  try {
    const { data: latest } = await supabase
      .from("cases")
      .select("pozwany_nazwa,pozwany_adres,wizard_state,powod_nazwa,powod_adres")
      .eq("user_id", userId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (latest) {
      // pozwany_* to dane usera (jako pozwany w nakazie EPU)
      if (latest.pozwany_nazwa) {
        defaults.pozwany_nazwa = latest.pozwany_nazwa;
        source.pozwany_nazwa = "profile";
      }
      if (latest.pozwany_adres) {
        defaults.pozwany_adres = latest.pozwany_adres;
        source.pozwany_adres = "profile";
      }
    }
  } catch (e) {
    logger.warn("smart_defaults.profile_fetch_failed", {
      userId,
      error: e instanceof Error ? e.message : String(e),
    });
  }

  // 2) History-level defaults — z poprzedniej sprawy tego samego typu
  try {
    const { data: prev } = await supabase
      .from("cases")
      .select("powod_nazwa,powod_adres,sad,wizard_state")
      .eq("user_id", userId)
      .eq("type", caseType)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (prev) {
      if (prev.powod_nazwa && !defaults.powod_nazwa) {
        defaults.powod_nazwa = prev.powod_nazwa;
        source.powod_nazwa = "previous_case";
      }
      if (prev.powod_adres && !defaults.powod_adres) {
        defaults.powod_adres = prev.powod_adres;
        source.powod_adres = "previous_case";
      }
      if (prev.sad && !defaults.sad) {
        defaults.sad = prev.sad;
        source.sad = "previous_case";
      }

      // Wziąć z wizard_state.answers wybrane pola (preferencje)
      const answers =
        prev.wizard_state &&
        typeof prev.wizard_state === "object" &&
        "answers" in prev.wizard_state
          ? ((prev.wizard_state as { answers?: Record<string, Json> }).answers ?? {})
          : {};
      const reusable = [
        "want_rf_escalation",
        "preferred_contact",
        "phone_number",
      ];
      for (const k of reusable) {
        if (answers[k] !== undefined && defaults[k] === undefined) {
          defaults[k] = answers[k];
          source[k] = "previous_case";
        }
      }
    }
  } catch (e) {
    logger.warn("smart_defaults.history_fetch_failed", {
      userId,
      caseType,
      error: e instanceof Error ? e.message : String(e),
    });
  }

  // 3) Heuristic defaults per case-type
  applyHeuristics(caseType, defaults, source);

  return { defaults, source };
}

function applyHeuristics(
  caseType: CaseType,
  defaults: Record<string, Json>,
  source: Record<string, "profile" | "previous_case" | "heuristic">,
): void {
  const today = new Date();
  const isoDaysAgo = (n: number): string => {
    const d = new Date(today.getTime() - n * 86400_000);
    return d.toISOString().slice(0, 10);
  };

  switch (caseType) {
    case "sprzeciw_epu":
      // Heurystyka: użytkownik trafia do nas zwykle 10-12 dni od doręczenia
      if (defaults.data_doreczenia === undefined) {
        defaults.data_doreczenia = isoDaysAgo(11);
        source.data_doreczenia = "heuristic";
      }
      break;
    case "komornik_skarga":
      // 7 dni window — zakładamy 5 dni temu
      if (defaults.data_czynnosci === undefined) {
        defaults.data_czynnosci = isoDaysAgo(5);
        source.data_czynnosci = "heuristic";
      }
      break;
    case "wniosek_raty_sadowe":
    case "wniosek_zwolnienie_kosztow_sadowych":
      if (defaults.proposed_installments === undefined) {
        defaults.proposed_installments = 12;
        source.proposed_installments = "heuristic";
      }
      break;
    case "zazalenie_klauzula_wykonalnosci":
      // 7 dni window — zakładamy 3 dni temu
      if (defaults.data_klauzuli === undefined) {
        defaults.data_klauzuli = isoDaysAgo(3);
        source.data_klauzuli = "heuristic";
      }
      break;
    default:
      break;
  }
}
