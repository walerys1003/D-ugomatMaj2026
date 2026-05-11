import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Copy,
  RotateCw,
  Trash2,
  XCircle,
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
  title: "Webhook · Admin · Długomat",
};

type Delivery = {
  id: string;
  event: string;
  status: "success" | "failed" | "retrying";
  http_status: number;
  duration_ms: number;
  at: string;
  attempts: number;
};

const DELIVERIES: Delivery[] = [
  {
    id: "dlv_001",
    event: "letter.generated",
    status: "success",
    http_status: 200,
    duration_ms: 142,
    at: "2026-05-11T08:51:00Z",
    attempts: 1,
  },
  {
    id: "dlv_002",
    event: "case.created",
    status: "success",
    http_status: 200,
    duration_ms: 98,
    at: "2026-05-11T08:48:00Z",
    attempts: 1,
  },
  {
    id: "dlv_003",
    event: "payment.paid",
    status: "failed",
    http_status: 502,
    duration_ms: 28000,
    at: "2026-05-11T08:42:00Z",
    attempts: 3,
  },
  {
    id: "dlv_004",
    event: "letter.sent",
    status: "retrying",
    http_status: 503,
    duration_ms: 12000,
    at: "2026-05-11T08:40:00Z",
    attempts: 2,
  },
];

const TONE: Record<Delivery["status"], "success" | "danger" | "warning"> = {
  success: "success",
  failed: "danger",
  retrying: "warning",
};

const LABEL: Record<Delivery["status"], string> = {
  success: "Dostarczono",
  failed: "Błąd",
  retrying: "Retry",
};

export default async function WebhookDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <Link
          href="/admin/webhooki"
          className="flex items-center gap-1 text-fluid-sm font-semibold text-dlugomat-600 hover:underline dark:text-dlugomat-300"
        >
          <ArrowLeft className="size-4" />
          Wszystkie webhooki
        </Link>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-fluid-sm font-semibold uppercase tracking-wider text-dlugomat-600">
              Endpoint · {id}
            </p>
            <h1 className="text-fluid-3xl font-bold tracking-tight text-dlugomat-900 dark:text-white">
              https://crm.kowalska.pl/integracje/dlugomat
            </h1>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary">
              <RotateCw className="size-4" />
              Wymuś retry
            </Button>
            <Button variant="danger">
              <Trash2 className="size-4" />
              Usuń
            </Button>
          </div>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card elevation="subtle">
          <CardHeader>
            <CardTitle className="text-fluid-lg">Ostatnie doręczenia</CardTitle>
            <CardDescription>50 ostatnich wpisów (cache 5 min)</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto p-0">
            <table className="w-full text-fluid-sm">
              <thead className="border-b border-iron-200 bg-iron-50/60 dark:border-dlugomat-800 dark:bg-dlugomat-900/40">
                <tr className="text-left text-iron-600 dark:text-iron-300">
                  <th className="px-5 py-3 font-semibold">Event</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 text-right font-semibold">HTTP</th>
                  <th className="px-5 py-3 text-right font-semibold">Czas</th>
                  <th className="px-5 py-3 text-right font-semibold">Próby</th>
                  <th className="px-5 py-3 font-semibold">Kiedy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-iron-100 dark:divide-dlugomat-800">
                {DELIVERIES.map((d) => (
                  <tr key={d.id}>
                    <td className="px-5 py-3 font-mono text-fluid-xs">{d.event}</td>
                    <td className="px-5 py-3">
                      <Badge tone={TONE[d.status]} withDot>
                        {d.status === "success" ? (
                          <CheckCircle2 className="size-3" />
                        ) : d.status === "failed" ? (
                          <XCircle className="size-3" />
                        ) : (
                          <Clock className="size-3" />
                        )}
                        {LABEL[d.status]}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums">
                      {d.http_status}
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums">
                      {d.duration_ms < 1000
                        ? `${d.duration_ms} ms`
                        : `${(d.duration_ms / 1000).toFixed(1)} s`}
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums">
                      {d.attempts}
                    </td>
                    <td className="px-5 py-3 text-fluid-xs text-iron-500">
                      {new Date(d.at).toLocaleString("pl-PL")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <aside className="flex flex-col gap-4">
          <Card elevation="subtle">
            <CardHeader>
              <CardTitle className="text-fluid-base">Sekret HMAC</CardTitle>
              <CardDescription>
                Używany do nagłówka{" "}
                <code className="font-mono text-fluid-xs">X-Dlugomat-Signature</code>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 rounded-lg border border-iron-200 bg-iron-50 p-2 dark:border-iron-800 dark:bg-iron-950">
                <code className="flex-1 truncate font-mono text-fluid-xs">
                  whsec_••••••••••••••••••••••••••••••
                </code>
                <Button size="sm" variant="ghost" aria-label="Skopiuj sekret">
                  <Copy className="size-4" />
                </Button>
              </div>
              <Button size="sm" variant="link" className="mt-2 px-0">
                Wygeneruj nowy →
              </Button>
            </CardContent>
          </Card>

          <Card elevation="subtle">
            <CardHeader>
              <CardTitle className="text-fluid-base">Subskrybowane zdarzenia</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-1">
              <Badge tone="info">case.created</Badge>
              <Badge tone="info">case.updated</Badge>
              <Badge tone="info">letter.generated</Badge>
              <Badge tone="info">letter.sent</Badge>
              <Badge tone="info">payment.paid</Badge>
            </CardContent>
          </Card>

          <Card elevation="subtle">
            <CardHeader>
              <CardTitle className="text-fluid-base">Polityka retry</CardTitle>
              <CardDescription>
                30s → 2m → 10m → 1h → 6h → 24h (max 6 prób). Po wyczerpaniu DLQ.
              </CardDescription>
            </CardHeader>
          </Card>
        </aside>
      </div>
    </div>
  );
}
