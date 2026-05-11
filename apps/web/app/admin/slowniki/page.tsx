import * as React from "react";
import Link from "next/link";
import { BookOpen, Plus, Search, Edit3, Database, Globe, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Slowniki systemowe - Dlugomat Admin",
  description: "Zarzadzanie slownikami referencyjnymi: statusy spraw, typy pism, klasyfikacje wierzycieli.",
};

type Dictionary = {
  id: string;
  name: string;
  description: string;
  entries: number;
  scope: "global" | "tenant";
  category: "sprawy" | "pisma" | "platnosci" | "uzytkownicy" | "raporty";
  lastSync: string;
  externalSource?: string;
  isReadOnly: boolean;
};

const DICTIONARIES: Dictionary[] = [
  {
    id: "d-001",
    name: "Statusy spraw",
    description: "Zdefiniowane statusy postepowan i przejscia miedzy nimi",
    entries: 24,
    scope: "global",
    category: "sprawy",
    lastSync: "2026-05-10",
    isReadOnly: false,
  },
  {
    id: "d-002",
    name: "Typy pism procesowych",
    description: "Klasyfikacja pism (pozew, sprzeciw, apelacja, kasacja...)",
    entries: 47,
    scope: "global",
    category: "pisma",
    lastSync: "2026-05-09",
    isReadOnly: false,
  },
  {
    id: "d-003",
    name: "Kody pocztowe Polski",
    description: "Pelna baza kodow pocztowych z miastami i wojewodztwami",
    entries: 31240,
    scope: "global",
    category: "uzytkownicy",
    lastSync: "2026-05-01",
    externalSource: "Poczta Polska API",
    isReadOnly: true,
  },
  {
    id: "d-004",
    name: "TERYT - jednostki podzialu",
    description: "Rejestr GUS jednostek podzialu administracyjnego",
    entries: 47823,
    scope: "global",
    category: "uzytkownicy",
    lastSync: "2026-04-28",
    externalSource: "GUS TERYT",
    isReadOnly: true,
  },
  {
    id: "d-005",
    name: "Sady i ich wlasciwosc",
    description: "Wlasciwosc miejscowa sadow rejonowych, okregowych, apelacyjnych",
    entries: 567,
    scope: "global",
    category: "sprawy",
    lastSync: "2026-04-25",
    externalSource: "MS Lista sadow",
    isReadOnly: true,
  },
  {
    id: "d-006",
    name: "Komornicy sadowi",
    description: "Aktywni komornicy z numerem kancelarii i wlasciwoscia",
    entries: 2340,
    scope: "global",
    category: "sprawy",
    lastSync: "2026-04-20",
    externalSource: "KRK API",
    isReadOnly: true,
  },
  {
    id: "d-007",
    name: "Wierzyciele instytucjonalni",
    description: "Banki, firmy pozyczkowe, operatorzy telco, dostawcy mediow",
    entries: 1240,
    scope: "tenant",
    category: "sprawy",
    lastSync: "2026-04-18",
    isReadOnly: false,
  },
  {
    id: "d-008",
    name: "Metody platnosci",
    description: "Akceptowane metody i ich konfiguracja w platformie",
    entries: 12,
    scope: "global",
    category: "platnosci",
    lastSync: "2026-04-15",
    isReadOnly: false,
  },
  {
    id: "d-009",
    name: "Powody odrzucenia ugody",
    description: "Standardowe powody odrzucenia propozycji ugody przez strony",
    entries: 18,
    scope: "global",
    category: "platnosci",
    lastSync: "2026-04-10",
    isReadOnly: false,
  },
  {
    id: "d-010",
    name: "Kategorie raportow",
    description: "Klasyfikacja raportow operacyjnych, finansowych, regulacyjnych",
    entries: 34,
    scope: "global",
    category: "raporty",
    lastSync: "2026-04-08",
    isReadOnly: false,
  },
];

const CATEGORY_LABEL = {
  sprawy: "Sprawy",
  pisma: "Pisma",
  platnosci: "Platnosci",
  uzytkownicy: "Uzytkownicy",
  raporty: "Raporty",
};

const CATEGORY_TONE = {
  sprawy: "info" as const,
  pisma: "success" as const,
  platnosci: "warning" as const,
  uzytkownicy: "neutral" as const,
  raporty: "info" as const,
};

const CATEGORIES = ["Wszystkie", "Sprawy", "Pisma", "Platnosci", "Uzytkownicy", "Raporty"];

export default function SlownikiPage() {
  const numFmt = new Intl.NumberFormat("pl-PL");
  const dateFmt = new Intl.DateTimeFormat("pl-PL", { day: "numeric", month: "long", year: "numeric" });

  const totalEntries = DICTIONARIES.reduce((acc, d) => acc + d.entries, 0);
  const externalCount = DICTIONARIES.filter((d) => d.externalSource).length;

  return (
    <div className="min-h-screen bg-dlugomat-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <BookOpen className="h-6 w-6 text-accent-600" aria-hidden />
              <h1 className="font-display text-3xl text-dlugomat-950">Slowniki systemowe</h1>
            </div>
            <p className="text-dlugomat-700 max-w-2xl">
              Centralna baza wartosci referencyjnych uzywanych w calym systemie. Slowniki zewnetrzne sa synchronizowane
              automatycznie.
            </p>
          </div>
          <Button variant="primary">
            <Plus className="h-4 w-4 mr-2" aria-hidden />
            Nowy slownik
          </Button>
        </header>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-xs uppercase tracking-wide text-dlugomat-600 mb-1">Wszystkie slowniki</div>
              <div className="font-display text-3xl text-dlugomat-950">{DICTIONARIES.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-xs uppercase tracking-wide text-dlugomat-600 mb-1">Wpisow lacznie</div>
              <div className="font-display text-3xl text-dlugomat-950">{numFmt.format(totalEntries)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-xs uppercase tracking-wide text-dlugomat-600 mb-1">Zrodla zewnetrzne</div>
              <div className="font-display text-3xl text-accent-700">{externalCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-xs uppercase tracking-wide text-dlugomat-600 mb-1">Tylko do odczytu</div>
              <div className="font-display text-3xl text-dlugomat-950">
                {DICTIONARIES.filter((d) => d.isReadOnly).length}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-dlugomat-500" aria-hidden />
                <input
                  type="search"
                  placeholder="Szukaj po nazwie slownika lub wpisie..."
                  className="w-full pl-10 pr-3 py-2 rounded-md border border-iron-300 bg-white text-dlugomat-950 placeholder:text-dlugomat-500 focus-visible:shadow-shield-focus focus-visible:outline-none"
                  aria-label="Szukaj slownika"
                />
              </div>
              <select
                className="px-3 py-2 rounded-md border border-iron-300 bg-white text-dlugomat-950 focus-visible:shadow-shield-focus focus-visible:outline-none"
                aria-label="Filtr zakresu"
              >
                <option>Wszystkie zakresy</option>
                <option>Globalne</option>
                <option>Tenant</option>
              </select>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {CATEGORIES.map((cat, idx) => (
                <button
                  key={cat}
                  type="button"
                  className={`px-3 py-1.5 rounded-md text-sm font-medium border focus-visible:shadow-shield-focus focus-visible:outline-none ${
                    idx === 0
                      ? "bg-dlugomat-900 text-white border-dlugomat-900"
                      : "bg-white text-dlugomat-800 border-iron-300 hover:bg-dlugomat-50"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {DICTIONARIES.map((dict) => (
            <Card key={dict.id} elevation="subtle">
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="p-2 rounded-md bg-accent-50 text-accent-700 shrink-0">
                      <Database className="h-5 w-5" aria-hidden />
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base">{dict.name}</CardTitle>
                      <CardDescription className="line-clamp-1">{dict.description}</CardDescription>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <Badge tone={CATEGORY_TONE[dict.category]}>{CATEGORY_LABEL[dict.category]}</Badge>
                    {dict.isReadOnly && <Badge tone="neutral">Read-only</Badge>}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-dlugomat-600">Wpisow</div>
                    <div className="font-medium text-dlugomat-950">{numFmt.format(dict.entries)}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-dlugomat-600">Zakres</div>
                    <div className="font-medium text-dlugomat-950">
                      {dict.scope === "global" ? "Globalny" : "Tenant"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-dlugomat-600">Sync</div>
                    <div className="font-medium text-dlugomat-950 text-xs">
                      {dateFmt.format(new Date(dict.lastSync))}
                    </div>
                  </div>
                </div>
                {dict.externalSource && (
                  <div className="mb-3 p-2 rounded-md bg-accent-50 border border-accent-200 flex items-center gap-2 text-xs">
                    <Globe className="h-3.5 w-3.5 text-accent-700 shrink-0" aria-hidden />
                    <span className="text-accent-900">Zrodlo zewnetrzne: {dict.externalSource}</span>
                  </div>
                )}
                <div className="flex items-center justify-between pt-3 border-t border-iron-100">
                  <button
                    type="button"
                    disabled={dict.isReadOnly}
                    aria-label="Edytuj slownik"
                    className="inline-flex items-center gap-1.5 text-sm text-dlugomat-700 hover:text-dlugomat-900 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:shadow-shield-focus rounded"
                  >
                    <Edit3 className="h-3.5 w-3.5" aria-hidden />
                    Edytuj
                  </button>
                  <Link
                    href={`/admin/slowniki/${dict.id}`}
                    className="inline-flex items-center gap-1 text-sm text-accent-700 hover:text-accent-900 font-medium focus-visible:shadow-shield-focus rounded"
                  >
                    Otworz
                    <ChevronRight className="h-3.5 w-3.5" aria-hidden />
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
