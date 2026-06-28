import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowLeft,
  Bell,
  FileText,
  Mail,
  Gavel,
  Clock,
  AlertTriangle,
  CheckCircle2,
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
  title: "Historia sprawy — Długomat",
  description:
    "Pełna chronologia zdarzeń, korespondencji i dokumentów dla wybranej sprawy.",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

const SEVERITY_TONE: Record<
  TimelineEventSeverity,
  "info" | "success" | "warning" | "neutral" | "danger"
> = {
  info: "info",
  success: "success",
  warning: "warning",
  error: "danger",
  critical: "danger",
};

const KIND_LABEL: Partial<Record<TimelineEventKind, string>> = {
  case_created: "Utworzono",
  document_received: "Dokument",
  document_generated: "Wygenerowano",
  document_sent: "Wysłano",
  deadline_set: "Termin",
  deadline_due: "Termin",
  deadline_missed: "Przekroczony",
  hearing_scheduled: "Rozprawa",
  hearing_held: "Rozprawa",
  ruling_received: "Orzeczenie",
  appeal_filed: "Środek zaskarżenia",
  enforcement_started: "Egzekucja",
  settlement_reached: "Ugoda",
  case_closed: "Zamknięto",
  ai_generation: "AI",
  user_note: "Notatka",
};

function iconForKind(kind: TimelineEventKind) {
  switch (kind) {
    case "document_received":
    case "document_generated":
    case "ai_generation":
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
    default:
      return History;
  }
}

function fmtDate(iso: string): string {
  return new Intl.DateTimeFormat("pl-PL", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

export default async function SprawaHistoriaPage({ params }: PageProps) {
  const { id } = await params;

  const sb = await createSupabaseServerClient();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) {
    redirect(`/sign-in?next=/panel/sprawa/${id}/historia`);
  }

  const events: TimelineEvent[] = await buildCaseTimeline({
    case_id: id,
    user_id: user.id,
    order: "desc",
  }).catch(() => []);

  const docsCount = events.filter(
    (e) =>
      e.kind === "document_received" ||
      e.kind === "document_generated" ||
      e.kind === "ai_generation",
  ).length;
  const corrCount = events.filter((e) => e.kind === "document_sent").length;

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

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.18em] text-ink-500">
            Sprawa · {id} · pełna historia
          </p>
          <h1 className="font-display text-fluid-h1 text-dlugomat-950">
            Historia zdarzeń
          </h1>
          <p className="max-w-2xl text-ink-600">
            Oś zdarzeń budowana automatycznie z dokumentów, terminów i
            powiadomień powiązanych ze sprawą.
          </p>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-3" aria-label="Podsumowanie">
        <Card>
          <CardHeader>
            <CardDescription>Zdarzeń łącznie</CardDescription>
            <CardTitle className="font-display text-fluid-h2 text-dlugomat-950">
              {events.length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Dokumentów</CardDescription>
            <CardTitle className="font-display text-fluid-h2 text-dlugomat-950">
              {docsCount}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Korespondencja</CardDescription>
            <CardTitle className="font-display text-fluid-h2 text-dlugomat-950">
              {corrCount}
            </CardTitle>
          </CardHeader>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Pełna chronologia</CardTitle>
          <CardDescription>
            Sortowanie: czas malejąco (najnowsze na górze)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <EmptyState
              icon={<Bell className="h-5 w-5" />}
              title="Brak zdarzeń w tej sprawie"
              description="Historia zacznie się wypełniać po dodaniu dokumentów, ustawieniu terminów lub wysłaniu pism."
            />
          ) : (
            <ol className="relative border-l border-ink-200 pl-6 space-y-5">
              {events.map((ev) => {
                const Icon = iconForKind(ev.kind);
                return (
                  <li key={ev.id} className="relative">
                    <span
                      className="absolute -left-[31px] mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full border border-ink-200 bg-white"
                      aria-hidden
                    >
                      <Icon className="h-3.5 w-3.5 text-dlugomat-700" />
                    </span>
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge tone={SEVERITY_TONE[ev.severity]} withDot>
                          {KIND_LABEL[ev.kind] ?? ev.kind.replace(/_/g, " ")}
                        </Badge>
                        <span className="text-xs text-ink-500">
                          {fmtDate(ev.occurred_at)}
                        </span>
                        <span aria-hidden className="text-ink-400">
                          ·
                        </span>
                        <span className="text-xs text-ink-600">{ev.source}</span>
                      </div>
                      <p className="text-sm font-medium text-dlugomat-900">
                        {ev.title}
                      </p>
                      {ev.description ? (
                        <p className="text-sm text-ink-600">{ev.description}</p>
                      ) : null}
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
