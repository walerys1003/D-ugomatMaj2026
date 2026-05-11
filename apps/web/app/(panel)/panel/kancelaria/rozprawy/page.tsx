import type { Metadata } from "next";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Kalendarz rozpraw - kancelaria | Dlugomat",
  description: "Kalendarz rozpraw sadowych, terminow procesowych i posiedzen.",
};

const upcoming = [
  { date: "14.05.2026", time: "10:00", court: "SO Warszawa, sala 304", case: "KAN/2026/0418 - Alfa Sp. z o.o.", lawyer: "mec. Kowalska", kind: "rozprawa", duration: "120 min" },
  { date: "16.05.2026", time: "09:30", court: "SR Krakow, sala 12", case: "KAN/2026/0411 - Beta Trade", lawyer: "mec. Nowak", kind: "rozprawa", duration: "90 min" },
  { date: "18.05.2026", time: "11:00", court: "Online - MS Teams", case: "KAN/2026/0402 - mediacja Sigma", lawyer: "mec. Wisniewska", kind: "mediacja", duration: "180 min" },
  { date: "22.05.2026", time: "13:15", court: "SA Gdansk, sala 7", case: "KAN/2026/0397 - Gamma Logistyka", lawyer: "mec. Wisniewska", kind: "apelacja", duration: "60 min" },
  { date: "28.05.2026", time: "10:30", court: "SR Poznan, sala 5", case: "KAN/2026/0372 - Epsilon Catering", lawyer: "mec. Kowalska", kind: "rozprawa", duration: "60 min" },
];

const deadlines = [
  { date: "13.05.2026", title: "Termin na odpowiedz na pozew - Theta", lawyer: "mec. Nowak", urgent: true },
  { date: "15.05.2026", title: "Termin na sprzeciw - Beta Trade", lawyer: "mec. Nowak", urgent: true },
  { date: "20.05.2026", title: "Termin na apelacje - Eta Production", lawyer: "mec. Wisniewska", urgent: false },
  { date: "25.05.2026", title: "Termin na zazalenie - Zeta Service", lawyer: "mec. Krol", urgent: false },
];

const kindTone: Record<string, "neutral" | "info" | "success" | "warning" | "danger"> = {
  rozprawa: "warning",
  apelacja: "info",
  mediacja: "info",
  posiedzenie: "neutral",
};

export default function KancelariaRozprawyPage() {
  return (
    <div className="space-y-8 px-6 py-8 lg:px-10">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <Badge tone="info" withDot>Panel kancelarii</Badge>
          <h1 className="font-display text-3xl text-dlugomat-900">Kalendarz rozpraw</h1>
          <p className="max-w-2xl text-sm text-dlugomat-600">
            Terminarz rozpraw, mediacji i terminow procesowych. Synchronizacja z portalem informacyjnym
            sadu i automatyczne przypomnienia 7, 3 i 1 dzien przed terminem.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" size="md">iCal / Google</Button>
          <Button variant="primary" size="md">Dodaj termin</Button>
        </div>
      </header>

      <section aria-label="Pilne terminy procesowe">
        <Card elevation="subtle" urgency="warning" className="p-6">
          <h2 className="font-display text-lg text-dlugomat-900">Terminy procesowe</h2>
          <p className="text-xs text-dlugomat-500">Upewnij sie, ze zachowane sa terminy ustawowe.</p>
          <ul className="mt-4 space-y-3 text-sm">
            {deadlines.map((d) => (
              <li key={d.title} className="flex items-center justify-between rounded-md bg-white px-4 py-3 ring-1 ring-dlugomat-100">
                <div className="flex items-center gap-4">
                  <span className={`inline-block h-2 w-2 rounded-full ${d.urgent ? "bg-danger" : "bg-accent-500"}`} aria-hidden />
                  <div>
                    <div className="font-medium text-dlugomat-900">{d.title}</div>
                    <div className="text-xs text-dlugomat-500">Prowadzi {d.lawyer}</div>
                  </div>
                </div>
                <Badge tone={d.urgent ? "danger" : "neutral"}>{d.date}</Badge>
              </li>
            ))}
          </ul>
        </Card>
      </section>

      <section aria-label="Nadchodzace rozprawy">
        <Card elevation="subtle" className="overflow-hidden">
          <header className="border-b border-dlugomat-100 px-6 py-4">
            <h2 className="font-display text-lg text-dlugomat-900">Nadchodzace rozprawy</h2>
            <p className="text-xs text-dlugomat-500">Najblizsze 30 dni - 5 wydarzen procesowych.</p>
          </header>
          <table className="w-full text-left text-sm">
            <thead className="bg-dlugomat-50 text-xs uppercase tracking-wide text-dlugomat-500">
              <tr>
                <th className="px-6 py-3">Data / godzina</th>
                <th className="px-6 py-3">Sad / miejsce</th>
                <th className="px-6 py-3">Sprawa</th>
                <th className="px-6 py-3">Prowadzi</th>
                <th className="px-6 py-3">Rodzaj</th>
                <th className="px-6 py-3">Czas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dlugomat-100">
              {upcoming.map((u) => (
                <tr key={`${u.date}-${u.case}`} className="text-dlugomat-700">
                  <td className="px-6 py-3">
                    <div className="font-medium text-dlugomat-900">{u.date}</div>
                    <div className="text-xs text-dlugomat-500">{u.time}</div>
                  </td>
                  <td className="px-6 py-3 text-xs">{u.court}</td>
                  <td className="px-6 py-3 text-xs">{u.case}</td>
                  <td className="px-6 py-3 text-xs">{u.lawyer}</td>
                  <td className="px-6 py-3">
                    <Badge tone={kindTone[u.kind] ?? "neutral"}>{u.kind}</Badge>
                  </td>
                  <td className="px-6 py-3 font-mono text-xs">{u.duration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </section>
    </div>
  );
}
