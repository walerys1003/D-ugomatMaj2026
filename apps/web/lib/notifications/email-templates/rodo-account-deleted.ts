/**
 * Email — potwierdzenie usunięcia konta (RODO art. 17, zadanie 163).
 */
import { appUrl, wrapHtml, wrapText } from "./_layout";
import type { RenderedEmail } from "../types";

export function renderRodoAccountDeleted(
  variables: Record<string, string | number>,
): RenderedEmail {
  const deletedAt = String(variables.deleted_at ?? new Date().toISOString().slice(0, 10));

  const subject = `Twoje konto Długomat zostało usunięte`;
  const preheader = `Potwierdzenie usunięcia konta zgodnie z art. 17 RODO.`;
  const hero = `Konto usunięte`;

  const bodyHtml = `
<p>Potwierdzamy, że <strong>${deletedAt}</strong> Twoje konto Długomat zostało trwale usunięte zgodnie z art. 17 RODO (prawo do bycia zapomnianym).</p>

<p style="margin-top:16px;"><strong>Co zostało usunięte:</strong></p>
<ul style="margin:8px 0 0;padding-left:20px;color:#1F2937;">
  <li>Profil użytkownika (imię, e-mail, telefon).</li>
  <li>Wszystkie sprawy, pisma i wygenerowane PDF-y.</li>
  <li>Pliki w storage (skany, OCR-y).</li>
  <li>Sesje, tokeny, dane logowania.</li>
</ul>

<p style="margin-top:16px;"><strong>Co pozostaje (obowiązek prawny):</strong></p>
<ul style="margin:8px 0 0;padding-left:20px;color:#1F2937;">
  <li>Faktury — ustawa o rachunkowości wymaga przechowywania 5 lat (anonimizowane do NIP/numeru faktury).</li>
  <li>Logi audytowe płatności (Stripe / Fakturownia) — w wymiarze wymaganym przepisami.</li>
</ul>

<p style="margin-top:16px;font-size:14px;color:#6B7280;">
  Jeśli usunięcie nie było zamierzone — niestety nie da się go cofnąć. Możesz w każdej chwili założyć nowe konto na ${appUrl("/rejestracja")}.
</p>
<p style="margin-top:8px;font-size:14px;color:#6B7280;">
  W razie pytań skontaktuj się z naszym Inspektorem Ochrony Danych: <a href="mailto:iod@dlugomat.pl" style="color:#0F172A;">iod@dlugomat.pl</a>.
</p>`.trim();

  const bodyText = [
    `Potwierdzamy, że ${deletedAt} Twoje konto Długomat zostało trwale usunięte`,
    "zgodnie z art. 17 RODO (prawo do bycia zapomnianym).",
    "",
    "Co zostało usunięte:",
    "- Profil (imię, e-mail, telefon).",
    "- Wszystkie sprawy, pisma i wygenerowane PDF-y.",
    "- Pliki w storage (skany, OCR-y).",
    "- Sesje, tokeny, dane logowania.",
    "",
    "Co pozostaje (obowiązek prawny):",
    "- Faktury — ustawa o rachunkowości, 5 lat (anonimizowane).",
    "- Logi audytowe płatności (Stripe / Fakturownia).",
    "",
    "W razie pytań: iod@dlugomat.pl",
  ].join("\n");

  return {
    subject,
    bodyText: wrapText({ preheader, hero, bodyText, bodyHtml }),
    bodyHtml: wrapHtml({ preheader, hero, bodyText, bodyHtml }),
  };
}
