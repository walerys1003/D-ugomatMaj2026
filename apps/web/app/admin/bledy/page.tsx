import type { Metadata } from "next";
import { AlertOctagon, ArrowRight, Bug, TrendingDown, TrendingUp } from "lucide-react";

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
  title: "Błędy · Admin · Długomat",
};

type ErrorGroup = {
  id: string;
  title: string;
  fingerprint: string;
  level: "error" | "warning" | "fatal";
  count_24h: number;
  users_24h: number;
  trend_pct: number;
  last_seen: string;
  status: "new" | "investigating" | "resolved";
  area: string;
};

const ERRORS: ErrorGroup[] = [
  {
    id: "err_001",
    title: "TypeError: Cannot read property 'pesel' of undefined",
    fingerprint: "a3c1f9...",
    level: "error",
    count_24h: 142,
    users_24h: 38,
    trend_pct: 24,
    last_seen: "2026-05-11T08:51:00Z",
    status: "new",
    area: "Skaner OCR",
  },
  {
    id: "err_002",
    title: "FetchError: 504 Gateway Timeout @ /api/llm/letter",
    fingerprint: "b1f0e2...",
    level: "warning",
    count_24h: 87,
    users_24h: 41,
    trend_pct: -12,
    last_seen: "2026-05-11T08:40:00Z",
    status: "investigating",
    area: "Generacja pism",
  },
  {
    id: "err_003",
    title: "PaymentError: 3DS challenge timeout",
    fingerprint: "c8d2a1...",
    level: "error",
    count_24h: 21,
    users_24h: 18,
    trend_pct: 8,
    last_seen: "2026-05-11T07:31:00Z",
    status: "new",
    area: "Płatności",
  },
  {
    id: "err_004",
    title: "ValidationError: invalid PESEL checksum",
    fingerprint: "d9e1c2...",
    level: "warning",
    count_24h: 312,
    users_24h: 287,
    trend_pct: 4,
    last_seen: "2026-05-11T08:55:00Z",
    status: "resolved",
    area: "Walidacja",
  },
  {
    id: "err_005",
    title: "FATAL: database connection pool exhausted",
    fingerprint: "e0f1d2...",
    level: "fatal",
    count_24h: 3,
    users_24h: 1240,
    trend_pct: 0,
    last_seen: "2026-05-09T22:14:00Z",
    status: "resolved",
    area: "Infrastruktura",
  },
];

const LEVEL_TONE: Record<ErrorGroup["level"], "danger" | "warning" | "neutral"> = {
  fatal: "danger",
  error: "danger",
  warning: "warning",
};

const STATUS_TONE: Record<ErrorGroup["status"], "info" | "warning" | "success"> = {
  new: "info",
  investigating: "warning",
  resolved: "success",
};

const STATUS_LABEL: Record<ErrorGroup["status"], string> = {
  new: "Nowy",
  investigating: "Analiza",
  resolved: "Rozwiązany",
};

export default function BledyPage() {
  const total24h = ERRORS.reduce((s, e) => s + e.count_24h, 0);
  const usersAffected = ERRORS.reduce((s, e) => s + e.users_24h, 0);
  const newCount = ERRORS.filter((e) => e.status === "new").length;

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <p className="text-fluid-sm font-semibold uppercase tracking-wider text-dlugomat-600">
          Niezawodność
        </p>
        <h1 className="text-fluid-3xl font-bold tracking-tight text-dlugomat-900 dark:text-white">
          Błędy
        </h1>
        <p className="max-w-2xl text-fluid-base text-iron-600 dark:text-iron-300">
          Zgrupowane zdarzenia z Sentry + log own. Klikalne odsyłają do
          stack trace i breadcrumbs.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat
          icon={<Bug className="size-5" />}
          label="Zdarzenia 24h"
          value={total24h.toLocaleString("pl-PL")}
          tone="warning"
        />
        <Stat
          icon={<AlertOctagon className="size-5" />}
          label="Użytkownicy dotknięci"
          value={usersAffected.toLocaleString("pl-PL")}
          tone="warning"
        />
        <Stat
          icon={<TrendingUp className="size-5" />}
          label="Nowe grupy"
          value={String(newCount)}
          tone={newCount > 0 ? "danger" : "success"}
        />
      </div>

      <Card elevation="subtle" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-fluid-sm">
            <thead className="border-b border-iron-200 bg-iron-50/60 dark:border-dlugomat-800 dark:bg-dlugomat-900/40">
              <tr className="text-left text-iron-600 dark:text-iron-300">
                <th className="px-5 py-3 font-semibold">Błąd</th>
                <th className="px-5 py-3 font-semibold">Obszar</th>
                <th className="px-5 py-3 text-right font-semibold">24h</th>
                <th className="px-5 py-3 text-right font-semibold">Użytkownicy</th>
                <th className="px-5 py-3 text-right font-semibold">Trend</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-iron-100 dark:divide-dlugomat-800">
              {ERRORS.map((e) => (
                <tr key={e.id}>
                  <td className="px-5 py-3">
                    <div className="flex items-start gap-2">
                      <Badge tone={LEVEL_TONE[e.level]}>{e.level}</Badge>
                      <div className="flex flex-col">
                        <span className="font-mono text-fluid-xs text-iron-900 dark:text-iron-50">
                          {e.title}
                        </span>
                        <span className="text-fluid-xs text-iron-500">
                          {e.fingerprint}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-iron-500">{e.area}</td>
                  <td className="px-5 py-3 text-right tabular-nums">
                    {e.count_24h.toLocaleString("pl-PL")}
                  </td>
                  <td className="px-5 py-3 text-right tabular-nums">
                    {e.users_24h}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <span
                      className={`tabular-nums ${
                        e.trend_pct > 0
                          ? "text-danger-600"
                          : e.trend_pct < 0
                            ? "text-accent-700"
                            : "text-iron-500"
                      }`}
                    >
                      {e.trend_pct > 0 ? (
                        <TrendingUp className="mr-1 inline size-3.5 align-text-bottom" />
                      ) : e.trend_pct < 0 ? (
                        <TrendingDown className="mr-1 inline size-3.5 align-text-bottom" />
                      ) : null}
                      {e.trend_pct > 0 ? "+" : ""}
                      {e.trend_pct}%
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <Badge tone={STATUS_TONE[e.status]} withDot>
                      {STATUS_LABEL[e.status]}
                    </Badge>
                  </td>
                  <td className="px-5 py-3">
                    <Button size="sm" variant="ghost">
                      Szczegóły
                      <ArrowRight className="size-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: "success" | "warning" | "danger";
}) {
  const ring = {
    success: "bg-accent-100 text-accent-700 dark:bg-accent-700/20 dark:text-accent-300",
    warning: "bg-warn-100 text-warn-600 dark:bg-warn-500/15",
    danger: "bg-danger-100 text-danger-700 dark:bg-danger-500/15",
  } as const;
  return (
    <Card elevation="subtle">
      <CardContent className="flex items-center gap-3 p-5">
        <span className={`grid size-10 place-items-center rounded-lg ${ring[tone]}`}>
          {icon}
        </span>
        <div className="flex flex-col">
          <span className="text-fluid-xs font-semibold uppercase tracking-wider text-iron-500">
            {label}
          </span>
          <span className="text-fluid-xl font-bold tabular-nums text-iron-900 dark:text-iron-50">
            {value}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
