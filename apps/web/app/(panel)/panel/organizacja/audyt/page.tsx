import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";

export const metadata: Metadata = { title: "Audyt | Organizacja | Długomat" };

export const dynamic = "force-dynamic";

interface AuditLog {
  id: number;
  actor_id: string;
  action: string;
  target_type: string;
  target_id: string | null;
  ip: string | null;
  created_at: string;
}

const ACTION_LABELS: Record<string, string> = {
  "user.invited": "Zaproszenie",
  "user.removed": "Usunięcie",
  "user.role_changed": "Zmiana roli",
  "domain.verified": "Weryfikacja domeny",
  "sso.configured": "Konfiguracja SSO",
  "webhook.created": "Webhook utworzony",
  "billing.plan_changed": "Zmiana planu",
};

export default async function AudytPage({
  searchParams,
}: {
  searchParams: Promise<{ action?: string; actor?: string }>;
}) {
  const sp = await searchParams;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/logowanie?next=/panel/organizacja/audyt");

  // Wyznacz organizacje uzytkownika.
  const { data: membership } = await supabase
    .from("org_memberships")
    .select("org_id")
    .eq("user_id", user.id)
    .maybeSingle();

  let logs: AuditLog[] = [];
  if (membership) {
    let query = supabase
      .from("org_audit_log")
      .select("id, actor_id, action, target_type, target_id, ip, created_at")
      .eq("org_id", membership.org_id)
      .order("created_at", { ascending: false })
      .limit(100);
    if (sp.action) query = query.eq("action", sp.action);
    const { data } = await query;
    logs = (data ?? []) as AuditLog[];
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-6xl space-y-6">
      <div>
        <Link href="/panel/organizacja" className="text-xs text-ink-500 hover:text-ink-700">
          ← Organizacja
        </Link>
        <h1 className="font-display text-3xl font-semibold text-ink-900 dark:text-ink-50 mt-2">
          Dziennik audytu
        </h1>
        <p className="text-sm text-ink-500 mt-1">
          Niezmienialny log działań w Twojej organizacji. Retencja: 365 dni (Enterprise: 7 lat).
        </p>
      </div>

      <Card elevation="subtle">
        <CardContent className="pt-6">
          <form className="grid sm:grid-cols-[1fr_auto] gap-2">
            <select
              name="action"
              defaultValue={sp.action}
              className="rounded-lg border border-ink-300 dark:border-ink-700 bg-white dark:bg-ink-900 px-3 py-2 text-sm focus:outline-none focus-visible:shadow-shield-focus"
            >
              <option value="">Wszystkie akcje</option>
              {Object.entries(ACTION_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="rounded-lg bg-ink-900 text-ink-50 px-4 py-2 text-sm hover:bg-ink-800 focus:outline-none focus-visible:shadow-shield-focus"
            >
              Filtruj
            </button>
          </form>
        </CardContent>
      </Card>

      <Card elevation="subtle">
        <CardHeader>
          <CardTitle>Wydarzenia ({logs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <p className="text-sm text-ink-500">Brak zdarzeń w tym zakresie.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b border-ink-200 dark:border-ink-800 text-xs uppercase tracking-wider text-ink-500">
                    <th className="py-2 pr-3">Czas</th>
                    <th className="py-2 pr-3">Aktor (ID)</th>
                    <th className="py-2 pr-3">Akcja</th>
                    <th className="py-2 pr-3">Zasób</th>
                    <th className="py-2 pr-3">IP</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((l) => (
                    <tr key={l.id} className="border-b border-ink-100 dark:border-ink-900">
                      <td className="py-2.5 pr-3 text-ink-600 dark:text-ink-400 font-mono text-xs">
                        {new Date(l.created_at).toLocaleString("pl-PL")}
                      </td>
                      <td className="py-2.5 pr-3 text-ink-900 dark:text-ink-50 font-mono text-xs">
                        {l.actor_id.slice(0, 8)}
                      </td>
                      <td className="py-2.5 pr-3">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-ink-100 dark:bg-ink-800">
                          {ACTION_LABELS[l.action] ?? l.action}
                        </span>
                      </td>
                      <td className="py-2.5 pr-3 text-ink-600 dark:text-ink-400 font-mono text-xs">
                        {l.target_type}
                        {l.target_id ? `:${l.target_id.slice(0, 8)}` : ""}
                      </td>
                      <td className="py-2.5 pr-3 text-ink-500 font-mono text-xs">{l.ip ?? "—"}</td>
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
