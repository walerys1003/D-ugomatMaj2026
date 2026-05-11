/**
 * Tier 33-2 — Win-back campaign email D+14 for cancelled / inactive users.
 *
 * Wysyłany 14 dni po anulowaniu subskrypcji lub 14 dni bez logowania
 * (cokolwiek pierwsze). Cel: odzyskać usera ofertą 50% off na 3 miesiące.
 *
 * Segment: `cancelled_or_inactive_14d`
 */
import { appUrl, wrapHtml, wrapText } from "./_layout";
import type { RenderedEmail } from "../types";

export function renderDripDay14Winback(
  variables: Record<string, string | number>,
): RenderedEmail {
  const name = String(variables.full_name ?? "").trim();
  const greeting = name ? `Witaj, ${name},` : "Witaj,";
  const couponCode = String(variables.coupon_code ?? "POWROT50");
  const expiresAt = String(variables.expires_at ?? "za 7 dni");

  const ctaHref = appUrl(`/cennik?promo=${encodeURIComponent(couponCode)}`);
  const subject = `Tęsknimy. Wróć na -50% przez 3 miesiące (kod: ${couponCode})`;
  const preheader = `Jednorazowa oferta. Twoje sprawy i pisma czekają w panelu — niczego nie usunęliśmy.`;
  const hero = `Wróć na -50% przez 3 miesiące`;

  const bodyHtml = `
<p>${greeting}</p>
<p>zauważyliśmy, że dawno Cię nie było. Twoje dotychczasowe sprawy, pisma i pliki <strong>wciąż są bezpieczne</strong> w panelu — niczego nie usunęliśmy.</p>

<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:16px 0;background:#0F172A;border-radius:8px;padding:20px;text-align:center;">
  <tr><td style="font-family:Helvetica,Arial,sans-serif;color:#F9FAFB;">
    <div style="font-size:14px;letter-spacing:1px;text-transform:uppercase;color:#C19A4A;margin-bottom:8px;">Oferta powitalna</div>
    <div style="font-size:28px;font-weight:bold;color:#FFFFFF;margin-bottom:8px;">-50% przez 3 miesiące</div>
    <div style="font-size:14px;color:#9CA3AF;">Kod: <strong style="color:#C19A4A;font-family:Menlo,monospace;font-size:18px;">${couponCode}</strong></div>
    <div style="font-size:12px;color:#9CA3AF;margin-top:6px;">Ważny ${expiresAt}. Limit: 1× per konto.</div>
  </td></tr>
</table>

<p style="margin-top:16px;"><strong>Co się zmieniło od ostatniego logowania:</strong></p>
<ul style="margin:8px 0 0;padding-left:20px;color:#1F2937;">
  <li><strong>D1 Skaner Nakazu</strong> — OCR wzbogacony o AWS Textract, rozpoznaje ~99% pism z e-Sądu.</li>
  <li><strong>D2 Sprzeciw EPU</strong> — nowe zarzuty z bazy 47 wzorców (przedawnienie, brak legitymacji, cesja).</li>
  <li><strong>D3 KomornikShield</strong> — kreator skargi na czynności komornika + automatyczny wniosek o zwolnienie konta.</li>
  <li><strong>D5 Potrącenia</strong> — nowy moduł, art. 498 KC, oświadczenie + pozew wzajemny.</li>
  <li><strong>D8 Upadłość konsumencka</strong> — pełny kreator wniosku do sądu z planem spłaty.</li>
</ul>

<p style="margin-top:16px;">Jednym klikiem odzyskujesz wszystko, co miałeś — plus 50% rabatu na pierwsze 3 miesiące.</p>

<p style="margin-top:24px;color:#6B7280;font-size:13px;">
  Jeśli wolisz nie korzystać z konta dalej, możesz w każdej chwili <a href="${appUrl("/panel/ustawienia/profil#usun")}" style="color:#0F172A;text-decoration:underline;">trwale usunąć dane</a> zgodnie z RODO. Bez konsekwencji, bez pytań.
</p>`.trim();

  const bodyText = `
${greeting}

Dawno Cię nie było. Twoje sprawy, pisma i pliki wciąż są bezpieczne w panelu — niczego nie usunęliśmy.

OFERTA POWITALNA: -50% przez 3 miesiące
Kod: ${couponCode}
Ważny: ${expiresAt}. Limit: 1× per konto.

Co się zmieniło:
- D1 Skaner Nakazu — OCR AWS Textract, ~99% trafień
- D2 Sprzeciw EPU — 47 wzorców zarzutów
- D3 KomornikShield — skarga + zwolnienie konta
- D5 Potrącenia — nowy moduł
- D8 Upadłość konsumencka — pełny kreator

Wróć: ${ctaHref}

Możesz też trwale usunąć dane (RODO): ${appUrl("/panel/ustawienia/profil#usun")}
`.trim();

  return {
    subject,
    preheader,
    html: wrapHtml({
      preheader,
      hero,
      bodyHtml,
      bodyText,
      cta: { label: `Odbierz kod ${couponCode}`, href: ctaHref },
      legalNote:
        "Promocja jednorazowa, nie łączy się z innymi rabatami. Po 3 miesiącach standardowa cena wg cennika.",
    }),
    text: wrapText({
      preheader,
      hero,
      bodyHtml: "",
      bodyText,
      cta: { label: `Odbierz kod ${couponCode}`, href: ctaHref },
      legalNote:
        "Promocja jednorazowa, nie łączy się z innymi rabatami. Po 3 miesiącach standardowa cena.",
    }),
  };
}
