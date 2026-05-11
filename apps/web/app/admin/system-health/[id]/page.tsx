import * as React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Cpu,
  HardDrive,
  Network,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "System health - szczegoly uslugi - Dlugomat Admin",
  description: "Pelny widok stanu pojedynczej uslugi: metryki, ostatnie incydenty, zaleznosci, alerty.",
};

type ServiceStatus = "ok" | "degraded" | "down";

type ServiceDetail = {
  id: string;
  name: string;
  status: ServiceStatus;
  region: string;
  uptime: number;
  responseP95: number;
  errorRate: number;
  rpsCurrent: number;
  rpsPeak: number;
  cpuPct: number;
  memoryPct: number;
  diskPct: number;
  dependencies: { name: string; status: ServiceStatus }[];
  incidents: { id: string; date: string; title: string; severity: "low" | "medium" | "high"; durationMin: number }[];
  sparkline: number[];
};

const SERVICES: Record<string, ServiceDetail> = {
  "svc-001": {
    id: "svc-001",
    name: "API Gateway",
    status: "ok",
    region: "eu-central-1 (Warszawa)",
    uptime: 99.97,
    responseP95: 87,
    errorRate: 0.02,
    rpsCurrent: 1240,
    rpsPeak: 3450,
    cpuPct: 34,
    memoryPct: 61,
    diskPct: 22,
    dependencies: [
      { name: "PostgreSQL Primary", status: "ok" },
      { name: "Redis Cache", status: "ok" },
      { name: "S3 Storage", status: "ok" },
      { name: "OpenAI API", status: "degraded" },
    ],
    incidents: [
      { id: "inc-201", date: "2026-05-08T14:23:00", title: "Spowolnienie odpowiedzi p95", severity: "low", durationMin: 12 },
      { id: "inc-202", date: "2026-04-28T03:15:00", title: "Restart instancji po failoverze", severity: "medium", durationMin: 4 },
    ],
    sparkline: [78, 82, 85, 88, 92, 87, 84, 86, 89, 91, 87, 85, 83, 86, 88, 90, 87, 85],
  },
};

const STATUS_TONE: Record<ServiceStatus, "success" | "warning" | "danger"> = {
  ok: "success",
  degraded: "warning",
  down: "danger",
};

const STATUS_LABEL: Record<ServiceStatus, string> = {
  ok: "Sprawne",
  degraded: "Obnizona wydajnosc",
  down: "Awaria",
};

const STATUS_ICON: Record<ServiceStatus, typeof CheckCircle2> = {
  ok: CheckCircle2,
  degraded: AlertTriangle,
  down: XCircle,
};

const SEVERITY_TONE: Record<"low" | "medium" | "high", "info" | "warning" | "danger"> = {
  low: "info",
  medium: "warning",
  high: "danger",
};

type Params = Promise<{ id: string }>;

export default async function SystemHealthDetailPage({ params }: { params: Params }) {
  const { id } = await params;
  const svc = SERVICES[id] ?? SERVICES["svc-001"];
  if (!svc) notFound();

  const numFmt = new Intl.NumberFormat("pl-PL");
  const dateTimeFmt = new Intl.DateTimeFormat("pl-PL", {
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });

  const StatusIcon = STATUS_ICON[svc.status];
  const maxSpark = Math.max(...svc.sparkline);

  return (
    <div className="min-h-screen bg-dlugomat-50">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            href="/admin/system-health"
            className="inline-flex items-center gap-2 text-sm text-dlugomat-700 hover:text-dlugomat-900 focus-visible:shadow-shield-focus rounded-md"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Powrot do system health
          </Link>
        </div>

        <header className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Activity className="h-6 w-6 text-accent-600" aria-hidden />
              <Badge tone={STATUS_TONE[svc.status]} withDot>
                <StatusIcon className="h-3 w-3 mr-1" aria-hidden />
                {STATUS_LABEL[svc.status]}
              </Badge>
            </div>
            <h1 className="font-display text-3xl text-dlugomat-950 mb-1">{svc.name}</h1>
            <p className="text-dlugomat-700 text-sm">{svc.region}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm">Eksportuj metryki</Button>
            <Button variant="primary" size="sm">Otworz dashboard</Button>
          </div>
        </header>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-xs uppercase tracking-wide text-dlugomat-600 mb-1">Uptime 30 dni</div>
              <div className="font-display text-3xl text-emerald-700">{svc.uptime}%</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-xs uppercase tracking-wide text-dlugomat-600 mb-1">Response p95</div>
              <div className="font-display text-3xl text-dlugomat-950">{svc.responseP95} ms</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-xs uppercase tracking-wide text-dlugomat-600 mb-1">Error rate</div>
              <div className="font-display text-3xl text-dlugomat-950">{svc.errorRate}%</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-xs uppercase tracking-wide text-dlugomat-600 mb-1">RPS aktualne</div>
              <div className="font-display text-3xl text-dlugomat-950">{numFmt.format(svc.rpsCurrent)}</div>
              <div className="text-xs text-dlugomat-600 mt-1">Peak: {numFmt.format(svc.rpsPeak)}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Response time p95 (ostatnie 18 minut)</CardTitle>
                <CardDescription>Sample co 1 minute</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-1 h-32" role="img" aria-label="Wykres response time">
                  {svc.sparkline.map((v, idx) => (
                    <div
                      key={idx}
                      className="flex-1 bg-accent-500/70 hover:bg-accent-600 rounded-sm transition-colors"
                      style={{ height: `${(v / maxSpark) * 100}%` }}
                      title={`${v} ms`}
                    />
                  ))}
                </div>
                <div className="mt-2 flex justify-between text-xs text-dlugomat-600">
                  <span>-18 min</span>
                  <span>teraz</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ostatnie incydenty</CardTitle>
                <CardDescription>Z ostatnich 30 dni</CardDescription>
              </CardHeader>
              <CardContent>
                {svc.incidents.length === 0 ? (
                  <p className="text-sm text-dlugomat-700">Brak incydentow w tym okresie.</p>
                ) : (
                  <ul className="space-y-2">
                    {svc.incidents.map((inc) => (
                      <li key={inc.id}>
                        <Link
                          href={`/admin/system-health/incydent/${inc.id}`}
                          className="flex items-center justify-between gap-3 p-3 rounded-md border border-iron-200 bg-white hover:bg-dlugomat-50 focus-visible:shadow-shield-focus"
                        >
                          <div className="flex items-center gap-3">
                            <Badge tone={SEVERITY_TONE[inc.severity]}>{inc.severity.toUpperCase()}</Badge>
                            <div>
                              <div className="text-sm font-medium text-dlugomat-950">{inc.title}</div>
                              <div className="text-xs text-dlugomat-600 flex items-center gap-1.5">
                                <Clock className="h-3 w-3" aria-hidden />
                                {dateTimeFmt.format(new Date(inc.date))} - czas trwania {inc.durationMin} min
                              </div>
                            </div>
                          </div>
                          <span className="text-xs text-accent-700">Szczegoly</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>

          <aside className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Zasoby</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="flex items-center gap-1.5 text-dlugomat-700">
                      <Cpu className="h-3.5 w-3.5" aria-hidden />
                      CPU
                    </span>
                    <span className="font-medium text-dlugomat-950">{svc.cpuPct}%</span>
                  </div>
                  <div
                    className="h-2 bg-iron-200 rounded-full overflow-hidden"
                    role="progressbar"
                    aria-valuenow={svc.cpuPct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <div className="h-full bg-accent-500" style={{ width: `${svc.cpuPct}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="flex items-center gap-1.5 text-dlugomat-700">
                      <HardDrive className="h-3.5 w-3.5" aria-hidden />
                      Pamiec
                    </span>
                    <span className="font-medium text-dlugomat-950">{svc.memoryPct}%</span>
                  </div>
                  <div
                    className="h-2 bg-iron-200 rounded-full overflow-hidden"
                    role="progressbar"
                    aria-valuenow={svc.memoryPct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <div className="h-full bg-warn" style={{ width: `${svc.memoryPct}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="flex items-center gap-1.5 text-dlugomat-700">
                      <HardDrive className="h-3.5 w-3.5" aria-hidden />
                      Dysk
                    </span>
                    <span className="font-medium text-dlugomat-950">{svc.diskPct}%</span>
                  </div>
                  <div
                    className="h-2 bg-iron-200 rounded-full overflow-hidden"
                    role="progressbar"
                    aria-valuenow={svc.diskPct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <div className="h-full bg-emerald-500" style={{ width: `${svc.diskPct}%` }} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Network className="h-4 w-4 text-accent-600" aria-hidden />
                  Zaleznosci
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {svc.dependencies.map((dep) => {
                    const DepIcon = STATUS_ICON[dep.status];
                    return (
                      <li key={dep.name} className="flex items-center justify-between">
                        <span className="text-dlugomat-900">{dep.name}</span>
                        <Badge tone={STATUS_TONE[dep.status]} withDot>
                          <DepIcon className="h-3 w-3 mr-1" aria-hidden />
                          {STATUS_LABEL[dep.status]}
                        </Badge>
                      </li>
                    );
                  })}
                </ul>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}
