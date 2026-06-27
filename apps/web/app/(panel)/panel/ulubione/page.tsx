import * as React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Star, FileText, Scale, BookOpen, Search, Filter, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";

export const metadata = {
  title: "Ulubione - Dlugomat",
  description: "Twoje zapisane pisma, orzeczenia i dokumenty - szybki dostep do najwazniejszych zasobow.",
};

export const dynamic = "force-dynamic";

type FavoriteKind = "pismo" | "orzeczenie" | "dokument" | "wzor";

type Favorite = {
  id: string;
  kind: FavoriteKind;
  title: string;
  subtitle: string;
  addedAt: string;
  tags: string[];
  href: string;
};

function normalizeKind(raw: string): FavoriteKind {
  if (raw === "pismo" || raw === "orzeczenie" || raw === "wzor") return raw;
  return "dokument";
}

const KIND_LABEL: Record<FavoriteKind, string> = {
  pismo: "Pismo",
  orzeczenie: "Orzeczenie",
  dokument: "Dokument",
  wzor: "Wzor",
};

const KIND_TONE: Record<FavoriteKind, "info" | "success" | "warning" | "neutral"> = {
  pismo: "info",
  orzeczenie: "success",
  dokument: "neutral",
  wzor: "warning",
};

const KIND_ICON = {
  pismo: FileText,
  orzeczenie: Scale,
  dokument: FileText,
  wzor: BookOpen,
};

const TABS: { id: string; label: string }[] = [
  { id: "all", label: "Wszystkie" },
  { id: "pismo", label: "Pisma" },
  { id: "orzeczenie", label: "Orzeczenia" },
  { id: "dokument", label: "Dokumenty" },
  { id: "wzor", label: "Wzory" },
];

export default async function UlubionePage() {
  const dateFmt = new Intl.DateTimeFormat("pl-PL", { day: "numeric", month: "long", year: "numeric" });

  const supabase = createSupabaseServerClient();
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) redirect("/logowanie?next=/panel/ulubione");

  const { data: rows } = await supabase
    .from("favorites")
    .select("id, kind, title, subtitle, href, tags, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  const FAVORITES: Favorite[] = (rows ?? []).map((f) => ({
    id: f.id,
    kind: normalizeKind(f.kind),
    title: f.title,
    subtitle: f.subtitle ?? "",
    addedAt: f.created_at.slice(0, 10),
    tags: f.tags ?? [],
    href: f.href,
  }));

  const COUNTS: Record<string, number> = {
    all: FAVORITES.length,
    pismo: FAVORITES.filter((f) => f.kind === "pismo").length,
    orzeczenie: FAVORITES.filter((f) => f.kind === "orzeczenie").length,
    dokument: FAVORITES.filter((f) => f.kind === "dokument").length,
    wzor: FAVORITES.filter((f) => f.kind === "wzor").length,
  };

  return (
    <div className="min-h-screen bg-dlugomat-50">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Star className="h-6 w-6 text-accent-600" aria-hidden />
            <h1 className="font-display text-3xl text-dlugomat-950">Ulubione</h1>
          </div>
          <p className="text-dlugomat-700 max-w-2xl">
            Twoje zapisane materialy - pisma, orzeczenia, dokumenty i wzory. Szybki dostep do najwazniejszych zasobow.
          </p>
        </header>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-dlugomat-500" aria-hidden />
                <input
                  type="search"
                  placeholder="Szukaj wsrod ulubionych..."
                  className="w-full pl-10 pr-3 py-2 rounded-md border border-ink-300 bg-white text-dlugomat-950 placeholder:text-dlugomat-500 focus-visible:shadow-shield-focus focus-visible:outline-none"
                  aria-label="Szukaj w ulubionych"
                />
              </div>
              <button
                type="button"
                className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-ink-300 bg-white text-dlugomat-900 text-sm font-medium hover:bg-dlugomat-50 focus-visible:shadow-shield-focus focus-visible:outline-none"
              >
                <Filter className="h-4 w-4" aria-hidden />
                Filtry
              </button>
            </div>
            <div className="mt-4 flex flex-wrap gap-2" role="tablist">
              {TABS.map((tab, idx) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={idx === 0}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium border focus-visible:shadow-shield-focus focus-visible:outline-none ${
                    idx === 0
                      ? "bg-dlugomat-900 text-white border-dlugomat-900"
                      : "bg-white text-dlugomat-800 border-ink-300 hover:bg-dlugomat-50"
                  }`}
                >
                  {tab.label}
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded ${
                      idx === 0 ? "bg-white/20" : "bg-ink-100 text-dlugomat-700"
                    }`}
                  >
                    {COUNTS[tab.id]}
                  </span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {FAVORITES.length === 0 ? (
          <EmptyState
            title="Brak ulubionych"
            description="Oznacz gwiazdką pisma, orzeczenia, dokumenty lub wzory, aby mieć do nich szybki dostęp w jednym miejscu."
          />
        ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {FAVORITES.map((fav) => {
            const Icon = KIND_ICON[fav.kind];
            return (
              <Card key={fav.id} elevation="subtle">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="p-2 rounded-md bg-accent-50 text-accent-700 shrink-0">
                        <Icon className="h-5 w-5" aria-hidden />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge tone={KIND_TONE[fav.kind]}>{KIND_LABEL[fav.kind]}</Badge>
                        </div>
                        <h2 className="font-medium text-dlugomat-950 leading-snug">{fav.title}</h2>
                        <p className="text-sm text-dlugomat-700 mt-0.5">{fav.subtitle}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      aria-label="Usun z ulubionych"
                      className="p-1.5 rounded-md text-warn hover:bg-ink-100 focus-visible:shadow-shield-focus focus-visible:outline-none"
                    >
                      <Star className="h-4 w-4 fill-current" aria-hidden />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {fav.tags.map((tag) => (
                      <Badge key={tag} tone="neutral">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-ink-100 text-xs text-dlugomat-600">
                    <span>Dodano {dateFmt.format(new Date(fav.addedAt))}</span>
                    <Link
                      href={fav.href}
                      className="inline-flex items-center gap-1 text-accent-700 hover:text-accent-900 font-medium focus-visible:shadow-shield-focus rounded"
                    >
                      Otworz
                      <ChevronRight className="h-3.5 w-3.5" aria-hidden />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        )}
      </div>
    </div>
  );
}
