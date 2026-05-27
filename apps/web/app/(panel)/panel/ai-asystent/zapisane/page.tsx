import type { Metadata } from "next";
import Link from "next/link";
import { Bookmark, Copy, Pencil, Sparkles, Tag } from "lucide-react";

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
  title: "Zapisane prompty — AI asystent",
  description: "Twoje ulubione zapytania i szablony rozmów z asystentem prawnym.",
};

interface SavedPrompt {
  id: string;
  title: string;
  prompt: string;
  category: "Pismo" | "Analiza" | "Negocjacje" | "Wniosek" | "Wycena";
  tags: string[];
  uses: number;
  last_used: string;
}

const PROMPTS: SavedPrompt[] = [
  {
    id: "p_001",
    title: "Wniosek o korektę BIK",
    prompt:
      "Napisz wniosek o korektę wpisu w BIK dotyczący kredytu spłaconego w {{rok}} r. w {{bank}}. Powołaj się na art. 105a Prawa bankowego.",
    category: "Pismo",
    tags: ["BIK", "korekta", "art. 105a"],
    uses: 12,
    last_used: "2026-05-10",
  },
  {
    id: "p_002",
    title: "Analiza umowy kredytu",
    prompt:
      "Przeanalizuj załączoną umowę kredytu i wskaż: 1) potencjalne klauzule abuzywne, 2) niejasne zapisy, 3) ryzyka dla konsumenta.",
    category: "Analiza",
    tags: ["umowa", "kredyt", "klauzule abuzywne"],
    uses: 8,
    last_used: "2026-05-07",
  },
  {
    id: "p_003",
    title: "Propozycja ugody z windykatorem",
    prompt:
      "Sformułuj propozycję ugody dla firmy windykacyjnej {{firma}} na kwotę {{kwota}} PLN — rozłożenie na {{raty}} rat. Ton: stanowczy, ale otwarty.",
    category: "Negocjacje",
    tags: ["windykacja", "ugoda", "raty"],
    uses: 6,
    last_used: "2026-05-04",
  },
  {
    id: "p_004",
    title: "Wniosek o ograniczenie egzekucji",
    prompt:
      "Napisz wniosek do komornika o ograniczenie egzekucji z wynagrodzenia powołując się na kwotę wolną i sytuację rodzinną dłużnika.",
    category: "Wniosek",
    tags: ["komornik", "wynagrodzenie", "kwota wolna"],
    uses: 9,
    last_used: "2026-05-02",
  },
  {
    id: "p_005",
    title: "Wycena szans sprawy",
    prompt:
      "Oszacuj szanse powodzenia mojej sprawy na podstawie opisu: {{opis}}. Wskaż mocne i słabe strony oraz rekomendowaną strategię.",
    category: "Wycena",
    tags: ["szanse", "strategia"],
    uses: 4,
    last_used: "2026-04-29",
  },
  {
    id: "p_006",
    title: "Pismo do banku o reklamację",
    prompt:
      "Sformułuj reklamację do banku {{bank}} w sprawie błędnie naliczonej raty z {{data}}. Załącz wezwanie do zwrotu nadpłaty w 14 dni.",
    category: "Pismo",
    tags: ["bank", "reklamacja", "rata"],
    uses: 5,
    last_used: "2026-04-25",
  },
];

const CATEGORY_TONE: Record<SavedPrompt["category"], "info" | "warning" | "success" | "neutral" | "danger"> = {
  Pismo: "info",
  Analiza: "warning",
  Negocjacje: "success",
  Wniosek: "neutral",
  Wycena: "danger",
};

export default function ZapisanePage() {
  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.18em] text-ink-500">
            AI asystent · biblioteka promptów
          </p>
          <h1 className="font-display text-fluid-h1 text-dlugomat-950">
            Zapisane prompty
          </h1>
          <p className="max-w-2xl text-ink-600">
            Twoje sprawdzone szablony zapytań. Używaj zmiennych w nawiasach{" "}
            <code className="text-xs">{"{{nazwa}}"}</code>, aby szybko dostosować prompt
            do konkretnej sprawy.
          </p>
        </div>
        <Button>
          <Bookmark className="mr-2 h-4 w-4" aria-hidden />
          Zapisz nowy prompt
        </Button>
      </header>

      <section className="grid gap-4 sm:grid-cols-3" aria-label="Statystyki">
        <Card>
          <CardHeader>
            <CardDescription>Zapisane prompty</CardDescription>
            <CardTitle className="font-display text-fluid-h3 text-dlugomat-950">
              {PROMPTS.length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Użycia łącznie</CardDescription>
            <CardTitle className="font-display text-fluid-h3 text-dlugomat-950">
              {PROMPTS.reduce((s, p) => s + p.uses, 0)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Kategorii</CardDescription>
            <CardTitle className="font-display text-fluid-h3 text-dlugomat-950">
              {new Set(PROMPTS.map((p) => p.category)).size}
            </CardTitle>
          </CardHeader>
        </Card>
      </section>

      <ul className="grid gap-4 md:grid-cols-2" aria-label="Lista zapisanych promptów">
        {PROMPTS.map((p) => (
          <li key={p.id}>
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle>{p.title}</CardTitle>
                  <Badge tone={CATEGORY_TONE[p.category]} withDot>
                    {p.category}
                  </Badge>
                </div>
                <CardDescription>
                  Użyty {p.uses}× · ostatnio {p.last_used}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="rounded-md bg-ink-50 p-3 text-sm font-mono text-ink-800 leading-relaxed">
                  {p.prompt}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {p.tags.map((t) => (
                    <Badge key={t} tone="neutral">
                      <Tag className="mr-1 h-3 w-3" aria-hidden />
                      {t}
                    </Badge>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  <Button size="sm" asChild>
                    <Link href={`/panel/ai-asystent?prompt=${p.id}`}>
                      <Sparkles className="mr-2 h-4 w-4" aria-hidden />
                      Użyj
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Copy className="mr-2 h-4 w-4" aria-hidden />
                    Kopiuj
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Pencil className="mr-2 h-4 w-4" aria-hidden />
                    Edytuj
                  </Button>
                </div>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}
