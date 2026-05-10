/**
 * Tier 14 — SaaS revenue metrics: MRR, ARR, churn, LTV, ARPU, expansion.
 */
import { createServerSupabase } from "@/lib/db/supabase-server";

export interface RevenueMetrics {
  mrr_grosze: number;
  arr_grosze: number;
  arpu_grosze: number;
  active_subscriptions: number;
  new_subscriptions_30d: number;
  churned_subscriptions_30d: number;
  gross_churn_rate: number;
  net_revenue_retention: number;
  ltv_grosze: number;
  computed_at: string;
}

export async function computeRevenueMetrics(): Promise<RevenueMetrics> {
  const sb = await createServerSupabase();
  const since30 = new Date(Date.now() - 30 * 86400_000).toISOString();
  const since60 = new Date(Date.now() - 60 * 86400_000).toISOString();

  const [{ data: active }, { data: new30 }, { data: churned30 }, { data: prevPeriod }] = await Promise.all([
    sb.from("subscriptions").select("amount_grosze, cycle, plan_key").in("status", ["active", "trialing"]),
    sb.from("subscriptions").select("id").gte("created_at", since30),
    sb.from("subscriptions").select("amount_grosze").eq("status", "canceled").gte("canceled_at", since30),
    sb
      .from("subscriptions")
      .select("amount_grosze")
      .in("status", ["active", "trialing"])
      .lte("created_at", since30)
      .gte("created_at", since60),
  ]);

  const mrr = (active ?? []).reduce((s: number, r: any) => s + (r.cycle === "annual" ? Math.round((r.amount_grosze ?? 0) / 12) : r.amount_grosze ?? 0), 0);
  const arr = mrr * 12;
  const activeCount = active?.length ?? 0;
  const arpu = activeCount > 0 ? Math.round(mrr / activeCount) : 0;

  const churnedRevenue = (churned30 ?? []).reduce((s: number, r: any) => s + (r.amount_grosze ?? 0), 0);
  const prevRevenue = (prevPeriod ?? []).reduce((s: number, r: any) => s + (r.amount_grosze ?? 0), 0);
  const grossChurn = prevRevenue > 0 ? Number((churnedRevenue / prevRevenue).toFixed(4)) : 0;
  const nrr = prevRevenue > 0 ? Number((mrr / prevRevenue).toFixed(4)) : 1;

  // Simplified LTV: ARPU / monthly churn rate (or 24mo cap)
  const monthlyChurn = grossChurn > 0 ? grossChurn : 0.02;
  const ltv = Math.round(arpu / Math.max(0.005, monthlyChurn));

  return {
    mrr_grosze: mrr,
    arr_grosze: arr,
    arpu_grosze: arpu,
    active_subscriptions: activeCount,
    new_subscriptions_30d: new30?.length ?? 0,
    churned_subscriptions_30d: churned30?.length ?? 0,
    gross_churn_rate: grossChurn,
    net_revenue_retention: nrr,
    ltv_grosze: ltv,
    computed_at: new Date().toISOString(),
  };
}
