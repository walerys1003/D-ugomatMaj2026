"use client";

/**
 * OcrDropzone — drag-and-drop strefa uploadu skanu / PDF.
 *
 * Tarcza ton:
 *   - Spokojna instrukcja ("Upuść plik tutaj…")
 *   - Bez panicznych ostrzeżeń o limitach
 *   - Progress bar z konkretnym statusem ("Rozpoznaję tekst (OCR)…")
 *
 * Akceptowane formaty: PDF, JPG, PNG, WEBP.
 * Limit: 20MB.
 */
import { useCallback, useRef, useState } from "react";
import { motion } from "framer-motion";
import { FileUp, Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { useOcrUpload } from "@/lib/ocr/use-ocr-upload";
import type {
  OcrIntent,
  OcrPipelineResult,
} from "@/lib/ocr/ocr-types";

interface OcrDropzoneProps {
  intentHint?: OcrIntent;
  caseId?: string | null;
  onResult?: (result: OcrPipelineResult) => void;
  className?: string;
  /** Custom CTA text — domyślnie "Upuść skan tutaj lub kliknij, aby wybrać plik". */
  ctaText?: string;
  /** Pozwól na drag-drop wielu plików — w MVP bierzemy pierwszy. */
  allowMultiple?: boolean;
}

export function OcrDropzone({
  intentHint = "unknown",
  caseId = null,
  onResult,
  className,
  ctaText = "Upuść skan tutaj lub kliknij, aby wybrać plik",
  allowMultiple = false,
}: OcrDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const { phase, progress, statusMessage, error, run, reset } = useOcrUpload({
    intentHint,
    caseId,
  });

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;
      const file = files[0];
      const result = await run(file);
      if (result && onResult) onResult(result);
    },
    [run, onResult],
  );

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles],
  );

  const onClick = () => inputRef.current?.click();

  const isWorking = phase !== "idle" && phase !== "done" && phase !== "error";

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div
        role="button"
        tabIndex={0}
        onClick={onClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClick();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        aria-label="Wybierz lub przeciągnij plik do OCR"
        aria-busy={isWorking}
        className={cn(
          "relative flex min-h-[220px] cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed bg-shield-50/40 px-6 py-10 text-center transition-all",
          "border-shield-200 hover:border-shield-400 hover:bg-shield-50",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-shield-500 focus-visible:ring-offset-2",
          isDragging && "border-shield-500 bg-shield-100/60 scale-[1.01]",
          phase === "error" && "border-temporal-red-300 bg-temporal-red-50/50",
          phase === "done" && "border-hope-300 bg-hope-50/50",
          isWorking && "cursor-progress",
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,image/jpeg,image/png,image/webp,image/*"
          multiple={allowMultiple}
          className="sr-only"
          onChange={(e) => handleFiles(e.target.files)}
        />

        {phase === "idle" && (
          <>
            <FileUp className="h-10 w-10 text-shield-500" aria-hidden />
            <div className="space-y-1">
              <p className="text-base font-medium text-shield-900">{ctaText}</p>
              <p className="text-sm text-ink-600">
                JPG, PNG, WEBP &middot; do 20 MB &middot; OCR uruchamia się
                lokalnie (PII chronione)
              </p>
              <p className="text-xs text-ink-500">
                PDF jest obsługiwany przez zaawansowany OCR (pojedyncza strona,
                do 10 MB). Najlepsze wyniki: wyraźne zdjęcie dokumentu.
              </p>
            </div>
          </>
        )}

        {isWorking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex w-full max-w-md flex-col items-center gap-3"
          >
            <Loader2
              className="h-8 w-8 animate-spin text-shield-600"
              aria-hidden
            />
            <p className="text-sm font-medium text-shield-900">
              {statusMessage || "Pracuję…"}
            </p>
            <div
              className="h-2 w-full overflow-hidden rounded-full bg-shield-100"
              role="progressbar"
              aria-valuenow={Math.round(progress * 100)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Postęp OCR"
            >
              <motion.div
                className="h-full bg-shield-500"
                initial={{ width: 0 }}
                animate={{ width: `${Math.round(progress * 100)}%` }}
                transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
            <p className="font-mono text-xs tabular-nums text-ink-500">
              {Math.round(progress * 100)}%
            </p>
          </motion.div>
        )}

        {phase === "done" && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center gap-2"
          >
            <CheckCircle2 className="h-10 w-10 text-hope-600" aria-hidden />
            <p className="text-base font-medium text-shield-900">
              Skan przeanalizowany
            </p>
            <p className="text-sm text-ink-600">
              Sprawdź wyniki poniżej i przejdź do kreatora.
            </p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                reset();
              }}
              className="mt-2 text-xs font-medium text-shield-700 underline-offset-2 hover:underline"
            >
              Wczytaj inny plik
            </button>
          </motion.div>
        )}

        {phase === "error" && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="flex max-w-md flex-col items-center gap-2"
          >
            <AlertTriangle
              className="h-10 w-10 text-temporal-red-500"
              aria-hidden
            />
            <p className="text-base font-medium text-shield-900">
              Nie udało się przetworzyć pliku
            </p>
            <p className="text-sm text-ink-700">{error}</p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                reset();
              }}
              className="mt-2 rounded-md bg-shield-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-shield-700"
            >
              Spróbuj ponownie
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
