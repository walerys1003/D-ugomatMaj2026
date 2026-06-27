/**
 * Tier 14 — Cohort retention analysis (signup week × week N retention).
 */
import { createSupabaseServerClient } from "@/lib/db/supabase-server";

export interface CohortRow {
  cohort_week: string; // YYYY-WW
  cohort_size: number;
  retention: number[]; // retention[N] = users still active in week N (0..12)
}

export async function computeWeeklyCohorts(weeksBack = 12): Promise<CohortRow[]> {
  const sb = await createSupabaseServerClient();
  const since = new Date(Date.now() - weeksBack * 7 * 86400_000).toISOString();
  const { data: profiles } = await sb.from("profiles").select("id, created_at").gte("created_at", since);
  const { data: events } = await sb
    .from("analytics_events")
    .select("user_id, occurred_at")
    .gte("occurred_at", since)
    .not("user_id", "is", null);

  const cohortMap = new Map<string, { ids: Set<string>; createdAt: Map<string, Date> }>();
  for (const p of (profiles as any[]) ?? []) {
    const wk = isoWeek(new Date(p.created_at));
    if (!cohortMap.has(wk)) cohortMap.set(wk, { ids: new Set(), createdAt: new Map() });
    cohortMap.get(wk)!.ids.add(p.id);
    cohortMap.get(wk)!.createdAt.set(p.id, new Date(p.created_at));
  }

  const activityByUser = new Map<string, Set<number>>();
  for (const e of (events as any[]) ?? []) {
    const set = activityByUser.get(e.user_id) ?? new Set<number>();
    set.add(weekIndexOf(new Date(e.occurred_at)));
    activityByUser.set(e.user_id, set);
  }

  const rows: CohortRow[] = [];
  for (const [wk, info] of cohortMap) {
    const ret: number[] = [];
    const baseWeek = anyDateForCohort(wk);
    const baseIdx = weekIndexOf(baseWeek);
    for (let n = 0; n < 12; n++) {
      let active = 0;
      const targetIdx = baseIdx + n;
      for (const uid of info.ids) {
        if (activityByUser.get(uid)?.has(targetIdx)) active++;
      }
      ret.push(info.ids.size === 0 ? 0 : Number((active / info.ids.size).toFixed(3)));
    }
    rows.push({ cohort_week: wk, cohort_size: info.ids.size, retention: ret });
  }
  rows.sort((a, b) => (a.cohort_week < b.cohort_week ? -1 : 1));
  return rows;
}

function isoWeek(d: Date): string {
  const tmp = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const dayNum = tmp.getUTCDay() || 7;
  tmp.setUTCDate(tmp.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((tmp.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${tmp.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

function weekIndexOf(d: Date): number {
  const epoch = new Date(Date.UTC(2020, 0, 6)); // Mon week 1, 2020
  return Math.floor((d.getTime() - epoch.getTime()) / (7 * 86400_000));
}

function anyDateForCohort(wk: string): Date {
  const [y, w] = wk.split("-W");
  const d = new Date(Date.UTC(Number(y), 0, 1 + (Number(w) - 1) * 7));
  return d;
}
