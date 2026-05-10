"use client";

/**
 * Tesseract.js Worker — klient-side OCR (darmowy, offline-friendly).
 *
 * Dlaczego klient-side?
 *   - Pliki OCR-owane są PRZED uploadem do storage — chronimy PII (PESEL).
 *   - Zero kosztu API: tesseract.js leci w Web Worker w przeglądarce.
 *   - Słabsze wyniki na skanach niskiej jakości — wtedy fallback na Textract
 *     (server-side) wywoływany przez ocr-actions.ts gdy confidence < 60.
 *
 * Nie importujemy `tesseract.js` na poziomie modułu — robimy lazy `import()`
 * by Next.js nie próbował tego SSR-ować.
 */
import type { OcrRawResult, OcrLine, OcrPage } from "./ocr-types";

export interface TesseractOptions {
  /** Język OCR — ISO ('pol', 'pol+eng'). Domyślnie 'pol'. */
  lang?: string;
  /** Callback do progress baru (0..1). */
  onProgress?: (progress: number, status: string) => void;
}

/**
 * Wykonuje OCR pliku w przeglądarce.
 *
 * Zwraca surowy wynik (raw text + lines z confidence). Parsowanie domenowe
 * (nakaz/komornik/BIK) wykonuje się dalej w `parsers/*.ts`.
 */
export async function ocrFileWithTesseract(
  file: File | Blob,
  opts: TesseractOptions = {},
): Promise<OcrRawResult> {
  const start = Date.now();
  const lang = opts.lang ?? "pol";
  const onProgress = opts.onProgress ?? (() => {});

  // Lazy import — tesseract.js nie jest częścią initial bundle.
  const { createWorker } = await import("tesseract.js");
  const worker = await createWorker(lang, 1, {
    logger: (m: { status: string; progress?: number }) => {
      if (typeof m.progress === "number") {
        onProgress(Math.min(1, Math.max(0, m.progress)), m.status);
      }
    },
  });

  try {
    const { data } = await worker.recognize(file);
    const lines: OcrLine[] = (data.lines ?? []).map((l) => ({
      text: (l.text ?? "").trim(),
      confidence: Number(l.confidence ?? 0),
      bbox: l.bbox
        ? {
            x0: l.bbox.x0,
            y0: l.bbox.y0,
            x1: l.bbox.x1,
            y1: l.bbox.y1,
          }
        : undefined,
    }));

    const page: OcrPage = {
      index: 0,
      text: data.text ?? "",
      confidence: Number(data.confidence ?? 0),
      lines,
    };

    return {
      provider: "tesseract",
      pages: [page],
      text: data.text ?? "",
      confidence: Number(data.confidence ?? 0),
      durationMs: Date.now() - start,
    };
  } finally {
    await worker.terminate();
  }
}

/**
 * Heurystyka — czy wynik jest na tyle słaby, że trzeba odpalić Textract?
 *
 * Reguły (Tarcza):
 *   - confidence < 60% → fallback (skan zbyt zaszumiony)
 *   - tekst < 50 znaków → fallback (najpewniej obraz, nie tekst)
 *   - brak ANY z kluczowych słów ("nakaz", "sygn", "komornik", "BIK") → fallback
 */
export function shouldFallbackToTextract(result: OcrRawResult): boolean {
  if (result.confidence < 60) return true;
  if (!result.text || result.text.length < 50) return true;
  const lc = result.text.toLowerCase();
  const hasAnchor =
    lc.includes("sygn") ||
    lc.includes("nakaz") ||
    lc.includes("komornik") ||
    lc.includes("bik") ||
    lc.includes("sąd") ||
    lc.includes("sad ");
  return !hasAnchor;
}
