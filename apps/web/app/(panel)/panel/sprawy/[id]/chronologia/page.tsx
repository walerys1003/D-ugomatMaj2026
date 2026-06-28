import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  FileText,
  Gavel,
  Mail,
  Bell,
  AlertTriangle,
  History,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
  type TimelineEventKind,
  type TimelineEventSeverity,
} from "@/lib/cases/timeline";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Chronologia sprawy — Dlugomat",
  description: "Pelna oś zdarzeń, dokumentow i akcji w sprawie.",
};

const SEVERITY_TONE: Record<
  TimelineEventSeverity,
  "info" | "warning" | "neutral" | "success" | "danger"
> = {
  info: "info",
  success: "success",
  warning: "warning",
  error: "danger",
  critical: "danger",
};

function iconForKind(kind: TimelineEventKind) {
  switch (kind) {
    case "document_received":
    case "document_generated":
      return FileText;
    case "document_sent":
      return Mail;
    case "deadline_set":
    case "deadline_due":
      return Clock;
    case "deadline_missed":
      return AlertTriangle;
    case "hearing_scheduled":
    case "hearing_held":
    case "ruling_received":
    case "appeal_filed":
    case "enforcement_started":
      return Gavel;
    case "settlement_reached":
    case "case_closed":
      return CheckCircle2;
    case "ai_generation":
      return FileText;
    case "case_created":
    case "user_note":
    default:
      return History;
  }
}

const fmtDate = (iso: string) =>
  new Intl.DateTimeFormat("pl-PL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));

const fmtTime = (iso: string) =>
  new Intl.DateTimeFormat("pl-PL", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));

export default async function CaseTimelinePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!id) return notFound();

  const sb = await createSupabaseServerClient();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) {
    redirect(`/logowanie?next=/panel/sprawy/${id}/chronologia`);
  }

  const events: TimelineEvent[] = await buildCaseTimeline({
    case_id: id,
    user_id: user.id,
    order: "desc",
  }).catch(() => []);

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-8">
        <Link
          href={`/panel/sprawy/${id}`}
          className="text-sm text-slate-600 hover:text-slate-900"
        >
          ← Szczegoly sprawy
        </Link>
        <h1 className="mt-3 font-display text-3xl text-slate-900">
          Chronologia sprawy
        </h1>
        <p className="mt-2 text-slate-600">
          {events.length} zdarzeń w sprawie {id}
        </p>
      </div>

      <Card elevation="subtle">
        <CardHeader>
          <CardTitle>Oś zdarzeń</CardTitle>
          <CardDescription>Od najnowszych do najstarszych</CardDescription>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <EmptyState
              icon={<Bell className="h-5 w-5" />}
              title="Brak zdarzeń w tej sprawie"
              description="Zdarzenia pojawią się automatycznie po dodaniu dokumentów, terminów lub wysłaniu powiadomień."
            />
          ) : (
            <ol className="relative space-y-6 border-l border-slate-200 pl-6">
              {events.map((event) => {
                const Icon = iconForKind(event.kind);
                return (
                  <li key={event.id} className="relative">
                    <span
                      aria-hidden="true"
                      className="absolute -left-[33px] flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white"
                    >
                      <Icon className="h-3 w-3 text-slate-500" />
                    </span>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge tone={SEVERITY_TONE[event.severity]} withDot>
                            {event.kind.replace(/_/g, " ")}
                          </Badge>
                        </div>
                        <p className="mt-2 font-medium text-slate-900">
                          {event.title}
                        </p>
                        {event.description ? (
                          <p className="mt-1 text-sm text-slate-600">
                            {event.description}
                          </p>
                        ) : null}
                        <p className="mt-2 text-xs text-slate-500">
                          Źródło: {event.source}
                        </p>
                      </div>
                      <div className="shrink-0 text-right text-sm">
                        <p className="inline-flex items-center gap-1 text-slate-700">
                          <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
                          {fmtDate(event.occurred_at)}
                        </p>
                        <p className="mt-1 inline-flex items-center gap-1 text-xs text-slate-500">
                          <Clock className="h-3 w-3" />
                          {fmtTime(event.occurred_at)}
                        </p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
