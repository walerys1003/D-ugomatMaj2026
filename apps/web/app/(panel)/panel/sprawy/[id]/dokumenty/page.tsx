import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Download, FileText, Filter, Upload } from "lucide-react";
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
  title: "Dokumenty sprawy — Dlugomat",
  description: "Repozytorium dokumentow sprawy z filtrami i akcjami.",
};

type Document = {
  id: string;
  name: string;
  category: "nakaz" | "pismo" | "umowa" | "korespondencja" | "dowod";
  size: string;
  uploadedAt: string;
  uploadedBy: string;
  verified: boolean;
};

const DOCS: Document[] = [
  {
    id: "d-1",
    name: "Nakaz zaplaty I Nc 4521-26.pdf",
    category: "nakaz",
    size: "412 KB",
    uploadedAt: "2026-04-22",
    uploadedBy: "Kandydat",
    verified: true,
  },
  {
    id: "d-2",
    name: "Umowa pozyczki nr 2019-08-14.pdf",
    category: "umowa",
    size: "1.2 MB",
    uploadedAt: "2026-04-23",
    uploadedBy: "Kandydat",
    verified: true,
  },
  {
    id: "d-3",
    name: "Pismo wierzyciela z 2024-11-08.pdf",
    category: "korespondencja",
    size: "186 KB",
    uploadedAt: "2026-04-23",
    uploadedBy: "Kandydat",
    verified: false,
  },
  {
    id: "d-4",
    name: "Sprzeciw od nakazu (projekt).docx",
    category: "pismo",
    size: "48 KB",
    uploadedAt: "2026-05-05",
    uploadedBy: "System AI",
    verified: false,
  },
  {
    id: "d-5",
    name: "Potwierdzenie zaplaty rat 2021-2023.pdf",
    category: "dowod",
    size: "892 KB",
    uploadedAt: "2026-04-25",
    uploadedBy: "Kandydat",
    verified: true,
  },
  {
    id: "d-6",
    name: "Wezwanie do zaplaty 2023-12-12.pdf",
    category: "korespondencja",
    size: "224 KB",
    uploadedAt: "2026-04-24",
    uploadedBy: "Kandydat",
    verified: true,
  },
];

const CATEGORY_LABEL: Record<Document["category"], string> = {
  nakaz: "Nakaz",
  pismo: "Pismo procesowe",
  umowa: "Umowa",
  korespondencja: "Korespondencja",
  dowod: "Dowod",
};

const CATEGORY_TONE: Record<
  Document["category"],
  "info" | "warning" | "neutral" | "success"
> = {
  nakaz: "warning",
  pismo: "info",
  umowa: "neutral",
  korespondencja: "neutral",
  dowod: "success",
};

const FILTERS: Array<{ value: Document["category"] | "all"; label: string }> = [
  { value: "all", label: "Wszystkie" },
  { value: "nakaz", label: "Nakazy" },
  { value: "pismo", label: "Pisma" },
  { value: "umowa", label: "Umowy" },
  { value: "korespondencja", label: "Korespondencja" },
  { value: "dowod", label: "Dowody" },
];

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

  const verifiedCount = DOCS.filter((d) => d.verified).length;
  const totalSize = "3.0 MB";

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8">
        <Link
          href={`/panel/sprawy/${id}`}
          className="text-sm text-slate-600 hover:text-slate-900"
        >
          ← Szczegoly sprawy
        </Link>
        <div className="mt-3 flex items-start justify-between gap-6">
          <div>
            <h1 className="font-display text-3xl text-slate-900">
              Dokumenty sprawy
            </h1>
            <p className="mt-2 text-slate-600">
              {DOCS.length} dokumentow, {verifiedCount} zweryfikowanych,{" "}
              {totalSize} laczne
            </p>
          </div>
          <Button variant="primary" size="sm">
            <Upload className="mr-2 h-4 w-4" />
            Dodaj dokument
          </Button>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <Filter className="h-4 w-4 text-slate-500" />
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 hover:border-slate-300 focus-visible:shadow-shield-focus"
          >
            {f.label}
          </button>
        ))}
      </div>

      <Card elevation="subtle">
        <CardHeader>
          <CardTitle>Repozytorium</CardTitle>
          <CardDescription>
            Wszystkie pliki sa szyfrowane i zabezpieczone audytem
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-6 py-3 font-medium">Nazwa</th>
                <th className="px-6 py-3 font-medium">Kategoria</th>
                <th className="px-6 py-3 font-medium">Rozmiar</th>
                <th className="px-6 py-3 font-medium">Dodano</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium text-right">Akcja</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {DOCS.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-slate-400" />
                      <div>
                        <p className="font-medium text-slate-900">{doc.name}</p>
                        <p className="text-xs text-slate-500">
                          przez {doc.uploadedBy}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge tone={CATEGORY_TONE[doc.category]}>
                      {CATEGORY_LABEL[doc.category]}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{doc.size}</td>
                  <td className="px-6 py-4 text-slate-600">
                    {fmtDate(doc.uploadedAt)}
                  </td>
                  <td className="px-6 py-4">
                    {doc.verified ? (
                      <Badge tone="success" withDot>
                        Zweryfikowany
                      </Badge>
                    ) : (
                      <Badge tone="warning" withDot>
                        W weryfikacji
                      </Badge>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="sm" aria-label="Pobierz dokument">
                      <Download className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
