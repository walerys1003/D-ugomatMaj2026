/**
 * Tier 14 — Multi-step funnel builder.
 */
import { createSupabaseServerClient } from "@/lib/db/supabase-server";

export interface FunnelStep {
  event: string;
  filter?: Record<string, unknown>;
}

export interface FunnelResult {
  steps: { event: string; count: number; conversion_from_previous: number; conversion_from_start: number }[];
  total_users: number;
  total_completed: number;
  conversion_rate: number;
}

export async function computeFunnel(steps: FunnelStep[], opts?: { sinceDays?: number; orgId?: string }): Promise<FunnelResult> {
  const sb = await createSupabaseServerClient();
  const since = new Date(Date.now() - (opts?.sinceDays ?? 30) * 86400_000).toISOString();
  let q = sb.from("analytics_events").select("user_id, event, occurred_at, properties").gte("occurred_at", since);
  if (opts?.orgId) q = q.eq("org_id", opts.orgId);
  const { data: events } = await q;

  const byUser = new Map<string, { event: string; at: number; props: any }[]>();
  for (const e of (events as any[]) ?? []) {
    if (!e.user_id) continue;
    const arr = byUser.get(e.user_id) ?? [];
    arr.push({ event: e.event, at: new Date(e.occurred_at).getTime(), props: e.properties });
    byUser.set(e.user_id, arr);
  }

  const stepCounts = steps.map(() => 0);
  for (const ev of byUser.values()) {
    ev.sort((a, b) => a.at - b.at);
    let stepIdx = 0;
    for (const e of ev) {
      const target = steps[stepIdx];
      if (e.event === target.event && matchesFilter(e.props, target.filter)) {
        stepCounts[stepIdx]++;
        stepIdx++;
        if (stepIdx >= steps.length) break;
      }
    }
  }

  const totalUsers = stepCounts[0] ?? 0;
  const totalCompleted = stepCounts[stepCounts.length - 1] ?? 0;
  const result = stepCounts.map((c, i) => {
    const prev = i === 0 ? c : stepCounts[i - 1];
    return {
      event: steps[i].event,
      count: c,
      conversion_from_previous: prev > 0 ? Number((c / prev).toFixed(4)) : 0,
      conversion_from_start: totalUsers > 0 ? Number((c / totalUsers).toFixed(4)) : 0,
    };
  });
  return {
    steps: result,
    total_users: totalUsers,
    total_completed: totalCompleted,
    conversion_rate: totalUsers > 0 ? Number((totalCompleted / totalUsers).toFixed(4)) : 0,
  };
}

function matchesFilter(props: any, filter?: Record<string, unknown>): boolean {
  if (!filter) return true;
  for (const [k, v] of Object.entries(filter)) {
    if (props?.[k] !== v) return false;
  }
  return true;
}
