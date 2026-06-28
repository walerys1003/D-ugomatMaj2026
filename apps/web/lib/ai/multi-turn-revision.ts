import "server-only";

/**
 * Tier 7 zad. 318 — Multi-turn revision.
 *
 * Pozwala userowi prosić o korektę istniejącego dokumentu w trybie
 * konwersacyjnym ("popraw uzasadnienie do drugiego zarzutu o klauzule
 * abuzywne", "skróć całość do 2 stron", "dodaj zarzut przedawnienia").
 *
 * Architektura:
 *   - input: aktualne markdown + instrukcja w naturalnym języku
 *   - Sonnet otrzymuje: instrukcja + dokument + kontekst sprawy
 *   - output: zmodyfikowane markdown + diff_summary
 *
 * Każda rewizja tworzy nową wersję w `document_versions` (source='ai_revision').
 * Klient widzi diff (Tier 7 zad. 319) i może accept/reject per akapit.
 */

import { complete } from "@/lib/ai/apipod-client";
import { logger } from "@/lib/observability/logger";
import { withSpan } from "@/lib/observability/otel";
import { saveDocumentVersion } from "@/lib/documents/versioning";
import { diffParagraphs, summarizeDiff } from "@/lib/documents/versioning";

export interface RevisionInput {
  caseId: string;
  documentId?: string | null;
  parentVersionId?: string | null;
  currentMarkdown: string;
  instruction: string;
  caseType: string;
  caseFacts: Record<string, unknown>;
  userId?: string;
}

export interface RevisionResult {
  newMarkdown: string;
  diffSummary: string;
  versionId: string | null;
  inputTokens: number;
  outputTokens: number;
  durationMs: number;
}

const REVISION_SYSTEM_PROMPT = `
Jesteś polskim radcą prawnym. Twoje zadanie: WYKONAJ DOKŁADNIE polecenie
użytkownika dotyczące korekty istniejącego pisma procesowego.

ZASADY:
1. Zachowaj strukturę dokumentu (nagłówki, sekcje), chyba że user prosi o ich zmianę
2. Zachowaj WSZYSTKIE cytaty przepisów (nie usuwaj art. X § Y bez wyraźnego polecenia)
3. Nie dodawaj nowych faktów spoza case_facts
4. Pisz prawniczo, klarownie, po polsku
5. Output: TYLKO finalny markdown (bez wyjaśnień, bez komentarza)`.trim();

export async function runRevision(input: RevisionInput): Promise<RevisionResult> {
  return withSpan("ai.revision", async () => {
    const t0 = Date.now();

    const userPrompt = `
Typ sprawy: ${input.caseType}

Fakty sprawy (referencja, jedyne źródło prawdy):
${JSON.stringify(input.caseFacts, null, 2).slice(0, 2500)}

POLECENIE UŻYTKOWNIKA:
${input.instruction}

AKTUALNY DOKUMENT:
${input.currentMarkdown}

Wykonaj polecenie i zwróć ZAKTUALIZOWANY pełny markdown dokumentu.`.trim();

    let result: { text: string; usage?: { input_tokens?: number; output_tokens?: number } };
    try {
      result = await complete({
        systemPrompt: REVISION_SYSTEM_PROMPT,
        messages: [{ role: "user", content: userPrompt }],
        maxTokens: 4000,
        temperature: 0.3,
        role: "generator",
      });
    } catch (e) {
      logger.warn("revision.complete_failed", {
        caseId: input.caseId,
        error: e instanceof Error ? e.message : String(e),
      });
      throw e;
    }

    const newMarkdown = result.text.trim();

    // Compute diff summary
    const diff = diffParagraphs(input.currentMarkdown, newMarkdown);
    const diffSummary = summarizeDiff(diff);

    // Persist new version
    const version = await saveDocumentVersion({
      caseId: input.caseId,
      documentId: input.documentId ?? null,
      source: "ai_revision",
      contentMd: newMarkdown,
      parentId: input.parentVersionId ?? null,
      diffSummary: `Rewizja: "${input.instruction.slice(0, 100)}" → ${diffSummary}`,
      createdBy: input.userId ?? null,
    });

    return {
      newMarkdown,
      diffSummary,
      versionId: version?.id ?? null,
      inputTokens: result.usage?.input_tokens ?? 0,
      outputTokens: result.usage?.output_tokens ?? 0,
      durationMs: Date.now() - t0,
    };
  });
}
