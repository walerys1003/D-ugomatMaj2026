import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Webhook, RefreshCw, Play, Pause, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Webhook — szczegoly",
  robots: { index: false, follow: false },
};

interface WebhookDetail {
  id: string;
  name: string;
  url: string;
  events: ReadonlyArray<string>;
  status: "active" | "paused" | "failing";
  created_at: string;
  signing_secret_prefix: string;
  deliveries_24h: number;
  success_rate: number;
}

interface Delivery {
  id: string;
  at: string;
  event: string;
  status_code: number;
  duration_ms: number;
  ok: boolean;
}

async function loadWebhook(id: string): Promise<WebhookDetail | null> {
  const KNOWN: Record<string, WebhookDetail> = {
    "wh_001": {
      id: "wh_001",
      name: "Salesforce — case sync",
      url: "https://api.salesforce.com/services/data/v59.0/sobjects/Case",
      events: ["case.created", "case.updated", "case.closed", "document.uploaded"],
      status: "active",
      created_at: "2026-02-14 10:23",
      signing_secret_prefix: "whsec_sf_8xK4...",
      deliveries_24h: 1240,
      success_rate: 99.84,
    },
    "wh_002": {
      id: "wh_002",
      name: "Slack — alerty SLA",
      url: "https://hooks.slack.com/services/T0/B0/XXX",
      events: ["sla.breach", "case.overdue"],
      status: "failing",
      created_at: "2026-03-22 14:01",
      signing_secret_prefix: "whsec_sl_2aP9...",
      deliveries_24h: 18,
      success_rate: 22.2,
    },
  };
  return KNOWN[id] ?? null;
}

const DELIVERIES: ReadonlyArray<Delivery> = [
  { id: "d1", at: "2026-05-11 09:14:22", event: "case.updated", status_code: 200, duration_ms: 142, ok: true },
  { id: "d2", at: "2026-05-11 09:13:58", event: "case.created", status_code: 200, duration_ms: 156, ok: true },
  { id: "d3", at: "2026-05-11 09:13:11", event: "document.uploaded", status_code: 502, duration_ms: 30000, ok: false },
  { id: "d4", at: "2026-05-11 09:12:44", event: "case.updated", status_code: 200, duration_ms: 138, ok: true },
  { id: "d5", at: "2026-05-11 09:12:01", event: "case.closed", status_code: 200, duration_ms: 124, ok: true },
  { id: "d6", at: "2026-05-11 09:11:38", event: "case.created", status_code: 200, duration_ms: 169, ok: true },
];

const STATUS_TONE: Record<WebhookDetail["status"], "success" | "neutral" | "danger"> = {
  active: "success",
  paused: "neutral",
  failing: "danger",
};

const STATUS_LABEL: Record<WebhookDetail["status"], string> = {
  active: "Aktywny",
  paused: "Wstrzymany",
  failing: "Awarie",
};

export default async function WebhookDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const wh = await loadWebhook(id);
  if (!wh) notFound();

  return (
    <div className="space-y-6">
      <Link href="/admin/webhooki" className="inline-flex items-center gap-2 text-sm text-iron-600 hover:text-dlugomat-900">
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Powrot do listy webhookow
      </Link>

      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-iron-500">Admin · Webhook {wh.id}</p>
          <h1 className="font-display text-fluid-h1 text-dlugomat-950 flex items-center gap-3">
            <Webhook className="h-7 w-7 text-dlugomat-700" aria-hidden />
            {wh.name}
          </h1>
          <p className="mt-1 font-mono text-sm text-iron-600">{wh.url}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone={STATUS_TONE[wh.status]} withDot>{STATUS_LABEL[wh.status]}</Badge>
          {wh.status === "active" ? (
            <Button variant="secondary" size="sm">
              <Pause className="mr-2 h-4 w-4" aria-hidden />
              Wstrzymaj
            </Button>
          ) : (
            <Button variant="primary" size="sm">
              <Play className="mr-2 h-4 w-4" aria-hidden />
              Wznow
            </Button>
          )}
          <Button variant="secondary" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" aria-hidden />
            Testuj
          </Button>
        </div>
      </header>

      <section className="grid gap-4 lg:grid-cols-4" aria-label="KPI webhooka">
        <Card>
          <CardHeader>
            <CardDescription>Dostarczenia / 24h</CardDescription>
            <CardTitle className="font-display text-fluid-h3 text-dlugomat-950">
              {wh.deliveries_24h.toLocaleString("pl-PL")}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card urgency={wh.success_rate < 95 ? "warning" : "success"}>
          <CardHeader>
            <CardDescription>Sukces</CardDescription>
            <CardTitle
              className={`font-display text-fluid-h3 ${
                wh.success_rate < 95 ? "text-warn" : "text-accent-700"
              }`}
            >
              {wh.success_rate.toFixed(2)}%
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Zdarzenia</CardDescription>
            <CardTitle className="font-display text-fluid-h3 text-dlugomat-950">{wh.events.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Utworzony</CardDescription>
            <CardTitle className="font-display text-fluid-h4 text-dlugomat-950">{wh.created_at}</CardTitle>
          </CardHeader>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Subskrybowane zdarzenia</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {wh.events.map((e) => (
              <Badge key={e} tone="info">
                <span className="font-mono text-xs">{e}</span>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Konfiguracja</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex items-start justify-between gap-3">
            <span className="text-iron-600">URL endpointu</span>
            <span className="font-mono text-xs text-dlugomat-900">{wh.url}</span>
          </div>
          <div className="flex items-start justify-between gap-3">
            <span className="text-iron-600">Signing secret (prefix)</span>
            <span className="font-mono text-xs text-dlugomat-900">{wh.signing_secret_prefix}</span>
          </div>
          <div className="flex items-start justify-between gap-3">
            <span className="text-iron-600">Retry policy</span>
            <span className="text-dlugomat-900">Exponential backoff 5 prob, max 24 h</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ostatnie dostarczenia</CardTitle>
          <CardDescription>6 ostatnich prob</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="border-b border-iron-100 bg-iron-50/50 text-xs uppercase tracking-wide text-iron-600">
              <tr>
                <th className="px-5 py-2 text-left font-medium">Czas</th>
                <th className="px-5 py-2 text-left font-medium">Zdarzenie</th>
                <th className="px-5 py-2 text-right font-medium">HTTP</th>
                <th className="px-5 py-2 text-right font-medium">Czas (ms)</th>
                <th className="px-5 py-2 text-right font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-iron-100">
              {DELIVERIES.map((d) => (
                <tr key={d.id}>
                  <td className="px-5 py-3 font-mono text-xs text-iron-600">{d.at}</td>
                  <td className="px-5 py-3 font-mono text-xs text-dlugomat-900">{d.event}</td>
                  <td className={`px-5 py-3 text-right font-mono ${d.ok ? "text-accent-700" : "text-danger"}`}>
                    {d.status_code}
                  </td>
                  <td className="px-5 py-3 text-right font-mono text-iron-700">{d.duration_ms}</td>
                  <td className="px-5 py-3 text-right">
                    {d.ok ? (
                      <CheckCircle2 className="inline h-4 w-4 text-accent-700" aria-label="OK" />
                    ) : (
                      <AlertTriangle className="inline h-4 w-4 text-danger" aria-label="Blad" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
