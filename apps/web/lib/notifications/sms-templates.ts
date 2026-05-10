/**
 * SMS templates — krótkie, max 160 znaków per segment.
 * Polskie znaki podnoszą koszt (UCS-2: 70 znaków/segment), więc piszemy bez polskich liter.
 *
 * Tone "Tarcza" — zero paniki, konkret + akcja.
 */
import type { SmsTemplateKey, RenderedSms } from "./types";

export type SmsRenderer = (
  variables: Record<string, string | number>,
) => RenderedSms;

function need(vars: Record<string, string | number>, key: string): string {
  const v = vars[key];
  if (v === undefined || v === null || v === "") {
    throw new Error(`Missing SMS variable: ${key}`);
  }
  return String(v);
}

const APP_DOMAIN =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/^https?:\/\//, "").replace(/\/+$/, "") ??
  "dlugomat.pl";

export const SMS_TEMPLATES: Record<SmsTemplateKey, SmsRenderer> = {
  // ~140 znaków
  deadline_d3_warning: (vars) => {
    const date = need(vars, "deadline_date");
    return {
      bodyText: `Dlugomat: termin za 3 dni (${date}). Pamietaj o wydruku, podpisie i nadaniu listem poleconym. Panel: https://${APP_DOMAIN}/panel`,
    };
  },
  // ~145 znaków
  deadline_d1_warning: (vars) => {
    const date = need(vars, "deadline_date");
    return {
      bodyText: `Dlugomat: termin JUTRO (${date}). Wydrukuj, podpisz, nadaj listem poleconym do 23:59. Decyduje data stempla. Panel: https://${APP_DOMAIN}/panel`,
    };
  },
  // ~155 znaków
  deadline_d0_morning: (vars) => {
    const date = need(vars, "deadline_date");
    return {
      bodyText: `Dlugomat: termin DZIS (${date}). Ostatni dzien na nadanie listu poleconego. Decyduje data stempla pocztowego (art. 165 par. 2 KPC). Panel: https://${APP_DOMAIN}/panel`,
    };
  },
};

export function renderSms(
  template: SmsTemplateKey,
  variables: Record<string, string | number>,
): RenderedSms {
  const renderer = SMS_TEMPLATES[template];
  if (!renderer) throw new Error(`Unknown SMS template: ${template}`);
  return renderer(variables);
}
