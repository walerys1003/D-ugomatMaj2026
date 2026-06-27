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
import { EmptyState } from "@/components/ui/empty-state";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";
import { redirect } from "next/navigation";
import {
  getAccountActivity,
  type ActivityEvent,
} from "@/lib/activity/activity-repository";

export const metadata: Metadata = {
  title: "Aktywność konta — Długomat",
  description: "Pełna historia zdarzeń w Twoim koncie: logowania, dokumenty, zmiany.",
};

export const dynamic = "force-dynamic";

const TYPE_ICON = {
  login: LogIn,
  logout: LogOut,
  doc_upload: Upload,
  case_update: FileText,
  settings_changed: Settings,
  ai_query: MessageSquare,
  password_changed: Key,
  mfa_enabled: Shield,
  other: FileText,
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
  other: "Zdarzenie",
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

export default async function AktywnoscPage() {
  const supabase = createSupabaseServerClient();
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) redirect("/logowanie?next=/panel/aktywnosc");

  const EVENTS = await getAccountActivity(90);
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
          {EVENTS.length === 0 ? (
            <EmptyState
              title="Brak zarejestrowanych zdarzeń"
              description="Gdy zaczniesz korzystać z konta, pojawi się tu historia logowań i działań."
            />
          ) : (
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
