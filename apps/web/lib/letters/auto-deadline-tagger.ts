/**
 * Auto-tag deadline reminders from OCR'd letters — zad. 331
 *
 * Given a parsed letter (LetterParseResult), determines the legal deadline based
 * on letter kind + Polish procedure rules, and creates a deadline row + push reminder.
 *
 * Examples:
 *  - nakaz_zaplaty_e_sad → sprzeciw within 14 days
 *  - postanowienie_o_klauzuli → zażalenie within 7 days
 *  - wezwanie_do_zaplaty_bank → reklamacja within 30 days
 *  - wezwanie_do_zaplaty_komornik → skarga within 7 days
 */

import { getSupabaseAdmin } from "@/lib/db/supabase-admin";
import { logger } from "@/lib/observability/logger";
import { sendDeadlineReminder } from "@/lib/notifications/push-notifications";
import type { LetterKind } from "@/lib/ai/letter-ocr";

interface DeadlineRule {
  days: number;
  kind: string; // matches DeadlineKind
  title: string;
  description: string;
  /** Push reminders X days before due date. */
  reminders_days_before: number[];
}

// NOTE: typy `DeadlineRule.kind` używają etykiet legacy które wykraczają
// poza `DeadlineKind` z `lib/db/types.ts`. Tutaj traktujemy je jako
// human-readable identifiers reguły — nie są zapisywane jako enum w bazie.
const RULES: Record<LetterKind, DeadlineRule | null> = {
  nakaz_zaplaty_epu: {
    days: 14,
    kind: "sprzeciw_epu_14dni",
    title: "Sprzeciw od nakazu zapłaty (EPU)",
    description: "Termin 14 dni od doręczenia. Po tym terminie nakaz uprawomocni się.",
    reminders_days_before: [10, 5, 2, 1],
  },
  nakaz_zaplaty_zwykly: {
    days: 14,
    kind: "sprzeciw_14dni",
    title: "Sprzeciw od nakazu zapłaty",
    description: "Termin 14 dni od doręczenia.",
    reminders_days_before: [10, 5, 2, 1],
  },
  pozew: {
    days: 14,
    kind: "odpowiedz_na_pozew",
    title: "Odpowiedź na pozew",
    description: "Termin wyznaczony przez sąd (zwykle 14 dni).",
    reminders_days_before: [10, 5, 2, 1],
  },
  wezwanie_do_zaplaty: {
    days: 14,
    kind: "odpowiedz_na_wezwanie",
    title: "Odpowiedź na wezwanie do zapłaty",
    description: "Zwyczajowo 14 dni — sprawdź konkretne wezwanie. Bank ma 30 dni.",
    reminders_days_before: [7, 2],
  },
  pismo_komornika: {
    days: 7,
    kind: "skarga_komornik_7dni",
    title: "Skarga na czynności komornika",
    description: "Termin 7 dni od doręczenia / dokonania czynności.",
    reminders_days_before: [5, 3, 1],
  },
  postanowienie: {
    days: 7,
    kind: "zazalenie_7dni",
    title: "Zażalenie na postanowienie (np. nadanie klauzuli wykonalności)",
    description: "Krótki termin — 7 dni od doręczenia.",
    reminders_days_before: [5, 3, 1],
  },
  wyrok: {
    days: 7,
    kind: "wniosek_uzasadnienie_7dni",
    title: "Wniosek o sporządzenie uzasadnienia wyroku",
    description: "7 dni od ogłoszenia/doręczenia. Po tym terminie nie można już złożyć apelacji bez uzasadnienia.",
    reminders_days_before: [5, 3, 1],
  },
  // Bez sztywnej reguły deadline — caller decyduje na podstawie kontekstu.
  monit_windykatora: null,
  zawiadomienie_o_cesji: null,
  wpis_do_big: null,
  unknown: null,
};

export interface AutoTagInput {
  user_id: string;
  case_id: string;
  letter_kind: LetterKind;
  /** Doręczenie date (ISO). If absent, today is assumed. */
  data_doreczenia?: string;
  letter_title?: string;
}

export interface AutoTagResult {
  ok: boolean;
  deadline_id?: string;
  due_at?: string;
  days_remaining?: number;
  rule_applied?: string;
  reminders_scheduled: number;
  error?: string;
}

export async function autoTagDeadlineFromLetter(input: AutoTagInput): Promise<AutoTagResult> {
  const rule = RULES[input.letter_kind];
  if (!rule) {
    return { ok: false, error: "no_rule_for_kind", reminders_scheduled: 0 };
  }

  const baseDate = input.data_doreczenia ? new Date(input.data_doreczenia) : new Date();
  if (isNaN(baseDate.getTime())) {
    return { ok: false, error: "invalid_data_doreczenia", reminders_scheduled: 0 };
  }
  const dueAt = new Date(baseDate.getTime() + rule.days * 86_400_000);
  const days_remaining = Math.ceil((dueAt.getTime() - Date.now()) / 86_400_000);

  const supabase = getSupabaseAdmin();
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;
  const { data, error } = await sb
    .from("deadlines")
    .insert({
      user_id: input.user_id,
      case_id: input.case_id,
      kind: rule.kind,
      title: rule.title,
      description: rule.description,
      due_at: dueAt.toISOString(),
      source: "ocr_auto_tag",
    })
    .select("id")
    .single();
  if (error || !data) {
    logger.warn("auto_tag.insert_failed", { error: error?.message });
    return { ok: false, error: error?.message ?? "insert_failed", reminders_scheduled: 0 };
  }

  // Schedule push reminders (immediate notification + push for each reminder day)
  let scheduled = 0;
  try {
    if (days_remaining > 0) {
      await sendDeadlineReminder(input.user_id, {
        case_id: input.case_id,
        title: `${rule.title} — termin: ${dueAt.toLocaleDateString("pl-PL")}`,
        due_at: dueAt.toISOString(),
      });
      scheduled++;
    }
    // Persist scheduled reminders for the cron worker
    for (const daysBefore of rule.reminders_days_before) {
      const remindAt = new Date(dueAt.getTime() - daysBefore * 86_400_000);
      if (remindAt.getTime() <= Date.now()) continue;
      await sb.from("scheduled_reminders").insert({
        user_id: input.user_id,
        case_id: input.case_id,
        deadline_id: data.id,
        remind_at: remindAt.toISOString(),
        title: rule.title,
        days_before: daysBefore,
      }).then(() => { scheduled++; }, () => {});
    }
  } catch (err) {
    logger.warn("auto_tag.reminder_failed", { error: (err as Error).message });
  }

  return {
    ok: true,
    deadline_id: data.id,
    due_at: dueAt.toISOString(),
    days_remaining,
    rule_applied: rule.kind,
    reminders_scheduled: scheduled,
  };
}
