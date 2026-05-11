import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Calculator, Save, TrendingDown } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Symulator planu spłaty — Długomat",
  description: "Zaplanuj harmonogram spłaty zadłużenia z możliwymi scenariuszami.",
};

interface PageProps {
  searchParams?: Promise<{
    amount?: string;
    months?: string;
    rate?: string;
  }>;
}

interface ScheduleRow {
  month: number;
  date: string;
  installment: number;
  principal: number;
  interest: number;
  remaining: number;
}

function buildSchedule(amount: number, months: number, annualRate: number): ScheduleRow[] {
  const monthlyRate = annualRate / 100 / 12;
  const installment =
    monthlyRate > 0
      ? (amount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months))
      : amount / months;

  const rows: ScheduleRow[] = [];
  let remaining = amount;
  const start = new Date("2026-06-01");

  for (let i = 1; i <= months; i++) {
    const interest = remaining * monthlyRate;
    const principal = installment - interest;
    remaining = Math.max(0, remaining - principal);
    const date = new Date(start);
    date.setMonth(date.getMonth() + (i - 1));
    rows.push({
      month: i,
      date: date.toISOString().slice(0, 10),
      installment,
      principal,
      interest,
      remaining,
    });
  }
  return rows;
}

function fmtPLN(n: number): string {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
    maximumFractionDigits: 2,
  }).format(n);
}

const SCENARIOS = [
  { months: 12, rate: 5.5, label: "Szybka spłata (12 mies.)" },
  { months: 24, rate: 5.5, label: "Standard (24 mies.)" },
  { months: 36, rate: 5.5, label: "Komfortowa (36 mies.)" },
  { months: 48, rate: 5.5, label: "Wydłużona (48 mies.)" },
] as const;

export default async function SymulatorPage({ searchParams }: PageProps) {
  const sp = (await searchParams) ?? {};
  const amount = Number(sp.amount ?? 24000);
  const months = Number(sp.months ?? 24);
  const rate = Number(sp.rate ?? 5.5);

  const schedule = buildSchedule(amount, months, rate);
  const totalPaid = schedule.reduce((s, r) => s + r.installment, 0);
  const totalInterest = schedule.reduce((s, r) => s + r.interest, 0);
  const installment = schedule[0]?.installment ?? 0;

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/panel/plan-splaty"
          className="inline-flex items-center gap-2 text-sm text-iron-600 hover:text-dlugomat-900 focus-visible:outline-none focus-visible:shadow-shield-focus rounded"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Wróć do planu spłaty
        </Link>
      </div>

      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.18em] text-iron-500">
          Plan spłaty · symulator
        </p>
        <h1 className="font-display text-fluid-h1 text-dlugomat-950">
          Zaplanuj harmonogram
        </h1>
        <p className="max-w-2xl text-iron-600">
          Wprowadź kwotę zadłużenia, liczbę rat i stopę procentową, aby zobaczyć
          szczegółowy harmonogram. Wyniki mają charakter informacyjny — finalne
          warunki ustalisz z wierzycielem.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>
            <Calculator className="mr-2 inline h-4 w-4" aria-hidden />
            Parametry
          </CardTitle>
          <CardDescription>Zmień wartości, aby przeliczyć harmonogram</CardDescription>
        </CardHeader>
        <CardContent>
          <form method="get" className="grid gap-4 sm:grid-cols-3">
            <label className="block">
              <span className="block text-xs uppercase tracking-wide text-iron-500">
                Kwota zadłużenia (PLN)
              </span>
              <input
                type="number"
                name="amount"
                defaultValue={amount}
                min={500}
                step={100}
                className="mt-1 w-full rounded-md border border-iron-300 bg-white px-3 py-2 text-sm focus:border-dlugomat-700 focus-visible:outline-none focus-visible:shadow-shield-focus"
              />
            </label>
            <label className="block">
              <span className="block text-xs uppercase tracking-wide text-iron-500">
                Liczba rat (miesięcy)
              </span>
              <input
                type="number"
                name="months"
                defaultValue={months}
                min={3}
                max={120}
                className="mt-1 w-full rounded-md border border-iron-300 bg-white px-3 py-2 text-sm focus:border-dlugomat-700 focus-visible:outline-none focus-visible:shadow-shield-focus"
              />
            </label>
            <label className="block">
              <span className="block text-xs uppercase tracking-wide text-iron-500">
                Stopa roczna (%)
              </span>
              <input
                type="number"
                name="rate"
                defaultValue={rate}
                min={0}
                max={25}
                step={0.1}
                className="mt-1 w-full rounded-md border border-iron-300 bg-white px-3 py-2 text-sm focus:border-dlugomat-700 focus-visible:outline-none focus-visible:shadow-shield-focus"
              />
            </label>
            <div className="sm:col-span-3 flex justify-end">
              <Button type="submit">Przelicz</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <section className="grid gap-4 sm:grid-cols-3" aria-label="Podsumowanie">
        <Card urgency="normal">
          <CardHeader>
            <CardDescription>Rata miesięczna</CardDescription>
            <CardTitle className="font-display text-fluid-h2 text-dlugomat-950">
              {fmtPLN(installment)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Razem do zapłaty</CardDescription>
            <CardTitle className="font-display text-fluid-h2 text-dlugomat-950">
              {fmtPLN(totalPaid)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Suma odsetek</CardDescription>
            <CardTitle className="font-display text-fluid-h2 text-warn">
              {fmtPLN(totalInterest)}
            </CardTitle>
          </CardHeader>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Scenariusze porównawcze</CardTitle>
          <CardDescription>
            Kliknij dowolny scenariusz, aby przeliczyć dla tej samej kwoty
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {SCENARIOS.map((sc) => {
              const schedule = buildSchedule(amount, sc.months, sc.rate);
              const inst = schedule[0]?.installment ?? 0;
              const totalInt = schedule.reduce((s, r) => s + r.interest, 0);
              const isCurrent = sc.months === months;
              return (
                <li key={sc.months}>
                  <Link
                    href={`/panel/plan-splaty/symulator?amount=${amount}&months=${sc.months}&rate=${sc.rate}`}
                    className={`block rounded-lg border p-4 transition focus-visible:outline-none focus-visible:shadow-shield-focus ${
                      isCurrent
                        ? "border-dlugomat-700 bg-dlugomat-50"
                        : "border-iron-200 bg-white hover:bg-iron-50"
                    }`}
                  >
                    <p className="text-xs font-medium text-iron-600">{sc.label}</p>
                    <p className="mt-2 font-display text-lg text-dlugomat-950">
                      {fmtPLN(inst)}/mies.
                    </p>
                    <p className="mt-1 text-xs text-iron-500">
                      <TrendingDown className="mr-0.5 inline h-3 w-3" aria-hidden />
                      odsetki: {fmtPLN(totalInt)}
                    </p>
                    {isCurrent ? (
                      <Badge tone="info" withDot className="mt-2">aktywny</Badge>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Harmonogram szczegółowy</CardTitle>
          <CardDescription>
            {months} rat · pierwsza płatność: {schedule[0]?.date}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-iron-200 text-sm">
              <thead className="bg-iron-50 text-xs uppercase tracking-wide text-iron-600">
                <tr>
                  <th className="px-4 py-2 text-left">#</th>
                  <th className="px-4 py-2 text-left">Data</th>
                  <th className="px-4 py-2 text-right">Rata</th>
                  <th className="px-4 py-2 text-right">Kapitał</th>
                  <th className="px-4 py-2 text-right">Odsetki</th>
                  <th className="px-4 py-2 text-right">Pozostało</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-iron-100 bg-white">
                {schedule.slice(0, 12).map((r) => (
                  <tr key={r.month}>
                    <td className="px-4 py-2 font-mono text-xs text-iron-500">{r.month}</td>
                    <td className="px-4 py-2 text-iron-700">{r.date}</td>
                    <td className="px-4 py-2 text-right font-semibold text-dlugomat-900">
                      {fmtPLN(r.installment)}
                    </td>
                    <td className="px-4 py-2 text-right text-iron-700">
                      {fmtPLN(r.principal)}
                    </td>
                    <td className="px-4 py-2 text-right text-warn">
                      {fmtPLN(r.interest)}
                    </td>
                    <td className="px-4 py-2 text-right text-iron-700">
                      {fmtPLN(r.remaining)}
                    </td>
                  </tr>
                ))}
                {schedule.length > 12 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-3 text-center text-xs text-iron-500">
                      …pozostałe {schedule.length - 12} rat ukryte. Pobierz pełny harmonogram poniżej.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3 justify-end">
        <Button variant="ghost">Pobierz CSV</Button>
        <Button variant="success">
          <Save className="mr-2 h-4 w-4" aria-hidden />
          Zapisz jako mój plan spłaty
        </Button>
      </div>
    </div>
  );
}
