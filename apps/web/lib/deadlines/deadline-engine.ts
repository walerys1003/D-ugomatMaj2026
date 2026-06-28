/**
 * Tier 18 — Deadline tracker engine.
 *
 * Centralny silnik kalkulacji terminów procesowych:
 *  - dni kalendarzowe vs dni robocze (KPC art. 165 § 1)
 *  - liczenie z dni wolnych ustawowo (PL: ustawa o dniach wolnych)
 *  - przesunięcie soboty/niedzieli na najbliższy dzień roboczy
 *  - integracja z `notifications/deadline-windows.ts` (D0/D1/D3/D7)
 *  - reguły domenowe per case_type (sprzeciw EPU = 14 dni, zażalenie = 7 dni, etc.)
 */

export type DeadlineKind =
  | "sprzeciw_epu"           // 14 dni od doręczenia nakazu
  | "zarzuty_nakaz"          // 14 dni od doręczenia
  | "zazalenie"              // 7 dni od doręczenia
  | "apelacja"               // 14 dni od ogłoszenia (lub 21 od doręczenia z uzasadnieniem)
  | "skarga_kasacyjna"       // 60 dni od uzasadnienia
  | "skarga_komornicza"      // 7 dni od czynności
  | "odpowiedz_pozew"        // termin sądu (typowo 14 dni)
  | "wniosek_o_uzasadnienie" // 7 dni od ogłoszenia
  | "rps_termin"             // RPS — restrukturyzacja
  | "custom";

export interface DeadlineRule {
  kind: DeadlineKind;
  label: string;
  defaultDays: number;
  countingMode: "calendar" | "business";
  fromEvent: "doreczenie" | "ogloszenie" | "uzasadnienie" | "czynnosc" | "custom";
  legalBasis: string; // np. "KPC art. 502² § 1"
}

export const DEADLINE_RULES: Record<DeadlineKind, DeadlineRule> = {
  sprzeciw_epu: {
    kind: "sprzeciw_epu",
    label: "Sprzeciw od nakazu zapłaty (EPU)",
    defaultDays: 14,
    countingMode: "calendar",
    fromEvent: "doreczenie",
    legalBasis: "KPC art. 502² § 1",
  },
  zarzuty_nakaz: {
    kind: "zarzuty_nakaz",
    label: "Zarzuty od nakazu zapłaty",
    defaultDays: 14,
    countingMode: "calendar",
    fromEvent: "doreczenie",
    legalBasis: "KPC art. 491 § 1",
  },
  zazalenie: {
    kind: "zazalenie",
    label: "Zażalenie",
    defaultDays: 7,
    countingMode: "calendar",
    fromEvent: "doreczenie",
    legalBasis: "KPC art. 394 § 2",
  },
  apelacja: {
    kind: "apelacja",
    label: "Apelacja",
    defaultDays: 14,
    countingMode: "calendar",
    fromEvent: "ogloszenie",
    legalBasis: "KPC art. 369 § 1",
  },
  skarga_kasacyjna: {
    kind: "skarga_kasacyjna",
    label: "Skarga kasacyjna",
    defaultDays: 60,
    countingMode: "calendar",
    fromEvent: "uzasadnienie",
    legalBasis: "KPC art. 398⁵ § 1",
  },
  skarga_komornicza: {
    kind: "skarga_komornicza",
    label: "Skarga na czynności komornika",
    defaultDays: 7,
    countingMode: "calendar",
    fromEvent: "czynnosc",
    legalBasis: "KPC art. 767 § 4",
  },
  odpowiedz_pozew: {
    kind: "odpowiedz_pozew",
    label: "Odpowiedź na pozew",
    defaultDays: 14,
    countingMode: "calendar",
    fromEvent: "doreczenie",
    legalBasis: "KPC art. 205¹",
  },
  wniosek_o_uzasadnienie: {
    kind: "wniosek_o_uzasadnienie",
    label: "Wniosek o uzasadnienie",
    defaultDays: 7,
    countingMode: "calendar",
    fromEvent: "ogloszenie",
    legalBasis: "KPC art. 328 § 1",
  },
  rps_termin: {
    kind: "rps_termin",
    label: "Termin w postępowaniu restrukturyzacyjnym",
    defaultDays: 14,
    countingMode: "calendar",
    fromEvent: "doreczenie",
    legalBasis: "Prawo restrukturyzacyjne",
  },
  custom: {
    kind: "custom",
    label: "Termin niestandardowy",
    defaultDays: 14,
    countingMode: "calendar",
    fromEvent: "custom",
    legalBasis: "n/d",
  },
};

/**
 * Stałe dni wolne w Polsce (bez Wielkanocy — liczona dynamicznie).
 */
const FIXED_HOLIDAYS_PL: Array<[number, number]> = [
  [1, 1],    // Nowy Rok
  [1, 6],    // Trzech Króli
  [5, 1],    // Święto Pracy
  [5, 3],    // Konstytucji 3 Maja
  [8, 15],   // Wniebowzięcie NMP
  [11, 1],   // Wszystkich Świętych
  [11, 11],  // Niepodległości
  [12, 25],  // Boże Narodzenie
  [12, 26],
];

/** Obliczenie daty Wielkanocy (algorytm Gaussa) zwracane jako UTC midnight. */
function easterSunday(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(Date.UTC(year, month - 1, day));
}

function isHoliday(date: Date): boolean {
  const m = date.getUTCMonth() + 1;
  const d = date.getUTCDate();
  for (const [hm, hd] of FIXED_HOLIDAYS_PL) {
    if (hm === m && hd === d) return true;
  }
  const easter = easterSunday(date.getUTCFullYear());
  const easterMonday = new Date(easter);
  easterMonday.setUTCDate(easter.getUTCDate() + 1);
  const pentecost = new Date(easter);
  pentecost.setUTCDate(easter.getUTCDate() + 49);
  const corpus = new Date(easter);
  corpus.setUTCDate(easter.getUTCDate() + 60);

  return (
    sameDay(date, easter) ||
    sameDay(date, easterMonday) ||
    sameDay(date, pentecost) ||
    sameDay(date, corpus)
  );
}

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate()
  );
}

function isWeekend(d: Date): boolean {
  const dow = d.getUTCDay();
  return dow === 0 || dow === 6;
}

function isBusinessDay(d: Date): boolean {
  return !isWeekend(d) && !isHoliday(d);
}

/** Przesuwa termin na najbliższy dzień roboczy, jeśli wypada w weekend/święto. */
function shiftIfNonBusiness(d: Date): Date {
  const out = new Date(d);
  while (!isBusinessDay(out)) {
    out.setUTCDate(out.getUTCDate() + 1);
  }
  return out;
}

export interface DeadlineComputation {
  rule: DeadlineRule;
  startDate: Date;
  rawEndDate: Date;
  effectiveEndDate: Date;
  shifted: boolean;
  windows: { d0: Date; d1: Date; d3: Date; d7: Date };
}

/**
 * Wylicza efektywny koniec terminu z uwzględnieniem trybu (calendar/business).
 */
export function computeDeadline(args: {
  kind: DeadlineKind;
  startDate: Date | string;
  daysOverride?: number;
  modeOverride?: "calendar" | "business";
}): DeadlineComputation {
  const rule = DEADLINE_RULES[args.kind];
  const days = args.daysOverride ?? rule.defaultDays;
  const mode = args.modeOverride ?? rule.countingMode;
  const start =
    typeof args.startDate === "string"
      ? new Date(args.startDate)
      : new Date(args.startDate.getTime());
  // Normalizujemy do UTC midnight, by uniknąć DST.
  const startUtc = new Date(
    Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate()),
  );

  const rawEnd = new Date(startUtc);
  if (mode === "calendar") {
    rawEnd.setUTCDate(rawEnd.getUTCDate() + days);
  } else {
    let remaining = days;
    while (remaining > 0) {
      rawEnd.setUTCDate(rawEnd.getUTCDate() + 1);
      if (isBusinessDay(rawEnd)) remaining--;
    }
  }

  const effectiveEnd = shiftIfNonBusiness(rawEnd);
  const shifted = !sameDay(rawEnd, effectiveEnd);

  // Okna powiadomień — D0 (sam termin), D1 (1 dzień przed), D3, D7.
  const offsetDate = (d: Date, delta: number) => {
    const x = new Date(d);
    x.setUTCDate(x.getUTCDate() + delta);
    return x;
  };

  return {
    rule,
    startDate: startUtc,
    rawEndDate: rawEnd,
    effectiveEndDate: effectiveEnd,
    shifted,
    windows: {
      d7: offsetDate(effectiveEnd, -7),
      d3: offsetDate(effectiveEnd, -3),
      d1: offsetDate(effectiveEnd, -1),
      d0: effectiveEnd,
    },
  };
}

/** Zwraca liczbę dni do terminu (ujemna = po terminie). */
export function daysRemaining(deadline: Date, now: Date = new Date()): number {
  const a = Date.UTC(deadline.getUTCFullYear(), deadline.getUTCMonth(), deadline.getUTCDate());
  const b = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return Math.floor((a - b) / (1000 * 60 * 60 * 24));
}

/** Klasyfikacja pilności do UI badge. */
export function urgencyLevel(daysLeft: number): "overdue" | "critical" | "warning" | "soon" | "normal" {
  if (daysLeft < 0) return "overdue";
  if (daysLeft <= 1) return "critical";
  if (daysLeft <= 3) return "warning";
  if (daysLeft <= 7) return "soon";
  return "normal";
}
