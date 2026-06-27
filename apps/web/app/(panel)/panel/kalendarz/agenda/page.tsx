import type { Metadata } from "next";
import Link from "next/link";
import { Clock, MapPin, Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Kalendarz — agenda",
  description: "Lista najbliższych wydarzeń uporządkowana chronologicznie.",
};

interface AgendaItem {
  id: string;
  date: string;
  time: string;
  title: string;
  kind: "rozprawa" | "spotkanie" | "deadline" | "konsultacja";
  location?: string;
  case_ref?: string;
}

const ITEMS: AgendaItem[] = [
  {
    id: "a1",
    date: "2026-05-11",
    time: "09:00",
    title: "Rozprawa — sygn. I C 412/25",
    kind: "rozprawa",
    location: "SR Warszawa-Mokotów, sala 214",
    case_ref: "case_004",
  },
  {
    id: "a2",
    date: "2026-05-11",
    time: "14:00",
    title: "Konsultacja z mec. Nowakiem",
    kind: "konsultacja",
    location: "online",
    case_ref: "case_007",
  },
  {
    id: "a3",
    date: "2026-05-12",
    time: "11:00",
    title: "Spotkanie z partnerem prawnym",
    kind: "spotkanie",
    location: "biuro Długomat, ul. Marszałkowska 142",
  },
  {
    id: "a4",
    date: "2026-05-13",
    time: "23:59",
    title: "Deadline: odpowiedź na pozew",
    kind: "deadline",
    case_ref: "case_011",
  },
  {
    id: "a5",
    date: "2026-05-14",
    time: "10:00",
    title: "Rozprawa — sygn. II Cz 89/26",
    kind: "rozprawa",
    location: "SO Warszawa, sala 502",
    case_ref: "case_009",
  },
  {
    id: "a6",
    date: "2026-05-15",
    time: "15:00",
    title: "Konsultacja BIK z klientem",
    kind: "konsultacja",
    location: "online",
  },
  {
    id: "a7",
    date: "2026-05-15",
    time: "17:00",
    title: "Deadline: złożenie wniosku BIK",
    kind: "deadline",
    case_ref: "case_002",
  },
  {
    id: "a8",
    date: "2026-05-19",
    time: "13:30",
    title: "Spotkanie z windykatorem",
    kind: "spotkanie",
    location: "BestCollect, ul. Złota 44",
  },
  {
    id: "a9",
    date: "2026-05-22",
    time: "09:30",
    title: "Rozprawa — sygn. III RC 76/26",
    kind: "rozprawa",
    location: "SR Kraków-Krowodrza, sala 12",
    case_ref: "case_013",
  },
];

const KIND_TONE: Record<AgendaItem["kind"], "danger" | "info" | "warning" | "success"> = {
  rozprawa: "danger",
  spotkanie: "info",
  deadline: "warning",
  konsultacja: "success",
};

function fmtDate(iso: string): { weekday: string; full: string } {
  const d = new Date(iso);
  return {
    weekday: new Intl.DateTimeFormat("pl-PL", { weekday: "long" }).format(d),
    full: new Intl.DateTimeFormat("pl-PL", { dateStyle: "long" }).format(d),
  };
}

export default function KalendarzAgendaPage() {
  // Group by date
  const grouped = new Map<string, AgendaItem[]>();
  for (const item of ITEMS) {
    if (!grouped.has(item.date)) grouped.set(item.date, []);
    grouped.get(item.date)!.push(item);
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.18em] text-ink-500">
            Kalendarz · agenda
          </p>
          <h1 className="font-display text-fluid-h1 text-dlugomat-950">
            Najbliższe wydarzenia
          </h1>
          <p className="max-w-2xl text-ink-600">
            Chronologiczna lista terminów. Filtruj po typie, by skupić się na tym,
            co najpilniejsze.
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" aria-hidden />
          Nowe wydarzenie
        </Button>
      </header>

      <nav aria-label="Widoki kalendarza" className="flex gap-1 rounded-md border border-ink-200 bg-ink-50 p-1 w-fit text-sm">
        <Link
          href="/panel/kalendarz"
          className="rounded px-3 py-1.5 text-ink-700 hover:bg-white focus-visible:outline-none focus-visible:shadow-shield-focus"
        >
          Miesiąc
        </Link>
        <Link
          href="/panel/kalendarz/tydzien"
          className="rounded px-3 py-1.5 text-ink-700 hover:bg-white focus-visible:outline-none focus-visible:shadow-shield-focus"
        >
          Tydzień
        </Link>
        <span className="rounded bg-white px-3 py-1.5 font-semibold text-dlugomat-900 shadow-sm">
          Agenda
        </span>
      </nav>

      <section aria-label="Lista wydarzeń" className="space-y-6">
        {Array.from(grouped.entries()).map(([date, items]) => {
          const { weekday, full } = fmtDate(date);
          return (
            <div key={date}>
              <div className="mb-3 flex items-baseline gap-3 border-b border-ink-200 pb-2">
                <h2 className="font-display text-lg text-dlugomat-950">
                  {weekday[0].toUpperCase() + weekday.slice(1)}
                </h2>
                <span className="text-sm text-ink-500">{full}</span>
                <span className="ml-auto text-xs text-ink-500">
                  {items.length} {items.length === 1 ? "wydarzenie" : "wydarzeń"}
                </span>
              </div>
              <ul className="space-y-2">
                {items.map((it) => (
                  <li key={it.id}>
                    <Card>
                      <CardContent className="flex items-start gap-4 p-4">
                        <div className="flex flex-col items-center w-16 flex-shrink-0">
                          <Clock className="h-4 w-4 text-ink-400" aria-hidden />
                          <span className="mt-1 font-mono text-sm font-semibold text-dlugomat-950">
                            {it.time}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold text-dlugomat-900">{it.title}</h3>
                            <Badge tone={KIND_TONE[it.kind]} withDot>
                              {it.kind}
                            </Badge>
                          </div>
                          {it.location ? (
                            <p className="mt-1 flex items-center gap-1 text-sm text-ink-600">
                              <MapPin className="h-3.5 w-3.5 text-ink-400" aria-hidden />
                              {it.location}
                            </p>
                          ) : null}
                          {it.case_ref ? (
                            <Link
                              href={`/panel/sprawa/${it.case_ref}`}
                              className="mt-1 inline-block text-xs text-dlugomat-700 hover:text-dlugomat-900 focus-visible:outline-none focus-visible:shadow-shield-focus rounded"
                            >
                              Powiązana sprawa: {it.case_ref} →
                            </Link>
                          ) : null}
                        </div>
                      </CardContent>
                    </Card>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </section>
    </div>
  );
}
