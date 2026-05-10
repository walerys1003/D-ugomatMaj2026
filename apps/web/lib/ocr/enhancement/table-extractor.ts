/**
 * Tier 18 — OCR enhancement: table extraction.
 *
 * Heurystyka rekonstrukcji tabel z linii OCR (Tesseract/Textract):
 *  1. Klasteryzacja linii po Y (tolerancja proporcjonalna do średniej wysokości znaku).
 *  2. Wykrywanie kolumn po X-bboxach słów (mediana + gap > 1.5× szerokości znaku).
 *  3. Detekcja nagłówka (pierwszy wiersz z >60% słów ALL CAPS lub bold-like).
 *
 * Wynik: macierz `string[][]` + meta (rowCount, colCount, headerRow).
 * Używane przez parsery dla nakazów zapłaty (tabela odsetek), pism komorniczych
 * (zajęcia/koszty) i raportów BIK (historia spłat).
 */

import type { OcrLine } from "../ocr-types";

export interface ExtractedTable {
  rows: string[][];
  rowCount: number;
  colCount: number;
  headerRow: string[] | null;
  confidence: number; // 0..1
}

interface WordToken {
  text: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

const Y_CLUSTER_FACTOR = 0.6;
const COL_GAP_FACTOR = 1.5;

/**
 * Wyciągnięcie pojedynczej tabeli z bloku linii OCR.
 * Linie muszą zawierać bboxy (Tesseract/Textract zwracają je domyślnie).
 */
export function extractTable(lines: OcrLine[]): ExtractedTable | null {
  const words: WordToken[] = [];
  for (const ln of lines) {
    if (!ln.bbox) continue;
    const bbox = ln.bbox;
    const text = ln.text.trim();
    if (!text) continue;
    // Heurystyka: rozbij linię na słowa proporcjonalnie do bboxa.
    const parts = text.split(/\s+/);
    const totalChars = parts.reduce((s, p) => s + p.length, 0) || 1;
    const lineWidth = bbox.x1 - bbox.x0;
    let cursor = bbox.x0;
    for (const part of parts) {
      const w = (part.length / totalChars) * lineWidth;
      words.push({
        text: part,
        x: cursor,
        y: (bbox.y0 + bbox.y1) / 2,
        w,
        h: bbox.y1 - bbox.y0,
      });
      cursor += w + 4;
    }
  }
  if (words.length < 4) return null;

  const avgH = words.reduce((s, w) => s + w.h, 0) / words.length;
  const yTol = avgH * Y_CLUSTER_FACTOR;

  // 1) cluster Y
  const sorted = [...words].sort((a, b) => a.y - b.y);
  const rowsRaw: WordToken[][] = [];
  for (const w of sorted) {
    const last = rowsRaw[rowsRaw.length - 1];
    if (last && Math.abs(last[0].y - w.y) <= yTol) {
      last.push(w);
    } else {
      rowsRaw.push([w]);
    }
  }
  if (rowsRaw.length < 2) return null;

  // 2) kolumny — szukamy gaps w X
  const xs = words.map((w) => w.x).sort((a, b) => a - b);
  const avgCharW = words.reduce((s, w) => s + w.w / Math.max(1, w.text.length), 0) / words.length;
  const colBoundaries: number[] = [xs[0]];
  for (let i = 1; i < xs.length; i++) {
    if (xs[i] - xs[i - 1] > avgCharW * COL_GAP_FACTOR * 4) {
      colBoundaries.push(xs[i]);
    }
  }
  if (colBoundaries.length < 2) return null;

  const colOf = (x: number): number => {
    let idx = 0;
    for (let i = 0; i < colBoundaries.length; i++) {
      if (x >= colBoundaries[i] - avgCharW) idx = i;
    }
    return idx;
  };

  // 3) budujemy macierz
  const rows: string[][] = [];
  for (const rowWords of rowsRaw) {
    rowWords.sort((a, b) => a.x - b.x);
    const cells: string[] = new Array(colBoundaries.length).fill("");
    for (const w of rowWords) {
      const c = colOf(w.x);
      cells[c] = cells[c] ? `${cells[c]} ${w.text}` : w.text;
    }
    rows.push(cells.map((s) => s.trim()));
  }

  // 4) wykrywanie nagłówka
  const headerRow = detectHeader(rows[0]) ? rows[0] : null;

  // 5) confidence: ile wierszy ma >= 50% kolumn niepustych
  const fullness = rows.map(
    (r) => r.filter((c) => c.length > 0).length / Math.max(1, r.length),
  );
  const confidence =
    fullness.reduce((s, f) => s + f, 0) / Math.max(1, fullness.length);

  return {
    rows,
    rowCount: rows.length,
    colCount: colBoundaries.length,
    headerRow,
    confidence: Math.max(0, Math.min(1, confidence)),
  };
}

function detectHeader(row: string[]): boolean {
  if (!row || row.length === 0) return false;
  let capsLike = 0;
  for (const cell of row) {
    if (!cell) continue;
    const letters = cell.replace(/[^A-Za-zĄĆĘŁŃÓŚŹŻąćęłńóśźż]/g, "");
    if (!letters) continue;
    const upper = letters.replace(/[^A-ZĄĆĘŁŃÓŚŹŻ]/g, "");
    if (upper.length / letters.length > 0.7) capsLike++;
  }
  return capsLike / row.length > 0.6;
}
