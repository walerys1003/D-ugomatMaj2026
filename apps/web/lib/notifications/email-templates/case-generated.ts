/**
 * Email — pismo wygenerowane (po skutecznej generacji + walidacji).
 */
import { appUrl, escapeHtml, requireVar, wrapHtml, wrapText } from "./_layout";
import type { RenderedEmail } from "../types";

export function renderCaseGenerated(
  variables: Record<string, string | number>,
): RenderedEmail {
  const title = requireVar(variables, "case_title");
  const caseId = requireVar(variables, "case_id");
  const score = String(variables.validation_score ?? "");

  const ctaHref = appUrl(`/panel/sprawa/${caseId}`);
  const subject = `Pismo gotowe — ${title}`;
  const preheader = `Twoje pismo zostało wygenerowane i przeszło walidację.`;
  const hero = `Pismo gotowe`;

  const bodyHtml = `
<p>Twoje pismo dla sprawy <strong>${escapeHtml(title)}</strong> zostało wygenerowane.</p>
${score ? `<p style="margin-top:8px;color:#1F2937;">Wynik walidacji: <strong>${escapeHtml(score)} / 100</strong> — pismo przeszło kontrolę kompletności i zgodności z przepisami.</p>` : ""}
<p style="margin-top:16px;"><strong>Co dalej:</strong></p>
<ol style="margin:8px 0 0;padding-left:20px;color:#1F2937;">
  <li>Otwórz sprawę w panelu i przejrzyj pismo (możesz edytować).</li>
  <li>Opłać dostęp — odblokujesz pobranie w formacie PDF.</li>
  <li>Wydrukuj, podpisz i nadaj zgodnie z instrukcją w panelu.</li>
</ol>`.trim();

  const bodyText = [
    `Twoje pismo dla sprawy "${title}" zostało wygenerowane.`,
    score ? `Wynik walidacji: ${score} / 100 — pismo przeszło kontrolę.` : "",
    "",
    "Co dalej:",
    "1. Otwórz sprawę w panelu i przejrzyj pismo (możesz edytować).",
    "2. Opłać dostęp — odblokujesz pobranie w PDF.",
    "3. Wydrukuj, podpisz i nadaj zgodnie z instrukcją w panelu.",
  ].filter(Boolean).join("\n");

  return {
    subject,
    bodyText: wrapText({
      preheader, hero, bodyText, bodyHtml,
      cta: { label: "Zobacz pismo", href: ctaHref },
    }),
    bodyHtml: wrapHtml({
      preheader, hero, bodyText, bodyHtml,
      cta: { label: "Zobacz pismo", href: ctaHref },
    }),
  };
}
