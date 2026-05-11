import type { Metadata } from "next";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Status uslug | Dlugomat",
  description: "Aktualny status wszystkich uslug platformy Dlugomat - API, web, integracje, kolejki.",
};

const services = [
  { name: "Aplikacja web", status: "operacyjny", uptime: "99,98%", p95: "240 ms" },
  { name: "API publiczne", status: "operacyjny", uptime: "99,99%", p95: "180 ms" },
  { name: "Generator pism (AI)", status: "operacyjny", uptime: "99,92%", p95: "1240 ms" },
  { name: "Wyszukiwarka semantyczna", status: "operacyjny", uptime: "99,94%", p95: "320 ms" },
  { name: "Integracja ePUAP", status: "degradacja", uptime: "98,12%", p95: "4800 ms" },
  { name: "Integracja Portal Informacyjny Sadu", status: "operacyjny", uptime: "99,86%", p95: "1100 ms" },
  { name: "Platnosci (Stripe)", status: "operacyjny", uptime: "99,99%", p95: "420 ms" },
  { name: "Powiadomienia SMS", status: "operacyjny", uptime: "99,96%", p95: "780 ms" },
  { name: "Email transakcyjny", status: "operacyjny", uptime: "99,98%", p95: "560 ms" },
];

const statusTone: Record<string, "success" | "warning" | "danger" | "neutral"> = {
  operacyjny: "success",
  degradacja: "warning",
  awaria: "danger",
  konserwacja: "neutral",
};

const incidents = [
  { date: "11.05.2026 08:22", title: "Spowolnienie integracji ePUAP", impact: "Czas odpowiedzi powyzej 4 sek dla wybranych operacji", status: "monitoring" },
  { date: "08.05.2026 14:48", title: "Krotka niedostepnosc generatora AI", impact: "Trwala 4 minuty - przyczyna: restart instancji modelu", status: "rozwiazane" },
  { date: "02.05.2026 03:00", title: "Konserwacja zaplanowana", impact: "Migracja schematu bazy - przeprowadzona zgodnie z planem", status: "rozwiazane" },
];

const incidentTone: Record<string, "neutral" | "info" | "success" | "warning" | "danger"> = {
  monitoring: "warning",
  rozwiazane: "success",
  aktywny: "danger",
};

const operational = services.filter((s) => s.status === "operacyjny").length;

export default function StatusPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-8 px-6 py-12 lg:px-10">
      <header className="space-y-3">
        <Badge tone="info" withDot>
          Status platformy
        </Badge>
        <h1 className="font-display text-3xl text-dlugomat-900">Status uslug Dlugomat</h1>
        <p className="max-w-2xl text-sm text-dlugomat-600">
          Strona aktualizowana w czasie rzeczywistym. Pokazuje dostepnosc kluczowych komponentow platformy
          oraz wszystkie zdarzenia operacyjne z ostatnich 30 dni.
        </p>
      </header>

      <Card
        elevation="pop"
        urgency={operational === services.length ? "success" : "warning"}
        className="p-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-xl text-dlugomat-900">
              {operational === services.length
                ? "Wszystkie systemy dzialaja prawidlowo"
                : `${operational} z ${services.length} uslug pracuje bez zaklocen`}
            </h2>
            <p className="mt-1 text-sm text-dlugomat-600">
              Ostatnia aktualizacja: 11.05.2026 09:24 - sprawdzane co 30 sekund.
            </p>
          </div>
          <Badge tone={operational === services.length ? "success" : "warning"}>
            {operational === services.length ? "Wszystko OK" : "Czesciowa degradacja"}
          </Badge>
        </div>
      </Card>

      <section aria-label="Lista uslug">
        <Card elevation="subtle" className="overflow-hidden">
          <header className="border-b border-dlugomat-100 px-6 py-4">
            <h2 className="font-display text-lg text-dlugomat-900">Komponenty systemu</h2>
            <p className="text-xs text-dlugomat-500">SLA dostepnosci i czas odpowiedzi p95 dla ostatnich 30 dni.</p>
          </header>
          <ul className="divide-y divide-dlugomat-100">
            {services.map((s) => (
              <li key={s.name} className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-block h-2 w-2 rounded-full ${
                      s.status === "operacyjny"
                        ? "bg-accent-500"
                        : s.status === "degradacja"
                          ? "bg-warn"
                          : "bg-danger"
                    }`}
                    aria-hidden
                  />
                  <span className="font-medium text-dlugomat-900">{s.name}</span>
                </div>
                <div className="flex items-center gap-6 text-xs text-dlugomat-600">
                  <span>
                    Uptime: <span className="font-mono text-dlugomat-900">{s.uptime}</span>
                  </span>
                  <span>
                    p95: <span className="font-mono text-dlugomat-900">{s.p95}</span>
                  </span>
                  <Badge tone={statusTone[s.status] ?? "neutral"}>{s.status}</Badge>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </section>

      <section aria-label="Historia zdarzen">
        <Card elevation="subtle" className="p-6">
          <h2 className="font-display text-lg text-dlugomat-900">Ostatnie zdarzenia</h2>
          <ul className="mt-4 space-y-4 text-sm">
            {incidents.map((i) => (
              <li key={i.date} className="rounded-md bg-dlugomat-50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-mono text-xs text-dlugomat-500">{i.date}</span>
                  <Badge tone={incidentTone[i.status] ?? "neutral"}>{i.status}</Badge>
                </div>
                <h3 className="mt-2 font-medium text-dlugomat-900">{i.title}</h3>
                <p className="mt-1 text-xs text-dlugomat-600">{i.impact}</p>
              </li>
            ))}
          </ul>
        </Card>
      </section>
    </div>
  );
}
