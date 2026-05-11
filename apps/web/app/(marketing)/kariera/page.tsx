import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  MapPin,
  Briefcase,
  Heart,
  Coffee,
  Laptop,
  BookOpen,
  Users,
  Sparkles,
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
  title: "Kariera — Dlugomat",
  description:
    "Dolacz do zespolu Dlugomat. Budujemy legaltech, ktory naprawde pomaga ludziom. Wynagrodzenia widelkowe, B2B lub UoP, hybryda Warszawa/zdalnie.",
  alternates: { canonical: "/kariera" },
};

interface JobOpening {
  slug: string;
  title: string;
  department: string;
  location: string;
  type: "fulltime" | "contract";
  experience: "junior" | "mid" | "senior";
  salary_min: number;
  salary_max: number;
  currency: "PLN";
  tags: ReadonlyArray<string>;
  highlight: boolean;
}

const OPENINGS: readonly JobOpening[] = [
  {
    slug: "senior-fullstack-engineer",
    title: "Senior Fullstack Engineer (Next.js + Postgres)",
    department: "Inzynieria",
    location: "Warszawa / Zdalnie (PL)",
    type: "fulltime",
    experience: "senior",
    salary_min: 22000,
    salary_max: 32000,
    currency: "PLN",
    tags: ["Next.js 15", "TypeScript", "Postgres", "Supabase"],
    highlight: true,
  },
  {
    slug: "prawnik-product-specialist",
    title: "Prawnik / Product Specialist (Postepowanie cywilne)",
    department: "Produkt",
    location: "Warszawa / Hybryda",
    type: "fulltime",
    experience: "mid",
    salary_min: 14000,
    salary_max: 20000,
    currency: "PLN",
    tags: ["KPC", "EPU", "Windykacja", "UX writing"],
    highlight: true,
  },
  {
    slug: "designer-product",
    title: "Product Designer (B2B SaaS)",
    department: "Produkt",
    location: "Zdalnie (PL/EU)",
    type: "fulltime",
    experience: "mid",
    salary_min: 13000,
    salary_max: 19000,
    currency: "PLN",
    tags: ["Figma", "Design system", "User research"],
    highlight: false,
  },
  {
    slug: "customer-success-manager",
    title: "Customer Success Manager (B2B)",
    department: "Sukces klienta",
    location: "Warszawa",
    type: "fulltime",
    experience: "mid",
    salary_min: 10000,
    salary_max: 16000,
    currency: "PLN",
    tags: ["B2B", "SaaS", "Onboarding", "Kancelarie"],
    highlight: false,
  },
  {
    slug: "data-engineer",
    title: "Data Engineer (OCR + ML pipelines)",
    department: "Inzynieria",
    location: "Zdalnie (PL)",
    type: "contract",
    experience: "senior",
    salary_min: 180,
    salary_max: 260,
    currency: "PLN",
    tags: ["Python", "OCR", "ML", "Airflow"],
    highlight: false,
  },
];

const VALUES = [
  {
    icon: Heart,
    title: "Misja przed marza",
    desc: "Pomagamy ludziom, ktorzy nie maja prawnika za 800 zl/h. Najpierw skutek, potem cennik.",
  },
  {
    icon: Sparkles,
    title: "Rzemioslo, nie hack",
    desc: "Kazda linia kodu i kazdy paragraf piszemy tak, jakbysmy mieli to przeczytac za 5 lat.",
  },
  {
    icon: BookOpen,
    title: "Uczymy sie publicznie",
    desc: "Otwarte raporty post-mortem, otwarty changelog, otwarte cenniki. Bez korporacyjnej mglawicy.",
  },
];

const PERKS = [
  { icon: Laptop, label: "Sprzet MacBook Pro / Linux + monitor 27''" },
  { icon: Coffee, label: "Budzet 4 000 zl rocznie na rozwoj (ksiazki, konferencje, kursy)" },
  { icon: Users, label: "26 dni urlopu (UoP) lub elastyczne dni wolne (B2B)" },
  { icon: MapPin, label: "Biuro w Warszawie (Plac Europejski) lub 100% zdalnie" },
];

const HIRING_PROCESS = [
  { step: 1, title: "Aplikacja", desc: "CV + krotki list. Odpowiadamy w 5 dni roboczych." },
  { step: 2, title: "Rozmowa screenigowa", desc: "30 min z hiring managerem. Bez whiteboardu." },
  { step: 3, title: "Zadanie techniczne", desc: "Max 4 h Twojego czasu. Placimy za rozwiazanie." },
  { step: 4, title: "Rozmowy z zespolem", desc: "2-3 spotkania po 45 min. Bez triku, bez quizu." },
  { step: 5, title: "Decyzja i oferta", desc: "Decyzja w 48 h od ostatniej rozmowy. Widelki znane od poczatku." },
];

const fmt = (n: number) => new Intl.NumberFormat("pl-PL").format(n);

function expLabel(exp: JobOpening["experience"]): string {
  if (exp === "junior") return "Junior";
  if (exp === "mid") return "Mid";
  return "Senior";
}

export default function CareersPage() {
  return (
    <div className="bg-background">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <Badge tone="neutral" withDot className="mb-4">
            <Briefcase className="mr-1 h-3 w-3" />
            Kariera
          </Badge>
          <h1 className="font-display text-4xl tracking-tight text-slate-900 sm:text-5xl">
            Budujemy legaltech, ktory naprawde pomaga.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-600">
            Mamy 1 240 klientow, dwucyfrowe MRR i runway na 24 miesiace. Zatrudniamy ludzi, ktorzy
            chca robic dobra robote — nie zbierac stocki w startupie.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="font-display text-2xl text-slate-900">Aktualne rekrutacje</h2>
        <p className="mt-2 text-sm text-slate-600">
          Widelki wynagrodzen sa jawne. UoP lub B2B — sam wybierasz.
        </p>

        <div className="mt-6 space-y-3">
          {OPENINGS.map((job) => (
            <Card
              key={job.slug}
              elevation={job.highlight ? "pop" : "subtle"}
              urgency={job.highlight ? "success" : "none"}
            >
              <CardContent className="flex flex-wrap items-center justify-between gap-4 p-6">
                <div className="flex-1 min-w-[280px]">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone="neutral" withDot>
                      {job.department}
                    </Badge>
                    <Badge tone="info">{expLabel(job.experience)}</Badge>
                    {job.highlight && <Badge tone="success">Pilne</Badge>}
                  </div>
                  <h3 className="mt-2 font-display text-lg text-slate-900">{job.title}</h3>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-600">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" aria-hidden />
                      {job.location}
                    </span>
                    <span>•</span>
                    <span>{job.type === "fulltime" ? "Pelny etat" : "B2B kontrakt"}</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {job.tags.map((t) => (
                      <span
                        key={t}
                        className="rounded-full bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-700"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <p className="font-display text-lg text-slate-900">
                    {fmt(job.salary_min)}–{fmt(job.salary_max)}{" "}
                    <span className="text-xs font-normal text-slate-500">
                      {job.type === "contract" ? "PLN/dzien" : "PLN/m-c"}
                    </span>
                  </p>
                  <Button asChild variant="primary" size="sm">
                    <Link href={`/kariera/${job.slug}`}>
                      Aplikuj
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="font-display text-2xl text-slate-900">W co wierzymy</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {VALUES.map((v) => {
              const Icon = v.icon;
              return (
                <Card key={v.title} elevation="subtle">
                  <CardHeader>
                    <Icon className="h-6 w-6 text-slate-700" aria-hidden />
                    <CardTitle className="mt-3 text-base">{v.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{v.desc}</CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="font-display text-2xl text-slate-900">Co dajemy</h2>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {PERKS.map((p) => {
            const Icon = p.icon;
            return (
              <li key={p.label} className="flex items-start gap-3 rounded-md border border-slate-200 bg-white p-4">
                <Icon className="h-5 w-5 flex-none text-slate-700" aria-hidden />
                <span className="text-sm text-slate-700">{p.label}</span>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="font-display text-2xl text-slate-900">Jak wyglada rekrutacja</h2>
          <ol className="mt-8 space-y-4">
            {HIRING_PROCESS.map((s) => (
              <li
                key={s.step}
                className="flex items-start gap-4 rounded-md border border-slate-200 bg-slate-50/30 p-4"
              >
                <div className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-slate-900 font-display text-sm text-white">
                  {s.step}
                </div>
                <div>
                  <p className="font-display text-base text-slate-900">{s.title}</p>
                  <p className="mt-1 text-sm text-slate-600">{s.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center">
          <h2 className="font-display text-2xl text-slate-900">
            Nie widzisz swojego stanowiska?
          </h2>
          <p className="mt-2 text-slate-600">
            Napisz na{" "}
            <a href="mailto:kariera@dlugomat.pl" className="text-slate-900 underline underline-offset-4">
              kariera@dlugomat.pl
            </a>
            . Czytamy kazdy mail, nawet jak nie mamy aktualnie roli.
          </p>
        </div>
      </section>
    </div>
  );
}
