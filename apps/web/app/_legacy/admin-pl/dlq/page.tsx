import type { Metadata } from "next";

import { requireFullAdmin } from "@/lib/admin/rbac";
import { createSupabaseAdminClient } from "@/lib/db/supabase-server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Dead-letter queue — Admin",
  robots: { index: false, follow: false },
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Tier 6 zad. 258 — Dead-letter queue dla nieudanych notyfikacji.
 *
 * Pokazuje wiersze z `notifications` o statusie 'dead_letter' lub 'failed'
 * z liczbą prób >= 5. Admin może ręcznie zresetować status do 'scheduled'
 * (akcja w Tier 7 — tu tylko read-only inspection).
 */

interface DlqRow {
  id: string;
  channel: string;
  template: string;
  recipient: string | null;
  status: string;
  attempt_count: number | null;
  last_error: string | null;
  scheduled_for: string | null;
  created_at: string;
}

function tone(status: string): "danger" | "warning" | "neutral" {
  if (status === "dead_letter") return "danger";
  if (status === "failed") return "warning";
  return "neutral";
}

export default async function AdminDlqPage() {
  await requireFullAdmin();
  const admin = createSupabaseAdminClient();

  let rows: DlqRow[] = [];
  let totalDlq = 0;
  let totalFailed = 0;

  if (admin) {
    try {
      const { data } = await admin
        .from("notifications")
        .select("id,channel,template,recipient,status,attempt_count,last_error,scheduled_for,created_at")
        .in("status", ["dead_letter", "failed"])
        .order("created_at", { ascending: false })
        .limit(200);
      rows = (data ?? []) as DlqRow[];
      totalDlq = rows.filter((r) => r.status === "dead_letter").length;
      totalFailed = rows.filter((r) => r.status === "failed").length;
    } catch {
      // tolerate missing column on older schemas
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-baseline justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dead-letter queue</h1>
          <p className="text-sm text-muted-foreground">
            Nieudane notyfikacje (email / SMS / push). Wymagają interwencji manualnej.
          </p>
        </div>
        <div className="flex gap-2">
          <Badge tone="danger">{totalDlq} dead_letter</Badge>
          <Badge tone="warning">{totalFailed} failed</Badge>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ostatnie 200 nieudanych prób</CardTitle>
          <CardDescription>Sortowane wg czasu utworzenia (najnowsze pierwsze).</CardDescription>
        </CardHeader>
        <CardContent>
          {rows.length === 0 ? (
            <p className="py-6 text-sm text-muted-foreground">
              Brak elementów w DLQ — wszystkie notyfikacje przebiegły poprawnie.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="py-2 text-left font-medium">Kanał</th>
                    <th className="py-2 text-left font-medium">Szablon</th>
                    <th className="py-2 text-left font-medium">Odbiorca</th>
                    <th className="py-2 text-right font-medium">Próby</th>
                    <th className="py-2 text-left font-medium">Status</th>
                    <th className="py-2 text-left font-medium">Błąd</th>
                    <th className="py-2 text-right font-medium">Czas</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id} className="border-b last:border-0 align-top">
                      <td className="py-2">{r.channel}</td>
                      <td className="py-2">
                        <code className="text-xs">{r.template}</code>
                      </td>
                      <td className="py-2">
                        <code className="text-xs">{r.recipient ?? "—"}</code>
                      </td>
                      <td className="py-2 text-right tabular-nums">
                        {r.attempt_count ?? "—"}
                      </td>
                      <td className="py-2">
                        <Badge tone={tone(r.status)}>{r.status}</Badge>
                      </td>
                      <td className="py-2 text-xs text-muted-foreground">
                        {r.last_error ? r.last_error.slice(0, 160) : "—"}
                      </td>
                      <td className="py-2 text-right text-xs text-muted-foreground">
                        {new Date(r.created_at).toLocaleString("pl-PL")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
