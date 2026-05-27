import type { Metadata } from "next";
import Link from "next/link";
import {
  Activity,
  ArrowLeft,
  Cpu,
  Database,
  Gauge,
  Network,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Wydajność — szczegóły",
  robots: { index: false, follow: false },
};

interface Metric {
  id: string;
  name: string;
  category: "latency" | "throughput" | "resource" | "error";
  unit: string;
  current: number;
  p50: number;
  p95: number;
  p99: number;
  target: number;
  trend_24h: number[]; // 24 godziny
}

const METRICS: Metric[] = [
  { id: "m_001", name: "API latency (publiczne endpointy)", category: "latency", unit: "ms", current: 142, p50: 128, p95: 312, p99: 684, target: 400, trend_24h: [142, 138, 145, 152, 161, 148, 142, 139, 135, 141, 158, 167, 172, 168, 152, 144, 138, 134, 136, 142, 148, 152, 146, 142] },
  { id: "m_002", name: "Database query time", category: "latency", unit: "ms", current: 28, p50: 22, p95: 84, p99: 198, target: 100, trend_24h: [28, 26, 31, 34, 38, 32, 29, 26, 24, 27, 32, 36, 41, 38, 33, 29, 26, 24, 25, 28, 31, 33, 30, 28] },
  { id: "m_003", name: "Request throughput", category: "throughput", unit: "req/s", current: 487, p50: 412, p95: 624, p99: 712, target: 1000, trend_24h: [487, 462, 521, 584, 612, 548, 482, 421, 384, 412, 478, 524, 568, 542, 498, 462, 421, 387, 392, 421, 462, 498, 512, 487] },
  { id: "m_004", name: "CPU usage (avg)", category: "resource", unit: "%", current: 42, p50: 38, p95: 68, p99: 84, target: 80, trend_24h: [42, 41, 44, 47, 51, 48, 43, 39, 36, 38, 43, 47, 52, 49, 45, 42, 38, 35, 36, 38, 42, 45, 44, 42] },
  { id: "m_005", name: "Memory usage", category: "resource", unit: "%", current: 58, p50: 56, p95: 71, p99: 78, target: 85, trend_24h: [58, 57, 58, 59, 61, 60, 58, 57, 56, 57, 58, 60, 62, 61, 59, 58, 57, 56, 56, 57, 58, 59, 58, 58] },
  { id: "m_006", name: "Error rate", category: "error", unit: "%", current: 0.08, p50: 0.06, p95: 0.21, p99: 0.42, target: 0.5, trend_24h: [0.08, 0.07, 0.09, 0.11, 0.12, 0.09, 0.08, 0.06, 0.05, 0.06, 0.08, 0.10, 0.12, 0.11, 0.09, 0.08, 0.06, 0.05, 0.05, 0.06, 0.08, 0.09, 0.08, 0.08] },
];

const CAT_ICON = {
  latency: Gauge,
  throughput: Network,
  resource: Cpu,
  error: Activity,
} as const;

const CAT_LABEL: Record<Metric["category"], string> = {
  latency: "Latencja",
  throughput: "Przepustowość",
  resource: "Zasoby",
  error: "Błędy",
};

function status(current: number, target: number, lowerIsBetter = true): "success" | "warning" | "danger" {
  const ratio = current / target;
  if (lowerIsBetter) {
    if (ratio < 0.6) return "success";
    if (ratio < 0.9) return "warning";
    return "danger";
  } else {
    if (ratio > 0.9) return "success";
    if (ratio > 0.5) return "warning";
    return "danger";
  }
}

function fmtNum(n: number, unit: string): string {
  if (unit === "%") return `${n.toFixed(n < 1 ? 2 : 1)}%`;
  if (n >= 1000) return `${(n / 1000).toFixed(2)}k ${unit}`;
  return `${Math.round(n * 10) / 10} ${unit}`;
}

export default function WydajnoscSzczegolyPage() {
  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin/wydajnosc"
          className="inline-flex items-center gap-2 text-sm text-iron-600 hover:text-dlugomat-900 focus-visible:outline-none focus-visible:shadow-shield-focus rounded"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Wróć do dashboardu
        </Link>
      </div>

      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.18em] text-iron-500">
          Admin · wydajność · pełny widok
        </p>
        <h1 className="font-display text-fluid-h1 text-dlugomat-950">
          Metryki wydajności
        </h1>
        <p className="max-w-2xl text-iron-600">
          Wszystkie krytyczne wskaźniki wydajności systemu w jednym miejscu.
          Próbkowanie: 1 min, agregacja: 24 godziny.
        </p>
      </header>

      <ul className="space-y-4" aria-label="Lista metryk">
        {METRICS.map((m) => {
          const lowerBetter = m.category !== "throughput";
          const tone = status(m.current, m.target, lowerBetter);
          const max = Math.max(...m.trend_24h);
          const Icon = CAT_ICON[m.category];
          const isImproving = m.trend_24h[m.trend_24h.length - 1] < m.trend_24h[0];

          return (
            <li key={m.id}>
              <Card urgency={tone === "danger" ? "critical" : tone === "warning" ? "warning" : "normal"}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <span className="rounded-md bg-dlugomat-50 p-2">
                        <Icon className="h-5 w-5 text-dlugomat-700" aria-hidden />
                      </span>
                      <div>
                        <CardTitle>{m.name}</CardTitle>
                        <CardDescription>
                          <Badge tone="neutral">{CAT_LABEL[m.category]}</Badge>
                          <span className="ml-2 text-xs">cel: ≤ {fmtNum(m.target, m.unit)}</span>
                        </CardDescription>
                      </div>
                    </div>
                    <Badge tone={tone} withDot>
                      {tone === "success" ? "OK" : tone === "warning" ? "uwaga" : "krytyczne"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-5">
                    <StatBlock label="Aktualnie" value={fmtNum(m.current, m.unit)} highlight />
                    <StatBlock label="p50" value={fmtNum(m.p50, m.unit)} />
                    <StatBlock label="p95" value={fmtNum(m.p95, m.unit)} />
                    <StatBlock label="p99" value={fmtNum(m.p99, m.unit)} />
                    <StatBlock
                      label="Trend 24h"
                      value={isImproving ? "spada" : "rośnie"}
                      icon={isImproving ? TrendingDown : TrendingUp}
                      iconTone={(lowerBetter && isImproving) || (!lowerBetter && !isImproving) ? "success" : "warning"}
                    />
                  </div>

                  <div>
                    <p className="mb-2 text-xs text-iron-500">Trend ostatnich 24 godzin</p>
                    <div className="flex items-end gap-0.5 h-20" aria-hidden>
                      {m.trend_24h.map((v, i) => (
                        <div
                          key={i}
                          className="flex-1 rounded-t bg-gradient-to-t from-dlugomat-700 to-dlugomat-500 min-h-[2px]"
                          style={{ height: `${(v / max) * 100}%` }}
                          title={`h${i}: ${fmtNum(v, m.unit)}`}
                        />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </li>
          );
        })}
      </ul>

      <Card>
        <CardHeader>
          <CardTitle>
            <Database className="mr-2 inline h-4 w-4" aria-hidden />
            Stan infrastruktury
          </CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-3 sm:grid-cols-3 text-sm">
            <Info label="Region" value="EU-Central (Warszawa)" />
            <Info label="Wersja API" value="v2.18.4" />
            <Info label="Wersja Bazy" value="PostgreSQL 16.2" />
            <Info label="Replikacja" value="3 read replicas" />
            <Info label="Cache" value="Redis 7.2 (cluster x3)" />
            <Info label="CDN" value="Cloudflare Enterprise" />
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}

function StatBlock({
  label,
  value,
  highlight,
  icon: Icon,
  iconTone,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  icon?: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  iconTone?: "success" | "warning";
}) {
  return (
    <div className={`rounded-md border p-3 ${highlight ? "border-dlugomat-300 bg-dlugomat-50" : "border-iron-200 bg-iron-50/50"}`}>
      <p className="text-xs uppercase tracking-wide text-iron-500">{label}</p>
      <p className="mt-1 flex items-center gap-1 font-display text-lg text-dlugomat-950">
        {Icon ? (
          <Icon className={`h-4 w-4 ${iconTone === "success" ? "text-accent-700" : "text-warn"}`} aria-hidden />
        ) : null}
        {value}
      </p>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-iron-500">{label}</dt>
      <dd className="mt-0.5 text-dlugomat-900">{value}</dd>
    </div>
  );
}
