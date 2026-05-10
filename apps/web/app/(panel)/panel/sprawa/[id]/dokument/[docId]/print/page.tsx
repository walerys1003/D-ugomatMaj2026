import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PrintTrigger } from "@/components/wizard/print-trigger";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";
import { composePrintableHtml } from "@/lib/documents/pdf-renderer";
import { caseTypeMeta } from "@/lib/cases/case-types";

export const metadata: Metadata = {
  title: "Pismo (druk) · Długomat",
  robots: { index: false, follow: false },
};

interface Props {
  params: { id: string; docId: string };
}

/**
 * Print-only widok pisma. Renderuje czysty HTML z `composePrintableHtml`
 * — bez nagłówków aplikacji, bez nawigacji. Otwierany przez podgląd jako
 * `target="_blank"`, gdzie userzy używają Ctrl/Cmd+P → "Zapisz jako PDF".
 *
 * Tier 4 podmieni tę trasę na endpoint serwujący prawdziwy PDF
 * (Puppeteer / @react-pdf/renderer) z Supabase Storage.
 */
export default async function PrintPage({ params }: Props) {
  const supabase = createSupabaseServerClient();
  const [docRes, caseRes] = await Promise.all([
    supabase
      .from("documents")
      .select("content_markdown, type")
      .eq("id", params.docId)
      .eq("case_id", params.id)
      .maybeSingle(),
    supabase
      .from("cases")
      .select("title, type")
      .eq("id", params.id)
      .maybeSingle(),
  ]);

  const doc = docRes.data;
  const caseRow = caseRes.data;
  if (!doc || !caseRow) notFound();

  const meta = caseTypeMeta[caseRow.type as keyof typeof caseTypeMeta];
  const title = `Długomat — ${meta.shortTitle}`;
  const html = composePrintableHtml(doc.content_markdown ?? "", { title });

  // Wycinamy `<!DOCTYPE>...<html>...<head>` i wstrzykujemy zawartość przez
  // dangerouslySetInnerHTML do <body>; alternatywnie można serwować przez
  // Route Handler — ale strona React zachowuje routing layoutowy oraz
  // poprawnie obchodzi RLS/auth (middleware już przepuściło request).
  // Wyciągamy część <body>...</body>:
  const bodyMatch = /<body>([\s\S]*?)<\/body>/.exec(html);
  const bodyHtml = bodyMatch ? bodyMatch[1] : html;

  return (
    <>
      <style
        // Print stylesheet — nadpisuje globalne style aplikacji.
        // Zachowane w tej formie, by `next/font` nie nadpisał font-family.
        dangerouslySetInnerHTML={{
          __html: `
@page { size: A4; margin: 22mm 20mm 22mm 25mm; }
html, body {
  background: #fff !important;
  font-family: "IBM Plex Serif", Georgia, "Times New Roman", serif !important;
  font-size: 11pt; line-height: 1.5; color: #0c1422;
}
body > nav, body > header.site-header, body > footer { display: none !important; }
.print-root h1 { font-size: 16pt; line-height: 1.2; margin: 0 0 12pt; text-align: center; }
.print-root h2 { font-size: 13pt; margin: 18pt 0 8pt; }
.print-root h3 { font-size: 11pt; margin: 14pt 0 4pt; text-transform: uppercase; letter-spacing: 0.04em; }
.print-root p  { margin: 0 0 8pt; text-align: justify; }
.print-root hr { border: 0; border-top: 0.5pt solid #94a3b8; margin: 14pt 0; }
.print-root ol, .print-root ul { margin: 0 0 8pt 18pt; padding: 0; }
.print-root li { margin-bottom: 4pt; }
.print-root strong { font-weight: 600; }
.print-root em { font-style: italic; }
.print-toolbar {
  position: sticky; top: 0; z-index: 10;
  display: flex; align-items: center; justify-content: space-between;
  background: #f4f6f8; border-bottom: 1px solid #e2e8f0;
  padding: 10px 16px; font-family: system-ui, sans-serif; font-size: 13px;
}
.print-toolbar button {
  background: #0c1422; color: #fff; border: 0; border-radius: 6px;
  padding: 6px 14px; font-weight: 600; cursor: pointer;
}
@media print {
  .print-toolbar { display: none !important; }
}
          `,
        }}
      />
      <div className="print-toolbar">
        <span>Długomat — tryb drukowania</span>
        <PrintTrigger />
      </div>
      <main
        className="print-root mx-auto max-w-3xl bg-white px-10 py-12 text-[11pt] leading-relaxed text-iron-900"
        dangerouslySetInnerHTML={{ __html: bodyHtml }}
      />
    </>
  );
}


