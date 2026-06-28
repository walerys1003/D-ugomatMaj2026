import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Plus, Search, Tag, Pin, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";

export const metadata: Metadata = {
  title: "Notatki — panel",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

interface Note {
  id: string;
  title: string;
  excerpt: string;
  case_id: string | null;
  tags: ReadonlyArray<string>;
  updated_at: string;
  pinned: boolean;
}

function fmtUpdated(iso: string): string {
  try {
    return new Intl.DateTimeFormat("pl-PL", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export default async function NotatkiPage() {
  const supabase = createSupabaseServerClient();
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) redirect("/sign-in?next=/panel/notatki");

  const { data: rows } = await supabase
    .from("notes")
    .select("id, title, body, case_id, tags, pinned, updated_at")
    .order("pinned", { ascending: false })
    .order("updated_at", { ascending: false })
    .limit(200);

  const NOTES: Note[] = (rows ?? []).map((n) => ({
    id: n.id,
    title: n.title || "(bez tytułu)",
    excerpt: n.body ?? "",
    case_id: n.case_id,
    tags: n.tags ?? [],
    updated_at: fmtUpdated(n.updated_at),
    pinned: n.pinned,
  }));

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

      {NOTES.length === 0 && (
        <EmptyState
          title="Nie masz jeszcze notatek"
          description="Notatki pomogą Ci śledzić ustalenia z prawnikiem, terminy i argumentację. Utwórz pierwszą notatkę przyciskiem powyżej."
        />
      )}

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

      {others.length > 0 && (
        <section aria-labelledby="others-heading">
          <h2 id="others-heading" className="mb-3 text-sm font-medium text-ink-700">Pozostale</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {others.map((n) => (
              <NoteCard key={n.id} note={n} />
            ))}
          </div>
        </section>
      )}
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
