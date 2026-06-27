import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { BarChart3 } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Raporty · Partner · Długomat",
  description:
    "Twoje wyniki partnerskie miesiąc do miesiąca: prowizje i konwersje.",
};

type Month = {
  key: string;
  label: string;
  commission_pln: number;
  count: number;
};

const MONTHS_PL = ["Sty", "Lut", "Mar", "Kwi", "Maj", "Cze", "Lip", "Sie", "Wrz", "Paź", "Lis", "Gru"];

function pln(n: number) {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
    maximumFractionDigits: 0,
  }).format(n);
}

export default async function PartnerRaportyPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/logowanie?next=/panel/partner/raporty");

  const { data: account } = await supabase
    .from("affiliate_accounts")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!account) {
    return (
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <header>
          <p className="text-fluid-sm font-semibold uppercase tracking-wider text-dlugomat-600">
            Partner · Wyniki
          </p>
          <h1 className="text-fluid-3xl font-bold tracking-tight text-dlugomat-900 dark:text-white">
            Raporty
          </h1>
        </header>
        <EmptyState
          title="Brak konta partnerskiego"
          description="Raporty wyników są dostępne po dołączeniu do programu partnerskiego."
        />
      </div>
    );
  }

  const [{ data: commissionsData }, { data: referralsData }] = await Promise.all([
    supabase
      .from("affiliate_commissions")
      .select("amount_grosze, status, created_at")
      .eq("affiliate_id", account.id)
      .limit(2000),
    supabase
      .from("affiliate_referrals")
      .select("id, status")
      .eq("affiliate_id", account.id)
      .limit(2000),
  ]);

  const commissions = commissionsData ?? [];
  const referrals = referralsData ?? [];

  const totalEarned =
    commissions
      .filter((c) => c.status === "paid")
      .reduce((acc, c) => acc + (c.amount_grosze ?? 0), 0) / 100;
  const pendingEarned =
    commissions
      .filter((c) => c.status === "pending")
      .reduce((acc, c) => acc + (c.amount_grosze ?? 0), 0) / 100;
  const convertedCount = referrals.filter((r) => r.status === "converted").length;
  const convRate = referrals.length > 0 ? Math.round((convertedCount / referrals.length) * 100) : 0;

  // Build last 6 months of commissions.
  const now = new Date();
  const months: Month[] = [];
  for (let i = 5; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      key: `${d.getFullYear()}-${d.getMonth()}`,
      label: `${MONTHS_PL[d.getMonth()]} ${d.getFullYear()}`,
      commission_pln: 0,
      count: 0,
    });
  }
  const idxByKey = new Map(months.map((m, i) => [m.key, i]));
  for (const c of commissions) {
    const d = new Date(c.created_at);
    if (Number.isNaN(d.getTime())) continue;
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const idx = idxByKey.get(key);
    if (idx == null) continue;
    months[idx].commission_pln += (c.amount_grosze ?? 0) / 100;
    months[idx].count += 1;
  }
  const max = Math.max(1, ...months.map((m) => m.commission_pln));
  const hasData = commissions.length > 0 || referrals.length > 0;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-fluid-sm font-semibold uppercase tracking-wider text-dlugomat-600">
            Partner · Wyniki
          </p>
          <h1 className="text-fluid-3xl font-bold tracking-tight text-dlugomat-900 dark:text-white">
            Raporty
          </h1>
          <p className="mt-1 max-w-2xl text-fluid-base text-ink-600 dark:text-ink-300">
            Twoje realne wyniki partnerskie: wypłacone i oczekujące prowizje oraz
            konwersje poleconych użytkowników.
          </p>
        </div>
      </header>

      {!hasData ? (
        <EmptyState
          title="Brak danych do raportu"
          description="Nie zarejestrowano jeszcze żadnych prowizji ani poleceń. Udostępniaj swój link partnerski, aby zbierać wyniki."
        />
      ) : (
        <>
          <section
            aria-label="Najważniejsze KPI"
            className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
          >
            <KpiCard label="Prowizje wypłacone" value={pln(totalEarned)} />
            <KpiCard label="Prowizje oczekujące" value={pln(pendingEarned)} />
            <KpiCard label="Konwersje" value={String(convertedCount)} />
            <KpiCard label="Wskaźnik konwersji" value={`${convRate}%`} />
          </section>

          <Card elevation="subtle">
            <CardHeader>
              <span
                aria-hidden
                className="grid size-9 place-items-center rounded-lg bg-dlugomat-100 text-dlugomat-700 dark:bg-dlugomat-850 dark:text-dlugomat-300"
              >
                <BarChart3 className="size-5" />
              </span>
              <CardTitle className="mt-2 text-fluid-xl">Prowizje miesiąc do miesiąca</CardTitle>
              <CardDescription>Ostatnie 6 miesięcy (kwoty naliczonych prowizji)</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="flex items-end gap-3 sm:gap-4">
                {months.map((m) => {
                  const h = (m.commission_pln / max) * 100;
                  return (
                    <li key={m.key} className="flex flex-1 flex-col items-center gap-2">
                      <span className="text-fluid-xs tabular-nums text-ink-500">
                        {pln(m.commission_pln)}
                      </span>
                      <div
                        aria-hidden
                        className="w-full overflow-hidden rounded-t-md bg-ink-100 dark:bg-dlugomat-900"
                        style={{ height: 200 }}
                      >
                        <div
                          className="ml-auto mr-auto h-full w-full rounded-t-md bg-gradient-to-t from-dlugomat-700 to-dlugomat-500"
                          style={{ height: `${h}%`, marginTop: `${100 - h}%` }}
                        />
                      </div>
                      <span className="text-fluid-xs font-semibold text-ink-700 dark:text-ink-200">
                        {m.label}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>

          <Card elevation="subtle" className="overflow-hidden">
            <CardHeader>
              <CardTitle className="text-fluid-lg">Dane miesięczne</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto p-0">
              <table className="w-full text-fluid-sm">
                <thead className="border-y border-ink-200 bg-ink-50/60 dark:border-dlugomat-800 dark:bg-dlugomat-900/40">
                  <tr className="text-left text-ink-600 dark:text-ink-300">
                    <th className="px-5 py-3 font-semibold">Miesiąc</th>
                    <th className="px-5 py-3 text-right font-semibold">Prowizja</th>
                    <th className="px-5 py-3 text-right font-semibold">Liczba prowizji</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-100 dark:divide-dlugomat-800">
                  {months.map((m) => (
                    <tr key={m.key}>
                      <td className="px-5 py-3 font-semibold">{m.label}</td>
                      <td className="px-5 py-3 text-right tabular-nums">{pln(m.commission_pln)}</td>
                      <td className="px-5 py-3 text-right tabular-nums">{m.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

function KpiCard({ label, value }: { label: string; value: string }) {
  return (
    <Card elevation="subtle">
      <CardContent className="flex flex-col gap-1 p-5">
        <span className="text-fluid-xs font-semibold uppercase tracking-wider text-ink-500">
          {label}
        </span>
        <span className="text-fluid-2xl font-bold tabular-nums text-ink-900 dark:text-ink-50">
          {value}
        </span>
      </CardContent>
    </Card>
  );
}
