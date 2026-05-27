import type { Metadata } from "next";
import {
  FileText,
  Key,
  LogIn,
  LogOut,
  MessageSquare,
  Settings,
  Shield,
  Upload,
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
  title: "Aktywność konta — Długomat",
  description: "Pełna historia zdarzeń w Twoim koncie: logowania, dokumenty, zmiany.",
};

interface ActivityEvent {
  id: string;
  ts: string;
  type:
    | "login"
    | "logout"
    | "doc_upload"
    | "case_update"
    | "settings_changed"
    | "ai_query"
    | "password_changed"
    | "mfa_enabled";
  description: string;
  ip?: string;
  device?: string;
  risk: "low" | "normal" | "elevated";
}

const EVENTS: ActivityEvent[] = [
  {
    id: "ev_001",
    ts: "2026-05-11T08:14:00Z",
    type: "login",
    description: "Logowanie z weryfikacją MFA",
    ip: "89.64.21.12",
    device: "Chrome 124 / Windows 11",
    risk: "low",
  },
  {
    id: "ev_002",
    ts: "2026-05-10T22:08:00Z",
    type: "doc_upload",
    description: "Dodano dokument: raport_BIK_2026-05.pdf (2.4 MB)",
    risk: "low",
  },
  {
    id: "ev_003",
    ts: "2026-05-10T19:42:00Z",
    type: "ai_query",
    description: 'Zapytanie do AI asystenta: "Wniosek o korektę BIK"',
    risk: "low",
  },
  {
    id: "ev_004",
    ts: "2026-05-10T16:24:00Z",
    type: "case_update",
    description: 'Zmiana statusu sprawy case_004: "W trakcie" → "Oczekuje na odpowiedź"',
    risk: "low",
  },
  {
    id: "ev_005",
    ts: "2026-05-09T11:48:00Z",
    type: "settings_changed",
    description: "Zmiana preferencji powiadomień e-mail",
    risk: "normal",
  },
  {
    id: "ev_006",
    ts: "2026-05-08T22:14:00Z",
    type: "login",
    description: "Logowanie z nowego urządzenia (rozpoznano)",
    ip: "5.172.43.21",
    device: "Safari 17 / iOS 17.4",
    risk: "elevated",
  },
  {
    id: "ev_007",
    ts: "2026-05-07T09:32:00Z",
    type: "password_changed",
    description: "Zmiana hasła",
    ip: "89.64.21.12",
    risk: "normal",
  },
  {
    id: "ev_008",
    ts: "2026-05-04T14:18:00Z",
    type: "mfa_enabled",
    description: "Włączono uwierzytelnianie dwuskładnikowe (TOTP)",
    risk: "low",
  },
  {
    id: "ev_009",
    ts: "2026-05-03T11:08:00Z",
    type: "logout",
    description: "Wylogowanie (zamknięcie przeglądarki)",
    risk: "low",
  },
];

const TYPE_ICON = {
  login: LogIn,
  logout: LogOut,
  doc_upload: Upload,
  case_update: FileText,
  settings_changed: Settings,
  ai_query: MessageSquare,
  password_changed: Key,
  mfa_enabled: Shield,
} as const;

const TYPE_LABEL: Record<ActivityEvent["type"], string> = {
  login: "Logowanie",
  logout: "Wylogowanie",
  doc_upload: "Dokument",
  case_update: "Sprawa",
  settings_changed: "Ustawienia",
  ai_query: "AI asystent",
  password_changed: "Hasło",
  mfa_enabled: "MFA",
};

const RISK_TONE: Record<ActivityEvent["risk"], "success" | "info" | "warning"> = {
  low: "success",
  normal: "info",
  elevated: "warning",
};

function fmtDate(iso: string): string {
  return new Intl.DateTimeFormat("pl-PL", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

export default function AktywnoscPage() {
  const total = EVENTS.length;
  const elevated = EVENTS.filter((e) => e.risk === "elevated").length;
  const logins = EVENTS.filter((e) => e.type === "login").length;

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.18em] text-ink-500">
          Konto · aktywność
        </p>
        <h1 className="font-display text-fluid-h1 text-dlugomat-950">
          Historia aktywności
        </h1>
        <p className="max-w-2xl text-ink-600">
          Wszystkie zdarzenia w Twoim koncie z ostatnich 90 dni. Jeśli widzisz
          aktywność, której nie rozpoznajesz — natychmiast zmień hasło.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-3" aria-label="Statystyki aktywności">
        <Card>
          <CardHeader>
            <CardDescription>Zdarzeń (90 dni)</CardDescription>
            <CardTitle className="font-display text-fluid-h2 text-dlugomat-950">
              {total}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Logowania</CardDescription>
            <CardTitle className="font-display text-fluid-h2 text-dlugomat-700">
              {logins}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card urgency={elevated > 0 ? "warning" : "normal"}>
          <CardHeader>
            <CardDescription>Podwyższone ryzyko</CardDescription>
            <CardTitle className={`font-display text-fluid-h2 ${elevated > 0 ? "text-warn" : "text-accent-700"}`}>
              {elevated}
            </CardTitle>
          </CardHeader>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Wszystkie zdarzenia</CardTitle>
          <CardDescription>Sortowanie: czas malejąco</CardDescription>
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
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge tone="neutral">{TYPE_LABEL[ev.type]}</Badge>
                        <Badge tone={RISK_TONE[ev.risk]} withDot>
                          {ev.risk === "low" ? "niskie" : ev.risk === "normal" ? "normalne" : "podwyższone"}
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm text-dlugomat-900">{ev.description}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-ink-500">
                        <span>{fmtDate(ev.ts)}</span>
                        {ev.ip ? (
                          <>
                            <span aria-hidden>·</span>
                            <span className="font-mono">{ev.ip}</span>
                          </>
                        ) : null}
                        {ev.device ? (
                          <>
                            <span aria-hidden>·</span>
                            <span>{ev.device}</span>
                          </>
                        ) : null}
                      </div>
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
