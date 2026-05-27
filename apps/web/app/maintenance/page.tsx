import type { Metadata } from "next";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Trwa konserwacja systemu | Dlugomat",
  description: "Aktualnie prowadzimy zaplanowane prace konserwacyjne. Wrocimy w pelnej formie.",
  robots: { index: false, follow: false },
};

const timeline = [
  { time: "00:00", event: "Rozpoczecie okna konserwacyjnego", status: "wykonane" },
  { time: "00:15", event: "Backup bazy danych", status: "wykonane" },
  { time: "00:45", event: "Migracja schematu", status: "w toku" },
  { time: "02:00", event: "Restart uslug aplikacyjnych", status: "planowane" },
  { time: "03:00", event: "Testy regresyjne", status: "planowane" },
  { time: "04:00", event: "Przywrocenie ruchu produkcyjnego", status: "planowane" },
];

const tone: Record<string, "neutral" | "info" | "success" | "warning"> = {
  wykonane: "success",
  "w toku": "warning",
  planowane: "neutral",
};

export default function MaintenancePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-ink-50/60 px-4 py-16">
      <div className="w-full max-w-3xl space-y-6">
        <Card elevation="pop" urgency="warning" className="p-10">
          <Badge tone="warning" withDot>
            Okno konserwacyjne
          </Badge>
          <h1 className="mt-4 font-display text-3xl text-dlugomat-900">
            Pracujemy nad ulepszeniem platformy
          </h1>
          <p className="mt-3 max-w-xl text-sm text-dlugomat-600">
            Aktualnie wprowadzamy zaplanowane zmiany infrastrukturalne. Twoje dane sa bezpieczne -
            wszystkie operacje sa zachowane i zostana wznowione po przywroceniu uslugi.
          </p>

          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-md bg-white p-4 ring-1 ring-dlugomat-100">
              <p className="text-xs uppercase tracking-wide text-dlugomat-500">Poczatek</p>
              <p className="mt-1 font-display text-lg text-dlugomat-900">11.05.2026 00:00</p>
            </div>
            <div className="rounded-md bg-white p-4 ring-1 ring-dlugomat-100">
              <p className="text-xs uppercase tracking-wide text-dlugomat-500">Spodziewane zakonczenie</p>
              <p className="mt-1 font-display text-lg text-dlugomat-900">11.05.2026 04:00</p>
            </div>
            <div className="rounded-md bg-white p-4 ring-1 ring-dlugomat-100">
              <p className="text-xs uppercase tracking-wide text-dlugomat-500">Postep</p>
              <p className="mt-1 font-display text-lg text-dlugomat-900">38%</p>
            </div>
          </div>

          <div className="mt-6">
            <div
              role="progressbar"
              aria-valuenow={38}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Postep prac konserwacyjnych"
              className="h-2 w-full overflow-hidden rounded-full bg-dlugomat-100"
            >
              <div className="h-full rounded-full bg-accent-500" style={{ width: "38%" }} />
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button variant="primary" size="md" asChild>
              <Link href="/status">Strona statusu uslug</Link>
            </Button>
            <Button variant="secondary" size="md" asChild>
              <Link href="/kontakt">Skontaktuj sie z nami</Link>
            </Button>
          </div>
        </Card>

        <Card elevation="subtle" className="p-6">
          <h2 className="font-display text-lg text-dlugomat-900">Harmonogram prac</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {timeline.map((t) => (
              <li key={t.time} className="flex items-center gap-4">
                <span className="w-16 font-mono text-xs text-dlugomat-500">{t.time}</span>
                <span className="flex-1 text-dlugomat-700">{t.event}</span>
                <Badge tone={tone[t.status] ?? "neutral"}>{t.status}</Badge>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </main>
  );
}
