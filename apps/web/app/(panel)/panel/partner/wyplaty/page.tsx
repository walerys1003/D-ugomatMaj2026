import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";

export const metadata: Metadata = { title: "Wypłaty | Partner | Długomat" };

export const dynamic = "force-dynamic";

type PayoutStatus = "pending" | "transferred" | "failed";

const STATUS_BADGE: Record<PayoutStatus, string> = {
  pending: "bg-warn-50 text-warn-700 border-warn-200",
  transferred: "bg-accent-50 text-accent-700 border-accent-200",
  failed: "bg-danger-50 text-danger-700 border-danger-200",
};

const STATUS_LABEL: Record<PayoutStatus, string> = {
  pending: "Oczekuje",
  transferred: "Wypłacona",
  failed: "Niepowodzenie",
};

export default async function WyplatyPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/logowanie?next=/panel/partner/wyplaty");

  // Konto afiliacyjne biezacego uzytkownika (RLS filtruje po user_id).
  const { data: account } = await supabase
    .from("affiliate_accounts")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  let payouts: {
    id: string;
    amount_pln: number;
    period_end: string;
    status: PayoutStatus;
    commission_count: number;
    external_ref: string | null;
    transferred_at: string | null;
    created_at: string;
  }[] = [];

  if (account) {
    const { data } = await supabase
      .from("affiliate_payouts")
      .select("id, amount_grosze, period_end, status, commission_count, external_ref, transferred_at, created_at")
      .eq("affiliate_id", account.id)
      .order("created_at", { ascending: false });
    payouts = (data ?? []).map((p) => ({
      id: p.id,
      amount_pln: (p.amount_grosze ?? 0) / 100,
      period_end: p.period_end,
      status: p.status as PayoutStatus,
      commission_count: p.commission_count,
      external_ref: p.external_ref,
      transferred_at: p.transferred_at,
      created_at: p.created_at,
    }));
  }

  const totalPaid = payouts
    .filter((p) => p.status === "transferred")
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
          {!account ? (
            <p className="text-sm text-ink-500">
              Nie masz jeszcze konta partnerskiego. Dołącz do programu, aby otrzymywać wypłaty.
            </p>
          ) : payouts.length === 0 ? (
            <p className="text-sm text-ink-500">
              Brak wypłat — pierwsza po zakończeniu okresu rozliczeniowego.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b border-ink-200 dark:border-ink-800 text-xs uppercase tracking-wider text-ink-500">
                    <th className="py-2 pr-3">Okres do</th>
                    <th className="py-2 pr-3">Kwota</th>
                    <th className="py-2 pr-3">Prowizje</th>
                    <th className="py-2 pr-3">Status</th>
                    <th className="py-2 pr-3">Wypłacono</th>
                    <th className="py-2 pr-3">Referencja</th>
                  </tr>
                </thead>
                <tbody>
                  {payouts.map((p) => (
                    <tr key={p.id} className="border-b border-ink-100 dark:border-ink-900">
                      <td className="py-2.5 pr-3 text-ink-600 dark:text-ink-400">
                        {new Date(p.period_end).toLocaleDateString("pl-PL")}
                      </td>
                      <td className="py-2.5 pr-3 font-medium text-ink-900 dark:text-ink-50">
                        {p.amount_pln.toLocaleString("pl-PL")} zł
                      </td>
                      <td className="py-2.5 pr-3 text-ink-600 dark:text-ink-400">
                        {p.commission_count}
                      </td>
                      <td className="py-2.5 pr-3">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_BADGE[p.status]}`}
                        >
                          {STATUS_LABEL[p.status]}
                        </span>
                      </td>
                      <td className="py-2.5 pr-3 text-ink-600 dark:text-ink-400">
                        {p.transferred_at
                          ? new Date(p.transferred_at).toLocaleDateString("pl-PL")
                          : "—"}
                      </td>
                      <td className="py-2.5 pr-3 text-ink-600 dark:text-ink-400">
                        {p.external_ref ?? "—"}
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
