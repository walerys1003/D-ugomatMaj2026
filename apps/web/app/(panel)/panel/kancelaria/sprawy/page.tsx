import type { Metadata } from "next";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Sprawy kancelarii | Dlugomat",
  description: "Sprawy prowadzone przez kancelarie - portfel postepowan, terminy, statusy.",
};

const kpi = [
  { label: "Sprawy aktywne", value: "324", tone: "info" as const },
  { label: "Rozprawy w 7 dni", value: "18", tone: "warning" as const },
  { label: "Terminy procesowe", value: "42", tone: "warning" as const },
  { label: "Wygrane 2026 YTD", value: "87%", tone: "success" as const },
];

const cases = [
  { id: "KAN/2026/0418", client: "Alfa Sp. z o.o.", value: "Pozew o zaplate 420 000 PLN", court: "SO Warszawa XX GC", lawyer: "mec. Kowalska", nextDate: "14.05.2026", stage: "rozprawa", priority: "wysoki" },
  { id: "KAN/2026/0411", client: "Beta Trade S.A.", value: "Nakaz zaplaty 312 000 PLN", court: "SR Krakow IX GNc", lawyer: "mec. Nowak", nextDate: "16.05.2026", stage: "termin", priority: "sredni" },
  { id: "KAN/2026/0397", client: "Gamma Logistyka", value: "Apelacja 218 400 PLN", court: "SA Gdansk I AGa", lawyer: "mec. Wisniewska", nextDate: "22.05.2026", stage: "apelacja", priority: "wysoki" },
  { id: "KAN/2026/0385", client: "Delta Construction", value: "Egzekucja 195 800 PLN", court: "Komornik Lewandowski", lawyer: "mec. Krol", nextDate: "11.06.2026", stage: "egzekucja", priority: "niski" },
  { id: "KAN/2026/0372", client: "Epsilon Catering", value: "Pozew o zaplate 142 100 PLN", court: "SR Poznan IX GNc", lawyer: "mec. Kowalska", nextDate: "28.05.2026", stage: "pozew", priority: "sredni" },
];

const stageTone: Record<string, "neutral" | "info" | "success" | "warning" | "danger"> = {
  pozew: "info",
  termin: "warning",
  rozprawa: "warning",
  apelacja: "info",
  egzekucja: "neutral",
};

export default function KancelariaSprawyPage() {
  return (
    <div className="space-y-8 px-6 py-8 lg:px-10">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <Badge tone="info" withDot>Panel kancelarii</Badge>
          <h1 className="font-display text-3xl text-dlugomat-900">Sprawy kancelarii</h1>
          <p className="max-w-2xl text-sm text-dlugomat-600">
            Portfel postepowan sadowych i egzekucyjnych prowadzonych przez kancelarie. Filtry wedlug etapu,
            priorytetu i prowadzacego prawnika.
          </p>
        </div>
        <Button variant="primary" size="md">Nowa sprawa</Button>
      </header>

      <section aria-label="Wskazniki" className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpi.map((k) => (
          <Card key={k.label} elevation="subtle" className="p-5">
            <p className="text-xs uppercase tracking-wide text-dlugomat-500">{k.label}</p>
            <p className="mt-2 font-display text-2xl text-dlugomat-900">{k.value}</p>
            <Badge tone={k.tone} className="mt-3">{k.label}</Badge>
          </Card>
        ))}
      </section>

      <section aria-label="Lista spraw">
        <Card elevation="subtle" className="overflow-hidden">
          <header className="flex flex-wrap items-center gap-3 border-b border-dlugomat-100 px-6 py-4">
            <input
              type="search"
              placeholder="Szukaj po numerze lub kliencie"
              className="flex-1 rounded-md border border-dlugomat-200 px-3 py-2 text-sm focus-visible:shadow-shield-focus"
              aria-label="Wyszukiwanie spraw"
            />
            <select className="rounded-md border border-dlugomat-200 px-3 py-2 text-sm focus-visible:shadow-shield-focus" aria-label="Filtr etapu">
              <option>Wszystkie etapy</option>
              <option>Pozew</option>
              <option>Rozprawa</option>
              <option>Apelacja</option>
              <option>Egzekucja</option>
            </select>
            <select className="rounded-md border border-dlugomat-200 px-3 py-2 text-sm focus-visible:shadow-shield-focus" aria-label="Filtr prowadzacego">
              <option>Wszyscy prawnicy</option>
              <option>mec. Kowalska</option>
              <option>mec. Nowak</option>
              <option>mec. Wisniewska</option>
            </select>
          </header>
          <table className="w-full text-left text-sm">
            <thead className="bg-dlugomat-50 text-xs uppercase tracking-wide text-dlugomat-500">
              <tr>
                <th className="px-6 py-3">Sygnatura</th>
                <th className="px-6 py-3">Klient</th>
                <th className="px-6 py-3">Przedmiot</th>
                <th className="px-6 py-3">Sad</th>
                <th className="px-6 py-3">Prowadzi</th>
                <th className="px-6 py-3">Najblizszy termin</th>
                <th className="px-6 py-3">Etap</th>
                <th className="px-6 py-3 text-right">Akcje</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dlugomat-100">
              {cases.map((c) => (
                <tr key={c.id} className="text-dlugomat-700">
                  <td className="px-6 py-3 font-mono text-xs text-dlugomat-900">{c.id}</td>
                  <td className="px-6 py-3 font-medium">{c.client}</td>
                  <td className="px-6 py-3 text-xs">{c.value}</td>
                  <td className="px-6 py-3 text-xs">{c.court}</td>
                  <td className="px-6 py-3 text-xs">{c.lawyer}</td>
                  <td className="px-6 py-3 text-xs">{c.nextDate}</td>
                  <td className="px-6 py-3">
                    <Badge tone={stageTone[c.stage] ?? "neutral"}>{c.stage}</Badge>
                  </td>
                  <td className="px-6 py-3 text-right">
                    <Link href={`/panel/sprawa/${c.id}`} className="text-xs font-medium text-accent-600 hover:underline">
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
