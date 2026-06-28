import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
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
import { createSupabaseServerClient } from "@/lib/db/supabase-server";

export const metadata: Metadata = {
  title: "Szczegoly sesji — Dlugomat",
  description: "Pelne dane sesji urzadzenia z mozliwoscia uniewaznienia.",
};

export const dynamic = "force-dynamic";

type SessionStatus = "active" | "expired" | "revoked";

type SessionDetail = {
  id: string;
  device: "desktop" | "mobile" | "tablet";
  os: string;
  browser: string;
  ip: string;
  location: { city: string; country: string };
  startedAt: string;
  lastActiveAt: string;
  current: boolean;
  status: SessionStatus;
  recentActivity: Array<{ at: string; action: string; resource: string }>;
};

const STATUS_TONE: Record<SessionStatus, "success" | "neutral" | "danger"> = {
  active: "success",
  expired: "neutral",
  revoked: "danger",
};

const STATUS_LABEL: Record<SessionStatus, string> = {
  active: "Aktywna",
  expired: "Wygasla",
  revoked: "Uniewazniona",
};

function parseUserAgent(ua: string | null): {
  os: string;
  browser: string;
  device: SessionDetail["device"];
} {
  if (!ua) return { os: "Nieznany system", browser: "Nieznana przegladarka", device: "desktop" };
  const isMobile = /mobile|android|iphone|ipad/i.test(ua);
  let os = "Nieznany system";
  if (/windows/i.test(ua)) os = "Windows";
  else if (/mac os|macintosh/i.test(ua)) os = "macOS";
  else if (/android/i.test(ua)) os = "Android";
  else if (/iphone|ipad|ios/i.test(ua)) os = "iOS";
  else if (/linux/i.test(ua)) os = "Linux";
  let browser = "Nieznana przegladarka";
  if (/edg\//i.test(ua)) browser = "Edge";
  else if (/chrome\//i.test(ua) && !/edg\//i.test(ua)) browser = "Chrome";
  else if (/firefox\//i.test(ua)) browser = "Firefox";
  else if (/safari\//i.test(ua) && !/chrome\//i.test(ua)) browser = "Safari";
  return { os, browser, device: isMobile ? "mobile" : "desktop" };
}

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

export default async function SessionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/sign-in?next=/panel/ustawienia/sesje/${id}`);

  const { data: row } = await supabase
    .from("user_sessions")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!row) return notFound();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const r = row as any;
  const ua = parseUserAgent(r.user_agent ?? null);
  const now = Date.now();
  const status: SessionStatus = r.revoked_at
    ? "revoked"
    : r.expires_at && new Date(r.expires_at).getTime() < now
      ? "expired"
      : "active";

  // Powiazana aktywnosc — security_events tego usera (opcjonalnie po sesji).
  const { data: events } = await supabase
    .from("security_events")
    .select("type, occurred_at, metadata")
    .eq("user_id", user.id)
    .order("occurred_at", { ascending: false })
    .limit(8);

  const session: SessionDetail = {
    id: r.id,
    device: ua.device,
    os: ua.os,
    browser: ua.browser,
    ip: r.ip ?? "—",
    location: { city: r.city ?? "—", country: r.country ?? "—" },
    startedAt: r.created_at,
    lastActiveAt: r.last_activity_at ?? r.created_at,
    current: false,
    status,
    recentActivity: (events ?? []).map((e) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const meta = (e as any).metadata as Record<string, unknown> | null;
      return {
        at: e.occurred_at,
        action: e.type,
        resource:
          (meta && typeof meta.resource === "string" && meta.resource) ||
          (meta && typeof meta.scope === "string" && meta.scope) ||
          "—",
      };
    }),
  };

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
              Bezpieczenstwo
            </CardTitle>
            <CardDescription>
              Status i polityka sesji
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-3 flex items-center gap-3">
              <Badge tone={STATUS_TONE[session.status]} withDot>
                {STATUS_LABEL[session.status]}
              </Badge>
            </div>
            <p className="text-xs text-slate-600">
              Sesje wygasaja automatycznie po 30 dniach bezczynnosci. Jesli nie
              rozpoznajesz tej sesji, uniewaznij ja i zmien haslo.
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
              {session.recentActivity.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-sm text-slate-500">
                    Brak zarejestrowanej aktywnosci dla tej sesji.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
