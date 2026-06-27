import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Folder, FolderPlus, Lock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Foldery dokumentów — Długomat",
  description: "Organizacja dokumentów w folderach z poziomami dostępu.",
};

interface FolderItem {
  id: string;
  name: string;
  description: string;
  documents_count: number;
  size_mb: number;
  shared: boolean;
  last_modified: string;
  color: "blue" | "amber" | "green" | "gray" | "red";
}

const FOLDERS: FolderItem[] = [
  {
    id: "f_001",
    name: "Sprawa BIK — kredyt mBank 2019",
    description: "Wniosek o korektę, korespondencja z bankiem, raporty BIK",
    documents_count: 14,
    size_mb: 12.4,
    shared: true,
    last_modified: "2026-05-10",
    color: "blue",
  },
  {
    id: "f_002",
    name: "Egzekucja komornicza KM 412/25",
    description: "Tytuł wykonawczy, wnioski, korespondencja z komornikiem",
    documents_count: 22,
    size_mb: 18.7,
    shared: false,
    last_modified: "2026-05-08",
    color: "red",
  },
  {
    id: "f_003",
    name: "Umowy kredytowe",
    description: "Skany umów, regulaminy, aneksy",
    documents_count: 8,
    size_mb: 24.1,
    shared: false,
    last_modified: "2026-05-04",
    color: "amber",
  },
  {
    id: "f_004",
    name: "Korespondencja z windykatorami",
    description: "Pisma, wezwania, propozycje ugody",
    documents_count: 16,
    size_mb: 6.8,
    shared: true,
    last_modified: "2026-04-30",
    color: "gray",
  },
  {
    id: "f_005",
    name: "Wzory pism (własne)",
    description: "Szablony reklamacji, wniosków, odwołań",
    documents_count: 11,
    size_mb: 2.3,
    shared: false,
    last_modified: "2026-04-22",
    color: "green",
  },
  {
    id: "f_006",
    name: "Archiwum 2024",
    description: "Zamknięte sprawy z 2024 roku",
    documents_count: 47,
    size_mb: 89.2,
    shared: false,
    last_modified: "2025-01-15",
    color: "gray",
  },
];

const COLOR_CLASS: Record<FolderItem["color"], string> = {
  blue: "text-dlugomat-700",
  amber: "text-warn",
  green: "text-accent-700",
  red: "text-danger",
  gray: "text-ink-500",
};

export default function DokumentyFolderyPage() {
  const totalDocs = FOLDERS.reduce((s, f) => s + f.documents_count, 0);
  const totalSize = FOLDERS.reduce((s, f) => s + f.size_mb, 0);

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.18em] text-ink-500">
            Dokumenty · foldery
          </p>
          <h1 className="font-display text-fluid-h1 text-dlugomat-950">
            Twoje foldery
          </h1>
          <p className="max-w-2xl text-ink-600">
            Wszystkie dokumenty są szyfrowane (AES-256) i przechowywane w EU.
            Foldery oznaczone jako współdzielone udostępnione są partnerom prawnym.
          </p>
        </div>
        <Button>
          <FolderPlus className="mr-2 h-4 w-4" aria-hidden />
          Nowy folder
        </Button>
      </header>

      <nav aria-label="Widoki dokumentów" className="flex gap-1 rounded-md border border-ink-200 bg-ink-50 p-1 w-fit text-sm">
        <Link
          href="/panel/dokumenty"
          className="rounded px-3 py-1.5 text-ink-700 hover:bg-white focus-visible:outline-none focus-visible:shadow-shield-focus"
        >
          Wszystkie
        </Link>
        <span className="rounded bg-white px-3 py-1.5 font-semibold text-dlugomat-900 shadow-sm">
          Foldery
        </span>
        <Link
          href="/panel/dokumenty/tagi"
          className="rounded px-3 py-1.5 text-ink-700 hover:bg-white focus-visible:outline-none focus-visible:shadow-shield-focus"
        >
          Tagi
        </Link>
      </nav>

      <section className="grid gap-4 sm:grid-cols-3" aria-label="Statystyki">
        <Card>
          <CardHeader>
            <CardDescription>Folderów</CardDescription>
            <CardTitle className="font-display text-fluid-h3 text-dlugomat-950">
              {FOLDERS.length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Dokumentów łącznie</CardDescription>
            <CardTitle className="font-display text-fluid-h3 text-dlugomat-950">
              {totalDocs}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Zajęte miejsce</CardDescription>
            <CardTitle className="font-display text-fluid-h3 text-dlugomat-950">
              {totalSize.toFixed(1)} MB
            </CardTitle>
          </CardHeader>
        </Card>
      </section>

      <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" aria-label="Lista folderów">
        {FOLDERS.map((f) => (
          <li key={f.id}>
            <Link
              href={`/panel/dokumenty?folder=${f.id}`}
              className="group block h-full rounded-lg border border-ink-200 bg-white p-5 shadow-card transition hover:shadow-pop focus-visible:outline-none focus-visible:shadow-shield-focus"
            >
              <div className="flex items-start justify-between">
                <Folder className={`h-7 w-7 ${COLOR_CLASS[f.color]}`} aria-hidden />
                <ArrowRight
                  className="h-5 w-5 text-ink-400 group-hover:text-dlugomat-700"
                  aria-hidden
                />
              </div>
              <h3 className="mt-4 font-semibold text-dlugomat-950 line-clamp-2">
                {f.name}
              </h3>
              <p className="mt-1 text-sm text-ink-600 line-clamp-2">{f.description}</p>
              <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-ink-500">
                <span>{f.documents_count} dokumentów</span>
                <span aria-hidden>·</span>
                <span>{f.size_mb} MB</span>
                <span aria-hidden>·</span>
                <span>{f.last_modified}</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {f.shared ? (
                  <Badge tone="info">Współdzielony</Badge>
                ) : (
                  <Badge tone="neutral">
                    <Lock className="mr-1 h-3 w-3" aria-hidden />
                    Prywatny
                  </Badge>
                )}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
