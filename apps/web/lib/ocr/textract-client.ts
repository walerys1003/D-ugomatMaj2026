import "server-only";

/**
 * AWS Textract — server-side OCR fallback (Tier 3.3).
 *
 * Używamy Textracta gdy Tesseract zwróci confidence < 60% lub brak anchor-words.
 * Textract jest płatny (~$1.50 / 1000 stron), więc traktujemy go jako fallback,
 * NIE jako default.
 *
 * Implementacja:
 *   - Wywołanie przez `@aws-sdk/client-textract` (DetectDocumentText dla pojedynczych
 *     skanów, AnalyzeDocument dla bardziej złożonych — w MVP używamy tylko pierwszego)
 *   - Credentials z env: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION
 *   - Jeśli env brak — rzucamy TextractUnavailableError, caller robi graceful degrade
 *     (zwraca wynik Tesseracta nawet jeśli słaby — z flagą `low_confidence`)
 *
 * Bezpieczeństwo:
 *   - File buffer leci do AWS — w polityce prywatności musimy zaznaczyć
 *     "OCR fallback przez AWS Textract (Frankfurt, eu-central-1)"
 *   - Limit 20MB (zgodnie z bucketem `ocr-uploads`)
 */
import type { OcrLine, OcrPage, OcrRawResult } from "./ocr-types";

export class TextractUnavailableError extends Error {
  override name = "TextractUnavailableError" as const;
}

interface TextractEnv {
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
}

function getEnv(): TextractEnv {
  const region = process.env.AWS_REGION ?? "eu-central-1";
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  if (!accessKeyId || !secretAccessKey) {
    throw new TextractUnavailableError(
      "AWS credentials brakuje — fallback Textract niedostępny.",
    );
  }
  return { region, accessKeyId, secretAccessKey };
}

/**
 * Wykonuje OCR na buffer'ze pliku przez AWS Textract DetectDocumentText.
 *
 * Limit: dokument <= 10MB (sync API). Większe pliki wymagałyby AsyncJob —
 * w MVP odrzucamy je z komunikatem "Plik za duży — skompresuj do 10MB".
 */
export async function ocrFileWithTextract(
  buffer: Uint8Array | ArrayBuffer,
  filename: string,
): Promise<OcrRawResult> {
  const start = Date.now();
  const bytes = buffer instanceof ArrayBuffer ? new Uint8Array(buffer) : buffer;

  if (bytes.byteLength > 10 * 1024 * 1024) {
    throw new TextractUnavailableError(
      `Plik ${filename} jest większy niż 10MB — Textract sync API nie obsługuje. Skompresuj plik.`,
    );
  }

  const env = getEnv();

  // Lazy import — sdk jest ciężki, ładujemy tylko gdy fallback faktycznie potrzebny.
  const { TextractClient, DetectDocumentTextCommand } = await import(
    "@aws-sdk/client-textract"
  );

  const client = new TextractClient({
    region: env.region,
    credentials: {
      accessKeyId: env.accessKeyId,
      secretAccessKey: env.secretAccessKey,
    },
  });

  const cmd = new DetectDocumentTextCommand({
    Document: { Bytes: bytes },
  });

  const resp = await client.send(cmd);

  const lines: OcrLine[] = (resp.Blocks ?? [])
    .filter((b) => b.BlockType === "LINE" && b.Text)
    .map((b) => ({
      text: b.Text ?? "",
      confidence: Number(b.Confidence ?? 0),
      bbox: b.Geometry?.BoundingBox
        ? {
            x0: b.Geometry.BoundingBox.Left ?? 0,
            y0: b.Geometry.BoundingBox.Top ?? 0,
            x1:
              (b.Geometry.BoundingBox.Left ?? 0) +
              (b.Geometry.BoundingBox.Width ?? 0),
            y1:
              (b.Geometry.BoundingBox.Top ?? 0) +
              (b.Geometry.BoundingBox.Height ?? 0),
          }
        : undefined,
    }));

  const text = lines.map((l) => l.text).join("\n");
  const conf =
    lines.length === 0
      ? 0
      : lines.reduce((s, l) => s + l.confidence, 0) / lines.length;

  const page: OcrPage = {
    index: 0,
    text,
    confidence: conf,
    lines,
  };

  return {
    provider: "textract",
    pages: [page],
    text,
    confidence: conf,
    durationMs: Date.now() - start,
  };
}

export function isTextractAvailable(): boolean {
  return Boolean(
    process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY,
  );
}
