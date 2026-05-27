import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, BarChart3, Beaker, TrendingDown, TrendingUp, Users } from "lucide-react";

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
  title: "Eksperyment A/B — szczegóły",
  robots: { index: false, follow: false },
};

interface PageProps {
  params: Promise<{ id: string }>;
}

interface Variant {
  id: string;
  name: string;
  is_control: boolean;
  traffic_pct: number;
  visitors: number;
  conversions: number;
  conversion_rate: number;
  uplift_pct: number;
  confidence_pct: number;
}

interface Experiment {
  id: string;
  name: string;
  hypothesis: string;
  primary_metric: string;
  status: "running" | "paused" | "concluded";
  started_at: string;
  estimated_end: string;
  min_sample_size: number;
  variants: Variant[];
  winner: string | null;
}

async function loadExperiment(id: string): Promise<Experiment> {
  return {
    id,
    name: "Landing — naglowek hero",
    hypothesis: "Bardziej precyzyjny naglowek zwiekszy CTR przycisku 'Sprawdz swoja sprawe' o min. 10%.",
    primary_metric: "Klikniecia CTA hero / unikalni odwiedzajacy",
    status: "running",
    started_at: "2026-04-22",
    estimated_end: "2026-05-18",
    min_sample_size: 4000,
    variants: [
      {
        id: "v_control",
        name: "Kontrola — 'Twoj przewodnik po dlugach'",
        is_control: true,
        traffic_pct: 50,
        visitors: 3214,
        conversions: 286,
        conversion_rate: 8.9,
        uplift_pct: 0,
        confidence_pct: 100,
      },
      {
        id: "v_b",
        name: "B — 'Wygraj z dlugiem w 90 dni'",
        is_control: false,
        traffic_pct: 50,
        visitors: 3198,
        conversions: 358,
        conversion_rate: 11.2,
        uplift_pct: 25.8,
        confidence_pct: 96.4,
      },
    ],
    winner: null,
  };
}

const STATUS_TONE: Record<Experiment["status"], "info" | "warning" | "success"> = {
  running: "info",
  paused: "warning",
  concluded: "success",
};

export default async function EksperymentDetailPage({ params }: PageProps) {
  const { id } = await params;
  const exp = await loadExperiment(id);
  const totalVisitors = exp.variants.reduce((s, v) => s + v.visitors, 0);
  const progressPct = Math.min(100, Math.round((totalVisitors / exp.min_sample_size) * 100));
  const leader = [...exp.variants].sort((a, b) => b.conversion_rate - a.conversion_rate)[0];

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin/eksperymenty"
          className="inline-flex items-center gap-2 text-sm text-iron-600 hover:text-dlugomat-900 focus-visible:outline-none focus-visible:shadow-shield-focus rounded"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Wróć do listy eksperymentów
        </Link>
      </div>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.18em] text-iron-500">
            Eksperyment A/B · {exp.id}
          </p>
          <h1 className="font-display text-fluid-h1 text-dlugomat-950">{exp.name}</h1>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={STATUS_TONE[exp.status]} withDot>
              {exp.status === "running" ? "trwa" : exp.status === "paused" ? "wstrzymany" : "zakończony"}
            </Badge>
            <Badge tone="neutral">{exp.started_at} → {exp.estimated_end}</Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary">Wstrzymaj</Button>
          <Button variant="success">Ogłoś zwycięzcę</Button>
        </div>
      </header>

      <Card urgency="normal">
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <Beaker className="mt-1 h-5 w-5 text-dlugomat-700 flex-shrink-0" aria-hidden />
            <div>
              <p className="text-xs uppercase tracking-wide text-iron-500">Hipoteza</p>
              <p className="mt-1 text-dlugomat-900">{exp.hypothesis}</p>
              <p className="mt-3 text-xs uppercase tracking-wide text-iron-500">Główna metryka</p>
              <p className="text-sm font-medium text-dlugomat-900">{exp.primary_metric}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <section className="grid gap-4 lg:grid-cols-4" aria-label="KPI eksperymentu">
        <Card>
          <CardHeader>
            <CardDescription>Próba</CardDescription>
            <CardTitle className="font-display text-fluid-h3 text-dlugomat-950">
              {totalVisitors.toLocaleString("pl-PL")} / {exp.min_sample_size.toLocaleString("pl-PL")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-2 w-full rounded-full bg-iron-100">
              <div
                className="h-2 rounded-full bg-dlugomat-700"
                style={{ width: `${progressPct}%` }}
                aria-hidden
              />
            </div>
            <p className="mt-2 text-xs text-iron-500">{progressPct}% min. wielkości próby</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Konwersje łącznie</CardDescription>
            <CardTitle className="font-display text-fluid-h3 text-dlugomat-950">
              {exp.variants.reduce((s, v) => s + v.conversions, 0).toLocaleString("pl-PL")}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card urgency={leader.confidence_pct >= 95 ? "success" : "normal"}>
          <CardHeader>
            <CardDescription>Lider</CardDescription>
            <CardTitle className="font-display text-fluid-h4 text-dlugomat-950">
              {leader.is_control ? "Kontrola" : "Wariant B"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-iron-500">CR: {leader.conversion_rate.toFixed(1)}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Poziom ufności</CardDescription>
            <CardTitle className={`font-display text-fluid-h3 ${leader.confidence_pct >= 95 ? "text-accent-700" : "text-warn"}`}>
              {leader.confidence_pct.toFixed(1)}%
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-iron-500">
              {leader.confidence_pct >= 95 ? "Wynik istotny statystycznie" : "Wymaga więcej danych"}
            </p>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Wyniki per wariant</CardTitle>
          <CardDescription>Porównanie konwersji i upliftu</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            {exp.variants.map((v) => (
              <li key={v.id} className="rounded-lg border border-iron-200 bg-white p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-start gap-2">
                    {v.is_control ? (
                      <Badge tone="neutral">Kontrola</Badge>
                    ) : (
                      <Badge tone={v.uplift_pct > 0 ? "success" : "warning"}>Wariant testowy</Badge>
                    )}
                    <div>
                      <h3 className="font-semibold text-dlugomat-950">{v.name}</h3>
                      <p className="mt-1 text-xs text-iron-500">
                        <Users className="mr-1 inline h-3 w-3" aria-hidden />
                        {v.traffic_pct}% ruchu · {v.visitors.toLocaleString("pl-PL")} odwiedzających
                      </p>
                    </div>
                  </div>
                  {!v.is_control ? (
                    <div className="text-right">
                      <p className="font-display text-2xl">
                        {v.uplift_pct > 0 ? (
                          <span className="text-accent-700">
                            <TrendingUp className="mr-1 inline h-5 w-5" aria-hidden />
                            +{v.uplift_pct.toFixed(1)}%
                          </span>
                        ) : (
                          <span className="text-danger">
                            <TrendingDown className="mr-1 inline h-5 w-5" aria-hidden />
                            {v.uplift_pct.toFixed(1)}%
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-iron-500">vs kontrola</p>
                    </div>
                  ) : null}
                </div>

                <dl className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-iron-500">Konwersje</dt>
                    <dd className="font-display text-lg text-dlugomat-950">{v.conversions}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-iron-500">Współczynnik konwersji</dt>
                    <dd className="font-display text-lg text-dlugomat-950">{v.conversion_rate.toFixed(2)}%</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-iron-500">Poziom ufności</dt>
                    <dd className={`font-display text-lg ${v.confidence_pct >= 95 ? "text-accent-700" : "text-warn"}`}>
                      {v.confidence_pct.toFixed(1)}%
                    </dd>
                  </div>
                </dl>
              </li>
            ))}
          </ul>

          <div className="mt-6 border-t border-iron-100 pt-4">
            <p className="text-xs uppercase tracking-wide text-iron-500">
              <BarChart3 className="mr-1 inline h-3 w-3" aria-hidden />
              Test statystyczny: dwustronny z-test, alpha = 0.05
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
