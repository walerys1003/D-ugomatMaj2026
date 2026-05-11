import type { Metadata } from "next";
import Link from "next/link";
import {
  Shield,
  Lock,
  Database,
  FileCheck,
  ServerCog,
  AlertTriangle,
  KeyRound,
  Eye,
  ArrowRight,
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
  title: "Bezpieczenstwo — Dlugomat",
  description:
    "Jak chronimy Twoje dane: szyfrowanie AES-256, ISO 27001, RODO, polskie centra danych, audyt OWASP, MFA, SSO.",
  alternates: { canonical: "/bezpieczenstwo" },
};

const PILLARS = [
  {
    icon: Lock,
    title: "Szyfrowanie end-to-end",
    desc: "AES-256 w spoczynku, TLS 1.3 w tranzycie. Klucze rotowane co 90 dni przez HSM (FIPS 140-2 Level 3).",
  },
  {
    icon: Database,
    title: "Polskie centra danych",
    desc: "Hosting w PL/EU (OVHcloud Warszawa + Frankfurt). Zerowy transfer poza EOG bez Twojej zgody.",
  },
  {
    icon: FileCheck,
    title: "Zgodnosc i certyfikaty",
    desc: "ISO/IEC 27001:2022, SOC 2 Type II (audyt 2025), RODO, ustawa o ochronie danych osobowych.",
  },
  {
    icon: ServerCog,
    title: "Architektura zero-trust",
    desc: "Mikro-segmentacja, mTLS miedzy uslugami, brak otwartych portow w domyslnej konfiguracji.",
  },
  {
    icon: KeyRound,
    title: "MFA i SSO",
    desc: "TOTP, WebAuthn, FIDO2. SSO przez SAML 2.0 / OIDC (Okta, Azure AD, Google Workspace).",
  },
  {
    icon: Eye,
    title: "Audit log na 7 lat",
    desc: "Niezmienialny dziennik (append-only) wszystkich operacji. Retencja do 7 lat w planie Enterprise.",
  },
] as const;

const COMPLIANCE = [
  {
    code: "ISO 27001",
    label: "ISO/IEC 27001:2022",
    desc: "System zarzadzania bezpieczenstwem informacji. Audyt zewnetrzny PCBC.",
    status: "Certyfikowane",
  },
  {
    code: "RODO",
    label: "RODO / GDPR",
    desc: "DPA dostepne dla wszystkich klientow. Inspektor Ochrony Danych: iod@dlugomat.pl.",
    status: "Zgodne",
  },
  {
    code: "SOC 2",
    label: "SOC 2 Type II",
    desc: "Trust Services Criteria: Security, Availability, Confidentiality.",
    status: "Audyt 2025",
  },
  {
    code: "PCI",
    label: "PCI DSS",
    desc: "Platnosci kartami przez Stripe — nie przechowujemy danych kart.",
    status: "Outsource",
  },
];

const PRACTICES = [
  {
    title: "Pentesty kwartalne",
    desc: "Niezalezna firma (Securitum / NASK) testuje aplikacje co 90 dni. Raporty udostepniamy na zadanie.",
  },
  {
    title: "Bug bounty",
    desc: "Program nagrod do 10 000 zl za krytyczne podatnosci. Kontakt: security@dlugomat.pl.",
  },
  {
    title: "Backup 3-2-1",
    desc: "3 kopie, 2 nosniki, 1 off-site. RPO 15 min, RTO 4 h. Test restore co miesiac.",
  },
  {
    title: "Disaster recovery",
    desc: "Drugi region (Frankfurt) gotowy na failover w < 30 min. DR drill 2x rocznie.",
  },
];

export default function SecurityPage() {
  return (
    <div className="bg-background">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <Badge tone="neutral" withDot className="mb-4">
            <Shield className="mr-1 h-3 w-3" />
            Bezpieczenstwo
          </Badge>
          <h1 className="font-display text-4xl tracking-tight text-slate-900 sm:text-5xl">
            Twoje dane to nasza tarcza.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-600">
            Bezpieczenstwo nie jest funkcja — to fundament. Architektura zero-trust, polskie
            serwery, niezalezne audyty co kwartal. Bez wyjatkow.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild variant="primary">
              <Link href="/dpa">
                Pobierz DPA
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/kontakt?temat=bezpieczenstwo">Umow audyt techniczny</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="font-display text-2xl text-slate-900">Szesc filarow naszej obrony</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {PILLARS.map((p) => {
            const Icon = p.icon;
            return (
              <Card key={p.title} elevation="subtle">
                <CardHeader>
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-100">
                    <Icon className="h-5 w-5 text-slate-700" aria-hidden />
                  </div>
                  <CardTitle className="mt-3 text-lg">{p.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600">{p.desc}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="font-display text-2xl text-slate-900">Zgodnosc i certyfikaty</h2>
          <p className="mt-2 text-sm text-slate-600">
            Niezalezne audyty, formalne certyfikaty i pelna transparentnosc.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {COMPLIANCE.map((c) => (
              <Card key={c.code} elevation="flat">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-mono text-xs text-slate-500">{c.code}</p>
                      <CardTitle className="mt-1 text-base">{c.label}</CardTitle>
                    </div>
                    <Badge tone={c.status === "Certyfikowane" ? "success" : "info"} withDot>
                      {c.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600">{c.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="font-display text-2xl text-slate-900">Praktyki operacyjne</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {PRACTICES.map((p) => (
            <Card key={p.title} elevation="subtle">
              <CardHeader>
                <CardTitle className="text-base">{p.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{p.desc}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-slate-900 text-white">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="flex items-start gap-4">
            <AlertTriangle className="mt-1 h-6 w-6 flex-none text-amber-400" aria-hidden />
            <div>
              <h2 className="font-display text-2xl">Zglos podatnosc — responsible disclosure</h2>
              <p className="mt-2 text-slate-300">
                Znalazles luke? Napisz na{" "}
                <a href="mailto:security@dlugomat.pl" className="underline">
                  security@dlugomat.pl
                </a>
                . Odpowiadamy w 24 h. Krytyczne zgloszenia: nagroda do 10 000 zl.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
