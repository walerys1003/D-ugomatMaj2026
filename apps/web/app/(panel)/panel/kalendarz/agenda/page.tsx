import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Clock, CalendarClock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";
import { listUserDeadlines } from "@/lib/deadlines";
import {
  DEADLINE_RULES,
  type DeadlineKind,
} from "@/lib/deadlines/deadline-engine";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Kalendarz — agenda",
  description: "Lista najbliższych terminów uporządkowana chronologicznie.",
};

interface AgendaItem {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  iso: string;
  title: string;
  kind: DeadlineKind;
  case_ref: string | null;
  daysUntil: number;
}

function kindLabel(kind: DeadlineKind): string {
  return DEADLINE_RULES[kind]?.label ?? "Termin";
}

function toneFromDays(
  days: number,
): "danger" | "warning" | "info" | "neutral" {
  if (days <= 1) return "danger";
  if (days <= 3) return "warning";
  if (days <= 7) return "info";
  return "neutral";
}

function fmtGroupDate(iso: string): { weekday: string; full: string } {
  const d = new Date(iso);
  return {
    weekday: new Intl.DateTimeFormat("pl-PL", { weekday: "long" }).format(d),
    full: new Intl.DateTimeFormat("pl-PL", { dateStyle: "long" }).format(d),
  };
}

async function fetchAgenda(): Promise<AgendaItem[]> {
  const sb = await createSupabaseServerClient();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) redirect("/logowanie?next=/panel/kalendarz/agenda");

  const records = await listUserDeadlines(user.id).catch(() => []);
  const now = Date.now();

  return records
    .map((r) => {
      const dueIso = r.snoozed_until ?? r.effective_end_date;
      const d = new Date(dueIso);
      const days = Math.ceil((d.getTime() - now) / 86400_000);
      return {
        id: r.id,
        date: dueIso.slice(0, 10),
        time: new Intl.DateTimeFormat("pl-PL", {
          hour: "2-digit",
          minute: "2-digit",
        }).format(d),
        iso: dueIso,
        title: r.title || kindLabel(r.kind),
        kind: r.kind,
        case_ref: r.case_id,
        daysUntil: days,
      };
    })
    .sort((a, b) => new Date(a.iso).getTime() - new Date(b.iso).getTime());
}

export default async function KalendarzAgendaPage() {
  const items = await fetchAgenda();

  // Group by date
  const grouped = new Map<string, AgendaItem[]>();
  for (const item of items) {
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
            Najbliższe terminy
          </h1>
          <p className="max-w-2xl text-ink-600">
            Chronologiczna lista Twoich terminów procesowych.
          </p>
        </div>
      </header>

      <nav
        aria-label="Widoki kalendarza"
        className="flex gap-1 rounded-md border border-ink-200 bg-ink-50 p-1 w-fit text-sm"
      >
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

      {items.length === 0 ? (
        <EmptyState
          icon={<CalendarClock className="h-5 w-5" />}
          title="Brak nadchodzących terminów"
          description="Nie masz aktualnie żadnych aktywnych terminów. Terminy procesowe pojawią się tutaj automatycznie po dodaniu sprawy lub zeskanowaniu pisma."
        />
      ) : (
        <section aria-label="Lista terminów" className="space-y-6">
          {Array.from(grouped.entries()).map(([date, dayItems]) => {
            const { weekday, full } = fmtGroupDate(date);
            return (
              <div key={date}>
                <div className="mb-3 flex items-baseline gap-3 border-b border-ink-200 pb-2">
                  <h2 className="font-display text-lg text-dlugomat-950">
                    {weekday[0].toUpperCase() + weekday.slice(1)}
                  </h2>
                  <span className="text-sm text-ink-500">{full}</span>
                  <span className="ml-auto text-xs text-ink-500">
                    {dayItems.length}{" "}
                    {dayItems.length === 1 ? "termin" : "terminy/-ów"}
                  </span>
                </div>
                <ul className="space-y-2">
                  {dayItems.map((it) => (
                    <li key={it.id}>
                      <Card>
                        <CardContent className="flex items-start gap-4 p-4">
                          <div className="flex flex-col items-center w-16 flex-shrink-0">
                            <Clock
                              className="h-4 w-4 text-ink-400"
                              aria-hidden
                            />
                            <span className="mt-1 font-mono text-sm font-semibold text-dlugomat-950">
                              {it.time}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-semibold text-dlugomat-900">
                                {it.title}
                              </h3>
                              <Badge tone={toneFromDays(it.daysUntil)} withDot>
                                {kindLabel(it.kind)}
                              </Badge>
                              {it.daysUntil <= 3 ? (
                                <span className="text-xs font-medium text-danger-700">
                                  {it.daysUntil < 0
                                    ? "po terminie"
                                    : it.daysUntil === 0
                                      ? "dziś"
                                      : `za ${it.daysUntil} dni`}
                                </span>
                              ) : null}
                            </div>
                            {it.case_ref ? (
                              <Link
                                href={`/panel/sprawa/${it.case_ref}`}
                                className="mt-1 inline-block text-xs text-dlugomat-700 hover:text-dlugomat-900 focus-visible:outline-none focus-visible:shadow-shield-focus rounded"
                              >
                                Powiązana sprawa →
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
      )}
    </div>
  );
}
