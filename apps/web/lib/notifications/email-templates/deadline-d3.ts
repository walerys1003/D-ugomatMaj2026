/**
 * Email — 3 dni przed terminem (eskalacja tonu, dalej spokojny).
 */
import { appUrl, escapeHtml, requireVar, wrapHtml, wrapText } from "./_layout";
import type { RenderedEmail } from "../types";

export function renderDeadlineD3(
  variables: Record<string, string | number>,
): RenderedEmail {
  const deadline = requireVar(variables, "deadline_date");
  const title = requireVar(variables, "case_title");
  const caseId = requireVar(variables, "case_id");
  const kind = String(variables.kind_label ?? "termin procesowy");

  const ctaHref = appUrl(`/panel/sprawa/${caseId}`);
  const subject = `Termin za 3 dni — ${title}`;
  const preheader = `${kind} upływa ${deadline}. Zostały 3 dni.`;
  const hero = `Termin za 3 dni`;

  const bodyHtml = `
<p>Przypominamy: ${kind} dla sprawy <strong>${escapeHtml(title)}</strong> upływa <strong>${escapeHtml(deadline)}</strong>.</p>
<p>To dobry moment, żeby dokończyć kreator i wygenerować pismo. Większość pism w Długomacie powstaje w 10–15 minut.</p>
<p>Jeśli pismo jest już gotowe, pamiętaj o:</p>
<ul style="margin:8px 0 0;padding-left:20px;color:#1F2937;">
  <li>Wydrukowaniu i podpisaniu (każdy egzemplarz osobno).</li>
  <li>Wysłaniu listem poleconym lub złożeniu osobiście w biurze podawczym.</li>
  <li>Zachowaniu potwierdzenia nadania — to dowód dotrzymania terminu.</li>
</ul>`.trim();

  const bodyText = [
    `Przypominamy: ${kind} dla sprawy "${title}" upływa ${deadline}.`,
    "",
    "To dobry moment, żeby dokończyć kreator i wygenerować pismo.",
    "Większość pism w Długomacie powstaje w 10–15 minut.",
    "",
    "Jeśli pismo jest już gotowe, pamiętaj o:",
    "- Wydrukowaniu i podpisaniu (każdy egzemplarz osobno).",
    "- Wysłaniu listem poleconym lub złożeniu w biurze podawczym.",
    "- Zachowaniu potwierdzenia nadania — to dowód dotrzymania terminu.",
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
