/**
 * OCR pipeline — wspólne typy.
 *
 * Tier 3.3 zakres:
 *   - Tesseract.js Worker (klient-side, domyślny — darmowy, offline)
 *   - AWS Textract (server-side fallback dla skanów słabej jakości)
 *   - parsery domenowe per case_type:
 *       NakazParser     → sygnatura, sąd, strony, kwoty, daty
 *       KomornikParser  → kancelaria, sygnatura Km, składniki zajęcia
 *       BIKParser       → wpis BIK, bank, kwota, daty
 *   - cache: hash pliku → wynik (24h), unika podwójnego OCR-owania
 *
 * Bezpieczeństwo:
 *   - Pliki OCR-owalne max 20MB (storage bucket `ocr-uploads` w Tier 2)
 *   - PESEL i inne PII są maskowane w `extracted_data` (oprócz pól, które
 *     user świadomie zatwierdzi w wizardzie)
 *   - raw_text leci do DB (potrzebny do audytu), ale RLS pilnuje, że
 *     widzi tylko `auth.uid() = user_id`.
 */

export type OcrProvider = "tesseract" | "textract";

export type OcrStatus = "pending" | "processing" | "completed" | "failed";

/**
 * Domain "intent" — jakiego dokumentu się spodziewamy.
 * Determinuje, który parser zostanie uruchomiony po OCR.
 */
export type OcrIntent =
  | "nakaz_zaplaty"      // D2 — sprzeciw EPU
  | "pismo_komornika"    // D3 — KomornikShield
  | "raport_bik"         // D5 — BIK-Fix
  | "umowa_pozyczki"     // D2/D5/D6
  | "pismo_sadowe"       // generic — fallback
  | "unknown";

export interface OcrLine {
  text: string;
  confidence: number; // 0..100
  bbox?: { x0: number; y0: number; x1: number; y1: number };
}

export interface OcrPage {
  index: number;
  text: string;
  confidence: number;
  lines: OcrLine[];
}

export interface OcrRawResult {
  provider: OcrProvider;
  pages: OcrPage[];
  /** Połączony tekst wszystkich stron (do parsingu, do DB.raw_text). */
  text: string;
  /** Średnia ważona długością wiersza (0..100). */
  confidence: number;
  /** Szczegóły wykonania (dla logu / monitoringu). */
  durationMs: number;
}

// -----------------------------------------------------------------------------
// Parser output — domain-specific shapes
// -----------------------------------------------------------------------------
export interface NakazParsed {
  intent: "nakaz_zaplaty";
  sygnatura: string | null;
  sad: string | null;
  data_nakazu: string | null;          // ISO YYYY-MM-DD
  data_doreczenia: string | null;      // ISO YYYY-MM-DD (jeżeli widać)
  powod_nazwa: string | null;
  powod_adres: string | null;
  pozwany_nazwa: string | null;
  pozwany_adres: string | null;
  pozwany_pesel: string | null;        // maskowany w UI (XXX****1234)
  kwota_glowna: number | null;         // PLN (zł, kropka jako separator)
  kwota_odsetki: number | null;
  kwota_koszty: number | null;
  kwota_razem: number | null;
  /** Procent rozpoznanych pól (0..100) — alarm dla user'a, czy review konieczny. */
  completeness: number;
}

export interface KomornikParsed {
  intent: "pismo_komornika";
  kancelaria_nazwa: string | null;
  kancelaria_adres: string | null;
  sygnatura_km: string | null;          // np. "Km 1234/24"
  wierzyciel: string | null;
  dluznik_pesel: string | null;
  zajecie_typ:
    | "rachunek_bankowy"
    | "wynagrodzenie"
    | "swiadczenia"
    | "ruchomosci"
    | "nieruchomosc"
    | "inne"
    | null;
  kwota_dochodzona: number | null;
  data_pisma: string | null;
  completeness: number;
}

export interface BikParsed {
  intent: "raport_bik";
  bank_nazwa: string | null;
  numer_umowy: string | null;
  kwota_kredytu: number | null;
  data_wpisu: string | null;
  status_wpisu: "aktywny" | "zamknięty" | "zaległość" | null;
  rodzaj_nieprawidlowosci: string | null;
  completeness: number;
}

export interface UnknownParsed {
  intent: "unknown";
  hints: string[];                      // np. ["możliwy nakaz EPU", "brak kwoty"]
  completeness: 0;
}

export type ParsedDocument =
  | NakazParsed
  | KomornikParsed
  | BikParsed
  | UnknownParsed;

// -----------------------------------------------------------------------------
// End-to-end OCR result (zwracany do UI po pełnym pipeline)
// -----------------------------------------------------------------------------
export interface OcrPipelineResult {
  ocrResultId: string;                  // UUID z public.ocr_results
  provider: OcrProvider;
  rawText: string;
  confidence: number;
  parsed: ParsedDocument;
  durationMs: number;
  /** SHA-256 zawartości pliku (do cache + dedup). */
  fileHash: string;
}
