import type { Metadata } from "next";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Raporty - panel firmy | Dlugomat",
  description: "Dashboard analityczny wierzyciela - sciagalnosc, koszty, skutecznosc kancelarii.",
};

const overview = [
  { label: "Odzyskano w 2026 Q2", value: "3,42 mln PLN", delta: "+12% rdr", tone: "success" as const },
  { label: "Koszty windykacji", value: "418 200 PLN", delta: "-4% rdr", tone: "success" as const },
  { label: "ROI procesowy", value: "8,2x", delta: "+0,4x rdr", tone: "info" as const },
  { label: "Sprawy zamkniete", value: "1 124", delta: "+118 mdm", tone: "neutral" as const },
];

const monthly = [
  { month: "Sty", recovered: 412, ops: 64 },
  { month: "Lut", recovered: 388, ops: 58 },
  { month: "Mar", recovered: 524, ops: 71 },
  { month: "Kwi", recovered: 612, ops: 78 },
  { month: "Maj", recovered: 698, ops: 82 },
];

const maxRecovered = Math.max(...monthly.map((m) => m.recovered));

const channels = [
  { name: "Negocjacje wewnetrzne", recovered: 1240000, cost: 84000, eff: 14.8 },
  { name: "Kancelaria Kruk", recovered: 920000, cost: 142000, eff: 6.5 },
  { name: "Kancelaria Nowak", recovered: 712000, cost: 118000, eff: 6.0 },
  { name: "Egzekucja komornicza", recovered: 548000, cost: 74200, eff: 7.4 },
];

const currency = new Intl.NumberFormat("pl-PL", { style: "currency", currency: "PLN", maximumFractionDigits: 0 });

export default function FirmaRaportyPage() {
  return (
    <div className="space-y-8 px-6 py-8 lg:px-10">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <Badge tone="info" withDot>
            Panel firmy - analityka
          </Badge>
          <h1 className="font-display text-3xl text-dlugomat-900">Raporty wierzyciela</h1>
          <p className="max-w-2xl text-sm text-dlugomat-600">
            Skutecznosc procesow odzyskiwania naleznosci - rozbicie wedlug kanalu obslugi, miesieczna dynamika
            odzyskan oraz wskazniki ROI.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" size="md">Q1 2026</Button>
          <Button variant="primary" size="md">Eksport raportu PDF</Button>
        </div>
      </header>

      <section aria-label="Najwazniejsze wskazniki" className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {overview.map((kpi) => (
          <Card key={kpi.label} elevation="subtle" className="p-5">
            <p className="text-xs uppercase tracking-wide text-dlugomat-500">{kpi.label}</p>
            <p className="mt-2 font-display text-2xl text-dlugomat-900">{kpi.value}</p>
            <Badge tone={kpi.tone} className="mt-3">
              {kpi.delta}
            </Badge>
          </Card>
        ))}
      </section>

      <section aria-label="Odzyskania miesiac do miesiaca">
        <Card elevation="subtle" className="p-6">
          <header className="mb-5 flex items-end justify-between">
            <div>
              <h2 className="font-display text-lg text-dlugomat-900">Odzyskania miesiac do miesiaca</h2>
              <p className="text-xs text-dlugomat-500">Kwoty w tys. PLN. Tempo wzrostu utrzymuje sie powyzej 8% mdm.</p>
            </div>
            <Badge tone="success">Trend wzrostowy</Badge>
          </header>
          <div className="flex h-48 items-end gap-6">
            {monthly.map((m) => (
              <div key={m.month} className="flex flex-1 flex-col items-center gap-2">
                <div
                  role="progressbar"
                  aria-valuenow={m.recovered}
                  aria-valuemin={0}
                  aria-valuemax={maxRecovered}
                  aria-label={`Odzyskania w miesiacu ${m.month}: ${m.recovered} tys. PLN`}
                  className="flex w-full items-end justify-center rounded-md bg-accent-100"
                  style={{ height: `${(m.recovered / maxRecovered) * 100}%`, minHeight: "12px" }}
                >
                  <span className="pb-2 text-xs font-mono text-dlugomat-700">{m.recovered}</span>
                </div>
                <span className="text-xs uppercase text-dlugomat-500">{m.month}</span>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section aria-label="Skutecznosc kanalow">
        <Card elevation="subtle" className="overflow-hidden">
          <header className="border-b border-dlugomat-100 px-6 py-4">
            <h2 className="font-display text-lg text-dlugomat-900">Skutecznosc kanalow obslugi</h2>
            <p className="text-xs text-dlugomat-500">Stosunek odzyskan do kosztow operacyjnych w 2026 YTD.</p>
          </header>
          <table className="w-full text-left text-sm">
            <thead className="bg-dlugomat-50 text-xs uppercase tracking-wide text-dlugomat-500">
              <tr>
                <th className="px-6 py-3">Kanal</th>
                <th className="px-6 py-3">Odzyskano</th>
                <th className="px-6 py-3">Koszt</th>
                <th className="px-6 py-3">Efektywnosc</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dlugomat-100">
              {channels.map((c) => (
                <tr key={c.name} className="text-dlugomat-700">
                  <td className="px-6 py-3 font-medium text-dlugomat-900">{c.name}</td>
                  <td className="px-6 py-3 font-mono">{currency.format(c.recovered)}</td>
                  <td className="px-6 py-3 font-mono">{currency.format(c.cost)}</td>
                  <td className="px-6 py-3">
                    <Badge tone={c.eff >= 10 ? "success" : c.eff >= 6 ? "info" : "neutral"}>{c.eff.toFixed(1)}x</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </section>
    </div>
  );
}
