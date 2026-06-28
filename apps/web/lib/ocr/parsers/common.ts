/**
 * Wspólne helpery parserów OCR.
 *
 * Parsery są HEURYSTYCZNE — tekst z OCR jest często zaszumiony,
 * więc używamy regex'ów + fuzzy matchingu. Każde wyciągnięte pole
 * jest następnie pokazywane userowi w "review screen", gdzie może
 * je edytować przed startem wizardu.
 *
 * Reguły:
 *   - polska notacja kwot: "1 234,56 zł" / "1.234,56 zł" / "1234,56 PLN"
 *   - daty: "15 marca 2025", "15.03.2025", "2025-03-15"
 *   - sygnatury sądowe: "Nc-e 123456/24", "I C 1234/24", "Km 123/24"
 *   - PESEL: 11 cyfr, opcjonalnie z myślnikiem
 */

const POLISH_MONTHS: Record<string, string> = {
  stycznia: "01", styczeń: "01", "stycz.": "01",
  lutego: "02", luty: "02", "lut.": "02",
  marca: "03", marzec: "03", "mar.": "03",
  kwietnia: "04", kwiecień: "04", "kwi.": "04",
  maja: "05", maj: "05",
  czerwca: "06", czerwiec: "06", "cze.": "06",
  lipca: "07", lipiec: "07", "lip.": "07",
  sierpnia: "08", sierpień: "08", "sie.": "08",
  września: "09", wrzesień: "09", "wrz.": "09",
  października: "10", październik: "10", "paź.": "10",
  listopada: "11", listopad: "11", "lis.": "11",
  grudnia: "12", grudzień: "12", "gru.": "12",
};

/**
 * Parsuje polską kwotę typu "1 234,56 zł" → 1234.56 (PLN).
 * Zwraca null gdy nie da się sparsować.
 */
export function parsePolishAmount(input: string | null | undefined): number | null {
  if (!input) return null;
  // Usuwamy walutę i białe znaki (w tym non-breaking)
  const cleaned = input
    .replace(/zł|PLN|złotych|złoty/gi, "")
    .replace(/[\u00A0\s]/g, "")
    .trim();
  if (!cleaned) return null;

  // Jeśli mamy zarówno kropki jak i przecinki — kropki są tysiącami
  let normalized = cleaned;
  if (/[.,]/.test(cleaned)) {
    if (cleaned.includes(",") && cleaned.includes(".")) {
      // 1.234,56 → 1234.56
      normalized = cleaned.replace(/\./g, "").replace(",", ".");
    } else if (cleaned.includes(",")) {
      // 1234,56 → 1234.56
      normalized = cleaned.replace(",", ".");
    }
    // jeśli tylko kropka — zostaje (np. 1234.56)
  }

  const n = Number(normalized);
  return Number.isFinite(n) ? n : null;
}

/**
 * Parsuje datę z różnych formatów do ISO YYYY-MM-DD.
 */
export function parsePolishDate(input: string | null | undefined): string | null {
  if (!input) return null;
  const s = input.trim().toLowerCase();

  // 1) ISO już
  const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;

  // 2) DD.MM.YYYY lub DD/MM/YYYY
  const dot = s.match(/^(\d{1,2})[./](\d{1,2})[./](\d{4})/);
  if (dot) {
    const [, d, m, y] = dot;
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }

  // 3) "15 marca 2025"
  const named = s.match(/^(\d{1,2})\s+([a-ząćęłńóśźż.]+)\s+(\d{4})/i);
  if (named) {
    const [, d, monthName, y] = named;
    const m = POLISH_MONTHS[monthName.toLowerCase()];
    if (m) return `${y}-${m}-${d.padStart(2, "0")}`;
  }

  return null;
}

/**
 * Wyciąga PESEL (11 cyfr) z dowolnego ciągu, walidując sumę kontrolną.
 *
 * Strategia:
 *   1. Najpierw szukamy "PESEL: <11 cyfr>" — najsilniejszy sygnał.
 *   2. Potem dowolny ciąg 11 cyfr w word-boundary z poprawną sumą kontrolną.
 *   3. Wszystkie kandydaci walidowani algorytmem mod-10.
 *
 * Zwraca string '12345678901' lub null.
 */
export function parsePesel(input: string | null | undefined): string | null {
  if (!input) return null;

  // 1) Najpierw "PESEL: 12345678901" / "PESEL 12345678901" / "PESEL nr 12345678901"
  const labeled = input.match(/PESEL[\s:.\-]*(?:nr|numer)?[\s:.\-]*(\d{11})\b/i);
  if (labeled) {
    const cand = labeled[1];
    if (validatePesel(cand)) return cand;
  }

  // 2) Iteruj po wszystkich potencjalnych 11-cyfrowych ciągach i waliduj.
  //    Używamy globalnego regex z word-boundary, żeby nie złapać np. fragmentu
  //    sygnatury Nc-e 12345678/24 (8 cyfr nie 11) albo długiego numeru rachunku.
  const all = input.matchAll(/\b(\d{11})\b/g);
  for (const m of all) {
    if (validatePesel(m[1])) return m[1];
  }

  return null;
}

/**
 * Walidacja PESEL — algorytm sumy kontrolnej.
 */
export function validatePesel(pesel: string): boolean {
  if (!/^\d{11}$/.test(pesel)) return false;
  const weights = [1, 3, 7, 9, 1, 3, 7, 9, 1, 3];
  let sum = 0;
  for (let i = 0; i < 10; i++) sum += Number(pesel[i]) * weights[i];
  const check = (10 - (sum % 10)) % 10;
  return check === Number(pesel[10]);
}

/**
 * Maskuje PESEL do bezpiecznej prezentacji w UI.
 *
 * Format: `XXX*****YY` — pierwsze 3 cyfry (rok) + 5 gwiazdek + ostatnie 2.
 * Świadomie ukrywamy: dzień urodzenia + płeć + suma kontrolna częściowo.
 * RODO art. 5(1)(c) — data minimization, art. 32 — pseudonimizacja.
 */
export function maskPesel(pesel: string): string {
  if (!/^\d{11}$/.test(pesel)) return pesel;
  return `${pesel.slice(0, 3)}*****${pesel.slice(9)}`;
}

/**
 * Wyciąga blok tekstu po słowie kluczowym do następnego separatora.
 *
 * Przykład:
 *   extractAfter("Sygnatura akt: Nc-e 123/24\nSąd: ...", "Sygnatura")
 *   → "Nc-e 123/24"
 */
export function extractAfter(
  text: string,
  keyword: string,
  maxLen = 120,
): string | null {
  const re = new RegExp(`${escapeRegex(keyword)}\\s*[:\\-]?\\s*(.+?)(?:\\n|$)`, "i");
  const m = text.match(re);
  if (!m) return null;
  return m[1].trim().slice(0, maxLen) || null;
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Wyciąga wszystko między dwoma znacznikami (greedy do końca linii bloku).
 */
export function extractBetween(
  text: string,
  start: string,
  end: string,
): string | null {
  const re = new RegExp(
    `${escapeRegex(start)}([\\s\\S]*?)${escapeRegex(end)}`,
    "i",
  );
  const m = text.match(re);
  return m ? m[1].trim() : null;
}

/**
 * Liczy procent niepustych pól → completeness score.
 */
export function computeCompleteness(fields: Record<string, unknown>): number {
  const keys = Object.keys(fields).filter((k) => k !== "intent" && k !== "completeness");
  if (keys.length === 0) return 0;
  let filled = 0;
  for (const k of keys) {
    const v = fields[k];
    if (v !== null && v !== undefined && v !== "") filled++;
  }
  return Math.round((filled / keys.length) * 100);
}
