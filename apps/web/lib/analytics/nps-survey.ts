/**
 * Tier 14 — NPS survey collection + aggregation.
 */
import { createSupabaseServerClient } from "@/lib/db/supabase-server";

export interface NpsResponse {
  user_id: string;
  score: number; // 0-10
  comment?: string;
  channel?: "email" | "in_app" | "sms";
}

export async function recordNpsResponse(r: NpsResponse): Promise<void> {
  if (r.score < 0 || r.score > 10) throw new Error("score_out_of_range");
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb: any = await createSupabaseServerClient();
  await sb.from("nps_responses").insert({
    user_id: r.user_id,
    score: r.score,
    comment: r.comment ?? null,
    channel: r.channel ?? "email",
    created_at: new Date().toISOString(),
  });
}

export interface NpsSummary {
  total: number;
  promoters: number;
  passives: number;
  detractors: number;
  nps: number;
  period_days: number;
}

export async function computeNps(periodDays = 90): Promise<NpsSummary> {
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb: any = await createSupabaseServerClient();
  const since = new Date(Date.now() - periodDays * 86400_000).toISOString();
  const { data } = await sb.from("nps_responses").select("score").gte("created_at", since);
  const rows = (data ?? []) as { score: number }[];
  const total = rows.length;
  const promoters = rows.filter((r) => r.score >= 9).length;
  const passives = rows.filter((r) => r.score >= 7 && r.score <= 8).length;
  const detractors = rows.filter((r) => r.score <= 6).length;
  const nps = total === 0 ? 0 : Math.round(((promoters - detractors) / total) * 100);
  return { total, promoters, passives, detractors, nps, period_days: periodDays };
}
