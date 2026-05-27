import * as React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ListOrdered,
  Clock,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Pause,
  Trash2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Szczegoly kolejki - Dlugomat Admin",
  description: "Pelny widok stanu kolejki: throughput, opoznienia, jobs, retry policy.",
};

type Queue = {
  id: string;
  name: string;
  type: "main" | "delayed" | "dlq" | "priority";
  pending: number;
  inFlight: number;
  completedToday: number;
  failedToday: number;
  avgProcessingMs: number;
  oldestJobAgeS: number;
  throughputPerMin: number;
  consumers: { id: string; label: string; rate: number; healthy: boolean }[];
  recentJobs: { id: string; payload: string; status: "ok" | "retry" | "failed"; attempts: number; addedAt: string }[];
  retryPolicy: { maxAttempts: number; backoff: string; deadLetterAfter: number };
};

const QUEUES: Record<string, Queue> = {
  "q-001": {
    id: "q-001",
    name: "notifications.email",
    type: "main",
    pending: 234,
    inFlight: 8,
    completedToday: 18450,
    failedToday: 23,
    avgProcessingMs: 1240,
    oldestJobAgeS: 14,
    throughputPerMin: 312,
    consumers: [
      { id: "c-1", label: "worker-email-01", rate: 78, healthy: true },
      { id: "c-2", label: "worker-email-02", rate: 82, healthy: true },
      { id: "c-3", label: "worker-email-03", rate: 76, healthy: true },
      { id: "c-4", label: "worker-email-04", rate: 76, healthy: true },
    ],
    recentJobs: [
      { id: "j-1001", payload: "reminder.rata.due_in_3d", status: "ok", attempts: 1, addedAt: "2026-05-11T09:34:12" },
      { id: "j-1002", payload: "welcome.onboarding", status: "ok", attempts: 1, addedAt: "2026-05-11T09:34:10" },
      { id: "j-1003", payload: "reminder.rata.overdue", status: "retry", attempts: 2, addedAt: "2026-05-11T09:33:58" },
      { id: "j-1004", payload: "ugoda.proposal", status: "ok", attempts: 1, addedAt: "2026-05-11T09:33:45" },
      { id: "j-1005", payload: "report.weekly.summary", status: "failed", attempts: 5, addedAt: "2026-05-11T09:30:12" },
      { id: "j-1006", payload: "notification.system.maintenance", status: "ok", attempts: 1, addedAt: "2026-05-11T09:30:01" },
    ],
    retryPolicy: { maxAttempts: 5, backoff: "exponential (2^n sekund)", deadLetterAfter: 5 },
  },
};

const TYPE_LABEL: Record<Queue["type"], string> = {
  main: "Glowna",
  delayed: "Opozniona",
  dlq: "Dead Letter",
  priority: "Priorytetowa",
};

const TYPE_TONE: Record<Queue["type"], "success" | "info" | "danger" | "warning"> = {
  main: "success",
  delayed: "info",
  dlq: "danger",
  priority: "warning",
};

const JOB_STATUS_TONE: Record<"ok" | "retry" | "failed", "success" | "warning" | "danger"> = {
  ok: "success",
  retry: "warning",
  failed: "danger",
};

const JOB_STATUS_LABEL: Record<"ok" | "retry" | "failed", string> = {
  ok: "Sukces",
  retry: "Retry",
  failed: "Bledne",
};

type Params = Promise<{ id: string }>;

export default async function KolejkaSzczegolyPage({ params }: { params: Params }) {
  const { id } = await params;
  const q = QUEUES[id] ?? QUEUES["q-001"];
  if (!q) notFound();

  const numFmt = new Intl.NumberFormat("pl-PL");
  const timeFmt = new Intl.DateTimeFormat("pl-PL", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  return (
    <div className="min-h-screen bg-dlugomat-50">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            href="/admin/system"
            className="inline-flex items-center gap-2 text-sm text-dlugomat-700 hover:text-dlugomat-900 focus-visible:shadow-shield-focus rounded-md"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Powrot do systemu
          </Link>
        </div>

        <header className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <ListOrdered className="h-6 w-6 text-accent-600" aria-hidden />
              <Badge tone={TYPE_TONE[q.type]}>{TYPE_LABEL[q.type]}</Badge>
            </div>
            <h1 className="font-display text-3xl text-dlugomat-950 font-mono">{q.name}</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm">
              <Pause className="h-4 w-4 mr-1.5" aria-hidden />
              Wstrzymaj
            </Button>
            <Button variant="ghost" size="sm">
              <RefreshCw className="h-4 w-4 mr-1.5" aria-hidden />
              Odswiez
            </Button>
          </div>
        </header>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-xs uppercase tracking-wide text-dlugomat-600 mb-1">W kolejce</div>
              <div className="font-display text-3xl text-dlugomat-950">{numFmt.format(q.pending)}</div>
              <div className="text-xs text-dlugomat-600 mt-1">{q.inFlight} w trakcie</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-xs uppercase tracking-wide text-dlugomat-600 mb-1">Throughput / min</div>
              <div className="font-display text-3xl text-emerald-700">{numFmt.format(q.throughputPerMin)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-xs uppercase tracking-wide text-dlugomat-600 mb-1">Sredni czas</div>
              <div className="font-display text-3xl text-dlugomat-950">{numFmt.format(q.avgProcessingMs)} ms</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-xs uppercase tracking-wide text-dlugomat-600 mb-1">Najstarszy job</div>
              <div className="font-display text-3xl text-dlugomat-950">{q.oldestJobAgeS}s</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Ostatnie zadania</CardTitle>
                <CardDescription>
                  Dzisiaj zakonczonych: {numFmt.format(q.completedToday)} - bledow: {q.failedToday}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs uppercase tracking-wide text-dlugomat-600 border-b border-iron-200">
                        <th className="py-2 pr-3">ID</th>
                        <th className="py-2 pr-3">Payload</th>
                        <th className="py-2 pr-3">Proba</th>
                        <th className="py-2 pr-3">Status</th>
                        <th className="py-2">Dodano</th>
                      </tr>
                    </thead>
                    <tbody>
                      {q.recentJobs.map((job) => (
                        <tr key={job.id} className="border-b border-iron-100 last:border-0">
                          <td className="py-2.5 pr-3 font-mono text-xs text-dlugomat-800">{job.id}</td>
                          <td className="py-2.5 pr-3 font-mono text-xs text-dlugomat-900">{job.payload}</td>
                          <td className="py-2.5 pr-3 text-dlugomat-800">
                            {job.attempts}/{q.retryPolicy.maxAttempts}
                          </td>
                          <td className="py-2.5 pr-3">
                            <Badge tone={JOB_STATUS_TONE[job.status]}>{JOB_STATUS_LABEL[job.status]}</Badge>
                          </td>
                          <td className="py-2.5 text-dlugomat-700 text-xs">{timeFmt.format(new Date(job.addedAt))}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Konsumenci kolejki</CardTitle>
                <CardDescription>{q.consumers.length} workerow aktywnych</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {q.consumers.map((c) => (
                    <li
                      key={c.id}
                      className="flex items-center justify-between gap-3 p-3 rounded-md border border-iron-200 bg-white"
                    >
                      <div className="flex items-center gap-3">
                        <Badge tone={c.healthy ? "success" : "danger"} withDot>
                          {c.healthy ? (
                            <CheckCircle2 className="h-3 w-3 mr-1" aria-hidden />
                          ) : (
                            <AlertTriangle className="h-3 w-3 mr-1" aria-hidden />
                          )}
                          {c.healthy ? "Healthy" : "Unhealthy"}
                        </Badge>
                        <span className="text-sm font-mono text-dlugomat-900">{c.label}</span>
                      </div>
                      <span className="text-sm text-dlugomat-700">{c.rate} msg/min</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          <aside className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="h-4 w-4 text-accent-600" aria-hidden />
                  Retry policy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-dlugomat-700">Max prob</span>
                  <span className="font-medium text-dlugomat-950">{q.retryPolicy.maxAttempts}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dlugomat-700">Backoff</span>
                  <span className="font-medium text-dlugomat-950 text-xs">{q.retryPolicy.backoff}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dlugomat-700">DLQ po</span>
                  <span className="font-medium text-dlugomat-950">{q.retryPolicy.deadLetterAfter} probach</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 space-y-2">
                <Button variant="primary" block>
                  <RefreshCw className="h-4 w-4 mr-2" aria-hidden />
                  Retry wszystkie failed
                </Button>
                <Button variant="secondary" block asChild>
                  <Link href="/admin/dlq">Zobacz DLQ</Link>
                </Button>
                <Button variant="ghost" block>
                  <Trash2 className="h-4 w-4 mr-2" aria-hidden />
                  Wyczysc kolejke
                </Button>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}
