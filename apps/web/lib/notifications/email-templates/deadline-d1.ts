/**
 * Email — 1 dzień przed terminem. Ton: konkretny, instruktażowy.
 */
import { appUrl, escapeHtml, requireVar, wrapHtml, wrapText } from "./_layout";
import type { RenderedEmail } from "../types";

export function renderDeadlineD1(
  variables: Record<string, string | number>,
): RenderedEmail {
  const deadline = requireVar(variables, "deadline_date");
  const title = requireVar(variables, "case_title");
  const caseId = requireVar(variables, "case_id");
  const kind = String(variables.kind_label ?? "termin");

  const ctaHref = appUrl(`/panel/sprawa/${caseId}`);
  const subject = `Termin jutro — ${title}`;
  const preheader = `Jutro ${deadline} upływa ${kind}. Co zrobić dziś.`;
  const hero = `Termin jutro — ${escapeHtml(deadline)}`;

  const bodyHtml = `
<p>Termin (<em>${kind}</em>) dla sprawy <strong>${escapeHtml(title)}</strong> upływa <strong>jutro</strong>.</p>
<p style="margin-top:16px;"><strong>Co zrobić dziś:</strong></p>
<ol style="margin:8px 0 0;padding-left:20px;color:#1F2937;">
  <li>Wejdź w panel — wygeneruj pismo, jeśli jeszcze nie jest gotowe.</li>
  <li>Wydrukuj wszystkie egzemplarze (sąd + dla siebie + dla strony przeciwnej).</li>
  <li>Podpisz każdy egzemplarz <em>oddzielnie</em>, niebieskim długopisem.</li>
  <li>Nadaj listem poleconym z potwierdzeniem odbioru — albo zanieś osobiście do biura podawczego.</li>
</ol>
<p style="margin-top:16px;color:#1F2937;">
  Decydująca jest data nadania (stempla pocztowego), nie data doręczenia. Jeśli wyślesz jutro przed 23:59 z poczty Polskiej — termin jest dochowany.
</p>`.trim();

  const bodyText = [
    `Termin (${kind}) dla sprawy "${title}" upływa jutro (${deadline}).`,
    "",
    "Co zrobić dziś:",
    "1. Wejdź w panel — wygeneruj pismo, jeśli jeszcze nie jest gotowe.",
    "2. Wydrukuj wszystkie egzemplarze (sąd + dla siebie + dla strony przeciwnej).",
    "3. Podpisz każdy egzemplarz oddzielnie, niebieskim długopisem.",
    "4. Nadaj listem poleconym z potwierdzeniem odbioru — albo zanieś do biura podawczego.",
    "",
    "Decydująca jest data nadania (stempla pocztowego), nie data doręczenia.",
    "Jeśli wyślesz jutro przed 23:59 z poczty Polskiej — termin jest dochowany.",
  ].join("\n");

  return {
    subject,
    bodyText: wrapText({
      preheader, hero, bodyText, bodyHtml,
      cta: { label: "Otwórz sprawę", href: ctaHref },
    }),
    bodyHtml: wrapHtml({
      preheader, hero, bodyText, bodyHtml,
      cta: { label: "Otwórz sprawę", href: ctaHref },
    }),
  };
}
