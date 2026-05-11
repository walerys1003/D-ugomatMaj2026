/**
 * Tier 33-1 — Customer success drip email D+3 (tips & best practices).
 *
 * Wysyłany 3 dni po pierwszej rejestracji, jeśli user NIE uruchomił jeszcze
 * żadnego modułu (D1–D8). Cel: edukacja + nudge do D1 (skaner nakazu).
 *
 * Segment: `new_user_no_activity`
 * Wysyłka: cron `email-drips` daily 09:00 UTC.
 */
import { appUrl, wrapHtml, wrapText } from "./_layout";
import type { RenderedEmail } from "../types";

export function renderDripDay3Tips(
  variables: Record<string, string | number>,
): RenderedEmail {
  const name = String(variables.full_name ?? "").trim();
  const greeting = name ? `Witaj, ${name},` : "Witaj,";

  const ctaHref = appUrl("/panel/sprawy/nowa?moduł=d1");
  const subject = `3 wskazówki, które oszczędzą Ci 2000 zł kary sądowej`;
  const preheader = `Najczęstsze błędy dłużników w sprzeciwie od nakazu — i jak ich uniknąć.`;
  const hero = `Trzy szybkie wskazówki`;

  const bodyHtml = `
<p>${greeting}</p>
<p>zauważyliśmy, że założyłeś konto, ale nie uruchomiłeś jeszcze żadnego modułu. Zanim zaczniesz, kilka praktycznych wskazówek z naszej praktyki:</p>

<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:16px 0;background:#F9FAFB;border-radius:8px;padding:16px;">
  <tr><td style="font-family:Helvetica,Arial,sans-serif;font-size:14px;color:#1F2937;line-height:1.6;">
    <strong>1. Sprawdź daty na pierwszej stronie nakazu.</strong><br/>
    Masz <strong>14 dni</strong> od doręczenia na sprzeciw (EPU) lub <strong>2 tygodnie</strong> od doręczenia odpisu pozwu (KPC). Nie liczy się data wystawienia ani data odbioru przez sąsiada — liczy się data doręczenia <em>Tobie</em>.
  </td></tr>
</table>

<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:16px 0;background:#F9FAFB;border-radius:8px;padding:16px;">
  <tr><td style="font-family:Helvetica,Arial,sans-serif;font-size:14px;color:#1F2937;line-height:1.6;">
    <strong>2. Sprawdź przedawnienie.</strong><br/>
    Roszczenia z umów konsumenckich przedawniają się po <strong>3 latach</strong>. Roszczenia z tytułu prowadzenia działalności gospodarczej również. Komornicy i firmy windykacyjne często kupują długi po przedawnieniu — wtedy wystarczy zarzut przedawnienia (art. 117 § 2¹ KC).
  </td></tr>
</table>

<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:16px 0;background:#F9FAFB;border-radius:8px;padding:16px;">
  <tr><td style="font-family:Helvetica,Arial,sans-serif;font-size:14px;color:#1F2937;line-height:1.6;">
    <strong>3. Nie ignoruj listów z sądu.</strong><br/>
    Najgorsze, co możesz zrobić, to <em>"udać, że nie widziałem"</em>. Po 14 dniach nakaz staje się prawomocny, a komornik puka do drzwi. Jeśli nie zdążysz ze sprzeciwem — wniosek o przywrócenie terminu kosztuje tylko 30 zł, ale trzeba go złożyć w 7 dni od ustania przeszkody.
  </td></tr>
</table>

<p style="margin-top:24px;"><strong>Najszybszy start:</strong> wgraj zdjęcie pisma do <strong>Skanera Nakazu D1</strong>. Darmowa analiza w 30 sekund — przedawnienie, zarzuty, terminy.</p>`.trim();

  const bodyText = `
${greeting}

Zauważyliśmy, że założyłeś konto, ale nie uruchomiłeś jeszcze żadnego modułu. Kilka wskazówek z naszej praktyki:

1. Sprawdź daty na pierwszej stronie nakazu.
   Masz 14 dni od doręczenia na sprzeciw. Liczy się data doręczenia Tobie.

2. Sprawdź przedawnienie.
   Roszczenia konsumenckie przedawniają się po 3 latach (art. 117 § 2¹ KC).

3. Nie ignoruj listów z sądu.
   Po 14 dniach nakaz staje się prawomocny.

Najszybszy start: wgraj zdjęcie pisma do Skanera Nakazu D1.
${ctaHref}
`.trim();

  const legalNote =
    "Materiał ma charakter informacyjny i nie zastępuje porady prawnej. Każda sprawa jest indywidualna.";

  return {
    subject,
    preheader,
    html: wrapHtml({
      preheader,
      hero,
      bodyHtml,
      bodyText,
      cta: { label: "Otwórz Skaner Nakazu", href: ctaHref },
      legalNote,
    }),
    text: wrapText({
      preheader,
      hero,
      bodyHtml: "",
      bodyText,
      cta: { label: "Otwórz Skaner Nakazu", href: ctaHref },
      legalNote,
    }),
  };
}
