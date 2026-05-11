import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Briefcase, Building2, Handshake, Scale } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Partnerzy — Dlugomat",
  description:
    "Zostan partnerem Dlugomat. Trzy programy: kancelarie, biura ksiegowe, organizacje wsparcia konsumenckiego.",
  alternates: { canonical: "/partnerzy" },
};

const PROGRAMS = [
  {
    icon: Scale,
    name: "Program Kancelaryjny",
    target: "Adwokaci i radcowie prawni",
    benefits: [
      "Bezplatne konto Pro dla kancelarii",
      "Prowizja 15% od polecen w pierwszym roku",
      "Wpis w katalogu prawnikow Dlugomat",
      "Dedykowany onboarding (2 godz.)",
    ],
    cta: "Dolacz jako kancelaria",
    href: "/partnerzy/kancelaria",
    tone: "info" as const,
  },
  {
    icon: Briefcase,
    name: "Program Biur Rachunkowych",
    target: "Biura ksiegowe i doradcy podatkowi",
    benefits: [
      "Multi-tenant dla klientow biura",
      "Whitelabel raportow (logo biura)",
      "Stawka B2B od 590 zl/m-c bez limitu klientow",
      "Webinar onboardingowy z zespolem produktu",
    ],
    cta: "Dolacz jako biuro",
    href: "/partnerzy/biuro",
    tone: "warning" as const,
  },
  {
    icon: Handshake,
    name: "Program NGO",
    target: "Fundacje i organizacje pomocowe",
    benefits: [
      "Plan Solo+ bezplatny dla wolontariuszy",
      "Skaner nakazu bez limitu",
      "Wsparcie merytoryczne (prawnik dyzurny)",
      "Granty na rozwoj uslug pro bono",
    ],
    cta: "Aplikuj o program NGO",
    href: "/partnerzy/ngo",
    tone: "success" as const,
  },
];

interface Partner {
  name: string;
  type: "kancelaria" | "biuro" | "ngo" | "tech";
  city: string;
  since: string;
}

const PARTNERS: ReadonlyArray<Partner> = [
  { name: "Kancelaria Malinowski i Wspolnicy", type: "kancelaria", city: "Warszawa", since: "2024" },
  { name: "Windyk-Pro Sp. z o.o.", type: "biuro", city: "Poznan", since: "2024" },
  { name: "Fundacja Konsumencka Pro Bono", type: "ngo", city: "Warszawa", since: "2023" },
  { name: "Bank Spoldzielczy w Rzeszowie", type: "biuro", city: "Rzeszow", since: "2025" },
  { name: "Adw. Tomasz Kowalski Kancelaria", type: "kancelaria", city: "Krakow", since: "2025" },
  { name: "BankConnect API", type: "tech", city: "Warszawa", since: "2024" },
  { name: "Fundacja Pomocy Dluznikom", type: "ngo", city: "Wroclaw", since: "2024" },
  { name: "Salesforce Polska", type: "tech", city: "Warszawa", since: "2025" },
];

const TYPE_TONE: Record<Partner["type"], "info" | "warning" | "success" | "neutral"> = {
  kancelaria: "info",
  biuro: "warning",
  ngo: "success",
  tech: "neutral",
};

const TYPE_LABEL: Record<Partner["type"], string> = {
  kancelaria: "Kancelaria",
  biuro: "Biuro / Firma",
  ngo: "NGO",
  tech: "Tech",
};

export default function PartnerzyPage() {
  return (
    <div className="bg-background">
      <section className="border-b border-iron-100 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <Badge tone="neutral" withDot className="mb-4">
            <Handshake className="mr-1 h-3 w-3" />
            Partnerzy
          </Badge>
          <h1 className="font-display text-4xl tracking-tight text-dlugomat-950 sm:text-5xl">
            Rozwijamy legaltech razem.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-iron-600">
            Trzy programy partnerskie dla kancelarii, biur rachunkowych i organizacji pomocowych.
            Wybierz sciezke dopasowana do Twojej dzialalnosci.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="font-display text-2xl text-dlugomat-950">Programy partnerskie</h2>
        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {PROGRAMS.map((p) => {
            const Icon = p.icon;
            return (
              <Card key={p.name} elevation="subtle">
                <CardHeader>
                  <div className="flex h-12 w-12 items-center justify-center rounded-md bg-dlugomat-50">
                    <Icon className="h-6 w-6 text-dlugomat-700" aria-hidden />
                  </div>
                  <CardTitle className="mt-3 text-lg">{p.name}</CardTitle>
                  <CardDescription>
                    <Badge tone={p.tone}>{p.target}</Badge>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {p.benefits.map((b) => (
                      <li key={b} className="flex gap-2 text-sm text-iron-700">
                        <span className="mt-1 h-1.5 w-1.5 flex-none rounded-full bg-dlugomat-700" aria-hidden />
                        {b}
                      </li>
                    ))}
                  </ul>
                  <Button asChild variant="primary" block className="mt-6">
                    <Link href={p.href}>
                      {p.cta}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="border-y border-iron-100 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="font-display text-2xl text-dlugomat-950">Z kim juz wspolpracujemy</h2>
          <p className="mt-2 text-iron-600">{PARTNERS.length} aktywnych partnerow w 8 wojewodztwach.</p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {PARTNERS.map((p) => (
              <Card key={p.name} elevation="flat">
                <CardContent className="flex items-start gap-3 p-4">
                  <Building2 className="mt-1 h-5 w-5 flex-none text-iron-500" aria-hidden />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-dlugomat-900">{p.name}</p>
                    <p className="mt-0.5 text-xs text-iron-500">
                      {p.city} · partner od {p.since}
                    </p>
                    <Badge tone={TYPE_TONE[p.type]} className="mt-2">
                      {TYPE_LABEL[p.type]}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="rounded-lg border border-iron-200 bg-white p-8 text-center">
          <h2 className="font-display text-2xl text-dlugomat-950">
            Nie pasujesz do zadnego programu?
          </h2>
          <p className="mt-2 text-iron-600">
            Mamy tez program integracyjny dla firm tech. Napisz: partnerstwa@dlugomat.pl
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button asChild variant="secondary">
              <Link href="/kontakt?temat=partnerstwo">Skontaktuj sie</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
