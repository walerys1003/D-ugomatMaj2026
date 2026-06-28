/**
 * KomornikParser — parser pism komornika sądowego (D3 KomornikShield).
 *
 * Typowe dokumenty:
 *   - Zawiadomienie o wszczęciu egzekucji
 *   - Zajęcie rachunku bankowego (art. 889 k.p.c.)
 *   - Zajęcie wynagrodzenia (art. 880 k.p.c.)
 *   - Zajęcie świadczeń (emerytura/renta/zasiłek)
 *
 * Anchor-words: "komornik", "Km", "wierzyciel", "dłużnik", "zajęcie".
 */
import type { KomornikParsed } from "../ocr-types";
import {
  parsePolishAmount,
  parsePolishDate,
  parsePesel,
  computeCompleteness,
  extractAfter,
} from "./common";

export function parseKomornik(rawText: string): KomornikParsed {
  const text = rawText.replace(/\r/g, "").replace(/[ \t]+/g, " ").trim();

  const fields: KomornikParsed = {
    intent: "pismo_komornika",
    kancelaria_nazwa: extractKancelaria(text),
    kancelaria_adres: extractKancelariaAdres(text),
    sygnatura_km: extractSygnaturaKm(text),
    wierzyciel: extractWierzyciel(text),
    dluznik_pesel: parsePesel(text),
    zajecie_typ: detectZajecieTyp(text),
    kwota_dochodzona: extractKwotaDochodzona(text),
    data_pisma: extractDataPisma(text),
    completeness: 0,
  };
  fields.completeness = computeCompleteness(fields as unknown as Record<string, unknown>);
  return fields;
}

// -----------------------------------------------------------------------------

function extractKancelaria(text: string): string | null {
  // "Komornik Sądowy przy Sądzie Rejonowym ... Jan Kowalski"
  const m = text.match(
    /Komornik\s+S[aą]dowy[^\n]{5,160}/i,
  );
  if (m) return m[0].replace(/\s+/g, " ").trim().slice(0, 200);
  return extractAfter(text, "Komornik", 160);
}

function extractKancelariaAdres(text: string): string | null {
  // Heurystyka: ulica + kod pocztowy w okolicy słowa "Kancelaria"
  const m = text.match(
    /(?:ul\.|al\.|pl\.|os\.)\s*[A-ZĄĆĘŁŃÓŚŹŻ][^\n]{3,80},?\s*\d{2}-\d{3}\s+[A-Za-zĄĆĘŁŃÓŚŹŻąćęłńóśźż\-\s]{2,40}/,
  );
  return m ? m[0].replace(/\s+/g, " ").trim() : null;
}

function extractSygnaturaKm(text: string): string | null {
  // "Km 1234/24", "GKm 56/24", "Kmp 78/25"
  const patterns = [
    /\bG?Km(?:p|s)?\s+\d{1,8}\s*\/\s*\d{2,4}\b/i,
    /\bKMS?\s+\d{1,8}\s*\/\s*\d{2,4}\b/i,
  ];
  for (const re of patterns) {
    const m = text.match(re);
    if (m) return m[0].replace(/\s+/g, " ").trim();
  }
  return null;
}

function extractWierzyciel(text: string): string | null {
  const m = text.match(
    /Wierzyciel(?:em\s+jest)?\s*[:\-]?\s*([^\n]{3,200})/i,
  );
  return m ? m[1].trim().slice(0, 200) : null;
}

function detectZajecieTyp(text: string): KomornikParsed["zajecie_typ"] {
  const lc = text.toLowerCase();
  if (lc.includes("zaj[ęe]cie\\s+rachunku") || /zaj(?:ęcie|ecie)\s+rachunku/.test(lc))
    return "rachunek_bankowy";
  if (/rachunku\s+bankowego|art\.\s*889/.test(lc)) return "rachunek_bankowy";
  if (/wynagrodzeni[ae]|art\.\s*880|881/.test(lc)) return "wynagrodzenie";
  if (/emerytur[ya]|rent[ya]|zasi[lł]ek|[sś]wiadcze[nń]/.test(lc))
    return "swiadczenia";
  if (/ruchomo[sś][cć]|samoch[oó]d|pojazd/.test(lc)) return "ruchomosci";
  if (/nieruchomo[sś][cć]|hipotek[ai]/.test(lc)) return "nieruchomosc";
  return null;
}

function extractKwotaDochodzona(text: string): number | null {
  const m = text.match(
    /(?:dochodzon[aej]?|do\s+wyegzekwowania|należno[sś]ci)\s*(?:w\s+kwocie|w\s+wysoko[sś]ci)?\s*[:\-]?\s*([\d\s.,]+)\s*(?:zł|PLN)/i,
  );
  if (m) return parsePolishAmount(m[1]);
  // Fallback: pierwsza kwota w piśmie z "zł"
  const fallback = text.match(/([\d\s.,]+)\s*(?:zł|PLN)/);
  if (fallback) return parsePolishAmount(fallback[1]);
  return null;
}

function extractDataPisma(text: string): string | null {
  const m = text.match(
    /(?:dnia|z\s+dnia|data)\s*[:\-]?\s*(\d{1,2}[.\-/]\d{1,2}[.\-/]\d{4}|\d{4}-\d{2}-\d{2}|\d{1,2}\s+[a-ząćęłńóśźż]+\s+\d{4})/i,
  );
  if (m) return parsePolishDate(m[1]);
  return null;
}
