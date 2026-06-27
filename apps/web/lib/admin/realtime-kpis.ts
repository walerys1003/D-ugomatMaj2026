/**
 * Tier 27 — Real-time admin KPI aggregator.
 * Rozszerza dashboard-metrics o serie czasowe, alerty i metryki systemowe.
 */
import "server-only";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";

export interface RealtimeKpis {
  // KPI z ostatniej godziny (real-time)
  cases_created_1h: number;
  payments_succeeded_1h: number;
  errors_1h: number;
  ai_runs_1h: number;
  // Stan kolejki
  jobs_pending: number;
  jobs_running: number;
  jobs_failed_24h: number;
  // Wskaźniki zdrowia
  webhook_failures_1h: number;
  open_incidents: number;
  // Trend (vs poprzednia godzina)
  cases_trend: number; // procent
  // Czas wygenerowania
  computed_at: string;
}

export async function getRealtimeKpis(): Promise<RealtimeKpis> {
  const sb = await createSupabaseServerClient();
  const now = Date.now();
  const since1h = new Date(now - 3600 * 1000).toISOString();
  const since2h = new Date(now - 2 * 3600 * 1000).toISOString();
  const since24h = new Date(now - 24 * 3600 * 1000).toISOString();

  const out: RealtimeKpis = {
    cases_created_1h: 0,
    payments_succeeded_1h: 0,
    errors_1h: 0,
    ai_runs_1h: 0,
    jobs_pending: 0,
    jobs_running: 0,
    jobs_failed_24h: 0,
    webhook_failures_1h: 0,
    open_incidents: 0,
    cases_trend: 0,
    computed_at: new Date().toISOString(),
  };

  try {
    const { count: cases1h } = await sb
      .from("cases")
      .select("*", { count: "exact", head: true })
      .gte("created_at", since1h);
    out.cases_created_1h = cases1h ?? 0;

    const { count: cases2h } = await sb
      .from("cases")
      .select("*", { count: "exact", head: true })
      .gte("created_at", since2h)
      .lt("created_at", since1h);
    const prev = cases2h ?? 0;
    out.cases_trend =
      prev === 0 ? (out.cases_created_1h > 0 ? 100 : 0) : Math.round(((out.cases_created_1h - prev) / prev) * 100);

    const { count: pay1h } = await sb
      .from("payments")
      .select("*", { count: "exact", head: true })
      .eq("status", "succeeded")
      .gte("created_at", since1h);
    out.payments_succeeded_1h = pay1h ?? 0;

    const { count: err1h } = await sb
      .from("error_reports")
      .select("*", { count: "exact", head: true })
      .gte("created_at", since1h);
    out.errors_1h = err1h ?? 0;

    const { count: ai1h } = await sb
      .from("ai_generations")
      .select("*", { count: "exact", head: true })
      .gte("created_at", since1h);
    out.ai_runs_1h = ai1h ?? 0;

    const { count: pending } = await sb
      .from("jobs")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending");
    out.jobs_pending = pending ?? 0;

    const { count: running } = await sb
      .from("jobs")
      .select("*", { count: "exact", head: true })
      .eq("status", "running");
    out.jobs_running = running ?? 0;

    const { count: failed24 } = await sb
      .from("jobs")
      .select("*", { count: "exact", head: true })
      .eq("status", "failed")
      .gte("created_at", since24h);
    out.jobs_failed_24h = failed24 ?? 0;

    const { count: whfail } = await sb
      .from("webhook_deliveries")
      .select("*", { count: "exact", head: true })
      .eq("status", "failed")
      .gte("created_at", since1h);
    out.webhook_failures_1h = whfail ?? 0;

    const { count: incidents } = await sb
      .from("incidents")
      .select("*", { count: "exact", head: true })
      .in("status", ["open", "investigating"]);
    out.open_incidents = incidents ?? 0;
  } catch {
    // Tolerujemy brakujące tabele w środowisku non-prod
  }

  return out;
}

export interface KpiAlert {
  level: "info" | "warning" | "critical";
  title: string;
  description: string;
}

export function deriveAlerts(k: RealtimeKpis): KpiAlert[] {
  const alerts: KpiAlert[] = [];
  if (k.errors_1h >= 20) {
    alerts.push({
      level: "critical",
      title: "Wysoka liczba błędów",
      description: `${k.errors_1h} błędów w ostatniej godzinie`,
    });
  } else if (k.errors_1h >= 5) {
    alerts.push({
      level: "warning",
      title: "Podwyższona liczba błędów",
      description: `${k.errors_1h} błędów w ostatniej godzinie`,
    });
  }
  if (k.webhook_failures_1h >= 10) {
    alerts.push({
      level: "critical",
      title: "Awarie webhooków",
      description: `${k.webhook_failures_1h} nieudanych dostarczen webhooków`,
    });
  }
  if (k.jobs_failed_24h >= 50) {
    alerts.push({
      level: "warning",
      title: "Wiele nieudanych jobów",
      description: `${k.jobs_failed_24h} jobów zakończonych błędem w 24h`,
    });
  }
  if (k.open_incidents > 0) {
    alerts.push({
      level: k.open_incidents >= 3 ? "critical" : "warning",
      title: "Otwarte incydenty",
      description: `${k.open_incidents} aktywnych incydentów`,
    });
  }
  if (alerts.length === 0) {
    alerts.push({
      level: "info",
      title: "Wszystko wygląda OK",
      description: "Brak aktywnych alertów w ostatniej godzinie.",
    });
  }
  return alerts;
}
