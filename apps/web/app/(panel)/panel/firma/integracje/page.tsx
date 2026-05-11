import type { Metadata } from "next";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Integracje API - panel firmy | Dlugomat",
  description: "Integracje z systemami ERP, ksiegowymi i bankowymi.",
};

const integrations = [
  { name: "Comarch ERP XL", category: "ERP", status: "polaczone", lastSync: "11.05.2026 09:15", records: "12 480" },
  { name: "Symfonia Handel", category: "Ksiegowosc", status: "polaczone", lastSync: "11.05.2026 08:00", records: "8 320" },
  { name: "iFirma API", category: "Ksiegowosc", status: "polaczone", lastSync: "10.05.2026 22:00", records: "1 248" },
  { name: "mBank Connect", category: "Bank", status: "polaczone", lastSync: "11.05.2026 06:00", records: "Live feed" },
  { name: "Santander Cash Management", category: "Bank", status: "wymaga odnowienia", lastSync: "08.05.2026 14:22", records: "Wstrzymane" },
  { name: "Allegro Sprzedaz B2B", category: "Marketplace", status: "rozlaczone", lastSync: "-", records: "-" },
  { name: "Microsoft Dynamics 365", category: "ERP", status: "dostepne", lastSync: "-", records: "-" },
];

const statusTone: Record<string, "neutral" | "info" | "success" | "warning" | "danger"> = {
  polaczone: "success",
  "wymaga odnowienia": "warning",
  rozlaczone: "neutral",
  dostepne: "info",
};

const apiKeys = [
  { name: "Produkcja - klient web", created: "12.01.2026", lastUsed: "11.05.2026 09:24", scope: "Odczyt + zapis spraw" },
  { name: "Sandbox - testowy", created: "08.02.2026", lastUsed: "10.05.2026 17:48", scope: "Pelny dostep test" },
  { name: "Read-only - raporty BI", created: "15.03.2026", lastUsed: "11.05.2026 06:00", scope: "Tylko odczyt" },
];

export default function FirmaIntegracjePage() {
  return (
    <div className="space-y-8 px-6 py-8 lg:px-10">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <Badge tone="info" withDot>
            Panel firmy - integracje
          </Badge>
          <h1 className="font-display text-3xl text-dlugomat-900">Integracje API</h1>
          <p className="max-w-2xl text-sm text-dlugomat-600">
            Polacz systemy ERP, ksiegowe i bankowe z Dlugomat. Automatyzuj import faktur, dopasowywanie wplat
            i tworzenie spraw windykacyjnych w tle.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" size="md" asChild>
            <a href="/dla-firm/api-dokumentacja">Dokumentacja API</a>
          </Button>
          <Button variant="primary" size="md">Dodaj integracje</Button>
        </div>
      </header>

      <section aria-label="Statystyki integracji" className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card elevation="subtle" className="p-5">
          <p className="text-xs uppercase tracking-wide text-dlugomat-500">Aktywne polaczenia</p>
          <p className="mt-2 font-display text-2xl text-dlugomat-900">4</p>
        </Card>
        <Card elevation="subtle" className="p-5">
          <p className="text-xs uppercase tracking-wide text-dlugomat-500">Wymagaja uwagi</p>
          <p className="mt-2 font-display text-2xl text-dlugomat-900">1</p>
          <Badge tone="warning" className="mt-3">odnowienie tokenu</Badge>
        </Card>
        <Card elevation="subtle" className="p-5">
          <p className="text-xs uppercase tracking-wide text-dlugomat-500">Rekordy zsynchronizowane</p>
          <p className="mt-2 font-display text-2xl text-dlugomat-900">22 048</p>
        </Card>
        <Card elevation="subtle" className="p-5">
          <p className="text-xs uppercase tracking-wide text-dlugomat-500">Klucze API</p>
          <p className="mt-2 font-display text-2xl text-dlugomat-900">3</p>
        </Card>
      </section>

      <section aria-label="Lista integracji">
        <Card elevation="subtle" className="overflow-hidden">
          <header className="border-b border-dlugomat-100 px-6 py-4">
            <h2 className="font-display text-lg text-dlugomat-900">Integracje systemowe</h2>
            <p className="text-xs text-dlugomat-500">Zarzadzaj polaczeniami i konfiguruj reguly synchronizacji.</p>
          </header>
          <table className="w-full text-left text-sm">
            <thead className="bg-dlugomat-50 text-xs uppercase tracking-wide text-dlugomat-500">
              <tr>
                <th className="px-6 py-3">System</th>
                <th className="px-6 py-3">Kategoria</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Ostatnia sync</th>
                <th className="px-6 py-3">Rekordy</th>
                <th className="px-6 py-3 text-right">Akcje</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dlugomat-100">
              {integrations.map((i) => (
                <tr key={i.name} className="text-dlugomat-700">
                  <td className="px-6 py-3 font-medium text-dlugomat-900">{i.name}</td>
                  <td className="px-6 py-3 text-xs">{i.category}</td>
                  <td className="px-6 py-3">
                    <Badge tone={statusTone[i.status] ?? "neutral"}>{i.status}</Badge>
                  </td>
                  <td className="px-6 py-3 text-xs">{i.lastSync}</td>
                  <td className="px-6 py-3 font-mono text-xs">{i.records}</td>
                  <td className="px-6 py-3 text-right">
                    <button type="button" className="text-xs font-medium text-accent-600 hover:underline">
                      Konfiguruj
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </section>

      <section aria-label="Klucze API">
        <Card elevation="subtle" className="p-6">
          <header className="mb-4 flex items-end justify-between">
            <div>
              <h2 className="font-display text-lg text-dlugomat-900">Klucze API</h2>
              <p className="text-xs text-dlugomat-500">Wygeneruj klucze dla aplikacji wewnetrznych i integracji partnerow.</p>
            </div>
            <Button variant="secondary" size="sm">Wygeneruj klucz</Button>
          </header>
          <ul className="space-y-3 text-sm">
            {apiKeys.map((k) => (
              <li key={k.name} className="flex items-center justify-between rounded-md bg-dlugomat-50 px-4 py-3">
                <div>
                  <div className="font-medium text-dlugomat-900">{k.name}</div>
                  <div className="text-xs text-dlugomat-500">
                    Utworzony {k.created} - uzyty {k.lastUsed} - {k.scope}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">Rotacja</Button>
                  <Button variant="ghost" size="sm">Uniewaznij</Button>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </section>
    </div>
  );
}
