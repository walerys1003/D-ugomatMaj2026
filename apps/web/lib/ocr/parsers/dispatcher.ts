/**
 * Parser dispatcher — auto-detect intent + uruchomienie odpowiedniego parsera.
 *
 * Strategia:
 *   1. Jeśli caller poda explicit intent (np. user kliknął "Skan nakazu") —
 *      uruchamiamy tylko jego parser.
 *   2. Jeśli intent = 'unknown' lub null — sniff by anchor-words:
 *        "nakaz" + "EPU"/"sygn"  → nakaz
 *        "komornik" + "Km"        → komornik
 *        "BIK" / "Biuro Informacji" → BIK
 *      i fallback do UnknownParsed z hintami.
 */
import type {
  OcrIntent,
  ParsedDocument,
  UnknownParsed,
} from "../ocr-types";
import { parseNakaz } from "./nakaz-parser";
import { parseKomornik } from "./komornik-parser";
import { parseBik } from "./bik-parser";

export function dispatchParser(
  rawText: string,
  hint: OcrIntent = "unknown",
): ParsedDocument {
  if (hint !== "unknown") {
    return parseByIntent(rawText, hint);
  }
  const detected = sniffIntent(rawText);
  if (detected === "unknown") {
    return makeUnknown(rawText);
  }
  return parseByIntent(rawText, detected);
}

function parseByIntent(rawText: string, intent: OcrIntent): ParsedDocument {
  switch (intent) {
    case "nakaz_zaplaty":
      return parseNakaz(rawText);
    case "pismo_komornika":
      return parseKomornik(rawText);
    case "raport_bik":
      return parseBik(rawText);
    case "umowa_pozyczki":
    case "pismo_sadowe":
    case "unknown":
    default:
      return makeUnknown(rawText);
  }
}

/**
 * Heurystyczne wykrywanie intent na podstawie tekstu OCR.
 *
 * Każde dopasowanie waży 1 punkt, najwyższy wynik wygrywa.
 */
export function sniffIntent(rawText: string): OcrIntent {
  const lc = rawText.toLowerCase();

  let nakaz = 0;
  let komornik = 0;
  let bik = 0;

  // Nakaz signals
  if (/nakaz\s+zap[lł]aty/.test(lc)) nakaz += 3;
  if (/elektroniczne\s+post[eę]powanie\s+upominawcze|epu/.test(lc)) nakaz += 2;
  if (/lublin[-\s]zach[oó]d/.test(lc)) nakaz += 2;
  if (/\bnc[-\s]?e\s+\d/.test(lc)) nakaz += 3;
  if (/sprzeciw|art\.\s*503/.test(lc)) nakaz += 1;

  // Komornik signals
  if (/komornik\s+s[aą]dowy/.test(lc)) komornik += 3;
  if (/\bkm\s+\d|\bgkm\s+\d|\bkmp\s+\d/.test(lc)) komornik += 3;
  if (/zaj[eę]cie\s+(?:rachunku|wynagrodzenia|[sś]wiadcze[nń])/.test(lc))
    komornik += 2;
  if (/wierzyciel|d[lł]u[zż]nik|art\.\s*88\d/.test(lc)) komornik += 1;

  // BIK signals
  if (/biuro\s+informacji\s+kredytowej|\bbik\s+s\.?a\.?\b/.test(lc)) bik += 3;
  if (/\bbik\b/.test(lc)) bik += 1;
  if (/zad[lł]u[zż]enie|saldo\s+do\s+zap[lł]aty|kredyt|po[zż]yczk/.test(lc))
    bik += 1;
  if (/reklamacja|wpis|usuni[eę]cie|sprostowanie/.test(lc)) bik += 1;

  const max = Math.max(nakaz, komornik, bik);
  if (max < 3) return "unknown";
  if (nakaz === max) return "nakaz_zaplaty";
  if (komornik === max) return "pismo_komornika";
  if (bik === max) return "raport_bik";
  return "unknown";
}

function makeUnknown(rawText: string): UnknownParsed {
  const lc = rawText.toLowerCase();
  const hints: string[] = [];
  if (/nakaz/.test(lc)) hints.push("Wykryto słowo 'nakaz' — sprawdź czy to nakaz zapłaty (D2)");
  if (/komornik/.test(lc)) hints.push("Wykryto słowo 'komornik' — sprawdź czy to pismo komornicze (D3)");
  if (/bik/.test(lc)) hints.push("Wykryto skrót 'BIK' — sprawdź czy to wpis BIK (D5)");
  if (hints.length === 0) hints.push("Nie udało się rozpoznać dokumentu — wybierz typ ręcznie.");
  return { intent: "unknown", hints, completeness: 0 };
}
