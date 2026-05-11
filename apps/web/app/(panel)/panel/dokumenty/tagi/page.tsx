import type { Metadata } from "next";
import Link from "next/link";
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

export const metadata: Metadata = {
  title: "Tagi dokumentów — Długomat",
  description: "Organizacja dokumentów poprzez tagi z chmurą rozmiarów.",
};

interface TagItem {
  id: string;
  name: string;
  count: number;
  color: "blue" | "green" | "amber" | "red" | "gray" | "purple";
}

const TAGS: TagItem[] = [
  { id: "t_001", name: "BIK", count: 24, color: "blue" },
  { id: "t_002", name: "komornik", count: 19, color: "red" },
  { id: "t_003", name: "bank", count: 31, color: "amber" },
  { id: "t_004", name: "wzór pisma", count: 14, color: "green" },
  { id: "t_005", name: "wniosek", count: 22, color: "purple" },
  { id: "t_006", name: "reklamacja", count: 11, color: "gray" },
  { id: "t_007", name: "ugoda", count: 7, color: "green" },
  { id: "t_008", name: "windykacja", count: 17, color: "red" },
  { id: "t_009", name: "kredyt frankowy", count: 8, color: "purple" },
  { id: "t_010", name: "upadłość", count: 5, color: "amber" },
  { id: "t_011", name: "przedawnienie", count: 9, color: "blue" },
  { id: "t_012", name: "klauzule abuzywne", count: 6, color: "purple" },
  { id: "t_013", name: "raport BIK", count: 12, color: "blue" },
  { id: "t_014", name: "tytuł wykonawczy", count: 8, color: "red" },
  { id: "t_015", name: "zabezpieczenie", count: 4, color: "gray" },
];

const COLOR_TONE: Record<TagItem["color"], "info" | "success" | "warning" | "danger" | "neutral"> = {
  blue: "info",
  green: "success",
  amber: "warning",
  red: "danger",
  purple: "info",
  gray: "neutral",
};

function sizeClass(count: number, max: number): string {
  const pct = count / max;
  if (pct > 0.75) return "text-2xl";
  if (pct > 0.5) return "text-xl";
  if (pct > 0.3) return "text-lg";
  return "text-base";
}

export default function DokumentyTagiPage() {
  const max = Math.max(...TAGS.map((t) => t.count));
  const total = TAGS.reduce((s, t) => s + t.count, 0);
  const sorted = [...TAGS].sort((a, b) => b.count - a.count);

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.18em] text-iron-500">
            Dokumenty · tagi
          </p>
          <h1 className="font-display text-fluid-h1 text-dlugomat-950">
            Twoje tagi
          </h1>
          <p className="max-w-2xl text-iron-600">
            Tagi pozwalają oznaczać dokumenty wielokrotnie i przeszukiwać je
            niezależnie od struktury folderów.
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" aria-hidden />
          Nowy tag
        </Button>
      </header>

      <nav aria-label="Widoki dokumentów" className="flex gap-1 rounded-md border border-iron-200 bg-iron-50 p-1 w-fit text-sm">
        <Link
          href="/panel/dokumenty"
          className="rounded px-3 py-1.5 text-iron-700 hover:bg-white focus-visible:outline-none focus-visible:shadow-shield-focus"
        >
          Wszystkie
        </Link>
        <Link
          href="/panel/dokumenty/foldery"
          className="rounded px-3 py-1.5 text-iron-700 hover:bg-white focus-visible:outline-none focus-visible:shadow-shield-focus"
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
              {sorted[0].name} ({sorted[0].count})
            </CardTitle>
          </CardHeader>
        </Card>
      </section>

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
                  <Hash className="h-3.5 w-3.5 text-iron-400" aria-hidden />
                  {t.name}
                  <span className="text-xs text-iron-500">({t.count})</span>
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
                  className="flex items-center justify-between rounded-md border border-iron-200 bg-white px-3 py-2 text-sm transition hover:bg-iron-50 focus-visible:outline-none focus-visible:shadow-shield-focus"
                >
                  <span className="flex items-center gap-2">
                    <Tag className="h-3.5 w-3.5 text-iron-400" aria-hidden />
                    <span className="text-dlugomat-900">{t.name}</span>
                  </span>
                  <Badge tone={COLOR_TONE[t.color]}>{t.count}</Badge>
                </Link>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
