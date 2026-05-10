/**
 * Tier 18 — OCR enhancement: signature & stamp detection.
 *
 * Heurystyka detekcji podpisu/pieczątki na obrazie dokumentu:
 *  1. Konwersja do grayscale (luminance) na podstawie ImageData.
 *  2. Binaryzacja (Otsu lokalne, fallback 128).
 *  3. Wykrywanie połączonych komponentów (BFS) — szukamy regionów o:
 *     - rozmiarze > 0.5% i < 15% powierzchni strony
 *     - aspect ratio 0.3–4.0
 *     - gęstości pikseli 0.15–0.55 (typowe dla podpisu odręcznego)
 *  4. Klasyfikacja: signature (organiczny, niska zwartość) vs stamp
 *     (koliste/prostokątne, wysoka zwartość brzegu).
 */

export interface SignatureBox {
  kind: "signature" | "stamp";
  x: number;
  y: number;
  w: number;
  h: number;
  density: number;
  confidence: number; // 0..1
}

export interface SignatureScanInput {
  width: number;
  height: number;
  pixels: Uint8ClampedArray; // RGBA z canvas.getImageData
}

const MIN_AREA_FRAC = 0.005;
const MAX_AREA_FRAC = 0.15;

export function detectSignatures(input: SignatureScanInput): SignatureBox[] {
  const { width, height, pixels } = input;
  const total = width * height;
  if (total === 0) return [];

  // 1) luminance
  const gray = new Uint8ClampedArray(total);
  for (let i = 0, j = 0; i < pixels.length; i += 4, j++) {
    gray[j] = (pixels[i] * 0.299 + pixels[i + 1] * 0.587 + pixels[i + 2] * 0.114) | 0;
  }

  // 2) binaryzacja — średnia + odchylenie
  let sum = 0;
  for (let i = 0; i < total; i++) sum += gray[i];
  const mean = sum / total;
  const threshold = Math.max(60, Math.min(180, mean - 25));
  const bin = new Uint8Array(total);
  for (let i = 0; i < total; i++) bin[i] = gray[i] < threshold ? 1 : 0;

  // 3) flood-fill connected components (4-connectivity, iteracyjny)
  const visited = new Uint8Array(total);
  const boxes: SignatureBox[] = [];
  const stack = new Int32Array(total);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      if (visited[idx] || !bin[idx]) continue;
      let top = 0;
      stack[top++] = idx;
      let minX = x;
      let maxX = x;
      let minY = y;
      let maxY = y;
      let count = 0;

      while (top > 0) {
        const cur = stack[--top];
        if (visited[cur]) continue;
        visited[cur] = 1;
        if (!bin[cur]) continue;
        count++;
        const cy = (cur / width) | 0;
        const cx = cur - cy * width;
        if (cx < minX) minX = cx;
        if (cx > maxX) maxX = cx;
        if (cy < minY) minY = cy;
        if (cy > maxY) maxY = cy;
        if (cx > 0 && !visited[cur - 1]) stack[top++] = cur - 1;
        if (cx < width - 1 && !visited[cur + 1]) stack[top++] = cur + 1;
        if (cy > 0 && !visited[cur - width]) stack[top++] = cur - width;
        if (cy < height - 1 && !visited[cur + width]) stack[top++] = cur + width;
      }

      const w = maxX - minX + 1;
      const h = maxY - minY + 1;
      const area = w * h;
      const frac = area / total;
      if (frac < MIN_AREA_FRAC || frac > MAX_AREA_FRAC) continue;
      const ar = w / h;
      if (ar < 0.3 || ar > 4.0) continue;
      const density = count / area;
      if (density < 0.15 || density > 0.55) continue;

      const kind = classifyRegion(density, ar);
      boxes.push({
        kind,
        x: minX,
        y: minY,
        w,
        h,
        density,
        confidence: scoreConfidence(density, ar, frac),
      });
    }
  }

  // sortujemy po confidence malejąco
  boxes.sort((a, b) => b.confidence - a.confidence);
  return boxes.slice(0, 8); // max 8 regionów
}

function classifyRegion(density: number, ar: number): "signature" | "stamp" {
  // Pieczątki: kwadratowe/koliste (ar ≈ 1) + wyższa gęstość obrysu.
  if (Math.abs(ar - 1) < 0.25 && density > 0.3) return "stamp";
  return "signature";
}

function scoreConfidence(density: number, ar: number, frac: number): number {
  const densityScore = 1 - Math.abs(0.3 - density) / 0.3;
  const arScore = 1 - Math.min(1, Math.abs(Math.log(ar)) / Math.log(4));
  const sizeScore = frac < 0.02 ? frac / 0.02 : frac > 0.1 ? (0.15 - frac) / 0.05 : 1;
  return Math.max(0, Math.min(1, (densityScore + arScore + sizeScore) / 3));
}
