"use client";

/**
 * useOcrUpload — React hook orchestrujący OCR pipeline w przeglądarce:
 *
 *   1. Hash pliku (SHA-256)
 *   2. Upload do `ocr-uploads` bucket (signed URL z `createOcrUploadUrlAction`)
 *   3. Tesseract OCR (lokalnie, z progress barem)
 *   4. Submit raw_text do server action `submitOcrResultAction`
 *   5. (opcjonalnie) fallback do Textract gdy `shouldFallbackToTextract`
 *
 * Stan ekspozycji:
 *   - phase: idle | hashing | uploading | ocr | parsing | done | error
 *   - progress: 0..1
 *   - statusMessage: string (np. "Rozpoznawanie tekstu...")
 *   - result: OcrPipelineResult | null
 *   - error: string | null
 */
import { useCallback, useState } from "react";
import {
  ocrFileWithTesseract,
  shouldFallbackToTextract,
} from "./tesseract-client";
import { hashFile } from "./file-hash";
import {
  createOcrUploadUrlAction,
  submitOcrResultAction,
  runServerOcrAction,
} from "./ocr-actions";
import type { OcrIntent, OcrPipelineResult } from "./ocr-types";
import { useCsrfToken } from "@/lib/security/use-csrf";

export type OcrPhase =
  | "idle"
  | "hashing"
  | "uploading"
  | "ocr"
  | "fallback"
  | "parsing"
  | "done"
  | "error";

export interface UseOcrUploadOptions {
  intentHint?: OcrIntent;
  caseId?: string | null;
  /** Pominięcie uploadu do storage (np. test mode) — wtedy file_url = 'inline://...'. */
  skipUpload?: boolean;
}

export interface UseOcrUploadReturn {
  phase: OcrPhase;
  progress: number;
  statusMessage: string;
  result: OcrPipelineResult | null;
  error: string | null;
  reset: () => void;
  run: (file: File) => Promise<OcrPipelineResult | null>;
}

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB (zgodnie z bucketem)

export function useOcrUpload(
  opts: UseOcrUploadOptions = {},
): UseOcrUploadReturn {
  const csrf = useCsrfToken();
  const [phase, setPhase] = useState<OcrPhase>("idle");
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [result, setResult] = useState<OcrPipelineResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setPhase("idle");
    setProgress(0);
    setStatusMessage("");
    setResult(null);
    setError(null);
  }, []);

  const run = useCallback(
    async (file: File): Promise<OcrPipelineResult | null> => {
      setError(null);
      setResult(null);

      try {
        // Validation
        if (file.size > MAX_FILE_SIZE) {
          throw new Error(
            `Plik za duży (${formatMb(file.size)} MB). Limit: 20 MB.`,
          );
        }
        if (!isAcceptedMime(file.type)) {
          throw new Error(
            `Nieobsługiwany typ pliku: ${file.type || "nieznany"}. Akceptujemy PDF, JPG, PNG, WEBP.`,
          );
        }

        // 1) Hash
        setPhase("hashing");
        setStatusMessage("Liczę hash pliku…");
        setProgress(0.05);
        const fileHash = await hashFile(file);

        // 2) Upload (chyba że skipUpload)
        let fileUrl = `inline://${fileHash}`;
        if (!opts.skipUpload) {
          setPhase("uploading");
          setStatusMessage("Wysyłam plik na bezpieczny serwer…");
          setProgress(0.15);

          const upload = await createOcrUploadUrlAction({
            csrf,
            fileName: file.name,
            contentType: file.type || "application/octet-stream",
          });

          const putResp = await fetch(upload.uploadUrl, {
            method: "PUT",
            body: file,
            headers: {
              "Content-Type": file.type || "application/octet-stream",
            },
          });
          if (!putResp.ok) {
            throw new Error(
              `Upload nie powiódł się: ${putResp.status} ${putResp.statusText}`,
            );
          }
          fileUrl = upload.path;
        }

        // 3) Tesseract OCR (lazy import w środku)
        setPhase("ocr");
        setStatusMessage("Rozpoznaję tekst (OCR)…");
        const tessResult = await ocrFileWithTesseract(file, {
          lang: "pol",
          onProgress: (p, status) => {
            setProgress(0.3 + p * 0.5); // 30% → 80%
            if (status) setStatusMessage(`OCR: ${status}`);
          },
        });

        // 4) Decide: submit Tesseract OR fallback do Textract
        const needsFallback = shouldFallbackToTextract(tessResult);
        if (needsFallback) {
          setPhase("fallback");
          setStatusMessage(
            "Skan słabej jakości — używam zaawansowanego OCR (server)…",
          );
          setProgress(0.85);

          // Konwersja file → base64 (max 10MB)
          if (file.size > 10 * 1024 * 1024) {
            // Mimo niskiej jakości — submitujemy Tesseract; user dostaje review.
            const submit = await submitOcrResultAction({
              csrf,
              fileHash,
              fileName: file.name,
              fileSize: file.size,
              mimeType: file.type || "application/octet-stream",
              fileUrl,
              rawText: tessResult.text,
              confidence: tessResult.confidence,
              durationMs: tessResult.durationMs,
              intentHint: opts.intentHint,
              caseId: opts.caseId ?? null,
            });
            setProgress(1);
            setPhase("done");
            setResult(submit);
            return submit;
          }

          const fileBase64 = await fileToBase64(file);
          try {
            const fallback = await runServerOcrAction({
              csrf,
              fileHash,
              fileName: file.name,
              fileBase64,
              mimeType: file.type || "application/octet-stream",
              fileUrl,
              intentHint: opts.intentHint,
              caseId: opts.caseId ?? null,
            });
            setProgress(1);
            setPhase("done");
            setResult(fallback);
            return fallback;
          } catch (e) {
            // Fallback failure — zwracamy Tesseract z flag'ą low_confidence.
            const submit = await submitOcrResultAction({
              csrf,
              fileHash,
              fileName: file.name,
              fileSize: file.size,
              mimeType: file.type || "application/octet-stream",
              fileUrl,
              rawText: tessResult.text,
              confidence: tessResult.confidence,
              durationMs: tessResult.durationMs,
              intentHint: opts.intentHint,
              caseId: opts.caseId ?? null,
            });
            console.warn("[ocr] Textract fallback failed", e);
            setProgress(1);
            setPhase("done");
            setResult(submit);
            return submit;
          }
        }

        // Submit (Tesseract path)
        setPhase("parsing");
        setStatusMessage("Wyciągam dane ze skanu…");
        setProgress(0.9);

        const submit = await submitOcrResultAction({
          csrf,
          fileHash,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type || "application/octet-stream",
          fileUrl,
          rawText: tessResult.text,
          confidence: tessResult.confidence,
          durationMs: tessResult.durationMs,
          intentHint: opts.intentHint,
          caseId: opts.caseId ?? null,
        });

        setProgress(1);
        setStatusMessage("Gotowe.");
        setPhase("done");
        setResult(submit);
        return submit;
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        setError(msg);
        setPhase("error");
        setStatusMessage("");
        return null;
      }
    },
    // Audyt #13 — `csrf` jest używany wewnątrz callbacku (nagłówek CSRF
    // w każdym wywołaniu fetch), więc musi być zależnością useCallback,
    // inaczej zamknięcie przechwytuje nieaktualny token po jego odświeżeniu.
    [opts.intentHint, opts.caseId, opts.skipUpload, csrf],
  );

  return { phase, progress, statusMessage, result, error, reset, run };
}

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

function isAcceptedMime(mime: string): boolean {
  if (!mime) return true; // niektóre przeglądarki nie podają — pozwalamy.
  return (
    mime.startsWith("image/") ||
    mime === "application/pdf" ||
    mime === "image/jpeg" ||
    mime === "image/png" ||
    mime === "image/webp"
  );
}

function formatMb(bytes: number): string {
  return (bytes / (1024 * 1024)).toFixed(1);
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => {
      const result = r.result as string;
      // Strip "data:...;base64," prefix
      const idx = result.indexOf(",");
      resolve(idx >= 0 ? result.slice(idx + 1) : result);
    };
    r.onerror = () => reject(r.error ?? new Error("FileReader error"));
    r.readAsDataURL(file);
  });
}
