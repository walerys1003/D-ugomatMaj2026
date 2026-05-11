import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, KeyRound, Smartphone, History, LogOut, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Profil — Bezpieczenstwo",
  robots: { index: false, follow: false },
};

interface Session {
  id: string;
  device: string;
  location: string;
  ip: string;
  last_active: string;
  current: boolean;
}

const SESSIONS: ReadonlyArray<Session> = [
  { id: "s1", device: "MacBook Pro · Safari", location: "Warszawa, PL", ip: "85.243.111.18", last_active: "Teraz", current: true },
  { id: "s2", device: "iPhone 15 · Mobile Safari", location: "Warszawa, PL", ip: "85.243.111.19", last_active: "12 min temu", current: false },
  { id: "s3", device: "Windows 11 · Chrome", location: "Krakow, PL", ip: "37.225.78.4", last_active: "Wczoraj 18:42", current: false },
];

interface AuditEntry {
  id: string;
  action: string;
  when: string;
  ip: string;
  ok: boolean;
}

const AUDIT: ReadonlyArray<AuditEntry> = [
  { id: "a1", action: "Logowanie", when: "2026-05-11 09:14", ip: "85.243.111.18", ok: true },
  { id: "a2", action: "Zmiana hasla", when: "2026-04-28 22:01", ip: "85.243.111.18", ok: true },
  { id: "a3", action: "Logowanie", when: "2026-04-19 07:33", ip: "37.225.78.4", ok: true },
  { id: "a4", action: "Nieudana proba logowania", when: "2026-04-11 02:18", ip: "188.146.232.7", ok: false },
];

export default function BezpieczenstwoPage() {
  return (
    <div className="space-y-6">
      <Link href="/panel/profil" className="inline-flex items-center gap-2 text-sm text-iron-600 hover:text-dlugomat-900">
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Powrot do profilu
      </Link>

      <header>
        <p className="text-xs uppercase tracking-[0.18em] text-iron-500">Profil</p>
        <h1 className="font-display text-fluid-h1 text-dlugomat-950 flex items-center gap-3">
          <ShieldCheck className="h-7 w-7 text-dlugomat-700" aria-hidden />
          Bezpieczenstwo konta
        </h1>
        <p className="mt-1 text-sm text-iron-600">
          Haslo, dwuetapowa weryfikacja, aktywne sesje i historia logowan.
        </p>
      </header>

      <section className="grid gap-4 lg:grid-cols-3" aria-label="KPI bezpieczenstwa">
        <Card urgency="success">
          <CardHeader>
            <CardDescription>Sila hasla</CardDescription>
            <CardTitle className="font-display text-fluid-h3 text-accent-700">Silne</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-iron-500">Zmienione 13 dni temu</p>
          </CardContent>
        </Card>
        <Card urgency="normal">
          <CardHeader>
            <CardDescription>Dwuetapowa weryfikacja</CardDescription>
            <CardTitle className="font-display text-fluid-h3 text-dlugomat-950">TOTP</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-iron-500">Authy · aktywne</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Aktywne sesje</CardDescription>
            <CardTitle className="font-display text-fluid-h3 text-dlugomat-950">{SESSIONS.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-iron-500">Biezaca: MacBook Pro · Warszawa</p>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-dlugomat-700" aria-hidden />
            Haslo
          </CardTitle>
          <CardDescription>Min. 12 znakow, mieszane wielkosci, cyfra i znak specjalny.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-iron-700">Aktualne haslo</span>
              <input type="password" className="h-10 rounded-md border border-iron-200 px-3 focus-visible:outline-none focus-visible:shadow-shield-focus" />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-iron-700">Nowe haslo</span>
              <input type="password" className="h-10 rounded-md border border-iron-200 px-3 focus-visible:outline-none focus-visible:shadow-shield-focus" />
            </label>
          </div>
          <Button variant="primary">Zmien haslo</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-dlugomat-700" aria-hidden />
            Dwuetapowa weryfikacja
          </CardTitle>
          <CardDescription>Aplikacja TOTP (Authy, Google Authenticator) lub klucz WebAuthn.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between rounded-md border border-iron-200 bg-iron-50/50 p-3">
            <div>
              <p className="text-sm font-medium text-dlugomat-900">TOTP — Authy</p>
              <p className="text-xs text-iron-500">Wlaczone od 2026-03-12</p>
            </div>
            <Badge tone="success" withDot>Aktywne</Badge>
          </div>
          <div className="flex items-center justify-between rounded-md border border-iron-200 p-3">
            <div>
              <p className="text-sm font-medium text-dlugomat-900">Klucz sprzetowy (WebAuthn)</p>
              <p className="text-xs text-iron-500">Brak skonfigurowanych kluczy</p>
            </div>
            <Button variant="secondary" size="sm">Dodaj klucz</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LogOut className="h-5 w-5 text-dlugomat-700" aria-hidden />
            Aktywne sesje
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ul className="divide-y divide-iron-100">
            {SESSIONS.map((s) => (
              <li key={s.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
                <div>
                  <p className="text-sm font-medium text-dlugomat-900">{s.device}</p>
                  <p className="text-xs text-iron-500">{s.location} · {s.ip} · {s.last_active}</p>
                </div>
                {s.current ? (
                  <Badge tone="info" withDot>Biezaca sesja</Badge>
                ) : (
                  <Button variant="ghost" size="sm">Wyloguj</Button>
                )}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-dlugomat-700" aria-hidden />
            Historia logowan
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ul className="divide-y divide-iron-100">
            {AUDIT.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
                <div className="flex items-center gap-3">
                  {!a.ok && <AlertTriangle className="h-4 w-4 text-danger" aria-hidden />}
                  <span className="text-sm text-dlugomat-900">{a.action}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-iron-500">
                  <span className="font-mono">{a.ip}</span>
                  <span>{a.when}</span>
                  <Badge tone={a.ok ? "success" : "danger"}>{a.ok ? "OK" : "Blad"}</Badge>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
