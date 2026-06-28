import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, CalendarDays } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";
import { listUserDeadlines } from "@/lib/deadlines";
import { DEADLINE_RULES, type DeadlineKind } from "@/lib/deadlines/deadline-engine";

export const metadata: Metadata = {
  title: "Kalendarz miesiąc — panel",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

interface CalendarEvent {
  id: string;
  day: number; // 1..31
  time: string;
  title: string;
  kind: DeadlineKind;
  urgent: boolean;
  caseId: string | null;
}

const WEEKDAYS = ["Pn", "Wt", "Śr", "Cz", "Pt", "So", "Nd"];

async function loadMonth(): Promise<{
  events: CalendarEvent[];
  monthLabel: string;
  firstOffset: number;
  daysInMonth: number;
}> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/logowanie?next=/panel/kalendarz/miesiac");

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-based
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const firstOffset = (firstDay.getDay() + 6) % 7; // Monday=0

  const records = await listUserDeadlines(user.id).catch(() => []);
  const events: CalendarEvent[] = [];
  for (const r of records) {
    const due = new Date(r.snoozed_until ?? r.effective_end_date);
    if (due.getFullYear() !== year || due.getMonth() !== month) continue;
    const daysUntil = Math.ceil((due.getTime() - now.getTime()) / 86400_000);
    events.push({
      id: r.id,
      day: due.getDate(),
      time: due.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" }),
      title: r.title,
      kind: r.kind,
      urgent: daysUntil <= 3,
      caseId: r.case_id,
    });
  }

  const monthLabel = firstDay.toLocaleDateString("pl-PL", {
    month: "long",
    year: "numeric",
  });

  return { events, monthLabel, firstOffset, daysInMonth };
}

export default async function KalendarzMiesiacPage() {
  const { events, monthLabel, firstOffset, daysInMonth } = await loadMonth();

  const cells: Array<{ day: number | null }> = [];
  for (let i = 0; i < firstOffset; i++) cells.push({ day: null });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d });
  while (cells.length % 7 !== 0) cells.push({ day: null });

  const dayEvents = (day: number) => events.filter((e) => e.day === day);

  return (
    <div className="space-y-6">
      <Link
        href="/panel/kalendarz"
        className="inline-flex items-center gap-2 text-sm text-ink-600 hover:text-dlugomat-900"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Powrót do kalendarza
      </Link>

      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-ink-500">Widok miesięczny</p>
          <h1 className="font-display text-fluid-h1 text-dlugomat-950 capitalize">
            {monthLabel}
          </h1>
          <p className="mt-1 text-sm text-ink-600">
            {events.length} zdarzeń, w tym {events.filter((e) => e.urgent).length} pilnych.
          </p>
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-dlugomat-700" aria-hidden />
            Siatka miesięczna
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid grid-cols-7 border-t border-ink-100 bg-ink-50/50 text-xs font-medium uppercase tracking-wide text-ink-600">
            {WEEKDAYS.map((w) => (
              <div key={w} className="border-r border-ink-100 px-3 py-2 last:border-r-0">
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
                  className={`min-h-[110px] border-b border-r border-ink-100 p-2 last:border-r-0 ${
                    c.day === null ? "bg-ink-50/30" : ""
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
                                  : "bg-ink-100 text-dlugomat-800"
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
          <CardTitle className="capitalize">Wszystkie zdarzenia — {monthLabel}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {events.length === 0 ? (
            <p className="px-5 py-4 text-sm text-ink-500">
              Brak terminów w tym miesiącu.
            </p>
          ) : (
            <ul className="divide-y divide-ink-100">
              {events
                .slice()
                .sort((a, b) => a.day - b.day)
                .map((e) => {
                  const row = (
                    <>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs text-ink-500">
                          {String(e.day).padStart(2, "0")} · {e.time}
                        </span>
                        <span className="text-sm text-dlugomat-900">{e.title}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge tone="warning" withDot>
                          {DEADLINE_RULES[e.kind]?.label ?? "Termin"}
                        </Badge>
                        {e.urgent && <Badge tone="danger">Pilne</Badge>}
                      </div>
                    </>
                  );
                  return (
                    <li
                      key={e.id}
                      className="flex flex-wrap items-center justify-between gap-3 px-5 py-3"
                    >
                      {e.caseId ? (
                        <Link
                          href={`/panel/sprawa/${e.caseId}`}
                          className="flex w-full flex-wrap items-center justify-between gap-3 hover:text-dlugomat-900"
                        >
                          {row}
                        </Link>
                      ) : (
                        row
                      )}
                    </li>
                  );
                })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
