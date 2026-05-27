import type { Metadata } from "next";
import { AlertTriangle, ArrowRight, Gauge } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Limity · Organizacja · Długomat",
};

type Limit = {
  id: string;
  resource: string;
  used: number;
  total: number;
  unit: string;
  period?: string;
  status: "ok" | "warning" | "exceeded";
  reset_at?: string;
};

const LIMITS: Limit[] = [
  {
    id: "letters",
    resource: "Pisma generowane miesięcznie",
    used: 412,
    total: 1000,
    unit: "pism",
    period: "Maj 2026",
    status: "ok",
    reset_at: "01.06.2026",
  },
  {
    id: "seats",
    resource: "Miejsca w zespole",
    used: 18,
    total: 25,
    unit: "kont",
    status: "ok",
  },
  {
    id: "api_calls",
    resource: "Wywołania API",
    used: 84_200,
    total: 100_000,
    unit: "wywołań",
    period: "Bieżący miesiąc",
    status: "warning",
    reset_at: "01.06.2026",
  },
  {
    id: "storage",
    resource: "Przestrzeń na pliki",
    used: 42,
    total: 50,
    unit: "GB",
    status: "warning",
  },
  {
    id: "exports",
    resource: "Eksporty miesięcznie",
    used: 12,
    total: 10,
    unit: "eksportów",
    period: "Maj 2026",
    status: "exceeded",
    reset_at: "01.06.2026",
  },
];

const STATUS_TONE: Record<Limit["status"], "success" | "warning" | "danger"> = {
  ok: "success",
  warning: "warning",
  exceeded: "danger",
};

const STATUS_LABEL: Record<Limit["status"], string> = {
  ok: "W normie",
  warning: "Uważaj",
  exceeded: "Przekroczone",
};

function fillColor(status: Limit["status"]) {
  switch (status) {
    case "exceeded":
      return "bg-danger-500";
    case "warning":
      return "bg-warn-500";
    default:
      return "bg-accent-500";
  }
}

export default function LimityPage() {
  const exceeded = LIMITS.filter((l) => l.status === "exceeded").length;
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8">
      <header className="flex flex-col gap-2">
        <p className="text-fluid-sm font-semibold uppercase tracking-wider text-dlugomat-600">
          Organizacja
        </p>
        <h1 className="text-fluid-3xl font-bold tracking-tight text-dlugomat-900 dark:text-white">
          Limity i zużycie
        </h1>
        <p className="max-w-2xl text-fluid-base text-ink-600 dark:text-ink-300">
          Aktualne wykorzystanie zasobów dla planu{" "}
          <strong className="text-ink-900 dark:text-ink-50">Pro</strong>.
          Limity zerują się pierwszego dnia każdego miesiąca.
        </p>
      </header>

      {exceeded > 0 ? (
        <Card elevation="subtle" urgency="critical">
          <CardHeader>
            <div className="flex items-start gap-3">
              <span
                aria-hidden
                className="grid size-9 shrink-0 place-items-center rounded-lg bg-danger-100 text-danger-700 dark:bg-danger-500/15"
              >
                <AlertTriangle className="size-5" />
              </span>
              <div>
                <CardTitle className="text-fluid-base">
                  Limit przekroczony
                </CardTitle>
                <CardDescription>
                  {exceeded === 1
                    ? "1 limit został przekroczony"
                    : `${exceeded} limity zostały przekroczone`}
                  . Możesz podnieść plan lub poczekać do resetu.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/panel/organizacja/billing">
                Podnieś plan
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-3 md:grid-cols-2">
        {LIMITS.map((l) => {
          const pct = Math.min(100, Math.round((l.used / l.total) * 100));
          return (
            <Card key={l.id} elevation="subtle">
              <CardHeader>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-fluid-xs font-semibold uppercase tracking-wider text-ink-500">
                    {l.resource}
                  </span>
                  <Badge tone={STATUS_TONE[l.status]} withDot>
                    {STATUS_LABEL[l.status]}
                  </Badge>
                </div>
                <CardTitle className="mt-2 text-fluid-2xl tabular-nums">
                  {l.used.toLocaleString("pl-PL")}{" "}
                  <span className="text-fluid-base font-medium text-ink-500">
                    / {l.total.toLocaleString("pl-PL")} {l.unit}
                  </span>
                </CardTitle>
                {l.period ? (
                  <CardDescription>
                    {l.period}
                    {l.reset_at ? ` · reset ${l.reset_at}` : ""}
                  </CardDescription>
                ) : null}
              </CardHeader>
              <CardContent>
                <div className="h-2 overflow-hidden rounded-full bg-ink-100 dark:bg-dlugomat-900">
                  <div
                    className={`h-full ${fillColor(l.status)} transition-all`}
                    style={{ width: `${pct}%` }}
                    aria-label={`${pct}% wykorzystane`}
                  />
                </div>
                <p className="mt-2 text-fluid-xs tabular-nums text-ink-500">
                  {pct}% wykorzystane
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card elevation="subtle">
        <CardHeader>
          <span
            aria-hidden
            className="grid size-9 place-items-center rounded-lg bg-dlugomat-100 text-dlugomat-700 dark:bg-dlugomat-850 dark:text-dlugomat-300"
          >
            <Gauge className="size-5" />
          </span>
          <CardTitle className="mt-2 text-fluid-lg">
            Powiadomienia o limitach
          </CardTitle>
          <CardDescription>
            Wysyłamy e-mail przy 75%, 90% i 100% wykorzystania. Admini
            organizacji otrzymują też ping w Slack/Teams jeśli skonfigurowane.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
