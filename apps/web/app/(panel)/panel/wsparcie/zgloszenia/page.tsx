import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock, MessageCircle, Plus } from "lucide-react";

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
  title: "Moje zgłoszenia — Wsparcie",
  description: "Lista wszystkich Twoich zgłoszeń do działu wsparcia Długomat.",
};

interface Ticket {
  id: string;
  subject: string;
  category: "Konto" | "Płatności" | "Sprawa" | "Techniczne" | "RODO";
  status: "open" | "in_progress" | "waiting" | "resolved" | "closed";
  priority: "low" | "normal" | "high";
  created_at: string;
  last_response_at: string;
  agent?: string;
  unread: number;
}

const TICKETS: Ticket[] = [
  {
    id: "TIC-2026-0142",
    subject: "Nie mogę dodać dokumentu PDF większego niż 10MB",
    category: "Techniczne",
    status: "in_progress",
    priority: "normal",
    created_at: "2026-05-09T11:18:00Z",
    last_response_at: "2026-05-10T15:42:00Z",
    agent: "Karolina (zespół techniczny)",
    unread: 1,
  },
  {
    id: "TIC-2026-0138",
    subject: "Pytanie o fakturę za maj — brak NIP",
    category: "Płatności",
    status: "waiting",
    priority: "normal",
    created_at: "2026-05-07T09:24:00Z",
    last_response_at: "2026-05-08T13:11:00Z",
    agent: "Magda (księgowość)",
    unread: 0,
  },
  {
    id: "TIC-2026-0131",
    subject: "Eksport danych RODO — kiedy otrzymam plik?",
    category: "RODO",
    status: "resolved",
    priority: "high",
    created_at: "2026-05-02T16:08:00Z",
    last_response_at: "2026-05-04T10:22:00Z",
    agent: "Marcin (compliance)",
    unread: 0,
  },
  {
    id: "TIC-2026-0124",
    subject: "Zmiana adresu e-mail na koncie",
    category: "Konto",
    status: "closed",
    priority: "low",
    created_at: "2026-04-22T12:14:00Z",
    last_response_at: "2026-04-22T14:48:00Z",
    agent: "Bot Pomocnik",
    unread: 0,
  },
  {
    id: "TIC-2026-0118",
    subject: "Sprawa case_007 — status nie aktualizuje się",
    category: "Sprawa",
    status: "open",
    priority: "high",
    created_at: "2026-05-10T19:02:00Z",
    last_response_at: "2026-05-10T19:02:00Z",
    unread: 0,
  },
];

const STATUS_TONE: Record<Ticket["status"], "info" | "warning" | "danger" | "success" | "neutral"> = {
  open: "danger",
  in_progress: "warning",
  waiting: "info",
  resolved: "success",
  closed: "neutral",
};

const STATUS_LABEL: Record<Ticket["status"], string> = {
  open: "nowe",
  in_progress: "w trakcie",
  waiting: "czeka na Ciebie",
  resolved: "rozwiązane",
  closed: "zamknięte",
};

const PRIORITY_TONE: Record<Ticket["priority"], "info" | "warning" | "danger"> = {
  low: "info",
  normal: "warning",
  high: "danger",
};

function fmtDate(iso: string): string {
  return new Intl.DateTimeFormat("pl-PL", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(iso));
}

export default function WsparcieZgloszeniaPage() {
  const open = TICKETS.filter((t) => t.status === "open" || t.status === "in_progress").length;
  const waiting = TICKETS.filter((t) => t.status === "waiting").length;
  const resolved = TICKETS.filter((t) => t.status === "resolved" || t.status === "closed").length;

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.18em] text-iron-500">
            Wsparcie · moje zgłoszenia
          </p>
          <h1 className="font-display text-fluid-h1 text-dlugomat-950">
            Twoje zgłoszenia
          </h1>
          <p className="max-w-2xl text-iron-600">
            Wszystkie Twoje zgłoszenia do działu wsparcia. Średni czas pierwszej
            odpowiedzi to 2 godziny w dni robocze.
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" aria-hidden />
          Nowe zgłoszenie
        </Button>
      </header>

      <nav aria-label="Widoki wsparcia" className="flex gap-1 rounded-md border border-iron-200 bg-iron-50 p-1 w-fit text-sm">
        <Link
          href="/panel/wsparcie"
          className="rounded px-3 py-1.5 text-iron-700 hover:bg-white focus-visible:outline-none focus-visible:shadow-shield-focus"
        >
          Strona główna
        </Link>
        <span className="rounded bg-white px-3 py-1.5 font-semibold text-dlugomat-900 shadow-sm">
          Zgłoszenia
        </span>
        <Link
          href="/panel/wsparcie/baza-wiedzy"
          className="rounded px-3 py-1.5 text-iron-700 hover:bg-white focus-visible:outline-none focus-visible:shadow-shield-focus"
        >
          Baza wiedzy
        </Link>
      </nav>

      <section className="grid gap-4 sm:grid-cols-3" aria-label="Statystyki zgłoszeń">
        <Card urgency={open > 0 ? "warning" : "normal"}>
          <CardHeader>
            <CardDescription>Otwarte / w trakcie</CardDescription>
            <CardTitle className="font-display text-fluid-h2 text-warn">{open}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Czekają na Twoją odpowiedź</CardDescription>
            <CardTitle className="font-display text-fluid-h2 text-dlugomat-700">{waiting}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Rozwiązane / zamknięte</CardDescription>
            <CardTitle className="font-display text-fluid-h2 text-accent-700">{resolved}</CardTitle>
          </CardHeader>
        </Card>
      </section>

      <ul className="space-y-3" aria-label="Lista zgłoszeń">
        {TICKETS.map((t) => (
          <li key={t.id}>
            <Link
              href={`/panel/wsparcie/zgloszenia/${t.id}`}
              className="group block rounded-lg border border-iron-200 bg-white p-5 shadow-card transition hover:shadow-pop focus-visible:outline-none focus-visible:shadow-shield-focus"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs text-iron-500">{t.id}</span>
                    <Badge tone={STATUS_TONE[t.status]} withDot>
                      {STATUS_LABEL[t.status]}
                    </Badge>
                    <Badge tone={PRIORITY_TONE[t.priority]}>
                      priorytet: {t.priority}
                    </Badge>
                    <Badge tone="neutral">{t.category}</Badge>
                    {t.unread > 0 ? (
                      <Badge tone="danger" withDot>
                        {t.unread} nowa wiadomość
                      </Badge>
                    ) : null}
                  </div>
                  <h3 className="mt-2 font-semibold text-dlugomat-950 group-hover:text-dlugomat-700">
                    {t.subject}
                  </h3>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-iron-500">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" aria-hidden />
                      Utworzone: {fmtDate(t.created_at)}
                    </span>
                    <span aria-hidden>·</span>
                    <span>Ostatnia odpowiedź: {fmtDate(t.last_response_at)}</span>
                    {t.agent ? (
                      <>
                        <span aria-hidden>·</span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="h-3 w-3" aria-hidden />
                          {t.agent}
                        </span>
                      </>
                    ) : null}
                  </div>
                </div>
                <ArrowRight
                  className="h-5 w-5 flex-shrink-0 text-iron-400 group-hover:text-dlugomat-700"
                  aria-hidden
                />
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
