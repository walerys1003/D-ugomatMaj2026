import type { Metadata } from "next";
import { Archive, Clock, Download, ShieldCheck } from "lucide-react";

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
  title: "Eksport danych · Admin · Długomat",
};

type ExportJob = {
  id: string;
  scope: "cases" | "users" | "letters" | "payments";
  filters: string;
  size_mb: number;
  status: "queued" | "running" | "ready" | "expired";
  created_at: string;
  expires_at?: string;
  operator: string;
};

const JOBS: ExportJob[] = [
  {
    id: "exp_001",
    scope: "cases",
    filters: "tier=enterprise, period=2026-Q1",
    size_mb: 412,
    status: "ready",
    created_at: "2026-05-10T11:00:00Z",
    expires_at: "2026-05-11T11:00:00Z",
    operator: "anna.k@dlugomat.pl",
  },
  {
    id: "exp_002",
    scope: "letters",
    filters: "module=D5, generated_at > -90d",
    size_mb: 1820,
    status: "running",
    created_at: "2026-05-11T08:30:00Z",
    operator: "marek.w@dlugomat.pl",
  },
  {
    id: "exp_003",
    scope: "users",
    filters: "consent.marketing=true",
    size_mb: 12,
    status: "queued",
    created_at: "2026-05-11T09:01:00Z",
    operator: "jan.p@dlugomat.pl",
  },
];

const TONE: Record<ExportJob["status"], "info" | "warning" | "success" | "neutral"> = {
  queued: "info",
  running: "warning",
  ready: "success",
  expired: "neutral",
};

const LABEL: Record<ExportJob["status"], string> = {
  queued: "W kolejce",
  running: "Trwa",
  ready: "Gotowe",
  expired: "Wygasło",
};

const SCOPE_LABEL: Record<ExportJob["scope"], string> = {
  cases: "Sprawy",
  users: "Użytkownicy",
  letters: "Pisma",
  payments: "Płatności",
};

export default function EksportDanychPage() {
  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <p className="text-fluid-sm font-semibold uppercase tracking-wider text-dlugomat-600">
          Dane
        </p>
        <h1 className="text-fluid-3xl font-bold tracking-tight text-dlugomat-900 dark:text-white">
          Eksport danych
        </h1>
        <p className="max-w-2xl text-fluid-base text-iron-600 dark:text-iron-300">
          Asynchroniczne paczki eksportowe (ZIP z manifestem CSV).
          Każda paczka podpisana SHA-256, link ważny 24h, audyt RODO.
        </p>
      </header>

      <Card elevation="subtle">
        <CardHeader>
          <span
            aria-hidden
            className="grid size-9 place-items-center rounded-lg bg-dlugomat-100 text-dlugomat-700 dark:bg-dlugomat-850 dark:text-dlugomat-300"
          >
            <Archive className="size-5" />
          </span>
          <CardTitle className="mt-2 text-fluid-xl">
            Nowy eksport
          </CardTitle>
          <CardDescription>
            Wybierz zakres, ustaw filtry, otrzymasz e-mail z linkiem po
            zakończeniu zadania.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <Field label="Zakres" />
          <Field label="Format" />
          <Field label="Okres" />
          <div className="sm:col-span-3 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-iron-50/60 p-3 dark:bg-dlugomat-900/30">
            <span className="flex items-center gap-2 text-fluid-sm text-iron-700 dark:text-iron-200">
              <ShieldCheck className="size-4 text-accent-600" />
              Anonimizacja danych osobowych po PESEL/NIP w trybie agregatu
            </span>
            <Button>Utwórz eksport</Button>
          </div>
        </CardContent>
      </Card>

      <section className="flex flex-col gap-3">
        <h2 className="text-fluid-xl font-semibold text-dlugomat-900 dark:text-white">
          Zadania eksportu
        </h2>
        <Card elevation="subtle" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-fluid-sm">
              <thead className="border-b border-iron-200 bg-iron-50/60 dark:border-dlugomat-800 dark:bg-dlugomat-900/40">
                <tr className="text-left text-iron-600 dark:text-iron-300">
                  <th className="px-5 py-3 font-semibold">Zakres</th>
                  <th className="px-5 py-3 font-semibold">Filtry</th>
                  <th className="px-5 py-3 text-right font-semibold">Rozmiar</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Wygasa</th>
                  <th className="px-5 py-3 font-semibold">Akcja</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-iron-100 dark:divide-dlugomat-800">
                {JOBS.map((j) => (
                  <tr key={j.id}>
                    <td className="px-5 py-3 font-semibold">
                      {SCOPE_LABEL[j.scope]}
                    </td>
                    <td className="px-5 py-3 max-w-xs">
                      <code className="line-clamp-1 font-mono text-fluid-xs text-iron-500">
                        {j.filters}
                      </code>
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums">
                      {j.size_mb >= 1024
                        ? `${(j.size_mb / 1024).toFixed(1)} GB`
                        : `${j.size_mb} MB`}
                    </td>
                    <td className="px-5 py-3">
                      <Badge tone={TONE[j.status]} withDot>
                        {LABEL[j.status]}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 text-fluid-xs text-iron-500">
                      {j.expires_at ? (
                        <span className="flex items-center gap-1">
                          <Clock className="size-3" />
                          {new Date(j.expires_at).toLocaleString("pl-PL")}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-5 py-3">
                      {j.status === "ready" ? (
                        <Button size="sm" variant="success">
                          <Download className="size-4" />
                          Pobierz
                        </Button>
                      ) : (
                        <Button size="sm" variant="ghost" disabled>
                          —
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </section>
    </div>
  );
}

function Field({ label }: { label: string }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-fluid-xs font-semibold uppercase tracking-wider text-iron-600 dark:text-iron-300">
        {label}
      </span>
      <select className="h-11 rounded-lg border border-iron-200 bg-white px-3 text-fluid-sm focus-visible:shadow-shield-focus focus-visible:outline-none dark:border-iron-800 dark:bg-iron-950">
        <option>— wybierz —</option>
      </select>
    </label>
  );
}
