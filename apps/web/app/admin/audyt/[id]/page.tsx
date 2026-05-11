import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Clock,
  Database,
  Globe,
  Shield,
  User,
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
  title: "Wpis audytowy — Admin Dlugomat",
  description: "Pelny widok zdarzenia audytowego: actor, zasob, payload.",
};

type AuditEntry = {
  id: string;
  action: string;
  category: "auth" | "data" | "config" | "billing" | "security";
  severity: "info" | "warning" | "critical";
  actor: { id: string; email: string; role: string };
  resource: { type: string; id: string; label: string };
  ip: string;
  userAgent: string;
  timestamp: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  context: Record<string, string>;
};

const ENTRIES: Record<string, AuditEntry> = {
  "au-9248": {
    id: "au-9248",
    action: "user.role.update",
    category: "security",
    severity: "warning",
    actor: {
      id: "usr-12",
      email: "marek.wojcik@dlugomat.pl",
      role: "admin",
    },
    resource: {
      type: "user",
      id: "usr-487",
      label: "anna.nowak@example.pl",
    },
    ip: "85.219.44.18",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4) Safari/17.4",
    timestamp: "2026-05-09T14:22:48",
    before: { role: "user", permissions: ["read"] },
    after: { role: "lawyer", permissions: ["read", "write", "review"] },
    context: {
      sessionId: "ses_8a4b2c",
      requestId: "req_d7f81e",
      reason: "Awans po szkoleniu",
    },
  },
};

const SEVERITY_TONE: Record<
  AuditEntry["severity"],
  "info" | "warning" | "danger"
> = {
  info: "info",
  warning: "warning",
  critical: "danger",
};

const SEVERITY_LABEL: Record<AuditEntry["severity"], string> = {
  info: "Info",
  warning: "Ostrzezenie",
  critical: "Krytyczne",
};

const CATEGORY_LABEL: Record<AuditEntry["category"], string> = {
  auth: "Autoryzacja",
  data: "Dane",
  config: "Konfiguracja",
  billing: "Rozliczenia",
  security: "Bezpieczenstwo",
};

const fmtTime = (iso: string) =>
  new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(iso));

async function loadEntry(id: string): Promise<AuditEntry | null> {
  return ENTRIES[id] ?? ENTRIES["au-9248"] ?? null;
}

export default async function AuditEntryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const entry = await loadEntry(id);
  if (!entry) return notFound();

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-8">
        <Link
          href="/admin/audyt"
          className="text-sm text-slate-600 hover:text-slate-900"
        >
          ← Audyt
        </Link>
        <div className="mt-3 flex items-start justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm text-slate-500">
                #{entry.id}
              </span>
              <Badge tone={SEVERITY_TONE[entry.severity]} withDot>
                {SEVERITY_LABEL[entry.severity]}
              </Badge>
              <Badge tone="neutral">{CATEGORY_LABEL[entry.category]}</Badge>
            </div>
            <h1 className="mt-2 font-display text-2xl text-slate-900">
              <span className="font-mono">{entry.action}</span>
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              {fmtTime(entry.timestamp)}
            </p>
          </div>
          <Button variant="secondary" size="sm">
            Eksport JSON
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card elevation="subtle">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="h-4 w-4 text-slate-500" />
              Actor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">Email</dt>
                <dd className="font-medium text-slate-900">{entry.actor.email}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">ID</dt>
                <dd className="font-mono text-xs text-slate-700">
                  {entry.actor.id}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">Rola</dt>
                <dd>
                  <Badge tone="info">{entry.actor.role}</Badge>
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card elevation="subtle">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Database className="h-4 w-4 text-slate-500" />
              Zasob
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">Typ</dt>
                <dd className="font-mono text-xs text-slate-700">
                  {entry.resource.type}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">ID</dt>
                <dd className="font-mono text-xs text-slate-700">
                  {entry.resource.id}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">Etykieta</dt>
                <dd className="font-medium text-slate-900">
                  {entry.resource.label}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card elevation="subtle">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Globe className="h-4 w-4 text-slate-500" />
              Pochodzenie
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">IP</dt>
                <dd className="font-mono text-xs text-slate-700">{entry.ip}</dd>
              </div>
              <div>
                <dt className="text-slate-500">User Agent</dt>
                <dd className="mt-1 font-mono text-xs text-slate-700">
                  {entry.userAgent}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card elevation="subtle">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-4 w-4 text-slate-500" />
              Kontekst
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2 text-sm">
              {Object.entries(entry.context).map(([key, value]) => (
                <div key={key} className="flex justify-between gap-3">
                  <dt className="text-slate-500">{key}</dt>
                  <dd className="font-mono text-xs text-slate-700">{value}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>
      </div>

      <Card elevation="subtle" className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="h-4 w-4 text-slate-500" />
            Zmiana
          </CardTitle>
          <CardDescription>Stan przed i po operacji</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="mb-2 text-xs uppercase tracking-wide text-slate-500">
                Przed
              </p>
              <pre className="overflow-x-auto rounded-lg border border-slate-200 bg-slate-50 p-4 font-mono text-xs text-slate-700">
                {JSON.stringify(entry.before, null, 2)}
              </pre>
            </div>
            <div>
              <p className="mb-2 text-xs uppercase tracking-wide text-slate-500">
                Po
              </p>
              <pre className="overflow-x-auto rounded-lg border border-emerald-200 bg-emerald-50 p-4 font-mono text-xs text-slate-700">
                {JSON.stringify(entry.after, null, 2)}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
