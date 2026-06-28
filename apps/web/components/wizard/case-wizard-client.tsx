"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { generateDocumentFromWizardAction } from "@/lib/documents/document-actions";
import { useCsrfToken } from "@/lib/security/use-csrf";
import { getWizardDefinition } from "@/lib/wizard/wizard-registry";
import type { CaseType, WizardState } from "@/lib/db/types";

import { WizardShell } from "./wizard-shell";
import { GenerationOverlay } from "./generation-overlay";

interface Props {
  caseId: string;
  caseType: CaseType;
  wizardState: WizardState;
}

/**
 * Client wrapper łączy `WizardShell` z server action generującym dokument.
 *
 * Po ostatnim kroku:
 *   1) pokazujemy `GenerationOverlay` (5-fazowy progress AI),
 *   2) wywołujemy `generateDocumentFromWizardAction(caseId)` — pipeline AI
 *      (Sonnet→Haiku→Opus) z fallbackiem do Tier 2 static template,
 *   3) bumpujemy revalidation,
 *   4) router.refresh() — server component pokaże PostGenerationView
 *      z odpowiednim badge'em (AI vs static + validation score).
 */
export function CaseWizardClient({
  caseId,
  caseType,
  wizardState,
}: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const csrf = useCsrfToken();

  const definition = getWizardDefinition(caseType);
  if (!definition) {
    return (
      <div className="rounded-xl border border-warn-300 bg-warn-100/40 p-4 text-fluid-sm text-warn-800 dark:border-warn-500/30 dark:bg-warn-500/10 dark:text-warn-100">
        Kreator dla tego modułu zostanie aktywowany w kolejnym etapie. Twoje
        dane są bezpiecznie zachowane jako szkic.
      </div>
    );
  }

  return (
    <>
      <WizardShell
        definition={definition}
        snapshot={{ caseId, caseType, state: wizardState }}
        onSubmit={async () => {
          setError(null);
          if (!csrf) {
            setError("Inicjalizacja sesji — odśwież stronę i spróbuj ponownie.");
            return;
          }
          setIsGenerating(true);
          try {
            // Tier 5 zad. 203 — przekazujemy CSRF token do server action.
            await generateDocumentFromWizardAction(caseId, csrf);
            startTransition(() => {
              router.refresh();
            });
          } catch (e) {
            setError(e instanceof Error ? e.message : String(e));
            setIsGenerating(false);
          }
        }}
      />
      <GenerationOverlay isOpen={isGenerating} />
      {error && (
        <div
          role="alert"
          className="mt-4 rounded-lg border border-temporal-red-300 bg-temporal-red-50 p-3 text-fluid-sm text-temporal-red-800"
        >
          <p className="font-medium">Coś poszło nie tak podczas generacji.</p>
          <p className="mt-1">{error}</p>
          <p className="mt-2 text-fluid-xs text-temporal-red-700">
            Spróbuj ponownie — Twoje dane są zapisane.
          </p>
        </div>
      )}
    </>
  );
}
