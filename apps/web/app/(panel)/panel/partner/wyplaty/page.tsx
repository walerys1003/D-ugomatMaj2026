import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "Wypłaty | Partner | Długomat" };

interface Payout {
  id: string;
  period_start: string;
  period_end: string;
  amount_pln: number;
  status: "scheduled" | "processing" | "paid" | "failed";
  paid_at?: string;
  invoice_number?: string;
  pdf_url?: string;
}

async function fetchPayouts(): Promise<Payout[]> {
  try {
    const res = await fetch("/api/partner/payouts", { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return data.payouts ?? [];
  } catch {
    return [];
  }
}

const STATUS_BADGE: Record<Payout["status"], string> = {
  scheduled: "bg-ink-100 text-ink-700 border-ink-200",
  processing: "bg-warn-50 text-warn-700 border-warn-200",
  paid: "bg-accent-50 text-accent-700 border-accent-200",
  failed: "bg-danger-50 text-danger-700 border-danger-200",
};

const STATUS_LABEL: Record<Payout["status"], string> = {
  scheduled: "Zaplanowana",
  processing: "W trakcie",
  paid: "Wypłacona",
  failed: "Niepowodzenie",
};

export default async function WyplatyPage() {
  const payouts = await fetchPayouts();
  const totalPaid = payouts
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + p.amount_pln, 0);

  return (
    <main className="container mx-auto px-4 py-8 max-w-6xl space-y-6">
      <div>
        <Link href="/panel/partner" className="text-xs text-ink-500 hover:text-ink-700">
          ← Panel partnera
        </Link>
        <h1 className="font-display text-3xl font-semibold text-ink-900 dark:text-ink-50 mt-2">
          Historia wypłat
        </h1>
        <p className="text-sm text-ink-500 mt-1">
          Łącznie wypłacono: {totalPaid.toLocaleString("pl-PL")} zł
        </p>
      </div>

      <Card elevation="subtle">
        <CardHeader>
          <CardTitle>Wypłaty</CardTitle>
        </CardHeader>
        <CardContent>
          {payouts.length === 0 ? (
            <p className="text-sm text-ink-500">Brak wypłat — pierwsza po zakończeniu okresu rozliczeniowego.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b border-ink-200 dark:border-ink-800 text-xs uppercase tracking-wider text-ink-500">
                    <th className="py-2 pr-3">Okres</th>
                    <th className="py-2 pr-3">Kwota</th>
                    <th className="py-2 pr-3">Status</th>
                    <th className="py-2 pr-3">Wypłacono</th>
                    <th className="py-2 pr-3">Faktura</th>
                  </tr>
                </thead>
                <tbody>
                  {payouts.map((p) => (
                    <tr key={p.id} className="border-b border-ink-100 dark:border-ink-900">
                      <td className="py-2.5 pr-3 text-ink-600 dark:text-ink-400">
                        {new Date(p.period_start).toLocaleDateString("pl-PL")} —{" "}
                        {new Date(p.period_end).toLocaleDateString("pl-PL")}
                      </td>
                      <td className="py-2.5 pr-3 font-medium text-ink-900 dark:text-ink-50">
                        {p.amount_pln.toLocaleString("pl-PL")} zł
                      </td>
                      <td className="py-2.5 pr-3">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_BADGE[p.status]}`}
                        >
                          {STATUS_LABEL[p.status]}
                        </span>
                      </td>
                      <td className="py-2.5 pr-3 text-ink-600 dark:text-ink-400">
                        {p.paid_at ? new Date(p.paid_at).toLocaleDateString("pl-PL") : "—"}
                      </td>
                      <td className="py-2.5 pr-3">
                        {p.pdf_url ? (
                          <a
                            href={p.pdf_url}
                            className="text-xs text-accent-700 hover:text-accent-800"
                          >
                            {p.invoice_number ?? "Pobierz"}
                          </a>
                        ) : (
                          <span className="text-ink-400">—</span>
                        )}
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
