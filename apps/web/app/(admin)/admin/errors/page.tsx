import { recentErrorSummary } from "@/lib/quality/error-tracking";
import { requireAdmin } from "@/lib/auth/require-admin";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ErrorsPage() {
  const gate = await requireAdmin();
  if (!gate.ok) redirect("/logowanie");
  const summary = await recentErrorSummary();
  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-semibold mb-6">Otwarte błędy</h1>
      <p className="text-sm text-slate-500 mb-4">
        Łącznie: {summary.total} · Ostatnie 24h: {summary.last_24h}
      </p>
      <div className="space-y-3">
        {summary.top.map((e) => (
          <div key={e.fingerprint} className="rounded border border-slate-200 bg-white p-3">
            <div className="font-mono text-xs text-slate-400">{e.fingerprint}</div>
            <div className="font-medium">{e.message}</div>
            <div className="text-xs text-slate-500 mt-1">
              wystąpień: {e.count} · ostatnio: {e.last_seen_at}
            </div>
          </div>
        ))}
        {summary.top.length === 0 && <p className="text-slate-500">Brak otwartych błędów.</p>}
      </div>
    </main>
  );
}
