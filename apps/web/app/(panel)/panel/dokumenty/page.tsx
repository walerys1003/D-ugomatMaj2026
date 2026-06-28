import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Dokumenty | Długomat" };

interface DocumentRow {
  id: string;
  title: string;
  kind:
    | "pismo_procesowe"
    | "umowa"
    | "wezwanie"
    | "dowod"
    | "orzeczenie"
    | "korespondencja"
    | "inny";
  case_id?: string;
  case_title?: string;
  size_kb: number;
  uploaded_at: string;
  signed: boolean;
  ocr_processed: boolean;
}

const KIND_LABELS: Record<DocumentRow["kind"], string> = {
  pismo_procesowe: "Pismo procesowe",
  umowa: "Umowa",
  wezwanie: "Wezwanie",
  dowod: "Dowód",
  orzeczenie: "Orzeczenie",
  korespondencja: "Korespondencja",
  inny: "Inny",
};

async function fetchDocuments(params: {
  q?: string;
  kind?: string;
}): Promise<DocumentRow[]> {
  try {
    const qs = new URLSearchParams();
    if (params.q) qs.set("q", params.q);
    if (params.kind) qs.set("kind", params.kind);
    const res = await fetch(`/api/documents?${qs.toString()}`, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return data.documents ?? [];
  } catch {
    return [];
  }
}

export default async function DokumentyPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; kind?: string }>;
}) {
  const sp = await searchParams;
  const docs = await fetchDocuments(sp);

  return (
    <main className="container mx-auto px-4 py-8 max-w-6xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wider text-ink-500 mb-2">
            Repozytorium
          </p>
          <h1 className="font-display text-3xl font-semibold text-ink-900 dark:text-ink-50">
            Dokumenty
          </h1>
          <p className="text-sm text-ink-500 mt-1">
            {docs.length} dokumentów · pełnotekstowe wyszukiwanie po OCR
          </p>
        </div>
        <Link href="/panel/dokumenty/upload">
          <Button variant="primary">+ Wgraj dokument</Button>
        </Link>
      </div>

      <Card elevation="subtle">
        <CardContent className="pt-6">
          <form className="grid sm:grid-cols-[1fr_200px_auto] gap-2">
            <input
              type="search"
              name="q"
              defaultValue={sp.q}
              placeholder="Szukaj w treści dokumentów (OCR)..."
              className="rounded-lg border border-ink-300 dark:border-ink-700 bg-white dark:bg-ink-900 px-3 py-2 focus:outline-none focus-visible:shadow-shield-focus"
            />
            <select
              name="kind"
              defaultValue={sp.kind}
              className="rounded-lg border border-ink-300 dark:border-ink-700 bg-white dark:bg-ink-900 px-3 py-2 focus:outline-none focus-visible:shadow-shield-focus"
            >
              <option value="">Wszystkie typy</option>
              {Object.entries(KIND_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
            <Button type="submit" variant="secondary">
              Filtruj
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card elevation="subtle">
        <CardContent className="pt-6">
          {docs.length === 0 ? (
            <p className="text-sm text-ink-500">Brak dokumentów.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b border-ink-200 dark:border-ink-800 text-xs uppercase tracking-wider text-ink-500">
                    <th className="py-2 pr-3">Dokument</th>
                    <th className="py-2 pr-3">Typ</th>
                    <th className="py-2 pr-3">Sprawa</th>
                    <th className="py-2 pr-3">Wgrano</th>
                    <th className="py-2 pr-3">Status</th>
                    <th className="py-2 pr-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {docs.map((d) => (
                    <tr key={d.id} className="border-b border-ink-100 dark:border-ink-900">
                      <td className="py-3 pr-3">
                        <div className="font-medium text-ink-900 dark:text-ink-50 truncate max-w-xs">
                          {d.title}
                        </div>
                        <div className="text-xs text-ink-500">
                          {Math.round((d.size_kb / 1024) * 10) / 10} MB
                        </div>
                      </td>
                      <td className="py-3 pr-3">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-ink-100 dark:bg-ink-800">
                          {KIND_LABELS[d.kind]}
                        </span>
                      </td>
                      <td className="py-3 pr-3">
                        {d.case_id ? (
                          <Link
                            href={`/panel/sprawa/${d.case_id}`}
                            className="text-xs text-accent-700 hover:text-accent-800"
                          >
                            {d.case_title}
                          </Link>
                        ) : (
                          <span className="text-xs text-ink-400">—</span>
                        )}
                      </td>
                      <td className="py-3 pr-3 text-ink-600 dark:text-ink-400 text-xs">
                        {new Date(d.uploaded_at).toLocaleDateString("pl-PL")}
                      </td>
                      <td className="py-3 pr-3">
                        <div className="flex gap-1">
                          {d.ocr_processed && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-accent-50 text-accent-700 border border-accent-200">
                              OCR
                            </span>
                          )}
                          {d.signed && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-accent-50 text-accent-700 border border-accent-200">
                              Podpisany
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 pr-3 text-right">
                        <Link
                          href={`/panel/dokumenty/${d.id}`}
                          className="text-xs text-accent-700 hover:text-accent-800"
                        >
                          Otwórz →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
