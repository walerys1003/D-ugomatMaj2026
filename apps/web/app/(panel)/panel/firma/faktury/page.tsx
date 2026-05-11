import type { Metadata } from "next";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Faktury i rozliczenia - panel firmy | Dlugomat",
  description: "Faktury kosztowe Dlugomat, kancelarii, komornikow oraz rozliczenia wewnetrzne.",
};

const summary = [
  { label: "Do zaplaty", value: "84 320 PLN", tone: "warning" as const, note: "8 faktur" },
  { label: "Zaplacone w maju", value: "212 480 PLN", tone: "success" as const, note: "24 faktury" },
  { label: "Przeterminowane", value: "0 PLN", tone: "success" as const, note: "Wszystko zgodne" },
  { label: "Limit miesiaca", value: "350 000 PLN", tone: "neutral" as const, note: "Wykorzystanie 61%" },
];

const invoices = [
  { id: "FV/2026/05/0124", issuer: "Dlugomat sp. z o.o.", subject: "Plan Business - maj 2026", amount: 2899, due: "20.05.2026", status: "do zaplaty" },
  { id: "FV/2026/05/0118", issuer: "Kancelaria Kruk", subject: "Obsluga 14 spraw - kwiecien", amount: 18400, due: "25.05.2026", status: "do zaplaty" },
  { id: "FV/2026/05/0102", issuer: "Komornik Wisniewski", subject: "Zaliczki na egzekucje (3 sprawy)", amount: 4200, due: "30.05.2026", status: "do zaplaty" },
  { id: "FV/2026/04/0987", issuer: "Kancelaria Nowak", subject: "Obsluga 9 spraw - marzec", amount: 14820, due: "30.04.2026", status: "zaplacona" },
  { id: "FV/2026/04/0974", issuer: "Dlugomat sp. z o.o.", subject: "Plan Business - kwiecien", amount: 2899, due: "20.04.2026", status: "zaplacona" },
  { id: "FV/2026/04/0951", issuer: "Sad Rejonowy Warszawa", subject: "Oplaty sadowe (4 sprawy)", amount: 4800, due: "15.04.2026", status: "zaplacona" },
];

const statusTone: Record<string, "neutral" | "info" | "success" | "warning" | "danger"> = {
  "do zaplaty": "warning",
  zaplacona: "success",
  przeterminowana: "danger",
};

const currency = new Intl.NumberFormat("pl-PL", { style: "currency", currency: "PLN", maximumFractionDigits: 0 });

export default function FirmaFakturyPage() {
  return (
    <div className="space-y-8 px-6 py-8 lg:px-10">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <Badge tone="info" withDot>
            Panel firmy - finanse
          </Badge>
          <h1 className="font-display text-3xl text-dlugomat-900">Faktury i rozliczenia</h1>
          <p className="max-w-2xl text-sm text-dlugomat-600">
            Zarzadzaj kosztami platformy Dlugomat, faktury od kancelarii partnerskich, komornikow i zaliczki sadowe.
            Wszystkie dokumenty w jednym panelu - bez fragmentacji i potrzeby przelaczania systemow.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" size="md">Eksport ksiegowy</Button>
          <Button variant="primary" size="md">Dodaj fakture rozliczeniowa</Button>
        </div>
      </header>

      <section aria-label="Podsumowanie miesiaca" className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summary.map((s) => (
          <Card key={s.label} elevation="subtle" className="p-5">
            <p className="text-xs uppercase tracking-wide text-dlugomat-500">{s.label}</p>
            <p className="mt-2 font-display text-2xl text-dlugomat-900">{s.value}</p>
            <Badge tone={s.tone} className="mt-3">
              {s.note}
            </Badge>
          </Card>
        ))}
      </section>

      <section aria-label="Lista faktur">
        <Card elevation="subtle" className="overflow-hidden">
          <header className="flex items-center justify-between border-b border-dlugomat-100 px-6 py-4">
            <h2 className="font-display text-lg text-dlugomat-900">Faktury z ostatnich 60 dni</h2>
            <div className="flex items-center gap-2">
              <select
                aria-label="Filtr statusu"
                className="rounded-md border border-dlugomat-200 px-3 py-1.5 text-xs focus-visible:shadow-shield-focus"
              >
                <option>Wszystkie statusy</option>
                <option>Do zaplaty</option>
                <option>Zaplacone</option>
              </select>
              <select
                aria-label="Filtr wystawcy"
                className="rounded-md border border-dlugomat-200 px-3 py-1.5 text-xs focus-visible:shadow-shield-focus"
              >
                <option>Wszyscy wystawcy</option>
                <option>Dlugomat</option>
                <option>Kancelaria Kruk</option>
                <option>Kancelaria Nowak</option>
              </select>
            </div>
          </header>
          <table className="w-full text-left text-sm">
            <thead className="bg-dlugomat-50 text-xs uppercase tracking-wide text-dlugomat-500">
              <tr>
                <th className="px-6 py-3">Numer</th>
                <th className="px-6 py-3">Wystawca</th>
                <th className="px-6 py-3">Tytul</th>
                <th className="px-6 py-3">Kwota</th>
                <th className="px-6 py-3">Termin</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Akcje</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dlugomat-100">
              {invoices.map((iv) => (
                <tr key={iv.id} className="text-dlugomat-700">
                  <td className="px-6 py-3 font-mono text-xs text-dlugomat-900">{iv.id}</td>
                  <td className="px-6 py-3">{iv.issuer}</td>
                  <td className="px-6 py-3 text-xs">{iv.subject}</td>
                  <td className="px-6 py-3 font-mono">{currency.format(iv.amount)}</td>
                  <td className="px-6 py-3 text-xs">{iv.due}</td>
                  <td className="px-6 py-3">
                    <Badge tone={statusTone[iv.status] ?? "neutral"}>{iv.status}</Badge>
                  </td>
                  <td className="px-6 py-3 text-right">
                    <button type="button" className="text-xs font-medium text-accent-600 hover:underline">
                      PDF
                    </button>
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
