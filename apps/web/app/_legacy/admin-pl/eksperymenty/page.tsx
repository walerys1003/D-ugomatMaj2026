import type { Metadata } from "next";
import { Beaker, ChartLine, Plus } from "lucide-react";

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
  title: "Eksperymenty A/B · Admin · Długomat",
};

type Variant = {
  key: "A" | "B" | "C";
  label: string;
  traffic_percent: number;
  conversions: number;
  sample: number;
};

type Experiment = {
  id: string;
  hypothesis: string;
  metric: string;
  status: "draft" | "running" | "winner" | "stopped";
  started_at: string;
  variants: Variant[];
};

const EXPERIMENTS: Experiment[] = [
  {
    id: "exp_landing_hero_v2",
    hypothesis:
      "Hero v2 z metryką 12 min zwiększy CTR przycisku 'Zacznij sprzeciw' o ≥ 8%",
    metric: "CTR primary CTA",
    status: "running",
    started_at: "2026-05-03",
    variants: [
      { key: "A", label: "Hero v1 (kontrola)", traffic_percent: 50, conversions: 412, sample: 9128 },
      { key: "B", label: "Hero v2 (premium)", traffic_percent: 50, conversions: 487, sample: 9201 },
    ],
  },
  {
    id: "exp_pricing_pro_highlight",
    hypothesis:
      "Wyróżnienie planu Pro (border + 'Polecane') zwiększy upgrade z Solo na Pro",
    metric: "Upgrade Solo→Pro",
    status: "winner",
    started_at: "2026-04-12",
    variants: [
      { key: "A", label: "Neutralna kolumna", traffic_percent: 50, conversions: 41, sample: 1820 },
      { key: "B", label: "Wyróżnienie Pro", traffic_percent: 50, conversions: 78, sample: 1841 },
    ],
  },
  {
    id: "exp_wizard_kind_first",
    hypothesis:
      "Pytanie o rodzaj konta w kroku 1 wizardu zmniejszy drop-off",
    metric: "Wizard completion",
    status: "draft",
    started_at: "—",
    variants: [
      { key: "A", label: "Email pierwszy", traffic_percent: 50, conversions: 0, sample: 0 },
      { key: "B", label: "Rodzaj pierwszy", traffic_percent: 50, conversions: 0, sample: 0 },
    ],
  },
];

const TONE: Record<Experiment["status"], "info" | "warning" | "success" | "neutral"> = {
  draft: "neutral",
  running: "info",
  winner: "success",
  stopped: "warning",
};

const LABEL: Record<Experiment["status"], string> = {
  draft: "Szkic",
  running: "W toku",
  winner: "Zwycięzca",
  stopped: "Zatrzymany",
};

export default function EksperymentyPage() {
  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-fluid-sm font-semibold uppercase tracking-wider text-dlugomat-600">
            Wzrost
          </p>
          <h1 className="text-fluid-3xl font-bold tracking-tight text-dlugomat-900 dark:text-white">
            Eksperymenty A/B
          </h1>
          <p className="mt-1 max-w-2xl text-fluid-base text-iron-600 dark:text-iron-300">
            Hipotezy biznesowe testowane na statystyce. Minimalna próbka 1500
            zdarzeń per wariant, poziom istotności 95%, oznaczamy zwycięzcę
            automatycznie.
          </p>
        </div>
        <Button>
          <Plus className="size-4" />
          Nowy eksperyment
        </Button>
      </header>

      <div className="flex flex-col gap-4">
        {EXPERIMENTS.map((e) => {
          const lift = computeLift(e.variants);
          return (
            <Card key={e.id} elevation="subtle">
              <CardHeader>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-fluid-lg">{e.hypothesis}</CardTitle>
                    <CardDescription>
                      Metryka: <strong>{e.metric}</strong> · Start: {e.started_at}
                    </CardDescription>
                  </div>
                  <Badge tone={TONE[e.status]} withDot>
                    {LABEL[e.status]}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-2">
                  {e.variants.map((v) => {
                    const cr = v.sample > 0 ? (v.conversions / v.sample) * 100 : 0;
                    return (
                      <Card
                        key={v.key}
                        elevation="flat"
                        className="border-dashed"
                      >
                        <CardContent className="flex flex-col gap-2 p-4">
                          <div className="flex items-baseline justify-between">
                            <span className="text-fluid-sm font-semibold">
                              Wariant {v.key} · {v.label}
                            </span>
                            <span className="text-fluid-xs text-iron-500">
                              {v.traffic_percent}% ruchu
                            </span>
                          </div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-fluid-2xl font-bold tabular-nums text-iron-900 dark:text-iron-50">
                              {cr.toFixed(2)}%
                            </span>
                            <span className="text-fluid-xs text-iron-500">
                              CR · {v.conversions}/{v.sample}
                            </span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-iron-100 dark:bg-dlugomat-900">
                            <div
                              className="h-full bg-accent-500"
                              style={{ width: `${Math.min(100, cr * 4)}%` }}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {lift !== null ? (
                  <p className="mt-3 flex items-center gap-2 text-fluid-sm">
                    <ChartLine className="size-4 text-accent-600" />
                    <span>
                      Lift B vs A:{" "}
                      <strong
                        className={
                          lift >= 0
                            ? "text-accent-700"
                            : "text-danger-600"
                        }
                      >
                        {lift >= 0 ? "+" : ""}
                        {lift.toFixed(1)}%
                      </strong>
                    </span>
                  </p>
                ) : null}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function computeLift(variants: Variant[]) {
  const a = variants.find((v) => v.key === "A");
  const b = variants.find((v) => v.key === "B");
  if (!a || !b || a.sample === 0 || b.sample === 0) return null;
  const crA = a.conversions / a.sample;
  const crB = b.conversions / b.sample;
  if (crA === 0) return null;
  return ((crB - crA) / crA) * 100;
}
