/**
 * Minimalny, bezpieczny renderer Markdown → HTML dla pism procesowych.
 *
 * Świadomie nie używamy zewnętrznej biblioteki — pisma mają ograniczony
 * zestaw konstrukcji (nagłówki, **bold**, listy numeryczne, podział `---`,
 * akapity), więc deterministyczny renderer w jednym pliku jest:
 *   - bezpieczniejszy (brak XSS via marked plugins),
 *   - lżejszy (zero deps),
 *   - łatwiejszy do testowania.
 *
 * Tier 3 może wymienić to na `marked` + `dompurify` jeżeli prompt LLM zacznie
 * generować bardziej zróżnicowany markdown.
 */

const ESCAPE_MAP: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

function escapeHtml(input: string): string {
  return input.replace(/[&<>"']/g, (ch) => ESCAPE_MAP[ch] ?? ch);
}

function renderInline(text: string): string {
  // **bold**
  let out = escapeHtml(text);
  out = out.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  // *italic*  (po bold, by uniknąć kolizji)
  out = out.replace(/\b_(.+?)_\b/g, "<em>$1</em>");
  return out;
}

export function markdownToHtml(markdown: string): string {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const out: string[] = [];

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    // Empty line
    if (line.trim() === "") {
      i += 1;
      continue;
    }

    // HR
    if (/^---+$/.test(line.trim())) {
      out.push("<hr />");
      i += 1;
      continue;
    }

    // Headings
    const heading = /^(#{1,6})\s+(.+)$/.exec(line);
    if (heading) {
      const level = heading[1].length;
      out.push(`<h${level}>${renderInline(heading[2])}</h${level}>`);
      i += 1;
      continue;
    }

    // Numbered list
    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s+/, ""));
        i += 1;
      }
      out.push("<ol>");
      for (const item of items) out.push(`<li>${renderInline(item)}</li>`);
      out.push("</ol>");
      continue;
    }

    // Bullet list
    if (/^[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^[-*]\s+/, ""));
        i += 1;
      }
      out.push("<ul>");
      for (const item of items) out.push(`<li>${renderInline(item)}</li>`);
      out.push("</ul>");
      continue;
    }

    // Paragraph (collect consecutive non-empty, non-block lines)
    const paragraph: string[] = [line];
    i += 1;
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !/^#{1,6}\s+/.test(lines[i]) &&
      !/^---+$/.test(lines[i].trim()) &&
      !/^\d+\.\s+/.test(lines[i]) &&
      !/^[-*]\s+/.test(lines[i])
    ) {
      paragraph.push(lines[i]);
      i += 1;
    }
    out.push(`<p>${renderInline(paragraph.join(" "))}</p>`);
  }

  return out.join("\n");
}

/**
 * Otacza zrenderowane pismo standardową ramą HTML pasującą do druku
 * (A4, marginesy, czcionka serif, wcięcia akapitów). Używane przez
 * generator PDF (Tier 2: print stylesheet, Tier 4: @react-pdf/renderer).
 */
export function wrapDocumentHtml(
  bodyHtml: string,
  options: { title?: string } = {},
): string {
  const title = options.title ?? "Długomat — pismo";
  return `<!DOCTYPE html>
<html lang="pl">
<head>
<meta charset="utf-8" />
<title>${escapeHtml(title)}</title>
<style>
  @page { size: A4; margin: 22mm 20mm 22mm 25mm; }
  html, body { font-family: "IBM Plex Serif", Georgia, "Times New Roman", serif; font-size: 11pt; line-height: 1.5; color: #0c1422; }
  h1 { font-size: 16pt; line-height: 1.2; margin: 0 0 12pt; text-align: center; }
  h2 { font-size: 13pt; margin: 18pt 0 8pt; }
  h3 { font-size: 11pt; margin: 14pt 0 4pt; text-transform: uppercase; letter-spacing: 0.04em; }
  p  { margin: 0 0 8pt; text-align: justify; }
  hr { border: 0; border-top: 0.5pt solid #94a3b8; margin: 14pt 0; }
  ol, ul { margin: 0 0 8pt 18pt; padding: 0; }
  li { margin-bottom: 4pt; }
  strong { font-weight: 600; }
  em { font-style: italic; }
</style>
</head>
<body>
${bodyHtml}
</body>
</html>`;
}
