import type { Metadata } from "next";
import { Calendar, Clock, Pause, Play, Plus } from "lucide-react";

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
  title: "Harmonogram zadań · Admin · Długomat",
};

type Job = {
  id: string;
  name: string;
  cron: string;
  next_run: string;
  last_run: string;
  last_duration_s: number;
  last_status: "ok" | "fail";
  state: "active" | "paused";
};

const JOBS: Job[] = [
  {
    id: "job_dlq_replay",
    name: "DLQ replay (webhooki, e-maile, eksport)",
    cron: "*/10 * * * *",
    next_run: "2026-05-11T09:00:00Z",
    last_run: "2026-05-11T08:50:00Z",
    last_duration_s: 4,
    last_status: "ok",
    state: "active",
  },
  {
    id: "job_billing_cycle",
    name: "Cykl fakturowania B2B",
    cron: "0 6 1 * *",
    next_run: "2026-06-01T06:00:00Z",
    last_run: "2026-05-01T06:00:00Z",
    last_duration_s: 482,
    last_status: "ok",
    state: "active",
  },
  {
    id: "job_audit_compaction",
    name: "Kompakcja logów audytu (>90 dni → cold)",
    cron: "0 2 * * 1",
    next_run: "2026-05-12T02:00:00Z",
    last_run: "2026-05-05T02:00:00Z",
    last_duration_s: 1820,
    last_status: "ok",
    state: "active",
  },
  {
    id: "job_status_history",
    name: "Snapshot SLO i status page",
    cron: "*/5 * * * *",
    next_run: "2026-05-11T08:55:00Z",
    last_run: "2026-05-11T08:50:00Z",
    last_duration_s: 1,
    last_status: "ok",
    state: "active",
  },
  {
    id: "job_pesel_revalidate",
    name: "Rewalidacja PESEL/NIP w nowych importach",
    cron: "*/15 * * * *",
    next_run: "—",
    last_run: "2026-05-10T19:00:00Z",
    last_duration_s: 28,
    last_status: "fail",
    state: "paused",
  },
];

export default function HarmonogramPage() {
  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-fluid-sm font-semibold uppercase tracking-wider text-dlugomat-600">
            Automatyzacja
          </p>
          <h1 className="text-fluid-3xl font-bold tracking-tight text-dlugomat-900 dark:text-white">
            Harmonogram zadań
          </h1>
          <p className="mt-1 max-w-2xl text-fluid-base text-iron-600 dark:text-iron-300">
            Zadania cron uruchamiane na klastrze workerów. Możesz wstrzymać
            każde z nich w razie incydentu, historia uruchomień w audycie.
          </p>
        </div>
        <Button>
          <Plus className="size-4" />
          Nowe zadanie
        </Button>
      </header>

      <Card elevation="subtle" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-fluid-sm">
            <thead className="border-b border-iron-200 bg-iron-50/60 dark:border-dlugomat-800 dark:bg-dlugomat-900/40">
              <tr className="text-left text-iron-600 dark:text-iron-300">
                <th className="px-5 py-3 font-semibold">Zadanie</th>
                <th className="px-5 py-3 font-semibold">CRON</th>
                <th className="px-5 py-3 font-semibold">Następne</th>
                <th className="px-5 py-3 font-semibold">Ostatnie</th>
                <th className="px-5 py-3 text-right font-semibold">Czas</th>
                <th className="px-5 py-3 font-semibold">Wynik</th>
                <th className="px-5 py-3 font-semibold">Akcja</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-iron-100 dark:divide-dlugomat-800">
              {JOBS.map((j) => (
                <tr key={j.id}>
                  <td className="px-5 py-3">
                    <span className="font-semibold text-iron-900 dark:text-iron-50">
                      {j.name}
                    </span>
                    <br />
                    <code className="font-mono text-fluid-xs text-iron-500">
                      {j.id}
                    </code>
                  </td>
                  <td className="px-5 py-3">
                    <code className="rounded bg-iron-100 px-2 py-1 font-mono text-fluid-xs dark:bg-dlugomat-900">
                      {j.cron}
                    </code>
                  </td>
                  <td className="px-5 py-3 text-fluid-xs">
                    {j.next_run === "—" ? (
                      <span className="text-iron-500">—</span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <Clock className="size-3" />
                        {new Date(j.next_run).toLocaleString("pl-PL")}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-fluid-xs text-iron-500">
                    {new Date(j.last_run).toLocaleString("pl-PL")}
                  </td>
                  <td className="px-5 py-3 text-right tabular-nums">
                    {j.last_duration_s < 60
                      ? `${j.last_duration_s} s`
                      : `${(j.last_duration_s / 60).toFixed(1)} min`}
                  </td>
                  <td className="px-5 py-3">
                    <Badge tone={j.last_status === "ok" ? "success" : "danger"} withDot>
                      {j.last_status === "ok" ? "OK" : "Błąd"}
                    </Badge>
                  </td>
                  <td className="px-5 py-3">
                    {j.state === "active" ? (
                      <Button size="sm" variant="secondary">
                        <Pause className="size-4" />
                        Wstrzymaj
                      </Button>
                    ) : (
                      <Button size="sm" variant="success">
                        <Play className="size-4" />
                        Wznów
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card elevation="subtle">
        <CardHeader>
          <span className="grid size-9 place-items-center rounded-lg bg-dlugomat-100 text-dlugomat-700 dark:bg-dlugomat-850 dark:text-dlugomat-300">
            <Calendar className="size-5" />
          </span>
          <CardTitle className="mt-2 text-fluid-lg">Konwencje</CardTitle>
          <CardDescription>
            CRON w strefie Europe/Warsaw. Każde uruchomienie loguje się w
            audycie z trace_id. Failover automatyczny po 3 nieudanych próbach.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
