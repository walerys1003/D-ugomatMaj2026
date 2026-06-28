import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { computeRevenueMetrics } from "@/lib/analytics/revenue-metrics";
import { requireAdmin } from "@/lib/auth/require-admin";

export const metadata: Metadata = { title: "Revenue | Admin Analytics | Długomat" };
export const dynamic = "force-dynamic";

const PLN = (grosze: number) =>
  (grosze / 100).toLocaleString("pl-PL", { maximumFractionDigits: 0 });

export default async function RevenuePage() {
  const gate = await requireAdmin();
  if (!gate.ok) redirect("/sign-in?next=/admin/analytics/revenue");

  const data = await computeRevenueMetrics();

  return (
    <main className="container mx-auto px-4 py-8 max-w-7xl space-y-6">
      <div>
        <Link href="/admin/dashboard" className="text-xs text-ink-500 hover:text-ink-700">
          ← Admin
        </Link>
        <h1 className="font-display text-3xl font-semibold text-ink-900 dark:text-ink-50 mt-2">
          Revenue
        </h1>
        <p className="text-sm text-ink-500 mt-1">
          MRR · ARR · NRR · churn — liczone na żywo z tabeli subskrypcji.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <BigStat label="MRR" value={`${PLN(data.mrr_grosze)} zł`} />
        <BigStat label="ARR" value={`${PLN(data.arr_grosze)} zł`} />
        <BigStat
          label="NRR"
          value={`${Math.round(data.net_revenue_retention * 100)}%`}
        />
        <BigStat
          label="Aktywne subskrypcje"
          value={data.active_subscriptions.toLocaleString("pl-PL")}
        />
      </div>

      <Card elevation="subtle">
        <CardHeader>
          <CardTitle>Ruch subskrypcji (ostatnie 30 dni)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-3 gap-3">
            <MovementCard
              label="Nowe subskrypcje"
              value={data.new_subscriptions_30d}
              color="text-accent-700"
            />
            <MovementCard
              label="Churn (subskrypcje)"
              value={-data.churned_subscriptions_30d}
              color="text-danger-700"
            />
            <MovementCard
              label="Churn rate"
              value={Math.round(data.gross_churn_rate * 100)}
              color="text-danger-700"
              suffix="%"
            />
          </div>
        </CardContent>
      </Card>

      <Card elevation="subtle">
        <CardHeader>
          <CardTitle>Pozostałe wskaźniki</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid sm:grid-cols-3 gap-4 text-sm">
            <div>
              <dt className="text-xs uppercase tracking-wider text-ink-500">ARPU</dt>
              <dd className="font-display text-xl font-semibold text-ink-900 dark:text-ink-50">
                {PLN(data.arpu_grosze)} zł
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-ink-500">LTV (szac.)</dt>
              <dd className="font-display text-xl font-semibold text-ink-900 dark:text-ink-50">
                {PLN(data.ltv_grosze)} zł
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-ink-500">
                Wyliczono
              </dt>
              <dd className="text-ink-700 dark:text-ink-300">
                {new Date(data.computed_at).toLocaleString("pl-PL")}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </main>
  );
}

function BigStat({ label, value }: { label: string; value: string }) {
  return (
    <Card elevation="pop">
      <CardContent className="pt-5">
        <div className="text-xs uppercase tracking-wider text-ink-500 mb-1">{label}</div>
        <div className="font-display text-2xl font-semibold text-ink-900 dark:text-ink-50">
          {value}
        </div>
      </CardContent>
    </Card>
  );
}

function MovementCard({
  label,
  value,
  color,
  suffix = "",
}: {
  label: string;
  value: number;
  color: string;
  suffix?: string;
}) {
  return (
    <div className="rounded-lg border border-ink-200 dark:border-ink-800 px-4 py-3">
      <div className="text-xs uppercase tracking-wider text-ink-500 mb-1">{label}</div>
      <div className={`font-display text-xl font-semibold ${color}`}>
        {value >= 0 ? "+" : ""}
        {value.toLocaleString("pl-PL")}
        {suffix}
      </div>
    </div>
  );
}
