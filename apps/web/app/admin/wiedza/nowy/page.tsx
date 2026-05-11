import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Nowy artykuł — Baza wiedzy",
  robots: { index: false, follow: false },
};

const TEMPLATES = [
  {
    id: "tpl_blank",
    name: "Pusty artykuł",
    description: "Zacznij od czystej kartki — sam zdecydujesz o strukturze.",
    sections: 0,
  },
  {
    id: "tpl_how_to",
    name: "Poradnik krok po kroku",
    description: "Klasyczna struktura: problem → wymagania → kroki → FAQ.",
    sections: 5,
  },
  {
    id: "tpl_wzor_pisma",
    name: "Wzór pisma + komentarz",
    description: "Sekcja prawna, wzór dokumentu, instrukcja użycia, podstawa prawna.",
    sections: 4,
  },
  {
    id: "tpl_faq",
    name: "FAQ tematyczne",
    description: "Lista pytań i odpowiedzi z metadanymi schema.org/FAQPage.",
    sections: 1,
  },
  {
    id: "tpl_glossary",
    name: "Wpis słownika",
    description: "Definicja, kontekst, powiązane terminy, linki.",
    sections: 3,
  },
] as const;

export default function NewKnowledgePage() {
  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin/wiedza"
          className="inline-flex items-center gap-2 text-sm text-iron-600 hover:text-dlugomat-900 focus-visible:outline-none focus-visible:shadow-shield-focus rounded"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Wróć do bazy wiedzy
        </Link>
      </div>

      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.18em] text-iron-500">
          Baza wiedzy · nowy artykuł
        </p>
        <h1 className="font-display text-fluid-h1 text-dlugomat-950">
          Wybierz szablon startowy
        </h1>
        <p className="max-w-2xl text-iron-600">
          Szablony przyspieszają tworzenie spójnych artykułów. Każdy z nich można
          dostosować w edytorze.
        </p>
      </header>

      <ul className="grid gap-4 md:grid-cols-2" aria-label="Szablony artykułów">
        {TEMPLATES.map((tpl) => (
          <li key={tpl.id}>
            <Card>
              <CardHeader>
                <div className="flex items-start gap-3">
                  <span className="rounded-md bg-dlugomat-50 p-2">
                    <FileText className="h-5 w-5 text-dlugomat-700" aria-hidden />
                  </span>
                  <div className="flex-1">
                    <CardTitle>{tpl.name}</CardTitle>
                    <CardDescription>{tpl.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <p className="text-xs text-iron-500">
                  {tpl.sections === 0 ? "Bez wstępnych sekcji" : `${tpl.sections} sekcji startowych`}
                </p>
                <Button asChild size="sm">
                  <Link href={`/admin/wiedza/draft?template=${tpl.id}`}>Użyj szablonu</Link>
                </Button>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}
