/**
 * NakazParser — parser nakazu zapłaty wydanego w EPU (oraz "papierowych"
 * nakazów z postępowania upominawczego/nakazowego).
 *
 * Strategia:
 *   1. Anchor-words → szukamy "Nakaz zapłaty", "Sygnatura akt", "Powód",
 *      "Pozwany", "kwota", "tytułem"
 *   2. Regex per pole z fuzzy matchem (OCR czasem zamienia "ł" → "l", "ą" → "a")
 *   3. Każde pole, którego nie znajdziemy → null (nie zgadujemy).
 *      User w "review screen" uzupełnia ręcznie.
 *
 * Wszystkie pola opcjonalne — `completeness` w UI mówi czy review jest must-have.
 */
import type { NakazParsed } from "../ocr-types";
import {
  parsePolishAmount,
  parsePolishDate,
  parsePesel,
  computeCompleteness,
  extractAfter,
} from "./common";

export function parseNakaz(rawText: string): NakazParsed {
  const text = normalize(rawText);

  const sygnatura = extractSygnatura(text);
  const sad = extractSad(text);
  const dataNakazu = extractDataNakazu(text);
  const dataDoreczenia = extractDataDoreczenia(text);
  const { powod_nazwa, powod_adres } = extractPowod(text);
  const { pozwany_nazwa, pozwany_adres } = extractPozwany(text);
  const pozwany_pesel = parsePesel(text);
  const kwoty = extractKwoty(text);

  const fields: NakazParsed = {
    intent: "nakaz_zaplaty",
    sygnatura,
    sad,
    data_nakazu: dataNakazu,
    data_doreczenia: dataDoreczenia,
    powod_nazwa,
    powod_adres,
    pozwany_nazwa,
    pozwany_adres,
    pozwany_pesel,
    kwota_glowna: kwoty.glowna,
    kwota_odsetki: kwoty.odsetki,
    kwota_koszty: kwoty.koszty,
    kwota_razem: kwoty.razem,
    completeness: 0,
  };
  fields.completeness = computeCompleteness(fields as unknown as Record<string, unknown>);
  return fields;
}

// -----------------------------------------------------------------------------
// Helpers — extractors
// -----------------------------------------------------------------------------

function normalize(s: string): string {
  // Unify whitespace; nie ruszamy diakrytyków (są ważne dla regex'ów).
  return s.replace(/\r/g, "").replace(/[ \t]+/g, " ").trim();
}

/**
 * Sygnatura akt EPU: "Nc-e 1234567/24", "Nc 123/24", "I C 1234/24".
 */
function extractSygnatura(text: string): string | null {
  // Najczęstsze wzorce (Nc-e dla EPU, Nc dla papierowego, X C / X Cps dla pozostałych)
  const patterns = [
    /\bNc[-\s]?e\s+\d{1,8}\s*\/\s*\d{2,4}\b/i,
    /\bNc\s+\d{1,8}\s*\/\s*\d{2,4}\b/i,
    /\b[IVX]+\s+C(?:ps)?\s+\d{1,8}\s*\/\s*\d{2,4}\b/i,
    /\b[IVX]+\s+Cu?\s+\d{1,8}\s*\/\s*\d{2,4}\b/i,
  ];
  for (const re of patterns) {
    const m = text.match(re);
    if (m) return m[0].replace(/\s+/g, " ").trim();
  }
  // Fallback: po słowie "Sygnatura"
  const after = extractAfter(text, "Sygnatura", 80);
  return after ? after.split(/\s{2,}|\n/)[0].trim() : null;
}

/**
 * Sąd — "Sąd Rejonowy Lublin-Zachód w Lublinie" (EPU), albo lokalny.
 */
function extractSad(text: string): string | null {
  // EPU bardzo specyficzny — wszystkie sprawy w jednym sądzie:
  if (/Lublin[-\s]Zachód\s+w\s+Lublinie/i.test(text)) {
    return "Sąd Rejonowy Lublin-Zachód w Lublinie";
  }
  const m = text.match(
    /S[aą]d\s+(?:Rejonowy|Okr[eę]gowy|Apelacyjny|Najwy[zż]szy)\s+[A-Za-zĄĆĘŁŃÓŚŹŻąćęłńóśźż\-\s]{3,80}/i,
  );
  if (m) return m[0].replace(/\s+/g, " ").trim();
  return extractAfter(text, "Sąd", 100);
}

function extractDataNakazu(text: string): string | null {
  // "wydany w dniu DD.MM.YYYY" lub "z dnia DD.MM.YYYY"
  const m = text.match(
    /(?:wydan[ye]|z\s+dnia|dniu)\s+(\d{1,2}[.\-/]\d{1,2}[.\-/]\d{4}|\d{4}-\d{2}-\d{2}|\d{1,2}\s+[a-ząćęłńóśźż]+\s+\d{4})/i,
  );
  if (m) return parsePolishDate(m[1]);
  return null;
}

function extractDataDoreczenia(text: string): string | null {
  // "doręczono dnia ...", "data doręczenia: ..."
  const m = text.match(
    /dor[eę]cz(?:ono|enia?)\s*(?:dnia)?\s*[:\-]?\s*(\d{1,2}[.\-/]\d{1,2}[.\-/]\d{4}|\d{4}-\d{2}-\d{2}|\d{1,2}\s+[a-ząćęłńóśźż]+\s+\d{4})/i,
  );
  if (m) return parsePolishDate(m[1]);
  return null;
}

function extractPowod(text: string): {
  powod_nazwa: string | null;
  powod_adres: string | null;
} {
  // Blok "Powód: <nazwa>\n<adres>"
  const m = text.match(
    /Pow[oó]d(?:em\s+jest)?\s*[:\-]?\s*([^\n]+)(?:\n([^\n]+))?/i,
  );
  if (!m) return { powod_nazwa: null, powod_adres: null };
  const nazwa = m[1]?.trim().slice(0, 200) ?? null;
  const adres = m[2]?.trim().slice(0, 200) ?? null;
  return { powod_nazwa: nazwa, powod_adres: adres };
}

function extractPozwany(text: string): {
  pozwany_nazwa: string | null;
  pozwany_adres: string | null;
} {
  const m = text.match(
    /Pozwan[yaą](?:m|i)?\s*[:\-]?\s*([^\n]+)(?:\n([^\n]+))?/i,
  );
  if (!m) return { pozwany_nazwa: null, pozwany_adres: null };
  const nazwa = m[1]?.trim().slice(0, 200) ?? null;
  const adres = m[2]?.trim().slice(0, 200) ?? null;
  return { pozwany_nazwa: nazwa, pozwany_adres: adres };
}

function extractKwoty(text: string): {
  glowna: number | null;
  odsetki: number | null;
  koszty: number | null;
  razem: number | null;
} {
  // Należność główna
  const glowna = pickAmount(
    text,
    /(?:należnośc[ią]?\s+głównej|kwoty\s+głównej|kwota\s+główna|tytułem\s+nale[zż]no[sś]ci\s+głównej)\s*[:\-]?\s*([\d\s.,]+)\s*(?:zł|PLN)/i,
  );
  // Odsetki
  const odsetki = pickAmount(
    text,
    /(?:odset(?:ki|ek)|odsetkami)\s*(?:ustawowymi|umownymi)?\s*(?:w\s+kwocie)?\s*[:\-]?\s*([\d\s.,]+)\s*(?:zł|PLN)/i,
  );
  // Koszty
  const koszty = pickAmount(
    text,
    /(?:koszt[óy]w?\s+(?:procesu|sądowych|postępowania|zastępstwa))\s*(?:w\s+kwocie)?\s*[:\-]?\s*([\d\s.,]+)\s*(?:zł|PLN)/i,
  );
  // Razem (WPS)
  const razem = pickAmount(
    text,
    /(?:warto[sś][cć]\s+przedmiotu\s+sporu|razem|łącznie|ogółem)\s*[:\-]?\s*([\d\s.,]+)\s*(?:zł|PLN)/i,
  );

  return { glowna, odsetki, koszty, razem };
}

function pickAmount(text: string, re: RegExp): number | null {
  const m = text.match(re);
  if (!m) return null;
  return parsePolishAmount(m[1]);
}
