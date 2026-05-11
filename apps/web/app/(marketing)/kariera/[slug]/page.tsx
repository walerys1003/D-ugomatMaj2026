import * as React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  MapPin,
  Briefcase,
  Clock,
  Users,
  CheckCircle2,
  Heart,
  Code2,
  Send,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Oferta pracy - Dlugomat",
  description: "Pelne szczegoly oferty pracy w Dlugomat - zakres obowiazkow, oczekiwania, warunki.",
};

type JobOffer = {
  slug: string;
  title: string;
  team: string;
  location: string;
  employmentType: "umowa o prace" | "B2B" | "umowa zlecenie";
  seniority: "junior" | "mid" | "senior" | "lead";
  remote: "remote" | "hybrid" | "office";
  salaryFrom: number;
  salaryTo: number;
  postedAt: string;
  applicants: number;
  description: string;
  responsibilities: string[];
  requirements: string[];
  niceToHave: string[];
  techStack: string[];
  benefits: string[];
};

const OFFERS: Record<string, JobOffer> = {
  "senior-frontend-engineer": {
    slug: "senior-frontend-engineer",
    title: "Senior Frontend Engineer",
    team: "Zespol Produktu",
    location: "Warszawa",
    employmentType: "B2B",
    seniority: "senior",
    remote: "hybrid",
    salaryFrom: 22000,
    salaryTo: 32000,
    postedAt: "2026-05-05",
    applicants: 87,
    description:
      "Dolacz do zespolu produktowego Dlugomat, gdzie tworzymy panel kandydata-dluznika, panele kancelarii oraz admin. Pracujemy z prawdziwymi sprawami klientow - kazda zmiana ma realny wplyw na pomoc osobom zadluzonym.",
    responsibilities: [
      "Projektowanie i implementacja widokow w Next.js 15 / React 19",
      "Wspolprojektowanie design systemu Tarcza wraz z zespolem UX",
      "Optymalizacja wydajnosci (Core Web Vitals, p95 ponizej 100ms)",
      "Code review i mentoring 2 osob w zespole",
      "Wspolpraca z backend (Go), AI (Python) i product designers",
    ],
    requirements: [
      "Minimum 5 lat doswiadczenia komercyjnego z React",
      "Znajomosc Next.js App Router (server components, streaming, RSC)",
      "TypeScript w trybie strict, znajomosc generics i utility types",
      "Doswiadczenie z Tailwind, design systems, dostepnoscia (WCAG 2.2 AA)",
      "Znajomosc testow: Vitest, Playwright, Testing Library",
    ],
    niceToHave: [
      "Doswiadczenie z legaltech, fintech lub regulowanymi branzami",
      "Praca z duzymi formami i tabelami (React Hook Form, TanStack Table)",
      "Wystapienia konferencyjne lub publikacje techniczne",
    ],
    techStack: ["Next.js 15", "React 19", "TypeScript 5", "Tailwind 4", "TanStack Query", "Playwright", "Vitest"],
    benefits: [
      "Prywatna opieka medyczna Lux Med Premium dla rodziny",
      "Karta MultiSport Plus",
      "Budzet 6000 PLN rocznie na ksiazki, kursy, konferencje",
      "20 dni urlopu B2B + 8 dni chorobowych platnych",
      "MacBook Pro M4 Max + monitor 4K + ergonomia",
      "Hybrid 2 dni w biurze (centrum Warszawy) lub fully remote po 6 m-cach",
    ],
  },
};

const SENIORITY_LABEL = {
  junior: "Junior",
  mid: "Mid",
  senior: "Senior",
  lead: "Lead",
};

const SENIORITY_TONE = {
  junior: "info" as const,
  mid: "success" as const,
  senior: "warning" as const,
  lead: "danger" as const,
};

const REMOTE_LABEL = {
  remote: "Pelny remote",
  hybrid: "Hybryda",
  office: "Biuro",
};

type Params = Promise<{ slug: string }>;

export default async function OfertaPracyPage({ params }: { params: Params }) {
  const { slug } = await params;
  const offer = OFFERS[slug] ?? OFFERS["senior-frontend-engineer"];
  if (!offer) notFound();

  const currencyFmt = new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
    maximumFractionDigits: 0,
  });
  const dateFmt = new Intl.DateTimeFormat("pl-PL", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="min-h-screen bg-dlugomat-50">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            href="/kariera"
            className="inline-flex items-center gap-2 text-sm text-dlugomat-700 hover:text-dlugomat-900 focus-visible:shadow-shield-focus rounded-md"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Powrot do ofert pracy
          </Link>
        </div>

        <header className="mb-8">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <Badge tone={SENIORITY_TONE[offer.seniority]}>{SENIORITY_LABEL[offer.seniority]}</Badge>
            <Badge tone="neutral">{offer.team}</Badge>
            <Badge tone="info">{REMOTE_LABEL[offer.remote]}</Badge>
            <Badge tone="success">{offer.employmentType}</Badge>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl text-dlugomat-950 mb-3">{offer.title}</h1>
          <div className="flex items-center gap-4 text-dlugomat-700 text-sm flex-wrap">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-4 w-4" aria-hidden />
              {offer.location}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-4 w-4" aria-hidden />
              Opublikowano {dateFmt.format(new Date(offer.postedAt))}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Users className="h-4 w-4" aria-hidden />
              {offer.applicants} aplikacji
            </span>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>O stanowisku</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-dlugomat-800 leading-relaxed">{offer.description}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-accent-600" aria-hidden />
                  Zakres obowiazkow
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {offer.responsibilities.map((r) => (
                    <li key={r} className="flex items-start gap-2 text-dlugomat-800 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-accent-600 shrink-0 mt-0.5" aria-hidden />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Wymagania</CardTitle>
                <CardDescription>To czego oczekujemy obowiazkowo</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {offer.requirements.map((r) => (
                    <li key={r} className="flex items-start gap-2 text-dlugomat-800 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" aria-hidden />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Mile widziane</CardTitle>
                <CardDescription>Plus dla aplikacji, ale nie wymagane</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {offer.niceToHave.map((r) => (
                    <li key={r} className="flex items-start gap-2 text-dlugomat-800 text-sm">
                      <span className="text-accent-600 mt-0.5">+</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-accent-600" aria-hidden />
                  Co oferujemy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {offer.benefits.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-dlugomat-800 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-accent-600 shrink-0 mt-0.5" aria-hidden />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          <aside className="space-y-6 lg:sticky lg:top-6 self-start">
            <Card elevation="pop">
              <CardHeader>
                <CardTitle className="text-base">Wynagrodzenie</CardTitle>
                <CardDescription>{offer.employmentType} - widelek</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="font-display text-2xl text-dlugomat-950 mb-1">
                  {currencyFmt.format(offer.salaryFrom)} - {currencyFmt.format(offer.salaryTo)}
                </div>
                <div className="text-xs text-dlugomat-600">netto miesiecznie / B2B</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Code2 className="h-4 w-4 text-accent-600" aria-hidden />
                  Stack technologiczny
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1.5">
                  {offer.techStack.map((t) => (
                    <Badge key={t} tone="neutral">
                      {t}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card elevation="pop">
              <CardContent className="pt-6">
                <p className="text-sm text-dlugomat-800 mb-4">
                  Zainteresowala Cie ta rola? Aplikacja zajmie 4 minuty - pelne CV nie jest wymagane.
                </p>
                <Button variant="primary" block asChild>
                  <Link href={`/kariera/${offer.slug}/aplikuj`}>
                    <Send className="h-4 w-4 mr-2" aria-hidden />
                    Aplikuj na to stanowisko
                    <ArrowRight className="h-4 w-4 ml-2" aria-hidden />
                  </Link>
                </Button>
                <p className="mt-3 text-xs text-dlugomat-600 text-center">
                  Odpowiadamy w ciagu 3 dni roboczych
                </p>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}
