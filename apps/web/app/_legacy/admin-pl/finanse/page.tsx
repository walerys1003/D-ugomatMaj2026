import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Wallet, TrendingUp, TrendingDown, AlertTriangle, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Finanse organizacji — admin",
  robots: { index: false, follow: false },
};

const fmtPLN = new Intl.NumberFormat("pl-PL", {
  style: "currency",
  currency: "PLN",
  maximumFractionDigits: 0,
});

interface MRRPoint {
  month: string;
  mrr: number;
  new_mrr: number;
  churn_mrr: number;
}

const MRR_TREND: ReadonlyArray<MRRPoint> = [
  { month: "Lis 2025", mrr: 142000, new_mrr: 18000, churn_mrr: 4500 },
  { month: "Gru 2025", mrr: 158000, new_mrr: 22000, churn_mrr: 6000 },
  { month: "Sty 2026", mrr: 171000, new_mrr: 19500, churn_mrr: 6500 },
  { month: "Lut 2026", mrr: 184000, new_mrr: 19000, churn_mrr: 6000 },
  { month: "Mar 2026", mrr: 198000, new_mrr: 21000, churn_mrr: 7000 },
  { month: "Kwi 2026", mrr: 214000, new_mrr: 23000, churn_mrr: 7000 },
  { month: "Maj 2026", mrr: 228500, new_mrr: 22500, churn_mrr: 8000 },
];

interface OverduePayer {
  id: string;
  company: string;
  plan: string;
  amount: number;
  days_overdue: number;
  attempts: number;
}

const OVERDUE: ReadonlyArray<OverduePayer> = [
  { id: "o1", company: "Kancelaria Malinowski i Wspolnicy", plan: "Kancelaria", amount: 1290, days_overdue: 4, attempts: 2 },
  { id: "o2", company: "Windyk-Pro Sp. z o.o.", plan: "Enterprise", amount: 8900, days_overdue: 12, attempts: 4 },
  { id: "o3", company: "Bank Spoldzielczy Rzeszow", plan: "Enterprise", amount: 12500, days_overdue: 2, attempts: 1 },
  { id: "o4", company: "Fundacja Konsumencka Pro Bono", plan: "Pro", amount: 390, days_overdue: 18, attempts: 5 },
];

const current = MRR_TREND[MRR_TREND.length - 1];
const previous = MRR_TREND[MRR_TREND.length - 2];
const mrrGrowth = ((current.mrr - previous.mrr) / previous.mrr) * 100;
const totalOverdue = OVERDUE.reduce((s, o) => s + o.amount, 0);
const maxMrr = Math.max(...MRR_TREND.map((p) => p.mrr));

export default function FinanseAdminPage() {
  return (
    <div className="space-y-6">
      <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-iron-600 hover:text-dlugomat-900">
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Powrot do panelu admin
      </Link>

      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-iron-500">Admin · Finanse</p>
          <h1 className="font-display text-fluid-h1 text-dlugomat-950 flex items-center gap-3">
            <Wallet className="h-7 w-7 text-dlugomat-700" aria-hidden />
            Finanse organizacji
          </h1>
          <p className="mt-1 text-sm text-iron-600">
            MRR, ARR, koszt pozyskania klienta, naleznosci przeterminowane.
          </p>
        </div>
        <Button variant="secondary">
          <Download className="mr-2 h-4 w-4" aria-hidden />
          Eksport finansowy (CSV)
        </Button>
      </header>

      <section className="grid gap-4 lg:grid-cols-4" aria-label="KPI finansowe organizacji">
        <Card urgency="success">
          <CardHeader>
            <CardDescription>MRR</CardDescription>
            <CardTitle className="font-display text-fluid-h3 text-accent-700">{fmtPLN.format(current.mrr)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-iron-500 flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-accent-700" aria-hidden />
              +{mrrGrowth.toFixed(1)}% mom
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>ARR (annualized)</CardDescription>
            <CardTitle className="font-display text-fluid-h3 text-dlugomat-950">{fmtPLN.format(current.mrr * 12)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Net new MRR (maj)</CardDescription>
            <CardTitle className="font-display text-fluid-h3 text-dlugomat-950">
              {fmtPLN.format(current.new_mrr - current.churn_mrr)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-iron-500">
              +{fmtPLN.format(current.new_mrr)} / −{fmtPLN.format(current.churn_mrr)}
            </p>
          </CardContent>
        </Card>
        <Card urgency={totalOverdue > 0 ? "warning" : "none"}>
          <CardHeader>
            <CardDescription>Przeterminowane</CardDescription>
            <CardTitle className="font-display text-fluid-h3 text-warn">{fmtPLN.format(totalOverdue)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-iron-500">{OVERDUE.length} klientow</p>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-dlugomat-700" aria-hidden />
            Trend MRR (7 miesiecy)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-48 items-end gap-2">
            {MRR_TREND.map((p) => {
              const h = (p.mrr / maxMrr) * 100;
              return (
                <div key={p.month} className="flex flex-1 flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t bg-dlugomat-700"
                    style={{ height: `${h}%` }}
                    aria-label={`${p.month}: ${fmtPLN.format(p.mrr)}`}
                  />
                  <span className="text-[10px] text-iron-500">{p.month.slice(0, 3)}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warn" aria-hidden />
            Naleznosci przeterminowane
          </CardTitle>
          <CardDescription>Klienci z nieoplaconymi fakturami</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="border-b border-iron-100 bg-iron-50/50 text-xs uppercase tracking-wide text-iron-600">
              <tr>
                <th className="px-5 py-2 text-left font-medium">Klient</th>
                <th className="px-5 py-2 text-left font-medium">Plan</th>
                <th className="px-5 py-2 text-right font-medium">Kwota</th>
                <th className="px-5 py-2 text-right font-medium">Dni po terminie</th>
                <th className="px-5 py-2 text-right font-medium">Proby</th>
                <th className="px-5 py-2 text-right font-medium">Akcja</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-iron-100">
              {OVERDUE.map((o) => (
                <tr key={o.id}>
                  <td className="px-5 py-3 text-dlugomat-900">{o.company}</td>
                  <td className="px-5 py-3">
                    <Badge tone="neutral">{o.plan}</Badge>
                  </td>
                  <td className="px-5 py-3 text-right font-mono text-dlugomat-900">{fmtPLN.format(o.amount)}</td>
                  <td className="px-5 py-3 text-right">
                    <Badge tone={o.days_overdue > 7 ? "danger" : "warning"}>
                      {o.days_overdue} dni
                    </Badge>
                  </td>
                  <td className="px-5 py-3 text-right text-xs text-iron-600">{o.attempts}</td>
                  <td className="px-5 py-3 text-right">
                    <Button variant="secondary" size="sm">Wyslij przypomnienie</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
