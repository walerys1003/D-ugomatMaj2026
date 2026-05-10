import "server-only";

/**
 * Onboarding email sequence scheduler — zad. 243.
 *
 * Po rejestracji użytkownika tworzymy 5 zaplanowanych powiadomień
 * (status='scheduled', scheduled_for=registration+offset). Cron
 * (`/api/cron/onboarding`) wybiera te które są `due` (scheduled_for <= now)
 * i wysyła przez `dispatchNotification()`.
 *
 * Deduplication:
 *   - Używamy unikalnego dedupKey `onboarding:${userId}:${day}` per row.
 *   - Idempotency check w `dispatchNotification` zapobiega podwójnym wysyłkom
 *     przy retry CRON-a.
 *   - Funkcja `enrollUserInOnboarding()` przed insertem sprawdza czy user
 *     już ma dany template w notifications — jeśli tak, skip (re-entrant safe).
 */

import { createSupabaseAdminClient } from "@/lib/db/supabase-server";
import { dispatchNotification } from "./dispatch";
import type { EmailTemplateKey } from "./types";

export interface OnboardingStep {
  day: 1 | 3 | 7 | 14 | 30;
  template: Extract<
    EmailTemplateKey,
    | "onboarding_day1"
    | "onboarding_day3"
    | "onboarding_day7"
    | "onboarding_day14"
    | "onboarding_day30"
  >;
  /** Offset w milisekundach od momentu rejestracji. */
  offsetMs: number;
}

const DAY_MS = 24 * 60 * 60 * 1000;

export const ONBOARDING_STEPS: OnboardingStep[] = [
  { day: 1, template: "onboarding_day1", offsetMs: 1 * DAY_MS },
  { day: 3, template: "onboarding_day3", offsetMs: 3 * DAY_MS },
  { day: 7, template: "onboarding_day7", offsetMs: 7 * DAY_MS },
  { day: 14, template: "onboarding_day14", offsetMs: 14 * DAY_MS },
  { day: 30, template: "onboarding_day30", offsetMs: 30 * DAY_MS },
];

export interface EnrollUserParams {
  userId: string;
  email: string;
  fullName?: string | null;
  /** Default = now(). Override dla backfillu. */
  registeredAt?: Date;
}

export interface EnrollResult {
  /** Liczba wstawionych nowych slotów. */
  enrolled: number;
  /** Liczba slotów które już istniały — pominięte. */
  skipped: number;
}

/**
 * Tworzy 5 zaplanowanych slotów onboardingowych dla nowego usera.
 * Idempotent — można wywołać wielokrotnie, dodatkowe sloty nie zostaną
 * zduplikowane.
 *
 * Wstawiamy bezpośrednio do `notifications` z status='scheduled' i
 * `scheduled_for` = registeredAt + offset. Body renderujemy lazily
 * w cron-dispatcherze (gdy znamy aktualny stan usera, np. czy już
 * stworzył sprawę).
 *
 * Pole `body_text` / `body_html` zostaje puste — flag `pending_render`
 * symbolizujemy przez NULL w body_text. Cron renderuje tuż przed
 * wysłaniem.
 */
export async function enrollUserInOnboarding(
  params: EnrollUserParams,
): Promise<EnrollResult> {
  const supabase = createSupabaseAdminClient();
  const registeredAt = params.registeredAt ?? new Date();

  // Sprawdź jakie templates user już ma — zapobiegamy duplikatom przy
  // wielokrotnym wywołaniu (np. trigger po każdym update profilu).
  const { data: existing } = await supabase
    .from("notifications")
    .select("template")
    .eq("user_id", params.userId)
    .in(
      "template",
      ONBOARDING_STEPS.map((s) => s.template),
    );

  const existingTemplates = new Set<string>(
    (existing ?? []).map((r: { template: string }) => r.template),
  );

  let enrolled = 0;
  let skipped = 0;

  const rows = ONBOARDING_STEPS.filter(
    (s) => !existingTemplates.has(s.template),
  ).map((s) => ({
    user_id: params.userId,
    case_id: null,
    deadline_id: null,
    channel: "email" as const,
    template: s.template,
    recipient: params.email,
    subject: null, // renderowane w cronie
    body_text: null,
    body_html: null,
    status: "scheduled" as const,
    scheduled_for: new Date(registeredAt.getTime() + s.offsetMs).toISOString(),
  }));

  skipped = ONBOARDING_STEPS.length - rows.length;

  if (rows.length > 0) {
    const { error } = await supabase.from("notifications").insert(rows);
    if (error) {
      throw new Error(
        `Onboarding enrollment failed: ${error.message}`,
      );
    }
    enrolled = rows.length;
  }

  return { enrolled, skipped };
}

export interface DispatchDueResult {
  picked: number;
  sent: number;
  failed: number;
  skipped: number;
}

/**
 * Wybiera onboarding-owe sloty które są due (scheduled_for <= now,
 * status='scheduled') i wysyła je przez `dispatchNotification`.
 *
 * Wywoływane przez `/api/cron/onboarding` raz na godzinę.
 *
 * Limit batch = 100 — wystarczająco dużo żeby pokryć typowy ruch,
 * a nie blokuje function timeout (60s).
 */
export async function dispatchDueOnboardingEmails(opts: {
  limit?: number;
  now?: Date;
} = {}): Promise<DispatchDueResult> {
  const supabase = createSupabaseAdminClient();
  const now = opts.now ?? new Date();
  const limit = Math.min(opts.limit ?? 100, 500);

  const onboardingTemplates = ONBOARDING_STEPS.map((s) => s.template);

  const { data: due, error } = await supabase
    .from("notifications")
    .select("id, user_id, template, recipient, scheduled_for")
    .eq("status", "scheduled")
    .eq("channel", "email")
    .in("template", onboardingTemplates)
    .lte("scheduled_for", now.toISOString())
    .order("scheduled_for", { ascending: true })
    .limit(limit);

  if (error) {
    throw new Error(`Onboarding cron query failed: ${error.message}`);
  }

  const rows = (due ?? []) as Array<{
    id: string;
    user_id: string;
    template: string;
    recipient: string;
    scheduled_for: string | null;
  }>;

  if (rows.length === 0) {
    return { picked: 0, sent: 0, failed: 0, skipped: 0 };
  }

  // Pobierz pełne imię z profili (do greetingu) — jednym zapytaniem.
  const userIds = Array.from(new Set(rows.map((r) => r.user_id)));
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name")
    .in("id", userIds);
  const nameById = new Map<string, string | null>();
  for (const p of (profiles ?? []) as Array<{
    id: string;
    full_name: string | null;
  }>) {
    nameById.set(p.id, p.full_name);
  }

  let sent = 0;
  let failed = 0;
  let skipped = 0;

  for (const row of rows) {
    // Mark "in flight" by ustawiając tymczasowy status — chroni przed
    // double-dispatch jeśli cron uruchomi się równolegle. Uwaga: idempotency
    // w `dispatchNotification` i tak zapobiegnie podwójnej wysyłce w obrębie
    // tego samego dnia — to tylko optymalizacja.
    const claim = await supabase
      .from("notifications")
      .update({ status: "scheduled" }) // no-op, ale późniejszy update potem ustawi sent
      .eq("id", row.id)
      .eq("status", "scheduled")
      .select("id")
      .maybeSingle();
    if (!claim.data) {
      skipped += 1;
      continue;
    }

    // Usuń pre-utworzony pusty wiersz — `dispatchNotification` stworzy własny
    // pełny rekord z body. Dzięki temu unikamy "podwójnego księgowania".
    await supabase.from("notifications").delete().eq("id", row.id);

    try {
      const fullName = nameById.get(row.user_id) ?? null;
      const result = await dispatchNotification(
        {
          channel: "email",
          template: row.template as EmailTemplateKey,
          recipient: row.recipient,
          userId: row.user_id,
          caseId: null,
          deadlineId: null,
          variables: {
            full_name: fullName ?? "",
            user_email: row.recipient,
          },
          scheduledFor: null, // wyślij teraz
        },
        {
          dedupKey: `onboarding:${row.user_id}:${row.template}`,
        },
      );
      if (result.status === "sent") {
        sent += 1;
      } else if (result.status === "failed") {
        failed += 1;
      } else {
        skipped += 1;
      }
    } catch {
      failed += 1;
      // Defense — re-insert "failed" placeholder, żeby nie zgubić śladu.
      await supabase.from("notifications").insert({
        user_id: row.user_id,
        case_id: null,
        deadline_id: null,
        channel: "email",
        template: row.template,
        recipient: row.recipient,
        subject: null,
        body_text: null,
        body_html: null,
        status: "failed",
        scheduled_for: row.scheduled_for,
        failed_at: new Date().toISOString(),
        failure_reason: "onboarding_dispatch_threw",
      });
    }
  }

  return { picked: rows.length, sent, failed, skipped };
}
