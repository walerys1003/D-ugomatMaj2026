/**
 * Email — 7 dni przed terminem.
 * Variables: deadline_date (YYYY-MM-DD), case_title, case_id, kind_label
 */
import { appUrl, escapeHtml, requireVar, wrapHtml, wrapText } from "./_layout";
import type { RenderedEmail } from "../types";

export function renderDeadlineD7(
  variables: Record<string, string | number>,
): RenderedEmail {
  const deadline = requireVar(variables, "deadline_date");
  const title = requireVar(variables, "case_title");
  const caseId = requireVar(variables, "case_id");
  const kind = String(variables.kind_label ?? "termin procesowy");

  const ctaHref = appUrl(`/panel/sprawa/${caseId}`);
  const subject = `Termin za 7 dni — ${title}`;
  const preheader = `${kind} upływa ${deadline}. Zostało 7 dni — masz czas.`;
  const hero = `Termin za 7 dni`;

  const bodyHtml = `
<p>${kind.charAt(0).toUpperCase() + kind.slice(1)} dla sprawy <strong>${escapeHtml(title)}</strong> upływa <strong>${escapeHtml(deadline)}</strong>.</p>
<p>To jeszcze tydzień — masz czas spokojnie przygotować pismo. Wejdź w panel, dokończ kreator i pobierz dokument w PDF.</p>
<p style="margin-top:16px;font-size:14px;color:#6B7280;">
  Co możesz zrobić teraz:
</p>
<ul style="margin:8px 0 0;padding-left:20px;color:#1F2937;">
  <li>Sprawdzić, czy data doręczenia w sprawie jest poprawna.</li>
  <li>Dokończyć kreator (zapis automatyczny — możesz wracać kiedy chcesz).</li>
  <li>Wygenerować pismo i pobrać je w formacie zgodnym z sądem.</li>
</ul>`.trim();

  const bodyText = [
    `${kind} dla sprawy "${title}" upływa ${deadline}.`,
    "",
    "To jeszcze tydzień — masz czas spokojnie przygotować pismo.",
    "Wejdź w panel, dokończ kreator i pobierz dokument w PDF.",
    "",
    "Co możesz zrobić:",
    "- Sprawdź datę doręczenia w sprawie.",
    "- Dokończ kreator (zapis automatyczny).",
    "- Wygeneruj pismo i pobierz je w PDF.",
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
