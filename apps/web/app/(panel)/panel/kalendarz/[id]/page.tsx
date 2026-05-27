import * as React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  MapPin,
  Users,
  FileText,
  Bell,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Szczegoly wydarzenia - Dlugomat",
  description: "Pelne informacje o wydarzeniu w kalendarzu sprawy: termin, miejsce, uczestnicy, dokumenty.",
};

type EventKind = "rozprawa" | "termin" | "splata" | "spotkanie" | "deadline";

type CalendarEvent = {
  id: string;
  kind: EventKind;
  title: string;
  description: string;
  caseRef: string;
  start: string;
  end: string;
  location: string;
  participants: { name: string; role: string }[];
  documents: { id: string; name: string }[];
  reminders: { offsetMinutes: number; channel: "email" | "sms" | "push" }[];
  urgency: "low" | "medium" | "high";
  notes: string;
};

const EVENTS: Record<string, CalendarEvent> = {
  "ev-001": {
    id: "ev-001",
    kind: "rozprawa",
    title: "Rozprawa w sprawie I C 234/26",
    description:
      "Pierwsza rozprawa w sprawie o zaplate przeciwko Provident Polska. Stawiennictwo obowiazkowe, przygotuj komplet dokumentow.",
    caseRef: "I C 234/26",
    start: "2026-05-22T10:30:00",
    end: "2026-05-22T12:00:00",
    location: "Sad Rejonowy dla Warszawy-Mokotowa, sala 218, ul. Ogrodowa 51A",
    participants: [
      { name: "mec. Anna Kowalska", role: "Pelnomocnik" },
      { name: "Marek Nowak", role: "Strona pozwana (Ty)" },
      { name: "Pawel Zielinski", role: "Pelnomocnik powoda" },
    ],
    documents: [
      { id: "doc-101", name: "Pozew o zaplate.pdf" },
      { id: "doc-102", name: "Odpowiedz na pozew.pdf" },
      { id: "doc-103", name: "Wnioski dowodowe.pdf" },
    ],
    reminders: [
      { offsetMinutes: 1440, channel: "email" },
      { offsetMinutes: 120, channel: "sms" },
      { offsetMinutes: 30, channel: "push" },
    ],
    urgency: "high",
    notes:
      "Zabierz dowod osobisty oraz oryginaly umow. Stawiennictwo obowiazkowe pod rygorem skutkow prawnych okreslonych w art. 339 KPC.",
  },
};

const KIND_LABEL: Record<EventKind, string> = {
  rozprawa: "Rozprawa",
  termin: "Termin sadowy",
  splata: "Termin splaty",
  spotkanie: "Spotkanie",
  deadline: "Termin zawity",
};

const KIND_TONE: Record<EventKind, "info" | "warning" | "danger" | "success" | "neutral"> = {
  rozprawa: "warning",
  termin: "info",
  splata: "success",
  spotkanie: "neutral",
  deadline: "danger",
};

const URGENCY_CARD: Record<CalendarEvent["urgency"], "warning" | "critical" | "normal"> = {
  low: "normal",
  medium: "warning",
  high: "critical",
};

const CHANNEL_LABEL = {
  email: "Email",
  sms: "SMS",
  push: "Powiadomienie push",
};

type Params = Promise<{ id: string }>;

export default async function SzczegolyWydarzeniaPage({ params }: { params: Params }) {
  const { id } = await params;
  const event = EVENTS[id] ?? EVENTS["ev-001"];
  if (!event) notFound();

  const startDate = new Date(event.start);
  const endDate = new Date(event.end);
  const dateFmt = new Intl.DateTimeFormat("pl-PL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const timeFmt = new Intl.DateTimeFormat("pl-PL", { hour: "2-digit", minute: "2-digit" });

  const formatOffset = (mins: number) => {
    if (mins >= 1440) return `${Math.round(mins / 1440)} dni przed`;
    if (mins >= 60) return `${Math.round(mins / 60)}h przed`;
    return `${mins} min przed`;
  };

  return (
    <div className="min-h-screen bg-dlugomat-50">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            href="/panel/kalendarz"
            className="inline-flex items-center gap-2 text-sm text-dlugomat-700 hover:text-dlugomat-900 focus-visible:shadow-shield-focus rounded-md"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Powrot do kalendarza
          </Link>
        </div>

        <header className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <CalendarDays className="h-6 w-6 text-accent-600" aria-hidden />
            <Badge tone={KIND_TONE[event.kind]}>{KIND_LABEL[event.kind]}</Badge>
            <Badge tone="neutral">Sprawa {event.caseRef}</Badge>
          </div>
          <h1 className="font-display text-3xl text-dlugomat-950 mb-2">{event.title}</h1>
          <p className="text-dlugomat-700 max-w-2xl">{event.description}</p>
        </header>

        {event.urgency === "high" && (
          <Card urgency={URGENCY_CARD[event.urgency]} className="mb-6">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <AlertTriangle className="h-5 w-5 text-danger shrink-0 mt-0.5" aria-hidden />
                <div>
                  <p className="font-medium text-dlugomat-950 mb-1">Wydarzenie krytyczne</p>
                  <p className="text-sm text-dlugomat-800">{event.notes}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-xs uppercase tracking-wide text-dlugomat-600 mb-2 flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5" aria-hidden />
                Data
              </div>
              <div className="font-display text-xl text-dlugomat-950 capitalize">
                {dateFmt.format(startDate)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-xs uppercase tracking-wide text-dlugomat-600 mb-2 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" aria-hidden />
                Godziny
              </div>
              <div className="font-display text-xl text-dlugomat-950">
                {timeFmt.format(startDate)} - {timeFmt.format(endDate)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-xs uppercase tracking-wide text-dlugomat-600 mb-2 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" aria-hidden />
                Miejsce
              </div>
              <div className="text-sm text-dlugomat-950 leading-snug">{event.location}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-accent-600" aria-hidden />
                  Uczestnicy
                </CardTitle>
                <CardDescription>{event.participants.length} osob</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {event.participants.map((p) => (
                    <li
                      key={p.name}
                      className="flex items-center justify-between gap-3 p-3 rounded-md border border-ink-200 bg-white"
                    >
                      <div>
                        <div className="font-medium text-dlugomat-950 text-sm">{p.name}</div>
                        <div className="text-xs text-dlugomat-600">{p.role}</div>
                      </div>
                      <Badge tone="neutral">{p.role.split(" ")[0]}</Badge>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-accent-600" aria-hidden />
                  Powiazane dokumenty
                </CardTitle>
                <CardDescription>{event.documents.length} dokumentow do przygotowania</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {event.documents.map((doc) => (
                    <li key={doc.id}>
                      <Link
                        href={`/panel/dokumenty/${doc.id}`}
                        className="flex items-center justify-between gap-3 p-3 rounded-md border border-ink-200 bg-white hover:bg-dlugomat-50 focus-visible:shadow-shield-focus"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="h-4 w-4 text-dlugomat-600" aria-hidden />
                          <span className="text-sm text-dlugomat-900">{doc.name}</span>
                        </div>
                        <span className="text-xs text-accent-700">Otworz</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          <aside className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Bell className="h-4 w-4 text-accent-600" aria-hidden />
                  Przypomnienia
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {event.reminders.map((r, idx) => (
                    <li key={idx} className="flex items-center justify-between">
                      <span className="text-dlugomat-800">{formatOffset(r.offsetMinutes)}</span>
                      <Badge tone="info">{CHANNEL_LABEL[r.channel]}</Badge>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 space-y-2">
                <Button variant="primary" block>
                  Dodaj do kalendarza
                </Button>
                <Button variant="secondary" block>
                  Wyslij na email
                </Button>
                <Button variant="ghost" block>
                  Edytuj przypomnienia
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" aria-hidden />
                  <p className="text-sm text-dlugomat-800">
                    Synchronizacja z Google/Outlook aktywna. Wydarzenie pojawi sie automatycznie w Twoim kalendarzu.
                  </p>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}
