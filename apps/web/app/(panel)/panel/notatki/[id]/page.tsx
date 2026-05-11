import * as React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, StickyNote, Tag, Clock, Pin, Link2, Edit3, Share2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Notatka - Dlugomat",
  description: "Szczegoly notatki uzytkownika z powiazaniami i historia zmian.",
};

type Note = {
  id: string;
  title: string;
  body: string;
  tags: string[];
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
  linkedCase?: string;
  linkedDocs: { id: string; name: string }[];
  history: { date: string; action: string; author: string }[];
};

const NOTES: Record<string, Note> = {
  "n-001": {
    id: "n-001",
    title: "Rozmowa z windykatorem 12 maja",
    body:
      "Pan Tomasz Kowalski z Provident zaproponowal obnizenie raty o 200 PLN miesiecznie w zamian za wydluzenie okresu splaty o 8 miesiecy. Trzeba przeanalizowac calkowity koszt - przy obecnym oprocentowaniu moze byc mniej oplacalne. Spotkanie nastepne za tydzien. Zapytac mecenas Kowalska o opinie przed decyzja.",
    tags: ["windykacja", "ugoda", "provident"],
    pinned: true,
    createdAt: "2026-05-12T14:23:00",
    updatedAt: "2026-05-12T16:45:00",
    linkedCase: "ps-001",
    linkedDocs: [
      { id: "doc-201", name: "Propozycja ugody Provident.pdf" },
      { id: "doc-202", name: "Aktualny plan splaty.pdf" },
    ],
    history: [
      { date: "2026-05-12T14:23:00", action: "Utworzono notatke", author: "Marek Nowak" },
      { date: "2026-05-12T15:10:00", action: "Dodano tag windykacja", author: "Marek Nowak" },
      { date: "2026-05-12T16:45:00", action: "Edytowano tresc", author: "Marek Nowak" },
    ],
  },
};

type Params = Promise<{ id: string }>;

export default async function NotatkaPage({ params }: { params: Params }) {
  const { id } = await params;
  const note = NOTES[id] ?? NOTES["n-001"];
  if (!note) notFound();

  const dateTimeFmt = new Intl.DateTimeFormat("pl-PL", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="min-h-screen bg-dlugomat-50">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            href="/panel/notatki"
            className="inline-flex items-center gap-2 text-sm text-dlugomat-700 hover:text-dlugomat-900 focus-visible:shadow-shield-focus rounded-md"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Powrot do notatek
          </Link>
        </div>

        <header className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <StickyNote className="h-6 w-6 text-accent-600" aria-hidden />
            {note.pinned && (
              <Badge tone="warning" withDot>
                <Pin className="h-3 w-3 mr-1" aria-hidden />
                Przypieta
              </Badge>
            )}
          </div>
          <h1 className="font-display text-3xl text-dlugomat-950 mb-2">{note.title}</h1>
          <div className="flex items-center gap-3 text-sm text-dlugomat-600">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" aria-hidden />
              Utworzono {dateTimeFmt.format(new Date(note.createdAt))}
            </span>
            <span>Edytowano {dateTimeFmt.format(new Date(note.updatedAt))}</span>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Tresc notatki</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-dlugomat-800 leading-relaxed whitespace-pre-wrap">{note.body}</p>
              </CardContent>
            </Card>

            {note.linkedDocs.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Link2 className="h-5 w-5 text-accent-600" aria-hidden />
                    Powiazane dokumenty
                  </CardTitle>
                  <CardDescription>{note.linkedDocs.length} dokumentow</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {note.linkedDocs.map((doc) => (
                      <li key={doc.id}>
                        <Link
                          href={`/panel/dokumenty/${doc.id}`}
                          className="flex items-center justify-between gap-3 p-3 rounded-md border border-iron-200 bg-white hover:bg-dlugomat-50 focus-visible:shadow-shield-focus"
                        >
                          <span className="text-sm text-dlugomat-900">{doc.name}</span>
                          <span className="text-xs text-accent-700">Otworz</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Historia zmian</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-3">
                  {note.history.map((h, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm">
                      <div className="h-2 w-2 rounded-full bg-accent-500 mt-1.5 shrink-0" aria-hidden />
                      <div className="flex-1">
                        <div className="text-dlugomat-900">{h.action}</div>
                        <div className="text-xs text-dlugomat-600">
                          {dateTimeFmt.format(new Date(h.date))} - {h.author}
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          </div>

          <aside className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Tag className="h-4 w-4 text-accent-600" aria-hidden />
                  Tagi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1.5">
                  {note.tags.map((tag) => (
                    <Badge key={tag} tone="neutral">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {note.linkedCase && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Powiazana sprawa</CardTitle>
                </CardHeader>
                <CardContent>
                  <Link
                    href={`/panel/plan-splaty/${note.linkedCase}`}
                    className="block p-3 rounded-md border border-accent-200 bg-accent-50 hover:bg-accent-100 focus-visible:shadow-shield-focus"
                  >
                    <div className="text-xs uppercase tracking-wide text-accent-700 mb-1">
                      Plan splaty
                    </div>
                    <div className="text-sm text-dlugomat-950 font-medium">{note.linkedCase}</div>
                  </Link>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardContent className="pt-6 space-y-2">
                <Button variant="primary" block>
                  <Edit3 className="h-4 w-4 mr-2" aria-hidden />
                  Edytuj notatke
                </Button>
                <Button variant="secondary" block>
                  <Share2 className="h-4 w-4 mr-2" aria-hidden />
                  Udostepnij doradcy
                </Button>
                <Button variant="ghost" block>
                  Eksportuj jako PDF
                </Button>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}
