/**
 * Email — powitanie po rejestracji.
 */
import { appUrl, wrapHtml, wrapText } from "./_layout";
import type { RenderedEmail } from "../types";

export function renderWelcome(
  variables: Record<string, string | number>,
): RenderedEmail {
  const name = String(variables.full_name ?? "").trim();
  const greeting = name ? `Witaj, ${name},` : "Witaj,";

  const ctaHref = appUrl("/panel");
  const subject = `Witamy w Długomacie`;
  const preheader = `Twoja tarcza prawna jest gotowa. 8 modułów do dyspozycji.`;
  const hero = `Witamy w Długomacie`;

  const bodyHtml = `
<p>${greeting}</p>
<p>cieszymy się, że jesteś. Długomat to <strong>tarcza prawna</strong> — pomagamy dłużnikom przygotowywać pisma procesowe gotowe do złożenia w sądzie, bez paniki i bez wynajmowania kancelarii za każdym razem.</p>
<p style="margin-top:16px;"><strong>Co możesz teraz zrobić:</strong></p>
<ul style="margin:8px 0 0;padding-left:20px;color:#1F2937;">
  <li><strong>Skaner Nakazu (D1)</strong> — wgraj zdjęcie pisma z sądu, dostaniesz darmową analizę: czy roszczenie jest przedawnione, jakie masz zarzuty, ile masz dni na sprzeciw.</li>
  <li><strong>Sprzeciw EPU (D2)</strong> — pełny generator sprzeciwu od nakazu zapłaty.</li>
  <li><strong>KomornikShield (D3)</strong> — pakiet pism do komornika (zwolnienie konta, skarga, raty).</li>
  <li>Pozostałe moduły D4–D8 — potrącenia, BIK, cesja, ugoda, upadłość konsumencka.</li>
</ul>
<p style="margin-top:16px;color:#1F2937;">
  Wszystkie pisma generujemy z użyciem AI (Claude Sonnet 4.5) i przepuszczamy przez walidator (Haiku 4.5). Twoje dane są zaszyfrowane i nigdy nie opuszczają UE.
</p>`.trim();

  const bodyText = [
    greeting,
    "",
    "cieszymy się, że jesteś. Długomat to tarcza prawna — pomagamy",
    "dłużnikom przygotowywać pisma procesowe gotowe do złożenia w sądzie.",
    "",
    "Co możesz teraz zrobić:",
    "- Skaner Nakazu (D1) — darmowa analiza pisma z sądu.",
    "- Sprzeciw EPU (D2) — generator sprzeciwu od nakazu zapłaty.",
    "- KomornikShield (D3) — pakiet pism do komornika.",
    "- D4–D8: potrącenia, BIK, cesja, ugoda, upadłość konsumencka.",
    "",
    "Pisma generujemy AI (Claude Sonnet 4.5) + walidator (Haiku 4.5).",
    "Dane zaszyfrowane, nie opuszczają UE.",
  ].join("\n");

  return {
    subject,
    bodyText: wrapText({
      preheader, hero, bodyText, bodyHtml,
      cta: { label: "Otwórz panel", href: ctaHref },
    }),
    bodyHtml: wrapHtml({
      preheader, hero, bodyText, bodyHtml,
      cta: { label: "Otwórz panel", href: ctaHref },
    }),
  };
}
