/**
 * Wirtualny sędzia (virtual judge sandbox) — zad. 327
 *
 * Symuluje rozprawę: bierze fakty + dokument użytkownika, generuje:
 *  - prawdopodobne pytania sądu
 *  - prawdopodobne argumenty drugiej strony
 *  - "wstępną ocenę" (advisory only — nie porada prawna)
 *
 * Używa Sonnet (jakość rozumowania ważniejsza niż koszt).
 */

import type { CaseType } from "@/lib/db/types";
import { sendApipodRequest } from "@/lib/ai/apipod-client";
import { logger } from "@/lib/observability/logger";

export interface VirtualJudgeInput {
  case_type: CaseType;
  case_facts: string;
  user_document_markdown?: string;
  opposing_party?: "konsument" | "przedsiebiorca" | "bank" | "windykator" | "skarb_panstwa" | "inny";
}

export interface VirtualJudgeQuestion {
  question: string;
  rationale: string;
  importance: "low" | "medium" | "high";
  suggested_answer_hint?: string;
}

export interface OpponentArgument {
  argument: string;
  counter_response: string;
  strength: "weak" | "moderate" | "strong";
}

export interface VirtualJudgeResult {
  advisory_assessment: string;
  expected_questions: VirtualJudgeQuestion[];
  opponent_arguments: OpponentArgument[];
  recommended_preparation: string[];
  disclaimer: string;
  duration_ms: number;
  cost_pln: number;
}

const SYSTEM_PROMPT = `Jesteś doświadczonym sędzią cywilnym Sądu Rejonowego w Polsce. Twoim zadaniem jest pomóc stronie przygotować się do rozprawy.

ZAŁOŻENIA:
- Polskie prawo cywilne, KPC, kodeks cywilny, ustawy konsumenckie
- NIE udzielasz wiążącej porady prawnej — tylko symulujesz przebieg rozprawy
- Rozumiesz typowe linie obrony/argumentów stron
- Odpowiadasz w języku polskim
- Zachowujesz neutralność (nie kibicujesz żadnej stronie)

FORMAT ODPOWIEDZI: ścisły JSON, bez markdown, bez wstępu:
{
  "advisory_assessment": "krótka ocena szans i kluczowych ryzyk (max 200 słów)",
  "expected_questions": [
    {"question": "...", "rationale": "...", "importance": "low|medium|high", "suggested_answer_hint": "..."}
  ],
  "opponent_arguments": [
    {"argument": "...", "counter_response": "...", "strength": "weak|moderate|strong"}
  ],
  "recommended_preparation": ["punkt 1", "punkt 2", ...]
}

Limit: max 6 pytań, max 5 argumentów drugiej strony, max 6 punktów przygotowania.`;

const SONNET_INPUT_PRICE_PLN_PER_MTOK = 13.2;
const SONNET_OUTPUT_PRICE_PLN_PER_MTOK = 66.0;

export async function runVirtualJudge(input: VirtualJudgeInput): Promise<VirtualJudgeResult> {
  const startedAt = Date.now();

  const userPrompt = `Sprawa: ${input.case_type}
Strona przeciwna: ${input.opposing_party ?? "nieokreślona"}

FAKTY (od strony użytkownika):
${input.case_facts}

${
  input.user_document_markdown
    ? `DOKUMENT UŻYTKOWNIKA (np. sprzeciw, pozew, odpowiedź):\n${input.user_document_markdown.slice(0, 8000)}`
    : ""
}

Zwróć JSON z symulacją rozprawy. Pytania powinny być realistyczne dla polskiego sądu cywilnego.`;

  let parsed: Omit<VirtualJudgeResult, "disclaimer" | "duration_ms" | "cost_pln"> = {
    advisory_assessment: "Nie udało się przeprowadzić symulacji.",
    expected_questions: [],
    opponent_arguments: [],
    recommended_preparation: [],
  };
  let cost_pln = 0;

  try {
    const resp = await sendApipodRequest({
      model: "claude-sonnet-4-5",
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
      max_tokens: 2500,
      temperature: 0.4,
    });
    const text = resp.content?.[0]?.text ?? "{}";
    const inputTokens = resp.usage?.input_tokens ?? 0;
    const outputTokens = resp.usage?.output_tokens ?? 0;
    cost_pln =
      (inputTokens / 1_000_000) * SONNET_INPUT_PRICE_PLN_PER_MTOK +
      (outputTokens / 1_000_000) * SONNET_OUTPUT_PRICE_PLN_PER_MTOK;

    // Strip codefence if present
    const cleaned = text.replace(/```json\s*/i, "").replace(/```\s*$/i, "").trim();
    try {
      const json = JSON.parse(cleaned);
      parsed = {
        advisory_assessment: String(json.advisory_assessment ?? "").slice(0, 4000),
        expected_questions: Array.isArray(json.expected_questions)
          ? json.expected_questions.slice(0, 6).map((q: any) => ({
              question: String(q.question ?? "").slice(0, 500),
              rationale: String(q.rationale ?? "").slice(0, 500),
              importance: (["low", "medium", "high"] as const).includes(q.importance) ? q.importance : "medium",
              suggested_answer_hint: q.suggested_answer_hint ? String(q.suggested_answer_hint).slice(0, 400) : undefined,
            }))
          : [],
        opponent_arguments: Array.isArray(json.opponent_arguments)
          ? json.opponent_arguments.slice(0, 5).map((a: any) => ({
              argument: String(a.argument ?? "").slice(0, 500),
              counter_response: String(a.counter_response ?? "").slice(0, 600),
              strength: (["weak", "moderate", "strong"] as const).includes(a.strength) ? a.strength : "moderate",
            }))
          : [],
        recommended_preparation: Array.isArray(json.recommended_preparation)
          ? json.recommended_preparation.slice(0, 6).map((p: any) => String(p).slice(0, 300))
          : [],
      };
    } catch (err) {
      logger.warn("virtual_judge.parse_failed", { error: (err as Error).message });
    }
  } catch (err) {
    logger.warn("virtual_judge.api_failed", { error: (err as Error).message });
  }

  return {
    ...parsed,
    disclaimer:
      "To symulacja oparta na AI — nie stanowi porady prawnej. Rzeczywiste rozprawy mogą przebiegać inaczej. W sprawach o znacznej wartości skonsultuj się z radcą prawnym.",
    duration_ms: Date.now() - startedAt,
    cost_pln: Math.round(cost_pln * 10000) / 10000,
  };
}
