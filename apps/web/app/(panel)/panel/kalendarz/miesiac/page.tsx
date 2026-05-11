import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Kalendarz miesiac — panel",
  robots: { index: false, follow: false },
};

interface CalendarEvent {
  id: string;
  date: string;
  time: string;
  title: string;
  type: "deadline" | "rozprawa" | "call" | "wezwanie" | "platnosc";
  urgent: boolean;
}

const TYPE_TONE: Record<CalendarEvent["type"], "danger" | "warning" | "info" | "neutral" | "success"> = {
  deadline: "danger",
  rozprawa: "warning",
  call: "info",
  wezwanie: "neutral",
  platnosc: "success",
};

const TYPE_LABEL: Record<CalendarEvent["type"], string> = {
  deadline: "Termin procesowy",
  rozprawa: "Rozprawa",
  call: "Rozmowa",
  wezwanie: "Wezwanie",
  platnosc: "Platnosc",
};

const EVENTS: ReadonlyArray<CalendarEvent> = [
  { id: "e1", date: "2026-05-04", time: "09:00", title: "Sprzeciw EPU — Bank PKO", type: "deadline", urgent: true },
  { id: "e2", date: "2026-05-07", time: "13:30", title: "Rozprawa SR Warszawa-Mokotow", type: "rozprawa", urgent: true },
  { id: "e3", date: "2026-05-11", time: "10:15", title: "Konsultacja z prawnikiem", type: "call", urgent: false },
  { id: "e4", date: "2026-05-14", time: "00:00", title: "Rata harmonogramu 3/12", type: "platnosc", urgent: false },
  { id: "e5", date: "2026-05-18", time: "16:00", title: "Wezwanie do zaplaty — Provident", type: "wezwanie", urgent: false },
  { id: "e6", date: "2026-05-21", time: "11:00", title: "Termin odpowiedzi na zarzuty", type: "deadline", urgent: true },
  { id: "e7", date: "2026-05-26", time: "14:00", title: "Spotkanie z komornikiem", type: "call", urgent: false },
  { id: "e8", date: "2026-05-29", time: "00:00", title: "Rata harmonogramu 4/12", type: "platnosc", urgent: false },
];

const MONTH_LABEL = "Maj 2026";
const FIRST_WEEKDAY_OFFSET = 4;
const DAYS_IN_MONTH = 31;
const WEEKDAYS = ["Pn", "Wt", "Sr", "Cz", "Pt", "So", "Nd"];

function dayEvents(day: number): CalendarEvent[] {
  const dateStr = `2026-05-${String(day).padStart(2, "0")}`;
  return EVENTS.filter((e) => e.date === dateStr);
}

export default function KalendarzMiesiacPage() {
  const cells: Array<{ day: number | null }> = [];
  for (let i = 0; i < FIRST_WEEKDAY_OFFSET; i++) cells.push({ day: null });
  for (let d = 1; d <= DAYS_IN_MONTH; d++) cells.push({ day: d });
  while (cells.length % 7 !== 0) cells.push({ day: null });

  return (
    <div className="space-y-6">
      <Link
        href="/panel/kalendarz"
        className="inline-flex items-center gap-2 text-sm text-iron-600 hover:text-dlugomat-900"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Powrot do kalendarza
      </Link>

      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-iron-500">Widok miesieczny</p>
          <h1 className="font-display text-fluid-h1 text-dlugomat-950">{MONTH_LABEL}</h1>
          <p className="mt-1 text-sm text-iron-600">
            {EVENTS.length} zdarzen, w tym {EVENTS.filter((e) => e.urgent).length} pilnych.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" aria-label="Poprzedni miesiac">
            <ChevronLeft className="h-4 w-4" aria-hidden />
          </Button>
          <Button variant="secondary" size="sm">Dzisiaj</Button>
          <Button variant="secondary" size="sm" aria-label="Nastepny miesiac">
            <ChevronRight className="h-4 w-4" aria-hidden />
          </Button>
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-dlugomat-700" aria-hidden />
            Siatka miesieczna
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid grid-cols-7 border-t border-iron-100 bg-iron-50/50 text-xs font-medium uppercase tracking-wide text-iron-600">
            {WEEKDAYS.map((w) => (
              <div key={w} className="border-r border-iron-100 px-3 py-2 last:border-r-0">
                {w}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {cells.map((c, idx) => {
              const evs = c.day ? dayEvents(c.day) : [];
              const hasUrgent = evs.some((e) => e.urgent);
              return (
                <div
                  key={idx}
                  className={`min-h-[110px] border-b border-r border-iron-100 p-2 last:border-r-0 ${
                    c.day === null ? "bg-iron-50/30" : ""
                  } ${hasUrgent ? "bg-danger/5" : ""}`}
                >
                  {c.day !== null && (
                    <>
                      <p className="text-xs font-medium text-dlugomat-900">{c.day}</p>
                      <ul className="mt-1 space-y-1">
                        {evs.map((e) => (
                          <li key={e.id}>
                            <span
                              className={`block truncate rounded px-1.5 py-0.5 text-[10px] ${
                                e.urgent
                                  ? "bg-danger/10 text-danger"
                                  : "bg-iron-100 text-dlugomat-800"
                              }`}
                              title={`${e.time} ${e.title}`}
                            >
                              {e.time} {e.title}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Wszystkie zdarzenia w maju</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ul className="divide-y divide-iron-100">
            {EVENTS.map((e) => (
              <li key={e.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-iron-500">{e.date} · {e.time}</span>
                  <span className="text-sm text-dlugomat-900">{e.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone={TYPE_TONE[e.type]} withDot>
                    {TYPE_LABEL[e.type]}
                  </Badge>
                  {e.urgent && <Badge tone="danger">Pilne</Badge>}
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
