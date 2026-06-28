import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  Gauge,
  Plug,
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
  title: "Modul — Dlugomat",
  description: "Szczegoly modulu produktu Dlugomat z funkcjami i integracjami.",
};

type Module = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  category: "core" | "ai" | "ops" | "compliance";
  features: Array<{ title: string; description: string }>;
  integrations: string[];
  metrics: Array<{ label: string; value: string }>;
  pricing: { plan: string; included: boolean }[];
};

const MODULES: Record<string, Module> = {
  "skaner-pism": {
    slug: "skaner-pism",
    name: "Skaner pism",
    tagline: "OCR + klasyfikacja prawna w 30 sekund",
    description:
      "Zeskanowane pismo procesowe jest automatycznie rozpoznawane, klasyfikowane i analizowane pod katem ryzyk prawnych. Wbudowane wyszukiwanie podstawy prawnej i orzecznictwa.",
    category: "ai",
    features: [
      {
        title: "OCR wielojezyczny",
        description: "Polski, niemiecki, czeski, slowacki — z rozpoznawaniem podpisow.",
      },
      {
        title: "Klasyfikacja AI",
        description: "Rozpoznaje 47 typow pism sadowych i wezwan z dokladnoscia 96%.",
      },
      {
        title: "Wyciag kluczowych danych",
        description: "Sygnatura, kwota, sad, termin, wierzyciel — w postaci strukturalnej.",
      },
      {
        title: "Audyt prawny",
        description: "3 ryzyka i 2 sciezki obrony w ciagu 30 sekund od skanu.",
      },
    ],
    integrations: ["EPU", "PESEL", "REGON", "KRS", "BIK"],
    metrics: [
      { label: "Dokladnosc OCR", value: "98,4%" },
      { label: "Sredni czas analizy", value: "27 s" },
      { label: "Skanowanych pism / dzien", value: "14 200" },
    ],
    pricing: [
      { plan: "Free", included: false },
      { plan: "Pro", included: true },
      { plan: "Business", included: true },
      { plan: "Enterprise", included: true },
    ],
  },
};

const CATEGORY_LABEL: Record<Module["category"], string> = {
  core: "Funkcja podstawowa",
  ai: "Sztuczna inteligencja",
  ops: "Operacje",
  compliance: "Zgodnosc",
};

const CATEGORY_TONE: Record<
  Module["category"],
  "neutral" | "info" | "warning" | "success"
> = {
  core: "neutral",
  ai: "info",
  ops: "neutral",
  compliance: "warning",
};

async function loadModule(slug: string): Promise<Module | null> {
  return MODULES[slug] ?? MODULES["skaner-pism"] ?? null;
}

export default async function ModulePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const mod = await loadModule(slug);
  if (!mod) return notFound();

  return (
    <div className="bg-slate-50">
      <section className="mx-auto max-w-6xl px-6 pt-16 pb-12">
        <Link
          href="/moduly"
          className="text-sm text-slate-600 hover:text-slate-900"
        >
          ← Wszystkie moduly
        </Link>
        <div className="mt-4 flex items-center gap-2">
          <Badge tone={CATEGORY_TONE[mod.category]}>
            {CATEGORY_LABEL[mod.category]}
          </Badge>
        </div>
        <h1 className="mt-3 max-w-3xl font-display text-4xl text-slate-900 sm:text-5xl">
          {mod.name}
        </h1>
        <p className="mt-2 text-lg text-slate-600">{mod.tagline}</p>
        <p className="mt-4 max-w-2xl text-slate-600">{mod.description}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild variant="primary" size="lg">
            <Link href="/rejestracja">
              Wyprobuj modul
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="secondary" size="lg">
            <Link href="/kontakt/demo">Umow demo</Link>
          </Button>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-4 sm:grid-cols-3">
          {mod.metrics.map((m) => (
            <Card key={m.label} elevation="subtle">
              <CardContent className="py-6">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  {m.label}
                </p>
                <p className="mt-2 font-display text-2xl text-slate-900">
                  {m.value}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <h2 className="font-display text-2xl text-slate-900">
          Co umie ten modul
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {mod.features.map((f) => (
            <Card key={f.title} elevation="subtle">
              <CardContent className="flex gap-4 py-5">
                <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-slate-500" />
                <div>
                  <p className="font-medium text-slate-900">{f.title}</p>
                  <p className="mt-1 text-sm text-slate-600">{f.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-6 lg:grid-cols-2">
          <Card elevation="subtle">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Plug className="h-5 w-5 text-slate-500" />
                Integracje
              </CardTitle>
              <CardDescription>
                Modul wspolpracuje z systemami zewnetrznymi
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {mod.integrations.map((i) => (
                  <Badge key={i} tone="neutral">
                    {i}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card elevation="subtle">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Gauge className="h-5 w-5 text-slate-500" />
                Dostepnosc w planach
              </CardTitle>
              <CardDescription>
                W ktorych planach jest aktywny
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {mod.pricing.map((p) => (
                  <li
                    key={p.plan}
                    className="flex items-center justify-between gap-3 rounded-md border border-slate-200 bg-white px-3 py-2"
                  >
                    <span className="text-slate-700">{p.plan}</span>
                    {p.included ? (
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-700">
                        <CheckCircle2 className="h-4 w-4" />
                        W planie
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20">
        <Card elevation="pop" className="bg-slate-900 text-white">
          <CardContent className="flex flex-col items-start gap-4 py-8 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <FileText className="mt-1 h-6 w-6 text-slate-300" />
              <div>
                <p className="font-display text-xl">
                  Gotowy zobaczyc {mod.name.toLowerCase()} w akcji?
                </p>
                <p className="mt-1 text-sm text-slate-300">
                  Demo na zywo z prawnikiem — 30 minut, bez zobowiazan.
                </p>
              </div>
            </div>
            <Button asChild variant="primary" size="lg">
              <Link href="/kontakt/demo">Umow demo</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
