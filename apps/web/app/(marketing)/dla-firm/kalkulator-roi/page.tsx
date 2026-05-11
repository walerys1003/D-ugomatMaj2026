import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Calculator, TrendingUp } from "lucide-react";
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
  title: "Kalkulator ROI dla firm — Dlugomat",
  description:
    "Policz, ile Twoja firma zaoszczedzi na windykacji z Dlugomat. Trzy scenariusze: maly biznes, srednia firma, duza organizacja.",
  alternates: { canonical: "/dla-firm/kalkulator-roi" },
};

interface ROIScenario {
  size: string;
  cases_per_month: number;
  hours_saved_per_case: number;
  hourly_rate: number;
  plan_cost_monthly: number;
  plan_name: string;
}

const SCENARIOS: readonly ROIScenario[] = [
  {
    size: "Mala firma",
    cases_per_month: 30,
    hours_saved_per_case: 2,
    hourly_rate: 75,
    plan_cost_monthly: 390,
    plan_name: "Pro",
  },
  {
    size: "Srednia firma",
    cases_per_month: 200,
    hours_saved_per_case: 2.5,
    hourly_rate: 85,
    plan_cost_monthly: 1290,
    plan_name: "Kancelaria",
  },
  {
    size: "Duza organizacja",
    cases_per_month: 1500,
    hours_saved_per_case: 3,
    hourly_rate: 110,
    plan_cost_monthly: 8900,
    plan_name: "Enterprise",
  },
];

const fmtPLN = new Intl.NumberFormat("pl-PL", {
  style: "currency",
  currency: "PLN",
  maximumFractionDigits: 0,
});

const fmtNum = new Intl.NumberFormat("pl-PL");

function calculate(s: ROIScenario) {
  const monthlySavings = s.cases_per_month * s.hours_saved_per_case * s.hourly_rate;
  const netMonthly = monthlySavings - s.plan_cost_monthly;
  const roi = monthlySavings / s.plan_cost_monthly;
  const annualNet = netMonthly * 12;
  return { monthlySavings, netMonthly, roi, annualNet };
}

const ASSUMPTIONS = [
  "Sredni czas pracy nad jedna sprawa windykacyjna w Excelu: 3-4 h.",
  "Sredni czas pracy w Dlugomat: 30-60 minut (workflow + automaty).",
  "Stawki godzinowe: junior 75 zl, mid 85 zl, senior 110 zl (rynek 2025).",
  "Nie liczymy oszczednosci z lepszego wskaznika odzysku (+15-25%).",
  "Nie liczymy redukcji ryzyka prawnego (pominiete terminy, przedawnienia).",
];

export default function ROICalculatorPage() {
  return (
    <div className="bg-background">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <Badge tone="neutral" withDot className="mb-4">
            <Calculator className="mr-1 h-3 w-3" />
            Kalkulator ROI
          </Badge>
          <h1 className="font-display text-4xl tracking-tight text-slate-900 sm:text-5xl">
            Ile Twoja firma zaoszczedzi w pierwszym roku?
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-600">
            Trzy modelowe scenariusze. Konserwatywne zalozenia. Bez magicznej matematyki.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-4 lg:grid-cols-3">
          {SCENARIOS.map((s, idx) => {
            const r = calculate(s);
            const highlight = idx === 1;
            return (
              <Card
                key={s.size}
                elevation={highlight ? "pop" : "subtle"}
                urgency={highlight ? "success" : "none"}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{s.size}</CardTitle>
                    {highlight && (
                      <Badge tone="success" withDot>
                        Najczestszy
                      </Badge>
                    )}
                  </div>
                  <CardDescription>Plan {s.plan_name}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-md border border-slate-200 bg-slate-50/50 p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Wejscia</p>
                    <dl className="mt-2 space-y-1 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-slate-600">Spraw miesiecznie</dt>
                        <dd className="font-mono text-slate-900">{fmtNum.format(s.cases_per_month)}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-slate-600">Godzin oszczedzonych / sprawa</dt>
                        <dd className="font-mono text-slate-900">{s.hours_saved_per_case} h</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-slate-600">Stawka godzinowa</dt>
                        <dd className="font-mono text-slate-900">{fmtPLN.format(s.hourly_rate)}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-slate-600">Koszt planu / m-c</dt>
                        <dd className="font-mono text-slate-900">{fmtPLN.format(s.plan_cost_monthly)}</dd>
                      </div>
                    </dl>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">Oszczednosc brutto</p>
                    <p className="mt-1 font-display text-2xl text-slate-900">
                      {fmtPLN.format(r.monthlySavings)}
                    </p>
                    <p className="text-xs text-slate-500">miesiecznie</p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">Zysk netto / rok</p>
                    <p className="mt-1 font-display text-3xl text-emerald-700">
                      {fmtPLN.format(r.annualNet)}
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-200 pt-3">
                    <span className="text-sm text-slate-600">ROI</span>
                    <span className="flex items-center gap-1 font-display text-lg text-slate-900">
                      <TrendingUp className="h-4 w-4 text-emerald-600" aria-hidden />
                      {r.roi.toFixed(1)}x
                    </span>
                  </div>

                  <Button asChild variant={highlight ? "primary" : "secondary"} block>
                    <Link href={`/rejestracja?plan=${s.plan_name.toLowerCase()}`}>
                      Wybieram {s.plan_name}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <Card elevation="flat">
          <CardHeader>
            <CardTitle className="text-base">Zalozenia kalkulacji</CardTitle>
            <CardDescription>Co bierzemy pod uwage, a czego nie.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-slate-700">
              {ASSUMPTIONS.map((a) => (
                <li key={a} className="flex gap-3">
                  <span className="mt-1 h-1.5 w-1.5 flex-none rounded-full bg-slate-400" aria-hidden />
                  <span>{a}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center">
          <h2 className="font-display text-2xl text-slate-900">Policzymy dla Twojej firmy</h2>
          <p className="mt-2 text-slate-600">
            Daj nam 20 minut i pelne ROI w arkuszu zwrocimy w tym samym dniu.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button asChild variant="primary">
              <Link href="/kontakt?temat=roi">
                Zamow wycene ROI
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/cennik/porownanie">Porownaj plany</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
