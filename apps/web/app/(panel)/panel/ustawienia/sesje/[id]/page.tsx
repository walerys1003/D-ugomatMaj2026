import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Activity,
  Clock,
  Globe,
  Laptop,
  LogOut,
  MapPin,
  ShieldCheck,
  Smartphone,
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
  title: "Szczegoly sesji — Dlugomat",
  description: "Pelne dane sesji urzadzenia z mozliwoscia uniewaznienia.",
};

type SessionDetail = {
  id: string;
  device: "desktop" | "mobile" | "tablet";
  os: string;
  browser: string;
  ip: string;
  location: { city: string; country: string; coords: string };
  startedAt: string;
  lastActiveAt: string;
  current: boolean;
  status: "active" | "expired" | "revoked";
  riskScore: "low" | "medium" | "high";
  recentActivity: Array<{ at: string; action: string; resource: string }>;
};

const SESSIONS: Record<string, SessionDetail> = {
  "ses-1": {
    id: "ses-1",
    device: "desktop",
    os: "macOS 14.4",
    browser: "Safari 17.4",
    ip: "85.219.44.18",
    location: {
      city: "Warszawa",
      country: "Polska",
      coords: "52.2297, 21.0122",
    },
    startedAt: "2026-05-10T08:14:00",
    lastActiveAt: "2026-05-10T11:42:00",
    current: true,
    status: "active",
    riskScore: "low",
    recentActivity: [
      { at: "2026-05-10T11:42:00", action: "panel.view", resource: "/panel" },
      { at: "2026-05-10T11:24:00", action: "case.view", resource: "spr-001" },
      { at: "2026-05-10T10:18:00", action: "document.download", resource: "doc-001" },
      { at: "2026-05-10T09:48:00", action: "auth.refresh", resource: "session" },
      { at: "2026-05-10T08:14:00", action: "auth.login", resource: "credentials" },
    ],
  },
};

const STATUS_TONE: Record<SessionDetail["status"], "success" | "neutral" | "danger"> = {
  active: "success",
  expired: "neutral",
  revoked: "danger",
};

const STATUS_LABEL: Record<SessionDetail["status"], string> = {
  active: "Aktywna",
  expired: "Wygasla",
  revoked: "Uniewazniona",
};

const RISK_TONE: Record<
  SessionDetail["riskScore"],
  "success" | "warning" | "danger"
> = {
  low: "success",
  medium: "warning",
  high: "danger",
};

const RISK_LABEL: Record<SessionDetail["riskScore"], string> = {
  low: "Niskie",
  medium: "Sredne",
  high: "Wysokie",
};

function deviceIcon(d: SessionDetail["device"]) {
  if (d === "mobile") return Smartphone;
  return Laptop;
}

const fmtTime = (iso: string) =>
  new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));

async function loadSession(id: string): Promise<SessionDetail | null> {
  return SESSIONS[id] ?? SESSIONS["ses-1"] ?? null;
}

export default async function SessionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await loadSession(id);
  if (!session) return notFound();

  const Icon = deviceIcon(session.device);
  const durationMs =
    new Date(session.lastActiveAt).getTime() -
    new Date(session.startedAt).getTime();
  const durationHrs = Math.floor(durationMs / (1000 * 60 * 60));
  const durationMin = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-8">
        <Link
          href="/panel/ustawienia/sesje"
          className="text-sm text-slate-600 hover:text-slate-900"
        >
          ← Wszystkie sesje
        </Link>
        <div className="mt-3 flex items-start justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm text-slate-500">
                #{session.id}
              </span>
              <Badge tone={STATUS_TONE[session.status]} withDot>
                {STATUS_LABEL[session.status]}
              </Badge>
              {session.current ? <Badge tone="success">Ta sesja</Badge> : null}
            </div>
            <h1 className="mt-2 font-display text-2xl text-slate-900">
              {session.os} · {session.browser}
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Rozpoczeta {fmtTime(session.startedAt)}
            </p>
          </div>
          {session.status === "active" && !session.current ? (
            <Button variant="secondary" size="sm">
              <LogOut className="mr-1 h-4 w-4" />
              Uniewaznij sesje
            </Button>
          ) : null}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card elevation="subtle">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Icon className="h-4 w-4 text-slate-500" />
              Urzadzenie
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">System</dt>
                <dd className="text-slate-700">{session.os}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">Przegladarka</dt>
                <dd className="text-slate-700">{session.browser}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">Typ</dt>
                <dd className="text-slate-700">
                  {session.device === "mobile" ? "Mobilne" : "Komputer"}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card elevation="subtle">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Globe className="h-4 w-4 text-slate-500" />
              Lokalizacja
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2 text-sm">
              <div className="flex items-center justify-between gap-3">
                <dt className="inline-flex items-center gap-2 text-slate-500">
                  <MapPin className="h-3.5 w-3.5" />
                  Miasto
                </dt>
                <dd className="text-slate-700">
                  {session.location.city}, {session.location.country}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">Adres IP</dt>
                <dd className="font-mono text-xs text-slate-700">
                  {session.ip}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">Wspolrzedne</dt>
                <dd className="font-mono text-xs text-slate-700">
                  {session.location.coords}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card elevation="subtle">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-4 w-4 text-slate-500" />
              Czas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">Start</dt>
                <dd className="text-slate-700">{fmtTime(session.startedAt)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">Ostatnia aktywnosc</dt>
                <dd className="text-slate-700">
                  {fmtTime(session.lastActiveAt)}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">Czas trwania</dt>
                <dd className="text-slate-700">
                  {durationHrs}h {durationMin}min
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card elevation="subtle">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ShieldCheck className="h-4 w-4 text-slate-500" />
              Ryzyko
            </CardTitle>
            <CardDescription>
              Ocena na podstawie zachowania i lokalizacji
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-3 flex items-center gap-3">
              <Badge tone={RISK_TONE[session.riskScore]} withDot>
                {RISK_LABEL[session.riskScore]}
              </Badge>
              <span className="text-xs text-slate-500">
                Znana lokalizacja, urzadzenie zaufane
              </span>
            </div>
            <p className="text-xs text-slate-600">
              Sesje z ryzykiem wysokim sa automatycznie konczone po 15 min
              nieaktywnosci i wymagaja ponownego logowania z 2FA.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card elevation="subtle" className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Activity className="h-4 w-4 text-slate-500" />
            Ostatnia aktywnosc
          </CardTitle>
          <CardDescription>{session.recentActivity.length} zdarzen</CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-6 py-3 font-medium">Czas</th>
                <th className="px-6 py-3 font-medium">Akcja</th>
                <th className="px-6 py-3 font-medium">Zasob</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {session.recentActivity.map((a, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  <td className="px-6 py-3 text-slate-600">{fmtTime(a.at)}</td>
                  <td className="px-6 py-3 font-mono text-xs text-slate-700">
                    {a.action}
                  </td>
                  <td className="px-6 py-3 font-mono text-xs text-slate-700">
                    {a.resource}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
