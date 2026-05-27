/**
 * Tier 33-3 — A/B test framework activation: katalog aktywnych eksperymentów.
 *
 * Rejestr live'owych eksperymentów wykorzystujących `experiment-engine.ts`.
 * Każdy eksperyment ma: hipotezę, warianty, metrykę celu, guardrails.
 *
 * Aktywacja: te eksperymenty są synchronizowane do tabeli `experiments`
 * przez `seedActiveExperiments()` (wywoływane raz przy deploy / przez admin UI).
 */
import type { Experiment, ExperimentVariant } from "./experiment-engine";

export interface ActiveExperimentDef {
  key: string;
  hypothesis: string;
  layer: string | null;
  traffic_percent: number;
  variants: ExperimentVariant[];
  control_variant: string;
  goal_event: string;
  guardrail_events: string[];
  min_sample_size: number;
  mde_percent: number;
  /** Czy eksperyment ma działać domyślnie po starcie. */
  auto_start: boolean;
  /** Opis dla admin UI. */
  description: string;
}

export const ACTIVE_EXPERIMENTS: ActiveExperimentDef[] = [
  {
    key: "pricing_page_hero_cta_2026q2",
    hypothesis:
      "Zmiana CTA z 'Rozpocznij za darmo' na 'Sprawdź swoją sprawę bezpłatnie' zwiększy conversion o ≥10%.",
    layer: "marketing_pages",
    traffic_percent: 50,
    variants: [
      { key: "control", weight: 50, payload: { cta_label: "Rozpocznij za darmo" } },
      {
        key: "variant_a",
        weight: 50,
        payload: { cta_label: "Sprawdź swoją sprawę bezpłatnie" },
      },
    ],
    control_variant: "control",
    goal_event: "pricing_cta_clicked",
    guardrail_events: ["bounce_rate_high"],
    min_sample_size: 1200,
    mde_percent: 10,
    auto_start: true,
    description: "Test wording na CTA strony cennika.",
  },
  {
    key: "onboarding_tour_required_2026q2",
    hypothesis:
      "Obowiązkowy onboarding tour (5 kroków) podniesie aktywację (≥1 case w 7 dni) o 15%.",
    layer: "onboarding",
    traffic_percent: 100,
    variants: [
      { key: "control", weight: 50, payload: { tour_required: false } },
      { key: "variant_required", weight: 50, payload: { tour_required: true } },
    ],
    control_variant: "control",
    goal_event: "first_case_created",
    guardrail_events: ["onboarding_abandoned", "support_ticket_opened"],
    min_sample_size: 2000,
    mde_percent: 15,
    auto_start: true,
    description: "Test obowiązkowości welcome tour.",
  },
  {
    key: "d1_scanner_pricing_2026q2",
    hypothesis:
      "Skaner D1 całkowicie darmowy (zamiast 1 darmowy + 9.99 zł kolejne) zwiększy aktywację o 25%.",
    layer: "pricing",
    traffic_percent: 30,
    variants: [
      { key: "control", weight: 50, payload: { d1_free_quota: 1, d1_paid_price_pln: 9.99 } },
      {
        key: "variant_unlimited_free",
        weight: 50,
        payload: { d1_free_quota: 999, d1_paid_price_pln: 0 },
      },
    ],
    control_variant: "control",
    goal_event: "first_case_created",
    guardrail_events: ["mrr_drop_alert"],
    min_sample_size: 800,
    mde_percent: 25,
    auto_start: false,
    description: "Test darmowy D1 vs freemium quota. NIE auto-start — wymaga zgody finansowej.",
  },
  {
    key: "subscription_billing_period_2026q2",
    hypothesis:
      "Roczny rabat 25% (vs miesięczny) podniesie LTV o ≥30% i obniży churn o ≥5pp.",
    layer: "pricing",
    traffic_percent: 50,
    variants: [
      { key: "control", weight: 50, payload: { annual_discount_pct: 15 } },
      { key: "variant_steeper", weight: 50, payload: { annual_discount_pct: 25 } },
    ],
    control_variant: "control",
    goal_event: "subscription_started_annual",
    guardrail_events: ["refund_requested"],
    min_sample_size: 600,
    mde_percent: 30,
    auto_start: true,
    description: "Test głębokości rabatu rocznego.",
  },
  {
    key: "email_subject_winback_2026q2",
    hypothesis:
      "Subject z emoji vs bez — emoji zwiększy open-rate o 5pp.",
    layer: "emails",
    traffic_percent: 100,
    variants: [
      { key: "control", weight: 50, payload: { use_emoji: false } },
      { key: "variant_emoji", weight: 50, payload: { use_emoji: true } },
    ],
    control_variant: "control",
    goal_event: "email_opened",
    guardrail_events: ["spam_marked"],
    min_sample_size: 1000,
    mde_percent: 5,
    auto_start: true,
    description: "Test emoji w subject win-back maili.",
  },
];

/**
 * Synchronizuj definicje do DB (upsert po `key`). Wywoływane przy deploy
 * lub ręcznie przez admin (POST /api/admin/experiments/sync).
 */
export async function seedActiveExperiments(opts?: {
  sb?: unknown;
}): Promise<{ inserted: number; updated: number; errors: number }> {
  const { createServerSupabase } = await import("@/lib/db/supabase-server");
  const sb = (opts?.sb as Awaited<ReturnType<typeof createServerSupabase>>) ??
    (await createServerSupabase());

  let inserted = 0;
  let updated = 0;
  let errors = 0;

  for (const def of ACTIVE_EXPERIMENTS) {
    const status = def.auto_start ? "running" : "draft";
    const { data: existing } = await sb
      .from("experiments")
      .select("id, status")
      .eq("key", def.key)
      .maybeSingle();

    const payload = {
      key: def.key,
      hypothesis: def.hypothesis,
      status: existing?.status ?? status,
      layer: def.layer,
      traffic_percent: def.traffic_percent,
      variants: def.variants,
      control_variant: def.control_variant,
      goal_event: def.goal_event,
      guardrail_events: def.guardrail_events,
      min_sample_size: def.min_sample_size,
      mde_percent: def.mde_percent,
      description: def.description,
      updated_at: new Date().toISOString(),
    };

    if (existing) {
      const { error } = await sb.from("experiments").update(payload).eq("id", existing.id);
      if (error) errors++;
      else updated++;
    } else {
      const { error } = await sb.from("experiments").insert({
        ...payload,
        started_at: def.auto_start ? new Date().toISOString() : null,
        created_at: new Date().toISOString(),
      });
      if (error) errors++;
      else inserted++;
    }
  }

  return { inserted, updated, errors };
}
