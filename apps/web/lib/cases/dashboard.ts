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

  // AUDYT #6 (iter33): wcześniejszy `as any` maskował liczne REALNE BUGI schematu:
  //  - cases.case_type NIE ISTNIEJE (realna kolumna `type`); cases.win_probability
  //    NIE ISTNIEJE.
  //  - deadlines.due_at/missed NIE ISTNIEJĄ (realna `effective_end_date`).
  //  - documents nie ma `user_id`? ma — ale liczymy po case_id z dostępnych spraw.
  //  - ai_suggestions NIE MA `user_id` ani `dismissed_at` (jest `applied_at`);
  //    kluczowane po `case_id`.
  //  - ai_runs / ai_generation_runs NIE ISTNIEJE — realny log to `ai_usage_log`
  //    (kolumna `cost_grosze`, brak `case_id`; sumujemy po użytkowniku).
  const casesResult = await supabase
    .from("cases")
    .select("id, type, title, status, created_at, updated_at")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false, nullsFirst: false });

  if (casesResult.error || !casesResult.data) {
    logger.warn("dashboard.cases_load_failed", { error: casesResult.error?.message });
    return { cases: [], totals: { active: 0, completed: 0, urgent: 0, overdue: 0 }, this_month_cost_pln: 0 };
  }

  const cases = casesResult.data;
  const caseIds = cases.map((c) => c.id);
  const now = Date.now();

  const [deadlinesResult, docsResult, suggestionsResult, usageResult] = await Promise.all([
    supabase.from("deadlines").select("case_id, kind, effective_end_date, completed_at").eq("user_id", userId).is("completed_at", null),
    supabase.from("documents").select("case_id").eq("user_id", userId),
    caseIds.length
      ? supabase.from("ai_suggestions").select("case_id, dismissed, applied").in("case_id", caseIds).eq("dismissed", false)
      : Promise.resolve({ data: [] as { case_id: string; dismissed: boolean; applied: boolean }[] }),
    supabase.from("ai_usage_log").select("cost_grosze, created_at").eq("user_id", userId).gte("created_at", new Date(Date.now() - 30 * 86_400_000).toISOString()),
  ]);

  // Group deadlines by case_id (earliest first)
  const deadlinesByCase = new Map<string, { kind: string; due_at: string }>();
  for (const d of deadlinesResult.data ?? []) {
    if (!d.case_id || !d.effective_end_date) continue;
    const existing = deadlinesByCase.get(d.case_id);
    if (!existing || new Date(d.effective_end_date).getTime() < new Date(existing.due_at).getTime()) {
      deadlinesByCase.set(d.case_id, { kind: d.kind, due_at: d.effective_end_date });
    }
  }
  const docCountByCase = new Map<string, number>();
  for (const d of docsResult.data ?? []) {
    if (!d.case_id) continue;
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
    // AUDYT #6 (iter33): CaseStatus nie ma 'closed' — stany końcowe to
    // 'completed'/'archived'. `as any` maskował martwe porównanie.
    if (c.status === "completed" || c.status === "archived") completed++;
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
      case_type: c.type,
      title: c.title ?? undefined,
      status: c.status,
      created_at: c.created_at,
      updated_at: c.updated_at ?? undefined,
      next_deadline_at: dl?.due_at,
      next_deadline_kind: dl?.kind,
      days_to_next_deadline: days,
      documents_count: docCountByCase.get(c.id) ?? 0,
      has_unread_suggestions: suggestionsByCase.has(c.id),
      // win_probability: kolumna nie istnieje na `cases` — pominięte.
    };
  });

  // ai_usage_log.cost_grosze (grosze) → złote.
  const this_month_cost_pln = (usageResult.data ?? []).reduce((sum: number, r) => sum + Number(r.cost_grosze ?? 0) / 100, 0);

  return {
    cases: dashboardCases,
    totals: { active, completed, urgent, overdue },
    this_month_cost_pln: Math.round(this_month_cost_pln * 100) / 100,
  };
}
