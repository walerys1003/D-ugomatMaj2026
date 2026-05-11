import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  Filter,
  RefreshCw,
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
  title: "Logi integracji — Admin Dlugomat",
  description: "Pelne logi wywolan integracji zewnetrznej z bledami i czasem.",
};

type Integration = {
  id: string;
  name: string;
  status: "healthy" | "degraded" | "down";
  events24h: number;
  errors24h: number;
  successRate: number;
};

type LogEntry = {
  id: string;
  timestamp: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  endpoint: string;
  status: number;
  durationMs: number;
  result: "success" | "warning" | "error";
  message?: string;
};

const INTEGRATIONS: Record<string, Integration> = {
  "int-salesforce": {
    id: "int-salesforce",
    name: "Salesforce CRM",
    status: "healthy",
    events24h: 4128,
    errors24h: 12,
    successRate: 0.997,
  },
};

const LOGS: LogEntry[] = [
  { id: "l-1", timestamp: "2026-05-10T11:42:18", method: "POST", endpoint: "/sobjects/Lead", status: 201, durationMs: 184, result: "success" },
  { id: "l-2", timestamp: "2026-05-10T11:41:52", method: "GET", endpoint: "/sobjects/Account/0014x", status: 200, durationMs: 92, result: "success" },
  { id: "l-3", timestamp: "2026-05-10T11:41:24", method: "POST", endpoint: "/sobjects/Lead", status: 201, durationMs: 217, result: "success" },
  { id: "l-4", timestamp: "2026-05-10T11:40:58", method: "PATCH", endpoint: "/sobjects/Opportunity/00684", status: 200, durationMs: 148, result: "success" },
  { id: "l-5", timestamp: "2026-05-10T11:40:21", method: "POST", endpoint: "/sobjects/Lead", status: 429, durationMs: 14, result: "warning", message: "Rate limit, retry w 2s" },
  { id: "l-6", timestamp: "2026-05-10T11:40:08", method: "GET", endpoint: "/query?q=SELECT+Id+FROM+Lead", status: 200, durationMs: 412, result: "success" },
  { id: "l-7", timestamp: "2026-05-10T11:39:42", method: "POST", endpoint: "/sobjects/Contact", status: 400, durationMs: 38, result: "error", message: "Missing required field: LastName" },
  { id: "l-8", timestamp: "2026-05-10T11:39:18", method: "POST", endpoint: "/sobjects/Lead", status: 201, durationMs: 194, result: "success" },
  { id: "l-9", timestamp: "2026-05-10T11:38:54", method: "PATCH", endpoint: "/sobjects/Account/0014x", status: 200, durationMs: 102, result: "success" },
  { id: "l-10", timestamp: "2026-05-10T11:38:21", method: "POST", endpoint: "/sobjects/Lead", status: 500, durationMs: 8420, result: "error", message: "Internal server error, retry w 30s" },
  { id: "l-11", timestamp: "2026-05-10T11:37:48", method: "GET", endpoint: "/sobjects/Lead/00Q4x", status: 200, durationMs: 88, result: "success" },
  { id: "l-12", timestamp: "2026-05-10T11:37:12", method: "POST", endpoint: "/sobjects/Task", status: 201, durationMs: 142, result: "success" },
];

const METHOD_TONE: Record<LogEntry["method"], "info" | "success" | "warning" | "danger" | "neutral"> = {
  GET: "info",
  POST: "success",
  PUT: "warning",
  PATCH: "warning",
  DELETE: "danger",
};

const RESULT_TONE: Record<LogEntry["result"], "success" | "warning" | "danger"> = {
  success: "success",
  warning: "warning",
  error: "danger",
};

const RESULT_ICON = {
  success: CheckCircle2,
  warning: AlertTriangle,
  error: XCircle,
};

const FILTERS = [
  { value: "all", label: "Wszystkie" },
  { value: "success", label: "Sukces" },
  { value: "warning", label: "Ostrzezenia" },
  { value: "error", label: "Bledy" },
];

const fmtTime = (iso: string) =>
  new Intl.DateTimeFormat("pl-PL", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(iso));

async function loadIntegration(id: string): Promise<Integration | null> {
  return INTEGRATIONS[id] ?? INTEGRATIONS["int-salesforce"] ?? null;
}

export default async function IntegrationLogsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const integration = await loadIntegration(id);
  if (!integration) return notFound();

  const errorsCount = LOGS.filter((l) => l.result === "error").length;
  const warningsCount = LOGS.filter((l) => l.result === "warning").length;

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8">
        <Link
          href={`/admin/integracje/${id}`}
          className="text-sm text-slate-600 hover:text-slate-900"
        >
          ← {integration.name}
        </Link>
        <div className="mt-3 flex items-start justify-between gap-6">
          <div>
            <h1 className="font-display text-3xl text-slate-900">
              Logi integracji
            </h1>
            <p className="mt-2 text-slate-600">
              {integration.events24h.toLocaleString("pl-PL")} wywolan w ostatnich
              24h · {(integration.successRate * 100).toFixed(1)}% sukcesu
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm">
              <RefreshCw className="mr-1 h-4 w-4" />
              Odswiez
            </Button>
            <Button variant="secondary" size="sm">
              <Download className="mr-1 h-4 w-4" />
              Eksport CSV
            </Button>
          </div>
        </div>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card elevation="subtle">
          <CardContent className="py-5">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Wywolan / 24h
            </p>
            <p className="mt-2 font-display text-2xl text-slate-900">
              {integration.events24h.toLocaleString("pl-PL")}
            </p>
          </CardContent>
        </Card>
        <Card elevation="subtle">
          <CardContent className="py-5">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Bledy / 24h
            </p>
            <p className="mt-2 font-display text-2xl text-rose-700">
              {integration.errors24h}
            </p>
          </CardContent>
        </Card>
        <Card elevation="subtle">
          <CardContent className="py-5">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Skutecznosc
            </p>
            <p className="mt-2 font-display text-2xl text-emerald-700">
              {(integration.successRate * 100).toFixed(1)}%
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <Filter className="h-4 w-4 text-slate-500" />
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 hover:border-slate-300 focus-visible:shadow-shield-focus"
          >
            {f.label}
          </button>
        ))}
        <span className="ml-auto text-xs text-slate-500">
          {errorsCount} bledow · {warningsCount} ostrzezen
        </span>
      </div>

      <Card elevation="subtle">
        <CardHeader>
          <CardTitle className="text-base">Ostatnie wywolania</CardTitle>
          <CardDescription>Najnowsze na gorze · auto-refresh co 10s</CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-6 py-3 font-medium">Czas</th>
                <th className="px-6 py-3 font-medium">Metoda</th>
                <th className="px-6 py-3 font-medium">Endpoint</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium text-right">Czas</th>
                <th className="px-6 py-3 font-medium">Wynik</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {LOGS.map((l) => {
                const Icon = RESULT_ICON[l.result];
                return (
                  <tr key={l.id} className="hover:bg-slate-50">
                    <td className="px-6 py-3 font-mono text-xs text-slate-700">
                      {fmtTime(l.timestamp)}
                    </td>
                    <td className="px-6 py-3">
                      <Badge tone={METHOD_TONE[l.method]}>{l.method}</Badge>
                    </td>
                    <td className="px-6 py-3 font-mono text-xs text-slate-700">
                      {l.endpoint}
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`font-mono text-xs ${
                          l.status >= 500
                            ? "text-rose-700"
                            : l.status >= 400
                              ? "text-amber-700"
                              : "text-emerald-700"
                        }`}
                      >
                        {l.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right text-xs text-slate-700">
                      {l.durationMs > 1000
                        ? `${(l.durationMs / 1000).toFixed(2)} s`
                        : `${l.durationMs} ms`}
                    </td>
                    <td className="px-6 py-3">
                      <Badge tone={RESULT_TONE[l.result]} withDot>
                        <Icon className="mr-1 inline h-3 w-3" />
                        {l.result === "success"
                          ? "OK"
                          : l.result === "warning"
                            ? "Ostrz."
                            : "Blad"}
                      </Badge>
                      {l.message ? (
                        <p className="mt-1 text-xs text-slate-500">
                          {l.message}
                        </p>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
