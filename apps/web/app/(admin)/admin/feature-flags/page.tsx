import { listFlags } from "@/lib/admin/feature-flags";
import { requireAdmin } from "@/lib/auth/require-admin";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function FeatureFlagsPage() {
  const gate = await requireAdmin();
  if (!gate.ok) redirect("/logowanie");
  const flags = await listFlags();
  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-semibold mb-6">Feature flags</h1>
      <table className="w-full text-sm border border-slate-200 bg-white rounded">
        <thead className="bg-slate-50 text-left">
          <tr>
            <th className="p-2">Klucz</th>
            <th className="p-2">Włączone</th>
            <th className="p-2">Rollout %</th>
            <th className="p-2">Opis</th>
            <th className="p-2">Zaktualizowano</th>
          </tr>
        </thead>
        <tbody>
          {flags.map((f) => (
            <tr key={f.key} className="border-t">
              <td className="p-2 font-mono">{f.key}</td>
              <td className="p-2">{f.enabled ? "✓" : "—"}</td>
              <td className="p-2">{f.rollout_pct}%</td>
              <td className="p-2 text-slate-600">{f.description ?? ""}</td>
              <td className="p-2 text-slate-400">{f.updated_at ?? ""}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-xs text-slate-400 mt-4">
        Modyfikacja przez PUT /api/admin/feature-flags (audyt logowany).
      </p>
    </main>
  );
}
