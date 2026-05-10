/**
 * Tier 10 — Admin dashboard metrics aggregator.
 * Pulls KPI counters from Supabase for the ops console.
 */
import { createServerSupabase } from "@/lib/db/supabase-server";

export interface AdminMetrics {
  users_total: number;
  users_active_30d: number;
  cases_total: number;
  cases_created_30d: number;
  revenue_grosze_30d: number;
  active_subscriptions: number;
  mrr_grosze: number;
  affiliate_signups_30d: number;
  open_error_reports: number;
  computed_at: string;
}

export async function getAdminMetrics(): Promise<AdminMetrics> {
  const sb = await createServerSupabase();
  const since30 = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString();
  const out: AdminMetrics = {
    users_total: 0,
    users_active_30d: 0,
    cases_total: 0,
    cases_created_30d: 0,
    revenue_grosze_30d: 0,
    active_subscriptions: 0,
    mrr_grosze: 0,
    affiliate_signups_30d: 0,
    open_error_reports: 0,
    computed_at: new Date().toISOString(),
  };
  try {
    const { count: usersTotal } = await sb.from("profiles").select("*", { count: "exact", head: true });
    out.users_total = usersTotal ?? 0;
    const { count: active30 } = await sb
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .gte("last_seen_at", since30);
    out.users_active_30d = active30 ?? 0;
    const { count: casesTotal } = await sb.from("cases").select("*", { count: "exact", head: true });
    out.cases_total = casesTotal ?? 0;
    const { count: cases30 } = await sb
      .from("cases")
      .select("*", { count: "exact", head: true })
      .gte("created_at", since30);
    out.cases_created_30d = cases30 ?? 0;
    const { data: payments30 } = await sb
      .from("payments")
      .select("amount_grosze")
      .gte("created_at", since30)
      .eq("status", "succeeded");
    out.revenue_grosze_30d = (payments30 ?? []).reduce((s: number, p: any) => s + (p.amount_grosze ?? 0), 0);
    const { count: activeSubs } = await sb
      .from("subscriptions")
      .select("*", { count: "exact", head: true })
      .in("status", ["active", "trialing"]);
    out.active_subscriptions = activeSubs ?? 0;
    const { data: subs } = await sb
      .from("subscriptions")
      .select("plan_key, cycle, amount_grosze")
      .in("status", ["active", "trialing"]);
    out.mrr_grosze = (subs ?? []).reduce((s: number, r: any) => {
      const amount = r.amount_grosze ?? 0;
      return s + (r.cycle === "annual" ? Math.round(amount / 12) : amount);
    }, 0);
    const { count: aff30 } = await sb
      .from("affiliate_accounts")
      .select("*", { count: "exact", head: true })
      .gte("created_at", since30);
    out.affiliate_signups_30d = aff30 ?? 0;
    const { count: openErr } = await sb
      .from("error_reports")
      .select("*", { count: "exact", head: true })
      .eq("resolved", false);
    out.open_error_reports = openErr ?? 0;
  } catch {
    // tolerate missing tables in non-prod
  }
  return out;
}
