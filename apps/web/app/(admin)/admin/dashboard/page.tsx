import { getAdminMetrics } from "@/lib/admin/dashboard-metrics";
import { requireAdmin } from "@/lib/auth/require-admin";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const gate = await requireAdmin();
  if (!gate.ok) redirect("/logowanie");
  const m = await getAdminMetrics();
  const pln = (g: number) => (g / 100).toLocaleString("pl-PL", { style: "currency", currency: "PLN" });
  const cards: Array<[string, string]> = [
    ["Użytkownicy łącznie", m.users_total.toLocaleString("pl-PL")],
    ["Aktywni (30d)", m.users_active_30d.toLocaleString("pl-PL")],
    ["Sprawy łącznie", m.cases_total.toLocaleString("pl-PL")],
    ["Sprawy (30d)", m.cases_created_30d.toLocaleString("pl-PL")],
    ["Przychód (30d)", pln(m.revenue_grosze_30d)],
    ["Aktywne subskrypcje", m.active_subscriptions.toLocaleString("pl-PL")],
    ["MRR", pln(m.mrr_grosze)],
    ["Zapisy afiliantów (30d)", m.affiliate_signups_30d.toLocaleString("pl-PL")],
    ["Otwarte błędy", m.open_error_reports.toLocaleString("pl-PL")],
  ];
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-semibold mb-6">Panel administracyjny — KPI</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {cards.map(([label, value]) => (
          <div key={label} className="rounded-lg border border-slate-200 p-4 bg-white">
            <div className="text-sm text-slate-500">{label}</div>
            <div className="text-2xl font-bold mt-1">{value}</div>
          </div>
        ))}
      </div>
      <p className="text-xs text-slate-400 mt-6">Wygenerowano: {new Date(m.computed_at).toLocaleString("pl-PL")}</p>
    </main>
  );
}
