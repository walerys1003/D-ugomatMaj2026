/**
 * Tier 6 zad. 254, 300 — SLO metrics & error budget burn rate.
 *
 * Liczy z `audit_log` + `web_vitals` + `notifications` + `ai_generation_runs`:
 *   - request_count, error_count (5xx), error_rate
 *   - p50/p95/p99 latencji generacji AI
 *   - availability (1 - error_rate)
 *   - error budget burn rate (SLO 99.9% = 0.1% błędów; burn = błędy_obecne / budżet)
 *
 * Wszystkie metryki "best-effort" — jeśli źródło nie istnieje, zwracamy null.
 */

import { createSupabaseAdminClient } from "@/lib/db/supabase-server";

export interface SloMetrics {
  window: { from: string; to: string; hours: number };
  request_count: number | null;
  error_count: number | null;
  error_rate: number | null; // 0..1
  availability: number | null; // 0..1
  p50_generate_ms: number | null;
  p95_generate_ms: number | null;
  p99_generate_ms: number | null;
  // SLO 99.9% — 0.001 dopuszczalnego error rate.
  error_budget_target: number;
  error_budget_remaining: number | null; // 0..1
  error_budget_burn_rate: number | null; // multiplier — > 1 means we'll burn budget this window
}

const SLO_TARGET = 0.999;
const ERROR_BUDGET = 1 - SLO_TARGET; // 0.001

function percentile(sorted: number[], p: number): number | null {
  if (sorted.length === 0) return null;
  const idx = Math.min(sorted.length - 1, Math.floor((sorted.length - 1) * p));
  return sorted[idx] ?? null;
}

export async function getSloMetrics(hours = 1): Promise<SloMetrics> {
  const now = Date.now();
  const from = new Date(now - hours * 60 * 60 * 1000).toISOString();
  const to = new Date(now).toISOString();

  const admin = createSupabaseAdminClient();

  const empty: SloMetrics = {
    window: { from, to, hours },
    request_count: null,
    error_count: null,
    error_rate: null,
    availability: null,
    p50_generate_ms: null,
    p95_generate_ms: null,
    p99_generate_ms: null,
    error_budget_target: SLO_TARGET,
    error_budget_remaining: null,
    error_budget_burn_rate: null,
  };

  if (!admin) return empty;

  // 1) AI generation latencies — z ai_generation_runs (jeśli istnieje).
  let p50: number | null = null;
  let p95: number | null = null;
  let p99: number | null = null;
  try {
    const { data } = await admin
      .from("ai_generation_runs")
      .select("duration_ms")
      .gte("created_at", from)
      .limit(5000);
    const vals = ((data ?? []) as Array<{ duration_ms: number | null }>)
      .map((r) => Number(r.duration_ms))
      .filter((v) => Number.isFinite(v) && v >= 0)
      .sort((a, b) => a - b);
    p50 = percentile(vals, 0.5);
    p95 = percentile(vals, 0.95);
    p99 = percentile(vals, 0.99);
  } catch {
    // table may not exist on older deploys
  }

  // 2) Error rate — z notifications (failed/total) jako proxy.
  let requestCount: number | null = null;
  let errorCount: number | null = null;
  try {
    const { count: total } = await admin
      .from("notifications")
      .select("id", { head: true, count: "exact" })
      .gte("created_at", from);
    requestCount = total ?? null;
    const { count: fails } = await admin
      .from("notifications")
      .select("id", { head: true, count: "exact" })
      .in("status", ["failed", "dead_letter"])
      .gte("created_at", from);
    errorCount = fails ?? null;
  } catch {
    // tolerate missing
  }

  const errorRate =
    requestCount && requestCount > 0 && errorCount !== null
      ? errorCount / requestCount
      : null;
  const availability = errorRate === null ? null : 1 - errorRate;
  const errorBudgetRemaining =
    errorRate === null ? null : Math.max(0, 1 - errorRate / ERROR_BUDGET);
  const errorBudgetBurnRate =
    errorRate === null ? null : errorRate / ERROR_BUDGET;

  return {
    window: { from, to, hours },
    request_count: requestCount,
    error_count: errorCount,
    error_rate: errorRate,
    availability,
    p50_generate_ms: p50,
    p95_generate_ms: p95,
    p99_generate_ms: p99,
    error_budget_target: SLO_TARGET,
    error_budget_remaining: errorBudgetRemaining,
    error_budget_burn_rate: errorBudgetBurnRate,
  };
}
