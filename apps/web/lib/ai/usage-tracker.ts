/**
 * Tier 11 — Per-user AI usage and cost tracking with budget enforcement.
 */
import { createServerSupabase } from "@/lib/db/supabase-server";

export interface UsageRecord {
  user_id: string;
  model_id: string;
  task_type: string;
  input_tokens: number;
  output_tokens: number;
  cost_grosze: number;
  template_id?: string | null;
  metadata?: Record<string, unknown>;
}

export async function recordAiUsage(rec: UsageRecord): Promise<void> {
  const sb = await createServerSupabase();
  await sb.from("ai_usage_log").insert({
    user_id: rec.user_id,
    model_id: rec.model_id,
    task_type: rec.task_type,
    input_tokens: rec.input_tokens,
    output_tokens: rec.output_tokens,
    cost_grosze: rec.cost_grosze,
    template_id: rec.template_id ?? null,
    metadata: rec.metadata ?? {},
    created_at: new Date().toISOString(),
  });
}

export interface UsageSummary {
  total_calls: number;
  total_input_tokens: number;
  total_output_tokens: number;
  total_cost_grosze: number;
  per_model: Record<string, { calls: number; cost_grosze: number }>;
  period_start: string;
  period_end: string;
}

export async function getUserUsageSummary(userId: string, days = 30): Promise<UsageSummary> {
  const since = new Date(Date.now() - days * 24 * 3600 * 1000).toISOString();
  const sb = await createServerSupabase();
  const { data } = await sb.from("ai_usage_log").select("*").eq("user_id", userId).gte("created_at", since);
  const rows = data ?? [];
  const per: Record<string, { calls: number; cost_grosze: number }> = {};
  let totIn = 0;
  let totOut = 0;
  let totCost = 0;
  for (const r of rows as any[]) {
    per[r.model_id] ??= { calls: 0, cost_grosze: 0 };
    per[r.model_id].calls++;
    per[r.model_id].cost_grosze += r.cost_grosze ?? 0;
    totIn += r.input_tokens ?? 0;
    totOut += r.output_tokens ?? 0;
    totCost += r.cost_grosze ?? 0;
  }
  return {
    total_calls: rows.length,
    total_input_tokens: totIn,
    total_output_tokens: totOut,
    total_cost_grosze: totCost,
    per_model: per,
    period_start: since,
    period_end: new Date().toISOString(),
  };
}

export async function checkUserBudget(userId: string, maxCostGrosze: number): Promise<{ allowed: boolean; usedGrosze: number; remainingGrosze: number }> {
  const summary = await getUserUsageSummary(userId, 30);
  return {
    allowed: summary.total_cost_grosze < maxCostGrosze,
    usedGrosze: summary.total_cost_grosze,
    remainingGrosze: Math.max(0, maxCostGrosze - summary.total_cost_grosze),
  };
}
