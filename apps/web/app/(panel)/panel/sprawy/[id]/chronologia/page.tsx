import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  FileText,
  Gavel,
  Mail,
  Phone,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Chronologia sprawy — Dlugomat",
  description: "Pelna oś zdarzeń, dokumentow i akcji w sprawie.",
};

type TimelineEvent = {
  id: string;
  date: string;
  type: "doc" | "call" | "court" | "letter" | "milestone";
  title: string;
  description: string;
  actor: string;
  status: "done" | "pending" | "missed";
};

const EVENTS: TimelineEvent[] = [
  {
    id: "e-1",
    date: "2026-04-21",
    type: "letter",
    title: "Doreczenie nakazu zaplaty",
    description: "Sad Rejonowy dla Warszawy-Mokotowa, sygn. I Nc 4521/26.",
    actor: "Sad Rejonowy",
    status: "done",
  },
  {
    id: "e-2",
    date: "2026-04-22",
    type: "doc",
    title: "Skanowanie nakazu przez kandydata",
    description: "Dokument zaladowany do akt sprawy, OCR potwierdzony.",
    actor: "Kandydat",
    status: "done",
  },
  {
    id: "e-3",
    date: "2026-04-23",
    type: "milestone",
    title: "Analiza AI zakonczona",
    description: "Wykryto 3 ryzyka i 2 sciezki obrony. Sila pozwu: 68%.",
    actor: "System",
    status: "done",
  },
  {
    id: "e-4",
    date: "2026-04-28",
    type: "call",
    title: "Konsultacja z prawnikiem",
    description: "Mecenas Kowalska — rekomendacja: sprzeciw z zarzutem przedawnienia.",
    actor: "Anna Kowalska",
    status: "done",
  },
  {
    id: "e-5",
    date: "2026-05-19",
    type: "court",
    title: "Termin zlozenia sprzeciwu",
    description: "Ostateczny termin 14 dni od doreczenia (z uwzglednieniem dni wolnych).",
    actor: "Termin sadowy",
    status: "pending",
  },
];

const TYPE_LABEL: Record<TimelineEvent["type"], string> = {
  doc: "Dokument",
  call: "Konsultacja",
  court: "Termin sadowy",
  letter: "Pismo",
  milestone: "Kamień milowy",
};

const TYPE_TONE: Record<
  TimelineEvent["type"],
  "info" | "warning" | "neutral" | "success"
> = {
  doc: "neutral",
  call: "info",
  court: "warning",
  letter: "neutral",
  milestone: "success",
};

const STATUS_TONE: Record<
  TimelineEvent["status"],
  "success" | "warning" | "danger"
> = {
  done: "success",
  pending: "warning",
  missed: "danger",
};

const STATUS_LABEL: Record<TimelineEvent["status"], string> = {
  done: "Zakonczone",
  pending: "Oczekuje",
  missed: "Niedotrzymany",
};

function iconForType(type: TimelineEvent["type"]) {
  switch (type) {
    case "doc":
      return FileText;
    case "call":
      return Phone;
    case "court":
      return Gavel;
    case "letter":
      return Mail;
    case "milestone":
      return CheckCircle2;
  }
}

const fmtDate = (iso: string) =>
  new Intl.DateTimeFormat("pl-PL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));

export default async function CaseTimelinePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!id) return notFound();

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
          {EVENTS.length} zdarzeń w sprawie {id.toUpperCase()}
        </p>
      </div>

      <Card elevation="subtle">
        <CardHeader>
          <CardTitle>Oś zdarzeń</CardTitle>
          <CardDescription>Od najnowszych do najstarszych</CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="relative space-y-6 border-l border-slate-200 pl-6">
            {[...EVENTS].reverse().map((event) => {
              const Icon = iconForType(event.type);
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
                        <Badge tone={TYPE_TONE[event.type]}>
                          {TYPE_LABEL[event.type]}
                        </Badge>
                        <Badge tone={STATUS_TONE[event.status]} withDot>
                          {STATUS_LABEL[event.status]}
                        </Badge>
                      </div>
                      <p className="mt-2 font-medium text-slate-900">
                        {event.title}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        {event.description}
                      </p>
                      <p className="mt-2 text-xs text-slate-500">
                        {event.actor}
                      </p>
                    </div>
                    <div className="shrink-0 text-right text-sm">
                      <p className="inline-flex items-center gap-1 text-slate-700">
                        <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
                        {fmtDate(event.date)}
                      </p>
                      <p className="mt-1 inline-flex items-center gap-1 text-xs text-slate-500">
                        <Clock className="h-3 w-3" />
                        {new Date(event.date).toLocaleDateString("pl-PL")}
                      </p>
                    </div>
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
