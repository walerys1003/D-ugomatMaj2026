import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ShieldCheck, KeyRound, Smartphone, History, LogOut, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";

export const metadata: Metadata = {
  title: "Profil — Bezpieczenstwo",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

interface Session {
  id: string;
  device: string;
  location: string;
  ip: string;
  last_active: string;
  current: boolean;
}

interface AuditEntry {
  id: string;
  action: string;
  when: string;
  ip: string;
  ok: boolean;
}

function parseDevice(ua: string | null): string {
  if (!ua) return "Urzadzenie";
  let os = "";
  if (/windows/i.test(ua)) os = "Windows";
  else if (/mac os|macintosh/i.test(ua)) os = "macOS";
  else if (/android/i.test(ua)) os = "Android";
  else if (/iphone|ipad|ios/i.test(ua)) os = "iOS";
  else if (/linux/i.test(ua)) os = "Linux";
  let br = "";
  if (/edg\//i.test(ua)) br = "Edge";
  else if (/chrome\//i.test(ua) && !/edg\//i.test(ua)) br = "Chrome";
  else if (/firefox\//i.test(ua)) br = "Firefox";
  else if (/safari\//i.test(ua) && !/chrome\//i.test(ua)) br = "Safari";
  return [os, br].filter(Boolean).join(" · ") || "Urzadzenie";
}

function humanizeEvent(type: string): { action: string; ok: boolean } {
  const t = type.toLowerCase();
  if (t.includes("login_success") || t === "auth.login") return { action: "Logowanie", ok: true };
  if (t.includes("login_fail") || t.includes("failed")) return { action: "Nieudana proba logowania", ok: false };
  if (t.includes("password")) return { action: "Zmiana hasla", ok: true };
  if (t.includes("session_revoked")) return { action: "Wylogowanie sesji", ok: true };
  if (t.includes("mfa")) return { action: "Zmiana MFA", ok: true };
  return { action: type, ok: !t.includes("fail") && !t.includes("error") };
}

const fmtWhen = (iso: string) =>
  new Intl.DateTimeFormat("pl-PL", { dateStyle: "short", timeStyle: "short" }).format(new Date(iso));

export default async function BezpieczenstwoPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/logowanie?next=/panel/profil/bezpieczenstwo");

  const [sessRes, auditRes] = await Promise.all([
    supabase
      .from("user_sessions")
      .select("*")
      .eq("user_id", user.id)
      .is("revoked_at", null)
      .order("last_activity_at", { ascending: false }),
    supabase
      .from("security_events")
      .select("id, type, occurred_at, ip")
      .eq("user_id", user.id)
      .order("occurred_at", { ascending: false })
      .limit(10),
  ]);

  const SESSIONS: Session[] = (sessRes.data ?? []).map((rowUnknown, idx) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const r = rowUnknown as any;
    return {
      id: r.id,
      device: parseDevice(r.user_agent ?? null),
      location: [r.city, r.country].filter(Boolean).join(", ") || "Nieznana lokalizacja",
      ip: r.ip ?? "—",
      last_active: r.last_activity_at ? fmtWhen(r.last_activity_at) : "—",
      current: idx === 0,
    };
  });

  const AUDIT: AuditEntry[] = (auditRes.data ?? []).map((e) => {
    const h = humanizeEvent(e.type);
    return {
      id: e.id,
      action: h.action,
      when: fmtWhen(e.occurred_at),
      ip: e.ip ?? "—",
      ok: h.ok,
    };
  });

  const mfaEnabled = (user.factors ?? []).length > 0;

  return (
    <div className="space-y-6">
      <Link href="/panel/profil" className="inline-flex items-center gap-2 text-sm text-ink-600 hover:text-dlugomat-900">
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Powrot do profilu
      </Link>

      <header>
        <p className="text-xs uppercase tracking-[0.18em] text-ink-500">Profil</p>
        <h1 className="font-display text-fluid-h1 text-dlugomat-950 flex items-center gap-3">
          <ShieldCheck className="h-7 w-7 text-dlugomat-700" aria-hidden />
          Bezpieczenstwo konta
        </h1>
        <p className="mt-1 text-sm text-ink-600">
          Haslo, dwuetapowa weryfikacja, aktywne sesje i historia logowan.
        </p>
      </header>

      <section className="grid gap-4 lg:grid-cols-3" aria-label="KPI bezpieczenstwa">
        <Card urgency={mfaEnabled ? "success" : "warning"}>
          <CardHeader>
            <CardDescription>Dwuetapowa weryfikacja</CardDescription>
            <CardTitle className="font-display text-fluid-h3 text-dlugomat-950">
              {mfaEnabled ? "Aktywna" : "Wylaczona"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-ink-500">
              {mfaEnabled
                ? `${(user.factors ?? []).length} skonfigurowanych metod`
                : "Zalecamy wlaczenie 2FA"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Aktywne sesje</CardDescription>
            <CardTitle className="font-display text-fluid-h3 text-dlugomat-950">{SESSIONS.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-ink-500">
              {SESSIONS[0] ? `Biezaca: ${SESSIONS[0].device}` : "Brak aktywnych sesji"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Zdarzenia bezpieczenstwa</CardDescription>
            <CardTitle className="font-display text-fluid-h3 text-dlugomat-950">{AUDIT.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-ink-500">Ostatnie z dziennika audytu</p>
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
              <span className="text-ink-700">Aktualne haslo</span>
              <input type="password" className="h-10 rounded-md border border-ink-200 px-3 focus-visible:outline-none focus-visible:shadow-shield-focus" />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-ink-700">Nowe haslo</span>
              <input type="password" className="h-10 rounded-md border border-ink-200 px-3 focus-visible:outline-none focus-visible:shadow-shield-focus" />
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
          <div className="flex items-center justify-between rounded-md border border-ink-200 bg-ink-50/50 p-3">
            <div>
              <p className="text-sm font-medium text-dlugomat-900">Aplikacja TOTP</p>
              <p className="text-xs text-ink-500">
                {mfaEnabled ? "Skonfigurowana i aktywna" : "Brak — wlacz, aby zwiekszyc bezpieczenstwo"}
              </p>
            </div>
            {mfaEnabled ? (
              <Badge tone="success" withDot>Aktywne</Badge>
            ) : (
              <Button variant="secondary" size="sm" asChild>
                <Link href="/panel/profil/mfa">Wlacz</Link>
              </Button>
            )}
          </div>
          <div className="flex items-center justify-between rounded-md border border-ink-200 p-3">
            <div>
              <p className="text-sm font-medium text-dlugomat-900">Klucz sprzetowy (WebAuthn)</p>
              <p className="text-xs text-ink-500">Brak skonfigurowanych kluczy</p>
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
          <ul className="divide-y divide-ink-100">
            {SESSIONS.map((s) => (
              <li key={s.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
                <div>
                  <p className="text-sm font-medium text-dlugomat-900">{s.device}</p>
                  <p className="text-xs text-ink-500">{s.location} · {s.ip} · {s.last_active}</p>
                </div>
                {s.current ? (
                  <Badge tone="info" withDot>Biezaca sesja</Badge>
                ) : (
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/panel/ustawienia/sesje/${s.id}`}>Szczegoly</Link>
                  </Button>
                )}
              </li>
            ))}
            {SESSIONS.length === 0 && (
              <li className="px-5 py-8 text-center text-sm text-ink-500">
                Brak aktywnych sesji.
              </li>
            )}
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
          <ul className="divide-y divide-ink-100">
            {AUDIT.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
                <div className="flex items-center gap-3">
                  {!a.ok && <AlertTriangle className="h-4 w-4 text-danger" aria-hidden />}
                  <span className="text-sm text-dlugomat-900">{a.action}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-ink-500">
                  <span className="font-mono">{a.ip}</span>
                  <span>{a.when}</span>
                  <Badge tone={a.ok ? "success" : "danger"}>{a.ok ? "OK" : "Blad"}</Badge>
                </div>
              </li>
            ))}
            {AUDIT.length === 0 && (
              <li className="px-5 py-8 text-center text-sm text-ink-500">
                Brak zdarzen w dzienniku.
              </li>
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
