import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Eye, History, Save, Tag } from "lucide-react";

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
  title: "Artykuł — Edytor wiedzy",
  robots: { index: false, follow: false },
};

interface PageProps {
  params: Promise<{ id: string }>;
}

interface Article {
  id: string;
  slug: string;
  title: string;
  category: string;
  status: "draft" | "published" | "archived";
  author: string;
  updated_at: string;
  version: number;
  tags: string[];
  body_md: string;
}

const STATUS_TONE: Record<
  Article["status"],
  "success" | "info" | "neutral"
> = {
  published: "success",
  draft: "info",
  archived: "neutral",
};

async function loadArticle(id: string): Promise<Article> {
  return {
    id,
    slug: "wniosek-o-korekte-bik",
    title: "Wniosek o korektę BIK — krok po kroku",
    category: "BIK / KRD",
    status: "published",
    author: "Anna Sieradzka",
    updated_at: "2026-05-09T14:22:00Z",
    version: 7,
    tags: ["BIK", "korekta", "wniosek", "wzór"],
    body_md: `# Wniosek o korektę BIK

## Kiedy złożyć wniosek?

Wniosek o korektę BIK składasz, gdy w Twoim raporcie znajduje się **nieprawidłowy wpis** — np. zamknięty kredyt nadal widnieje jako aktywny.

## Wymagane dokumenty

- Kopia raportu BIK z zaznaczonym błędnym wpisem
- Dowód spłaty (jeśli dotyczy)
- Pełnomocnictwo (gdy działa adwokat)

## Czas rozpatrzenia

Bank ma **30 dni** na odpowiedź (art. 105a Prawa bankowego).`,
  };
}

export default async function AdminWiedzaEditorPage({ params }: PageProps) {
  const { id } = await params;
  const a = await loadArticle(id);

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

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.18em] text-iron-500">
            Edytor artykułu · {a.id} · wersja {a.version}
          </p>
          <h1 className="font-display text-fluid-h1 text-dlugomat-950">{a.title}</h1>
          <div className="flex flex-wrap items-center gap-2 text-sm text-iron-600">
            <Badge tone={STATUS_TONE[a.status]} withDot>
              {a.status === "published"
                ? "opublikowany"
                : a.status === "draft"
                ? "szkic"
                : "zarchiwizowany"}
            </Badge>
            <span>Autor: {a.author}</span>
            <span aria-hidden>·</span>
            <span>Kategoria: {a.category}</span>
            <span aria-hidden>·</span>
            <span>/baza-wiedzy/{a.slug}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" asChild>
            <Link href={`/baza-wiedzy/${a.slug}`} target="_blank" rel="noopener">
              <Eye className="mr-2 h-4 w-4" aria-hidden />
              Podgląd
            </Link>
          </Button>
          <Button variant="secondary">
            <History className="mr-2 h-4 w-4" aria-hidden />
            Historia
          </Button>
          <Button variant="success">
            <Save className="mr-2 h-4 w-4" aria-hidden />
            Zapisz
          </Button>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Treść (Markdown)</CardTitle>
            <CardDescription>
              Obsługa nagłówków, list, cytatów, linków i bloków informacyjnych.
              Zmiany zapisywane są jako kolejne wersje.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-2 flex flex-wrap gap-1 rounded-md border border-iron-200 bg-iron-50 p-1.5 text-xs">
              {["H1", "H2", "B", "I", "Link", "List", "Quote", "Code", "Callout"].map((b) => (
                <button
                  key={b}
                  type="button"
                  className="rounded px-2 py-1 text-iron-700 hover:bg-white focus-visible:outline-none focus-visible:shadow-shield-focus"
                >
                  {b}
                </button>
              ))}
            </div>
            <textarea
              className="block w-full min-h-[420px] rounded-md border border-iron-300 bg-white px-3 py-2 font-mono text-sm text-dlugomat-900 focus:border-dlugomat-700 focus-visible:outline-none focus-visible:shadow-shield-focus"
              defaultValue={a.body_md}
            />
            <p className="mt-2 text-xs text-iron-500">
              {a.body_md.length} znaków · ~{Math.ceil(a.body_md.length / 1500)} min czytania
            </p>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Metadane</CardTitle>
              <CardDescription>SEO i klasyfikacja</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <Field label="Slug">
                <input
                  type="text"
                  className="w-full rounded-md border border-iron-300 bg-white px-3 py-2 focus:border-dlugomat-700 focus-visible:outline-none focus-visible:shadow-shield-focus"
                  defaultValue={a.slug}
                />
              </Field>
              <Field label="Kategoria">
                <select className="w-full rounded-md border border-iron-300 bg-white px-3 py-2 focus:border-dlugomat-700 focus-visible:outline-none focus-visible:shadow-shield-focus" defaultValue={a.category}>
                  <option>BIK / KRD</option>
                  <option>Komornicy</option>
                  <option>Banki</option>
                  <option>Upadłość konsumencka</option>
                </select>
              </Field>
              <Field label="Tagi">
                <div className="flex flex-wrap gap-1.5">
                  {a.tags.map((t) => (
                    <Badge key={t} tone="neutral">
                      <Tag className="mr-1 h-3 w-3" aria-hidden />
                      {t}
                    </Badge>
                  ))}
                </div>
              </Field>
              <Field label="Meta description (SEO)">
                <textarea
                  className="block w-full min-h-[60px] rounded-md border border-iron-300 bg-white px-3 py-2 text-sm focus:border-dlugomat-700 focus-visible:outline-none focus-visible:shadow-shield-focus"
                  defaultValue="Jak złożyć wniosek o korektę BIK — wzór, terminy, podstawa prawna."
                />
              </Field>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Historia wersji</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-xs text-iron-700">
                <li className="flex items-center justify-between">
                  <span>v7 · 09.05.2026 14:22</span>
                  <Badge tone="info">aktualna</Badge>
                </li>
                <li className="flex items-center justify-between text-iron-500">
                  <span>v6 · 22.04.2026 11:08</span>
                  <Link href="#" className="hover:text-dlugomat-900">przywróć</Link>
                </li>
                <li className="flex items-center justify-between text-iron-500">
                  <span>v5 · 12.03.2026 16:41</span>
                  <Link href="#" className="hover:text-dlugomat-900">przywróć</Link>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs uppercase tracking-wide text-iron-500">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
