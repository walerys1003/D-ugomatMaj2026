import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, CheckCircle2, Circle, Clock, Bell } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";
import {
  buildCaseTimeline,
  type TimelineEvent,
} from "@/lib/cases/timeline";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Oś czasu sprawy — Długomat",
  description: "Wizualna oś czasu kamieni milowych sprawy.",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

type MilestoneStatus = "done" | "current" | "upcoming";

interface Milestone {
  event: TimelineEvent;
  status: MilestoneStatus;
}

const STATUS_ICON = {
  done: CheckCircle2,
  current: Clock,
  upcoming: Circle,
} as const;

function classify(events: TimelineEvent[]): Milestone[] {
  const now = Date.now();
  // oldest → newest for a milestone view
  const asc = [...events].sort(
    (a, b) =>
      new Date(a.occurred_at).getTime() - new Date(b.occurred_at).getTime(),
  );

  // First future event becomes "current", everything before is "done",
  // everything after is "upcoming".
  const firstFutureIdx = asc.findIndex(
    (e) => new Date(e.occurred_at).getTime() > now,
  );

  return asc.map((event, idx) => {
    let status: MilestoneStatus;
    if (firstFutureIdx === -1) {
      status = "done";
    } else if (idx < firstFutureIdx) {
      status = "done";
    } else if (idx === firstFutureIdx) {
      status = "current";
    } else {
      status = "upcoming";
    }
    return { event, status };
  });
}

export default async function SprawaTimelinePage({ params }: PageProps) {
  const { id } = await params;

  const sb = await createSupabaseServerClient();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) {
    redirect(`/logowanie?next=/panel/sprawa/${id}/timeline`);
  }

  const events: TimelineEvent[] = await buildCaseTimeline({
    case_id: id,
    user_id: user.id,
    order: "asc",
  }).catch(() => []);

  const milestones = classify(events);
  const doneCount = milestones.filter((m) => m.status === "done").length;
  const pct =
    milestones.length === 0
      ? 0
      : Math.round((doneCount / milestones.length) * 100);
  const current = milestones.find((m) => m.status === "current");

  return (
    <div className="space-y-8">
      <div>
        <Link
          href={`/panel/sprawa/${id}`}
          className="inline-flex items-center gap-2 text-sm text-ink-600 hover:text-dlugomat-900 focus-visible:outline-none focus-visible:shadow-shield-focus rounded"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Wróć do sprawy
        </Link>
      </div>

      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.18em] text-ink-500">
          Sprawa · {id} · oś czasu
        </p>
        <h1 className="font-display text-fluid-h1 text-dlugomat-950">
          Kamienie milowe
        </h1>
        <p className="max-w-2xl text-ink-600">
          Wizualizacja postępu sprawy zbudowana z rzeczywistych zdarzeń:
          dokumentów, terminów i powiadomień.
        </p>
      </header>

      {milestones.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <EmptyState
              icon={<Bell className="h-5 w-5" />}
              title="Brak kamieni milowych"
              description="Oś czasu wypełni się, gdy w sprawie pojawią się dokumenty, terminy lub wysłane pisma."
              action={
                <Button variant="secondary" asChild>
                  <Link href={`/panel/sprawa/${id}`}>Wróć do sprawy</Link>
                </Button>
              }
            />
          </CardContent>
        </Card>
      ) : (
        <>
          <Card urgency="normal">
            <CardContent className="p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-ink-500">
                    Postęp sprawy
                  </p>
                  <p className="font-display text-fluid-h2 text-dlugomat-950">
                    {pct}%
                  </p>
                </div>
                {current ? (
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-wide text-ink-500">
                      Aktualny etap
                    </p>
                    <p className="font-medium text-dlugomat-900">
                      {current.event.title}
                    </p>
                  </div>
                ) : null}
              </div>
              <div className="mt-4 h-2 w-full rounded-full bg-ink-100">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-dlugomat-700 to-dlugomat-500"
                  style={{ width: `${pct}%` }}
                  aria-hidden
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Kamienie milowe</CardTitle>
              <CardDescription>
                Ukończone, w toku oraz nadchodzące zdarzenia
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="relative space-y-6 border-l-2 border-ink-200 pl-8">
                {milestones.map(({ event, status }) => {
                  const Icon = STATUS_ICON[status];
                  const iconColor =
                    status === "done"
                      ? "text-accent-600 bg-accent-50 border-accent-200"
                      : status === "current"
                        ? "text-dlugomat-700 bg-dlugomat-50 border-dlugomat-300"
                        : "text-ink-400 bg-white border-ink-200";
                  return (
                    <li key={event.id} className="relative">
                      <span
                        className={`absolute -left-[44px] inline-flex h-8 w-8 items-center justify-center rounded-full border-2 ${iconColor}`}
                        aria-hidden
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-dlugomat-950">
                            {event.title}
                          </h3>
                          <Badge
                            tone={
                              status === "done"
                                ? "success"
                                : status === "current"
                                  ? "warning"
                                  : "neutral"
                            }
                            withDot
                          >
                            {status === "done"
                              ? "Ukończone"
                              : status === "current"
                                ? "W toku"
                                : "Planowane"}
                          </Badge>
                        </div>
                        {event.description ? (
                          <p className="text-sm text-ink-600">
                            {event.description}
                          </p>
                        ) : null}
                        <div className="flex flex-wrap items-center gap-3 text-xs text-ink-500">
                          <span>
                            {new Intl.DateTimeFormat("pl-PL", {
                              dateStyle: "long",
                            }).format(new Date(event.occurred_at))}
                          </span>
                          <span aria-hidden>·</span>
                          <span>{event.source}</span>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex flex-wrap items-center gap-4 p-5">
              <CheckCircle2 className="h-8 w-8 text-accent-700" aria-hidden />
              <div className="flex-1 min-w-[240px]">
                <p className="font-semibold text-dlugomat-950">
                  Pełna chronologia
                </p>
                <p className="text-sm text-ink-600">
                  Zobacz szczegółową historię wszystkich zdarzeń w tej sprawie.
                </p>
              </div>
              <Button variant="secondary" asChild>
                <Link href={`/panel/sprawa/${id}/historia`}>
                  Zobacz historię
                </Link>
              </Button>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
