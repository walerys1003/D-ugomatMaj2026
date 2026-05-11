import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Workflows | Admin | Długomat" };

interface Workflow {
  id: string;
  name: string;
  description: string;
  trigger:
    | "schedule"
    | "event"
    | "manual"
    | "webhook"
    | "user_action"
    | "metric_threshold";
  status: "active" | "paused" | "draft" | "errored";
  last_run_at?: string;
  last_run_status?: "success" | "partial" | "failed";
  runs_24h: number;
  success_rate_24h_percent: number;
  next_run_at?: string;
}

const STATUS_BADGE: Record<Workflow["status"], string> = {
  active: "bg-accent-50 text-accent-700 border-accent-200",
  paused: "bg-iron-100 text-iron-700 border-iron-200",
  draft: "bg-iron-100 text-iron-600 border-iron-200",
  errored: "bg-danger-50 text-danger-700 border-danger-200",
};

const STATUS_LABEL: Record<Workflow["status"], string> = {
  active: "Aktywny",
  paused: "Wstrzymany",
  draft: "Szkic",
  errored: "Błąd",
};

const TRIGGER_LABEL: Record<Workflow["trigger"], string> = {
  schedule: "Harmonogram",
  event: "Zdarzenie",
  manual: "Ręczny",
  webhook: "Webhook",
  user_action: "Akcja użytkownika",
  metric_threshold: "Próg metryki",
};

async function fetchWorkflows(): Promise<Workflow[]> {
  try {
    const res = await fetch("/api/admin/workflows", { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return data.workflows ?? [];
  } catch {
    return [];
  }
}

export default async function WorkflowsPage() {
  const workflows = await fetchWorkflows();
  const errored = workflows.filter((w) => w.status === "errored");

  return (
    <main className="container mx-auto px-4 py-8 max-w-7xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Link href="/admin/dashboard" className="text-xs text-iron-500 hover:text-iron-700">
            ← Admin
          </Link>
          <h1 className="font-display text-3xl font-semibold text-iron-900 dark:text-iron-50 mt-2">
            Workflows
          </h1>
          <p className="text-sm text-iron-500 mt-1">
            {workflows.length} workflow · {workflows.filter((w) => w.status === "active").length}{" "}
            aktywnych · {errored.length} w błędzie
          </p>
        </div>
        <Link href="/admin/workflows/nowy">
          <Button variant="primary">+ Nowy workflow</Button>
        </Link>
      </div>

      {errored.length > 0 && (
        <Card elevation="pop" urgency="critical">
          <CardHeader>
            <CardTitle className="text-danger-700">
              W błędzie ({errored.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {errored.map((w) => (
                <WorkflowRow key={w.id} workflow={w} />
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Card elevation="subtle">
        <CardHeader>
          <CardTitle>Wszystkie workflow</CardTitle>
        </CardHeader>
        <CardContent>
          {workflows.length === 0 ? (
            <p className="text-sm text-iron-500">Brak zdefiniowanych workflow.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b border-iron-200 dark:border-iron-800 text-xs uppercase tracking-wider text-iron-500">
                    <th className="py-2 pr-3">Workflow</th>
                    <th className="py-2 pr-3">Trigger</th>
                    <th className="py-2 pr-3">Status</th>
                    <th className="py-2 pr-3 text-right">Uruchomienia 24h</th>
                    <th className="py-2 pr-3 text-right">Sukces 24h</th>
                    <th className="py-2 pr-3">Następne</th>
                    <th className="py-2 pr-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {workflows.map((w) => (
                    <tr key={w.id} className="border-b border-iron-100 dark:border-iron-900">
                      <td className="py-3 pr-3">
                        <div className="font-medium text-iron-900 dark:text-iron-50">{w.name}</div>
                        <div className="text-xs text-iron-500 line-clamp-1">{w.description}</div>
                      </td>
                      <td className="py-3 pr-3 text-iron-700 dark:text-iron-300 text-xs">
                        {TRIGGER_LABEL[w.trigger]}
                      </td>
                      <td className="py-3 pr-3">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_BADGE[w.status]}`}
                        >
                          {STATUS_LABEL[w.status]}
                        </span>
                      </td>
                      <td className="py-3 pr-3 text-right font-mono text-xs">
                        {w.runs_24h.toLocaleString("pl-PL")}
                      </td>
                      <td className="py-3 pr-3 text-right">
                        <span
                          className={
                            w.success_rate_24h_percent >= 99
                              ? "text-accent-700"
                              : w.success_rate_24h_percent >= 95
                                ? "text-warn-700"
                                : "text-danger-700"
                          }
                        >
                          {w.success_rate_24h_percent.toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-3 pr-3 text-xs text-iron-500">
                        {w.next_run_at
                          ? new Date(w.next_run_at).toLocaleString("pl-PL")
                          : "—"}
                      </td>
                      <td className="py-3 pr-3 text-right">
                        <Link
                          href={`/admin/workflows/${w.id}`}
                          className="text-xs text-accent-700 hover:text-accent-800"
                        >
                          Otwórz →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}

function WorkflowRow({ workflow }: { workflow: Workflow }) {
  return (
    <li className="rounded-md border border-danger-200 dark:border-danger-700/40 bg-danger-50/30 dark:bg-danger-700/5 p-3 flex flex-wrap items-center justify-between gap-2">
      <div>
        <div className="font-medium text-iron-900 dark:text-iron-50">{workflow.name}</div>
        <div className="text-xs text-iron-500">
          Ostatnie: {workflow.last_run_at
            ? new Date(workflow.last_run_at).toLocaleString("pl-PL")
            : "nigdy"}
          {workflow.last_run_status && ` (${workflow.last_run_status})`}
        </div>
      </div>
      <Link
        href={`/admin/workflows/${workflow.id}`}
        className="text-xs text-accent-700 hover:text-accent-800"
      >
        Zbadaj →
      </Link>
    </li>
  );
}
