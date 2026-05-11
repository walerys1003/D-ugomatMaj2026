import type { Metadata } from "next";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Plus,
  RotateCw,
  Webhook,
} from "lucide-react";

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
  title: "Webhooki · Admin · Długomat",
};

type Endpoint = {
  id: string;
  url: string;
  events: string[];
  status: "active" | "paused" | "failing";
  success_24h: number;
  failure_24h: number;
  last_delivery_at: string;
};

const ENDPOINTS: Endpoint[] = [
  {
    id: "wh_01",
    url: "https://crm.kowalska.pl/integracje/dlugomat",
    events: ["case.created", "letter.generated", "payment.paid"],
    status: "active",
    success_24h: 412,
    failure_24h: 0,
    last_delivery_at: "2026-05-11T08:42:00Z",
  },
  {
    id: "wh_02",
    url: "https://api.bestrecovery.eu/hooks/dlugomat",
    events: ["case.*", "letter.*"],
    status: "active",
    success_24h: 1834,
    failure_24h: 3,
    last_delivery_at: "2026-05-11T08:51:00Z",
  },
  {
    id: "wh_03",
    url: "https://hooks.zapier.com/hooks/catch/12345/abc",
    events: ["letter.sent"],
    status: "failing",
    success_24h: 0,
    failure_24h: 27,
    last_delivery_at: "2026-05-11T07:12:00Z",
  },
];

const TONE: Record<Endpoint["status"], "success" | "warning" | "danger" | "neutral"> = {
  active: "success",
  paused: "neutral",
  failing: "danger",
};

const LABEL: Record<Endpoint["status"], string> = {
  active: "Aktywny",
  paused: "Wstrzymany",
  failing: "Błąd",
};

export default function WebhookiPage() {
  const totalSuccess = ENDPOINTS.reduce((s, e) => s + e.success_24h, 0);
  const totalFailure = ENDPOINTS.reduce((s, e) => s + e.failure_24h, 0);
  const failingCount = ENDPOINTS.filter((e) => e.status === "failing").length;

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-fluid-sm font-semibold uppercase tracking-wider text-dlugomat-600">
            Integracje
          </p>
          <h1 className="text-fluid-3xl font-bold tracking-tight text-dlugomat-900 dark:text-white">
            Webhooki
          </h1>
          <p className="mt-1 max-w-2xl text-fluid-base text-iron-600 dark:text-iron-300">
            Konfiguracja endpointów partnerskich, kolejka retry, podgląd
            ostatnich doręczeń.
          </p>
        </div>
        <Button>
          <Plus className="size-4" />
          Nowy endpoint
        </Button>
      </header>

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard
          icon={<CheckCircle2 className="size-5" />}
          label="Doręczone 24h"
          value={totalSuccess.toLocaleString("pl-PL")}
          tone="success"
        />
        <StatCard
          icon={<AlertTriangle className="size-5" />}
          label="Błędy 24h"
          value={totalFailure.toLocaleString("pl-PL")}
          tone={totalFailure > 0 ? "warning" : "neutral"}
        />
        <StatCard
          icon={<Activity className="size-5" />}
          label="Endpointy w błędzie"
          value={String(failingCount)}
          tone={failingCount > 0 ? "danger" : "neutral"}
        />
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-fluid-xl font-semibold text-dlugomat-900 dark:text-white">
          Endpointy
        </h2>
        <Card elevation="subtle" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-fluid-sm">
              <thead className="border-b border-iron-200 bg-iron-50/60 dark:border-dlugomat-800 dark:bg-dlugomat-900/40">
                <tr className="text-left text-iron-600 dark:text-iron-300">
                  <th className="px-5 py-3 font-semibold">URL</th>
                  <th className="px-5 py-3 font-semibold">Zdarzenia</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 text-right font-semibold">24h ✓ / ✗</th>
                  <th className="px-5 py-3 font-semibold">Akcje</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-iron-100 dark:divide-dlugomat-800">
                {ENDPOINTS.map((e) => (
                  <tr key={e.id}>
                    <td className="px-5 py-3">
                      <code className="rounded bg-iron-100 px-2 py-1 font-mono text-fluid-xs text-iron-700 dark:bg-dlugomat-900 dark:text-iron-200">
                        {e.url}
                      </code>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex flex-wrap gap-1">
                        {e.events.slice(0, 3).map((ev) => (
                          <Badge key={ev} tone="neutral">
                            {ev}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <Badge tone={TONE[e.status]} withDot>
                        {LABEL[e.status]}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums">
                      <span className="text-accent-700">{e.success_24h}</span>
                      {" / "}
                      <span className="text-danger-600">{e.failure_24h}</span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex gap-1">
                        <Button asChild size="sm" variant="ghost">
                          <Link href={`/admin/webhooki/${e.id}`}>Logi</Link>
                        </Button>
                        <Button size="sm" variant="ghost">
                          <RotateCw className="size-4" />
                          Retry
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </section>

      <Card elevation="subtle">
        <CardHeader>
          <span
            aria-hidden
            className="grid size-9 place-items-center rounded-lg bg-dlugomat-100 text-dlugomat-700 dark:bg-dlugomat-850 dark:text-dlugomat-300"
          >
            <Webhook className="size-5" />
          </span>
          <CardTitle className="mt-2 text-fluid-lg">Polityka retry</CardTitle>
          <CardDescription>
            Wykładnicze: 30s → 2m → 10m → 1h → 6h → 24h (max 6 prób).
            Po wyczerpaniu wpis trafia do DLQ.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="secondary">
            <Link href="/admin/dlq">Otwórz DLQ →</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: "success" | "warning" | "danger" | "neutral";
}) {
  const ring: Record<typeof tone, string> = {
    success: "bg-accent-100 text-accent-700 dark:bg-accent-700/20 dark:text-accent-300",
    warning: "bg-warn-100 text-warn-600 dark:bg-warn-500/15",
    danger: "bg-danger-100 text-danger-700 dark:bg-danger-500/15",
    neutral: "bg-iron-100 text-iron-700 dark:bg-dlugomat-850 dark:text-iron-200",
  };
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
