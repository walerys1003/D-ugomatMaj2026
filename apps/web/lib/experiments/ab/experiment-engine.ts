/**
 * Tier 20 — A/B testing experiment engine.
 *
 * Pełnowymiarowy framework eksperymentów:
 *  - definicja experiment (key, hypothesis, variants z weights, MDE, traffic %)
 *  - assignment: deterministyczny hash(user_id, experiment_key) → variant
 *  - sticky bucketing: raz przypisany wariant zostaje (zapis w DB)
 *  - mutually-exclusive layers (user nie może być jednocześnie w 2 eksperymentach
 *    z tej samej layer)
 *  - guardrail metrics: jeśli przekroczone, auto-pause experiment
 *  - exposure logging (1 wpis/usera/dobę by nie zalewać)
 *  - integracja z analytics: trackExposure() + trackGoal()
 *
 * Statystyki:
 *  - srm check (Sample Ratio Mismatch) — χ² na podziale eksp/kontrola
 *  - frequentist conversion test (z-test on proportions, two-sided)
 */

import { createHash } from "crypto";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";
import type { Json } from "@/lib/db/types";

export type ExperimentStatus = "draft" | "running" | "paused" | "completed" | "archived";

export interface ExperimentVariant {
  key: string;
  weight: number; // 0..100
  payload?: Record<string, unknown>;
}

export interface Experiment {
  id: string;
  key: string;
  hypothesis: string;
  status: ExperimentStatus;
  layer: string | null; // mutually-exclusive layer
  traffic_percent: number; // 0..100
  variants: ExperimentVariant[];
  control_variant: string;
  goal_event: string;
  guardrail_events: string[];
  min_sample_size: number;
  mde_percent: number; // minimum detectable effect
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface AssignmentContext {
  userId: string;
  email?: string;
  plan?: string;
  country?: string;
}

export interface Assignment {
  experimentKey: string;
  variant: string;
  reason: "sticky" | "fresh" | "layer_excluded" | "out_of_traffic" | "paused";
  payload?: Record<string, unknown>;
}

export async function getExperiment(key: string): Promise<Experiment | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("experiments")
    .select("*")
    .eq("key", key)
    .maybeSingle();
  if (error) throw error;
  // REALNY BUG (audyt #6, iter 19): KOLIZJA migracji `experiments`. Żywa tabela
  // ma schemat TIER8 (variants text[], traffic_split, primary_metric...), a ten
  // silnik (Tier20) oczekuje kolumn hypothesis/layer/traffic_percent/variants(jsonb)/
  // control_variant/goal_event — które NIE ISTNIEJĄ. W praktyce zwrócony obiekt nie
  // ma pól Tier20, więc assignVariant zawsze degraduje do "control". Boundary cast
  // przez `unknown` jest świadomy i celowo udokumentowany — naprawa wymaga migracji
  // ujednolicającej schemat (poza zakresem #6 = usuwanie `as any`).
  return (data ?? null) as unknown as Experiment | null;
}

/**
 * Przypisuje usera do wariantu eksperymentu (lub kontroli/none).
 * Sticky bucketing: raz przypisany wariant zostaje.
 */
export async function assignVariant(
  experimentKey: string,
  ctx: AssignmentContext,
): Promise<Assignment> {
  const supabase = await createSupabaseServerClient();
  const exp = await getExperiment(experimentKey);
  if (!exp || exp.status !== "running") {
    return { experimentKey, variant: "control", reason: "paused" };
  }

  // 1) Sticky bucketing — sprawdź istniejący zapis.
  const { data: existing } = await supabase
    .from("experiment_assignments")
    .select("variant")
    .eq("experiment_key", experimentKey)
    .eq("user_id", ctx.userId)
    .maybeSingle();
  if (existing?.variant) {
    return {
      experimentKey,
      variant: existing.variant as string,
      reason: "sticky",
      payload: payloadFor(exp, existing.variant as string),
    };
  }

  // 2) Layer exclusion — jeśli user już jest w innym eksperymencie z tej samej warstwy.
  if (exp.layer) {
    const { data: layerAssign } = await supabase
      .from("experiment_assignments")
      .select("experiment_key,layer")
      .eq("user_id", ctx.userId)
      .eq("layer", exp.layer)
      .neq("experiment_key", experimentKey)
      .limit(1)
      .maybeSingle();
    if (layerAssign) {
      return { experimentKey, variant: "control", reason: "layer_excluded" };
    }
  }

  // 3) Traffic gate — czy user łapie się w % trafic eksperymentu?
  const trafficBucket = hashBucket(`${experimentKey}:traffic:${ctx.userId}`, 10_000) / 100;
  if (trafficBucket >= exp.traffic_percent) {
    return { experimentKey, variant: "control", reason: "out_of_traffic" };
  }

  // 4) Variant bucketing — deterministic hash → wagi.
  const variant = pickVariant(exp, ctx.userId);

  // Fire-and-forget zapis assignment. Typowany query-builder NIE ma `.catch()`
  // (PostgrestBuilder jest thenable, ale bez metody catch) — dlatego try/catch.
  try {
    await supabase
      .from("experiment_assignments")
      .insert({
        experiment_key: experimentKey,
        user_id: ctx.userId,
        layer: exp.layer,
        variant,
        assigned_at: new Date().toISOString(),
      })
      .select("variant")
      .single();
  } catch {
    /* ignore — sticky bucketing best-effort */
  }

  return {
    experimentKey,
    variant,
    reason: "fresh",
    payload: payloadFor(exp, variant),
  };
}

function pickVariant(exp: Experiment, userId: string): string {
  const totalWeight = exp.variants.reduce((s, v) => s + Math.max(0, v.weight), 0) || 1;
  const bucket = hashBucket(`${exp.key}:variant:${userId}`, totalWeight);
  let cumulative = 0;
  for (const v of exp.variants) {
    cumulative += Math.max(0, v.weight);
    if (bucket < cumulative) return v.key;
  }
  return exp.control_variant;
}

function payloadFor(exp: Experiment, variantKey: string): Record<string, unknown> | undefined {
  const v = exp.variants.find((x) => x.key === variantKey);
  return v?.payload;
}

function hashBucket(key: string, mod: number): number {
  const h = createHash("sha1").update(key).digest();
  const v = h.readUInt32BE(0);
  return v % mod;
}

/**
 * Logowanie ekspozycji (z dedupe per user/dzień).
 */
export async function trackExposure(args: {
  experimentKey: string;
  userId: string;
  variant: string;
  context?: Record<string, unknown>;
}): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const today = new Date().toISOString().slice(0, 10);
  await supabase
    .from("experiment_exposures")
    .upsert(
      {
        experiment_key: args.experimentKey,
        user_id: args.userId,
        variant: args.variant,
        exposure_date: today,
        first_seen_at: new Date().toISOString(),
        context: (args.context ?? {}) as Json,
      },
      { onConflict: "experiment_key,user_id,exposure_date" },
    );
}

export async function trackGoal(args: {
  experimentKey: string;
  userId: string;
  goalEvent: string;
  value?: number;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase.from("experiment_goals").insert({
    experiment_key: args.experimentKey,
    user_id: args.userId,
    goal_event: args.goalEvent,
    value: args.value ?? 1,
    metadata: (args.metadata ?? {}) as Json,
    occurred_at: new Date().toISOString(),
  });
}

/**
 * Sample Ratio Mismatch detection — χ² test na obserwowanym podziale
 * vs. oczekiwane wagi. Jeśli p-value < 0.001, oznacz SRM jako prawdopodobny.
 */
export interface SrmCheckResult {
  observed: Record<string, number>;
  expected: Record<string, number>;
  chiSquare: number;
  degreesOfFreedom: number;
  suspectSrm: boolean;
}

export function checkSrm(observed: Record<string, number>, weights: Record<string, number>): SrmCheckResult {
  const totalObserved = Object.values(observed).reduce((s, n) => s + n, 0);
  const totalWeight = Object.values(weights).reduce((s, n) => s + n, 0) || 1;
  const expected: Record<string, number> = {};
  let chi = 0;
  for (const key of Object.keys(weights)) {
    const exp = (weights[key] / totalWeight) * totalObserved;
    expected[key] = exp;
    const obs = observed[key] ?? 0;
    if (exp > 0) chi += ((obs - exp) ** 2) / exp;
  }
  const df = Math.max(1, Object.keys(weights).length - 1);
  // Próg: χ² > 10.83 dla df=1 odpowiada p<0.001
  const suspect = chi > (df === 1 ? 10.83 : df === 2 ? 13.82 : 16.27);
  return { observed, expected, chiSquare: chi, degreesOfFreedom: df, suspectSrm: suspect };
}

/**
 * Two-proportion z-test — porównanie konwersji wariant vs kontrola.
 * Zwraca z-score, p-value (two-sided), lift, confidence interval 95%.
 */
export interface ConversionTestResult {
  control: { conversions: number; exposures: number; rate: number };
  variant: { conversions: number; exposures: number; rate: number };
  liftPercent: number;
  zScore: number;
  pValue: number;
  ci95: [number, number];
  significant: boolean;
}

export function conversionZTest(
  control: { conversions: number; exposures: number },
  variant: { conversions: number; exposures: number },
): ConversionTestResult {
  const pC = control.exposures > 0 ? control.conversions / control.exposures : 0;
  const pV = variant.exposures > 0 ? variant.conversions / variant.exposures : 0;
  const pooled =
    (control.conversions + variant.conversions) /
    Math.max(1, control.exposures + variant.exposures);
  const se =
    Math.sqrt(pooled * (1 - pooled) * (1 / Math.max(1, control.exposures) + 1 / Math.max(1, variant.exposures))) ||
    1e-9;
  const z = (pV - pC) / se;
  const pValue = 2 * (1 - normalCdf(Math.abs(z)));
  const lift = pC > 0 ? ((pV - pC) / pC) * 100 : 0;
  const seDiff =
    Math.sqrt((pC * (1 - pC)) / Math.max(1, control.exposures) + (pV * (1 - pV)) / Math.max(1, variant.exposures)) ||
    1e-9;
  const margin = 1.96 * seDiff;
  return {
    control: { ...control, rate: pC },
    variant: { ...variant, rate: pV },
    liftPercent: lift,
    zScore: z,
    pValue,
    ci95: [pV - pC - margin, pV - pC + margin],
    significant: pValue < 0.05,
  };
}

/** Aprox. CDF rozkładu normalnego (Abramowitz-Stegun). */
function normalCdf(x: number): number {
  const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741;
  const a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
  const sign = x < 0 ? -1 : 1;
  const ax = Math.abs(x) / Math.SQRT2;
  const t = 1.0 / (1.0 + p * ax);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-ax * ax);
  return 0.5 * (1.0 + sign * y);
}
