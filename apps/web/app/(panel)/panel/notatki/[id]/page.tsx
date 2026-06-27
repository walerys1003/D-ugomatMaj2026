import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, StickyNote, Tag, Clock, Pin, Edit3, Share2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";

export const metadata = {
  title: "Notatka - Dlugomat",
  description: "Szczegoly notatki uzytkownika z powiazaniami i historia zmian.",
};

export const dynamic = "force-dynamic";

type Params = Promise<{ id: string }>;

export default async function NotatkaPage({ params }: { params: Params }) {
  const { id } = await params;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/logowanie?next=/panel/notatki/${id}`);

  const { data: note } = await supabase
    .from("notes")
    .select("id, case_id, title, body, tags, pinned, created_at, updated_at")
    .eq("id", id)
    .single();

  if (!note) notFound();

  // Powiazana sprawa (jesli istnieje) — do wyswietlenia czytelnej nazwy.
  let caseLabel: string | null = null;
  if (note.case_id) {
    const { data: c } = await supabase
      .from("cases")
      .select("id, title")
      .eq("id", note.case_id)
      .single();
    caseLabel = c?.title ?? note.case_id;
  }

  const dateTimeFmt = new Intl.DateTimeFormat("pl-PL", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  // Historia zmian wyprowadzona z dostepnych znacznikow czasu.
  const history: { date: string; action: string }[] = [
    { date: note.created_at, action: "Utworzono notatke" },
  ];
  if (note.updated_at && note.updated_at !== note.created_at) {
    history.push({ date: note.updated_at, action: "Ostatnia edycja tresci" });
  }

  const tags = Array.isArray(note.tags) ? note.tags : [];

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
              Utworzono {dateTimeFmt.format(new Date(note.created_at))}
            </span>
            {note.updated_at && note.updated_at !== note.created_at ? (
              <span>Edytowano {dateTimeFmt.format(new Date(note.updated_at))}</span>
            ) : null}
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

            <Card>
              <CardHeader>
                <CardTitle>Historia zmian</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-3">
                  {history.map((h, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm">
                      <div className="h-2 w-2 rounded-full bg-accent-500 mt-1.5 shrink-0" aria-hidden />
                      <div className="flex-1">
                        <div className="text-dlugomat-900">{h.action}</div>
                        <div className="text-xs text-dlugomat-600">
                          {dateTimeFmt.format(new Date(h.date))}
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
                {tags.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {tags.map((tag) => (
                      <Badge key={tag} tone="neutral">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-dlugomat-500">Brak tagow</p>
                )}
              </CardContent>
            </Card>

            {note.case_id && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Powiazana sprawa</CardTitle>
                </CardHeader>
                <CardContent>
                  <Link
                    href={`/panel/sprawy/${note.case_id}`}
                    className="block p-3 rounded-md border border-accent-200 bg-accent-50 hover:bg-accent-100 focus-visible:shadow-shield-focus"
                  >
                    <div className="text-xs uppercase tracking-wide text-accent-700 mb-1">
                      Sprawa
                    </div>
                    <div className="text-sm text-dlugomat-950 font-medium">{caseLabel}</div>
                  </Link>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardContent className="pt-6 space-y-2">
                <Button variant="secondary" block asChild>
                  <Link href="/panel/notatki">
                    <Edit3 className="h-4 w-4 mr-2" aria-hidden />
                    Wroc do listy notatek
                  </Link>
                </Button>
                <Button variant="ghost" block asChild>
                  <Link href="/panel/wsparcie">
                    <Share2 className="h-4 w-4 mr-2" aria-hidden />
                    Skontaktuj sie ze wsparciem
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}
