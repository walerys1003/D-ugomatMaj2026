import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  Activity,
  Clock,
  MapPin,
  Monitor,
  Shield,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";

export const metadata = {
  title: "Szczegoly zdarzenia - aktywnosc - Dlugomat",
  description: "Pelne informacje o zdarzeniu w logu aktywnosci konta: kontekst, urzadzenie, lokalizacja.",
};

export const dynamic = "force-dynamic";

type Severity = "info" | "warning" | "danger";

/** Prosty parser User-Agent — wystarczajacy do wyswietlenia kontekstu. */
function parseUserAgent(ua: string | null): { os: string; browser: string; device: string } {
  if (!ua) return { os: "Nieznany", browser: "Nieznana", device: "Nieznane" };
  let os = "Nieznany";
  if (/Windows/i.test(ua)) os = "Windows";
  else if (/Mac OS X|Macintosh/i.test(ua)) os = "macOS";
  else if (/Android/i.test(ua)) os = "Android";
  else if (/iPhone|iPad|iOS/i.test(ua)) os = "iOS";
  else if (/Linux/i.test(ua)) os = "Linux";

  let browser = "Nieznana";
  if (/Edg\//i.test(ua)) browser = "Edge";
  else if (/Chrome\//i.test(ua) && !/Chromium/i.test(ua)) browser = "Chrome";
  else if (/Safari\//i.test(ua) && !/Chrome/i.test(ua)) browser = "Safari";
  else if (/Firefox\//i.test(ua)) browser = "Firefox";

  const device = /Mobile|Android|iPhone/i.test(ua) ? "Urzadzenie mobilne" : "Komputer";
  return { os, browser, device };
}

/** Czytelna etykieta dla typu zdarzenia (kropkowanego lub plaskiego). */
function humanizeType(type: string): string {
  const map: Record<string, string> = {
    "auth.login_success": "Logowanie",
    login_success: "Logowanie",
    "auth.login_failed": "Nieudane logowanie",
    login_failed: "Nieudane logowanie",
    "auth.logout": "Wylogowanie",
    logout: "Wylogowanie",
    "auth.password_changed": "Zmiana hasla",
    password_changed: "Zmiana hasla",
    "auth.mfa_enrolled": "Wlaczono 2FA",
    "gdpr.consent_granted": "Wyrazono zgode",
    consent_update: "Aktualizacja zgody",
    "oauth.connected": "Polaczono konto OAuth",
    "oauth.disconnected": "Odlaczono konto OAuth",
  };
  if (map[type]) return map[type];
  return type
    .replace(/[._]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function severityFor(severity: string, type: string): Severity {
  const s = severity.toLowerCase();
  if (s.includes("crit") || s.includes("high") || s === "danger") return "danger";
  if (s.includes("warn") || s.includes("medium")) return "warning";
  if (/fail|blocked|denied|suspicious/i.test(type)) return "warning";
  return "info";
}

const SEVERITY_LABEL: Record<Severity, string> = {
  info: "Informacja",
  warning: "Ostrzezenie",
  danger: "Krytyczne",
};

type Params = Promise<{ id: string }>;

export default async function SzczegolyAktywnosciPage({ params }: { params: Params }) {
  const { id } = await params;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/sign-in?next=/panel/aktywnosc/${id}`);

  const { data: event } = await supabase
    .from("security_events")
    .select("id, type, severity, ip, user_agent, metadata, occurred_at")
    .eq("id", id)
    .single();

  if (!event) notFound();

  const dateTimeFmt = new Intl.DateTimeFormat("pl-PL", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const severity = severityFor(event.severity, event.type);
  const SeverityIcon = severity === "info" ? CheckCircle2 : AlertTriangle;
  const ua = parseUserAgent(event.user_agent);
  const title = humanizeType(event.type);

  // Kontekst zdarzenia z pola metadata (JSON).
  const meta =
    event.metadata && typeof event.metadata === "object" && !Array.isArray(event.metadata)
      ? (event.metadata as Record<string, unknown>)
      : {};
  const context = Object.entries(meta)
    .filter(([, v]) => v != null && typeof v !== "object")
    .slice(0, 8)
    .map(([k, v]) => ({ label: k, value: String(v) }));

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
            <Badge tone="neutral">{event.type}</Badge>
            <Badge tone={severity} withDot>
              <SeverityIcon className="h-3 w-3 mr-1" aria-hidden />
              {SEVERITY_LABEL[severity]}
            </Badge>
          </div>
          <h1 className="font-display text-3xl text-dlugomat-950 mb-2">{title}</h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Kontekst zdarzenia</CardTitle>
                <CardDescription>Dane zapisane wraz ze zdarzeniem</CardDescription>
              </CardHeader>
              <CardContent>
                {context.length > 0 ? (
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                    {context.map((c) => (
                      <div key={c.label}>
                        <dt className="text-xs uppercase tracking-wide text-dlugomat-600 mb-0.5">{c.label}</dt>
                        <dd className="text-sm font-medium text-dlugomat-950 break-all">{c.value}</dd>
                      </div>
                    ))}
                  </dl>
                ) : (
                  <p className="text-sm text-dlugomat-500">Brak dodatkowych metadanych dla tego zdarzenia.</p>
                )}
              </CardContent>
            </Card>

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
                    <dd className="font-medium text-dlugomat-950">{ua.device}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-dlugomat-600 mb-0.5">System</dt>
                    <dd className="font-medium text-dlugomat-950">{ua.os}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-dlugomat-600 mb-0.5">Przegladarka</dt>
                    <dd className="font-medium text-dlugomat-950">{ua.browser}</dd>
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
                  {dateTimeFmt.format(new Date(event.occurred_at))}
                </div>
                <div className="text-xs text-dlugomat-600 mt-1">Strefa: Europe/Warsaw</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-accent-600" aria-hidden />
                  Adres IP
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="font-mono text-dlugomat-950">{event.ip ?? "—"}</div>
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
                  <span>Zdarzenie zapisane w dzienniku audytu</span>
                </div>
                {severity !== "info" ? (
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" aria-hidden />
                    <span>Zdarzenie oznaczone do przegladu</span>
                  </div>
                ) : null}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 space-y-2">
                <Button variant="secondary" block asChild>
                  <Link href="/panel/wsparcie">Zglos podejrzenie</Link>
                </Button>
                <Button variant="ghost" block asChild>
                  <Link href="/panel/aktywnosc">Wroc do dziennika</Link>
                </Button>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}
