import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Bell, Mail, MessageSquare, Save, Send } from "lucide-react";

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
  title: "Szablon notyfikacji — Admin",
  robots: { index: false, follow: false },
};

interface PageProps {
  params: Promise<{ id: string }>;
}

interface Template {
  id: string;
  key: string;
  name: string;
  channel: "email" | "sms" | "push" | "in_app";
  category: "transactional" | "marketing" | "system";
  status: "active" | "draft" | "deprecated";
  subject: string;
  body: string;
  variables: string[];
  sent_30d: number;
  delivery_rate: number;
  open_rate: number;
  click_rate: number;
  updated_at: string;
}

const CHANNEL_LABEL: Record<Template["channel"], string> = {
  email: "E-mail",
  sms: "SMS",
  push: "Push",
  in_app: "In-app",
};

const CHANNEL_ICON = {
  email: Mail,
  sms: MessageSquare,
  push: Bell,
  in_app: Bell,
} as const;

const STATUS_TONE: Record<Template["status"], "success" | "info" | "neutral"> = {
  active: "success",
  draft: "info",
  deprecated: "neutral",
};

async function loadTemplate(id: string): Promise<Template> {
  return {
    id,
    key: "case.status_changed",
    name: "Zmiana statusu sprawy",
    channel: "email",
    category: "transactional",
    status: "active",
    subject: "Aktualizacja sprawy {{case_ref}}: {{new_status}}",
    body: `Cześć {{user_first_name}},

Status Twojej sprawy {{case_ref}} został zmieniony na "{{new_status}}".

Następne kroki:
{{next_steps}}

Szczegóły dostępne w panelu: {{case_url}}

Zespół Długomat`,
    variables: ["user_first_name", "case_ref", "new_status", "next_steps", "case_url"],
    sent_30d: 4827,
    delivery_rate: 99.6,
    open_rate: 64.2,
    click_rate: 28.7,
    updated_at: "2026-04-22T11:08:00Z",
  };
}

export default async function AdminNotificationTemplatePage({ params }: PageProps) {
  const { id } = await params;
  const t = await loadTemplate(id);
  const Icon = CHANNEL_ICON[t.channel];

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin/notyfikacje"
          className="inline-flex items-center gap-2 text-sm text-iron-600 hover:text-dlugomat-900 focus-visible:outline-none focus-visible:shadow-shield-focus rounded"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Wróć do szablonów
        </Link>
      </div>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.18em] text-iron-500">
            Szablon · {t.key}
          </p>
          <h1 className="font-display text-fluid-h1 text-dlugomat-950">{t.name}</h1>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <Badge tone={STATUS_TONE[t.status]} withDot>
              {t.status === "active" ? "aktywny" : t.status === "draft" ? "szkic" : "wycofany"}
            </Badge>
            <Badge tone="info">
              <Icon className="mr-1 h-3 w-3" aria-hidden />
              {CHANNEL_LABEL[t.channel]}
            </Badge>
            <Badge tone="neutral">{t.category}</Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary">
            <Send className="mr-2 h-4 w-4" aria-hidden />
            Wyślij test
          </Button>
          <Button variant="success">
            <Save className="mr-2 h-4 w-4" aria-hidden />
            Zapisz
          </Button>
        </div>
      </header>

      <section className="grid gap-4 lg:grid-cols-4" aria-label="Statystyki dostarczalności">
        <KpiCard label="Wysłane (30d)" value={t.sent_30d.toLocaleString("pl-PL")} />
        <KpiCard label="Doręczalność" value={`${t.delivery_rate}%`} tone="success" />
        <KpiCard label="Otwarcia" value={`${t.open_rate}%`} />
        <KpiCard label="Kliknięcia" value={`${t.click_rate}%`} />
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Treść szablonu</CardTitle>
            <CardDescription>
              Wykorzystuj zmienne w nawiasach <code className="text-xs">{"{{name}}"}</code>.
              Wszystkie zmiany podlegają wersjonowaniu.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {t.channel === "email" ? (
              <Field label="Temat wiadomości">
                <input
                  type="text"
                  className="w-full rounded-md border border-iron-300 bg-white px-3 py-2 text-sm focus:border-dlugomat-700 focus-visible:outline-none focus-visible:shadow-shield-focus"
                  defaultValue={t.subject}
                />
              </Field>
            ) : null}
            <Field label="Treść">
              <textarea
                className="block w-full min-h-[320px] rounded-md border border-iron-300 bg-white px-3 py-2 font-mono text-sm focus:border-dlugomat-700 focus-visible:outline-none focus-visible:shadow-shield-focus"
                defaultValue={t.body}
              />
            </Field>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Dostępne zmienne</CardTitle>
              <CardDescription>Kliknij, aby skopiować</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="flex flex-wrap gap-2">
                {t.variables.map((v) => (
                  <li key={v}>
                    <code className="rounded bg-iron-100 px-2 py-1 text-xs text-dlugomat-900">
                      {"{{" + v + "}}"}
                    </code>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Konfiguracja</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <Field label="Kanał">
                <select className="w-full rounded-md border border-iron-300 bg-white px-3 py-2 focus:border-dlugomat-700 focus-visible:outline-none focus-visible:shadow-shield-focus" defaultValue={t.channel}>
                  <option value="email">E-mail</option>
                  <option value="sms">SMS</option>
                  <option value="push">Push</option>
                  <option value="in_app">In-app</option>
                </select>
              </Field>
              <Field label="Kategoria">
                <select className="w-full rounded-md border border-iron-300 bg-white px-3 py-2 focus:border-dlugomat-700 focus-visible:outline-none focus-visible:shadow-shield-focus" defaultValue={t.category}>
                  <option value="transactional">Transakcyjna</option>
                  <option value="marketing">Marketingowa</option>
                  <option value="system">Systemowa</option>
                </select>
              </Field>
              <Field label="Priorytet">
                <select className="w-full rounded-md border border-iron-300 bg-white px-3 py-2 focus:border-dlugomat-700 focus-visible:outline-none focus-visible:shadow-shield-focus" defaultValue="normal">
                  <option value="high">Wysoki</option>
                  <option value="normal">Normalny</option>
                  <option value="low">Niski</option>
                </select>
              </Field>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs uppercase tracking-wide text-iron-500">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

function KpiCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "success";
}) {
  return (
    <Card>
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle
          className={`font-display text-fluid-h3 ${
            tone === "success" ? "text-accent-700" : "text-dlugomat-950"
          }`}
        >
          {value}
        </CardTitle>
      </CardHeader>
    </Card>
  );
}
