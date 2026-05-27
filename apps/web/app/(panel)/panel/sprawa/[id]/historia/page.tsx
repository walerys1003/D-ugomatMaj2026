import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  FileText,
  Mail,
  MessageSquare,
  Phone,
  Upload,
  UserCheck,
} from "lucide-react";

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
  title: "Historia sprawy — Długomat",
  description: "Pełna chronologia zdarzeń, korespondencji i dokumentów dla wybranej sprawy.",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

interface HistoryEvent {
  id: string;
  ts: string;
  type:
    | "case_created"
    | "status_changed"
    | "doc_uploaded"
    | "doc_generated"
    | "email_sent"
    | "email_received"
    | "phone_call"
    | "deadline_set"
    | "deadline_met"
    | "lawyer_assigned"
    | "payment_received";
  actor: string;
  title: string;
  detail?: string;
  meta?: Record<string, string>;
}

const EVENTS: HistoryEvent[] = [
  {
    id: "h_021",
    ts: "2026-05-10T16:24:00Z",
    type: "status_changed",
    actor: "Anna Sieradzka (kancelaria)",
    title: "Status: W trakcie → Oczekuje na odpowiedź banku",
    detail: "Bank ma 30 dni na ustosunkowanie się do wniosku.",
  },
  {
    id: "h_020",
    ts: "2026-05-10T15:42:00Z",
    type: "email_sent",
    actor: "System",
    title: "Wysłano wniosek o korektę BIK do mBank",
    detail: "Adresat: reklamacje@mbank.pl",
    meta: { załącznik: "wniosek_BIK_2026-05-10.pdf" },
  },
  {
    id: "h_019",
    ts: "2026-05-10T15:38:00Z",
    type: "doc_generated",
    actor: "AI asystent",
    title: "Wygenerowano wniosek o korektę BIK",
    detail: "Szablon: art. 105a Prawa bankowego",
  },
  {
    id: "h_018",
    ts: "2026-05-09T11:18:00Z",
    type: "doc_uploaded",
    actor: "Anna Kowalska (Ty)",
    title: "Dodano dokument: raport_BIK_2026-05.pdf",
    meta: { rozmiar: "2.4 MB", strony: "8" },
  },
  {
    id: "h_017",
    ts: "2026-05-08T14:02:00Z",
    type: "deadline_set",
    actor: "Anna Sieradzka (kancelaria)",
    title: "Ustawiono deadline: odpowiedź na pismo banku",
    detail: "Termin: 2026-06-10 (30 dni od wysłania).",
  },
  {
    id: "h_016",
    ts: "2026-05-07T10:14:00Z",
    type: "phone_call",
    actor: "Anna Sieradzka (kancelaria)",
    title: "Rozmowa telefoniczna z klientką",
    detail: "Ustalenie strategii — wniosek BIK + ewentualne pismo do Rzecznika.",
    meta: { czas: "22 min" },
  },
  {
    id: "h_015",
    ts: "2026-05-04T09:48:00Z",
    type: "lawyer_assigned",
    actor: "System (auto-przypisanie)",
    title: "Przypisano prawnika: Anna Sieradzka",
    detail: "Specjalizacja: prawo bankowe, BIK/KRD.",
  },
  {
    id: "h_014",
    ts: "2026-05-04T09:42:00Z",
    type: "payment_received",
    actor: "System (Stripe)",
    title: "Płatność zaksięgowana: 399,00 PLN",
    meta: { faktura: "FV/2026/05/0142", metoda: "Visa •••• 4242" },
  },
  {
    id: "h_013",
    ts: "2026-05-04T09:18:00Z",
    type: "case_created",
    actor: "Anna Kowalska (Ty)",
    title: "Sprawa utworzona",
    detail: "Typ: Korekta BIK · Bank: mBank · Kwota sporna: 12 400 PLN",
  },
];

const TYPE_ICON = {
  case_created: FileText,
  status_changed: UserCheck,
  doc_uploaded: Upload,
  doc_generated: FileText,
  email_sent: Mail,
  email_received: Mail,
  phone_call: Phone,
  deadline_set: MessageSquare,
  deadline_met: UserCheck,
  lawyer_assigned: UserCheck,
  payment_received: FileText,
} as const;

const TYPE_TONE: Record<HistoryEvent["type"], "info" | "success" | "warning" | "neutral"> = {
  case_created: "info",
  status_changed: "warning",
  doc_uploaded: "info",
  doc_generated: "success",
  email_sent: "info",
  email_received: "info",
  phone_call: "neutral",
  deadline_set: "warning",
  deadline_met: "success",
  lawyer_assigned: "success",
  payment_received: "success",
};

const TYPE_LABEL: Record<HistoryEvent["type"], string> = {
  case_created: "Utworzono",
  status_changed: "Status",
  doc_uploaded: "Dokument",
  doc_generated: "Wygenerowano",
  email_sent: "E-mail wysłany",
  email_received: "E-mail odebrany",
  phone_call: "Rozmowa",
  deadline_set: "Deadline",
  deadline_met: "Deadline OK",
  lawyer_assigned: "Przypisanie",
  payment_received: "Płatność",
};

function fmtDate(iso: string): string {
  return new Intl.DateTimeFormat("pl-PL", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

export default async function SprawaHistoriaPage({ params }: PageProps) {
  const { id } = await params;

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
            Każde zdarzenie jest niezmienne i podpisane kryptograficznie.
            Historia stanowi dowód w razie sporu.
          </p>
        </div>
        <Button variant="secondary">
          <Download className="mr-2 h-4 w-4" aria-hidden />
          Eksportuj do PDF
        </Button>
      </header>

      <section className="grid gap-4 sm:grid-cols-4" aria-label="Podsumowanie">
        <Card>
          <CardHeader>
            <CardDescription>Zdarzeń łącznie</CardDescription>
            <CardTitle className="font-display text-fluid-h2 text-dlugomat-950">
              {EVENTS.length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Dokumentów</CardDescription>
            <CardTitle className="font-display text-fluid-h2 text-dlugomat-950">
              {EVENTS.filter((e) => e.type === "doc_uploaded" || e.type === "doc_generated").length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Korespondencja</CardDescription>
            <CardTitle className="font-display text-fluid-h2 text-dlugomat-950">
              {EVENTS.filter((e) => e.type === "email_sent" || e.type === "email_received" || e.type === "phone_call").length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Czas trwania</CardDescription>
            <CardTitle className="font-display text-fluid-h4 text-dlugomat-950">
              7 dni
            </CardTitle>
          </CardHeader>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Pełna chronologia</CardTitle>
          <CardDescription>Sortowanie: czas malejąco (najnowsze na górze)</CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="relative border-l border-ink-200 pl-6 space-y-5">
            {EVENTS.map((ev) => {
              const Icon = TYPE_ICON[ev.type];
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
                      <Badge tone={TYPE_TONE[ev.type]} withDot>
                        {TYPE_LABEL[ev.type]}
                      </Badge>
                      <span className="text-xs text-ink-500">{fmtDate(ev.ts)}</span>
                      <span aria-hidden className="text-ink-400">·</span>
                      <span className="text-xs text-ink-600">{ev.actor}</span>
                    </div>
                    <p className="text-sm font-medium text-dlugomat-900">{ev.title}</p>
                    {ev.detail ? (
                      <p className="text-sm text-ink-600">{ev.detail}</p>
                    ) : null}
                    {ev.meta ? (
                      <dl className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-ink-500">
                        {Object.entries(ev.meta).map(([k, v]) => (
                          <div key={k} className="inline-flex items-center gap-1">
                            <dt className="uppercase tracking-wide">{k}:</dt>
                            <dd className="text-ink-700">{v}</dd>
                          </div>
                        ))}
                      </dl>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
