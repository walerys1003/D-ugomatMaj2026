import type { Metadata } from "next";
import { ArrowDownRight, ArrowUpRight, BarChart3, Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Raporty · Partner · Długomat",
  description:
    "Twoje wyniki partnerskie miesiąc do miesiąca: prowizje, konwersje, retencja.",
};

type Month = {
  label: string;
  commission_pln: number;
  new_clients: number;
  active_clients: number;
  conversion_pct: number;
  churn_pct: number;
};

const MONTHS: Month[] = [
  { label: "Sty 2026", commission_pln: 12_800, new_clients: 4, active_clients: 18, conversion_pct: 22, churn_pct: 0 },
  { label: "Lut 2026", commission_pln: 14_400, new_clients: 5, active_clients: 23, conversion_pct: 25, churn_pct: 4 },
  { label: "Mar 2026", commission_pln: 18_900, new_clients: 7, active_clients: 28, conversion_pct: 28, churn_pct: 2 },
  { label: "Kwi 2026", commission_pln: 21_200, new_clients: 6, active_clients: 33, conversion_pct: 31, churn_pct: 3 },
  { label: "Maj 2026", commission_pln: 24_800, new_clients: 8, active_clients: 38, conversion_pct: 34, churn_pct: 5 },
];

function pln(n: number) {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
    maximumFractionDigits: 0,
  }).format(n);
}

export default function PartnerRaportyPage() {
  const last = MONTHS.at(-1)!;
  const prev = MONTHS.at(-2)!;
  const commissionTrend = ((last.commission_pln - prev.commission_pln) / prev.commission_pln) * 100;
  const max = Math.max(...MONTHS.map((m) => m.commission_pln));

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
            Twoje wyniki w czasie. Dane synchronizowane z systemem
            rozliczeń co 30 minut.
          </p>
        </div>
        <Button variant="secondary">
          <Download className="size-4" />
          Pobierz raport CSV
        </Button>
      </header>

      <section
        aria-label="Najważniejsze KPI"
        className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
      >
        <KpiCard
          label="Prowizja (bieżący mies.)"
          value={pln(last.commission_pln)}
          trend={commissionTrend}
        />
        <KpiCard label="Nowi klienci" value={String(last.new_clients)} trend={(last.new_clients - prev.new_clients) * 10} />
        <KpiCard label="Aktywni klienci" value={String(last.active_clients)} trend={5} />
        <KpiCard label="Konwersja" value={`${last.conversion_pct}%`} trend={last.conversion_pct - prev.conversion_pct} />
      </section>

      <Card elevation="subtle">
        <CardHeader>
          <span
            aria-hidden
            className="grid size-9 place-items-center rounded-lg bg-dlugomat-100 text-dlugomat-700 dark:bg-dlugomat-850 dark:text-dlugomat-300"
          >
            <BarChart3 className="size-5" />
          </span>
          <CardTitle className="mt-2 text-fluid-xl">
            Prowizje miesiąc do miesiąca
          </CardTitle>
          <CardDescription>Wzrost kompozytowy 18% miesięcznie</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="flex items-end gap-3 sm:gap-4">
            {MONTHS.map((m) => {
              const h = (m.commission_pln / max) * 100;
              return (
                <li key={m.label} className="flex flex-1 flex-col items-center gap-2">
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
                <th className="px-5 py-3 text-right font-semibold">Nowi</th>
                <th className="px-5 py-3 text-right font-semibold">Aktywni</th>
                <th className="px-5 py-3 text-right font-semibold">Konwersja</th>
                <th className="px-5 py-3 text-right font-semibold">Churn</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100 dark:divide-dlugomat-800">
              {MONTHS.map((m) => (
                <tr key={m.label}>
                  <td className="px-5 py-3 font-semibold">{m.label}</td>
                  <td className="px-5 py-3 text-right tabular-nums">{pln(m.commission_pln)}</td>
                  <td className="px-5 py-3 text-right tabular-nums">{m.new_clients}</td>
                  <td className="px-5 py-3 text-right tabular-nums">{m.active_clients}</td>
                  <td className="px-5 py-3 text-right tabular-nums">{m.conversion_pct}%</td>
                  <td className="px-5 py-3 text-right tabular-nums">{m.churn_pct}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

function KpiCard({
  label,
  value,
  trend,
}: {
  label: string;
  value: string;
  trend: number;
}) {
  const up = trend >= 0;
  return (
    <Card elevation="subtle">
      <CardContent className="flex flex-col gap-1 p-5">
        <span className="text-fluid-xs font-semibold uppercase tracking-wider text-ink-500">
          {label}
        </span>
        <span className="text-fluid-2xl font-bold tabular-nums text-ink-900 dark:text-ink-50">
          {value}
        </span>
        <span
          className={`flex items-center gap-1 text-fluid-xs font-semibold ${
            up ? "text-accent-700" : "text-danger-600"
          }`}
        >
          {up ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
          {up ? "+" : ""}
          {trend.toFixed(1)}% MoM
        </span>
      </CardContent>
    </Card>
  );
}
