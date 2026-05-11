import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Calculator, Info, ShieldCheck } from "lucide-react";
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
  title: "Kalkulator odsetek ustawowych — Dlugomat",
  description:
    "Policz odsetki ustawowe za opoznienie oraz maksymalne. Stawki aktualne na 2026.",
};

const RATES = [
  {
    period: "od 7 maja 2026",
    statutory: "10,75%",
    max: "21,50%",
    business: "12,75%",
    note: "Aktualna stawka",
  },
  {
    period: "5 paz 2023 - 6 maja 2026",
    statutory: "11,25%",
    max: "22,50%",
    business: "13,25%",
    note: "Historyczna",
  },
  {
    period: "8 wrz 2022 - 4 paz 2023",
    statutory: "12,25%",
    max: "24,50%",
    business: "14,25%",
    note: "Historyczna",
  },
];

const SCENARIO = {
  principal: 8400,
  startDate: "2024-11-08",
  endDate: "2026-05-10",
  rate: "10,75%",
  days: 548,
  interest: 1357.42,
};

const fmtPLN = (v: number) =>
  new Intl.NumberFormat("pl-PL", { style: "currency", currency: "PLN" }).format(v);

export default function StatutoryInterestCalculatorPage() {
  return (
    <div className="bg-slate-50">
      <section className="mx-auto max-w-6xl px-6 pt-16 pb-12">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          <div>
            <Badge tone="info">Kalkulator</Badge>
            <h1 className="mt-3 font-display text-4xl text-slate-900 sm:text-5xl">
              Odsetki ustawowe za opóźnienie
            </h1>
            <p className="mt-4 text-lg text-slate-600">
              Policz dokladnie ile odsetek nalicza wierzyciel, sprawdz czy nie
              przekroczyl stawek maksymalnych i pobierz szczegolowe wyliczenie do
              postepowania sadowego.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild variant="primary">
                <Link href="/rejestracja">
                  Otwórz kalkulator
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="/skaner-nakazu">Skanuj nakaz</Link>
              </Button>
            </div>
          </div>

          <Card elevation="pop">
            <CardHeader>
              <CardTitle className="text-base">Przykład wyliczenia</CardTitle>
              <CardDescription>
                Naleznosc {fmtPLN(SCENARIO.principal)} · {SCENARIO.days} dni
              </CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="space-y-3 text-sm">
                <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <dt className="text-slate-500">Kwota glowna</dt>
                  <dd className="font-medium text-slate-900">
                    {fmtPLN(SCENARIO.principal)}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <dt className="text-slate-500">Okres</dt>
                  <dd className="text-slate-700">
                    {SCENARIO.startDate} - {SCENARIO.endDate}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <dt className="text-slate-500">Stawka ustawowa</dt>
                  <dd className="text-slate-700">{SCENARIO.rate}</dd>
                </div>
                <div className="flex items-center justify-between gap-3 pt-2">
                  <dt className="font-medium text-slate-900">
                    Suma odsetek
                  </dt>
                  <dd className="font-display text-2xl text-slate-900">
                    {fmtPLN(SCENARIO.interest)}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <h2 className="font-display text-2xl text-slate-900">
          Stawki odsetek — historia
        </h2>
        <p className="mt-2 text-slate-600">
          Dlugomat automatycznie stosuje wlasciwa stawke dla kazdego okresu.
        </p>

        <Card elevation="subtle" className="mt-6">
          <CardContent className="px-0">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-6 py-3 font-medium">Okres</th>
                  <th className="px-6 py-3 font-medium">Ustawowe</th>
                  <th className="px-6 py-3 font-medium">Maksymalne</th>
                  <th className="px-6 py-3 font-medium">Transakcje B2B</th>
                  <th className="px-6 py-3 font-medium text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {RATES.map((r) => (
                  <tr key={r.period} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-slate-700">{r.period}</td>
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {r.statutory}
                    </td>
                    <td className="px-6 py-4 text-slate-700">{r.max}</td>
                    <td className="px-6 py-4 text-slate-700">{r.business}</td>
                    <td className="px-6 py-4 text-right">
                      <Badge tone={r.note === "Aktualna stawka" ? "success" : "neutral"}>
                        {r.note}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="grid gap-4 sm:grid-cols-3">
          <Card elevation="subtle">
            <CardContent className="py-6">
              <Calculator className="mb-3 h-5 w-5 text-slate-500" />
              <p className="font-medium text-slate-900">Dokladne wyliczenie</p>
              <p className="mt-1 text-sm text-slate-600">
                Algorytm dziennego naliczania zgodny z orzecznictwem SN.
              </p>
            </CardContent>
          </Card>
          <Card elevation="subtle">
            <CardContent className="py-6">
              <ShieldCheck className="mb-3 h-5 w-5 text-slate-500" />
              <p className="font-medium text-slate-900">Limity maksymalne</p>
              <p className="mt-1 text-sm text-slate-600">
                Alert gdy wierzyciel zada wiecej niz 2x stopa referencyjna NBP.
              </p>
            </CardContent>
          </Card>
          <Card elevation="subtle">
            <CardContent className="py-6">
              <Info className="mb-3 h-5 w-5 text-slate-500" />
              <p className="font-medium text-slate-900">Eksport do sadu</p>
              <p className="mt-1 text-sm text-slate-600">
                PDF z rozbiciem dziennym jako zalacznik do pisma procesowego.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
