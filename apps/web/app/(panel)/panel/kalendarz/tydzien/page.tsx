import type { Metadata } from "next";
import Link from "next/link";
import { Calendar, ChevronLeft, ChevronRight, Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Kalendarz — widok tygodniowy",
  description: "Twój tydzień w jednym widoku: terminy sądowe, spotkania, deadliny.",
};

interface CalEvent {
  id: string;
  day: number; // 0=Pon..6=Nd
  start: string; // HH:MM
  end: string;
  title: string;
  kind: "rozprawa" | "spotkanie" | "deadline" | "konsultacja";
  location?: string;
}

const EVENTS: CalEvent[] = [
  {
    id: "e1",
    day: 0,
    start: "09:00",
    end: "10:30",
    title: "Rozprawa — sygn. I C 412/25",
    kind: "rozprawa",
    location: "SR Warszawa-Mokotów, sala 214",
  },
  {
    id: "e2",
    day: 0,
    start: "14:00",
    end: "14:45",
    title: "Konsultacja z mec. Nowakiem",
    kind: "konsultacja",
    location: "online",
  },
  {
    id: "e3",
    day: 1,
    start: "11:00",
    end: "12:00",
    title: "Spotkanie z partnerem prawnym",
    kind: "spotkanie",
  },
  {
    id: "e4",
    day: 2,
    start: "23:59",
    end: "23:59",
    title: "Deadline: odpowiedź na pozew",
    kind: "deadline",
  },
  {
    id: "e5",
    day: 3,
    start: "10:00",
    end: "11:30",
    title: "Rozprawa — sygn. II Cz 89/26",
    kind: "rozprawa",
    location: "SO Warszawa, sala 502",
  },
  {
    id: "e6",
    day: 4,
    start: "15:00",
    end: "16:00",
    title: "Konsultacja BIK z klientem",
    kind: "konsultacja",
  },
  {
    id: "e7",
    day: 4,
    start: "17:00",
    end: "17:00",
    title: "Deadline: złożenie wniosku BIK",
    kind: "deadline",
  },
];

const KIND_TONE: Record<CalEvent["kind"], "danger" | "info" | "warning" | "success"> = {
  rozprawa: "danger",
  spotkanie: "info",
  deadline: "warning",
  konsultacja: "success",
};

const DAYS = ["Pon", "Wt", "Śr", "Cz", "Pt", "Sb", "Nd"];
const DATES = ["11.05", "12.05", "13.05", "14.05", "15.05", "16.05", "17.05"];

export default function KalendarzTydzienPage() {
  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.18em] text-iron-500">
            Kalendarz · widok tygodniowy
          </p>
          <h1 className="font-display text-fluid-h1 text-dlugomat-950">
            Tydzień 20 · 11–17 maja 2026
          </h1>
          <p className="max-w-2xl text-iron-600">
            Wszystkie terminy sądowe, spotkania oraz deadliny w jednym widoku.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" aria-label="Poprzedni tydzień">
            <ChevronLeft className="h-4 w-4" aria-hidden />
          </Button>
          <Button variant="ghost" size="sm">Dziś</Button>
          <Button variant="ghost" size="sm" aria-label="Następny tydzień">
            <ChevronRight className="h-4 w-4" aria-hidden />
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" aria-hidden />
            Nowe wydarzenie
          </Button>
        </div>
      </header>

      <nav aria-label="Widoki kalendarza" className="flex gap-1 rounded-md border border-iron-200 bg-iron-50 p-1 w-fit text-sm">
        <Link
          href="/panel/kalendarz"
          className="rounded px-3 py-1.5 text-iron-700 hover:bg-white focus-visible:outline-none focus-visible:shadow-shield-focus"
        >
          Miesiąc
        </Link>
        <span className="rounded bg-white px-3 py-1.5 font-semibold text-dlugomat-900 shadow-sm">
          Tydzień
        </span>
        <Link
          href="/panel/kalendarz/agenda"
          className="rounded px-3 py-1.5 text-iron-700 hover:bg-white focus-visible:outline-none focus-visible:shadow-shield-focus"
        >
          Agenda
        </Link>
      </nav>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <div className="grid grid-cols-7 min-w-[840px]">
            {DAYS.map((d, i) => (
              <div
                key={d}
                className="border-b border-iron-200 bg-iron-50 px-3 py-2 text-center"
              >
                <p className="text-xs uppercase tracking-wide text-iron-500">{d}</p>
                <p className="font-display text-lg text-dlugomat-950">{DATES[i]}</p>
              </div>
            ))}
            {DAYS.map((_, dayIdx) => {
              const dayEvents = EVENTS.filter((e) => e.day === dayIdx);
              return (
                <div
                  key={dayIdx}
                  className="min-h-[260px] border-r border-iron-100 last:border-r-0 p-2 space-y-1.5"
                >
                  {dayEvents.length === 0 ? (
                    <p className="text-xs text-iron-400 px-1 mt-2">—</p>
                  ) : (
                    dayEvents.map((ev) => (
                      <article
                        key={ev.id}
                        className="rounded-md border border-iron-200 bg-white p-2 text-xs shadow-card"
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-mono text-iron-500">
                            {ev.kind === "deadline" ? ev.start : `${ev.start}–${ev.end}`}
                          </span>
                          <Badge tone={KIND_TONE[ev.kind]} withDot>
                            {ev.kind}
                          </Badge>
                        </div>
                        <p className="mt-1 font-medium text-dlugomat-900 leading-snug">
                          {ev.title}
                        </p>
                        {ev.location ? (
                          <p className="mt-0.5 text-iron-500 truncate">{ev.location}</p>
                        ) : null}
                      </article>
                    ))
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <section className="grid gap-4 sm:grid-cols-4" aria-label="Statystyki tygodnia">
        <KpiCard label="Rozprawy" value={EVENTS.filter((e) => e.kind === "rozprawa").length} tone="danger" />
        <KpiCard label="Deadliny" value={EVENTS.filter((e) => e.kind === "deadline").length} tone="warning" />
        <KpiCard label="Spotkania" value={EVENTS.filter((e) => e.kind === "spotkanie").length} tone="info" />
        <KpiCard label="Konsultacje" value={EVENTS.filter((e) => e.kind === "konsultacja").length} tone="success" />
      </section>
    </div>
  );
}

function KpiCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "danger" | "warning" | "info" | "success";
}) {
  const colorClass: Record<typeof tone, string> = {
    danger: "text-danger",
    warning: "text-warn",
    info: "text-dlugomat-700",
    success: "text-accent-700",
  };
  return (
    <Card>
      <CardHeader>
        <CardDescription>
          <Calendar className="mr-1 inline h-3 w-3" aria-hidden />
          {label}
        </CardDescription>
        <CardTitle className={`font-display text-fluid-h2 ${colorClass[tone]}`}>
          {value}
        </CardTitle>
      </CardHeader>
    </Card>
  );
}
