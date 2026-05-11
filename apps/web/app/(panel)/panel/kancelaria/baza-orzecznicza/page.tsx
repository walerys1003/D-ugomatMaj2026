import type { Metadata } from "next";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Baza orzecznicza - kancelaria | Dlugomat",
  description: "Wyszukiwarka orzeczen SN, SA i SR z analiza AI dopasowania do stanu faktycznego.",
};

const collections = [
  { name: "Sad Najwyzszy", count: "48 240" },
  { name: "Sady Apelacyjne", count: "182 410" },
  { name: "Sady Okregowe", count: "412 880" },
  { name: "Sady Rejonowe", count: "1 248 920" },
  { name: "TK i NSA", count: "24 110" },
];

const trending = [
  { signature: "III CZP 11/26", court: "SN", date: "08.05.2026", topic: "Skutki zawezwania do proby ugodowej dla przedawnienia", relevance: 96 },
  { signature: "I CSK 218/25", court: "SN", date: "22.04.2026", topic: "Wlasciwosc sadu w sprawach klauzul abuzywnych", relevance: 92 },
  { signature: "V ACa 412/26", court: "SA Warszawa", date: "14.04.2026", topic: "Odsetki ustawowe za opoznienie - art. 481 KC", relevance: 88 },
  { signature: "II Co 1124/25", court: "SO Krakow", date: "02.04.2026", topic: "Zabezpieczenie roszczenia w postepowaniu nakazowym", relevance: 84 },
];

const recent = [
  { user: "mec. Kowalska", query: "Klauzule abuzywne w umowach pozyczki - SN 2024-2026", time: "11.05.2026 09:24" },
  { user: "mec. Nowak", query: "Termin przedawnienia roszczen z umowy najmu", time: "11.05.2026 08:51" },
  { user: "mec. Wisniewska", query: "Zabezpieczenie w postepowaniu nakazowym art. 730 KPC", time: "10.05.2026 16:14" },
  { user: "mec. Krol", query: "Skarga pauliana - przeslanki swiadomosci pokrzywdzenia", time: "10.05.2026 12:02" },
];

export default function KancelariaBazaOrzeczniczaPage() {
  return (
    <div className="space-y-8 px-6 py-8 lg:px-10">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <Badge tone="info" withDot>Panel kancelarii</Badge>
          <h1 className="font-display text-3xl text-dlugomat-900">Baza orzecznicza</h1>
          <p className="max-w-2xl text-sm text-dlugomat-600">
            Ponad 1,9 mln orzeczen polskich sadow przeszukiwanych semantycznie. AI dopasowuje judykature
            do stanu faktycznego sprawy i wskazuje kierunek linii orzeczniczej.
          </p>
        </div>
        <Button variant="primary" size="md">Nowe zapytanie AI</Button>
      </header>

      <section aria-label="Wyszukiwarka semantyczna">
        <Card elevation="subtle" className="p-6">
          <label htmlFor="legal-search" className="text-xs uppercase tracking-wide text-dlugomat-500">
            Zapytanie semantyczne
          </label>
          <div className="mt-2 flex flex-col gap-3 lg:flex-row">
            <input
              id="legal-search"
              type="search"
              placeholder="np. Klauzule abuzywne w umowach pozyczki konsumenckiej"
              className="flex-1 rounded-md border border-dlugomat-200 px-4 py-3 text-sm focus-visible:shadow-shield-focus"
            />
            <Button variant="primary" size="md">Szukaj</Button>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-5">
            {collections.map((c) => (
              <div key={c.name} className="rounded-md bg-dlugomat-50 p-3">
                <div className="text-xs uppercase tracking-wide text-dlugomat-500">{c.name}</div>
                <div className="mt-1 font-mono text-sm text-dlugomat-900">{c.count}</div>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section aria-label="Trendy orzecznicze">
        <Card elevation="subtle" className="overflow-hidden">
          <header className="border-b border-dlugomat-100 px-6 py-4">
            <h2 className="font-display text-lg text-dlugomat-900">Najwazniejsze orzeczenia w obszarze</h2>
            <p className="text-xs text-dlugomat-500">Dopasowane do profilu praktyki Twojej kancelarii.</p>
          </header>
          <table className="w-full text-left text-sm">
            <thead className="bg-dlugomat-50 text-xs uppercase tracking-wide text-dlugomat-500">
              <tr>
                <th className="px-6 py-3">Sygnatura</th>
                <th className="px-6 py-3">Sad</th>
                <th className="px-6 py-3">Data</th>
                <th className="px-6 py-3">Tematyka</th>
                <th className="px-6 py-3">Trafnosc</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dlugomat-100">
              {trending.map((t) => (
                <tr key={t.signature} className="text-dlugomat-700">
                  <td className="px-6 py-3 font-mono text-xs text-dlugomat-900">{t.signature}</td>
                  <td className="px-6 py-3">
                    <Badge tone="info">{t.court}</Badge>
                  </td>
                  <td className="px-6 py-3 text-xs">{t.date}</td>
                  <td className="px-6 py-3 text-xs">{t.topic}</td>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2">
                      <div
                        role="progressbar"
                        aria-valuenow={t.relevance}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        className="h-2 w-24 overflow-hidden rounded-full bg-dlugomat-100"
                      >
                        <div className="h-full rounded-full bg-accent-500" style={{ width: `${t.relevance}%` }} />
                      </div>
                      <span className="font-mono text-xs">{t.relevance}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </section>

      <section aria-label="Ostatnie zapytania zespolu">
        <Card elevation="subtle" className="p-6">
          <h2 className="font-display text-lg text-dlugomat-900">Ostatnie zapytania zespolu</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {recent.map((r) => (
              <li key={r.time} className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-medium text-dlugomat-900">{r.query}</div>
                  <div className="text-xs text-dlugomat-500">{r.user}</div>
                </div>
                <span className="font-mono text-xs text-dlugomat-500">{r.time}</span>
              </li>
            ))}
          </ul>
        </Card>
      </section>
    </div>
  );
}
