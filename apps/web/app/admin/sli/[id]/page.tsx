import type { Metadata } from "next";
import Link from "next/link";
import { Activity, ArrowLeft, BellRing, TrendingDown, TrendingUp } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "SLI — szczegóły",
  robots: { index: false, follow: false },
};

interface PageProps {
  params: Promise<{ id: string }>;
}

interface SliDetail {
  id: string;
  name: string;
  category: "availability" | "latency" | "error_rate" | "quality";
  slo_target: number;
  slo_unit: "%" | "ms";
  current_value: number;
  status: "on_track" | "at_risk" | "breached";
  window: "7d" | "30d" | "90d";
  error_budget_remaining: number;
  burn_rate: number;
  series: number[];
  incidents: Array<{ id: string; ts: string; summary: string; severity: "P1" | "P2" | "P3" }>;
}

const STATUS_TONE: Record<SliDetail["status"], "success" | "warning" | "danger"> = {
  on_track: "success",
  at_risk: "warning",
  breached: "danger",
};

async function loadSli(id: string): Promise<SliDetail> {
  return {
    id,
    name: "Dostępność API (publiczne endpointy)",
    category: "availability",
    slo_target: 99.9,
    slo_unit: "%",
    current_value: 99.94,
    status: "on_track",
    window: "30d",
    error_budget_remaining: 72,
    burn_rate: 0.41,
    series: [99.98, 99.96, 99.94, 99.99, 99.91, 99.97, 99.94],
    incidents: [
      {
        id: "inc_021",
        ts: "2026-04-28T03:14:00Z",
        summary: "Spadek dostępności 99.6% przez 11 min — provider DB",
        severity: "P2",
      },
      {
        id: "inc_018",
        ts: "2026-04-12T16:42:00Z",
        summary: "Restart edge node EU-CENTRAL — 3 min",
        severity: "P3",
      },
    ],
  };
}

export default async function AdminSliDetailPage({ params }: PageProps) {
  const { id } = await params;
  const s = await loadSli(id);
  const isAbove = s.current_value >= s.slo_target;

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin/sli"
          className="inline-flex items-center gap-2 text-sm text-iron-600 hover:text-dlugomat-900 focus-visible:outline-none focus-visible:shadow-shield-focus rounded"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Wróć do listy SLI
        </Link>
      </div>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.18em] text-iron-500">
            SLI · {s.id} · okno {s.window}
          </p>
          <h1 className="font-display text-fluid-h1 text-dlugomat-950">{s.name}</h1>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={STATUS_TONE[s.status]} withDot>
              {s.status === "on_track"
                ? "w celu"
                : s.status === "at_risk"
                ? "zagrożone"
                : "naruszone"}
            </Badge>
            <Badge tone="neutral">{s.category}</Badge>
          </div>
        </div>
        <Button variant="secondary">
          <BellRing className="mr-2 h-4 w-4" aria-hidden />
          Skonfiguruj alerty
        </Button>
      </header>

      <section className="grid gap-4 lg:grid-cols-4" aria-label="Stan SLI">
        <Card urgency={s.status === "on_track" ? "success" : s.status === "at_risk" ? "warning" : "critical"}>
          <CardHeader>
            <CardDescription>Wartość aktualna</CardDescription>
            <CardTitle className="font-display text-fluid-h2 text-dlugomat-950">
              {s.current_value.toFixed(2)}
              {s.slo_unit}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="flex items-center gap-1 text-xs">
              {isAbove ? (
                <TrendingUp className="h-3 w-3 text-accent-700" aria-hidden />
              ) : (
                <TrendingDown className="h-3 w-3 text-danger" aria-hidden />
              )}
              <span className={isAbove ? "text-accent-700" : "text-danger"}>
                Cel: {s.slo_target}
                {s.slo_unit}
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Pozostały error budget</CardDescription>
            <CardTitle className="font-display text-fluid-h2 text-dlugomat-950">
              {s.error_budget_remaining}%
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-2 w-full rounded-full bg-iron-100">
              <div
                className="h-2 rounded-full bg-accent-600"
                style={{ width: `${s.error_budget_remaining}%` }}
                aria-hidden
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Burn rate</CardDescription>
            <CardTitle className="font-display text-fluid-h2 text-dlugomat-950">
              {s.burn_rate.toFixed(2)}x
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-iron-500">
              {s.burn_rate < 1 ? "Bezpieczne tempo zużycia" : "Przekraczamy budżet błędów"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Incydenty (30d)</CardDescription>
            <CardTitle className="font-display text-fluid-h2 text-dlugomat-950">
              {s.incidents.length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-iron-500">
              <Activity className="mr-1 inline h-3 w-3" aria-hidden />
              Wszystkie rozwiązane
            </p>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Trend dzienny</CardTitle>
          <CardDescription>Wartość SLI w ostatnich 7 dniach</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-2 h-32" aria-hidden>
            {s.series.map((v, i) => {
              const min = 99.8;
              const pct = ((v - min) / (100 - min)) * 100;
              return (
                <div
                  key={i}
                  className="flex-1 rounded-t bg-gradient-to-t from-dlugomat-700 to-dlugomat-500"
                  style={{ height: `${Math.max(pct, 6)}%` }}
                  title={`${v.toFixed(2)}%`}
                />
              );
            })}
          </div>
          <div className="mt-2 flex justify-between text-xs text-iron-500">
            {["Pn", "Wt", "Śr", "Cz", "Pt", "Sb", "Nd"].map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Powiązane incydenty</CardTitle>
          <CardDescription>Naruszenia SLO w bieżącym oknie</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="divide-y divide-iron-100">
            {s.incidents.map((inc) => (
              <li key={inc.id} className="flex items-start gap-3 py-3">
                <Badge
                  tone={inc.severity === "P1" ? "danger" : inc.severity === "P2" ? "warning" : "info"}
                  withDot
                >
                  {inc.severity}
                </Badge>
                <div className="flex-1">
                  <p className="text-sm font-medium text-dlugomat-900">{inc.summary}</p>
                  <p className="text-xs text-iron-500">
                    {new Intl.DateTimeFormat("pl-PL", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    }).format(new Date(inc.ts))}{" "}
                    · {inc.id}
                  </p>
                </div>
                <Link
                  href={`/admin/errors?incident=${inc.id}`}
                  className="text-xs text-dlugomat-700 hover:text-dlugomat-900 focus-visible:outline-none focus-visible:shadow-shield-focus rounded"
                >
                  Szczegóły →
                </Link>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
