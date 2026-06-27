/**
 * BIKParser — parser raportu BIK / pisma od banku w sprawie wpisu BIK (D5 BIK-Fix).
 *
 * Typowe dokumenty:
 *   - Raport BIK (PDF generowany przez BIK S.A.)
 *   - Pismo banku z odpowiedzią na reklamację
 *   - Wezwanie do zapłaty z banku
 *
 * Anchor-words: "BIK", "Biuro Informacji Kredytowej", "umowa", "kredyt",
 *               "saldo", "zaległość".
 */
import type { BikParsed } from "../ocr-types";
import { parsePolishAmount, parsePolishDate, computeCompleteness } from "./common";

export function parseBik(rawText: string): BikParsed {
  const text = rawText.replace(/\r/g, "").replace(/[ \t]+/g, " ").trim();

  const fields: BikParsed = {
    intent: "raport_bik",
    bank_nazwa: extractBank(text),
    numer_umowy: extractNumerUmowy(text),
    kwota_kredytu: extractKwotaKredytu(text),
    data_wpisu: extractDataWpisu(text),
    status_wpisu: detectStatusWpisu(text),
    rodzaj_nieprawidlowosci: detectNieprawidlowosc(text),
    completeness: 0,
  };
  fields.completeness = computeCompleteness(fields as unknown as Record<string, unknown>);
  return fields;
}

// -----------------------------------------------------------------------------

function extractBank(text: string): string | null {
  // Najczęstsze polskie banki — szybki match
  const knownBanks = [
    "PKO BP", "PKO Bank Polski", "Pekao", "mBank", "ING Bank Śląski",
    "Santander Bank Polska", "Santander Consumer", "Bank Millennium",
    "Alior Bank", "BNP Paribas", "Credit Agricole", "Citi Handlowy",
    "Bank Pocztowy", "Nest Bank", "VeloBank", "Plus Bank",
    "Provident", "Vivus", "Kredyt OK", "Profi Credit", "Aasa Polska",
  ];
  for (const bank of knownBanks) {
    if (new RegExp(`\\b${bank.replace(/\s+/g, "\\s+")}\\b`, "i").test(text)) {
      return bank;
    }
  }
  // Fallback: "Bank XYZ S.A."
  const m = text.match(/(?:Bank|Banku)\s+[A-ZĄĆĘŁŃÓŚŹŻ][A-Za-zĄĆĘŁŃÓŚŹŻąćęłńóśźż\s\-]{2,60}(?:S\.?A\.?|sp\.\s*z\s*o\.?\s*o\.?)?/);
  return m ? m[0].replace(/\s+/g, " ").trim().slice(0, 120) : null;
}

function extractNumerUmowy(text: string): string | null {
  // "Umowa nr 12345/2024", "Numer umowy: ABC-123", "Nr ref. ..."
  const patterns = [
    /(?:Umowa\s+nr|Numer\s+umowy|Nr\s+umowy|Nr\s+ref(?:erencyjny)?)\s*[:\-]?\s*([A-Z0-9\-/_]{4,40})/i,
    /(?:Kredyt\s+nr|Pożyczka\s+nr)\s*[:\-]?\s*([A-Z0-9\-/_]{4,40})/i,
  ];
  for (const re of patterns) {
    const m = text.match(re);
    if (m) return m[1].trim();
  }
  return null;
}

function extractKwotaKredytu(text: string): number | null {
  // "kwota kredytu", "saldo zadłużenia", "kapitał pozostały"
  const patterns = [
    /(?:kwota\s+kredytu|kwota\s+pożyczki)\s*[:\-]?\s*([\d\s.,]+)\s*(?:zł|PLN)/i,
    /(?:saldo\s+zadłu[zż]enia|saldo\s+do\s+zapłaty)\s*[:\-]?\s*([\d\s.,]+)\s*(?:zł|PLN)/i,
    /(?:kapita[lł]\s+pozosta[lł]y)\s*[:\-]?\s*([\d\s.,]+)\s*(?:zł|PLN)/i,
    /(?:zad[lł]u[zż]enie)\s*[:\-]?\s*([\d\s.,]+)\s*(?:zł|PLN)/i,
  ];
  for (const re of patterns) {
    const m = text.match(re);
    if (m) return parsePolishAmount(m[1]);
  }
  return null;
}

function extractDataWpisu(text: string): string | null {
  // "data wpisu", "data zgłoszenia do BIK", "od dnia"
  const m = text.match(
    /(?:data\s+wpisu|data\s+zg[lł]oszenia|wpisu\s+do\s+BIK|od\s+dnia)\s*[:\-]?\s*(\d{1,2}[.\-/]\d{1,2}[.\-/]\d{4}|\d{4}-\d{2}-\d{2}|\d{1,2}\s+[a-ząćęłńóśźż]+\s+\d{4})/i,
  );
  if (m) return parsePolishDate(m[1]);
  return null;
}

function detectStatusWpisu(text: string): BikParsed["status_wpisu"] {
  const lc = text.toLowerCase();
  if (/zaleg[lł]o[sś][cć]|niesp[lł]aco?n[ya]|opó[zź]nienie/.test(lc))
    return "zaległość";
  if (/zamkni[eę]ty|sp[lł]acony|wyga[sś]/.test(lc)) return "zamknięty";
  if (/aktywny|w\s+trakcie|otwart[ya]/.test(lc)) return "aktywny";
  return null;
}

function detectNieprawidlowosc(text: string): string | null {
  const lc = text.toLowerCase();
  const hits: string[] = [];
  if (/sp[lł]acony|sp[lł]acon[ay]|wygas[lł]/.test(lc)) {
    hits.push("Wpis dotyczy zobowiązania spłaconego");
  }
  if (/cesja|cesji|nabywc[ay]/.test(lc)) {
    hits.push("Wpis dotyczy wierzytelności scedowanej (cesja)");
  }
  if (/przedawn/.test(lc)) {
    hits.push("Roszczenie przedawnione");
  }
  if (/b[lł][aą]?d|niezgodn[oa][sś][cć]|pomyłk/.test(lc)) {
    hits.push("Błąd lub niezgodność danych");
  }
  if (/podw[oó]jn[ya]\s+wpis|duplikat/.test(lc)) {
    hits.push("Podwójny wpis");
  }
  return hits.length > 0 ? hits.join("; ") : null;
}
