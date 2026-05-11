import type { Metadata } from "next";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Portfel spraw - panel firmy | Dlugomat",
  description: "Lista spraw windykacyjnych firmy z filtrami status, dpd, kwota.",
};

const cases = [
  { id: "W-2026-0418", debtor: "Alfa Sp. z o.o.", amount: 420000, dpd: 124, stage: "windykacja", lawyer: "kancelaria Kruk", updated: "11.05.2026" },
  { id: "W-2026-0411", debtor: "Beta Trade S.A.", amount: 312000, dpd: 87, stage: "negocjacje", lawyer: "wewnetrzny", updated: "10.05.2026" },
  { id: "W-2026-0397", debtor: "Gamma Logistyka", amount: 218400, dpd: 56, stage: "monitoring", lawyer: "-", updated: "09.05.2026" },
  { id: "W-2026-0385", debtor: "Delta Construction", amount: 195800, dpd: 201, stage: "sad", lawyer: "kancelaria Nowak", updated: "08.05.2026" },
  { id: "W-2026-0372", debtor: "Epsilon Catering", amount: 142100, dpd: 41, stage: "wezwanie", lawyer: "wewnetrzny", updated: "07.05.2026" },
  { id: "W-2026-0356", debtor: "Zeta Service", amount: 98750, dpd: 18, stage: "monitoring", lawyer: "-", updated: "06.05.2026" },
  { id: "W-2026-0341", debtor: "Eta Production", amount: 76500, dpd: 232, stage: "egzekucja", lawyer: "komornik Wisniewski", updated: "05.05.2026" },
  { id: "W-2026-0330", debtor: "Theta Solutions", amount: 54320, dpd: 9, stage: "wezwanie", lawyer: "wewnetrzny", updated: "04.05.2026" },
];

const filters = ["Wszystkie", "Wezwanie", "Negocjacje", "Windykacja", "Sad", "Egzekucja", "Monitoring"];

const stageTone: Record<string, "neutral" | "info" | "success" | "warning" | "danger"> = {
  wezwanie: "info",
  negocjacje: "info",
  monitoring: "neutral",
  windykacja: "warning",
  sad: "warning",
  egzekucja: "danger",
};

const currency = new Intl.NumberFormat("pl-PL", { style: "currency", currency: "PLN", maximumFractionDigits: 0 });

export default function FirmaPortfelPage() {
  return (
    <div className="space-y-8 px-6 py-8 lg:px-10">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <Badge tone="info" withDot>
            Panel firmy
          </Badge>
          <h1 className="font-display text-3xl text-dlugomat-900">Portfel spraw</h1>
          <p className="max-w-2xl text-sm text-dlugomat-600">
            Pelna lista postepowan z mozliwoscia filtracji wedlug statusu, dni po terminie i kwoty. Eksport CSV
            i przekazanie do kancelarii dostepne z poziomu wiersza.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" size="md">Eksport CSV</Button>
          <Button variant="primary" size="md">Nowa sprawa</Button>
        </div>
      </header>

      <section aria-label="Filtry portfela">
        <Card elevation="subtle" className="p-5">
          <div className="flex flex-wrap items-center gap-2">
            {filters.map((f, i) => (
              <button
                key={f}
                type="button"
                className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${
                  i === 0 ? "bg-dlugomat-900 text-white" : "bg-dlugomat-50 text-dlugomat-700 hover:bg-dlugomat-100"
                }`}
              >
                {f}
              </button>
            ))}
            <div className="ml-auto flex items-center gap-3">
              <label className="flex items-center gap-2 text-xs text-dlugomat-500">
                DPD od
                <input
                  type="number"
                  defaultValue={0}
                  className="w-20 rounded-md border border-dlugomat-200 px-2 py-1 text-sm focus-visible:shadow-shield-focus"
                />
              </label>
              <label className="flex items-center gap-2 text-xs text-dlugomat-500">
                Kwota od
                <input
                  type="number"
                  defaultValue={0}
                  className="w-28 rounded-md border border-dlugomat-200 px-2 py-1 text-sm focus-visible:shadow-shield-focus"
                />
              </label>
            </div>
          </div>
        </Card>
      </section>

      <section aria-label="Lista spraw">
        <Card elevation="subtle" className="overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-dlugomat-50 text-xs uppercase tracking-wide text-dlugomat-500">
              <tr>
                <th className="px-6 py-3">Nr sprawy</th>
                <th className="px-6 py-3">Dluznik</th>
                <th className="px-6 py-3">Saldo</th>
                <th className="px-6 py-3">DPD</th>
                <th className="px-6 py-3">Etap</th>
                <th className="px-6 py-3">Prowadzi</th>
                <th className="px-6 py-3">Aktualizacja</th>
                <th className="px-6 py-3 text-right">Akcje</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dlugomat-100">
              {cases.map((c) => (
                <tr key={c.id} className="text-dlugomat-700">
                  <td className="px-6 py-3 font-mono text-xs text-dlugomat-900">{c.id}</td>
                  <td className="px-6 py-3 font-medium text-dlugomat-900">{c.debtor}</td>
                  <td className="px-6 py-3 font-mono">{currency.format(c.amount)}</td>
                  <td className="px-6 py-3">
                    <span className={c.dpd > 180 ? "text-danger" : c.dpd > 90 ? "text-warn" : ""}>{c.dpd}</span>
                  </td>
                  <td className="px-6 py-3">
                    <Badge tone={stageTone[c.stage] ?? "neutral"}>{c.stage}</Badge>
                  </td>
                  <td className="px-6 py-3 text-xs text-dlugomat-600">{c.lawyer}</td>
                  <td className="px-6 py-3 text-xs text-dlugomat-500">{c.updated}</td>
                  <td className="px-6 py-3 text-right">
                    <Link
                      href={`/panel/sprawa/${c.id}`}
                      className="text-xs font-medium text-accent-600 hover:underline"
                    >
                      Otworz
                    </Link>
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
