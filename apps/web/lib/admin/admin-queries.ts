import "server-only";

/**
 * Tier 5.4 — Admin queries (read-side).
 *
 * Wszystkie funkcje wymagają wcześniejszego `requireAdmin()` w wywołującej
 * stronie / akcji — same w sobie nie weryfikują roli, tylko używają
 * service-role klienta do widoku przekrojowego (bypass RLS).
 *
 * Świadoma decyzja: odczyt admin idzie service-role dla cross-user
 * widoczności (bez tego musielibyśmy dodawać policy "admin can SELECT *"
 * dla każdej tabeli — co rozszczelnia RLS po stronie produktu).
 */

import { createSupabaseAdminClient } from "@/lib/db/supabase-server";
import type {
  CaseRow,
  CaseStatus,
  CaseType,
  CaseEventRow,
  PromptTemplateRow,
} from "@/lib/db/types";

export interface AdminCaseQueueRow {
  id: string;
  user_id: string;
  type: CaseType;
  status: CaseStatus;
  created_at: string;
  updated_at: string;
  user_email: string | null;
  document_count: number;
  has_payment: boolean;
}

export interface AdminCaseQueueParams {
  status?: CaseStatus | "all";
  caseType?: CaseType | "all";
  search?: string; // email fragment
  limit?: number;
  offset?: number;
}

export async function listCasesForAdmin(
  params: AdminCaseQueueParams = {},
): Promise<{ rows: AdminCaseQueueRow[]; total: number }> {
  const supabase = createSupabaseAdminClient();
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;
  const limit = Math.min(params.limit ?? 50, 200);
  const offset = params.offset ?? 0;

  let q = sb
    .from("cases")
    .select("id, user_id, type, status, created_at, updated_at", {
      count: "exact",
    })
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (params.status && params.status !== "all") q = q.eq("status", params.status);
  if (params.caseType && params.caseType !== "all") q = q.eq("type", params.caseType);

  const { data: cases, error, count } = await q;
  if (error) throw new Error(`Admin cases query failed: ${error.message}`);
  if (!cases || cases.length === 0) return { rows: [], total: count ?? 0 };

  const userIds = Array.from(new Set(cases.map((c: any) => c.user_id)));
  const caseIds = cases.map((c: any) => c.id);

  // Pobierz e-maile równolegle (auth.users via admin API).
  const emailsPromise = sb.auth.admin
    .listUsers({ page: 1, perPage: 1000 })
    .then((res: any) => {
      if (res.error) return new Map<string, string>();
      const map = new Map<string, string>();
      for (const u of res.data.users) {
        if (u.id && u.email) map.set(u.id, u.email);
      }
      return map;
    })
    .catch(() => new Map<string, string>());

  const docsPromise = sb
    .from("documents")
    .select("id, case_id")
    .in("case_id", caseIds);

  const paymentsPromise = sb
    .from("payments")
    .select("case_id, status")
    .in("case_id", caseIds)
    .eq("status", "completed");

  const [emails, docsRes, paymentsRes] = await Promise.all([
    emailsPromise,
    docsPromise,
    paymentsPromise,
  ]);

  const docsByCase = new Map<string, number>();
  for (const d of docsRes.data ?? []) {
    docsByCase.set(d.case_id, (docsByCase.get(d.case_id) ?? 0) + 1);
  }
  const paidCases = new Set<string>(
    (paymentsRes.data ?? []).map((p: any) => p.case_id as string),
  );

  // emailsPromise jest już Mapą.
  const _ = userIds; // referenced for clarity

  const rows: AdminCaseQueueRow[] = cases.map((c: any) => ({
    id: c.id,
    user_id: c.user_id,
    type: c.type as CaseType,
    status: c.status as CaseStatus,
    created_at: c.created_at,
    updated_at: c.updated_at,
    user_email: emails.get(c.user_id) ?? null,
    document_count: docsByCase.get(c.id) ?? 0,
    has_payment: paidCases.has(c.id),
  }));

  // Filtr po fragmencie e-maila — w pamięci (bez index'u w auth.users).
  let filtered = rows;
  if (params.search && params.search.trim().length >= 2) {
    const needle = params.search.trim().toLowerCase();
    filtered = rows.filter((r) => r.user_email?.toLowerCase().includes(needle));
  }

  return { rows: filtered, total: count ?? rows.length };
}

export interface AdminStats {
  cases_total: number;
  cases_24h: number;
  cases_by_status: Record<string, number>;
  documents_total: number;
  documents_24h: number;
  payments_completed_total: number;
  revenue_total_grosze: number;
  users_total: number;
  validation_avg_score_30d: number | null;
  validation_pass_rate_30d: number | null;
}

export async function getAdminStats(): Promise<AdminStats> {
  const supabase = createSupabaseAdminClient();
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;
  const now = Date.now();
  const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000).toISOString();
  const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [
    casesCount,
    cases24h,
    casesByStatus,
    documentsTotal,
    documents24h,
    paymentsCompleted,
    usersList,
    validations,
  ] = await Promise.all([
    sb.from("cases").select("id", { count: "exact", head: true }).is("deleted_at", null),
    sb
      .from("cases")
      .select("id", { count: "exact", head: true })
      .is("deleted_at", null)
      .gte("created_at", oneDayAgo),
    sb
      .from("cases")
      .select("status")
      .is("deleted_at", null),
    sb.from("documents").select("id", { count: "exact", head: true }),
    sb
      .from("documents")
      .select("id", { count: "exact", head: true })
      .gte("created_at", oneDayAgo),
    sb
      .from("payments")
      .select("amount", { count: "exact" })
      .eq("status", "completed"),
    sb.auth.admin.listUsers({ page: 1, perPage: 1 }),
    sb
      .from("validation_runs")
      .select("pass, score")
      .gte("created_at", thirtyDaysAgo),
  ]);

  const cases_by_status: Record<string, number> = {};
  for (const row of (casesByStatus.data ?? []) as Array<{ status: string }>) {
    cases_by_status[row.status] = (cases_by_status[row.status] ?? 0) + 1;
  }

  const revenue_total_grosze = ((paymentsCompleted.data ?? []) as Array<{
    amount: number;
  }>).reduce((acc, p) => acc + (p.amount ?? 0), 0);

  let validation_avg_score_30d: number | null = null;
  let validation_pass_rate_30d: number | null = null;
  const vRows = validations.data ?? [];
  if (vRows.length > 0) {
    const sum = vRows.reduce((acc: any, r: any) => acc + (r.score ?? 0), 0);
    validation_avg_score_30d = Math.round((sum / vRows.length) * 100) / 100;
    const passed = vRows.filter((r: any) => r.pass).length;
    validation_pass_rate_30d = Math.round((passed / vRows.length) * 1000) / 10;
  }

  return {
    cases_total: casesCount.count ?? 0,
    cases_24h: cases24h.count ?? 0,
    cases_by_status,
    documents_total: documentsTotal.count ?? 0,
    documents_24h: documents24h.count ?? 0,
    payments_completed_total: paymentsCompleted.count ?? 0,
    revenue_total_grosze,
    users_total: usersList.data?.total ?? 0,
    validation_avg_score_30d,
    validation_pass_rate_30d,
  };
}

/* ------------------------------------------------------------------ */
/* Tier 5.4 — Extended KPI metrics (zad. 231-240)                       */
/* ------------------------------------------------------------------ */

export interface AdminKpiTimeSeries {
  /** ISO date (YYYY-MM-DD), bucket day. */
  bucket: string;
  cases_created: number;
  payments_completed: number;
  revenue_grosze: number;
}

/**
 * Day-by-day KPI buckets for last N days. Used przez wykres trendu
 * w admin dashboardzie (zad. 232 — funnel & revenue over time).
 */
export async function getKpiTimeSeries(
  days = 30,
): Promise<AdminKpiTimeSeries[]> {
  const supabase = createSupabaseAdminClient();
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;
  const since = new Date(
    Date.now() - days * 24 * 60 * 60 * 1000,
  ).toISOString();

  const [casesRes, paymentsRes] = await Promise.all([
    sb
      .from("cases")
      .select("created_at")
      .is("deleted_at", null)
      .gte("created_at", since),
    sb
      .from("payments")
      .select("amount, completed_at, created_at")
      .eq("status", "completed")
      .gte("created_at", since),
  ]);

  const buckets = new Map<string, AdminKpiTimeSeries>();
  // Pre-fill last N days so wykres ma puste słupki tam gdzie 0.
  for (let i = 0; i < days; i++) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().slice(0, 10);
    buckets.set(key, {
      bucket: key,
      cases_created: 0,
      payments_completed: 0,
      revenue_grosze: 0,
    });
  }

  for (const row of (casesRes.data ?? []) as Array<{ created_at: string }>) {
    const key = row.created_at.slice(0, 10);
    const b = buckets.get(key);
    if (b) b.cases_created += 1;
  }
  for (const row of (paymentsRes.data ?? []) as Array<{
    amount: number | null;
    completed_at: string | null;
    created_at: string;
  }>) {
    const ts = row.completed_at ?? row.created_at;
    const key = ts.slice(0, 10);
    const b = buckets.get(key);
    if (b) {
      b.payments_completed += 1;
      b.revenue_grosze += row.amount ?? 0;
    }
  }

  return Array.from(buckets.values()).sort((a, b) =>
    a.bucket < b.bucket ? -1 : 1,
  );
}

export interface AdminFunnelMetrics {
  /** Liczba unikalnych userów którzy stworzyli sprawę w okresie. */
  cases_created_users: number;
  /** Liczba sprawe które dotarły do statusu 'paid'. */
  cases_paid: number;
  /** Liczba sprawe które dotarły do statusu 'sent_to_court'. */
  cases_sent_to_court: number;
  /** Conversion rate (paid / created), %. */
  conversion_paid_pct: number | null;
  /** Średni czas od created → paid (godziny). */
  avg_hours_to_payment: number | null;
}

/**
 * Funnel: utworzenie sprawy → płatność → wysłanie. zad. 232.
 */
export async function getFunnelMetrics(days = 30): Promise<AdminFunnelMetrics> {
  const supabase = createSupabaseAdminClient();
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;
  const since = new Date(
    Date.now() - days * 24 * 60 * 60 * 1000,
  ).toISOString();

  const { data, error } = await sb
    .from("cases")
    .select("id, user_id, status, created_at, updated_at")
    .is("deleted_at", null)
    .gte("created_at", since);

  if (error) throw new Error(`Funnel query failed: ${error.message}`);
  const rows = (data ?? []) as Array<{
    id: string;
    user_id: string;
    status: string;
    created_at: string;
    updated_at: string;
  }>;

  const users = new Set<string>();
  let cases_paid = 0;
  let cases_sent_to_court = 0;
  let totalHoursToPayment = 0;
  let paidCountForAvg = 0;

  // Pobierz timestamps płatności dla średniej czasu konwersji.
  const caseIds = rows.map((r) => r.id);
  const paymentByCase = new Map<string, string>();
  if (caseIds.length > 0) {
    const { data: payRows } = await sb
      .from("payments")
      .select("case_id, completed_at, created_at")
      .in("case_id", caseIds)
      .eq("status", "completed");
    for (const p of (payRows ?? []) as Array<{
      case_id: string;
      completed_at: string | null;
      created_at: string;
    }>) {
      paymentByCase.set(p.case_id, p.completed_at ?? p.created_at);
    }
  }

  for (const r of rows) {
    users.add(r.user_id);
    if (r.status === "paid" || r.status === "sent_to_court") cases_paid += 1;
    if (r.status === "sent_to_court") cases_sent_to_court += 1;

    const paidAt = paymentByCase.get(r.id);
    if (paidAt) {
      const hours =
        (new Date(paidAt).getTime() - new Date(r.created_at).getTime()) /
        (1000 * 60 * 60);
      if (hours >= 0) {
        totalHoursToPayment += hours;
        paidCountForAvg += 1;
      }
    }
  }

  const conversion_paid_pct =
    rows.length > 0
      ? Math.round((cases_paid / rows.length) * 1000) / 10
      : null;
  const avg_hours_to_payment =
    paidCountForAvg > 0
      ? Math.round((totalHoursToPayment / paidCountForAvg) * 10) / 10
      : null;

  return {
    cases_created_users: users.size,
    cases_paid,
    cases_sent_to_court,
    conversion_paid_pct,
    avg_hours_to_payment,
  };
}

export interface AdminNotificationStats {
  total: number;
  by_status: Record<string, number>;
  by_channel: Record<string, number>;
  failed_24h: number;
  pending_overdue: number; // scheduled_for w przeszłości, status='pending'
}

/**
 * Status kolejki notyfikacji (zad. 234 — Notification monitor).
 */
export async function getNotificationStats(): Promise<AdminNotificationStats> {
  const supabase = createSupabaseAdminClient();
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const now = new Date().toISOString();

  const { data, error } = await sb
    .from("notifications")
    .select("status, channel, scheduled_for, created_at")
    .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

  if (error) {
    // Tabela może nie istnieć w starszych deployach — graceful degradation.
    return {
      total: 0,
      by_status: {},
      by_channel: {},
      failed_24h: 0,
      pending_overdue: 0,
    };
  }

  const rows = (data ?? []) as Array<{
    status: string;
    channel: string;
    scheduled_for: string | null;
    created_at: string;
  }>;

  const by_status: Record<string, number> = {};
  const by_channel: Record<string, number> = {};
  let failed_24h = 0;
  let pending_overdue = 0;

  for (const r of rows) {
    by_status[r.status] = (by_status[r.status] ?? 0) + 1;
    by_channel[r.channel] = (by_channel[r.channel] ?? 0) + 1;
    if (r.status === "failed" && r.created_at >= oneDayAgo) failed_24h += 1;
    if (
      r.status === "pending" &&
      r.scheduled_for &&
      r.scheduled_for < now
    ) {
      pending_overdue += 1;
    }
  }

  return {
    total: rows.length,
    by_status,
    by_channel,
    failed_24h,
    pending_overdue,
  };
}

export interface AdminKnowledgeStats {
  total_chunks: number;
  by_case_type: Record<string, number>;
  embeddings_present: number;
  embeddings_missing: number;
}

/**
 * Stan bazy wiedzy RAG (zad. 237 — Knowledge editor read-side).
 */
export async function getKnowledgeStats(): Promise<AdminKnowledgeStats> {
  const supabase = createSupabaseAdminClient();
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;
  const { data, error } = await sb
    .from("legal_knowledge")
    .select("case_type, embedding");

  if (error) {
    return {
      total_chunks: 0,
      by_case_type: {},
      embeddings_present: 0,
      embeddings_missing: 0,
    };
  }

  const rows = (data ?? []) as Array<{
    case_type: string | null;
    embedding: unknown;
  }>;
  const by_case_type: Record<string, number> = {};
  let embeddings_present = 0;
  let embeddings_missing = 0;
  for (const r of rows) {
    const k = r.case_type ?? "unknown";
    by_case_type[k] = (by_case_type[k] ?? 0) + 1;
    if (r.embedding) embeddings_present += 1;
    else embeddings_missing += 1;
  }

  return {
    total_chunks: rows.length,
    by_case_type,
    embeddings_present,
    embeddings_missing,
  };
}

export interface AdminPromoStats {
  total_codes: number;
  active_codes: number;
  total_redemptions: number;
  total_discount_grosze: number;
  top_codes: Array<{ code: string; uses: number; discount_grosze: number }>;
}

/**
 * Statystyki kodów promocyjnych (zad. 240 — promo monitoring).
 */
export async function getPromoStats(): Promise<AdminPromoStats> {
  const supabase = createSupabaseAdminClient();
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;
  const [codesRes, redRes] = await Promise.all([
    sb
      .from("promo_codes")
      .select("code, is_active, uses_count"),
    sb
      .from("promo_redemptions")
      .select("code, discount_grosze"),
  ]);

  const codes = (codesRes.data ?? []) as Array<{
    code: string;
    is_active: boolean;
    uses_count: number | null;
  }>;
  const reds = (redRes.data ?? []) as Array<{
    code: string;
    discount_grosze: number | null;
  }>;

  const usesByCode = new Map<string, { uses: number; discount: number }>();
  for (const r of reds) {
    const cur = usesByCode.get(r.code) ?? { uses: 0, discount: 0 };
    cur.uses += 1;
    cur.discount += r.discount_grosze ?? 0;
    usesByCode.set(r.code, cur);
  }

  const top_codes = Array.from(usesByCode.entries())
    .map(([code, v]) => ({
      code,
      uses: v.uses,
      discount_grosze: v.discount,
    }))
    .sort((a, b) => b.uses - a.uses)
    .slice(0, 10);

  return {
    total_codes: codes.length,
    active_codes: codes.filter((c) => c.is_active).length,
    total_redemptions: reds.length,
    total_discount_grosze: reds.reduce(
      (acc, r) => acc + (r.discount_grosze ?? 0),
      0,
    ),
    top_codes,
  };
}

export interface AdminAuditEvent {
  id: string;
  case_id: string;
  user_id: string | null;
  actor: string;
  event_type: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export async function listAuditEvents(params: {
  limit?: number;
  offset?: number;
  eventType?: string;
  caseId?: string;
}): Promise<{ rows: AdminAuditEvent[]; total: number }> {
  const supabase = createSupabaseAdminClient();
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;
  const limit = Math.min(params.limit ?? 100, 500);
  const offset = params.offset ?? 0;

  let q = sb
    .from("case_events")
    .select("id, case_id, user_id, actor, event_type, metadata, created_at", {
      count: "exact",
    })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (params.eventType) q = q.eq("event_type", params.eventType);
  if (params.caseId) q = q.eq("case_id", params.caseId);

  const { data, error, count } = await q;
  if (error) throw new Error(`Audit log query failed: ${error.message}`);

  const rows: AdminAuditEvent[] = (data ?? []).map((row: any) => ({
    id: row.id as string,
    case_id: row.case_id as string,
    user_id: (row.user_id as string | null) ?? null,
    actor: row.actor as string,
    event_type: row.event_type as string,
    metadata: (row.metadata as Record<string, unknown>) ?? {},
    created_at: row.created_at as string,
  }));

  return { rows, total: count ?? rows.length };
}

export async function listPromptTemplates(): Promise<PromptTemplateRow[]> {
  const supabase = createSupabaseAdminClient();
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;
  const { data, error } = await sb
    .from("prompt_templates")
    .select("*")
    .order("case_type", { ascending: true })
    .order("variant", { ascending: true })
    .order("version", { ascending: false });
  if (error) throw new Error(`Prompt templates query failed: ${error.message}`);
  return (data ?? []) as PromptTemplateRow[];
}

export async function getPromptTemplate(
  id: string,
): Promise<PromptTemplateRow | null> {
  const supabase = createSupabaseAdminClient();
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;
  const { data, error } = await sb
    .from("prompt_templates")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(`Prompt template query failed: ${error.message}`);
  }
  return (data as PromptTemplateRow) ?? null;
}

export async function getCaseDetailsForAdmin(caseId: string): Promise<{
  case_row: CaseRow | null;
  events: CaseEventRow[];
  user_email: string | null;
}> {
  const supabase = createSupabaseAdminClient();
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;
  const [caseRes, eventsRes] = await Promise.all([
    sb.from("cases").select("*").eq("id", caseId).maybeSingle(),
    sb
      .from("case_events")
      .select("*")
      .eq("case_id", caseId)
      .order("created_at", { ascending: false })
      .limit(200),
  ]);

  if (caseRes.error && caseRes.error.code !== "PGRST116") {
    throw new Error(`Admin case query failed: ${caseRes.error.message}`);
  }

  let userEmail: string | null = null;
  if (caseRes.data?.user_id) {
    const { data } = await sb.auth.admin.getUserById(
      caseRes.data.user_id as string,
    );
    userEmail = data?.user?.email ?? null;
  }

  return {
    case_row: (caseRes.data as CaseRow) ?? null,
    events: (eventsRes.data ?? []) as CaseEventRow[],
    user_email: userEmail,
  };
}
