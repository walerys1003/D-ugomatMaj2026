import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  CheckCircle2,
  ExternalLink,
  Gavel,
  Quote,
  Scale,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";

export const metadata: Metadata = {
  title: "Orzeczenie — Dlugomat",
  description: "Szczegoly pozycji z bazy orzeczniczej: cytat, podstawa prawna i odniesienia.",
};

export const dynamic = "force-dynamic";

const fmtDate = (iso: string | null) =>
  iso
    ? new Intl.DateTimeFormat("pl-PL", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date(iso))
    : "—";

export default async function RulingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/sign-in?next=/panel/baza-orzecznicza/${id}`);

  const { data: ref } = await supabase
    .from("legal_references")
    .select(
      "id, citation, signature, abbreviation, article_number, ref_type, legal_area, body, url, publication_date, verified",
    )
    .eq("id", id)
    .single();

  if (!ref) return notFound();

  const heading = ref.signature ?? ref.abbreviation ?? ref.citation;

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-8">
        <Link
          href="/panel/baza-orzecznicza"
          className="text-sm text-slate-600 hover:text-slate-900"
        >
          ← Baza orzecznicza
        </Link>
        <div className="mt-3 flex items-start justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              {ref.legal_area ? <Badge tone="neutral">{ref.legal_area}</Badge> : null}
              <Badge tone="info">{ref.ref_type}</Badge>
              {ref.verified ? (
                <Badge tone="success" withDot>
                  Zweryfikowane
                </Badge>
              ) : (
                <Badge tone="warning" withDot>
                  Niezweryfikowane
                </Badge>
              )}
            </div>
            <h1 className="mt-3 font-display text-2xl text-slate-900">
              <span className="font-mono">{heading}</span>
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              {ref.article_number ? `${ref.article_number} · ` : ""}
              {fmtDate(ref.publication_date)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <Card urgency="success">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Quote className="h-5 w-5 text-emerald-600" />
                Cytat / odniesienie
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base leading-relaxed text-slate-700">{ref.citation}</p>
            </CardContent>
          </Card>

          {ref.body ? (
            <Card elevation="subtle">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Gavel className="h-4 w-4 text-slate-500" />
                  Tresc
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                  {ref.body}
                </p>
              </CardContent>
            </Card>
          ) : null}

          <Card elevation="subtle">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Scale className="h-4 w-4 text-slate-500" />
                Metadane pozycji
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-xs uppercase tracking-wide text-slate-500">Typ</dt>
                  <dd className="font-medium text-slate-900">{ref.ref_type}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-slate-500">Sygnatura</dt>
                  <dd className="font-medium text-slate-900">{ref.signature ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-slate-500">Skrot</dt>
                  <dd className="font-medium text-slate-900">{ref.abbreviation ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-slate-500">Artykul</dt>
                  <dd className="font-medium text-slate-900">{ref.article_number ?? "—"}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card elevation="subtle">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Calendar className="h-4 w-4 text-slate-500" />
                Publikacja
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-700">{fmtDate(ref.publication_date)}</p>
            </CardContent>
          </Card>

          {ref.legal_area ? (
            <Card elevation="subtle">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <BookOpen className="h-4 w-4 text-slate-500" />
                  Obszar prawa
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Badge tone="neutral">{ref.legal_area}</Badge>
              </CardContent>
            </Card>
          ) : null}

          {ref.url ? (
            <Card elevation="subtle">
              <CardContent className="py-5">
                <p className="text-sm font-medium text-slate-900">Pelna tresc</p>
                <p className="mt-1 text-xs text-slate-600">Otworz zrodlo zewnetrzne</p>
                <Button variant="ghost" size="sm" className="mt-3" asChild>
                  <a href={ref.url} target="_blank" rel="noopener noreferrer">
                    Zobacz zrodlo
                    <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          ) : null}

          <Card elevation="pop">
            <CardContent className="py-5">
              <p className="text-sm font-medium text-slate-900">
                {ref.verified ? "Pozycja zweryfikowana" : "Wymaga weryfikacji"}
              </p>
              <p className="mt-1 inline-flex items-center gap-1 text-xs text-slate-600">
                {ref.verified ? (
                  <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                ) : null}
                {ref.verified
                  ? "Mozesz powolac sie na te pozycje w pismie."
                  : "Zweryfikuj tresc przed uzyciem w pismie."}
              </p>
              <Button variant="primary" size="sm" className="mt-3 w-full" asChild>
                <Link href="/panel/baza-orzecznicza">
                  Wroc do bazy
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
