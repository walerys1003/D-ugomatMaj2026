import type { Metadata } from "next";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Zespol prawnikow - kancelaria | Dlugomat",
  description: "Zarzadzanie zespolem prawnikow, aplikantow i pracownikow administracyjnych kancelarii.",
};

const team = [
  { name: "mec. Anna Kowalska", role: "Partner", specialization: "Procesy gospodarcze", cases: 42, hours: 168, util: 84 },
  { name: "mec. Piotr Nowak", role: "Partner", specialization: "Egzekucja i upadlosc", cases: 38, hours: 172, util: 86 },
  { name: "mec. Magdalena Wisniewska", role: "Adwokat", specialization: "Postepowanie cywilne", cases: 31, hours: 156, util: 78 },
  { name: "mec. Robert Krol", role: "Radca prawny", specialization: "Prawo bankowe", cases: 28, hours: 148, util: 74 },
  { name: "apl. Karolina Mazur", role: "Aplikant", specialization: "Wsparcie procesowe", cases: 14, hours: 124, util: 62 },
  { name: "apl. Tomasz Lewandowski", role: "Aplikant", specialization: "Pisma procesowe", cases: 12, hours: 132, util: 66 },
  { name: "Sandra Lipinska", role: "Sekretariat", specialization: "Obsluga klienta", cases: 0, hours: 168, util: 100 },
];

const roleTone: Record<string, "neutral" | "info" | "success" | "warning" | "danger"> = {
  Partner: "info",
  Adwokat: "info",
  "Radca prawny": "info",
  Aplikant: "neutral",
  Sekretariat: "neutral",
};

const overview = [
  { label: "Aktywni czlonkowie", value: "7" },
  { label: "Sprawy prowadzone", value: "165" },
  { label: "Godziny rozliczeniowe (maj)", value: "1 068" },
  { label: "Srednie obciazenie", value: "79%" },
];

export default function KancelariaZespolPage() {
  return (
    <div className="space-y-8 px-6 py-8 lg:px-10">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <Badge tone="info" withDot>Panel kancelarii</Badge>
          <h1 className="font-display text-3xl text-dlugomat-900">Zespol prawnikow</h1>
          <p className="max-w-2xl text-sm text-dlugomat-600">
            Sklad osobowy kancelarii, specjalizacje, obciazenie sprawami i rozliczone godziny. Optymalizuj
            przydzialy w oparciu o dane operacyjne i utrzymuj rownowage obciazen.
          </p>
        </div>
        <Button variant="primary" size="md">Dodaj prawnika</Button>
      </header>

      <section aria-label="Statystyki" className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {overview.map((o) => (
          <Card key={o.label} elevation="subtle" className="p-5">
            <p className="text-xs uppercase tracking-wide text-dlugomat-500">{o.label}</p>
            <p className="mt-2 font-display text-2xl text-dlugomat-900">{o.value}</p>
          </Card>
        ))}
      </section>

      <section aria-label="Sklad zespolu">
        <Card elevation="subtle" className="overflow-hidden">
          <header className="border-b border-dlugomat-100 px-6 py-4">
            <h2 className="font-display text-lg text-dlugomat-900">Sklad zespolu</h2>
            <p className="text-xs text-dlugomat-500">Specjalizacje, sprawy i miesieczne obciazenie.</p>
          </header>
          <table className="w-full text-left text-sm">
            <thead className="bg-dlugomat-50 text-xs uppercase tracking-wide text-dlugomat-500">
              <tr>
                <th className="px-6 py-3">Osoba</th>
                <th className="px-6 py-3">Funkcja</th>
                <th className="px-6 py-3">Specjalizacja</th>
                <th className="px-6 py-3">Sprawy</th>
                <th className="px-6 py-3">Godziny (maj)</th>
                <th className="px-6 py-3">Obciazenie</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dlugomat-100">
              {team.map((p) => (
                <tr key={p.name} className="text-dlugomat-700">
                  <td className="px-6 py-3 font-medium text-dlugomat-900">{p.name}</td>
                  <td className="px-6 py-3">
                    <Badge tone={roleTone[p.role] ?? "neutral"}>{p.role}</Badge>
                  </td>
                  <td className="px-6 py-3 text-xs">{p.specialization}</td>
                  <td className="px-6 py-3 font-mono">{p.cases}</td>
                  <td className="px-6 py-3 font-mono">{p.hours}</td>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2">
                      <div
                        role="progressbar"
                        aria-valuenow={p.util}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        className="h-2 w-24 overflow-hidden rounded-full bg-dlugomat-100"
                      >
                        <div
                          className={`h-full rounded-full ${
                            p.util >= 90 ? "bg-danger" : p.util >= 75 ? "bg-accent-500" : "bg-dlugomat-300"
                          }`}
                          style={{ width: `${p.util}%` }}
                        />
                      </div>
                      <span className="font-mono text-xs">{p.util}%</span>
                    </div>
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
