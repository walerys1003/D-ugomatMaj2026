"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { saveWizardAction } from "@/lib/cases/case-actions";
import { useCsrfToken } from "@/lib/security/use-csrf";
import type { WizardState } from "@/lib/db/types";

export type AutosaveStatus = "idle" | "saving" | "saved" | "error";

interface Options {
  caseId: string;
  /** debounce ms before persisting (default 800). */
  debounceMs?: number;
}

/**
 * Hook do auto-zapisywania stanu kreatora w sprawie.
 *
 *   const { save, status, lastSavedAt } = useWizardAutosave({ caseId });
 *   await save(nextState);
 *
 * Implementacja debounce'uje wywołania (kolejne zmiany w ciągu 800 ms
 * łączą się), zwraca status do wskaźnika "Zapisano · 12:34" w UI.
 */
export function useWizardAutosave({ caseId, debounceMs = 800 }: Options) {
  const [status, setStatus] = useState<AutosaveStatus>("idle");
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const csrf = useCsrfToken();
  const pendingRef = useRef<WizardState | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inflightRef = useRef<boolean>(false);

  const flush = useCallback(async () => {
    const next = pendingRef.current;
    if (!next || inflightRef.current) return;
    // Zaczekaj na CSRF token po hydracji — bez niego server zwróci 403.
    if (!csrf) return;
    inflightRef.current = true;
    setStatus("saving");
    try {
      const result = await saveWizardAction({ caseId, wizardState: next, csrf });
      pendingRef.current = null;
      setLastSavedAt(result.savedAt);
      setStatus("saved");
      setError(null);
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Zapis nie powiódł się.");
    } finally {
      inflightRef.current = false;
      // jeżeli w międzyczasie pojawił się nowy stan — flush again
      if (pendingRef.current) {
        void flush();
      }
    }
  }, [caseId, csrf]);

  const save = useCallback(
    (next: WizardState) => {
      pendingRef.current = next;
      setStatus("saving");
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        void flush();
      }, debounceMs);
    },
    [flush, debounceMs],
  );

  // Flush on unmount — żeby nie zgubić ostatniego kroku
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (pendingRef.current) {
        void flush();
      }
    };
  }, [flush]);

  return { save, flush, status, lastSavedAt, error };
}
