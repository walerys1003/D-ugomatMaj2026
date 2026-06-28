import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Hash, Plus, Tag } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";

export const metadata: Metadata = {
  title: "Tagi dokumentów — Długomat",
  description: "Organizacja dokumentów poprzez tagi z chmurą rozmiarów.",
};

export const dynamic = "force-dynamic";

interface TagItem {
  id: string;
  name: string;
  count: number;
  tone: "info" | "success" | "warning" | "danger" | "neutral";
}

const TONE_CYCLE: TagItem["tone"][] = ["info", "success", "warning", "danger", "neutral"];

function sizeClass(count: number, max: number): string {
  const pct = max > 0 ? count / max : 0;
  if (pct > 0.75) return "text-2xl";
  if (pct > 0.5) return "text-xl";
  if (pct > 0.3) return "text-lg";
  return "text-base";
}

export default async function DokumentyTagiPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in?next=/panel/dokumenty/tagi");

  const { data: docs } = await supabase
    .from("documents")
    .select("tags")
    .eq("user_id", user.id);

  // Agregacja tagow ze wszystkich dokumentow uzytkownika.
  const counts = new Map<string, number>();
  for (const d of docs ?? []) {
    for (const t of d.tags ?? []) {
      const name = (t ?? "").trim();
      if (!name) continue;
      counts.set(name, (counts.get(name) ?? 0) + 1);
    }
  }

  const TAGS: TagItem[] = Array.from(counts.entries()).map(([name, count], i) => ({
    id: `tag-${i}`,
    name,
    count,
    tone: TONE_CYCLE[i % TONE_CYCLE.length],
  }));

  const max = TAGS.length ? Math.max(...TAGS.map((t) => t.count)) : 0;
  const total = TAGS.reduce((s, t) => s + t.count, 0);
  const sorted = [...TAGS].sort((a, b) => b.count - a.count);

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.18em] text-ink-500">
            Dokumenty · tagi
          </p>
          <h1 className="font-display text-fluid-h1 text-dlugomat-950">
            Twoje tagi
          </h1>
          <p className="max-w-2xl text-ink-600">
            Tagi pozwalają oznaczać dokumenty wielokrotnie i przeszukiwać je
            niezależnie od struktury folderów.
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" aria-hidden />
          Nowy tag
        </Button>
      </header>

      <nav aria-label="Widoki dokumentów" className="flex gap-1 rounded-md border border-ink-200 bg-ink-50 p-1 w-fit text-sm">
        <Link
          href="/panel/dokumenty"
          className="rounded px-3 py-1.5 text-ink-700 hover:bg-white focus-visible:outline-none focus-visible:shadow-shield-focus"
        >
          Wszystkie
        </Link>
        <Link
          href="/panel/dokumenty/foldery"
          className="rounded px-3 py-1.5 text-ink-700 hover:bg-white focus-visible:outline-none focus-visible:shadow-shield-focus"
        >
          Foldery
        </Link>
        <span className="rounded bg-white px-3 py-1.5 font-semibold text-dlugomat-900 shadow-sm">
          Tagi
        </span>
      </nav>

      <section className="grid gap-4 sm:grid-cols-3" aria-label="Statystyki tagów">
        <Card>
          <CardHeader>
            <CardDescription>Tagów</CardDescription>
            <CardTitle className="font-display text-fluid-h3 text-dlugomat-950">
              {TAGS.length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Przypisań łącznie</CardDescription>
            <CardTitle className="font-display text-fluid-h3 text-dlugomat-950">
              {total}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Najpopularniejszy</CardDescription>
            <CardTitle className="font-display text-fluid-h4 text-dlugomat-950">
              {sorted[0] ? `${sorted[0].name} (${sorted[0].count})` : "—"}
            </CardTitle>
          </CardHeader>
        </Card>
      </section>

      {TAGS.length === 0 ? (
        <EmptyState
          title="Brak tagow"
          description="Oznacz dokumenty tagami, aby latwiej je organizowac i przeszukiwac."
        />
      ) : (
      <>
      <Card>
        <CardHeader>
          <CardTitle>Chmura tagów</CardTitle>
          <CardDescription>
            Rozmiar odzwierciedla liczbę dokumentów oznaczonych danym tagiem
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
            {sorted.map((t) => (
              <li key={t.id}>
                <Link
                  href={`/panel/dokumenty?tag=${t.name}`}
                  className={`inline-flex items-baseline gap-1 font-display text-dlugomat-900 hover:text-dlugomat-700 focus-visible:outline-none focus-visible:shadow-shield-focus rounded ${sizeClass(
                    t.count,
                    max,
                  )}`}
                >
                  <Hash className="h-3.5 w-3.5 text-ink-400" aria-hidden />
                  {t.name}
                  <span className="text-xs text-ink-500">({t.count})</span>
                </Link>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Wszystkie tagi</CardTitle>
          <CardDescription>Sortowanie: liczba dokumentów malejąco</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {sorted.map((t) => (
              <li key={t.id}>
                <Link
                  href={`/panel/dokumenty?tag=${t.name}`}
                  className="flex items-center justify-between rounded-md border border-ink-200 bg-white px-3 py-2 text-sm transition hover:bg-ink-50 focus-visible:outline-none focus-visible:shadow-shield-focus"
                >
                  <span className="flex items-center gap-2">
                    <Tag className="h-3.5 w-3.5 text-ink-400" aria-hidden />
                    <span className="text-dlugomat-900">{t.name}</span>
                  </span>
                  <Badge tone={t.tone}>{t.count}</Badge>
                </Link>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
      </>
      )}
    </div>
  );
}
