/**
 * Multi-case dashboard — zad. 343
 *
 * Aggregates user's cases with deadlines/status/cost summary for the main app dashboard.
 */

import { getSupabaseAdmin } from "@/lib/db/supabase-admin";
import { logger } from "@/lib/observability/logger";

export interface DashboardCase {
  id: string;
  case_type: string;
  title?: string;
  status: string;
  created_at: string;
  updated_at?: string;
  next_deadline_at?: string;
  next_deadline_kind?: string;
  days_to_next_deadline?: number;
  documents_count: number;
  has_unread_suggestions: boolean;
  win_probability?: number;
}

export interface DashboardSummary {
  cases: DashboardCase[];
  totals: {
    active: number;
    completed: number;
    urgent: number; // deadline in <= 3 days
    overdue: number;
  };
  this_month_cost_pln: number;
}

export async function buildDashboard(userId: string): Promise<DashboardSummary> {
  const supabase = getSupabaseAdmin();

  const [casesResult, deadlinesResult, docsResult, suggestionsResult, runsResult] = await Promise.all([
    supabase.from("cases").select("id, case_type, title, status, created_at, updated_at, win_probability").eq("user_id", userId).order("updated_at", { ascending: false, nullsFirst: false }),
    supabase.from("deadlines").select("case_id, kind, due_at, completed_at, missed").eq("user_id", userId).is("completed_at", null),
    supabase.from("documents").select("case_id").eq("user_id", userId),
    supabase.from("ai_suggestions").select("case_id, dismissed, applied").eq("user_id", userId).is("dismissed_at", null),
    supabase.from("ai_runs").select("total_cost_pln, created_at").eq("user_id", userId).gte("created_at", new Date(Date.now() - 30 * 86_400_000).toISOString()),
  ]);

  if (casesResult.error || !casesResult.data) {
    logger.warn("dashboard.cases_load_failed", { error: casesResult.error?.message });
    return { cases: [], totals: { active: 0, completed: 0, urgent: 0, overdue: 0 }, this_month_cost_pln: 0 };
  }

  const cases = casesResult.data;
  const now = Date.now();

  // Group deadlines by case_id (earliest first)
  const deadlinesByCase = new Map<string, { kind: string; due_at: string }>();
  for (const d of deadlinesResult.data ?? []) {
    if (!d.due_at) continue;
    const existing = deadlinesByCase.get(d.case_id);
    if (!existing || new Date(d.due_at).getTime() < new Date(existing.due_at).getTime()) {
      deadlinesByCase.set(d.case_id, { kind: d.kind, due_at: d.due_at });
    }
  }
  const docCountByCase = new Map<string, number>();
  for (const d of docsResult.data ?? []) {
    docCountByCase.set(d.case_id, (docCountByCase.get(d.case_id) ?? 0) + 1);
  }
  const suggestionsByCase = new Set<string>();
  for (const s of suggestionsResult.data ?? []) {
    if (!s.applied) suggestionsByCase.add(s.case_id);
  }

  let urgent = 0;
  let overdue = 0;
  let active = 0;
  let completed = 0;

  const dashboardCases: DashboardCase[] = cases.map((c) => {
    if (c.status === "closed" || c.status === "completed") completed++;
    else active++;
    const dl = deadlinesByCase.get(c.id);
    let days: number | undefined;
    if (dl) {
      days = Math.ceil((new Date(dl.due_at).getTime() - now) / 86_400_000);
      if (days < 0) overdue++;
      else if (days <= 3) urgent++;
    }
    return {
      id: c.id,
      case_type: c.case_type,
      title: c.title ?? undefined,
      status: c.status,
      created_at: c.created_at,
      updated_at: c.updated_at ?? undefined,
      next_deadline_at: dl?.due_at,
      next_deadline_kind: dl?.kind,
      days_to_next_deadline: days,
      documents_count: docCountByCase.get(c.id) ?? 0,
      has_unread_suggestions: suggestionsByCase.has(c.id),
      win_probability: c.win_probability ?? undefined,
    };
  });

  const this_month_cost_pln = (runsResult.data ?? []).reduce((sum, r: any) => sum + Number(r.total_cost_pln ?? 0), 0);

  return {
    cases: dashboardCases,
    totals: { active, completed, urgent, overdue },
    this_month_cost_pln: Math.round(this_month_cost_pln * 100) / 100,
  };
}
