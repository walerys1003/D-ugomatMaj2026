import * as React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Activity,
  Clock,
  MapPin,
  Monitor,
  Shield,
  AlertTriangle,
  CheckCircle2,
  FileText,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Szczegoly zdarzenia - aktywnosc - Dlugomat",
  description: "Pelne informacje o zdarzeniu w logu aktywnosci konta: kontekst, urzadzenie, lokalizacja.",
};

type ActivityKind =
  | "logowanie"
  | "wylogowanie"
  | "edycja"
  | "platnosc"
  | "pobranie"
  | "udostepnienie"
  | "zmiana_hasla"
  | "blokada";

type Severity = "info" | "ostrzezenie" | "krytyczne";

type ActivityEvent = {
  id: string;
  kind: ActivityKind;
  title: string;
  description: string;
  timestamp: string;
  ip: string;
  location: string;
  device: string;
  os: string;
  browser: string;
  severity: Severity;
  resource?: { id: string; label: string; href: string };
  context: { label: string; value: string }[];
};

const EVENTS: Record<string, ActivityEvent> = {
  "act-001": {
    id: "act-001",
    kind: "platnosc",
    title: "Zaplacono rate planu splaty",
    description:
      "Rata nr 4 z 12 zostala zaplacona kwota 843.79 PLN. Platnosc autoryzowana 3D-Secure, potwierdzenie wyslane na email.",
    timestamp: "2026-05-11T09:34:12",
    ip: "94.234.156.78",
    location: "Warszawa, Polska",
    device: "MacBook Pro",
    os: "macOS 14.4",
    browser: "Safari 17.4",
    severity: "info",
    resource: { id: "ps-001", label: "Plan splaty Provident", href: "/panel/plan-splaty/ps-001" },
    context: [
      { label: "Kwota", value: "843.79 PLN" },
      { label: "Metoda", value: "Karta Visa **** 4523" },
      { label: "ID transakcji", value: "TX-2026-05-11-9834" },
      { label: "Autoryzacja", value: "3D-Secure OK" },
    ],
  },
};

const KIND_LABEL: Record<ActivityKind, string> = {
  logowanie: "Logowanie",
  wylogowanie: "Wylogowanie",
  edycja: "Edycja danych",
  platnosc: "Platnosc",
  pobranie: "Pobranie pliku",
  udostepnienie: "Udostepnienie",
  zmiana_hasla: "Zmiana hasla",
  blokada: "Blokada konta",
};

const SEVERITY_TONE: Record<Severity, "info" | "warning" | "danger"> = {
  info: "info",
  ostrzezenie: "warning",
  krytyczne: "danger",
};

const SEVERITY_LABEL: Record<Severity, string> = {
  info: "Informacja",
  ostrzezenie: "Ostrzezenie",
  krytyczne: "Krytyczne",
};

const SEVERITY_ICON: Record<Severity, typeof CheckCircle2> = {
  info: CheckCircle2,
  ostrzezenie: AlertTriangle,
  krytyczne: AlertTriangle,
};

type Params = Promise<{ id: string }>;

export default async function SzczegolyAktywnosciPage({ params }: { params: Params }) {
  const { id } = await params;
  const event = EVENTS[id] ?? EVENTS["act-001"];
  if (!event) notFound();

  const dateTimeFmt = new Intl.DateTimeFormat("pl-PL", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const SeverityIcon = SEVERITY_ICON[event.severity];

  return (
    <div className="min-h-screen bg-dlugomat-50">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            href="/panel/aktywnosc"
            className="inline-flex items-center gap-2 text-sm text-dlugomat-700 hover:text-dlugomat-900 focus-visible:shadow-shield-focus rounded-md"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Powrot do dziennika aktywnosci
          </Link>
        </div>

        <header className="mb-8">
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            <Activity className="h-6 w-6 text-accent-600" aria-hidden />
            <Badge tone="neutral">{KIND_LABEL[event.kind]}</Badge>
            <Badge tone={SEVERITY_TONE[event.severity]} withDot>
              <SeverityIcon className="h-3 w-3 mr-1" aria-hidden />
              {SEVERITY_LABEL[event.severity]}
            </Badge>
          </div>
          <h1 className="font-display text-3xl text-dlugomat-950 mb-2">{event.title}</h1>
          <p className="text-dlugomat-700 max-w-2xl">{event.description}</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Kontekst zdarzenia</CardTitle>
                <CardDescription>Dane specyficzne dla tego typu akcji</CardDescription>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                  {event.context.map((c) => (
                    <div key={c.label}>
                      <dt className="text-xs uppercase tracking-wide text-dlugomat-600 mb-0.5">{c.label}</dt>
                      <dd className="text-sm font-medium text-dlugomat-950 break-all">{c.value}</dd>
                    </div>
                  ))}
                </dl>
              </CardContent>
            </Card>

            {event.resource && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="h-4 w-4 text-accent-600" aria-hidden />
                    Powiazany zasob
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Link
                    href={event.resource.href}
                    className="block p-3 rounded-md border border-accent-200 bg-accent-50 hover:bg-accent-100 focus-visible:shadow-shield-focus"
                  >
                    <div className="text-xs uppercase tracking-wide text-accent-700 mb-1">
                      Identyfikator: {event.resource.id}
                    </div>
                    <div className="text-sm text-dlugomat-950 font-medium">{event.resource.label}</div>
                  </Link>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="h-5 w-5 text-accent-600" aria-hidden />
                  Urzadzenie i przegladarka
                </CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-dlugomat-600 mb-0.5">Urzadzenie</dt>
                    <dd className="font-medium text-dlugomat-950">{event.device}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-dlugomat-600 mb-0.5">System</dt>
                    <dd className="font-medium text-dlugomat-950">{event.os}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-dlugomat-600 mb-0.5">Przegladarka</dt>
                    <dd className="font-medium text-dlugomat-950">{event.browser}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          </div>

          <aside className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="h-4 w-4 text-accent-600" aria-hidden />
                  Czas zdarzenia
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm font-medium text-dlugomat-950">
                  {dateTimeFmt.format(new Date(event.timestamp))}
                </div>
                <div className="text-xs text-dlugomat-600 mt-1">Strefa: Europe/Warsaw</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-accent-600" aria-hidden />
                  Lokalizacja
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>
                  <div className="text-xs uppercase tracking-wide text-dlugomat-600 mb-0.5">Adres IP</div>
                  <div className="font-mono text-dlugomat-950">{event.ip}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-dlugomat-600 mb-0.5">Geolokalizacja</div>
                  <div className="text-dlugomat-950">{event.location}</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="h-4 w-4 text-accent-600" aria-hidden />
                  Bezpieczenstwo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-dlugomat-800">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" aria-hidden />
                  <span>2FA potwierdzone</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" aria-hidden />
                  <span>Zaufane urzadzenie</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" aria-hidden />
                  <span>Polaczenie TLS 1.3</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 space-y-2">
                <Button variant="secondary" block>
                  Zglos podejrzenie
                </Button>
                <Button variant="ghost" block>
                  Eksportuj log
                </Button>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}
