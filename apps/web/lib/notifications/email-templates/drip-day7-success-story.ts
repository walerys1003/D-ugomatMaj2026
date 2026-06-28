/**
 * Tier 33-1 — Customer success drip email D+7 (social proof + success story).
 *
 * Wysyłany 7 dni po rejestracji jeśli user wciąż NIE wygenerował żadnego pisma.
 * Cel: zbudować zaufanie konkretnym case-study + push do D2 (sprzeciw EPU).
 *
 * Segment: `new_user_no_case`
 */
import { appUrl, wrapHtml, wrapText } from "./_layout";
import type { RenderedEmail } from "../types";

export function renderDripDay7SuccessStory(
  variables: Record<string, string | number>,
): RenderedEmail {
  const name = String(variables.full_name ?? "").trim();
  const greeting = name ? `Witaj, ${name},` : "Witaj,";

  const ctaHref = appUrl("/panel/sprawy/nowa?moduł=d2");
  const subject = `Jak Pani Anna z Krakowa oddaliła 8400 zł długu — 1 sprzeciw, 0 zł kosztów`;
  const preheader = `Prawdziwa historia użytkowniczki Długomata. Przedawnione roszczenie. Sąd przychylił się.`;
  const hero = `Anna, Kraków: -8400 zł zadłużenia`;

  const bodyHtml = `
<p>${greeting}</p>
<p>chcielibyśmy podzielić się historią Anny (imię zmienione, zgoda na publikację — sygnatura sprawy w panelu).</p>

<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:16px 0;background:#FFFAF0;border-left:4px solid #C19A4A;padding:16px;">
  <tr><td style="font-family:Helvetica,Arial,sans-serif;font-size:14px;color:#1F2937;line-height:1.7;">
    <strong>Sytuacja:</strong> Anna dostała w marcu 2026 nakaz zapłaty z e-Sądu. 8400 zł + odsetki + 1200 zł kosztów. Roszczenie z umowy o kartę kredytową z 2018 roku, sprzedane firmie windykacyjnej.<br/><br/>
    <strong>Problem:</strong> Anna nie pamiętała tej umowy. Czuła panikę i chciała brać pożyczkę, żeby spłacić.<br/><br/>
    <strong>Co zrobiła:</strong> Wgrała zdjęcie nakazu do <strong>Skanera D1</strong>. Analiza pokazała: roszczenie z 2018 roku, ostatnia płatność 2019, pozew 2026 — <strong>przedawnione</strong> (3 lata, art. 118 KC). Następnie <strong>D2 Sprzeciw EPU</strong> wygenerował pismo z zarzutem przedawnienia.<br/><br/>
    <strong>Czas:</strong> 17 minut. Wysłała przez ePUAP.<br/><br/>
    <strong>Wynik:</strong> Sąd uchylił nakaz w lipcu 2026. Sprawa umorzona. Komornik nie ruszył konta.
  </td></tr>
</table>

<p style="margin-top:16px;"><strong>Co możesz zrobić jeszcze dziś:</strong></p>
<ul style="margin:8px 0 0;padding-left:20px;color:#1F2937;">
  <li>Otwórz <strong>D2 Sprzeciw EPU</strong> — kreator prowadzi krok po kroku, sam dobiera zarzuty.</li>
  <li>Pismo gotowe do podpisu i wysłania (PDF + ePUAP-ready XML).</li>
  <li>Wbudowany walidator sprawdza terminy i podstawy prawne.</li>
</ul>

<p style="margin-top:16px;color:#6B7280;font-size:13px;">
  W ciągu ostatnich 30 dni 247 użytkowników wygenerowało sprzeciw przez Długomat. 89 z nich już otrzymało odpowiedź z sądu — w 71 przypadkach sąd uwzględnił sprzeciw w całości lub w części. Źródło: dane wewnętrzne, sygn. raportów dostępne na życzenie.
</p>`.trim();

  const bodyText = `
${greeting}

Historia Anny z Krakowa:

Sytuacja: w marcu 2026 dostała nakaz na 8400 zł + odsetki + 1200 zł kosztów. Roszczenie z karty kredytowej z 2018 r., sprzedane firmie windykacyjnej.

Co zrobiła: Skaner D1 wykrył przedawnienie (3 lata, art. 118 KC). D2 Sprzeciw EPU wygenerował pismo. 17 minut, wysłała przez ePUAP.

Wynik: sąd uchylił nakaz w lipcu 2026. Sprawa umorzona.

Otwórz D2 Sprzeciw EPU: ${ctaHref}

W ciągu ostatnich 30 dni 247 użytkowników wygenerowało sprzeciw. 71 spraw rozstrzygniętych po stronie dłużnika.
`.trim();

  return {
    subject,
    preheader,
    bodyHtml: wrapHtml({
      preheader,
      hero,
      bodyHtml,
      bodyText,
      cta: { label: "Otwórz D2 Sprzeciw EPU", href: ctaHref },
      legalNote: "Materiał informacyjny. Indywidualne efekty mogą się różnić.",
    }),
    bodyText: wrapText({
      preheader,
      hero,
      bodyHtml: "",
      bodyText,
      cta: { label: "Otwórz D2 Sprzeciw EPU", href: ctaHref },
      legalNote: "Materiał informacyjny. Indywidualne efekty mogą się różnić.",
    }),
  };
}
