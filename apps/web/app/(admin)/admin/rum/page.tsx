import type { Metadata } from "next";
import { Activity, Gauge, MousePointerClick, Timer } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createServerSupabase } from "@/lib/db/supabase-server";

export const metadata: Metadata = {
  title: "RUM Dashboard · Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

interface AggregatedMetric {
  metric_name: string;
  p50: number;
  p75: number;
  p95: number;
  good_pct: number;
  poor_pct: number;
  samples: number;
}

function formatMs(v: number, unit: "ms" | "score" = "ms"): string {
  if (unit === "score") return v.toFixed(3);
  if (v < 1000) return `${Math.round(v)}ms`;
  return `${(v / 1000).toFixed(2)}s`;
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const idx = Math.floor((p / 100) * (sorted.length - 1));
  return sorted[idx];
}

async function fetchRumAggregates(): Promise<AggregatedMetric[]> {
  const sb = await createServerSupabase();
  const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
  const { data } = await sb
    .from("rum_samples")
    .select("metric_name, value, rating")
    .gte("timestamp", since)
    .limit(50000);

  const samples = (data ?? []) as Array<{ metric_name: string; value: number; rating: string }>;
  const grouped: Record<string, number[]> = {};
  const ratings: Record<string, { good: number; poor: number; total: number }> = {};

  for (const s of samples) {
    if (!grouped[s.metric_name]) {
      grouped[s.metric_name] = [];
      ratings[s.metric_name] = { good: 0, poor: 0, total: 0 };
    }
    grouped[s.metric_name].push(s.value);
    ratings[s.metric_name].total++;
    if (s.rating === "good") ratings[s.metric_name].good++;
    if (s.rating === "poor") ratings[s.metric_name].poor++;
  }

  return Object.entries(grouped).map(([name, vals]) => {
    const sorted = [...vals].sort((a, b) => a - b);
    const r = ratings[name];
    return {
      metric_name: name,
      p50: percentile(sorted, 50),
      p75: percentile(sorted, 75),
      p95: percentile(sorted, 95),
      good_pct: r.total > 0 ? (r.good / r.total) * 100 : 0,
      poor_pct: r.total > 0 ? (r.poor / r.total) * 100 : 0,
      samples: r.total,
    };
  });
}

const METRIC_META: Record<string, { label: string; icon: any; unit: "ms" | "score"; threshold_good: number }> = {
  LCP: { label: "Largest Contentful Paint", icon: Timer, unit: "ms", threshold_good: 2500 },
  FCP: { label: "First Contentful Paint", icon: Timer, unit: "ms", threshold_good: 1800 },
  TTFB: { label: "Time to First Byte", icon: Gauge, unit: "ms", threshold_good: 800 },
  FID: { label: "First Input Delay", icon: MousePointerClick, unit: "ms", threshold_good: 100 },
  INP: { label: "Interaction to Next Paint", icon: MousePointerClick, unit: "ms", threshold_good: 200 },
  CLS: { label: "Cumulative Layout Shift", icon: Activity, unit: "score", threshold_good: 0.1 },
};

export default async function RumDashboardPage() {
  const metrics = await fetchRumAggregates();

  // Sort by Core Web Vitals order
  const order = ["LCP", "INP", "CLS", "FCP", "TTFB", "FID"];
  metrics.sort((a, b) => order.indexOf(a.metric_name) - order.indexOf(b.metric_name));

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <header>
        <h1 className="text-fluid-2xl font-bold text-iron-900 dark:text-white">RUM Dashboard</h1>
        <p className="mt-1 text-fluid-base text-iron-600 dark:text-iron-300">
          Real-User Monitoring — Web Vitals z ostatnich 24h.
        </p>
      </header>

      {metrics.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-fluid-sm text-iron-500">
              Brak danych RUM z ostatnich 24h. Sprawdź czy `web-vitals` jest załadowany w layoucie.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {metrics.map((m) => {
            const meta = METRIC_META[m.metric_name] ?? {
              label: m.metric_name,
              icon: Activity,
              unit: "ms" as const,
              threshold_good: 1000,
            };
            const Icon = meta.icon;
            const overallTone = m.good_pct >= 75 ? "success" : m.poor_pct >= 25 ? "warning" : "neutral";
            return (
              <Card key={m.metric_name}>
                <CardHeader className="flex flex-row items-start justify-between gap-2">
                  <div className="flex items-start gap-2">
                    <div className="rounded-md bg-dlugomat-50 p-2 text-dlugomat-700 dark:bg-dlugomat-800 dark:text-dlugomat-300">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <CardTitle className="text-fluid-base">{m.metric_name}</CardTitle>
                      <CardDescription className="text-fluid-xs">{meta.label}</CardDescription>
                    </div>
                  </div>
                  <Badge tone={overallTone as any} withDot>
                    {m.good_pct.toFixed(0)}% good
                  </Badge>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <span className="block text-fluid-xs text-iron-500">p50</span>
                      <span className="block text-fluid-sm font-semibold">{formatMs(m.p50, meta.unit)}</span>
                    </div>
                    <div>
                      <span className="block text-fluid-xs text-iron-500">p75</span>
                      <span className="block text-fluid-sm font-semibold">{formatMs(m.p75, meta.unit)}</span>
                    </div>
                    <div>
                      <span className="block text-fluid-xs text-iron-500">p95</span>
                      <span className="block text-fluid-sm font-semibold">{formatMs(m.p95, meta.unit)}</span>
                    </div>
                  </div>
                  <div className="mt-3 flex h-2 overflow-hidden rounded-full bg-iron-100 dark:bg-dlugomat-800">
                    <span style={{ width: `${m.good_pct}%` }} className="bg-emerald-500" />
                    <span
                      style={{ width: `${100 - m.good_pct - m.poor_pct}%` }}
                      className="bg-amber-400"
                    />
                    <span style={{ width: `${m.poor_pct}%` }} className="bg-rose-500" />
                  </div>
                  <p className="mt-2 text-fluid-xs text-iron-400">
                    {m.samples.toLocaleString("pl-PL")} próbek · próg good: {formatMs(meta.threshold_good, meta.unit)}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
