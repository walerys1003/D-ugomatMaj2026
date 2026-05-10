import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";
import { markdownToHtml } from "@/lib/documents/markdown-to-html";
import { caseStatusLabel, caseTypeMeta } from "@/lib/cases/case-types";
import { formatDateTimePL } from "@/lib/utils";

export const metadata: Metadata = { title: "Podgląd pisma · Długomat" };

interface Props {
  params: { id: string; docId: string };
}

export default async function PodgladPage({ params }: Props) {
  const supabase = createSupabaseServerClient();
  const [docRes, caseRes] = await Promise.all([
    supabase
      .from("documents")
      .select("*")
      .eq("id", params.docId)
      .eq("case_id", params.id)
      .maybeSingle(),
    supabase
      .from("cases")
      .select("*")
      .eq("id", params.id)
      .maybeSingle(),
  ]);

  const doc = docRes.data;
  const caseRow = caseRes.data;
  if (!doc || !caseRow) notFound();

  const html = doc.content_html ?? markdownToHtml(doc.content_markdown ?? "");
  const meta = caseTypeMeta[caseRow.type as keyof typeof caseTypeMeta];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header className="space-y-2">
        <Link
          href={`/panel/sprawa/${caseRow.id}`}
          className="text-fluid-xs text-iron-500 hover:text-iron-700 dark:text-iron-400 dark:hover:text-iron-200"
        >
          ← Sprawa
        </Link>
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h1 className="font-serif text-fluid-3xl text-iron-900 dark:text-iron-50">
            Podgląd pisma
          </h1>
          <div className="flex items-center gap-2">
            <Badge tone="info">{meta.module}</Badge>
            <Badge tone="success">{caseStatusLabel[caseRow.status]}</Badge>
          </div>
        </div>
        <p className="text-fluid-sm text-iron-600 dark:text-iron-400">
          Wersja {doc.version} · wygenerowano {formatDateTimePL(new Date(doc.created_at))}
          {doc.is_template ? " · szablon (Tier 2)" : " · wersja AI"}
        </p>
      </header>

      <Card elevation="pop">
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
          <CardTitle className="text-fluid-base">Treść pisma</CardTitle>
          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link
                href={`/panel/sprawa/${caseRow.id}/dokument/${doc.id}/print`}
                target="_blank"
                rel="noopener"
              >
                Tryb drukowania (PDF)
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <article
            className="prose-pisma"
            // Treść jest deterministycznie generowana z naszego markdown-to-html
            // (escape'owana), więc nie wpuszczamy user-input HTML do DOM.
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </CardContent>
      </Card>

      <aside className="rounded-xl border border-iron-200 bg-iron-50/60 p-4 text-fluid-xs text-iron-600 dark:border-iron-800 dark:bg-iron-900/40 dark:text-iron-400">
        <p className="mb-1 font-medium text-iron-700 dark:text-iron-300">
          Co dalej?
        </p>
        <ol className="list-decimal space-y-1 pl-5">
          <li>Kliknij <strong>Tryb drukowania (PDF)</strong> i zapisz dokument (Ctrl/Cmd + P → „Zapisz jako PDF”).</li>
          <li>Wydrukuj 2 egzemplarze (oryginał dla sądu + odpis dla strony przeciwnej).</li>
          <li>Złóż w sądzie wskazanym na pierwszej stronie pisma — w terminie wskazanym na nakazie.</li>
        </ol>
      </aside>
    </div>
  );
}
