import type { Metadata } from "next";
import Link from "next/link";
import { Award, Crown, Medal, TrendingUp, Trophy } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Ranking poleceń — Długomat",
  description: "Najlepsi ambasadorzy programu poleceń — ranking miesięczny.",
};

interface RankEntry {
  rank: number;
  alias: string;
  region: string;
  invites: number;
  conversions: number;
  earned_pln: number;
  tier: "Brąz" | "Srebro" | "Złoto" | "Platyna";
  is_you?: boolean;
}

const RANKING: RankEntry[] = [
  { rank: 1, alias: "MK_Warszawa", region: "Mazowieckie", invites: 47, conversions: 28, earned_pln: 4200, tier: "Platyna" },
  { rank: 2, alias: "TomaszP", region: "Małopolskie", invites: 38, conversions: 22, earned_pln: 3300, tier: "Platyna" },
  { rank: 3, alias: "AnnaK_Gdańsk", region: "Pomorskie", invites: 31, conversions: 19, earned_pln: 2850, tier: "Złoto" },
  { rank: 4, alias: "PiotrW", region: "Śląskie", invites: 26, conversions: 16, earned_pln: 2400, tier: "Złoto" },
  { rank: 5, alias: "Ty (anna.kowalska)", region: "Mazowieckie", invites: 22, conversions: 13, earned_pln: 1950, tier: "Złoto", is_you: true },
  { rank: 6, alias: "MarekL", region: "Wielkopolskie", invites: 19, conversions: 11, earned_pln: 1650, tier: "Srebro" },
  { rank: 7, alias: "EwaS", region: "Dolnośląskie", invites: 17, conversions: 9, earned_pln: 1350, tier: "Srebro" },
  { rank: 8, alias: "KasiaN", region: "Łódzkie", invites: 14, conversions: 8, earned_pln: 1200, tier: "Srebro" },
  { rank: 9, alias: "AdamR", region: "Lubelskie", invites: 12, conversions: 6, earned_pln: 900, tier: "Brąz" },
  { rank: 10, alias: "BartekO", region: "Zachodniopomorskie", invites: 10, conversions: 5, earned_pln: 750, tier: "Brąz" },
];

const TIER_TONE: Record<RankEntry["tier"], "info" | "neutral" | "warning" | "success"> = {
  Brąz: "neutral",
  Srebro: "info",
  Złoto: "warning",
  Platyna: "success",
};

function fmtPLN(n: number): string {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
    maximumFractionDigits: 0,
  }).format(n);
}

function RankIcon({ rank }: { rank: number }) {
  if (rank === 1) return <Crown className="h-5 w-5 text-warn" aria-hidden />;
  if (rank === 2) return <Trophy className="h-5 w-5 text-ink-400" aria-hidden />;
  if (rank === 3) return <Medal className="h-5 w-5 text-ink-500" aria-hidden />;
  return null;
}

export default function PoleceniaRankingPage() {
  const you = RANKING.find((r) => r.is_you);

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.18em] text-ink-500">
          Polecenia · ranking miesięczny
        </p>
        <h1 className="font-display text-fluid-h1 text-dlugomat-950">
          Top 10 ambasadorów · maj 2026
        </h1>
        <p className="max-w-2xl text-ink-600">
          Ranking obejmuje wszystkich uczestników programu poleceń. Aliasy chronią
          tożsamość — Twoje dane widoczne są tylko dla Ciebie.
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
          Ranking
        </span>
      </nav>

      {you ? (
        <Card urgency="success">
          <CardContent className="flex flex-wrap items-center gap-4 p-5">
            <Award className="h-8 w-8 text-accent-700" aria-hidden />
            <div className="flex-1 min-w-[180px]">
              <p className="text-xs uppercase tracking-wide text-ink-500">Twoje miejsce</p>
              <p className="font-display text-fluid-h3 text-dlugomat-950">
                #{you.rank} · {you.alias}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-wide text-ink-500">Zarobione</p>
              <p className="font-display text-2xl text-accent-700">{fmtPLN(you.earned_pln)}</p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-3" aria-label="Top 3 podium">
        {RANKING.slice(0, 3).map((r) => (
          <Card
            key={r.rank}
            urgency={r.rank === 1 ? "success" : r.rank === 2 ? "normal" : "normal"}
            elevation={r.rank === 1 ? "pop" : "subtle"}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardDescription>
                  <RankIcon rank={r.rank} />
                  <span className="ml-1">Miejsce #{r.rank}</span>
                </CardDescription>
                <Badge tone={TIER_TONE[r.tier]}>{r.tier}</Badge>
              </div>
              <CardTitle className="font-display text-fluid-h4 text-dlugomat-950">
                {r.alias}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-ink-600">Polecenia</span>
                <span className="font-semibold text-dlugomat-900">{r.invites}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ink-600">Konwersje</span>
                <span className="font-semibold text-dlugomat-900">{r.conversions}</span>
              </div>
              <div className="flex items-center justify-between border-t border-ink-100 pt-2">
                <span className="text-ink-600">Zarobione</span>
                <span className="font-display text-lg text-accent-700">
                  {fmtPLN(r.earned_pln)}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Pełny ranking</CardTitle>
          <CardDescription>Aktualizowany codziennie o 06:00 CET</CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-ink-200 text-sm">
              <thead className="bg-ink-50 text-xs uppercase tracking-wide text-ink-600">
                <tr>
                  <th className="px-4 py-2 text-left w-12">#</th>
                  <th className="px-4 py-2 text-left">Alias</th>
                  <th className="px-4 py-2 text-left">Region</th>
                  <th className="px-4 py-2 text-right">Polecenia</th>
                  <th className="px-4 py-2 text-right">Konwersje</th>
                  <th className="px-4 py-2 text-right">Zarobione</th>
                  <th className="px-4 py-2 text-left">Tier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100 bg-white">
                {RANKING.map((r) => (
                  <tr
                    key={r.rank}
                    className={r.is_you ? "bg-accent-50/60" : ""}
                  >
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-1">
                        <span className="font-semibold text-dlugomat-900">#{r.rank}</span>
                        <RankIcon rank={r.rank} />
                      </div>
                    </td>
                    <td className="px-4 py-2 font-medium text-dlugomat-900">
                      {r.alias}
                      {r.is_you ? <Badge tone="success" withDot className="ml-2">to Ty</Badge> : null}
                    </td>
                    <td className="px-4 py-2 text-ink-600">{r.region}</td>
                    <td className="px-4 py-2 text-right text-dlugomat-900">{r.invites}</td>
                    <td className="px-4 py-2 text-right text-dlugomat-900">
                      <TrendingUp className="mr-1 inline h-3 w-3 text-accent-600" aria-hidden />
                      {r.conversions}
                    </td>
                    <td className="px-4 py-2 text-right font-semibold text-accent-700">
                      {fmtPLN(r.earned_pln)}
                    </td>
                    <td className="px-4 py-2">
                      <Badge tone={TIER_TONE[r.tier]}>{r.tier}</Badge>
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
