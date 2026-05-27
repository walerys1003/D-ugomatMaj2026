import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Globe, Laptop, LogOut, MapPin, Smartphone } from "lucide-react";
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
  title: "Sesje uzytkownika — Admin Dlugomat",
  description: "Aktywne i historyczne sesje uzytkownika z mozliwoscia revoke.",
};

type Session = {
  id: string;
  device: "desktop" | "mobile" | "tablet";
  os: string;
  browser: string;
  ip: string;
  location: string;
  startedAt: string;
  lastActiveAt: string;
  current: boolean;
  status: "active" | "expired" | "revoked";
};

const SESSIONS: Session[] = [
  {
    id: "ses-1",
    device: "desktop",
    os: "macOS 14.4",
    browser: "Safari 17.4",
    ip: "85.219.44.18",
    location: "Warszawa, PL",
    startedAt: "2026-05-10T08:14:00",
    lastActiveAt: "2026-05-10T11:42:00",
    current: true,
    status: "active",
  },
  {
    id: "ses-2",
    device: "mobile",
    os: "iOS 17.5",
    browser: "Safari Mobile",
    ip: "188.146.22.4",
    location: "Krakow, PL",
    startedAt: "2026-05-09T18:22:00",
    lastActiveAt: "2026-05-10T07:48:00",
    current: false,
    status: "active",
  },
  {
    id: "ses-3",
    device: "desktop",
    os: "Windows 11",
    browser: "Chrome 124",
    ip: "37.47.181.92",
    location: "Wroclaw, PL",
    startedAt: "2026-05-04T14:08:00",
    lastActiveAt: "2026-05-04T17:32:00",
    current: false,
    status: "expired",
  },
  {
    id: "ses-4",
    device: "mobile",
    os: "Android 14",
    browser: "Chrome 124",
    ip: "78.10.182.5",
    location: "Gdansk, PL",
    startedAt: "2026-04-28T09:18:00",
    lastActiveAt: "2026-04-28T09:24:00",
    current: false,
    status: "revoked",
  },
];

const STATUS_TONE: Record<Session["status"], "success" | "neutral" | "danger"> = {
  active: "success",
  expired: "neutral",
  revoked: "danger",
};

const STATUS_LABEL: Record<Session["status"], string> = {
  active: "Aktywna",
  expired: "Wygasla",
  revoked: "Uniewazniona",
};

function deviceIcon(d: Session["device"]) {
  if (d === "mobile") return Smartphone;
  return Laptop;
}

const fmtTime = (iso: string) =>
  new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));

export default async function UserSessionsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!id) return notFound();

  const active = SESSIONS.filter((s) => s.status === "active").length;

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-8">
        <Link
          href={`/admin/uzytkownicy/${id}`}
          className="text-sm text-slate-600 hover:text-slate-900"
        >
          ← Profil uzytkownika
        </Link>
        <div className="mt-3 flex items-start justify-between gap-6">
          <div>
            <h1 className="font-display text-3xl text-slate-900">
              Sesje uzytkownika
            </h1>
            <p className="mt-2 text-slate-600">
              {SESSIONS.length} sesji laczne · {active} aktywne
            </p>
          </div>
          <Button variant="secondary" size="sm">
            <LogOut className="mr-1 h-4 w-4" />
            Wyloguj wszystkie
          </Button>
        </div>
      </div>

      <Card elevation="subtle">
        <CardHeader>
          <CardTitle>Lista sesji</CardTitle>
          <CardDescription>
            Mozesz uniewaznic dowolna aktywna sesje
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {SESSIONS.map((s) => {
            const Icon = deviceIcon(s.device);
            return (
              <article
                key={s.id}
                className={`flex items-start justify-between gap-4 rounded-lg border p-4 ${
                  s.current
                    ? "border-emerald-200 bg-emerald-50"
                    : "border-slate-200 bg-white"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100">
                    <Icon className="h-4 w-4 text-slate-500" />
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-slate-900">
                        {s.os} · {s.browser}
                      </p>
                      <Badge tone={STATUS_TONE[s.status]} withDot>
                        {STATUS_LABEL[s.status]}
                      </Badge>
                      {s.current ? (
                        <Badge tone="success">Ta sesja</Badge>
                      ) : null}
                    </div>
                    <p className="mt-1 inline-flex items-center gap-2 text-xs text-slate-600">
                      <MapPin className="h-3 w-3" />
                      {s.location}
                      <span className="text-slate-300">·</span>
                      <Globe className="h-3 w-3" />
                      <span className="font-mono">{s.ip}</span>
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Rozpoczeta {fmtTime(s.startedAt)} · ostatnia aktywnosc{" "}
                      {fmtTime(s.lastActiveAt)}
                    </p>
                  </div>
                </div>
                {s.status === "active" && !s.current ? (
                  <Button variant="ghost" size="sm">
                    Uniewaznij
                  </Button>
                ) : null}
              </article>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
