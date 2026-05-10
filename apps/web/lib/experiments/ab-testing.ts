/**
 * Długomat — Tier 8 — A/B testing infrastructure.
 *
 * Lightweight experiments framework:
 *  - Definicja eksperymentu w `experiments` table (key, variants, traffic_split)
 *  - Przydzielenie variantu deterministycznie po hash(user_id|anon_id, exp_key)
 *  - Tracking events do `experiment_events` (variant exposure + conversions)
 *  - Statystyki: conversion rate per variant, lift, sample size, "winner" hint
 *
 * Use cases:
 *  - Pricing page (variant A: 4 plany | variant B: 3 plany + "Custom")
 *  - CTA copy (variant A: "Wygeneruj pismo" | variant B: "Zacznij za darmo")
 *  - Wizard structure (1-page vs multi-step)
 */
import "server-only";
import crypto from "node:crypto";
import { createSupabaseAdminClient } from "@/lib/db/supabase-server";

export interface Experiment {
  id: string;
  key: string;
  description: string;
  variants: string[]; // np. ["control", "variant_a", "variant_b"]
  traffic_split: number[]; // sums to 1.0; np. [0.5, 0.25, 0.25]
  status: "draft" | "running" | "paused" | "completed";
  primary_metric: string; // event_name treated as conversion
  started_at: string | null;
  ended_at: string | null;
  winner_variant: string | null;
}

export async function getExperiment(key: string): Promise<Experiment | null> {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("experiments")
    .select("*")
    .eq("key", key)
    .maybeSingle();
  return (data as Experiment) ?? null;
}

/**
 * Zwraca variant dla danego seed (user_id lub anon cookie).
 * Deterministyczne — ten sam seed → ten sam variant.
 */
export function assignVariant(
  experiment: Pick<Experiment, "variants" | "traffic_split" | "key">,
  seed: string,
): string {
  const hash = crypto.createHash("sha256").update(`${experiment.key}|${seed}`).digest();
  const bucket = hash.readUInt32BE(0) / 0xffffffff; // 0..1
  let acc = 0;
  for (let i = 0; i < experiment.variants.length; i += 1) {
    acc += experiment.traffic_split[i] ?? 0;
    if (bucket < acc) return experiment.variants[i];
  }
  return experiment.variants[experiment.variants.length - 1];
}

/**
 * Idempotentnie loguje exposure (pierwsze pokazanie variantu userowi).
 */
export async function recordExposure(
  experimentKey: string,
  variant: string,
  seed: string,
): Promise<void> {
  const supabase = createSupabaseAdminClient();
  await supabase.from("experiment_events").upsert(
    {
      experiment_key: experimentKey,
      variant,
      seed,
      event_type: "exposure",
    },
    { onConflict: "experiment_key,seed,event_type", ignoreDuplicates: true },
  );
}

export async function recordConversion(
  experimentKey: string,
  seed: string,
  metricName: string,
  metricValue: number = 1,
): Promise<void> {
  const supabase = createSupabaseAdminClient();
  // Find variant for this seed
  const { data: exposure } = await supabase
    .from("experiment_events")
    .select("variant")
    .eq("experiment_key", experimentKey)
    .eq("seed", seed)
    .eq("event_type", "exposure")
    .maybeSingle();
  if (!exposure) return; // no exposure yet, skip

  await supabase.from("experiment_events").insert({
    experiment_key: experimentKey,
    variant: (exposure as { variant: string }).variant,
    seed,
    event_type: "conversion",
    metric_name: metricName,
    metric_value: metricValue,
  });
}

export interface ExperimentResults {
  experiment: Experiment;
  variants: Array<{
    variant: string;
    exposures: number;
    conversions: number;
    conversionRate: number;
    lift: number; // vs control
    confidence: "low" | "medium" | "high";
  }>;
}

/**
 * Pomocniczo — oblicza wyniki dla eksperymentu (dla dashboardu admin).
 * Statystyka: prosty z-test dwóch proporcji (Wald). Confidence:
 *  - high: |z| > 2.0 + sample > 200/variant
 *  - medium: |z| > 1.5
 *  - low: pozostałe
 */
export async function computeResults(experimentKey: string): Promise<ExperimentResults | null> {
  const supabase = createSupabaseAdminClient();
  const exp = await getExperiment(experimentKey);
  if (!exp) return null;

  const { data: events } = await supabase
    .from("experiment_events")
    .select("variant, event_type")
    .eq("experiment_key", experimentKey);

  const counts = new Map<string, { exposures: number; conversions: number }>();
  for (const v of exp.variants) counts.set(v, { exposures: 0, conversions: 0 });
  for (const e of (events as Array<{ variant: string; event_type: string }>) ?? []) {
    const c = counts.get(e.variant);
    if (!c) continue;
    if (e.event_type === "exposure") c.exposures += 1;
    if (e.event_type === "conversion") c.conversions += 1;
  }

  const control = counts.get(exp.variants[0]);
  const controlRate = control && control.exposures > 0 ? control.conversions / control.exposures : 0;

  const variants = exp.variants.map((v) => {
    const c = counts.get(v) ?? { exposures: 0, conversions: 0 };
    const rate = c.exposures > 0 ? c.conversions / c.exposures : 0;
    const lift = controlRate > 0 ? (rate - controlRate) / controlRate : 0;
    const z = zScoreTwoProp(
      controlRate,
      control?.exposures ?? 0,
      rate,
      c.exposures,
    );
    const absZ = Math.abs(z);
    const confidence: "low" | "medium" | "high" =
      absZ > 2.0 && c.exposures > 200 ? "high" : absZ > 1.5 ? "medium" : "low";
    return {
      variant: v,
      exposures: c.exposures,
      conversions: c.conversions,
      conversionRate: rate,
      lift,
      confidence,
    };
  });

  return { experiment: exp, variants };
}

function zScoreTwoProp(p1: number, n1: number, p2: number, n2: number): number {
  if (n1 === 0 || n2 === 0) return 0;
  const p = (p1 * n1 + p2 * n2) / (n1 + n2);
  const se = Math.sqrt(p * (1 - p) * (1 / n1 + 1 / n2));
  if (se === 0) return 0;
  return (p2 - p1) / se;
}
