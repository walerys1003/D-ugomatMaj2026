import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Github, Linkedin, Mail } from "lucide-react";
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
  title: "Zespol Dlugomat",
  description:
    "Poznaj zespol Dlugomat: inzynierowie, prawnicy, projektanci i CSM. Ludzie, ktorzy buduja legaltech ze skutkiem.",
  alternates: { canonical: "/o-nas/zespol" },
};

interface TeamMember {
  initials: string;
  name: string;
  role: string;
  team: "Zarzad" | "Inzynieria" | "Produkt" | "Prawo" | "Sukces klienta";
  bio: string;
  github?: string;
  linkedin?: string;
  email?: string;
}

const TEAM: readonly TeamMember[] = [
  {
    initials: "WK",
    name: "Walery Kostrzewa",
    role: "CEO i wspolzalozyciel",
    team: "Zarzad",
    bio: "10 lat w legaltech. Wczesniej product lead w fintechu. Magister prawa UW.",
    linkedin: "walerykostrzewa",
    email: "walery@dlugomat.pl",
  },
  {
    initials: "AN",
    name: "Aleksandra Nowak",
    role: "CTO i wspolzalozycielka",
    team: "Zarzad",
    bio: "15 lat w distributed systems. Wczesniej staff engineer w Allegro. PJATK.",
    github: "anovak",
    linkedin: "aleksandranovak",
  },
  {
    initials: "MK",
    name: "Marcin Kaminski",
    role: "Head of Engineering",
    team: "Inzynieria",
    bio: "Next.js, Postgres, infra. Wczesniej tech lead w Booksy. PW Elektronika.",
    github: "mkaminski",
  },
  {
    initials: "JZ",
    name: "Joanna Zielinska",
    role: "Lead Product Designer",
    team: "Produkt",
    bio: "Design system Tarcza. 8 lat w B2B SaaS. ASP Wroclaw.",
    linkedin: "joannazielinska",
  },
  {
    initials: "PM",
    name: "Adw. Piotr Michalski",
    role: "Head of Legal",
    team: "Prawo",
    bio: "Postepowanie cywilne i windykacyjne. 12 lat praktyki. UJ.",
    email: "piotr@dlugomat.pl",
  },
  {
    initials: "KL",
    name: "Katarzyna Lewandowska",
    role: "Head of Customer Success",
    team: "Sukces klienta",
    bio: "Onboarding kancelarii i firm windykacyjnych. Wczesniej w Salesforce. SGH.",
    linkedin: "kasialewandowska",
  },
  {
    initials: "TS",
    name: "Tomasz Sosnowski",
    role: "Senior Backend Engineer",
    team: "Inzynieria",
    bio: "Postgres, OCR, ML. Wczesniej w CD Projekt RED i Brainly. UW.",
    github: "tsosnowski",
  },
  {
    initials: "BW",
    name: "Barbara Wojcik",
    role: "Product Manager",
    team: "Produkt",
    bio: "Roadmapa, user research, dyskoteka z prawnikami. 5 lat w SaaS.",
    linkedin: "barbarawojcik",
  },
];

const TEAM_GROUPS: ReadonlyArray<TeamMember["team"]> = [
  "Zarzad",
  "Inzynieria",
  "Produkt",
  "Prawo",
  "Sukces klienta",
];

const STATS = [
  { label: "Osob w zespole", value: "24" },
  { label: "Krajow pochodzenia", value: "4" },
  { label: "Sredni staz w branzy", value: "9 lat" },
  { label: "% kobiet w zespole", value: "46%" },
];

const TEAM_TONE: Record<TeamMember["team"], "info" | "success" | "warning" | "neutral"> = {
  Zarzad: "warning",
  Inzynieria: "info",
  Produkt: "success",
  Prawo: "neutral",
  "Sukces klienta": "info",
};

export default function TeamPage() {
  return (
    <div className="bg-background">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <Badge tone="neutral" withDot className="mb-4">
            Zespol
          </Badge>
          <h1 className="font-display text-4xl tracking-tight text-slate-900 sm:text-5xl">
            Ludzie, ktorzy buduja Dlugomat.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-600">
            Inzynierowie, prawnicy, projektanci, CSM. Bez sztabu spinow PR-owych. Pelne nazwiska,
            prawdziwe twarze, otwarte profile.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((s) => (
            <Card key={s.label} elevation="subtle">
              <CardContent className="p-6">
                <p className="font-display text-3xl text-slate-900">{s.value}</p>
                <p className="mt-1 text-xs uppercase tracking-wide text-slate-500">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-12">
        {TEAM_GROUPS.map((group) => {
          const members = TEAM.filter((m) => m.team === group);
          if (members.length === 0) return null;
          return (
            <div key={group} className="mb-12">
              <div className="mb-6 flex items-center gap-3">
                <h2 className="font-display text-2xl text-slate-900">{group}</h2>
                <Badge tone={TEAM_TONE[group]}>{members.length}</Badge>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {members.map((m) => (
                  <Card key={m.name} elevation="subtle">
                    <CardHeader>
                      <div className="flex items-start gap-4">
                        <div
                          className="flex h-12 w-12 flex-none items-center justify-center rounded-full bg-slate-900 font-display text-sm text-white"
                          aria-hidden
                        >
                          {m.initials}
                        </div>
                        <div className="min-w-0">
                          <CardTitle className="truncate text-base">{m.name}</CardTitle>
                          <CardDescription className="mt-0.5 text-xs">{m.role}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-slate-600">{m.bio}</p>
                      <div className="mt-3 flex gap-2">
                        {m.github && (
                          <a
                            href={`https://github.com/${m.github}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`GitHub ${m.name}`}
                            className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-100"
                          >
                            <Github className="h-4 w-4" aria-hidden />
                          </a>
                        )}
                        {m.linkedin && (
                          <a
                            href={`https://www.linkedin.com/in/${m.linkedin}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`LinkedIn ${m.name}`}
                            className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-100"
                          >
                            <Linkedin className="h-4 w-4" aria-hidden />
                          </a>
                        )}
                        {m.email && (
                          <a
                            href={`mailto:${m.email}`}
                            aria-label={`Email ${m.name}`}
                            className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-100"
                          >
                            <Mail className="h-4 w-4" aria-hidden />
                          </a>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center">
          <h2 className="font-display text-2xl text-slate-900">Chcesz dolaczyc?</h2>
          <p className="mt-2 text-slate-600">
            Mamy 5 otwartych rekrutacji. Widelki jawne, B2B lub UoP, hybryda lub 100% zdalnie.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button asChild variant="primary">
              <Link href="/kariera">
                Zobacz oferty
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="mailto:kariera@dlugomat.pl">Napisz do nas</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
