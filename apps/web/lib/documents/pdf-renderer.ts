/**
 * PDF rendering layer.
 *
 * Tier 2: zwracamy gotowy HTML opakowany w `print stylesheet`.
 * Pisma w MVP są generowane do PDF strumieniem przeglądarki użytkownika
 * (window.print()) lub serverless `pdf-lib` w Tier 4. Dla samego MVP
 * dostarczamy trasę `/panel/sprawa/[id]/pismo/[docId]/print`, która
 * wyświetla pismo w "print mode". Userzy mogą wtedy:
 *   - użyć Ctrl+P → zapisz jako PDF (zerokosztowo, działa offline),
 *   - poczekać na Tier 4 (@react-pdf/renderer + Supabase Storage upload).
 *
 * Funkcja `composePrintableHtml` jest single-source-of-truth — używa jej:
 *   - print route (Tier 2),
 *   - PDF generator (Tier 4) — pełny cycle przez Puppeteer / pdf-lib.
 */
import { markdownToHtml, wrapDocumentHtml } from "./markdown-to-html";

export interface ComposePrintableOptions {
  title?: string;
}

export function composePrintableHtml(
  markdown: string,
  options: ComposePrintableOptions = {},
): string {
  const body = markdownToHtml(markdown);
  return wrapDocumentHtml(body, options);
}
