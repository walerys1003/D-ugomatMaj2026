import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Activity, Server, Database, Globe, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "System health — admin",
  robots: { index: false, follow: false },
};

interface ServiceStatus {
  key: string;
  name: string;
  category: "API" | "DB" | "Worker" | "Edge";
  status: "operational" | "degraded" | "outage";
  uptime_30d: number;
  latency_p95: number;
  last_incident: string | null;
}

const SERVICES: ReadonlyArray<ServiceStatus> = [
  { key: "api-web", name: "API Web (Next.js)", category: "API", status: "operational", uptime_30d: 99.97, latency_p95: 142, last_incident: null },
  { key: "api-admin", name: "API Admin", category: "API", status: "operational", uptime_30d: 99.99, latency_p95: 98, last_incident: null },
  { key: "db-primary", name: "Postgres primary (Warszawa)", category: "DB", status: "operational", uptime_30d: 99.99, latency_p95: 8, last_incident: null },
  { key: "db-replica", name: "Postgres replica (Frankfurt)", category: "DB", status: "degraded", uptime_30d: 99.84, latency_p95: 42, last_incident: "2026-05-10 14:22 — lag replikacji" },
  { key: "worker-ocr", name: "Worker OCR", category: "Worker", status: "operational", uptime_30d: 99.92, latency_p95: 1840, last_incident: null },
  { key: "worker-email", name: "Worker e-mail (SendGrid)", category: "Worker", status: "operational", uptime_30d: 99.95, latency_p95: 340, last_incident: null },
  { key: "edge-cdn", name: "Edge CDN (Cloudflare)", category: "Edge", status: "operational", uptime_30d: 100.0, latency_p95: 18, last_incident: null },
  { key: "worker-cron", name: "Worker cron (harmonogram)", category: "Worker", status: "outage", uptime_30d: 98.21, latency_p95: 0, last_incident: "2026-05-11 08:14 — kolejka zatrzymana" },
];

const STATUS_TONE: Record<ServiceStatus["status"], "success" | "warning" | "danger"> = {
  operational: "success",
  degraded: "warning",
  outage: "danger",
};

const STATUS_ICON = {
  operational: CheckCircle2,
  degraded: AlertTriangle,
  outage: XCircle,
};

const STATUS_LABEL: Record<ServiceStatus["status"], string> = {
  operational: "Sprawne",
  degraded: "Pogorszone",
  outage: "Awaria",
};

interface MetricLine {
  label: string;
  value: string;
  trend: "up" | "down" | "flat";
}

const METRICS: ReadonlyArray<MetricLine> = [
  { label: "Sredni czas odpowiedzi API (p95)", value: "142 ms", trend: "flat" },
  { label: "Request rate (req/s)", value: "412", trend: "up" },
  { label: "Wskaznik bledow (HTTP 5xx)", value: "0,03%", trend: "down" },
  { label: "Kolejki workerow (suma)", value: "1 240 zadan", trend: "up" },
];

export default function SystemHealthPage() {
  const operational = SERVICES.filter((s) => s.status === "operational").length;
  const degraded = SERVICES.filter((s) => s.status === "degraded").length;
  const outages = SERVICES.filter((s) => s.status === "outage").length;
  const overallStatus: ServiceStatus["status"] =
    outages > 0 ? "outage" : degraded > 0 ? "degraded" : "operational";

  return (
    <div className="space-y-6">
      <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-iron-600 hover:text-dlugomat-900">
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Powrot do panelu admin
      </Link>

      <header>
        <p className="text-xs uppercase tracking-[0.18em] text-iron-500">Admin · System health</p>
        <h1 className="font-display text-fluid-h1 text-dlugomat-950 flex items-center gap-3">
          <Activity className="h-7 w-7 text-dlugomat-700" aria-hidden />
          Stan systemu
        </h1>
        <p className="mt-1 text-sm text-iron-600">
          Status uslug, uptime 30 dni, latency p95, kolejki workerow.
        </p>
      </header>

      <Card
        urgency={
          overallStatus === "outage" ? "critical" : overallStatus === "degraded" ? "warning" : "success"
        }
      >
        <CardContent className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {overallStatus === "operational" && <CheckCircle2 className="h-6 w-6 text-accent-700" aria-hidden />}
              {overallStatus === "degraded" && <AlertTriangle className="h-6 w-6 text-warn" aria-hidden />}
              {overallStatus === "outage" && <XCircle className="h-6 w-6 text-danger" aria-hidden />}
              <div>
                <p className="font-display text-lg text-dlugomat-950">
                  {overallStatus === "operational"
                    ? "Wszystkie systemy dzialaja"
                    : overallStatus === "degraded"
                    ? "Wystepuja zaklocenia"
                    : "Trwa awaria"}
                </p>
                <p className="text-xs text-iron-500">
                  {operational} sprawnych · {degraded} pogorszonych · {outages} awarii
                </p>
              </div>
            </div>
            <Badge tone={STATUS_TONE[overallStatus]} withDot>
              {STATUS_LABEL[overallStatus]}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <section className="grid gap-4 lg:grid-cols-4" aria-label="Metryki systemu">
        {METRICS.map((m) => (
          <Card key={m.label}>
            <CardHeader>
              <CardDescription>{m.label}</CardDescription>
              <CardTitle className="font-display text-fluid-h3 text-dlugomat-950">{m.value}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Status uslug</CardTitle>
          <CardDescription>{SERVICES.length} komponentow</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <ul className="divide-y divide-iron-100">
            {SERVICES.map((s) => {
              const Icon = STATUS_ICON[s.status];
              const CategoryIcon = s.category === "DB" ? Database : s.category === "Edge" ? Globe : Server;
              return (
                <li key={s.key} className="px-5 py-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <CategoryIcon className="h-5 w-5 text-iron-500" aria-hidden />
                      <div>
                        <p className="text-sm font-medium text-dlugomat-900">{s.name}</p>
                        <div className="mt-1 flex items-center gap-2">
                          <Badge tone="neutral">{s.category}</Badge>
                          <Badge tone={STATUS_TONE[s.status]} withDot>
                            <Icon className="mr-1 inline h-3 w-3" aria-hidden />
                            {STATUS_LABEL[s.status]}
                          </Badge>
                        </div>
                        {s.last_incident && (
                          <p className="mt-1 text-xs text-iron-500">{s.last_incident}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-xs text-iron-600">
                      <div>
                        <p className={`font-mono ${s.uptime_30d < 99.9 ? "text-warn" : ""}`}>
                          {s.uptime_30d.toFixed(2)}%
                        </p>
                        <p className="text-iron-500">uptime 30d</p>
                      </div>
                      <div>
                        <p className="font-mono">{s.latency_p95} ms</p>
                        <p className="text-iron-500">latency p95</p>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
