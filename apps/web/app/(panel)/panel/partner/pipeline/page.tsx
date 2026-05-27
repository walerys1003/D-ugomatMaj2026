import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Briefcase, Calendar, Mail, Phone } from "lucide-react";

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
  title: "Pipeline · Partner · Długomat",
  description:
    "Tablica kanban Twoich leadów partnerskich: od pierwszego kontaktu po podpisaną umowę.",
};

type Stage = "lead" | "kontakt" | "demo" | "negocjacje" | "wygrana" | "przegrana";

type Deal = {
  id: string;
  company: string;
  contact: string;
  email: string;
  phone?: string;
  estimated_pln: number;
  stage: Stage;
  next_action: string;
  next_action_at: string;
};

const DEALS: Deal[] = [
  {
    id: "d_001",
    company: "Kancelaria Nowak & Partnerzy",
    contact: "mec. Maria Nowak",
    email: "m.nowak@nowak-partners.pl",
    phone: "+48 600 100 200",
    estimated_pln: 36_000,
    stage: "negocjacje",
    next_action: "Przesłać DPA + warunki SLA",
    next_action_at: "2026-05-12",
  },
  {
    id: "d_002",
    company: "BestRecovery Sp. z o.o.",
    contact: "Marek Kalinowski",
    email: "m.kalinowski@bestrecovery.eu",
    estimated_pln: 120_000,
    stage: "demo",
    next_action: "Demo dla zespołu operacji",
    next_action_at: "2026-05-13",
  },
  {
    id: "d_003",
    company: "MS Energy S.A.",
    contact: "Anna Wójcik",
    email: "a.wojcik@ms-energy.pl",
    phone: "+48 22 555 12 34",
    estimated_pln: 240_000,
    stage: "kontakt",
    next_action: "Cold call po LinkedIn",
    next_action_at: "2026-05-11",
  },
  {
    id: "d_004",
    company: "JK Adwokaci",
    contact: "mec. Jan Kowalski",
    email: "j.kowalski@jk-adwokaci.pl",
    estimated_pln: 18_000,
    stage: "wygrana",
    next_action: "Onboarding zespołu (5 prawników)",
    next_action_at: "2026-05-14",
  },
  {
    id: "d_005",
    company: "FastCollect",
    contact: "Piotr Lewandowski",
    email: "p.lewandowski@fastcollect.pl",
    estimated_pln: 48_000,
    stage: "lead",
    next_action: "Pierwszy mail z propozycją",
    next_action_at: "2026-05-11",
  },
  {
    id: "d_006",
    company: "Vega Legal",
    contact: "mec. Tomasz Wiśniewski",
    email: "t.wisniewski@vega-legal.pl",
    estimated_pln: 22_000,
    stage: "przegrana",
    next_action: "Wpisać do nurturing 90d",
    next_action_at: "2026-08-10",
  },
];

const STAGES: { key: Stage; label: string; tone: "neutral" | "info" | "warning" | "success" | "danger" }[] = [
  { key: "lead", label: "Lead", tone: "neutral" },
  { key: "kontakt", label: "Pierwszy kontakt", tone: "info" },
  { key: "demo", label: "Demo", tone: "info" },
  { key: "negocjacje", label: "Negocjacje", tone: "warning" },
  { key: "wygrana", label: "Wygrana", tone: "success" },
  { key: "przegrana", label: "Przegrana", tone: "danger" },
];

function pln(n: number) {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
    maximumFractionDigits: 0,
  }).format(n);
}

export default function PartnerPipelinePage() {
  const totalActive = DEALS.filter((d) => d.stage !== "wygrana" && d.stage !== "przegrana");
  const weightedPipeline = totalActive.reduce((s, d) => s + d.estimated_pln * stageWeight(d.stage), 0);
  const wonPln = DEALS.filter((d) => d.stage === "wygrana").reduce((s, d) => s + d.estimated_pln, 0);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8">
      <header className="flex flex-col gap-2">
        <p className="text-fluid-sm font-semibold uppercase tracking-wider text-dlugomat-600">
          Partner · Sprzedaż
        </p>
        <h1 className="text-fluid-3xl font-bold tracking-tight text-dlugomat-900 dark:text-white">
          Pipeline
        </h1>
        <p className="max-w-2xl text-fluid-base text-ink-600 dark:text-ink-300">
          Wszystkie aktywne deale od pierwszego kontaktu po wygraną. Wagi
          etapów wyliczają realistyczny weighted pipeline.
        </p>
      </header>

      <section
        aria-label="Podsumowanie pipeline"
        className="grid gap-3 sm:grid-cols-3"
      >
        <Stat
          label="Aktywnych deali"
          value={String(totalActive.length)}
          hint={`${DEALS.length} łącznie`}
        />
        <Stat
          label="Weighted pipeline"
          value={pln(weightedPipeline)}
          hint="Z wagą etapu"
        />
        <Stat
          label="Wygrane w tym kwartale"
          value={pln(wonPln)}
          hint="MRR po onboardingu"
        />
      </section>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
        {STAGES.map((s) => {
          const items = DEALS.filter((d) => d.stage === s.key);
          const sum = items.reduce((x, d) => x + d.estimated_pln, 0);
          return (
            <section
              key={s.key}
              aria-label={`Etap ${s.label}`}
              className="flex flex-col gap-2 rounded-xl border border-ink-200 bg-ink-50/40 p-3 dark:border-ink-800 dark:bg-dlugomat-900/30"
            >
              <header className="flex items-center justify-between">
                <Badge tone={s.tone} withDot>
                  {s.label}
                </Badge>
                <span className="text-fluid-xs tabular-nums text-ink-500">
                  {items.length} · {pln(sum)}
                </span>
              </header>
              <ul className="flex flex-col gap-2">
                {items.length === 0 ? (
                  <li className="rounded-md border border-dashed border-ink-200 p-3 text-center text-fluid-xs text-ink-500 dark:border-dlugomat-800">
                    Brak deali
                  </li>
                ) : (
                  items.map((d) => (
                    <li key={d.id}>
                      <Card elevation="flat" className="bg-white dark:bg-ink-950">
                        <CardContent className="flex flex-col gap-2 p-3">
                          <span className="text-fluid-sm font-semibold text-ink-900 dark:text-ink-50">
                            {d.company}
                          </span>
                          <span className="flex items-center gap-1 text-fluid-xs text-ink-500">
                            <Briefcase className="size-3" aria-hidden />
                            {d.contact}
                          </span>
                          <span className="flex items-center gap-1 text-fluid-xs text-ink-500">
                            <Mail className="size-3" aria-hidden />
                            <a
                              href={`mailto:${d.email}`}
                              className="truncate hover:text-dlugomat-700"
                            >
                              {d.email}
                            </a>
                          </span>
                          {d.phone ? (
                            <span className="flex items-center gap-1 text-fluid-xs text-ink-500">
                              <Phone className="size-3" aria-hidden />
                              <a
                                href={`tel:${d.phone.replace(/\s/g, "")}`}
                                className="hover:text-dlugomat-700"
                              >
                                {d.phone}
                              </a>
                            </span>
                          ) : null}
                          <span className="text-fluid-sm font-bold tabular-nums text-dlugomat-700 dark:text-dlugomat-300">
                            {pln(d.estimated_pln)}
                          </span>
                          <span className="rounded-md bg-ink-50 px-2 py-1 text-fluid-xs dark:bg-dlugomat-900">
                            <Calendar className="mr-1 inline size-3 align-text-bottom" aria-hidden />
                            {d.next_action_at} · {d.next_action}
                          </span>
                        </CardContent>
                      </Card>
                    </li>
                  ))
                )}
              </ul>
            </section>
          );
        })}
      </div>

      <Card elevation="subtle">
        <CardHeader>
          <CardTitle className="text-fluid-lg">Wagi etapów</CardTitle>
          <CardDescription>
            Lead 10% · Kontakt 25% · Demo 40% · Negocjacje 70% · Wygrana 100%.
            Konfigurowalne w{" "}
            <Link
              href="/panel/ustawienia"
              className="text-dlugomat-600 hover:underline"
            >
              Ustawieniach
            </Link>
            .
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="secondary">
            <Link href="/panel/partner/raporty">
              Zobacz raporty
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function stageWeight(s: Stage): number {
  switch (s) {
    case "lead":
      return 0.1;
    case "kontakt":
      return 0.25;
    case "demo":
      return 0.4;
    case "negocjacje":
      return 0.7;
    case "wygrana":
      return 1;
    case "przegrana":
      return 0;
  }
}

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <Card elevation="subtle">
      <CardContent className="flex flex-col gap-1 p-5">
        <span className="text-fluid-xs font-semibold uppercase tracking-wider text-ink-500">
          {label}
        </span>
        <span className="text-fluid-2xl font-bold tabular-nums text-ink-900 dark:text-ink-50">
          {value}
        </span>
        <span className="text-fluid-xs text-ink-500">{hint}</span>
      </CardContent>
    </Card>
  );
}
