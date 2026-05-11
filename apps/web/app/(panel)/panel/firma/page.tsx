import type { Metadata } from "next";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Panel firmy - dashboard wierzyciela | Dlugomat",
  description: "Dashboard wierzyciela z portfelem spraw, wskaznikami DSO, struktura wiekowa naleznosci.",
};

const portfolioKpi = [
  { label: "Saldo portfela", value: "12 458 320 PLN", delta: "+3,2% mdm", tone: "neutral" as const },
  { label: "DSO sredni", value: "47 dni", delta: "-4 dni mdm", tone: "success" as const },
  { label: "Sprawy aktywne", value: "1 248", delta: "+82 nowe", tone: "info" as const },
  { label: "Sciagalnosc 90d", value: "68,4%", delta: "+1,8 p.p.", tone: "success" as const },
];

const aging = [
  { bucket: "0-30 dni", amount: 3120000, share: 25 },
  { bucket: "31-60 dni", amount: 2496000, share: 20 },
  { bucket: "61-90 dni", amount: 1869000, share: 15 },
  { bucket: "91-180 dni", amount: 2493000, share: 20 },
  { bucket: "powyzej 180 dni", amount: 2480320, share: 20 },
];

const topDebtors = [
  { name: "Alfa Sp. z o.o.", amount: 420000, dpd: 124, cases: 8, status: "windykacja" },
  { name: "Beta Trade S.A.", amount: 312000, dpd: 87, cases: 4, status: "negocjacje" },
  { name: "Gamma Logistyka", amount: 218400, dpd: 56, cases: 3, status: "monitoring" },
  { name: "Delta Construction", amount: 195800, dpd: 201, cases: 6, status: "sad" },
  { name: "Epsilon Catering", amount: 142100, dpd: 41, cases: 2, status: "wezwanie" },
];

const activity = [
  { time: "2026-05-11 09:24", text: "Sprawa #W-2026-0418: zaplata 14 200 PLN" },
  { time: "2026-05-11 08:51", text: "Nowy nakaz zaplaty - sprawa Alfa Sp. z o.o." },
  { time: "2026-05-10 17:14", text: "Sprawa #W-2026-0411 przekazana do kancelarii" },
  { time: "2026-05-10 14:02", text: "Import 124 nowych faktur przeterminowanych" },
];

const currency = new Intl.NumberFormat("pl-PL", { style: "currency", currency: "PLN", maximumFractionDigits: 0 });

export default function FirmaDashboardPage() {
  return (
    <div className="space-y-8 px-6 py-8 lg:px-10">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <Badge tone="info" withDot>
            Panel firmy - wierzyciel
          </Badge>
          <h1 className="font-display text-3xl text-dlugomat-900">Dashboard wierzyciela</h1>
          <p className="max-w-2xl text-sm text-dlugomat-600">
            Pelny obraz portfela naleznosci - struktura wiekowa, najwieksze ekspozycje, ostatnie zdarzenia operacyjne.
            Dane konsolidowane co 15 minut z systemow ksiegowych i kancelaryjnych.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" size="md" asChild>
            <Link href="/panel/firma/raporty">Pobierz raport PDF</Link>
          </Button>
          <Button variant="primary" size="md" asChild>
            <Link href="/panel/firma/portfel">Otworz portfel</Link>
          </Button>
        </div>
      </header>

      <section aria-label="Wskazniki portfela" className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {portfolioKpi.map((kpi) => (
          <Card key={kpi.label} elevation="subtle" className="p-5">
            <p className="text-xs uppercase tracking-wide text-dlugomat-500">{kpi.label}</p>
            <p className="mt-2 font-display text-2xl text-dlugomat-900">{kpi.value}</p>
            <Badge tone={kpi.tone} className="mt-3">
              {kpi.delta}
            </Badge>
          </Card>
        ))}
      </section>

      <section aria-label="Struktura wiekowa naleznosci" className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card elevation="subtle" className="lg:col-span-2 p-6">
          <header className="mb-5 flex items-end justify-between">
            <div>
              <h2 className="font-display text-lg text-dlugomat-900">Struktura wiekowa (aging)</h2>
              <p className="text-xs text-dlugomat-500">Podzial salda wedlug liczby dni od terminu wymagalnosci.</p>
            </div>
            <Badge tone="neutral">12 458 320 PLN</Badge>
          </header>
          <ul className="space-y-3">
            {aging.map((row) => (
              <li key={row.bucket} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-dlugomat-700">{row.bucket}</span>
                  <span className="font-mono text-dlugomat-900">{currency.format(row.amount)}</span>
                </div>
                <div
                  role="progressbar"
                  aria-valuenow={row.share}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  className="h-2 w-full overflow-hidden rounded-full bg-dlugomat-100"
                >
                  <div className="h-full rounded-full bg-accent-500" style={{ width: `${row.share}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </Card>
        <Card elevation="subtle" urgency="warning" className="p-6">
          <h2 className="font-display text-lg text-dlugomat-900">Sygnaly ryzyka</h2>
          <p className="mt-1 text-xs text-dlugomat-500">Wymaga reakcji w tym tygodniu.</p>
          <ul className="mt-4 space-y-3 text-sm text-dlugomat-700">
            <li className="flex items-start gap-3">
              <span className="mt-1 inline-block h-2 w-2 rounded-full bg-warn" aria-hidden />
              <span>14 spraw przekroczylo 180 dni - przekazanie do sadu rekomendowane.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 inline-block h-2 w-2 rounded-full bg-danger" aria-hidden />
              <span>Alfa Sp. z o.o. - brak zaplaty 3 miesiace, ekspozycja 420 000 PLN.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 inline-block h-2 w-2 rounded-full bg-accent-500" aria-hidden />
              <span>Wzrost ekspozycji 91-180 dni o 6 p.p. mdm - dostosowac strategie.</span>
            </li>
          </ul>
        </Card>
      </section>

      <section aria-label="Najwieksi dluznicy">
        <Card elevation="subtle" className="overflow-hidden">
          <header className="flex items-end justify-between border-b border-dlugomat-100 px-6 py-4">
            <div>
              <h2 className="font-display text-lg text-dlugomat-900">Najwieksze ekspozycje</h2>
              <p className="text-xs text-dlugomat-500">Top 5 dluznikow wedlug salda otwartego.</p>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/panel/firma/portfel">Pelny portfel</Link>
            </Button>
          </header>
          <table className="w-full text-left text-sm">
            <thead className="bg-dlugomat-50 text-xs uppercase tracking-wide text-dlugomat-500">
              <tr>
                <th className="px-6 py-3">Kontrahent</th>
                <th className="px-6 py-3">Saldo</th>
                <th className="px-6 py-3">DPD</th>
                <th className="px-6 py-3">Sprawy</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dlugomat-100">
              {topDebtors.map((row) => (
                <tr key={row.name} className="text-dlugomat-700">
                  <td className="px-6 py-3 font-medium text-dlugomat-900">{row.name}</td>
                  <td className="px-6 py-3 font-mono">{currency.format(row.amount)}</td>
                  <td className="px-6 py-3">{row.dpd}</td>
                  <td className="px-6 py-3">{row.cases}</td>
                  <td className="px-6 py-3">
                    <Badge tone={row.dpd > 180 ? "danger" : row.dpd > 90 ? "warning" : "neutral"}>
                      {row.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </section>

      <section aria-label="Aktywnosc operacyjna">
        <Card elevation="subtle" className="p-6">
          <h2 className="font-display text-lg text-dlugomat-900">Ostatnia aktywnosc</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {activity.map((row) => (
              <li key={row.time} className="flex items-start gap-4">
                <span className="font-mono text-xs text-dlugomat-500">{row.time}</span>
                <span className="text-dlugomat-700">{row.text}</span>
              </li>
            ))}
          </ul>
        </Card>
      </section>
    </div>
  );
}
