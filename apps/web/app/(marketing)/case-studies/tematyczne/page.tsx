import * as React from "react";
import Link from "next/link";
import { ArrowRight, TrendingUp, Building2, Scale, Briefcase, ShieldCheck, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Case studies tematyczne - Dlugomat",
  description: "Konkretne wdrozenia Dlugomat w bankach, kancelariach, windykacji i sektorze publicznym.",
};

type Theme = {
  id: string;
  label: string;
  icon: typeof Building2;
  count: number;
};

const THEMES: Theme[] = [
  { id: "all", label: "Wszystkie", icon: Filter, count: 28 },
  { id: "banking", label: "Bankowosc", icon: Building2, count: 7 },
  { id: "law", label: "Kancelarie", icon: Scale, count: 9 },
  { id: "recovery", label: "Windykacja", icon: Briefcase, count: 8 },
  { id: "public", label: "Sektor publiczny", icon: ShieldCheck, count: 4 },
];

type Study = {
  id: string;
  theme: "banking" | "law" | "recovery" | "public";
  client: string;
  industry: string;
  challenge: string;
  solution: string;
  metric: { label: string; value: string };
  duration: string;
};

const STUDIES: Study[] = [
  {
    id: "cs-001",
    theme: "banking",
    client: "Bank regionalny - 1.2M klientow",
    industry: "Bankowosc detaliczna",
    challenge: "Dlugi czas obslugi reklamacji konsumenckich - 22 dni roboczych, kary UOKiK.",
    solution: "Wdrozenie pelnego workflow reklamacji z AI klasyfikacja, automatyczna odpowiedzia i raportami UOKiK.",
    metric: { label: "Skrocenie czasu reklamacji", value: "-78%" },
    duration: "6 tygodni",
  },
  {
    id: "cs-002",
    theme: "law",
    client: "Kancelaria Adwokacka Nowak i Wspolnicy",
    industry: "Prawo gospodarcze",
    challenge: "Manualnie przygotowywane pisma procesowe zajmowaly 60% czasu wspolnikow.",
    solution: "Generator pism AI z dedykowanym modelem treningowym na bazie 12 lat akt kancelarii.",
    metric: { label: "Wzrost mocy przerobowej", value: "+340%" },
    duration: "10 tygodni",
  },
  {
    id: "cs-003",
    theme: "recovery",
    client: "Firma windykacyjna - 80k spraw rocznie",
    industry: "Windykacja konsumencka",
    challenge: "Niska skutecznosc ugod (28%) i wysokie koszty kontaktu z dluznikiem.",
    solution: "Automatyczne ugody AI w ramach polityki firmy z 4 kanalami kontaktu (SMS/email/IVR/push).",
    metric: { label: "Wzrost skutecznosci ugod", value: "+143%" },
    duration: "8 tygodni",
  },
  {
    id: "cs-004",
    theme: "public",
    client: "Urzad Miasta - 450k mieszkancow",
    industry: "Administracja publiczna",
    challenge: "Wezwania do zaplaty oplat lokalnych generowane recznie, 14% bledow danych.",
    solution: "Integracja z systemem dziedzinowym i automatyczne wezwania ePUAP z weryfikacja CEPiK/PESEL.",
    metric: { label: "Redukcja bledow", value: "-92%" },
    duration: "12 tygodni",
  },
  {
    id: "cs-005",
    theme: "banking",
    client: "Bank korporacyjny - segment SME",
    industry: "Bankowosc korporacyjna",
    challenge: "Restrukturyzacja portfela MSP - 4200 spraw, kazda wymaga indywidualnej analizy.",
    solution: "AI scoring zdolnosci splaty z propozycja planu i automatyczna negocjacja z klientem.",
    metric: { label: "Wzrost odzyskanych kwot", value: "+62%" },
    duration: "16 tygodni",
  },
  {
    id: "cs-006",
    theme: "law",
    client: "Kancelaria radcowska - 18 prawnikow",
    industry: "Prawo cywilne i rodzinne",
    challenge: "Klienci dzwonili 12-15 razy tygodniowo z pytaniami o status sprawy.",
    solution: "Panel klienta white-label z synchronizacja statusow i bezpiecznym czatem.",
    metric: { label: "Spadek liczby telefonow", value: "-71%" },
    duration: "4 tygodnie",
  },
  {
    id: "cs-007",
    theme: "recovery",
    client: "Funduszu sekurytyzacyjny",
    industry: "Zarzadzanie wierzytelnosciami",
    challenge: "Wycena portfeli wierzytelnosci na podstawie 0.5% probki - duza niepewnosc.",
    solution: "AI scoring 100% portfela z analiza historii kontaktow i sciezki egzekucyjnej.",
    metric: { label: "Trafnosc wyceny", value: "94%" },
    duration: "9 tygodni",
  },
  {
    id: "cs-008",
    theme: "law",
    client: "Kancelaria upadlosciowa",
    industry: "Upadlosc konsumencka",
    challenge: "Sredni czas przygotowania wniosku o upadlosc konsumencka - 18 godzin.",
    solution: "Generator wnioskow AI z automatyczna weryfikacja kompletu zalacznikow i KRZ.",
    metric: { label: "Sredni czas wniosku", value: "2.5h" },
    duration: "6 tygodni",
  },
];

const THEME_LABEL = {
  banking: "Bankowosc",
  law: "Kancelarie",
  recovery: "Windykacja",
  public: "Sektor publiczny",
};

const THEME_TONE = {
  banking: "info" as const,
  law: "success" as const,
  recovery: "warning" as const,
  public: "neutral" as const,
};

export default function CaseStudiesTematycznePage() {
  return (
    <div className="min-h-screen bg-dlugomat-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <header className="mb-12 max-w-3xl">
          <Badge tone="info" className="mb-4">Case studies</Badge>
          <h1 className="font-display text-4xl sm:text-5xl text-dlugomat-950 mb-4">
            Konkretne wdrozenia, mierzalne efekty
          </h1>
          <p className="text-xl text-dlugomat-700">
            Wybrane wdrozenia z 4 sektorow: bankowosc, kancelarie prawne, windykacja i administracja publiczna.
            Wszystkie liczby zweryfikowane przez klienta.
          </p>
        </header>

        <nav aria-label="Filtry tematyczne" className="mb-8">
          <div className="flex flex-wrap gap-2">
            {THEMES.map((theme, idx) => {
              const Icon = theme.icon;
              return (
                <button
                  key={theme.id}
                  type="button"
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-md border text-sm font-medium focus-visible:shadow-shield-focus focus-visible:outline-none ${
                    idx === 0
                      ? "bg-dlugomat-900 text-white border-dlugomat-900"
                      : "bg-white text-dlugomat-800 border-iron-300 hover:bg-dlugomat-50"
                  }`}
                  aria-pressed={idx === 0}
                >
                  <Icon className="h-4 w-4" aria-hidden />
                  {theme.label}
                  <span
                    className={`ml-1 text-xs px-1.5 py-0.5 rounded ${
                      idx === 0 ? "bg-white/20" : "bg-iron-100 text-dlugomat-700"
                    }`}
                  >
                    {theme.count}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          {STUDIES.map((study) => (
            <Card key={study.id} elevation="subtle">
              <CardHeader>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <Badge tone={THEME_TONE[study.theme]}>{THEME_LABEL[study.theme]}</Badge>
                  <span className="text-xs text-dlugomat-600">{study.duration}</span>
                </div>
                <CardTitle className="text-lg">{study.client}</CardTitle>
                <CardDescription>{study.industry}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-xs uppercase tracking-wide text-dlugomat-600 mb-1">Wyzwanie</div>
                  <p className="text-sm text-dlugomat-800">{study.challenge}</p>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-dlugomat-600 mb-1">Rozwiazanie</div>
                  <p className="text-sm text-dlugomat-800">{study.solution}</p>
                </div>
                <div className="rounded-md bg-accent-50 border border-accent-200 p-3 flex items-center gap-3">
                  <TrendingUp className="h-5 w-5 text-accent-700 shrink-0" aria-hidden />
                  <div>
                    <div className="text-xs uppercase tracking-wide text-accent-700">{study.metric.label}</div>
                    <div className="font-display text-2xl text-accent-700">{study.metric.value}</div>
                  </div>
                </div>
                <Button variant="secondary" size="sm" asChild>
                  <Link href={`/case-studies/${study.id}`}>
                    Czytaj pelny case study
                    <ArrowRight className="h-3.5 w-3.5 ml-1.5" aria-hidden />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card elevation="pop">
          <CardContent className="pt-6 pb-6 text-center">
            <h2 className="font-display text-2xl text-dlugomat-950 mb-2">Twoja organizacja moze byc nastepna</h2>
            <p className="text-dlugomat-700 mb-6 max-w-2xl mx-auto">
              Pokazemy Ci szacowane wyniki na podstawie Twoich danych - bez wczesniejszego wdrozenia.
            </p>
            <Button variant="primary" asChild>
              <Link href="/kontakt/demo">
                Zamow analize ROI
                <ArrowRight className="h-4 w-4 ml-2" aria-hidden />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
