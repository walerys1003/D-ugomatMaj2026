import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkline } from "@/components/analytics/sparkline";

export const metadata: Metadata = { title: "Revenue | Admin Analytics | Długomat" };

interface RevenueOverview {
  mrr_pln: number;
  mrr_change_percent: number;
  arr_pln: number;
  net_revenue_retention_percent: number;
  active_subscriptions: number;
  new_mrr_30d: number;
  expansion_mrr_30d: number;
  churned_mrr_30d: number;
  by_plan: Array<{ plan: string; mrr_pln: number; subs: number }>;
  mrr_trend_90d: number[];
  arr_trend_90d: number[];
}

async function fetchRevenue(): Promise<RevenueOverview | null> {
  try {
    const res = await fetch("/api/admin/analytics/revenue", { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as RevenueOverview;
  } catch {
    return null;
  }
}

export default async function RevenuePage() {
  const data = await fetchRevenue();
  if (!data) {
    return (
      <main className="container mx-auto px-4 py-12 max-w-6xl">
        <p className="text-ink-600">Brak danych.</p>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-7xl space-y-6">
      <div>
        <Link href="/admin/dashboard" className="text-xs text-ink-500 hover:text-ink-700">
          ← Admin
        </Link>
        <h1 className="font-display text-3xl font-semibold text-ink-900 dark:text-ink-50 mt-2">
          Revenue
        </h1>
        <p className="text-sm text-ink-500 mt-1">
          MRR · ARR · NRR · ruch przychodów w czasie
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <BigStat
          label="MRR"
          value={`${data.mrr_pln.toLocaleString("pl-PL")} zł`}
          delta={data.mrr_change_percent}
          spark={data.mrr_trend_90d}
        />
        <BigStat
          label="ARR"
          value={`${(data.arr_pln / 1000).toFixed(0)}k zł`}
          spark={data.arr_trend_90d}
        />
        <BigStat label="NRR" value={`${data.net_revenue_retention_percent}%`} />
        <BigStat
          label="Aktywne subskrypcje"
          value={data.active_subscriptions.toLocaleString("pl-PL")}
        />
      </div>

      <Card elevation="subtle">
        <CardHeader>
          <CardTitle>Ruch MRR (ostatnie 30 dni)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-3 gap-3">
            <MovementCard
              label="New"
              value={data.new_mrr_30d}
              color="text-accent-700"
            />
            <MovementCard
              label="Expansion"
              value={data.expansion_mrr_30d}
              color="text-accent-700"
            />
            <MovementCard
              label="Churn"
              value={-data.churned_mrr_30d}
              color="text-danger-700"
            />
          </div>
        </CardContent>
      </Card>

      <Card elevation="subtle">
        <CardHeader>
          <CardTitle>MRR według planu</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-ink-200 dark:border-ink-800 text-xs uppercase tracking-wider text-ink-500">
                <th className="py-2 pr-3">Plan</th>
                <th className="py-2 pr-3 text-right">Subskrypcje</th>
                <th className="py-2 pr-3 text-right">MRR</th>
                <th className="py-2 pr-3 text-right">Udział</th>
              </tr>
            </thead>
            <tbody>
              {data.by_plan.map((row) => {
                const share = (row.mrr_pln / data.mrr_pln) * 100;
                return (
                  <tr
                    key={row.plan}
                    className="border-b border-ink-100 dark:border-ink-900"
                  >
                    <td className="py-2 pr-3 capitalize font-medium text-ink-900 dark:text-ink-50">
                      {row.plan}
                    </td>
                    <td className="py-2 pr-3 text-right">{row.subs}</td>
                    <td className="py-2 pr-3 text-right font-medium">
                      {row.mrr_pln.toLocaleString("pl-PL")} zł
                    </td>
                    <td className="py-2 pr-3 text-right text-ink-500">
                      {share.toFixed(1)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </main>
  );
}

function BigStat({
  label,
  value,
  delta,
  spark,
}: {
  label: string;
  value: string;
  delta?: number;
  spark?: number[];
}) {
  return (
    <Card elevation="pop">
      <CardContent className="pt-5">
        <div className="text-xs uppercase tracking-wider text-ink-500 mb-1">{label}</div>
        <div className="font-display text-2xl font-semibold text-ink-900 dark:text-ink-50">
          {value}
        </div>
        {typeof delta === "number" && (
          <div
            className={`text-xs mt-1 ${
              delta >= 0 ? "text-accent-700" : "text-danger-700"
            }`}
          >
            {delta >= 0 ? "▲" : "▼"} {Math.abs(delta).toFixed(1)}%
          </div>
        )}
        {spark && (
          <div className="mt-2 text-accent-600">
            <Sparkline data={spark} width={140} height={32} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function MovementCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="rounded-lg border border-ink-200 dark:border-ink-800 px-4 py-3">
      <div className="text-xs uppercase tracking-wider text-ink-500 mb-1">{label}</div>
      <div className={`font-display text-xl font-semibold ${color}`}>
        {value >= 0 ? "+" : ""}
        {value.toLocaleString("pl-PL")} zł
      </div>
    </div>
  );
}
