import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CheckCircle2,
  Download,
  Eye,
  FileText,
  History,
  Lock,
  Share2,
  ShieldCheck,
  Tag,
  User,
} from "lucide-react";
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
  title: "Dokument — Dlugomat",
  description:
    "Szczegoly dokumentu z weryfikacja, historia wersji i mozliwoscia udostepnienia.",
};

type Document = {
  id: string;
  name: string;
  type: string;
  size: string;
  pages: number;
  category: "nakaz" | "pismo" | "umowa" | "korespondencja" | "dowod";
  caseId?: string;
  caseSignature?: string;
  uploadedAt: string;
  uploadedBy: string;
  verified: boolean;
  verifiedBy?: string;
  encryption: "AES-256";
  hash: string;
  tags: string[];
};

type VersionRow = {
  version: number;
  date: string;
  by: string;
  note: string;
};

type AuditRow = {
  id: string;
  action: string;
  by: string;
  at: string;
};

const DOCS: Record<string, Document> = {
  "doc-001": {
    id: "doc-001",
    name: "Nakaz zaplaty I Nc 4521-26.pdf",
    type: "application/pdf",
    size: "412 KB",
    pages: 4,
    category: "nakaz",
    caseId: "spr-001",
    caseSignature: "I Nc 4521/26",
    uploadedAt: "2026-04-22T10:32:18",
    uploadedBy: "Anna Nowak",
    verified: true,
    verifiedBy: "System OCR + Mecenas Kowalska",
    encryption: "AES-256",
    hash: "sha256:9f3a4b2c8d1e7f6a5b9c4d2e3f8a1b6c",
    tags: ["EPU", "nakaz", "warszawa-mokotow"],
  },
};

const VERSIONS: VersionRow[] = [
  { version: 3, date: "2026-04-23T08:14:00", by: "System OCR", note: "Weryfikacja prawnika" },
  { version: 2, date: "2026-04-22T14:08:00", by: "System OCR", note: "Rozpoznawanie tekstu" },
  { version: 1, date: "2026-04-22T10:32:18", by: "Anna Nowak", note: "Pierwsze wgranie" },
];

const AUDIT: AuditRow[] = [
  { id: "a-1", action: "document.view", by: "Anna Nowak", at: "2026-05-10T09:14:00" },
  { id: "a-2", action: "document.share", by: "Anna Nowak", at: "2026-05-09T17:48:00" },
  { id: "a-3", action: "document.download", by: "Mecenas Kowalska", at: "2026-04-28T12:24:00" },
  { id: "a-4", action: "document.verify", by: "System OCR", at: "2026-04-23T08:14:00" },
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

const fmtTime = (iso: string) =>
  new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));

async function loadDocument(id: string): Promise<Document | null> {
  return DOCS[id] ?? DOCS["doc-001"] ?? null;
}

export default async function DocumentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const doc = await loadDocument(id);
  if (!doc) return notFound();

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8">
        <Link
          href="/panel/dokumenty"
          className="text-sm text-slate-600 hover:text-slate-900"
        >
          ← Dokumenty
        </Link>
        <div className="mt-3 flex items-start justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <Badge tone={CATEGORY_TONE[doc.category]}>
                {CATEGORY_LABEL[doc.category]}
              </Badge>
              {doc.verified ? (
                <Badge tone="success" withDot>
                  Zweryfikowany
                </Badge>
              ) : (
                <Badge tone="warning" withDot>
                  W weryfikacji
                </Badge>
              )}
            </div>
            <h1 className="mt-2 font-display text-2xl text-slate-900">
              {doc.name}
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              {doc.pages} stron · {doc.size} · wgrane{" "}
              {fmtTime(doc.uploadedAt)}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm">
              <Share2 className="mr-1 h-4 w-4" />
              Udostepnij
            </Button>
            <Button variant="primary" size="sm">
              <Download className="mr-1 h-4 w-4" />
              Pobierz
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <Card elevation="subtle">
            <CardHeader>
              <CardTitle className="text-base">Podglad dokumentu</CardTitle>
              <CardDescription>
                Renderowanie zachowuje uklad oryginalu
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex aspect-[3/4] items-center justify-center rounded-lg border border-slate-200 bg-slate-50">
                <div className="text-center">
                  <FileText className="mx-auto h-10 w-10 text-slate-300" />
                  <p className="mt-3 text-sm text-slate-500">
                    Strona 1 z {doc.pages}
                  </p>
                  <Button variant="secondary" size="sm" className="mt-3">
                    <Eye className="mr-1 h-4 w-4" />
                    Pelny podglad
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card elevation="subtle">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <History className="h-4 w-4 text-slate-500" />
                Historia wersji
              </CardTitle>
              <CardDescription>{VERSIONS.length} wersji</CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              <table className="w-full text-sm">
                <thead className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-6 py-3 font-medium">Wersja</th>
                    <th className="px-6 py-3 font-medium">Czas</th>
                    <th className="px-6 py-3 font-medium">Autor</th>
                    <th className="px-6 py-3 font-medium">Notatka</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {VERSIONS.map((v) => (
                    <tr key={v.version} className="hover:bg-slate-50">
                      <td className="px-6 py-3 font-mono text-xs text-slate-700">
                        v{v.version}
                      </td>
                      <td className="px-6 py-3 text-slate-600">
                        {fmtTime(v.date)}
                      </td>
                      <td className="px-6 py-3 text-slate-700">{v.by}</td>
                      <td className="px-6 py-3 text-slate-600">{v.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card elevation="subtle">
            <CardHeader>
              <CardTitle className="text-base">Metadane</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-slate-500">Typ</dt>
                  <dd className="font-mono text-xs text-slate-700">{doc.type}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-slate-500">Rozmiar</dt>
                  <dd className="text-slate-700">{doc.size}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-slate-500">Stron</dt>
                  <dd className="text-slate-700">{doc.pages}</dd>
                </div>
                {doc.caseSignature ? (
                  <div className="flex justify-between gap-3">
                    <dt className="text-slate-500">Sprawa</dt>
                    <dd>
                      <Link
                        href={`/panel/sprawy/${doc.caseId}`}
                        className="text-sm font-medium text-slate-900 hover:underline"
                      >
                        {doc.caseSignature}
                      </Link>
                    </dd>
                  </div>
                ) : null}
              </dl>
            </CardContent>
          </Card>

          <Card elevation="subtle">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                Bezpieczenstwo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-2 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <dt className="inline-flex items-center gap-2 text-slate-500">
                    <Lock className="h-3.5 w-3.5" />
                    Szyfrowanie
                  </dt>
                  <dd className="text-slate-700">{doc.encryption}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Hash SHA-256</dt>
                  <dd className="mt-1 break-all font-mono text-xs text-slate-700">
                    {doc.hash}
                  </dd>
                </div>
                {doc.verifiedBy ? (
                  <div className="flex justify-between gap-3">
                    <dt className="inline-flex items-center gap-2 text-slate-500">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      Zweryfikowany przez
                    </dt>
                    <dd className="text-right text-xs text-slate-700">
                      {doc.verifiedBy}
                    </dd>
                  </div>
                ) : null}
              </dl>
            </CardContent>
          </Card>

          <Card elevation="subtle">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Tag className="h-4 w-4 text-slate-500" />
                Tagi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {doc.tags.map((t) => (
                  <Badge key={t} tone="neutral">
                    {t}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card elevation="subtle">
            <CardHeader>
              <CardTitle className="text-base">Audyt dostepu</CardTitle>
              <CardDescription>Ostatnie zdarzenia</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {AUDIT.map((a) => (
                  <li
                    key={a.id}
                    className="flex items-start gap-3 rounded-md border border-slate-200 bg-white p-3"
                  >
                    <User className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                    <div className="flex-1">
                      <p className="font-mono text-xs text-slate-700">
                        {a.action}
                      </p>
                      <p className="text-xs text-slate-500">
                        {a.by} · {fmtTime(a.at)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
