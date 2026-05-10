/**
 * AffiliateDashboard — widok statystyk dla zalogowanego affiliate.
 */
"use client";

import { useEffect, useState } from "react";

interface AffiliateStats {
  totalClicks: number;
  totalSignups: number;
  totalConversions: number;
  pendingCommissionGrosze: number;
  paidCommissionGrosze: number;
  conversionRate: number;
}

interface AffiliateAccount {
  id: string;
  slug: string;
  display_name: string;
  status: string;
  commission_first_payment_pct: number;
  commission_recurring_pct: number;
}

export default function AffiliateDashboard() {
  const [data, setData] = useState<{ account: AffiliateAccount; stats: AffiliateStats } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/affiliate/stats")
      .then(async (r) => {
        if (!r.ok) {
          setError(r.status === 404 ? "Nie jesteś jeszcze affiliate" : "Błąd ładowania");
          return null;
        }
        return r.json();
      })
      .then((d) => d && setData(d))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-8">Ładowanie…</div>;
  if (error) return <div className="text-center py-8 text-gray-600">{error}</div>;
  if (!data) return null;

  const { account, stats } = data;
  const link = `https://dlugomat.pl/?ref=${account.slug}`;

  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-white p-6">
        <h2 className="text-xl font-bold">{account.display_name}</h2>
        <p className="text-sm text-gray-600 mt-1">
          Status: <span className="font-semibold">{account.status}</span> ·
          Prowizja: <strong>{account.commission_first_payment_pct}%</strong> pierwsza płatność,{" "}
          <strong>{account.commission_recurring_pct}%</strong> kolejne (12 m-cy)
        </p>
        <div className="mt-4 flex items-center gap-2">
          <input
            type="text"
            readOnly
            value={link}
            className="flex-1 rounded border px-3 py-2 text-sm bg-gray-50"
          />
          <button
            type="button"
            onClick={() => navigator.clipboard.writeText(link)}
            className="rounded-md bg-blue-600 px-4 py-2 text-white text-sm font-medium"
          >
            Kopiuj link
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Kliknięcia" value={stats.totalClicks.toLocaleString("pl-PL")} />
        <StatCard label="Rejestracje" value={stats.totalSignups.toLocaleString("pl-PL")} />
        <StatCard label="Konwersje" value={stats.totalConversions.toLocaleString("pl-PL")} />
        <StatCard
          label="Konwersja %"
          value={`${(stats.conversionRate * 100).toFixed(1)}%`}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border bg-amber-50 p-6">
          <div className="text-sm text-gray-700">Prowizja oczekująca</div>
          <div className="text-2xl font-bold mt-1">
            {(stats.pendingCommissionGrosze / 100).toFixed(2)} zł
          </div>
          <p className="text-xs text-gray-600 mt-2">
            Wypłaty raz w miesiącu, próg 200 zł.
          </p>
        </div>
        <div className="rounded-lg border bg-green-50 p-6">
          <div className="text-sm text-gray-700">Wypłacone łącznie</div>
          <div className="text-2xl font-bold mt-1">
            {(stats.paidCommissionGrosze / 100).toFixed(2)} zł
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-white p-4">
      <div className="text-xs uppercase text-gray-500">{label}</div>
      <div className="text-2xl font-bold mt-1">{value}</div>
    </div>
  );
}
