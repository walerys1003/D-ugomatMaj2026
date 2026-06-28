import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Download, FileText, Upload } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";

export const metadata: Metadata = {
  title: "Dokumenty sprawy — Długomat",
  description: "Repozytorium dokumentów sprawy.",
};
export const dynamic = "force-dynamic";

interface DocRow {
  id: string;
  type: string;
  status: string;
  version: number;
  pdf_url: string | null;
  created_at: string;
  downloaded_at: string | null;
  paid_at: string | null;
}

const STATUS_TONE: Record<string, "info" | "warning" | "neutral" | "success"> = {
  draft: "neutral",
  analysis: "info",
  generated: "info",
  paid: "success",
  downloaded: "success",
  completed: "success",
  archived: "neutral",
};

const STATUS_LABEL: Record<string, string> = {
  draft: "Szkic",
  analysis: "Analiza",
  generated: "Wygenerowany",
  paid: "Opłacony",
  downloaded: "Pobrany",
  completed: "Ukończony",
  archived: "Zarchiwizowany",
};

const fmtDate = (iso: string) =>
  new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(iso));

export default async function CaseDocumentsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!id) return notFound();

  const sb = await createSupabaseServerClient();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) redirect(`/sign-in?next=/panel/sprawy/${id}/dokumenty`);

  const { data } = await sb
    .from("documents")
    .select("id, type, status, version, pdf_url, created_at, downloaded_at, paid_at")
    .eq("case_id", id)
    .order("created_at", { ascending: false });
  const docs: DocRow[] = (data ?? []) as DocRow[];

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8">
        <Link
          href={`/panel/sprawy/${id}`}
          className="text-sm text-slate-600 hover:text-slate-900"
        >
          ← Szczegóły sprawy
        </Link>
        <div className="mt-3 flex items-start justify-between gap-6">
          <div>
            <h1 className="font-display text-3xl text-slate-900">Dokumenty sprawy</h1>
            <p className="mt-2 text-slate-600">
              {docs.length}{" "}
              {docs.length === 1 ? "dokument" : "dokumentów"} w tej sprawie
            </p>
          </div>
          <Link href="/panel/skaner">
            <Button variant="primary" size="sm">
              <Upload className="mr-2 h-4 w-4" />
              Dodaj dokument
            </Button>
          </Link>
        </div>
      </div>

      <Card elevation="subtle">
        <CardHeader>
          <CardTitle>Repozytorium</CardTitle>
          <CardDescription>
            Wszystkie pliki są szyfrowane i zabezpieczone audytem
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          {docs.length === 0 ? (
            <p className="px-6 py-6 text-sm text-slate-500">
              Brak dokumentów w tej sprawie. Wygeneruj pismo w kreatorze lub
              wgraj skan w skanerze, aby pojawiło się tutaj.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-6 py-3 font-medium">Dokument</th>
                  <th className="px-6 py-3 font-medium">Wersja</th>
                  <th className="px-6 py-3 font-medium">Dodano</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium text-right">Akcja</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {docs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-slate-400" />
                        <div>
                          <p className="font-medium text-slate-900">{doc.type}</p>
                          <p className="text-xs text-slate-500">ID: {doc.id.slice(0, 8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">v{doc.version}</td>
                    <td className="px-6 py-4 text-slate-600">{fmtDate(doc.created_at)}</td>
                    <td className="px-6 py-4">
                      <Badge tone={STATUS_TONE[doc.status] ?? "neutral"} withDot>
                        {STATUS_LABEL[doc.status] ?? doc.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {doc.pdf_url ? (
                        <a href={doc.pdf_url} target="_blank" rel="noopener noreferrer">
                          <Button variant="ghost" size="sm" aria-label="Pobierz dokument">
                            <Download className="h-4 w-4" />
                          </Button>
                        </a>
                      ) : (
                        <Link href={`/panel/sprawa/${id}/dokument/${doc.id}/podglad`}>
                          <Button variant="ghost" size="sm">
                            Podgląd
                          </Button>
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
