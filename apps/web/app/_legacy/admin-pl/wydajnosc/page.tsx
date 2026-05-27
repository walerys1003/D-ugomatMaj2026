import type { Metadata } from "next";

import { requireAdminOrRedirect } from "@/lib/admin/rbac";
import { createSupabaseAdminClient } from "@/lib/db/supabase-server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Wydajność — Web Vitals — Admin",
  robots: { index: false, follow: false },
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Tier 5 zad. 229 — Web Vitals admin dashboard.
 *
 * Pokazuje P75 dla LCP / INP / CLS / FCP / TTFB w ostatnich 24 h oraz 7 dniach,
 * podział per-URL (top 10 najwolniejszych ścieżek). Wartości są oceniane wg
 * progów Google: LCP <=2.5s, INP <=200ms, CLS <=0.1.
 */

type MetricName = "LCP" | "INP" | "CLS" | "FCP" | "TTFB" | "FID";

interface VitalRow {
  metric_name: MetricName;
  value: number;
  rating: string | null;
  url_path: string | null;
  created_at: string;
}

interface MetricStat {
  name: MetricName;
  count: number;
  p75: number | null;
  p50: number | null;
  goodPct: number;
  poorPct: number;
}

interface UrlStat {
  url_path: string;
  count: number;
  p75: number;
}

const METRIC_ORDER: MetricName[] = ["LCP", "INP", "CLS", "FCP", "TTFB"];

const METRIC_UNIT: Record<MetricName, string> = {
  LCP: "ms",
  INP: "ms",
  FCP: "ms",
  TTFB: "ms",
  FID: "ms",
  CLS: "", // unitless
};

const METRIC_LABEL: Record<MetricName, string> = {
  LCP: "Largest Contentful Paint",
  INP: "Interaction to Next Paint",
  CLS: "Cumulative Layout Shift",
  FCP: "First Contentful Paint",
  TTFB: "Time to First Byte",
  FID: "First Input Delay",
};

const THRESHOLDS: Record<MetricName, { good: number; poor: number }> = {
  LCP: { good: 2500, poor: 4000 },
  INP: { good: 200, poor: 500 },
  CLS: { good: 0.1, poor: 0.25 },
  FCP: { good: 1800, poor: 3000 },
  TTFB: { good: 800, poor: 1800 },
  FID: { good: 100, poor: 300 },
};

function percentile(sorted: number[], p: number): number | null {
  if (sorted.length === 0) return null;
  const idx = Math.min(sorted.length - 1, Math.floor((sorted.length - 1) * p));
  return sorted[idx];
}

function classify(name: MetricName, value: number): "good" | "needs-improvement" | "poor" {
  const t = THRESHOLDS[name];
  if (value <= t.good) return "good";
  if (value <= t.poor) return "needs-improvement";
  return "poor";
}

function formatValue(name: MetricName, value: number | null): string {
  if (value === null) return "—";
  if (name === "CLS") return value.toFixed(3);
  return `${Math.round(value)} ${METRIC_UNIT[name]}`.trim();
}

function toneForP75(name: MetricName, p75: number | null): "success" | "warning" | "danger" | "neutral" {
  if (p75 === null) return "neutral";
  const cls = classify(name, p75);
  if (cls === "good") return "success";
  if (cls === "needs-improvement") return "warning";
  return "danger";
}

function computeStats(rows: VitalRow[]): Record<MetricName, MetricStat> {
  const out = {} as Record<MetricName, MetricStat>;
  for (const name of METRIC_ORDER) {
    const values = rows
      .filter((r) => r.metric_name === name && Number.isFinite(r.value))
      .map((r) => Number(r.value))
      .sort((a, b) => a - b);

    const total = values.length;
    let goodCnt = 0;
    let poorCnt = 0;
    for (const v of values) {
      const cls = classify(name, v);
      if (cls === "good") goodCnt += 1;
      else if (cls === "poor") poorCnt += 1;
    }

    out[name] = {
      name,
      count: total,
      p75: percentile(values, 0.75),
      p50: percentile(values, 0.5),
      goodPct: total === 0 ? 0 : Math.round((goodCnt / total) * 100),
      poorPct: total === 0 ? 0 : Math.round((poorCnt / total) * 100),
    };
  }
  return out;
}

function computeSlowestUrls(rows: VitalRow[], metric: MetricName, limit = 10): UrlStat[] {
  const buckets = new Map<string, number[]>();
  for (const r of rows) {
    if (r.metric_name !== metric || !r.url_path || !Number.isFinite(r.value)) continue;
    const arr = buckets.get(r.url_path) ?? [];
    arr.push(Number(r.value));
    buckets.set(r.url_path, arr);
  }

  const result: UrlStat[] = [];
  for (const [url_path, vals] of buckets.entries()) {
    if (vals.length < 5) continue; // need minimum sample size
    vals.sort((a, b) => a - b);
    const p75 = percentile(vals, 0.75);
    if (p75 === null) continue;
    result.push({ url_path, count: vals.length, p75 });
  }

  result.sort((a, b) => b.p75 - a.p75);
  return result.slice(0, limit);
}

export default async function AdminWebVitalsPage() {
  await requireAdminOrRedirect();

  const admin = createSupabaseAdminClient();
  if (!admin) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Web Vitals</h1>
        <Card>
          <CardContent className="py-6">
            <p className="text-sm text-muted-foreground">
              Brak konfiguracji Supabase Admin — uzupełnij <code>SUPABASE_SERVICE_ROLE_KEY</code>.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const now = Date.now();
  const since24h = new Date(now - 24 * 60 * 60 * 1000).toISOString();
  const since7d = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [r24, r7d] = await Promise.all([
    admin
      .from("web_vitals")
      .select("metric_name,value,rating,url_path,created_at")
      .gte("created_at", since24h)
      .limit(10000),
    admin
      .from("web_vitals")
      .select("metric_name,value,rating,url_path,created_at")
      .gte("created_at", since7d)
      .limit(50000),
  ]);

  const rows24 = ((r24.data ?? []) as VitalRow[]).filter((r) =>
    METRIC_ORDER.includes(r.metric_name),
  );
  const rows7d = ((r7d.data ?? []) as VitalRow[]).filter((r) =>
    METRIC_ORDER.includes(r.metric_name),
  );

  const stats24 = computeStats(rows24);
  const stats7d = computeStats(rows7d);

  const slowLcp = computeSlowestUrls(rows7d, "LCP");
  const slowInp = computeSlowestUrls(rows7d, "INP");

  const totalSamples24 = rows24.length;
  const totalSamples7d = rows7d.length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Web Vitals</h1>
          <p className="text-sm text-muted-foreground">
            Core Web Vitals z ostatnich 24 h i 7 dni — P75 wg progów Google.
          </p>
        </div>
        <div className="flex gap-2 text-sm text-muted-foreground">
          <Badge tone="neutral">24h: {totalSamples24.toLocaleString("pl-PL")} próbek</Badge>
          <Badge tone="neutral">7d: {totalSamples7d.toLocaleString("pl-PL")} próbek</Badge>
        </div>
      </div>

      <section>
        <h2 className="mb-3 text-lg font-medium">P75 — ostatnie 24h</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {METRIC_ORDER.map((m) => {
            const s = stats24[m];
            return (
              <Card key={`24-${m}`}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium uppercase tracking-wide">
                    {m}
                  </CardTitle>
                  <CardDescription className="text-xs">{METRIC_LABEL[m]}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-semibold tabular-nums">
                      {formatValue(m, s.p75)}
                    </span>
                    <Badge tone={toneForP75(m, s.p75)}>
                      {s.p75 === null ? "—" : classify(m, s.p75)}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    P50: {formatValue(m, s.p50)} · n={s.count}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Good: {s.goodPct}% · Poor: {s.poorPct}%
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-medium">P75 — ostatnie 7 dni</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {METRIC_ORDER.map((m) => {
            const s = stats7d[m];
            return (
              <Card key={`7d-${m}`}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium uppercase tracking-wide">
                    {m}
                  </CardTitle>
                  <CardDescription className="text-xs">7 dni · n={s.count}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-semibold tabular-nums">
                      {formatValue(m, s.p75)}
                    </span>
                    <Badge tone={toneForP75(m, s.p75)}>
                      {s.p75 === null ? "—" : classify(m, s.p75)}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    P50: {formatValue(m, s.p50)} · Good {s.goodPct}% · Poor {s.poorPct}%
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Najwolniejsze strony — LCP (7 dni)</CardTitle>
            <CardDescription>Top 10 ścieżek z najwyższym P75 (min. 5 próbek).</CardDescription>
          </CardHeader>
          <CardContent>
            {slowLcp.length === 0 ? (
              <p className="text-sm text-muted-foreground">Brak wystarczających danych.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="py-2 text-left font-medium">URL</th>
                    <th className="py-2 text-right font-medium">P75 LCP</th>
                    <th className="py-2 text-right font-medium">n</th>
                  </tr>
                </thead>
                <tbody>
                  {slowLcp.map((u) => (
                    <tr key={u.url_path} className="border-b last:border-0">
                      <td className="py-2">
                        <code className="text-xs">{u.url_path}</code>
                      </td>
                      <td className="py-2 text-right tabular-nums">
                        <Badge tone={toneForP75("LCP", u.p75)}>{formatValue("LCP", u.p75)}</Badge>
                      </td>
                      <td className="py-2 text-right tabular-nums text-muted-foreground">
                        {u.count}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Najwolniejsze strony — INP (7 dni)</CardTitle>
            <CardDescription>Top 10 ścieżek z najwyższym P75 (min. 5 próbek).</CardDescription>
          </CardHeader>
          <CardContent>
            {slowInp.length === 0 ? (
              <p className="text-sm text-muted-foreground">Brak wystarczających danych.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="py-2 text-left font-medium">URL</th>
                    <th className="py-2 text-right font-medium">P75 INP</th>
                    <th className="py-2 text-right font-medium">n</th>
                  </tr>
                </thead>
                <tbody>
                  {slowInp.map((u) => (
                    <tr key={u.url_path} className="border-b last:border-0">
                      <td className="py-2">
                        <code className="text-xs">{u.url_path}</code>
                      </td>
                      <td className="py-2 text-right tabular-nums">
                        <Badge tone={toneForP75("INP", u.p75)}>{formatValue("INP", u.p75)}</Badge>
                      </td>
                      <td className="py-2 text-right tabular-nums text-muted-foreground">
                        {u.count}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Progi Google (referencja)</CardTitle>
          <CardDescription>
            P75 powyżej „good” oznacza, że ≥25% użytkowników doświadcza pogorszonej jakości.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-xs uppercase tracking-wide text-muted-foreground">
                <th className="py-2 text-left font-medium">Metryka</th>
                <th className="py-2 text-right font-medium">Good ≤</th>
                <th className="py-2 text-right font-medium">Needs-improvement ≤</th>
                <th className="py-2 text-right font-medium">Poor &gt;</th>
              </tr>
            </thead>
            <tbody>
              {METRIC_ORDER.map((m) => (
                <tr key={`th-${m}`} className="border-b last:border-0">
                  <td className="py-2 font-medium">{m}</td>
                  <td className="py-2 text-right tabular-nums">{formatValue(m, THRESHOLDS[m].good)}</td>
                  <td className="py-2 text-right tabular-nums">{formatValue(m, THRESHOLDS[m].poor)}</td>
                  <td className="py-2 text-right tabular-nums">{formatValue(m, THRESHOLDS[m].poor)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
