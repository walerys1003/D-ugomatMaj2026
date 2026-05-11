import type { Metadata } from "next";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Klienci kancelarii | Dlugomat",
  description: "Baza klientow kancelarii z portfelem spraw i historia rozliczen.",
};

const clients = [
  { id: "KL-001", name: "Alfa Sp. z o.o.", nip: "5252001234", segment: "Korporacja", cases: 8, value: 1240000, since: "2022", contact: "Anna Nowak" },
  { id: "KL-002", name: "Beta Trade S.A.", nip: "5252005678", segment: "SME", cases: 4, value: 412000, since: "2023", contact: "Piotr Kowalski" },
  { id: "KL-003", name: "Gamma Logistyka", nip: "5252009012", segment: "SME", cases: 3, value: 218400, since: "2024", contact: "M. Wisniewska" },
  { id: "KL-004", name: "Delta Construction", nip: "5252003456", segment: "SME", cases: 6, value: 487300, since: "2023", contact: "T. Lewandowski" },
  { id: "KL-005", name: "Epsilon Catering", nip: "5252007890", segment: "Mikro", cases: 2, value: 142100, since: "2025", contact: "K. Mazur" },
  { id: "KL-006", name: "Zeta Service", nip: "5252001357", segment: "SME", cases: 5, value: 198750, since: "2024", contact: "R. Krol" },
  { id: "KL-007", name: "Eta Production", nip: "5252002468", segment: "Korporacja", cases: 12, value: 1876500, since: "2021", contact: "M. Lipinska" },
];

const segmentTone: Record<string, "neutral" | "info" | "success" | "warning" | "danger"> = {
  Korporacja: "info",
  SME: "neutral",
  Mikro: "neutral",
};

const currency = new Intl.NumberFormat("pl-PL", { style: "currency", currency: "PLN", maximumFractionDigits: 0 });

export default function KancelariaKlienciPage() {
  return (
    <div className="space-y-8 px-6 py-8 lg:px-10">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <Badge tone="info" withDot>Panel kancelarii</Badge>
          <h1 className="font-display text-3xl text-dlugomat-900">Klienci kancelarii</h1>
          <p className="max-w-2xl text-sm text-dlugomat-600">
            Baza obslugiwanych klientow z portfelem prowadzonych spraw i wartoscia procesowa. Segmentacja
            wedlug wielkosci organizacji i przypisanego opiekuna prawnego.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" size="md">Eksport CSV</Button>
          <Button variant="primary" size="md">Dodaj klienta</Button>
        </div>
      </header>

      <section aria-label="Statystyki klientow" className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card elevation="subtle" className="p-5">
          <p className="text-xs uppercase tracking-wide text-dlugomat-500">Klienci aktywni</p>
          <p className="mt-2 font-display text-2xl text-dlugomat-900">7</p>
        </Card>
        <Card elevation="subtle" className="p-5">
          <p className="text-xs uppercase tracking-wide text-dlugomat-500">Sprawy w obiegu</p>
          <p className="mt-2 font-display text-2xl text-dlugomat-900">40</p>
        </Card>
        <Card elevation="subtle" className="p-5">
          <p className="text-xs uppercase tracking-wide text-dlugomat-500">Wartosc portfela</p>
          <p className="mt-2 font-display text-2xl text-dlugomat-900">4,57 mln</p>
        </Card>
        <Card elevation="subtle" className="p-5">
          <p className="text-xs uppercase tracking-wide text-dlugomat-500">Sredni LTV</p>
          <p className="mt-2 font-display text-2xl text-dlugomat-900">653 tys.</p>
        </Card>
      </section>

      <section aria-label="Lista klientow">
        <Card elevation="subtle" className="overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-dlugomat-50 text-xs uppercase tracking-wide text-dlugomat-500">
              <tr>
                <th className="px-6 py-3">ID</th>
                <th className="px-6 py-3">Klient</th>
                <th className="px-6 py-3">NIP</th>
                <th className="px-6 py-3">Segment</th>
                <th className="px-6 py-3">Sprawy</th>
                <th className="px-6 py-3">Wartosc</th>
                <th className="px-6 py-3">Opiekun</th>
                <th className="px-6 py-3">Klient od</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dlugomat-100">
              {clients.map((c) => (
                <tr key={c.id} className="text-dlugomat-700">
                  <td className="px-6 py-3 font-mono text-xs text-dlugomat-900">{c.id}</td>
                  <td className="px-6 py-3 font-medium">{c.name}</td>
                  <td className="px-6 py-3 font-mono text-xs">{c.nip}</td>
                  <td className="px-6 py-3">
                    <Badge tone={segmentTone[c.segment] ?? "neutral"}>{c.segment}</Badge>
                  </td>
                  <td className="px-6 py-3 font-mono">{c.cases}</td>
                  <td className="px-6 py-3 font-mono">{currency.format(c.value)}</td>
                  <td className="px-6 py-3 text-xs">{c.contact}</td>
                  <td className="px-6 py-3 text-xs">{c.since}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </section>
    </div>
  );
}
