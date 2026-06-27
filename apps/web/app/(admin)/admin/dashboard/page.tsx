import type { Metadata } from "next";
import { Activity, AlertCircle, ArrowDown, ArrowUp, Briefcase, Bug, CreditCard, Minus, Sparkles, Zap } from "lucide-react";

import { getAdminMetrics } from "@/lib/admin/dashboard-metrics";
import { getRealtimeKpis, deriveAlerts } from "@/lib/admin/realtime-kpis";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Dashboard administracyjny",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function formatPLN(grosze: number): string {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
    maximumFractionDigits: 0,
  }).format(grosze / 100);
}

function TrendBadge({ value }: { value: number }) {
  if (value === 0) {
    return (
      <span className="inline-flex items-center gap-1 text-fluid-xs text-ink-500">
        <Minus className="h-3 w-3" />
        bez zmian
      </span>
    );
  }
  const up = value > 0;
  return (
    <span
      className={`inline-flex items-center gap-1 text-fluid-xs font-semibold ${
        up ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
      }`}
    >
      {up ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
      {Math.abs(value)}%
    </span>
  );
}

export default async function AdminDashboardV2Page() {
  const [metrics, realtime] = await Promise.all([getAdminMetrics(), getRealtimeKpis()]);
  const alerts = deriveAlerts(realtime);

  const kpiCards: Array<{ label: string; value: string; icon: any; tone: string }> = [
    { label: "Sprawy (1h)", value: realtime.cases_created_1h.toLocaleString("pl-PL"), icon: Briefcase, tone: "blue" },
    { label: "Płatności (1h)", value: realtime.payments_succeeded_1h.toLocaleString("pl-PL"), icon: CreditCard, tone: "emerald" },
    { label: "Błędy (1h)", value: realtime.errors_1h.toLocaleString("pl-PL"), icon: Bug, tone: "rose" },
    { label: "Uruchomienia AI (1h)", value: realtime.ai_runs_1h.toLocaleString("pl-PL"), icon: Sparkles, tone: "violet" },
  ];

  const queueCards: Array<{ label: string; value: string }> = [
    { label: "Jobs pending", value: realtime.jobs_pending.toLocaleString("pl-PL") },
    { label: "Jobs running", value: realtime.jobs_running.toLocaleString("pl-PL") },
    { label: "Jobs failed (24h)", value: realtime.jobs_failed_24h.toLocaleString("pl-PL") },
    { label: "Webhook fails (1h)", value: realtime.webhook_failures_1h.toLocaleString("pl-PL") },
  ];

  const businessCards: Array<{ label: string; value: string }> = [
    ["Użytkownicy łącznie", metrics.users_total.toLocaleString("pl-PL")],
    ["Aktywni (30d)", metrics.users_active_30d.toLocaleString("pl-PL")],
    ["Sprawy łącznie", metrics.cases_total.toLocaleString("pl-PL")],
    ["Sprawy (30d)", metrics.cases_created_30d.toLocaleString("pl-PL")],
    ["Przychód (30d)", formatPLN(metrics.revenue_grosze_30d)],
    ["MRR", formatPLN(metrics.mrr_grosze)],
    ["Aktywne subskrypcje", metrics.active_subscriptions.toLocaleString("pl-PL")],
    ["Otwarte błędy", metrics.open_error_reports.toLocaleString("pl-PL")],
  ].map(([label, value]) => ({ label, value }));

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8">
      <header className="flex flex-col gap-1">
        <p className="text-fluid-sm font-semibold uppercase tracking-wider text-dlugomat-600">
          Compliance Console
        </p>
        <h1 className="text-fluid-3xl font-bold tracking-tight text-ink-900 dark:text-white">
          Dashboard administracyjny
        </h1>
        <p className="text-fluid-base text-ink-600 dark:text-ink-300">
          Real-time KPI · ostatnia aktualizacja{" "}
          {new Date(realtime.computed_at).toLocaleTimeString("pl-PL")}
        </p>
      </header>

      {/* Alerty */}
      {alerts.length > 0 && (
        <section aria-labelledby="alerts-heading" className="flex flex-col gap-3">
          <h2 id="alerts-heading" className="text-fluid-lg font-semibold text-ink-900 dark:text-white">
            Status systemu
          </h2>
          <div className="flex flex-wrap gap-3">
            {alerts.map((a, i) => (
              <div
                key={i}
                className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-fluid-sm ${
                  a.level === "critical"
                    ? "border-rose-300 bg-rose-50 text-rose-900 dark:bg-rose-950 dark:text-rose-100"
                    : a.level === "warning"
                      ? "border-amber-300 bg-amber-50 text-amber-900 dark:bg-amber-950 dark:text-amber-100"
                      : "border-emerald-300 bg-emerald-50 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-100"
                }`}
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <div className="flex flex-col">
                  <span className="font-semibold">{a.title}</span>
                  <span className="text-fluid-xs opacity-80">{a.description}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Real-time KPI */}
      <section aria-labelledby="rt-heading" className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 id="rt-heading" className="text-fluid-lg font-semibold text-ink-900 dark:text-white">
            Ostatnia godzina
          </h2>
          <TrendBadge value={realtime.cases_trend} />
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {kpiCards.map((c) => (
            <Card key={c.label}>
              <CardContent className="flex items-center gap-3 pt-6">
                <div className="rounded-lg bg-dlugomat-50 p-2 text-dlugomat-700 dark:bg-dlugomat-900 dark:text-dlugomat-300">
                  <c.icon className="h-5 w-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-fluid-xs text-ink-500">{c.label}</span>
                  <span className="text-fluid-xl font-bold text-ink-900 dark:text-white">{c.value}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Stan kolejki */}
      <section aria-labelledby="queue-heading" className="flex flex-col gap-3">
        <h2 id="queue-heading" className="flex items-center gap-2 text-fluid-lg font-semibold text-ink-900 dark:text-white">
          <Zap className="h-5 w-5 text-amber-500" />
          Stan kolejek
        </h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {queueCards.map((c) => (
            <Card key={c.label}>
              <CardContent className="pt-6">
                <span className="block text-fluid-xs text-ink-500">{c.label}</span>
                <span className="mt-1 block text-fluid-xl font-bold text-ink-900 dark:text-white">{c.value}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Business KPI */}
      <section aria-labelledby="biz-heading" className="flex flex-col gap-3">
        <h2 id="biz-heading" className="flex items-center gap-2 text-fluid-lg font-semibold text-ink-900 dark:text-white">
          <Activity className="h-5 w-5 text-emerald-500" />
          Wskaźniki biznesowe (30d)
        </h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {businessCards.map((c) => (
            <Card key={c.label}>
              <CardContent className="pt-6">
                <span className="block text-fluid-xs text-ink-500">{c.label}</span>
                <span className="mt-1 block text-fluid-xl font-bold text-ink-900 dark:text-white">{c.value}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <p className="text-fluid-xs text-ink-400">
        Auto-refresh co 60s · cache: dynamic · źródło: Supabase
      </p>
    </div>
  );
}
