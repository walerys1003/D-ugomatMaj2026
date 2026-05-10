import { redirect } from "next/navigation";
import { Copy, Share2, TrendingUp, Users } from "lucide-react";
import * as React from "react";

import { createSupabaseServerClient } from "@/lib/db/supabase-server";
import {
  buildReferralLink,
  getOrCreateReferralCode,
  listReferralStats,
} from "@/lib/referrals/referral-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { ReferralCodeShareCard } from "./share-card";

/**
 * Tier 5 zad. 246 — Panel użytkownika: program polecający.
 *
 * Strona w panelu:
 *   - Aktualny kod + przycisk "Skopiuj link"
 *   - 3 KPI tile: kliknięcia / zapisy / earnings
 *   - Tabela 50 ostatnich konwersji
 *
 * RLS: select_own pokazuje tylko własne dane.
 */
export const dynamic = "force-dynamic";

function formatPln(grosze: number): string {
  return (grosze / 100).toLocaleString("pl-PL", {
    style: "currency",
    currency: "PLN",
  });
}

function statusLabel(status: string): { label: string; tone: string } {
  switch (status) {
    case "pending":
      return { label: "Oczekuje", tone: "text-amber-600 bg-amber-50" };
    case "approved":
      return { label: "Zatwierdzona", tone: "text-emerald-700 bg-emerald-50" };
    case "paid":
      return { label: "Wypłacona", tone: "text-emerald-800 bg-emerald-100" };
    case "rejected":
      return { label: "Odrzucona", tone: "text-rose-600 bg-rose-50" };
    default:
      return { label: status, tone: "text-iron-600 bg-iron-50" };
  }
}

export default async function PoleceniaPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/sign-in?next=/panel/polecenia");

  // Idempotent — utworzy jeśli brak.
  const code = await getOrCreateReferralCode(user.id);
  const stats = await listReferralStats(user.id);
  const link = buildReferralLink(code.code);

  const totalEarnedPending = stats.totals.pending_grosze;
  const totalEarnedApproved = stats.totals.approved_grosze;
  const totalEarnedPaid = stats.totals.paid_grosze;
  const totalEarned =
    totalEarnedPending + totalEarnedApproved + totalEarnedPaid;

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-dlugomat-900">
          Program polecający
        </h1>
        <p className="max-w-2xl text-sm text-iron-600">
          Polecaj Długomat znajomym, którzy potrzebują pomocy z długami.
          Otrzymasz {Number(code.reward_pct).toFixed(0)}% prowizji od każdej
          opłaconej sprawy. Wypłaty miesięczne, po zaksięgowaniu płatności.
        </p>
      </header>

      <ReferralCodeShareCard code={code.code} link={link} />

      <section className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-iron-700">
              <Users className="h-4 w-4" /> Kliknięcia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tabular-nums">
              {code.total_clicks.toLocaleString("pl-PL")}
            </p>
            <p className="text-xs text-iron-500">łączna liczba wejść</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-iron-700">
              <Share2 className="h-4 w-4" /> Konwersje
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tabular-nums">
              {code.total_signups.toLocaleString("pl-PL")}
            </p>
            <p className="text-xs text-iron-500">opłacone polecenia</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-iron-700">
              <TrendingUp className="h-4 w-4" /> Zarobione
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tabular-nums">
              {formatPln(totalEarned)}
            </p>
            <p className="text-xs text-iron-500">
              wypłacone {formatPln(totalEarnedPaid)} · do wypłaty{" "}
              {formatPln(totalEarnedApproved)}
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-dlugomat-900">
          Ostatnie polecenia ({stats.recentConversions.length})
        </h2>
        {stats.recentConversions.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-sm text-iron-500">
              Brak polecień. Udostępnij swój link i zacznij zarabiać.
            </CardContent>
          </Card>
        ) : (
          <div className="overflow-hidden rounded-lg border border-iron-200 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-iron-50 text-iron-600">
                <tr>
                  <th className="px-4 py-2 text-left font-medium">Data</th>
                  <th className="px-4 py-2 text-left font-medium">Kod</th>
                  <th className="px-4 py-2 text-right font-medium">
                    Kwota sprawy
                  </th>
                  <th className="px-4 py-2 text-right font-medium">
                    Twoja prowizja
                  </th>
                  <th className="px-4 py-2 text-left font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-iron-100">
                {stats.recentConversions.map((c) => {
                  const s = statusLabel(c.status);
                  return (
                    <tr key={c.id}>
                      <td className="px-4 py-2 text-iron-600">
                        {new Date(c.created_at).toLocaleDateString("pl-PL")}
                      </td>
                      <td className="px-4 py-2 font-mono text-xs text-iron-500">
                        {c.code}
                      </td>
                      <td className="px-4 py-2 text-right tabular-nums">
                        {formatPln(c.amount_grosze)}
                      </td>
                      <td className="px-4 py-2 text-right tabular-nums font-medium">
                        {formatPln(c.reward_grosze)}
                      </td>
                      <td className="px-4 py-2">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${s.tone}`}
                        >
                          {s.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-iron-700">
            Jak to działa?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-iron-600">
          <p>
            <strong>1.</strong> Udostępnij swój link osobom, które mogą
            potrzebować pomocy z długami (komornik, sprzeciw EPU, BIK).
          </p>
          <p>
            <strong>2.</strong> Gdy ktoś kliknie i zarejestruje się w ciągu
            90 dni, polecenie jest do Ciebie przypisane.
          </p>
          <p>
            <strong>3.</strong> Po pierwszej opłaconej sprawie polecanego
            otrzymujesz {Number(code.reward_pct).toFixed(0)}% prowizji.
          </p>
          <p>
            <strong>4.</strong> Wypłaty miesięczne — minimalna kwota wypłaty:
            100&nbsp;zł.
          </p>
          <p className="pt-2 text-xs text-iron-500">
            Anti-fraud: nie można polecać samego siebie ani wielokrotnie tego
            samego użytkownika. W przypadku zwrotu pieniędzy klientowi
            prowizja jest cofana.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
