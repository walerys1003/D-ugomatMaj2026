import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  Check,
  ShieldCheck,
  Zap,
  Database,
  GitBranch,
  ExternalLink,
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

interface IntegrationDetailV2 {
  slug: string;
  name: string;
  category: string;
  tagline: string;
  description: string;
  hero_color: string;
  capabilities: ReadonlyArray<{ icon: "sync" | "zap" | "db" | "git"; title: string; desc: string }>;
  data_flow: ReadonlyArray<{ direction: "in" | "out" | "both"; entity: string; freq: string }>;
  setup_minutes: number;
  required_plan: "solo" | "pro" | "kancelaria" | "enterprise";
  security_notes: ReadonlyArray<string>;
  faq: ReadonlyArray<{ q: string; a: string }>;
}

const DETAILS_V2: Record<string, IntegrationDetailV2> = {
  salesforce: {
    slug: "salesforce",
    name: "Salesforce",
    category: "CRM",
    tagline: "Sprawy z Dlugomat trafiaja jako Cases do Salesforce.",
    description:
      "Dwukierunkowa synchronizacja kontaktow, leadow i spraw. Status pisma w Dlugomat aktualizuje pole Case Status w Salesforce.",
    hero_color: "#00A1E0",
    capabilities: [
      { icon: "sync", title: "Push-to-Salesforce", desc: "Sprawa utworzona w Dlugomat trafia do SF w < 5 s." },
      { icon: "zap", title: "Webhook events", desc: "Statusy, terminy, dokumenty — wszystko jako webhooki." },
      { icon: "db", title: "Mapowanie pol", desc: "UI bez kodu. Mapuj dowolne pola Dlugomat ↔ Salesforce." },
      { icon: "git", title: "Conflict resolution", desc: "SF wygrywa / DL wygrywa / merge — wybierz strategie." },
    ],
    data_flow: [
      { direction: "out", entity: "Sprawa → Case", freq: "real-time" },
      { direction: "out", entity: "Pismo → Attachment", freq: "real-time" },
      { direction: "in", entity: "Contact → Klient", freq: "15 min" },
      { direction: "both", entity: "Notatki", freq: "real-time" },
    ],
    setup_minutes: 15,
    required_plan: "kancelaria",
    security_notes: [
      "OAuth 2.0 — nie przechowujemy hasel Salesforce.",
      "Scope read/write ograniczony do wybranych obiektow.",
      "Audit log kazdej operacji push/pull.",
    ],
    faq: [
      { q: "Czy obsluguje Sandbox?", a: "Tak — przelacznik Sandbox/Production w konfiguracji." },
      { q: "Jak czesto dziala pull?", a: "Co 15 minut domyslnie. Mozna skrocic do 5 min w Enterprise." },
    ],
  },
  okta: {
    slug: "okta",
    name: "Okta",
    category: "SSO / IAM",
    tagline: "Zerowe hasla. SSO przez SAML 2.0 + SCIM provisioning.",
    description:
      "Pelna integracja z Okta jako Identity Provider. Automatyczne tworzenie i wylaczanie kont przez SCIM 2.0.",
    hero_color: "#007DC1",
    capabilities: [
      { icon: "zap", title: "SAML 2.0 SSO", desc: "Logowanie bez hasla. Sesja zarzadzana po stronie Okta." },
      { icon: "sync", title: "SCIM 2.0 provisioning", desc: "Nowy pracownik w Okta = konto w Dlugomat w 30 s." },
      { icon: "db", title: "Mapowanie grup", desc: "Grupy Okta → role Dlugomat. Automatycznie." },
      { icon: "git", title: "Just-in-time", desc: "Konto tworzone przy pierwszym logowaniu jesli brak SCIM." },
    ],
    data_flow: [
      { direction: "in", entity: "User → Konto Dlugomat", freq: "real-time" },
      { direction: "in", entity: "Group → Rola", freq: "real-time" },
      { direction: "in", entity: "Deactivate → Disable", freq: "real-time" },
    ],
    setup_minutes: 30,
    required_plan: "kancelaria",
    security_notes: [
      "Signed AuthnRequest (SHA-256).",
      "SLO (Single Logout) wspierane.",
      "MFA wymuszone przez Okta policy.",
    ],
    faq: [
      { q: "Czy obsluguje Okta Verify Push?", a: "Tak — wszystkie metody MFA Okta sa wspierane." },
      { q: "Co z byłymi pracownikami?", a: "Deactivate w Okta = natychmiastowa dezaktywacja w Dlugomat." },
    ],
  },
};

const CAPABILITY_ICON = {
  sync: ShieldCheck,
  zap: Zap,
  db: Database,
  git: GitBranch,
};

const PLAN_LABEL: Record<IntegrationDetailV2["required_plan"], string> = {
  solo: "Solo",
  pro: "Pro",
  kancelaria: "Kancelaria",
  enterprise: "Enterprise",
};

const DIRECTION_LABEL = {
  in: { label: "Wchodzi do Dlugomat", tone: "info" as const, arrow: "←" },
  out: { label: "Wychodzi z Dlugomat", tone: "success" as const, arrow: "→" },
  both: { label: "Dwukierunkowo", tone: "neutral" as const, arrow: "⇄" },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const d = DETAILS_V2[slug];
  if (!d) return { title: "Integracja nie znaleziona" };
  return {
    title: `${d.name} — integracja z Dlugomat`,
    description: d.tagline,
  };
}

export default async function IntegrationDetailV2Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const d = DETAILS_V2[slug];
  if (!d) notFound();

  return (
    <div className="bg-background">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <Link
            href="/integracje"
            className="text-sm text-slate-600 underline-offset-4 hover:underline"
          >
            ← Wszystkie integracje
          </Link>
          <div className="mt-6 flex items-start gap-6">
            <div
              className="flex h-16 w-16 flex-none items-center justify-center rounded-lg text-2xl font-bold text-white"
              style={{ backgroundColor: d.hero_color }}
              aria-hidden
            >
              {d.name.charAt(0)}
            </div>
            <div className="flex-1">
              <Badge tone="neutral" withDot>
                {d.category}
              </Badge>
              <h1 className="mt-2 font-display text-4xl tracking-tight text-slate-900">{d.name}</h1>
              <p className="mt-2 text-lg text-slate-600">{d.tagline}</p>
            </div>
          </div>
          <p className="mt-6 max-w-3xl text-slate-700">{d.description}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild variant="primary">
              <Link href={`/rejestracja?integracja=${d.slug}`}>
                Wlacz integracje
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href={`/dokumentacja/integracje/${d.slug}`}>
                Dokumentacja techniczna
                <ExternalLink className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card elevation="subtle">
            <CardContent className="p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">Czas wdrozenia</p>
              <p className="mt-2 font-display text-2xl text-slate-900">{d.setup_minutes} min</p>
            </CardContent>
          </Card>
          <Card elevation="subtle">
            <CardContent className="p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">Wymagany plan</p>
              <p className="mt-2 font-display text-2xl text-slate-900">{PLAN_LABEL[d.required_plan]}</p>
            </CardContent>
          </Card>
          <Card elevation="subtle">
            <CardContent className="p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">Funkcje</p>
              <p className="mt-2 font-display text-2xl text-slate-900">{d.capabilities.length}</p>
            </CardContent>
          </Card>
          <Card elevation="subtle">
            <CardContent className="p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">Status</p>
              <p className="mt-2 font-display text-2xl text-emerald-700">Dostepne</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <h2 className="font-display text-2xl text-slate-900">Co potrafi ta integracja</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {d.capabilities.map((c) => {
            const Icon = CAPABILITY_ICON[c.icon];
            return (
              <Card key={c.title} elevation="subtle">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-slate-700" aria-hidden />
                    <CardTitle className="text-base">{c.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600">{c.desc}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <h2 className="font-display text-2xl text-slate-900">Przeplyw danych</h2>
          <div className="mt-6 overflow-hidden rounded-lg border border-slate-200">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-slate-700">Kierunek</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-700">Encja</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-700">Czestotliwosc</th>
                </tr>
              </thead>
              <tbody>
                {d.data_flow.map((flow, idx) => {
                  const dir = DIRECTION_LABEL[flow.direction];
                  return (
                    <tr key={idx} className="border-t border-slate-100">
                      <td className="px-4 py-3">
                        <Badge tone={dir.tone} withDot>
                          {dir.arrow} {dir.label}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-700">{flow.entity}</td>
                      <td className="px-4 py-3 text-slate-600">{flow.freq}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <h2 className="font-display text-2xl text-slate-900">Bezpieczenstwo</h2>
        <ul className="mt-6 space-y-2">
          {d.security_notes.map((note) => (
            <li key={note} className="flex items-start gap-3">
              <Check className="mt-0.5 h-5 w-5 flex-none text-emerald-600" aria-hidden />
              <span className="text-sm text-slate-700">{note}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20">
        <h2 className="font-display text-2xl text-slate-900">FAQ</h2>
        <div className="mt-6 space-y-3">
          {d.faq.map((f) => (
            <Card key={f.q} elevation="flat">
              <CardHeader>
                <CardTitle className="text-base">{f.q}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{f.a}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
