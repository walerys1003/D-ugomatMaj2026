import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Activity, Cpu, Database, HardDrive, Server, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Stan zdrowia systemu",
  robots: { index: false, follow: false },
};

interface ServiceHealth {
  id: string;
  name: string;
  category: "core" | "db" | "queue" | "cache" | "storage";
  status: "healthy" | "degraded" | "down";
  uptime_30d: number;
  latency_p95_ms: number;
  region: "warszawa" | "frankfurt";
}

const STATUS_TONE: Record<ServiceHealth["status"], "success" | "warning" | "danger"> = {
  healthy: "success",
  degraded: "warning",
  down: "danger",
};

const STATUS_LABEL: Record<ServiceHealth["status"], string> = {
  healthy: "Zdrowy",
  degraded: "Spadek wydajnosci",
  down: "Niedostepny",
};

const SERVICES: ReadonlyArray<ServiceHealth> = [
  { id: "api", name: "API publiczne", category: "core", status: "healthy", uptime_30d: 99.97, latency_p95_ms: 142, region: "warszawa" },
  { id: "web", name: "Aplikacja webowa", category: "core", status: "healthy", uptime_30d: 99.99, latency_p95_ms: 89, region: "warszawa" },
  { id: "auth", name: "Serwis autentykacji", category: "core", status: "healthy", uptime_30d: 99.98, latency_p95_ms: 67, region: "warszawa" },
  { id: "ocr", name: "Pipeline OCR", category: "core", status: "degraded", uptime_30d: 99.82, latency_p95_ms: 4820, region: "warszawa" },
  { id: "pg-primary", name: "PostgreSQL primary", category: "db", status: "healthy", uptime_30d: 100, latency_p95_ms: 8, region: "warszawa" },
  { id: "pg-replica", name: "PostgreSQL replika", category: "db", status: "healthy", uptime_30d: 99.95, latency_p95_ms: 14, region: "frankfurt" },
  { id: "redis", name: "Redis cache", category: "cache", status: "healthy", uptime_30d: 99.99, latency_p95_ms: 1.2, region: "warszawa" },
  { id: "queue", name: "Kolejka zadan (BullMQ)", category: "queue", status: "healthy", uptime_30d: 99.93, latency_p95_ms: 23, region: "warszawa" },
  { id: "s3", name: "Storage dokumentow", category: "storage", status: "healthy", uptime_30d: 99.99, latency_p95_ms: 92, region: "warszawa" },
];

interface IncidentRow {
  id: string;
  title: string;
  severity: "P1" | "P2" | "P3";
  when: string;
  duration_min: number;
  resolved: boolean;
}

const INCIDENTS: ReadonlyArray<IncidentRow> = [
  { id: "INC-2026-0042", title: "Wzrost latencji OCR (>4s p95)", severity: "P2", when: "Dzisiaj 08:14", duration_min: 47, resolved: false },
  { id: "INC-2026-0041", title: "Restart replika Postgres (Frankfurt)", severity: "P3", when: "Wczoraj 23:42", duration_min: 12, resolved: true },
  { id: "INC-2026-0040", title: "Spike 503 z bramki API", severity: "P1", when: "08-05 14:22", duration_min: 8, resolved: true },
];

const SEVERITY_TONE: Record<IncidentRow["severity"], "danger" | "warning" | "info"> = {
  P1: "danger",
  P2: "warning",
  P3: "info",
};

const CATEGORY_ICON = {
  core: Server,
  db: Database,
  queue: Activity,
  cache: Cpu,
  storage: HardDrive,
};

export default function SystemZdrowiePage() {
  const healthy = SERVICES.filter((s) => s.status === "healthy").length;
  const degraded = SERVICES.filter((s) => s.status === "degraded").length;
  const down = SERVICES.filter((s) => s.status === "down").length;
  const overallUptime = SERVICES.reduce((s, x) => s + x.uptime_30d, 0) / SERVICES.length;

  return (
    <div className="space-y-6">
      <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-iron-600 hover:text-dlugomat-900">
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Powrot do panelu admina
      </Link>

      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-iron-500">Admin / System</p>
          <h1 className="font-display text-fluid-h1 text-dlugomat-950 flex items-center gap-3">
            <Activity className="h-7 w-7 text-dlugomat-700" aria-hidden />
            Stan zdrowia systemu
          </h1>
          <p className="mt-1 text-sm text-iron-600">
            Real-time monitoring. Ostatni refresh: 12 s temu.
          </p>
        </div>
        <Button variant="secondary" asChild>
          <Link href="/admin/system/runbook">Runbook P1</Link>
        </Button>
      </header>

      <section className="grid gap-4 lg:grid-cols-4">
        <Card urgency={degraded === 0 && down === 0 ? "success" : "warning"}>
          <CardHeader>
            <CardDescription>Uptime 30d (overall)</CardDescription>
            <CardTitle className="font-display text-fluid-h3 text-accent-700">
              {overallUptime.toFixed(2)}%
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-iron-500">Cel SLA: 99,90%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Zdrowych serwisow</CardDescription>
            <CardTitle className="font-display text-fluid-h3 text-accent-700">{healthy}</CardTitle>
          </CardHeader>
        </Card>
        <Card urgency={degraded > 0 ? "warning" : "none"}>
          <CardHeader>
            <CardDescription>Spadek wydajnosci</CardDescription>
            <CardTitle className={`font-display text-fluid-h3 ${degraded > 0 ? "text-warn" : "text-dlugomat-950"}`}>
              {degraded}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card urgency={down > 0 ? "critical" : "none"}>
          <CardHeader>
            <CardDescription>Niedostepne</CardDescription>
            <CardTitle className={`font-display text-fluid-h3 ${down > 0 ? "text-danger" : "text-dlugomat-950"}`}>
              {down}
            </CardTitle>
          </CardHeader>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Serwisy</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ul className="divide-y divide-iron-100">
            {SERVICES.map((s) => {
              const Icon = CATEGORY_ICON[s.category];
              const slaMissed = s.uptime_30d < 99.9;
              return (
                <li key={s.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
                  <div className="flex items-start gap-3">
                    <Icon className="mt-0.5 h-5 w-5 text-iron-500" aria-hidden />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-dlugomat-900">{s.name}</span>
                        <Badge tone={STATUS_TONE[s.status]} withDot>
                          {STATUS_LABEL[s.status]}
                        </Badge>
                        <Badge tone="neutral">{s.region}</Badge>
                      </div>
                      <p className="mt-0.5 text-xs text-iron-500">
                        Uptime 30d:{" "}
                        <span className={slaMissed ? "text-warn" : "text-accent-700"}>
                          {s.uptime_30d}%
                        </span>{" "}
                        · p95 latency: {s.latency_p95_ms} ms
                      </p>
                    </div>
                  </div>
                  {s.status === "healthy" ? (
                    <CheckCircle2 className="h-5 w-5 text-accent-700" aria-hidden />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-warn" aria-hidden />
                  )}
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ostatnie incydenty</CardTitle>
          <CardDescription>{INCIDENTS.filter((i) => !i.resolved).length} otwartych.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <ul className="divide-y divide-iron-100">
            {INCIDENTS.map((i) => (
              <li key={i.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-iron-500">{i.id}</span>
                    <Badge tone={SEVERITY_TONE[i.severity]} withDot>
                      {i.severity}
                    </Badge>
                    <Badge tone={i.resolved ? "success" : "warning"}>
                      {i.resolved ? "Zamkniety" : "Otwarty"}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-dlugomat-900">{i.title}</p>
                  <p className="text-xs text-iron-500">
                    {i.when} · {i.duration_min} min
                  </p>
                </div>
                <Button variant="ghost" size="sm">Szczegoly</Button>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
