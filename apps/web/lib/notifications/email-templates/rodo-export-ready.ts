/**
 * Email — RODO art. 20 export gotowy do pobrania (zadanie 162).
 */
import { appUrl, requireVar, wrapHtml, wrapText } from "./_layout";
import type { RenderedEmail } from "../types";

export function renderRodoExportReady(
  variables: Record<string, string | number>,
): RenderedEmail {
  const downloadUrl = requireVar(variables, "download_url");
  const expiresAt = String(variables.expires_at ?? "");

  const ctaHref = downloadUrl;
  const subject = `Twoje dane RODO są gotowe do pobrania`;
  const preheader = `Eksport zgodnie z art. 20 RODO. Link wygasa ${expiresAt || "po 24h"}.`;
  const hero = `Eksport danych RODO`;

  const bodyHtml = `
<p>Zgodnie z Twoim wnioskiem (art. 20 RODO — prawo do przenoszenia danych) przygotowaliśmy archiwum wszystkich Twoich danych w formacie ZIP.</p>
<p>Archiwum zawiera:</p>
<ul style="margin:8px 0 0;padding-left:20px;color:#1F2937;">
  <li>Profil (imię, e-mail, telefon, ustawienia).</li>
  <li>Wszystkie sprawy i pisma (markdown + metadane).</li>
  <li>Historię płatności i terminy.</li>
  <li>Logi audytu (case_events).</li>
</ul>
<p style="margin-top:16px;color:#1F2937;">
  Plik dostępny pod linkiem poniżej. <strong>Link wygasa ${expiresAt ? expiresAt : "po 24 godzinach"}</strong> — po tym czasie wygeneruj nowy z panelu RODO.
</p>`.trim();

  const bodyText = [
    "Zgodnie z Twoim wnioskiem (art. 20 RODO — prawo do przenoszenia danych)",
    "przygotowaliśmy archiwum Twoich danych w formacie ZIP.",
    "",
    "Archiwum zawiera:",
    "- Profil (imię, e-mail, telefon, ustawienia).",
    "- Wszystkie sprawy i pisma (markdown + metadane).",
    "- Historię płatności i terminy.",
    "- Logi audytu (case_events).",
    "",
    `Link wygasa ${expiresAt || "po 24 godzinach"}.`,
    "Po tym czasie wygeneruj nowy z panelu RODO.",
  ].join("\n");

  return {
    subject,
    bodyText: wrapText({
      preheader, hero, bodyText, bodyHtml,
      cta: { label: "Pobierz archiwum ZIP", href: ctaHref },
    }),
    bodyHtml: wrapHtml({
      preheader, hero, bodyText, bodyHtml,
      cta: { label: "Pobierz archiwum ZIP", href: ctaHref },
    }),
  };
}
