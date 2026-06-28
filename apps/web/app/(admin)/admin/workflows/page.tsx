import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";
import { requireAdmin } from "@/lib/auth/require-admin";

export const metadata: Metadata = { title: "Workflows | Admin | Długomat" };
export const dynamic = "force-dynamic";

interface WorkflowRow {
  id: string;
  name: string;
  enabled: boolean;
  trigger: string;
  actions: unknown[];
  created_at: string;
}

const TRIGGER_LABEL: Record<string, string> = {
  schedule: "Harmonogram",
  event: "Zdarzenie",
  manual: "Ręczny",
  webhook: "Webhook",
  user_action: "Akcja użytkownika",
  metric_threshold: "Próg metryki",
};

export default async function WorkflowsPage() {
  const gate = await requireAdmin();
  if (!gate.ok) redirect("/sign-in?next=/admin/workflows");

  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb: any = await createSupabaseServerClient();
  const { data } = await sb
    .from("workflows")
    .select("id, name, enabled, trigger, actions, created_at")
    .order("created_at", { ascending: false })
    .limit(200);
  const workflows: WorkflowRow[] = data ?? [];
  const active = workflows.filter((w) => w.enabled);

  return (
    <main className="container mx-auto px-4 py-8 max-w-7xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Link href="/admin/dashboard" className="text-xs text-ink-500 hover:text-ink-700">
            ← Admin
          </Link>
          <h1 className="font-display text-3xl font-semibold text-ink-900 dark:text-ink-50 mt-2">
            Workflows
          </h1>
          <p className="text-sm text-ink-500 mt-1">
            {workflows.length} workflow · {active.length} aktywnych
          </p>
        </div>
        <Link href="/admin/workflows/nowy">
          <Button variant="primary">+ Nowy workflow</Button>
        </Link>
      </div>

      <Card elevation="subtle">
        <CardHeader>
          <CardTitle>Wszystkie workflow</CardTitle>
        </CardHeader>
        <CardContent>
          {workflows.length === 0 ? (
            <p className="text-sm text-ink-500">
              Brak zdefiniowanych workflow. Utwórz pierwszy przez{" "}
              <code className="font-mono">POST /api/workflows</code> lub przycisk
              powyżej.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b border-ink-200 dark:border-ink-800 text-xs uppercase tracking-wider text-ink-500">
                    <th className="py-2 pr-3">Workflow</th>
                    <th className="py-2 pr-3">Trigger</th>
                    <th className="py-2 pr-3">Status</th>
                    <th className="py-2 pr-3 text-right">Akcje</th>
                    <th className="py-2 pr-3">Utworzono</th>
                    <th className="py-2 pr-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {workflows.map((w) => (
                    <tr key={w.id} className="border-b border-ink-100 dark:border-ink-900">
                      <td className="py-3 pr-3">
                        <div className="font-medium text-ink-900 dark:text-ink-50">{w.name}</div>
                      </td>
                      <td className="py-3 pr-3 text-ink-700 dark:text-ink-300 text-xs">
                        {TRIGGER_LABEL[w.trigger] ?? w.trigger}
                      </td>
                      <td className="py-3 pr-3">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full border ${
                            w.enabled
                              ? "bg-accent-50 text-accent-700 border-accent-200"
                              : "bg-ink-100 text-ink-600 border-ink-200"
                          }`}
                        >
                          {w.enabled ? "Aktywny" : "Wstrzymany"}
                        </span>
                      </td>
                      <td className="py-3 pr-3 text-right font-mono text-xs">
                        {Array.isArray(w.actions) ? w.actions.length : 0}
                      </td>
                      <td className="py-3 pr-3 text-xs text-ink-500">
                        {new Date(w.created_at).toLocaleDateString("pl-PL")}
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
