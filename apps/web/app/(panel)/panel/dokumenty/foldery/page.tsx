import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Folder, FolderPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";

export const metadata: Metadata = {
  title: "Foldery dokumentów — Długomat",
  description: "Organizacja dokumentów w folderach (wg spraw) z poziomami dostępu.",
};

export const dynamic = "force-dynamic";

interface FolderItem {
  id: string;
  name: string;
  description: string;
  documents_count: number;
  last_modified: string;
  color: "blue" | "amber" | "green" | "gray" | "red";
}

const COLOR_CLASS: Record<FolderItem["color"], string> = {
  blue: "text-dlugomat-700",
  amber: "text-warn",
  green: "text-accent-700",
  red: "text-danger",
  gray: "text-ink-500",
};

const COLOR_CYCLE: FolderItem["color"][] = ["blue", "amber", "green", "red", "gray"];

const fmtDate = (iso: string | null) =>
  iso ? new Intl.DateTimeFormat("pl-PL", { dateStyle: "medium" }).format(new Date(iso)) : "—";

export default async function DokumentyFolderyPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/logowanie?next=/panel/dokumenty/foldery");

  // Foldery = sprawy uzytkownika; liczymy dokumenty per sprawa.
  const [casesRes, docsRes] = await Promise.all([
    supabase
      .from("cases")
      .select("id, title, type, status, updated_at")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false }),
    supabase.from("documents").select("case_id, updated_at").eq("user_id", user.id),
  ]);

  const docsByCase = new Map<string, { count: number; last: string | null }>();
  for (const d of docsRes.data ?? []) {
    const prev = docsByCase.get(d.case_id) ?? { count: 0, last: null };
    const last =
      !prev.last || (d.updated_at && d.updated_at > prev.last) ? d.updated_at : prev.last;
    docsByCase.set(d.case_id, { count: prev.count + 1, last });
  }

  const FOLDERS: FolderItem[] = (casesRes.data ?? []).map((c, i) => {
    const agg = docsByCase.get(c.id) ?? { count: 0, last: null };
    return {
      id: c.id,
      name: c.title ?? "Sprawa",
      description: `${c.type ?? ""}${c.status ? ` · ${c.status}` : ""}`.trim() || "Sprawa",
      documents_count: agg.count,
      last_modified: fmtDate(agg.last ?? c.updated_at ?? null),
      color: COLOR_CYCLE[i % COLOR_CYCLE.length],
    };
  });

  const totalDocs = FOLDERS.reduce((s, f) => s + f.documents_count, 0);

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
            <CardDescription>Sprawy z dokumentami</CardDescription>
            <CardTitle className="font-display text-fluid-h3 text-dlugomat-950">
              {FOLDERS.filter((f) => f.documents_count > 0).length}
            </CardTitle>
          </CardHeader>
        </Card>
      </section>

      {FOLDERS.length === 0 ? (
        <EmptyState
          title="Brak folderow"
          description="Foldery odpowiadaja Twoim sprawom. Utworz sprawe, aby zaczac porzadkowac dokumenty."
        />
      ) : (
        <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" aria-label="Lista folderów">
          {FOLDERS.map((f) => (
            <li key={f.id}>
              <Link
                href={`/panel/dokumenty?case=${f.id}`}
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
                  <span>{f.last_modified}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
