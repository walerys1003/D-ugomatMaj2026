import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Plus, Search, Tag, Pin, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Notatki — panel",
  robots: { index: false, follow: false },
};

interface Note {
  id: string;
  title: string;
  excerpt: string;
  case_id: string | null;
  tags: ReadonlyArray<string>;
  updated_at: string;
  pinned: boolean;
}

const NOTES: ReadonlyArray<Note> = [
  {
    id: "n1",
    title: "Rozmowa z prawnikiem Kowalskim",
    excerpt: "Doradza sprzeciw oparty o art. 506 KPC. Termin 7 dni od doreczenia. Wziac wyciag z BIK i potwierdzenie wplaty z 2019.",
    case_id: "C-2026-0142",
    tags: ["EPU", "Sprzeciw", "Bank"],
    updated_at: "2026-05-09 14:23",
    pinned: true,
  },
  {
    id: "n2",
    title: "Lista dokumentow do zlozenia",
    excerpt: "1. Sprzeciw od nakazu, 2. Wyciag z BIK, 3. Potwierdzenie ostatniej wplaty, 4. Korespondencja mailowa z bankiem.",
    case_id: "C-2026-0142",
    tags: ["Dokumenty", "Lista"],
    updated_at: "2026-05-08 19:10",
    pinned: true,
  },
  {
    id: "n3",
    title: "Argumentacja — przedawnienie roszczenia",
    excerpt: "Faktura z 2018-03-15. Termin przedawnienia uplynal 2021-12-31 (art. 118 KC). Brak przerwy biegu — list wezwawczy z 2024 nie liczy sie.",
    case_id: "C-2026-0139",
    tags: ["Przedawnienie", "KC"],
    updated_at: "2026-05-07 11:45",
    pinned: false,
  },
  {
    id: "n4",
    title: "Telefon do komornika Skiba",
    excerpt: "Pyta o propozycje ugody. Akceptuje splate 60% w 6 ratach. Czeka na pismo do 15 maja.",
    case_id: "C-2025-0987",
    tags: ["Komornik", "Ugoda"],
    updated_at: "2026-05-05 16:30",
    pinned: false,
  },
  {
    id: "n5",
    title: "Plan dzialania na maj",
    excerpt: "Tydzien 1: sprzeciw EPU. Tydzien 2: zarzuty Provident. Tydzien 3: ugoda komornicza. Tydzien 4: wniosek o rozlozenie na raty.",
    case_id: null,
    tags: ["Plan", "Maj"],
    updated_at: "2026-05-02 09:00",
    pinned: false,
  },
  {
    id: "n6",
    title: "Cytat z art. 5 KC",
    excerpt: "Nie mozna czynic ze swego prawa uzytku, ktory by byl sprzeczny ze spoleczno-gospodarczym przeznaczeniem tego prawa lub z zasadami wspolzycia spolecznego.",
    case_id: null,
    tags: ["KC", "Cytat"],
    updated_at: "2026-04-29 22:15",
    pinned: false,
  },
];

export default function NotatkiPage() {
  const pinned = NOTES.filter((n) => n.pinned);
  const others = NOTES.filter((n) => !n.pinned);

  return (
    <div className="space-y-6">
      <Link href="/panel" className="inline-flex items-center gap-2 text-sm text-ink-600 hover:text-dlugomat-900">
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Powrot do panelu
      </Link>

      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-ink-500">Notatki</p>
          <h1 className="font-display text-fluid-h1 text-dlugomat-950">Twoje notatki</h1>
          <p className="mt-1 text-sm text-ink-600">
            {NOTES.length} notatek, {pinned.length} przypietych.
          </p>
        </div>
        <Button variant="primary">
          <Plus className="mr-2 h-4 w-4" aria-hidden />
          Nowa notatka
        </Button>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <label className="relative flex-1 min-w-[260px]">
          <span className="sr-only">Szukaj w notatkach</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" aria-hidden />
          <input
            type="search"
            placeholder="Szukaj po tresci, tagu lub sprawie..."
            className="h-10 w-full rounded-md border border-ink-200 bg-white pl-10 pr-3 text-sm placeholder:text-ink-400 focus-visible:outline-none focus-visible:shadow-shield-focus"
          />
        </label>
        <Button variant="secondary" size="sm">
          <Tag className="mr-2 h-4 w-4" aria-hidden />
          Wszystkie tagi
        </Button>
      </div>

      {pinned.length > 0 && (
        <section aria-labelledby="pinned-heading">
          <h2 id="pinned-heading" className="mb-3 flex items-center gap-2 text-sm font-medium text-ink-700">
            <Pin className="h-4 w-4" aria-hidden />
            Przypiete
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {pinned.map((n) => (
              <NoteCard key={n.id} note={n} />
            ))}
          </div>
        </section>
      )}

      <section aria-labelledby="others-heading">
        <h2 id="others-heading" className="mb-3 text-sm font-medium text-ink-700">Pozostale</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {others.map((n) => (
            <NoteCard key={n.id} note={n} />
          ))}
        </div>
      </section>
    </div>
  );
}

function NoteCard({ note }: { note: Note }) {
  return (
    <Card urgency={note.pinned ? "normal" : "none"}>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="truncate text-base">{note.title}</CardTitle>
            <CardDescription className="mt-1 text-xs">
              {note.case_id ? `Sprawa ${note.case_id} · ` : ""}
              {note.updated_at}
            </CardDescription>
          </div>
          <div className="flex gap-1">
            <button
              type="button"
              aria-label={note.pinned ? "Odepnij notatke" : "Przypnij notatke"}
              className="rounded p-1 text-ink-500 hover:text-dlugomat-900 focus-visible:outline-none focus-visible:shadow-shield-focus"
            >
              <Pin className={`h-4 w-4 ${note.pinned ? "fill-current" : ""}`} aria-hidden />
            </button>
            <button
              type="button"
              aria-label="Usun notatke"
              className="rounded p-1 text-ink-500 hover:text-danger focus-visible:outline-none focus-visible:shadow-shield-focus"
            >
              <Trash2 className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-ink-700">{note.excerpt}</p>
        <div className="mt-3 flex flex-wrap gap-1">
          {note.tags.map((t) => (
            <Badge key={t} tone="neutral">{t}</Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
