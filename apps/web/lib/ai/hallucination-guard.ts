import "server-only";

/**
 * Tier 7 zad. 317 — Hallucination Guard 2.0.
 *
 * Po wygenerowaniu pisma przez Sonnet/Haiku, drugie wywołanie Haiku
 * w trybie "audytora" sprawdza, czy wynik zawiera fakty/twierdzenia
 * NIE wspomniane w wejściu. Każda hallucynacja → flag + propozycja
 * korekty.
 *
 * Wynik:
 *   - hallucinations: lista znalezionych (text + reason + severity)
 *   - confidence: 0..1 (% pewności audytora)
 *   - safe_to_publish: bool (true gdy zero critical hallucinations)
 *
 * Cost: ~1.5x oryginalny generation cost (pełny re-read przez Haiku).
 * Kompromis: critical-only check w fast-path, full check tylko dla
 * pierwszej generacji w danej sesji.
 *
 * Komplementarne do Tier 7 zad. 316 (Citation Verification) — który
 * sprawdza tylko cytaty orzeczeń, nie wszystkie fakty.
 */

import { complete } from "@/lib/ai/apipod-client";
import { logger } from "@/lib/observability/logger";
import { withSpan } from "@/lib/observability/otel";

export type HallucinationSeverity = "low" | "medium" | "high" | "critical";

export interface Hallucination {
  excerpt: string;
  reason: string;
  severity: HallucinationSeverity;
  suggested_fix?: string;
}

export interface HallucinationGuardResult {
  hallucinations: Hallucination[];
  confidence: number;
  safe_to_publish: boolean;
  duration_ms: number;
  audit_tokens_used: number;
}

interface HaikuAuditResponse {
  hallucinations?: Array<{
    excerpt?: string;
    reason?: string;
    severity?: HallucinationSeverity | string;
    suggested_fix?: string;
  }>;
  confidence?: number;
}

const AUDITOR_SYSTEM_PROMPT = `
Jesteś niezależnym audytorem prawniczym. Twoje zadanie: zidentyfikować
WSZYSTKIE fakty/twierdzenia w wygenerowanym tekście, które NIE wynikają
z dostarczonych danych wejściowych (case_facts).

UWAGA — co NIE jest hallucynacją:
- Standardowe formuły procesowe ("z poważaniem", "z wyrazami szacunku")
- Cytaty przepisów (osobno walidowane)
- Powołania na art./orzeczenia (osobno walidowane)
- Logiczne wnioski z faktów (jeśli wynikają z premise → OK)

Co JEST hallucynacją:
- Konkretne kwoty, daty, nazwy NIE występujące w case_facts
- Twierdzenia o faktach historycznych (np. "klient zapłacił już 5000 zł"
  bez podstawy w danych)
- Wymyślone nazwiska świadków, świadczeń, dokumentów
- Nieistniejące cechy umowy nieistniejące w premise

Severity:
- "critical" → fakt kluczowy dla rozstrzygnięcia (kwota, data terminu)
- "high"     → fakt wpływający na argumentację (cecha umowy)
- "medium"   → szczegół peryferyjny ale weryfikowalny
- "low"      → kosmetyczne nieścisłości językowe`.trim();

export async function runHallucinationGuard(params: {
  generatedMarkdown: string;
  caseFacts: Record<string, unknown>;
  fastPath?: boolean;
}): Promise<HallucinationGuardResult> {
  return withSpan("ai.hallucination_guard", async () => {
    const t0 = Date.now();

    const userPrompt = `
Sprawdź poniższy WYGENEROWANY tekst pod kątem hallucynacji vs. dane wejściowe.

DANE WEJŚCIOWE (jedyne źródło prawdy):
${JSON.stringify(params.caseFacts, null, 2)}

WYGENEROWANY TEKST:
${params.generatedMarkdown}

Zwróć WYŁĄCZNIE JSON:
{
  "hallucinations": [
    {
      "excerpt": "dokładny fragment tekstu (max 200 znaków)",
      "reason": "dlaczego to hallucynacja (1 zdanie)",
      "severity": "low" | "medium" | "high" | "critical",
      "suggested_fix": "propozycja korekty (opcjonalne)"
    }
  ],
  "confidence": 0.85
}

Jeśli ZERO hallucynacji → "hallucinations": [].
${params.fastPath ? "FAST PATH: zwróć tylko severity=critical." : ""}`.trim();

    let response: { text: string; usage?: { input_tokens?: number; output_tokens?: number } };
    try {
      response = await complete({
        systemPrompt: AUDITOR_SYSTEM_PROMPT,
        messages: [{ role: "user", content: userPrompt }],
        maxTokens: 1500,
        temperature: 0.0, // deterministyczny audyt
        role: "validator",
      });
    } catch (e) {
      logger.warn("hallucination_guard.complete_failed", {
        error: e instanceof Error ? e.message : String(e),
      });
      // Graceful: zwróć niski confidence + safe_to_publish=false
      return {
        hallucinations: [],
        confidence: 0,
        safe_to_publish: false,
        duration_ms: Date.now() - t0,
        audit_tokens_used: 0,
      };
    }

    const cleaned = response.text
      .replace(/^```(?:json)?\s*/, "")
      .replace(/\s*```\s*$/, "");

    let parsed: HaikuAuditResponse;
    try {
      parsed = JSON.parse(cleaned) as HaikuAuditResponse;
    } catch {
      logger.warn("hallucination_guard.parse_failed", {
        sample: cleaned.slice(0, 200),
      });
      return {
        hallucinations: [],
        confidence: 0.3,
        safe_to_publish: false,
        duration_ms: Date.now() - t0,
        audit_tokens_used:
          (response.usage?.input_tokens ?? 0) + (response.usage?.output_tokens ?? 0),
      };
    }

    const allowed: HallucinationSeverity[] = ["low", "medium", "high", "critical"];
    const hallucinations: Hallucination[] = (parsed.hallucinations ?? [])
      .filter(
        (h) =>
          h &&
          typeof h.excerpt === "string" &&
          h.excerpt.length > 5 &&
          h.excerpt.length < 500 &&
          typeof h.reason === "string",
      )
      .map((h) => ({
        excerpt: h.excerpt as string,
        reason: h.reason as string,
        severity: allowed.includes(h.severity as HallucinationSeverity)
          ? (h.severity as HallucinationSeverity)
          : "medium",
        suggested_fix: h.suggested_fix?.slice(0, 300),
      }))
      .slice(0, 20);

    const hasCritical = hallucinations.some((h) => h.severity === "critical");
    const hasHigh = hallucinations.some((h) => h.severity === "high");

    const confidence =
      typeof parsed.confidence === "number"
        ? Math.max(0, Math.min(1, parsed.confidence))
        : hasCritical
          ? 0.4
          : hasHigh
            ? 0.7
            : 0.95;

    return {
      hallucinations,
      confidence,
      safe_to_publish: !hasCritical && !hasHigh,
      duration_ms: Date.now() - t0,
      audit_tokens_used:
        (response.usage?.input_tokens ?? 0) + (response.usage?.output_tokens ?? 0),
    };
  });
}
