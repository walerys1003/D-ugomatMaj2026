import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowDownRight, ArrowUpRight, CreditCard, Download, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Raport platnosci",
  robots: { index: false, follow: false },
};

const fmtPLN = new Intl.NumberFormat("pl-PL", {
  style: "currency",
  currency: "PLN",
  maximumFractionDigits: 0,
});

interface MonthlyMetric {
  month: string;
  gross: number;
  net: number;
  refunds: number;
  tx_count: number;
}

const MONTHLY: ReadonlyArray<MonthlyMetric> = [
  { month: "Sty 2026", gross: 184200, net: 149837, refunds: 4220, tx_count: 1240 },
  { month: "Lut 2026", gross: 198100, net: 161057, refunds: 3890, tx_count: 1308 },
  { month: "Mar 2026", gross: 224780, net: 182748, refunds: 5120, tx_count: 1487 },
  { month: "Kwi 2026", gross: 241300, net: 196179, refunds: 4680, tx_count: 1592 },
  { month: "Maj 2026", gross: 87420, net: 71082, refunds: 1840, tx_count: 612 },
];

interface ProviderStat {
  provider: string;
  share_pct: number;
  success_rate: number;
  avg_fee_pct: number;
}

const PROVIDERS: ReadonlyArray<ProviderStat> = [
  { provider: "Stripe (karta)", share_pct: 58.4, success_rate: 97.8, avg_fee_pct: 1.5 },
  { provider: "Przelewy24", share_pct: 24.1, success_rate: 96.2, avg_fee_pct: 1.2 },
  { provider: "BLIK", share_pct: 14.8, success_rate: 98.4, avg_fee_pct: 0.8 },
  { provider: "Przelew tradycyjny", share_pct: 2.7, success_rate: 89.1, avg_fee_pct: 0 },
];

interface DisputeRow {
  id: string;
  user: string;
  amount: number;
  reason: string;
  status: "otwarty" | "wygrany" | "przegrany";
  opened_at: string;
}

const DISPUTES: ReadonlyArray<DisputeRow> = [
  { id: "DSP-2026-118", user: "user_94821@dlugomat.pl", amount: 199, reason: "Karta zgubiona — chargeback", status: "otwarty", opened_at: "2026-05-09" },
  { id: "DSP-2026-117", user: "k.kowal@example.com", amount: 79, reason: "Brak otrzymania produktu", status: "wygrany", opened_at: "2026-05-04" },
  { id: "DSP-2026-116", user: "anna.nowak@example.pl", amount: 249, reason: "Podwojne obciazenie", status: "wygrany", opened_at: "2026-04-28" },
  { id: "DSP-2026-115", user: "user_77104@dlugomat.pl", amount: 99, reason: "Nieautoryzowana transakcja", status: "przegrany", opened_at: "2026-04-20" },
];

const STATUS_TONE: Record<DisputeRow["status"], "warning" | "success" | "danger"> = {
  otwarty: "warning",
  wygrany: "success",
  przegrany: "danger",
};

export default function PlatnosciRaportPage() {
  const totalNet = MONTHLY.reduce((s, m) => s + m.net, 0);
  const totalGross = MONTHLY.reduce((s, m) => s + m.gross, 0);
  const totalRefunds = MONTHLY.reduce((s, m) => s + m.refunds, 0);
  const totalTx = MONTHLY.reduce((s, m) => s + m.tx_count, 0);
  const maxGross = Math.max(...MONTHLY.map((m) => m.gross));

  return (
    <div className="space-y-6">
      <Link href="/admin/platnosci" className="inline-flex items-center gap-2 text-sm text-iron-600 hover:text-dlugomat-900">
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Powrot do platnosci
      </Link>

      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-iron-500">Admin / Platnosci</p>
          <h1 className="font-display text-fluid-h1 text-dlugomat-950 flex items-center gap-3">
            <CreditCard className="h-7 w-7 text-dlugomat-700" aria-hidden />
            Raport platnosci YTD
          </h1>
          <p className="mt-1 text-sm text-iron-600">Styczen — Maj 2026 (do dzis).</p>
        </div>
        <Button variant="secondary">
          <Download className="mr-2 h-4 w-4" aria-hidden />
          Eksport PDF
        </Button>
      </header>

      <section className="grid gap-4 lg:grid-cols-4">
        <Card urgency="success">
          <CardHeader>
            <CardDescription>Przychod netto YTD</CardDescription>
            <CardTitle className="font-display text-fluid-h3 text-accent-700">{fmtPLN.format(totalNet)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-iron-500 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" aria-hidden />
              +18% r/r
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Wplywy brutto</CardDescription>
            <CardTitle className="font-display text-fluid-h3 text-dlugomat-950">{fmtPLN.format(totalGross)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-iron-500 flex items-center gap-1">
              <ArrowUpRight className="h-3 w-3" aria-hidden />
              {totalTx.toLocaleString("pl-PL")} transakcji
            </p>
          </CardContent>
        </Card>
        <Card urgency="warning">
          <CardHeader>
            <CardDescription>Zwroty</CardDescription>
            <CardTitle className="font-display text-fluid-h3 text-warn">{fmtPLN.format(totalRefunds)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-iron-500 flex items-center gap-1">
              <ArrowDownRight className="h-3 w-3" aria-hidden />
              {((totalRefunds / totalGross) * 100).toFixed(2)}% wplywow
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Avg ticket</CardDescription>
            <CardTitle className="font-display text-fluid-h3 text-dlugomat-950">
              {fmtPLN.format(Math.round(totalGross / totalTx))}
            </CardTitle>
          </CardHeader>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Przychod miesieczny brutto</CardTitle>
          <CardDescription>Slupki w skali do najwyzszego miesiaca w okresie.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {MONTHLY.map((m) => {
              const pct = (m.gross / maxGross) * 100;
              return (
                <div key={m.month}>
                  <div className="flex items-center justify-between text-xs text-iron-600">
                    <span>{m.month}</span>
                    <span className="font-mono text-dlugomat-900">{fmtPLN.format(m.gross)}</span>
                  </div>
                  <div className="mt-1 h-3 w-full rounded-full bg-iron-100">
                    <div
                      className="h-3 rounded-full bg-dlugomat-700"
                      style={{ width: `${pct}%` }}
                      aria-hidden
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Operatorzy platnosci</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="border-b border-iron-100 bg-iron-50/50 text-xs uppercase tracking-wide text-iron-600">
              <tr>
                <th className="px-5 py-2 text-left font-medium">Operator</th>
                <th className="px-5 py-2 text-right font-medium">Udzial</th>
                <th className="px-5 py-2 text-right font-medium">Skutecznosc</th>
                <th className="px-5 py-2 text-right font-medium">Sredni fee</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-iron-100">
              {PROVIDERS.map((p) => (
                <tr key={p.provider}>
                  <td className="px-5 py-3 text-dlugomat-900">{p.provider}</td>
                  <td className="px-5 py-3 text-right font-mono text-dlugomat-900">{p.share_pct}%</td>
                  <td className="px-5 py-3 text-right font-mono text-accent-700">{p.success_rate}%</td>
                  <td className="px-5 py-3 text-right font-mono text-iron-600">{p.avg_fee_pct}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Aktualne spory (disputes)</CardTitle>
          <CardDescription>{DISPUTES.filter((d) => d.status === "otwarty").length} otwartych.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <ul className="divide-y divide-iron-100">
            {DISPUTES.map((d) => (
              <li key={d.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-iron-500">{d.id}</span>
                    <Badge tone={STATUS_TONE[d.status]} withDot>
                      {d.status}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-dlugomat-900">{d.reason}</p>
                  <p className="text-xs text-iron-500">{d.user} · {d.opened_at}</p>
                </div>
                <span className="font-mono text-sm text-dlugomat-950">{fmtPLN.format(d.amount)}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
