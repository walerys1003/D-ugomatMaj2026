import * as React from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Shield, TrendingUp, Building2, Clock, Briefcase, Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Dlugomat dla firmy - rozwiazania korporacyjne",
  description: "Platforma dla bankow, kancelarii, firm windykacyjnych - automatyzacja workflow, zgodnosc, skala.",
};

const VALUE_PROPS = [
  {
    icon: TrendingUp,
    title: "Skrocenie cyklu do 12x",
    description: "Automatyzacja workflow od zgloszenia do zamkniecia sprawy. Mniej rak na klienta, lepsze SLA.",
  },
  {
    icon: Shield,
    title: "Pelna zgodnosc",
    description: "UOKiK, KNF, RODO, AML - gotowe szablony, audyty, raporty. Spelniamy wymagania regulatorow.",
  },
  {
    icon: Building2,
    title: "Skala enterprise",
    description: "Obslugujemy ponad 80 000 spraw rocznie u jednego klienta. SLA 99.95%, mTLS, dedykowany VPC.",
  },
  {
    icon: Award,
    title: "Wdrozenie w 4-12 tygodni",
    description: "Dedykowany zespol implementacyjny. Integracje API/webhook z systemami klienta.",
  },
];

const TARGET_SEGMENTS = [
  {
    name: "Banki i instytucje finansowe",
    description: "Reklamacje konsumenckie, restrukturyzacje, raporty KNF",
    metric: "Banki 8",
    link: "/dla-bankow",
  },
  {
    name: "Kancelarie prawne",
    description: "Generator pism AI, baza orzecznicza, panel klienta white-label",
    metric: "Kancelarii 340+",
    link: "/dla-kancelarii",
  },
  {
    name: "Firmy windykacyjne",
    description: "Automatyczne ugody, multikana lowa komunikacja, raporty zgodnosci",
    metric: "Firm 124",
    link: "/dla-windykacji",
  },
  {
    name: "Sektor publiczny",
    description: "Wezwania ePUAP, integracje CEPiK/PESEL, raporty NIK",
    metric: "Urzedow 28",
    link: "/dla-sektora-publicznego",
  },
];

const PROOF_POINTS = [
  { value: "80k+", label: "Spraw rocznie u jednego klienta" },
  { value: "99.95%", label: "SLA dostepnosci" },
  { value: "4-12 tyg", label: "Czas wdrozenia" },
  { value: "ISO 27001", label: "Certyfikat bezpieczenstwa" },
];

const PRICING_NOTES = [
  "Wycena na podstawie wolumenu spraw i wymaganych integracji",
  "Dedykowany Customer Success Manager od dnia 1",
  "Onboarding zespolu klienta wliczony w cene",
  "Mozliwosc rozliczenia per-case lub flat fee",
];

export default function LpFirmaPage() {
  return (
    <div className="min-h-screen bg-dlugomat-50">
      <section className="bg-dlugomat-950 text-white">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <Badge tone="info" className="mb-4">Dla firm i instytucji</Badge>
            <h1 className="font-display text-4xl sm:text-6xl mb-6">
              Platforma legaltech dla skali enterprise
            </h1>
            <p className="text-xl text-dlugomat-200 mb-8">
              Dlugomat automatyzuje obslug e spraw zwiazanych z zadluzeniem, reklamacjami i restrukturyzacjami.
              Banki, kancelarie i firmy windykacyjne uzyskuja 12x skrocenie cyklu przy pelnej zgodnosci regulacyjnej.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="primary" size="lg" asChild>
                <Link href="/kontakt/demo">
                  Zamow demo dla zespolu
                  <ArrowRight className="h-4 w-4 ml-2" aria-hidden />
                </Link>
              </Button>
              <Button variant="ghost" size="lg" asChild className="text-white hover:text-white border border-white/20">
                <Link href="/case-studies/tematyczne">Zobacz case studies</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-white border-b border-iron-200">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {PROOF_POINTS.map((p) => (
              <div key={p.label} className="text-center">
                <div className="font-display text-3xl sm:text-4xl text-accent-700 mb-1">{p.value}</div>
                <div className="text-sm text-dlugomat-700">{p.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl text-dlugomat-950 mb-3 text-center">Co dostaniecie</h2>
          <p className="text-dlugomat-700 text-center mb-10 max-w-2xl mx-auto">
            Cztery filary platformy, ktore razem daja przewage operacyjna i regulacyjna.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {VALUE_PROPS.map((vp) => {
              const Icon = vp.icon;
              return (
                <Card key={vp.title} elevation="subtle">
                  <CardContent className="pt-6">
                    <div className="flex gap-4">
                      <div className="p-3 rounded-md bg-accent-50 text-accent-700 shrink-0">
                        <Icon className="h-6 w-6" aria-hidden />
                      </div>
                      <div>
                        <h3 className="font-display text-xl text-dlugomat-950 mb-2">{vp.title}</h3>
                        <p className="text-dlugomat-700">{vp.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white border-y border-iron-200">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl text-dlugomat-950 mb-10 text-center">Rozwiazania dla branzy</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {TARGET_SEGMENTS.map((seg) => (
              <Card key={seg.name}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <CardTitle className="text-lg">{seg.name}</CardTitle>
                    <Badge tone="neutral">{seg.metric}</Badge>
                  </div>
                  <CardDescription>{seg.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link
                    href={seg.link}
                    className="inline-flex items-center gap-1 text-sm text-accent-700 hover:text-accent-900 font-medium focus-visible:shadow-shield-focus rounded"
                  >
                    Dowiedz sie wiecej
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Card elevation="pop">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-accent-600" aria-hidden />
                Model wspolpracy
              </CardTitle>
              <CardDescription>Elastyczne podejscie dopasowane do skali biznesu</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {PRICING_NOTES.map((note) => (
                  <li key={note} className="flex items-start gap-2 text-dlugomat-800">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" aria-hidden />
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 p-4 rounded-md bg-dlugomat-50 border border-iron-200 flex items-center gap-3">
                <Clock className="h-5 w-5 text-accent-600 shrink-0" aria-hidden />
                <p className="text-sm text-dlugomat-800">
                  Pierwsza rozmowa z zespolem komercyjnym w ciagu 24 godzin od zgloszenia. Bez sztywnego skryptu sprzedazowego.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="py-16 bg-dlugomat-950 text-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-3xl sm:text-4xl mb-4">Porozmawiajmy o Twojej skali</h2>
          <p className="text-dlugomat-200 text-lg mb-8 max-w-2xl mx-auto">
            Pokazemy demo dopasowane do specyfiki Twojej organizacji - z liczbami, integracjami i analiza ROI.
          </p>
          <Button variant="primary" size="lg" asChild>
            <Link href="/kontakt/demo">
              Zamow demo dla zespolu
              <ArrowRight className="h-4 w-4 ml-2" aria-hidden />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
