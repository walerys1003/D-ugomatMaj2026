import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock, FileText, Paperclip, Send, User } from "lucide-react";
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
  title: "Zgloszenie wsparcia — Dlugomat",
  description: "Watek zgloszenia z historia odpowiedzi i SLA.",
};

type Ticket = {
  id: string;
  subject: string;
  category: "case" | "tech" | "billing" | "lawyer";
  priority: "low" | "normal" | "high" | "urgent";
  status: "open" | "waiting" | "resolved";
  createdAt: string;
  sla: string;
  case?: string;
  assignee?: string;
};

type Message = {
  id: string;
  author: string;
  role: "client" | "support" | "lawyer" | "system";
  body: string;
  createdAt: string;
  attachments?: number;
};

const TICKETS: Record<string, Ticket> = {
  "tk-1042": {
    id: "tk-1042",
    subject: "Pytanie o termin sprzeciwu w sprawie I Nc 4521/26",
    category: "case",
    priority: "high",
    status: "waiting",
    createdAt: "2026-05-09T11:42:00",
    sla: "Odpowiedz do 4 godzin",
    case: "I Nc 4521/26",
    assignee: "Mecenas Kowalska",
  },
};

const MESSAGES: Message[] = [
  {
    id: "m-1",
    author: "Anna Nowak",
    role: "client",
    body:
      "Otrzymalam nakaz zaplaty 21 kwietnia. Czy 14-dniowy termin liczy sie od dnia doreczenia, czy od dnia nastepnego? Boje sie pomylic.",
    createdAt: "2026-05-09T11:42:00",
    attachments: 1,
  },
  {
    id: "m-2",
    author: "System",
    role: "system",
    body:
      "Zgloszenie przypisane do Mecenas Anny Kowalskiej. Sredni czas odpowiedzi w tej kategorii: 47 minut.",
    createdAt: "2026-05-09T11:43:00",
  },
  {
    id: "m-3",
    author: "Mecenas Anna Kowalska",
    role: "lawyer",
    body:
      "Termin 14-dniowy liczy sie od dnia nastepujacego po doreczeniu (zgodnie z art. 165 k.p.c.). W Pani przypadku doreczenie nastapilo 21.04.2026, wiec termin uplywa 5.05.2026. Sprawdzam czy nie ma dni wolnych.",
    createdAt: "2026-05-09T12:18:00",
  },
  {
    id: "m-4",
    author: "Mecenas Anna Kowalska",
    role: "lawyer",
    body:
      "Po sprawdzeniu kalendarza: 3 maja to dzien ustawowo wolny od pracy, ale termin nie wypada na ten dzien. Ostateczny termin to 5.05.2026 do polnocy. Polecam zlozyc sprzeciw najpozniej 4.05.2026. Mam zainicjowac generowanie szkicu?",
    createdAt: "2026-05-09T12:24:00",
    attachments: 0,
  },
];

const STATUS_TONE: Record<Ticket["status"], "info" | "warning" | "success"> = {
  open: "info",
  waiting: "warning",
  resolved: "success",
};

const STATUS_LABEL: Record<Ticket["status"], string> = {
  open: "Otwarte",
  waiting: "Oczekuje na odpowiedz",
  resolved: "Rozwiazane",
};

const PRIORITY_TONE: Record<
  Ticket["priority"],
  "neutral" | "info" | "warning" | "danger"
> = {
  low: "neutral",
  normal: "info",
  high: "warning",
  urgent: "danger",
};

const PRIORITY_LABEL: Record<Ticket["priority"], string> = {
  low: "Niska",
  normal: "Normalna",
  high: "Wysoka",
  urgent: "Pilna",
};

const ROLE_LABEL: Record<Message["role"], string> = {
  client: "Klient",
  support: "Wsparcie",
  lawyer: "Prawnik",
  system: "System",
};

const ROLE_TONE: Record<
  Message["role"],
  "neutral" | "info" | "success"
> = {
  client: "neutral",
  support: "info",
  lawyer: "success",
  system: "neutral",
};

const fmtTime = (iso: string) =>
  new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));

async function loadTicket(id: string): Promise<Ticket | null> {
  return TICKETS[id] ?? TICKETS["tk-1042"] ?? null;
}

export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ticket = await loadTicket(id);
  if (!ticket) return notFound();

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-8">
        <Link
          href="/panel/wsparcie"
          className="text-sm text-slate-600 hover:text-slate-900"
        >
          ← Moje zgloszenia
        </Link>
        <div className="mt-3 flex items-start justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">#{ticket.id}</span>
              <Badge tone={STATUS_TONE[ticket.status]} withDot>
                {STATUS_LABEL[ticket.status]}
              </Badge>
              <Badge tone={PRIORITY_TONE[ticket.priority]}>
                {PRIORITY_LABEL[ticket.priority]}
              </Badge>
            </div>
            <h1 className="mt-2 font-display text-2xl text-slate-900">
              {ticket.subject}
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Sprawa: {ticket.case ?? "—"} · Przypisane: {ticket.assignee ?? "—"}
            </p>
          </div>
          <div className="shrink-0 text-right text-sm">
            <p className="inline-flex items-center gap-1 text-slate-700">
              <Clock className="h-3.5 w-3.5 text-slate-400" />
              {ticket.sla}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Utworzono {fmtTime(ticket.createdAt)}
            </p>
          </div>
        </div>
      </div>

      <Card elevation="subtle" className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Konwersacja</CardTitle>
          <CardDescription>{MESSAGES.length} wiadomosci</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {MESSAGES.map((msg) => (
            <article
              key={msg.id}
              className="rounded-lg border border-slate-200 bg-white p-4"
            >
              <header className="mb-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100">
                    <User className="h-3.5 w-3.5 text-slate-500" />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {msg.author}
                    </p>
                    <Badge tone={ROLE_TONE[msg.role]}>
                      {ROLE_LABEL[msg.role]}
                    </Badge>
                  </div>
                </div>
                <p className="text-xs text-slate-500">{fmtTime(msg.createdAt)}</p>
              </header>
              <p className="text-sm leading-relaxed text-slate-700">
                {msg.body}
              </p>
              {msg.attachments && msg.attachments > 0 ? (
                <p className="mt-3 inline-flex items-center gap-1 text-xs text-slate-500">
                  <Paperclip className="h-3 w-3" />
                  {msg.attachments} zalacznik(i)
                </p>
              ) : null}
            </article>
          ))}
        </CardContent>
      </Card>

      <Card elevation="subtle">
        <CardHeader>
          <CardTitle className="text-base">Odpowiedz</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <textarea
              rows={5}
              placeholder="Napisz odpowiedz..."
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:shadow-shield-focus"
            />
            <div className="flex items-center justify-between gap-3">
              <Button variant="ghost" size="sm" type="button">
                <Paperclip className="mr-1 h-4 w-4" />
                Dodaj zalacznik
              </Button>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" type="button">
                  <FileText className="mr-1 h-4 w-4" />
                  Wstaw szablon
                </Button>
                <Button variant="primary" size="sm" type="submit">
                  <Send className="mr-1 h-4 w-4" />
                  Wyslij
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
