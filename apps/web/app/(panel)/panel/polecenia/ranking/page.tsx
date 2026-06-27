import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Award, TrendingUp } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";
import { listReferralStats } from "@/lib/referrals/referral-actions";

export const metadata: Metadata = {
  title: "Ranking poleceń — Długomat",
  description: "Twoja pozycja i postępy w programie poleceń.",
};

export const dynamic = "force-dynamic";

type Tier = "Brąz" | "Srebro" | "Złoto" | "Platyna";

const TIER_TONE: Record<Tier, "info" | "neutral" | "warning" | "success"> = {
  Brąz: "neutral",
  Srebro: "info",
  Złoto: "warning",
  Platyna: "success",
};

function tierFor(conversions: number): Tier {
  if (conversions >= 20) return "Platyna";
  if (conversions >= 10) return "Złoto";
  if (conversions >= 4) return "Srebro";
  return "Brąz";
}

function fmtPLN(n: number): string {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
    maximumFractionDigits: 0,
  }).format(n);
}

export default async function PoleceniaRankingPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/logowanie?next=/panel/polecenia/ranking");

  const stats = await listReferralStats(user.id);

  const invites = stats.code?.total_signups ?? 0;
  const conversions = stats.recentConversions.filter(
    (c) => c.status === "approved" || c.status === "paid",
  ).length;
  const clicks = stats.code?.total_clicks ?? 0;
  const earnedPln =
    (stats.totals.pending_grosze +
      stats.totals.approved_grosze +
      stats.totals.paid_grosze) /
    100;
  const tier = tierFor(conversions);

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.18em] text-ink-500">
          Polecenia · Twoje postępy
        </p>
        <h1 className="font-display text-fluid-h1 text-dlugomat-950">
          Twoja pozycja w programie
        </h1>
        <p className="max-w-2xl text-ink-600">
          Im więcej skutecznych poleceń, tym wyższy tier i większe prowizje.
          Dane poniżej dotyczą wyłącznie Twojego konta.
        </p>
      </header>

      <nav aria-label="Widoki poleceń" className="flex gap-1 rounded-md border border-ink-200 bg-ink-50 p-1 w-fit text-sm">
        <Link
          href="/panel/polecenia"
          className="rounded px-3 py-1.5 text-ink-700 hover:bg-white focus-visible:outline-none focus-visible:shadow-shield-focus"
        >
          Moje polecenia
        </Link>
        <span className="rounded bg-white px-3 py-1.5 font-semibold text-dlugomat-900 shadow-sm">
          Postępy
        </span>
      </nav>

      <Card urgency="success">
        <CardContent className="flex flex-wrap items-center gap-4 p-5">
          <Award className="h-8 w-8 text-accent-700" aria-hidden />
          <div className="flex-1 min-w-[180px]">
            <p className="text-xs uppercase tracking-wide text-ink-500">Twój tier</p>
            <p className="font-display text-fluid-h3 text-dlugomat-950">
              <Badge tone={TIER_TONE[tier]}>{tier}</Badge>
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-wide text-ink-500">Zarobione łącznie</p>
            <p className="font-display text-2xl text-accent-700">{fmtPLN(earnedPln)}</p>
          </div>
        </CardContent>
      </Card>

      <section className="grid gap-4 sm:grid-cols-3" aria-label="Statystyki">
        <Card elevation="subtle">
          <CardHeader>
            <CardDescription>Kliknięcia</CardDescription>
            <CardTitle className="font-display text-fluid-h4 text-dlugomat-950">{clicks}</CardTitle>
          </CardHeader>
        </Card>
        <Card elevation="subtle">
          <CardHeader>
            <CardDescription>Rejestracje</CardDescription>
            <CardTitle className="font-display text-fluid-h4 text-dlugomat-950">{invites}</CardTitle>
          </CardHeader>
        </Card>
        <Card elevation="subtle">
          <CardHeader>
            <CardDescription>
              <TrendingUp className="mr-1 inline h-3 w-3 text-accent-600" aria-hidden />
              Konwersje
            </CardDescription>
            <CardTitle className="font-display text-fluid-h4 text-dlugomat-950">{conversions}</CardTitle>
          </CardHeader>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Progi tierów</CardTitle>
          <CardDescription>Liczona jest liczba skutecznych konwersji</CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-ink-200 text-sm">
              <thead className="bg-ink-50 text-xs uppercase tracking-wide text-ink-600">
                <tr>
                  <th className="px-4 py-2 text-left">Tier</th>
                  <th className="px-4 py-2 text-right">Wymagane konwersje</th>
                  <th className="px-4 py-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100 bg-white">
                {([
                  ["Brąz", 0],
                  ["Srebro", 4],
                  ["Złoto", 10],
                  ["Platyna", 20],
                ] as Array<[Tier, number]>).map(([t, need]) => (
                  <tr key={t} className={t === tier ? "bg-accent-50/60" : ""}>
                    <td className="px-4 py-2">
                      <Badge tone={TIER_TONE[t]}>{t}</Badge>
                    </td>
                    <td className="px-4 py-2 text-right text-dlugomat-900">{need}+</td>
                    <td className="px-4 py-2">
                      {conversions >= need ? (
                        <Badge tone="success" withDot>Osiągnięty</Badge>
                      ) : (
                        <span className="text-ink-500">Brakuje {need - conversions}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
