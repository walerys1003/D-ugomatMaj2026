import type { Metadata } from "next";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Pisma procesowe - kancelaria | Dlugomat",
  description: "Generator pism procesowych, wzory i dokumenty wychodzace z kancelarii.",
};

const templates = [
  { name: "Pozew o zaplate", category: "Postepowanie procesowe", count: 124 },
  { name: "Sprzeciw od nakazu zaplaty", category: "Postepowanie procesowe", count: 87 },
  { name: "Apelacja", category: "Postepowanie odwolawcze", count: 42 },
  { name: "Zazalenie", category: "Postepowanie odwolawcze", count: 31 },
  { name: "Wniosek o egzekucje", category: "Postepowanie egzekucyjne", count: 96 },
  { name: "Wniosek o zabezpieczenie", category: "Zabezpieczenie", count: 24 },
  { name: "Wezwanie do zaplaty", category: "Przedsadowe", count: 412 },
  { name: "Ugoda pozasadowa", category: "Negocjacje", count: 38 },
];

const drafts = [
  { id: "PIS-2026-0418", title: "Pozew o zaplate - Alfa Sp. z o.o.", author: "mec. Kowalska", status: "do podpisu", updated: "11.05.2026 09:24" },
  { id: "PIS-2026-0417", title: "Sprzeciw - Beta Trade S.A.", author: "mec. Nowak", status: "w opracowaniu", updated: "11.05.2026 08:14" },
  { id: "PIS-2026-0416", title: "Apelacja - Gamma Logistyka", author: "mec. Wisniewska", status: "do podpisu", updated: "10.05.2026 16:42" },
  { id: "PIS-2026-0415", title: "Wezwanie do zaplaty - 14 sztuk", author: "system", status: "wyslane", updated: "10.05.2026 12:00" },
  { id: "PIS-2026-0414", title: "Wniosek o egzekucje - Delta", author: "mec. Krol", status: "wyslane", updated: "09.05.2026 17:18" },
];

const statusTone: Record<string, "neutral" | "info" | "success" | "warning" | "danger"> = {
  "w opracowaniu": "info",
  "do podpisu": "warning",
  wyslane: "success",
};

export default function KancelariaPismaPage() {
  return (
    <div className="space-y-8 px-6 py-8 lg:px-10">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <Badge tone="info" withDot>Panel kancelarii</Badge>
          <h1 className="font-display text-3xl text-dlugomat-900">Pisma procesowe</h1>
          <p className="max-w-2xl text-sm text-dlugomat-600">
            Generator pism oparty o aktualne wzory KPC i orzecznictwo SN. Automatyczne uzupelnianie danych
            z karty sprawy, podpisy kwalifikowane i wysylka przez ePUAP / e-Sad.
          </p>
        </div>
        <Button variant="primary" size="md">Nowe pismo</Button>
      </header>

      <section aria-label="Szablony pism">
        <Card elevation="subtle" className="p-6">
          <h2 className="font-display text-lg text-dlugomat-900">Szablony</h2>
          <p className="text-xs text-dlugomat-500">Najczesciej uzywane wzory pism procesowych.</p>
          <ul className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
            {templates.map((t) => (
              <li key={t.name}>
                <button
                  type="button"
                  className="w-full rounded-md border border-dlugomat-200 bg-white p-4 text-left transition hover:border-accent-400 focus-visible:shadow-shield-focus"
                >
                  <div className="font-medium text-dlugomat-900">{t.name}</div>
                  <div className="mt-1 text-xs text-dlugomat-500">{t.category}</div>
                  <div className="mt-3 font-mono text-xs text-dlugomat-700">{t.count} uzyc</div>
                </button>
              </li>
            ))}
          </ul>
        </Card>
      </section>

      <section aria-label="Robocze pisma">
        <Card elevation="subtle" className="overflow-hidden">
          <header className="border-b border-dlugomat-100 px-6 py-4">
            <h2 className="font-display text-lg text-dlugomat-900">Pisma w obiegu</h2>
            <p className="text-xs text-dlugomat-500">Wersje robocze, do podpisu i wyslane w ostatnich 7 dniach.</p>
          </header>
          <table className="w-full text-left text-sm">
            <thead className="bg-dlugomat-50 text-xs uppercase tracking-wide text-dlugomat-500">
              <tr>
                <th className="px-6 py-3">Numer</th>
                <th className="px-6 py-3">Tytul</th>
                <th className="px-6 py-3">Autor</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Aktualizacja</th>
                <th className="px-6 py-3 text-right">Akcje</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dlugomat-100">
              {drafts.map((d) => (
                <tr key={d.id} className="text-dlugomat-700">
                  <td className="px-6 py-3 font-mono text-xs text-dlugomat-900">{d.id}</td>
                  <td className="px-6 py-3">{d.title}</td>
                  <td className="px-6 py-3 text-xs">{d.author}</td>
                  <td className="px-6 py-3">
                    <Badge tone={statusTone[d.status] ?? "neutral"}>{d.status}</Badge>
                  </td>
                  <td className="px-6 py-3 text-xs">{d.updated}</td>
                  <td className="px-6 py-3 text-right">
                    <button type="button" className="text-xs font-medium text-accent-600 hover:underline">
                      Otworz
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
