import type { Metadata } from "next";
import Link from "next/link";
import { Beaker, Info, Target, Users } from "lucide-react";
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
  title: "Nowy eksperyment A/B — Admin Dlugomat",
  description: "Kreator eksperymentu A/B z definicja hipotezy i metryk.",
};

type StepKey = "hypothesis" | "variants" | "audience" | "metrics" | "review";

const STEPS: Array<{ key: StepKey; label: string; description: string }> = [
  { key: "hypothesis", label: "Hipoteza", description: "Co testujesz i dlaczego" },
  { key: "variants", label: "Warianty", description: "Kontrola i alternatywy" },
  { key: "audience", label: "Audytorium", description: "Kto jest objety testem" },
  { key: "metrics", label: "Metryki", description: "Co mierzysz" },
  { key: "review", label: "Podsumowanie", description: "Sprawdzenie konfiguracji" },
];

const METRICS = [
  { id: "m-1", name: "Konwersja rejestracji", type: "primary", baseline: "3.4%" },
  { id: "m-2", name: "Aktywacja w 24h", type: "secondary", baseline: "47%" },
  { id: "m-3", name: "Czas do pierwszej akcji", type: "guardrail", baseline: "08:42" },
  { id: "m-4", name: "Wskaznik bledow", type: "guardrail", baseline: "0.4%" },
];

const AUDIENCES = [
  { id: "a-1", name: "Wszyscy nowi", size: "~2 400 / mies." },
  { id: "a-2", name: "B2C — osoby fizyczne", size: "~1 800 / mies." },
  { id: "a-3", name: "B2B — firmy", size: "~600 / mies." },
  { id: "a-4", name: "Polecenia (referral)", size: "~180 / mies." },
];

type Props = {
  searchParams: Promise<{ step?: string }>;
};

export default async function NewExperimentPage({ searchParams }: Props) {
  const { step = "hypothesis" } = await searchParams;
  const activeIndex = Math.max(
    0,
    STEPS.findIndex((s) => s.key === step),
  );

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-8">
        <Link
          href="/admin/eksperymenty"
          className="text-sm text-slate-600 hover:text-slate-900"
        >
          ← Eksperymenty
        </Link>
        <h1 className="mt-3 font-display text-3xl text-slate-900">
          Nowy eksperyment A/B
        </h1>
        <p className="mt-2 text-slate-600">
          Kreator 5-krokowy: zdefiniuj hipoteze, warianty, audytorium i metryki.
        </p>
      </div>

      <ol className="mb-8 grid grid-cols-5 gap-2">
        {STEPS.map((s, i) => {
          const isActive = i === activeIndex;
          const isDone = i < activeIndex;
          return (
            <li
              key={s.key}
              className={`rounded-lg border p-3 text-left ${
                isActive
                  ? "border-slate-900 bg-slate-900 text-white"
                  : isDone
                    ? "border-emerald-200 bg-emerald-50"
                    : "border-slate-200 bg-white"
              }`}
            >
              <p
                className={`text-xs font-medium ${
                  isActive ? "text-slate-300" : "text-slate-500"
                }`}
              >
                Krok {i + 1}
              </p>
              <p
                className={`mt-1 text-sm font-medium ${
                  isActive ? "text-white" : "text-slate-900"
                }`}
              >
                {s.label}
              </p>
            </li>
          );
        })}
      </ol>

      <Card elevation="subtle" className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Beaker className="h-5 w-5 text-slate-500" />
            {STEPS[activeIndex].label}
          </CardTitle>
          <CardDescription>{STEPS[activeIndex].description}</CardDescription>
        </CardHeader>
        <CardContent>
          {step === "hypothesis" ? (
            <form className="space-y-5">
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium text-slate-900"
                >
                  Nazwa eksperymentu
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="np. CTA na landingu B2C"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:shadow-shield-focus"
                />
              </div>
              <div>
                <label
                  htmlFor="hypothesis"
                  className="mb-2 block text-sm font-medium text-slate-900"
                >
                  Hipoteza
                </label>
                <textarea
                  id="hypothesis"
                  rows={4}
                  placeholder='np. "Zmiana CTA z &quot;Sprobuj za darmo&quot; na &quot;Skanuj nakaz teraz&quot; podniesie konwersje rejestracji o 15%, bo wprost adresuje pilna potrzebe."'
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:shadow-shield-focus"
                />
                <p className="mt-2 text-xs text-slate-500">
                  Format: &quot;Wierze, ze [zmiana] spowoduje [efekt], poniewaz
                  [uzasadnienie]&quot;.
                </p>
              </div>
              <div>
                <label
                  htmlFor="hypothesis-owner"
                  className="mb-2 block text-sm font-medium text-slate-900"
                >
                  Wlasciciel
                </label>
                <select
                  id="hypothesis-owner"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:shadow-shield-focus"
                >
                  <option>Anna Kowalska — Growth</option>
                  <option>Marek Wojcik — Product</option>
                  <option>Kasia Lewandowska — Marketing</option>
                </select>
              </div>
            </form>
          ) : null}

          {step === "variants" ? (
            <form className="space-y-5">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-medium text-slate-900">
                  Kontrola (A) — obecny stan
                </p>
                <p className="mt-1 text-xs text-slate-600">
                  50% ruchu otrzyma obecna wersje
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-4">
                <p className="text-sm font-medium text-slate-900">Wariant B</p>
                <input
                  type="text"
                  placeholder="Opis zmiany"
                  className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus-visible:shadow-shield-focus"
                />
              </div>
              <Button variant="ghost" size="sm" type="button">
                + Dodaj wariant C
              </Button>
            </form>
          ) : null}

          {step === "audience" ? (
            <div className="grid gap-3">
              {AUDIENCES.map((a) => (
                <label
                  key={a.id}
                  className="flex cursor-pointer items-center justify-between rounded-lg border border-slate-200 bg-white p-4 transition has-[:checked]:border-slate-900 has-[:checked]:bg-slate-50"
                >
                  <div className="flex items-center gap-3">
                    <input type="checkbox" defaultChecked={a.id === "a-2"} />
                    <div>
                      <p className="font-medium text-slate-900">{a.name}</p>
                      <p className="text-xs text-slate-600">{a.size}</p>
                    </div>
                  </div>
                  <Users className="h-4 w-4 text-slate-400" />
                </label>
              ))}
            </div>
          ) : null}

          {step === "metrics" ? (
            <div className="space-y-3">
              {METRICS.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4"
                >
                  <div className="flex items-center gap-3">
                    <Target className="h-4 w-4 text-slate-400" />
                    <div>
                      <p className="font-medium text-slate-900">{m.name}</p>
                      <p className="text-xs text-slate-500">
                        Baseline: {m.baseline}
                      </p>
                    </div>
                  </div>
                  <Badge tone={m.type === "primary" ? "success" : m.type === "guardrail" ? "warning" : "info"}>
                    {m.type === "primary"
                      ? "Glowna"
                      : m.type === "guardrail"
                        ? "Strazak"
                        : "Wtorna"}
                  </Badge>
                </div>
              ))}
            </div>
          ) : null}

          {step === "review" ? (
            <div className="space-y-4 text-sm">
              <div className="rounded-lg border border-slate-200 bg-white p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Hipoteza
                </p>
                <p className="mt-1 text-slate-900">
                  Zmiana CTA podniesie konwersje rejestracji o 15%.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-slate-200 bg-white p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    Warianty
                  </p>
                  <p className="mt-1 text-slate-900">A (kontrola) + B (CTA)</p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    Audytorium
                  </p>
                  <p className="mt-1 text-slate-900">B2C ~1 800 / mies.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
                <Info className="mt-0.5 h-4 w-4 text-amber-600" />
                <p className="text-xs text-slate-700">
                  Eksperyment wymaga min. 2 tygodni do osiagniecia istotnosci
                  statystycznej (MDE 5%, alpha 0.05).
                </p>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        {activeIndex > 0 ? (
          <Button asChild variant="ghost" size="sm">
            <Link href={`?step=${STEPS[activeIndex - 1].key}`}>
              ← {STEPS[activeIndex - 1].label}
            </Link>
          </Button>
        ) : (
          <span />
        )}
        {activeIndex < STEPS.length - 1 ? (
          <Button asChild variant="primary" size="sm">
            <Link href={`?step=${STEPS[activeIndex + 1].key}`}>
              Dalej: {STEPS[activeIndex + 1].label} →
            </Link>
          </Button>
        ) : (
          <Button variant="primary" size="sm">
            Uruchom eksperyment
          </Button>
        )}
      </div>
    </div>
  );
}
