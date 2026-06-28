import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Calendar, Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";
import { listUserDeadlines } from "@/lib/deadlines";
import { DEADLINE_RULES, type DeadlineKind } from "@/lib/deadlines/deadline-engine";

export const metadata: Metadata = {
  title: "Kalendarz — widok tygodniowy",
  description: "Twój tydzień w jednym widoku: terminy i deadliny.",
};
export const dynamic = "force-dynamic";

interface CalEvent {
  id: string;
  day: number; // 0=Pon..6=Nd
  time: string; // HH:MM
  title: string;
  kind: DeadlineKind;
  caseId: string | null;
}

const DAYS = ["Pon", "Wt", "Śr", "Cz", "Pt", "Sb", "Nd"];

function mondayOf(d: Date): Date {
  const m = new Date(d);
  m.setHours(0, 0, 0, 0);
  m.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return m;
}

async function loadWeek(): Promise<{ events: CalEvent[]; dates: string[]; weekLabel: string }> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/logowanie?next=/panel/kalendarz/tydzien");

  const now = new Date();
  const weekStart = mondayOf(now);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);

  const dates: string[] = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d.toLocaleDateString("pl-PL", { day: "2-digit", month: "2-digit" });
  });

  const records = await listUserDeadlines(user.id).catch(() => []);
  const events: CalEvent[] = [];
  for (const r of records) {
    const due = new Date(r.snoozed_until ?? r.effective_end_date);
    if (due < weekStart || due >= weekEnd) continue;
    const day = (due.getDay() + 6) % 7;
    events.push({
      id: r.id,
      day,
      time: due.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" }),
      title: r.title,
      kind: r.kind,
      caseId: r.case_id,
    });
  }

  const weekLabel = `${weekStart.toLocaleDateString("pl-PL", { day: "numeric", month: "long" })} – ${new Date(
    weekEnd.getTime() - 86400_000,
  ).toLocaleDateString("pl-PL", { day: "numeric", month: "long", year: "numeric" })}`;

  return { events, dates, weekLabel };
}

export default async function KalendarzTydzienPage() {
  const { events, dates, weekLabel } = await loadWeek();

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.18em] text-ink-500">
            Kalendarz · widok tygodniowy
          </p>
          <h1 className="font-display text-fluid-h1 text-dlugomat-950">{weekLabel}</h1>
          <p className="max-w-2xl text-ink-600">
            Wszystkie Twoje terminy i deadliny w bieżącym tygodniu.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/panel/kalendarz/nowy">
            <Button>
              <Plus className="mr-2 h-4 w-4" aria-hidden />
              Nowe wydarzenie
            </Button>
          </Link>
        </div>
      </header>

      <nav aria-label="Widoki kalendarza" className="flex gap-1 rounded-md border border-ink-200 bg-ink-50 p-1 w-fit text-sm">
        <Link
          href="/panel/kalendarz"
          className="rounded px-3 py-1.5 text-ink-700 hover:bg-white focus-visible:outline-none focus-visible:shadow-shield-focus"
        >
          Miesiąc
        </Link>
        <span className="rounded bg-white px-3 py-1.5 font-semibold text-dlugomat-900 shadow-sm">
          Tydzień
        </span>
        <Link
          href="/panel/kalendarz/agenda"
          className="rounded px-3 py-1.5 text-ink-700 hover:bg-white focus-visible:outline-none focus-visible:shadow-shield-focus"
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
                className="border-b border-ink-200 bg-ink-50 px-3 py-2 text-center"
              >
                <p className="text-xs uppercase tracking-wide text-ink-500">{d}</p>
                <p className="font-display text-lg text-dlugomat-950">{dates[i]}</p>
              </div>
            ))}
            {DAYS.map((_, dayIdx) => {
              const dayEvents = events.filter((e) => e.day === dayIdx);
              return (
                <div
                  key={dayIdx}
                  className="min-h-[260px] border-r border-ink-100 last:border-r-0 p-2 space-y-1.5"
                >
                  {dayEvents.length === 0 ? (
                    <p className="text-xs text-ink-400 px-1 mt-2">—</p>
                  ) : (
                    dayEvents.map((ev) => {
                      const inner = (
                        <>
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-mono text-ink-500">{ev.time}</span>
                            <Badge tone="warning" withDot>
                              termin
                            </Badge>
                          </div>
                          <p className="mt-1 font-medium text-dlugomat-900 leading-snug">
                            {ev.title}
                          </p>
                          <p className="mt-0.5 text-ink-500 truncate">
                            {DEADLINE_RULES[ev.kind]?.label ?? "Termin"}
                          </p>
                        </>
                      );
                      return ev.caseId ? (
                        <Link
                          key={ev.id}
                          href={`/panel/sprawa/${ev.caseId}`}
                          className="block rounded-md border border-ink-200 bg-white p-2 text-xs shadow-card hover:border-shield-300"
                        >
                          {inner}
                        </Link>
                      ) : (
                        <article
                          key={ev.id}
                          className="rounded-md border border-ink-200 bg-white p-2 text-xs shadow-card"
                        >
                          {inner}
                        </article>
                      );
                    })
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <section className="grid gap-4 sm:grid-cols-2" aria-label="Statystyki tygodnia">
        <KpiCard label="Terminy w tym tygodniu" value={events.length} tone="warning" />
        <KpiCard
          label="Powiązane ze sprawą"
          value={events.filter((e) => e.caseId).length}
          tone="info"
        />
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
