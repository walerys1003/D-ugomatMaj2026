/**
 * Email — dzień terminu, rano. Maksymalnie konkretny.
 */
import { appUrl, escapeHtml, requireVar, wrapHtml, wrapText } from "./_layout";
import type { RenderedEmail } from "../types";

export function renderDeadlineD0Morning(
  variables: Record<string, string | number>,
): RenderedEmail {
  const deadline = requireVar(variables, "deadline_date");
  const title = requireVar(variables, "case_title");
  const caseId = requireVar(variables, "case_id");
  const kind = String(variables.kind_label ?? "termin");

  const ctaHref = appUrl(`/panel/sprawa/${caseId}`);
  const subject = `Dziś ostatni dzień — ${title}`;
  const preheader = `Termin (${kind}) upływa dziś, ${deadline}. Co zrobić teraz.`;
  const hero = `Dziś ostatni dzień`;

  const bodyHtml = `
<p>Termin (<em>${kind}</em>) dla sprawy <strong>${escapeHtml(title)}</strong> upływa <strong>dziś (${escapeHtml(deadline)})</strong>.</p>
<p style="margin-top:16px;"><strong>Co możesz zrobić jeszcze dziś:</strong></p>
<ol style="margin:8px 0 0;padding-left:20px;color:#1F2937;">
  <li>Jeśli pismo jest gotowe — wydrukuj, podpisz, nadaj listem poleconym <strong>do 23:59</strong> (decyduje data stempla pocztowego, nie odbioru przez sąd).</li>
  <li>Jeśli pismo nie jest jeszcze wygenerowane — kreator zajmie ~10 min. Generacja AI ~20 s. Wydruk + nadanie zdążysz dziś.</li>
  <li>Najbliższa placówka Poczty Polskiej działa do 21:00 (śródmieście) lub 19:00 (mniejsze).</li>
  <li>Jeśli to skarga z 7-dniowym terminem (komornik, art. 767 k.p.c.) — termin liczy się rygorystycznie. Złożenie po terminie = automatyczne odrzucenie.</li>
</ol>
<p style="margin-top:16px;font-size:14px;color:#6B7280;">
  Pamiętaj: nawet jeśli sąd dostanie pismo dopiero za kilka dni, termin uznaje się za dotrzymany, jeśli pismo zostało nadane w polskiej placówce pocztowej operatora wyznaczonego (Poczta Polska) najpóźniej w ostatnim dniu terminu — art. 165 § 2 k.p.c.
</p>`.trim();

  const bodyText = [
    `Termin (${kind}) dla sprawy "${title}" upływa DZIŚ (${deadline}).`,
    "",
    "Co możesz zrobić jeszcze dziś:",
    "1. Jeśli pismo gotowe — wydrukuj, podpisz, nadaj listem poleconym DO 23:59.",
    "   (decyduje data stempla pocztowego, nie odbioru przez sąd)",
    "2. Jeśli pismo nie wygenerowane — kreator ~10 min, AI ~20 s.",
    "3. Najbliższa Poczta Polska działa do 21:00 (śródmieście) lub 19:00.",
    "4. Skarga z 7 dni? Termin rygorystyczny — po terminie automatyczne odrzucenie.",
    "",
    "Art. 165 § 2 k.p.c.: termin uznaje się za dotrzymany, jeśli pismo zostało nadane w polskiej placówce pocztowej operatora wyznaczonego (Poczta Polska) najpóźniej w ostatnim dniu terminu.",
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
