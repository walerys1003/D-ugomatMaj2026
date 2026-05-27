import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Kalendarz terminów | Długomat" };

interface DeadlineEvent {
  id: string;
  case_id: string;
  case_title: string;
  kind:
    | "court_hearing"
    | "appeal_deadline"
    | "objection_deadline"
    | "payment_due"
    | "limitation_warning"
    | "custom";
  title: string;
  due_at: string;
  severity: "critical" | "high" | "normal" | "low";
  days_until: number;
}

const KIND_LABELS: Record<DeadlineEvent["kind"], string> = {
  court_hearing: "Rozprawa sądowa",
  appeal_deadline: "Apelacja",
  objection_deadline: "Sprzeciw / odpowiedź",
  payment_due: "Termin płatności",
  limitation_warning: "Zbliżające się przedawnienie",
  custom: "Termin własny",
};

const SEVERITY_STYLE: Record<DeadlineEvent["severity"], string> = {
  critical: "border-l-4 border-danger-600 bg-danger-50/50 dark:bg-danger-700/10",
  high: "border-l-4 border-warn-600 bg-warn-50/50 dark:bg-warn-700/10",
  normal: "border-l-4 border-ink-300 dark:border-ink-700",
  low: "border-l-4 border-ink-200 dark:border-ink-800",
};

async function fetchDeadlines(): Promise<DeadlineEvent[]> {
  try {
    const res = await fetch("/api/deadlines", { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return data.events ?? [];
  } catch {
    return [];
  }
}

function groupByWeek(events: DeadlineEvent[]): Map<string, DeadlineEvent[]> {
  const groups = new Map<string, DeadlineEvent[]>();
  for (const e of events) {
    const d = new Date(e.due_at);
    const monday = new Date(d);
    monday.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    const key = monday.toISOString().slice(0, 10);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(e);
  }
  return groups;
}

export default async function KalendarzPage() {
  const events = await fetchDeadlines();
  const overdue = events.filter((e) => e.days_until < 0);
  const upcoming = events.filter((e) => e.days_until >= 0);
  const weeks = groupByWeek(upcoming);

  return (
    <main className="container mx-auto px-4 py-8 max-w-6xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wider text-ink-500 mb-2">
            Twoje sprawy
          </p>
          <h1 className="font-display text-3xl font-semibold text-ink-900 dark:text-ink-50">
            Kalendarz terminów
          </h1>
          <p className="text-sm text-ink-500 mt-1">
            {events.length} aktywnych terminów · {overdue.length} po terminie
          </p>
        </div>
        <div className="flex gap-2">
          <form method="post" action="/api/calendar/ics-export">
            <Button type="submit" variant="secondary">
              Eksport .ics
            </Button>
          </form>
          <Link href="/panel/kalendarz/nowy">
            <Button variant="primary">+ Dodaj termin</Button>
          </Link>
        </div>
      </div>

      {overdue.length > 0 && (
        <Card elevation="pop" urgency="overdue">
          <CardHeader>
            <CardTitle className="text-danger-700">Po terminie ({overdue.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {overdue.map((e) => (
                <EventRow key={e.id} event={e} />
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {weeks.size === 0 && overdue.length === 0 && (
        <Card elevation="subtle">
          <CardContent className="pt-6 text-sm text-ink-500">
            Brak nadchodzących terminów. Brak deadline'ów to dobra wiadomość.
          </CardContent>
        </Card>
      )}

      {Array.from(weeks.entries()).map(([weekStart, weekEvents]) => (
        <Card key={weekStart} elevation="subtle">
          <CardHeader>
            <CardTitle>
              Tydzień od {new Date(weekStart).toLocaleDateString("pl-PL")} (
              {weekEvents.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {weekEvents.map((e) => (
                <EventRow key={e.id} event={e} />
              ))}
            </ul>
          </CardContent>
        </Card>
      ))}
    </main>
  );
}

function EventRow({ event }: { event: DeadlineEvent }) {
  return (
    <li className={`rounded-r-md pl-3 pr-3 py-2.5 ${SEVERITY_STYLE[event.severity]}`}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xs px-2 py-0.5 rounded-full bg-ink-100 dark:bg-ink-800 text-ink-600 dark:text-ink-400">
              {KIND_LABELS[event.kind]}
            </span>
            <Link
              href={`/panel/sprawa/${event.case_id}`}
              className="text-xs text-accent-700 hover:text-accent-800 truncate"
            >
              {event.case_title}
            </Link>
          </div>
          <div className="text-sm font-medium text-ink-900 dark:text-ink-50">
            {event.title}
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-medium text-ink-900 dark:text-ink-50">
            {new Date(event.due_at).toLocaleDateString("pl-PL")}
          </div>
          <div className="text-xs text-ink-500">
            {event.days_until < 0
              ? `${Math.abs(event.days_until)} dni po terminie`
              : event.days_until === 0
                ? "Dzisiaj"
                : `Za ${event.days_until} dni`}
          </div>
        </div>
      </div>
    </li>
  );
}
