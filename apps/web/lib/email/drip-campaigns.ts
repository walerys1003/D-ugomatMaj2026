/**
 * Długomat — Tier 8 — Lifecycle email drip campaigns.
 *
 * Sekwencje email-owe wyzwalane eventami:
 *  - "welcome"            → 0d, +1d, +3d, +7d (onboarding)
 *  - "abandoned_wizard"   → +1h (gentle), +24h (offer 10%), +72h (last call)
 *  - "deadline_reminder"  → 7d/3d/1d/24h przed terminem
 *  - "post_purchase"      → +1d (instructions), +7d (review request), +30d (next case prompt)
 *  - "win_back"           → 60d/90d/180d od ostatniej aktywności
 *  - "subscription_renewal" → 7d przed odnowieniem (z przypomnieniem o anulowaniu)
 *
 * Architektura:
 *  - `email_campaign_enrollments` — user × campaign + start_at + cancellation
 *  - `email_campaign_steps` — definicje (offset_days, template_key, conditions)
 *  - Cron job (co 1h) — wybiera due steps i wysyła przez `email-providers`
 *
 * Idempotency: unique on (enrollment_id, step_id) w `email_send_log`.
 */
import "server-only";
import { createSupabaseAdminClient } from "@/lib/db/supabase-server";

export type CampaignKey =
  | "welcome"
  | "abandoned_wizard"
  | "deadline_reminder"
  | "post_purchase"
  | "win_back"
  | "subscription_renewal"
  | "new_module_announcement";

export interface CampaignStep {
  step_id: string;
  campaign_key: CampaignKey;
  offset_minutes: number;
  template_key: string;
  subject_template: string;
  required_condition: string | null;
}

export const campaignSteps: Record<CampaignKey, CampaignStep[]> = {
  welcome: [
    {
      step_id: "welcome_0",
      campaign_key: "welcome",
      offset_minutes: 0,
      template_key: "welcome_intro",
      subject_template: "Witaj w Długomat — przewodnik startowy",
      required_condition: null,
    },
    {
      step_id: "welcome_1",
      campaign_key: "welcome",
      offset_minutes: 60 * 24,
      template_key: "welcome_first_case",
      subject_template: "Pierwsze pismo w 5 minut — krótki tutorial",
      required_condition: null,
    },
    {
      step_id: "welcome_3",
      campaign_key: "welcome",
      offset_minutes: 60 * 24 * 3,
      template_key: "welcome_features",
      subject_template: "5 funkcji, których jeszcze nie odkryłeś",
      required_condition: null,
    },
    {
      step_id: "welcome_7",
      campaign_key: "welcome",
      offset_minutes: 60 * 24 * 7,
      template_key: "welcome_review",
      subject_template: "Jak Ci się korzysta z Długomat? Oddaj głos",
      required_condition: null,
    },
  ],
  abandoned_wizard: [
    {
      step_id: "aban_1h",
      campaign_key: "abandoned_wizard",
      offset_minutes: 60,
      template_key: "abandoned_gentle",
      subject_template: "Dokończ swoje pismo — zostały tylko 2 pytania",
      required_condition: "wizard_in_progress",
    },
    {
      step_id: "aban_24h",
      campaign_key: "abandoned_wizard",
      offset_minutes: 60 * 24,
      template_key: "abandoned_offer",
      subject_template: "10% rabat na dokończenie pisma — kod ABANDON10",
      required_condition: "wizard_in_progress",
    },
    {
      step_id: "aban_72h",
      campaign_key: "abandoned_wizard",
      offset_minutes: 60 * 24 * 3,
      template_key: "abandoned_last_call",
      subject_template: "Twój wizard wygasa za 24h — dokończ teraz",
      required_condition: "wizard_in_progress",
    },
  ],
  deadline_reminder: [
    {
      step_id: "dl_7d",
      campaign_key: "deadline_reminder",
      offset_minutes: -60 * 24 * 7,
      template_key: "dl_7d",
      subject_template: "[Długomat] Termin za 7 dni — {{case_title}}",
      required_condition: "case_active",
    },
    {
      step_id: "dl_3d",
      campaign_key: "deadline_reminder",
      offset_minutes: -60 * 24 * 3,
      template_key: "dl_3d",
      subject_template: "[Długomat] Termin za 3 dni — {{case_title}}",
      required_condition: "case_active",
    },
    {
      step_id: "dl_1d",
      campaign_key: "deadline_reminder",
      offset_minutes: -60 * 24,
      template_key: "dl_1d",
      subject_template: "[PILNE] Termin jutro — {{case_title}}",
      required_condition: "case_active",
    },
    {
      step_id: "dl_24h",
      campaign_key: "deadline_reminder",
      offset_minutes: -60 * 24,
      template_key: "dl_24h",
      subject_template: "[OSTATNI DZIEŃ] {{case_title}}",
      required_condition: "case_active",
    },
  ],
  post_purchase: [
    {
      step_id: "post_1d",
      campaign_key: "post_purchase",
      offset_minutes: 60 * 24,
      template_key: "post_instructions",
      subject_template: "Co dalej z {{case_title}}? Twój checklist",
      required_condition: null,
    },
    {
      step_id: "post_7d",
      campaign_key: "post_purchase",
      offset_minutes: 60 * 24 * 7,
      template_key: "post_review",
      subject_template: "Jak poszło z {{case_title}}? Podziel się opinią",
      required_condition: null,
    },
    {
      step_id: "post_30d",
      campaign_key: "post_purchase",
      offset_minutes: 60 * 24 * 30,
      template_key: "post_next_case",
      subject_template: "Masz inną sprawę? -15% kodem WRACAM15",
      required_condition: null,
    },
  ],
  win_back: [
    {
      step_id: "wb_60d",
      campaign_key: "win_back",
      offset_minutes: 60 * 24 * 60,
      template_key: "wb_news",
      subject_template: "Co nowego w Długomat — od ostatniej wizyty",
      required_condition: "no_recent_activity",
    },
    {
      step_id: "wb_90d",
      campaign_key: "win_back",
      offset_minutes: 60 * 24 * 90,
      template_key: "wb_offer",
      subject_template: "20% rabat na powrót — kod COMEBACK20",
      required_condition: "no_recent_activity",
    },
  ],
  subscription_renewal: [
    {
      step_id: "ren_7d",
      campaign_key: "subscription_renewal",
      offset_minutes: -60 * 24 * 7,
      template_key: "ren_reminder",
      subject_template: "Twoja subskrypcja odnowi się za 7 dni",
      required_condition: "subscription_active",
    },
  ],
  new_module_announcement: [
    {
      step_id: "nm_0",
      campaign_key: "new_module_announcement",
      offset_minutes: 0,
      template_key: "new_module",
      subject_template: "Nowy moduł w Długomat: {{module_name}}",
      required_condition: null,
    },
  ],
};

export interface EnrollmentInput {
  userId: string;
  campaignKey: CampaignKey;
  startAt?: string;
  context?: Record<string, unknown>;
}

export async function enrollInCampaign(input: EnrollmentInput): Promise<string> {
  const supabase = createSupabaseAdminClient();
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;
  const startAt = input.startAt ?? new Date().toISOString();
  const { data, error } = await sb
    .from("email_campaign_enrollments")
    .upsert(
      {
        user_id: input.userId,
        campaign_key: input.campaignKey,
        start_at: startAt,
        context: input.context ?? {},
        status: "active",
      },
      { onConflict: "user_id,campaign_key,start_at", ignoreDuplicates: false },
    )
    .select("id")
    .single();
  if (error) throw error;
  return (data as { id: string }).id;
}

export async function cancelEnrollment(userId: string, campaignKey: CampaignKey): Promise<void> {
  const supabase = createSupabaseAdminClient();
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;
  await sb
    .from("email_campaign_enrollments")
    .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
    .eq("user_id", userId)
    .eq("campaign_key", campaignKey)
    .eq("status", "active");
}

/**
 * Cron-callable: znajduje due steps w aktywnych enrollment-ach i zwraca payloady
 * do wysłania (handler email-providers wysyła i loguje do email_send_log).
 */
export interface DueEmail {
  enrollmentId: string;
  userId: string;
  campaignKey: CampaignKey;
  stepId: string;
  templateKey: string;
  subject: string;
  context: Record<string, unknown>;
}

export async function getDueEmails(now: Date = new Date(), limit: number = 100): Promise<DueEmail[]> {
  const supabase = createSupabaseAdminClient();
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;
  const { data: enrollments } = await sb
    .from("email_campaign_enrollments")
    .select("id, user_id, campaign_key, start_at, context")
    .eq("status", "active")
    .limit(limit * 4);

  const due: DueEmail[] = [];
  for (const e of (enrollments as any[]) ?? []) {
    const steps = campaignSteps[e.campaign_key as CampaignKey] ?? [];
    const startMs = new Date(e.start_at).getTime();
    for (const step of steps) {
      const fireAt = startMs + step.offset_minutes * 60_000;
      if (fireAt > now.getTime()) continue;
      // Check not already sent
      const { data: already } = await sb
        .from("email_send_log")
        .select("id")
        .eq("enrollment_id", e.id)
        .eq("step_id", step.step_id)
        .maybeSingle();
      if (already) continue;
      due.push({
        enrollmentId: e.id,
        userId: e.user_id,
        campaignKey: e.campaign_key,
        stepId: step.step_id,
        templateKey: step.template_key,
        subject: renderTemplate(step.subject_template, e.context ?? {}),
        context: e.context ?? {},
      });
      if (due.length >= limit) break;
    }
    if (due.length >= limit) break;
  }
  return due;
}

export async function logEmailSent(
  enrollmentId: string,
  stepId: string,
  status: "sent" | "failed" | "skipped",
  detail?: string,
): Promise<void> {
  const supabase = createSupabaseAdminClient();
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;
  await sb.from("email_send_log").insert({
    enrollment_id: enrollmentId,
    step_id: stepId,
    status,
    detail: detail ?? null,
  });
}

function renderTemplate(template: string, ctx: Record<string, unknown>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => String(ctx[key] ?? ""));
}
