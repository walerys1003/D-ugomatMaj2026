import "server-only";

/**
 * Tier 7 zad. 313 — Generation v2: multi-step planning pipeline.
 *
 * Architektura 3-fazowa (vs. v1 1-shot):
 *
 *   1. PLAN  (Sonnet)
 *      - bierze faktyczne dane sprawy + system prompt
 *      - zwraca strukturę: lista sekcji + bullet-points argumentów
 *      - JSON: { sections: [{ heading, bullets[], legal_refs[] }] }
 *      - low temperature (0.2), focus na strukturze
 *
 *   2. WRITE (Haiku, równolegle)
 *      - dla każdej sekcji osobne wywołanie Haiku z planem + faktami
 *      - generuje akapity markdown z cytatami przepisów
 *      - parallel calls (Promise.all) — niższy total latency
 *
 *   3. POLISH (Sonnet)
 *      - bierze złączony output Haiku + plan
 *      - polerruje styl, usuwa powtórzenia, sprawdza spójność
 *      - dodaje formuły końcowe (z poważaniem, podpis, załączniki)
 *
 * Output:
 *   - markdown: pełne pismo
 *   - usage: total tokens (sum 3 faz)
 *   - cost: w PLN (sum 3 faz)
 *   - sections_count, plan_json (do auditu)
 *
 * Cost ~ 1.5x v1, ale jakość znacząco wyższa (subjective + benchmark).
 */

import { complete } from "@/lib/ai/apipod-client";
import { logger } from "@/lib/observability/logger";
import { withSpan } from "@/lib/observability/otel";

export interface GenerationV2Input {
  systemPrompt: string;
  caseFacts: Record<string, unknown>;
  caseType: string;
  desiredSectionsCount?: number;
}

export interface GenerationV2Section {
  heading: string;
  bullets: string[];
  legal_refs: string[];
  generated_md?: string;
}

export interface GenerationV2Plan {
  title: string;
  sections: GenerationV2Section[];
  closing_formula?: string;
}

export interface GenerationV2Result {
  markdown: string;
  plan: GenerationV2Plan;
  total_input_tokens: number;
  total_output_tokens: number;
  total_cost_pln: number;
  duration_ms: number;
  phases: {
    plan_ms: number;
    write_ms: number;
    polish_ms: number;
  };
}

const COST_RATES = {
  // PLN za 1M tokenów (estymata + bufor 10%)
  haiku_input: 1.1, // ~$0.25/1M USD
  haiku_output: 5.5, // ~$1.25/1M USD
  sonnet_input: 13.2, // ~$3/1M USD
  sonnet_output: 66.0, // ~$15/1M USD
};

function estimateCostPln(
  inputTokens: number,
  outputTokens: number,
  model: "haiku" | "sonnet",
): number {
  const inRate = model === "sonnet" ? COST_RATES.sonnet_input : COST_RATES.haiku_input;
  const outRate = model === "sonnet" ? COST_RATES.sonnet_output : COST_RATES.haiku_output;
  return (inputTokens / 1_000_000) * inRate + (outputTokens / 1_000_000) * outRate;
}

// ----- PHASE 1: Plan -----
async function planPhase(input: GenerationV2Input): Promise<{
  plan: GenerationV2Plan;
  inputTokens: number;
  outputTokens: number;
  ms: number;
}> {
  return withSpan("ai.generation_v2.plan", async () => {
    const t0 = Date.now();
    const planPrompt = `
${input.systemPrompt}

ZADANIE: Stwórz STRUKTURALNY PLAN pisma (NIE samo pismo).

Fakty sprawy (typ: ${input.caseType}):
${JSON.stringify(input.caseFacts, null, 2)}

Zwróć WYŁĄCZNIE JSON (bez markdown, bez komentarza):
{
  "title": "tytuł pisma (np. 'Sprzeciw od nakazu zapłaty')",
  "sections": [
    {
      "heading": "nagłówek sekcji (np. 'Stan faktyczny')",
      "bullets": ["punkt argumentu 1", "punkt 2", ...],
      "legal_refs": ["art. 505^36 § 1 k.p.c.", ...]
    }
  ],
  "closing_formula": "z poważaniem / formuła końcowa"
}

Wymagania:
- ${input.desiredSectionsCount ?? 4}-6 sekcji
- każda sekcja 3-5 bullets
- legal_refs muszą być konkretne (numer artykułu + ustawa)
- nie generuj treści akapitów — tylko bullety jako szkielet`.trim();

    const result = await complete({
      systemPrompt: input.systemPrompt,
      messages: [{ role: "user", content: planPrompt }],
      maxTokens: 1500,
      temperature: 0.2,
      role: "generator",
    });

    const cleaned = result.text.replace(/^```(?:json)?\s*/, "").replace(/\s*```\s*$/, "");
    let plan: GenerationV2Plan;
    try {
      plan = JSON.parse(cleaned) as GenerationV2Plan;
    } catch (e) {
      logger.warn("gen_v2.plan_parse_failed", { sample: cleaned.slice(0, 200) });
      throw new Error("Plan JSON parsing failed");
    }

    if (!Array.isArray(plan.sections) || plan.sections.length === 0) {
      throw new Error("Plan has no sections");
    }

    return {
      plan,
      inputTokens: result.tokensInput,
      outputTokens: result.tokensOutput,
      ms: Date.now() - t0,
    };
  });
}

// ----- PHASE 2: Write (parallel per section) -----
async function writeSection(
  systemPrompt: string,
  caseFacts: Record<string, unknown>,
  section: GenerationV2Section,
): Promise<{ md: string; inputTokens: number; outputTokens: number }> {
  const writePrompt = `
${systemPrompt}

Napisz JEDNĄ sekcję pisma — WYŁĄCZNIE markdown akapitów (bez nagłówka,
bez tytułu pisma, bez formuły końcowej).

Nagłówek sekcji: ${section.heading}
Bullety do rozwinięcia:
${section.bullets.map((b, i) => `${i + 1}. ${b}`).join("\n")}

Powołaj się na: ${section.legal_refs.join(", ")}

Fakty sprawy (referencja):
${JSON.stringify(caseFacts, null, 2).slice(0, 1500)}

Wymagania:
- 2-4 akapity, każdy 3-5 zdań
- prawniczy ale klarowny język
- cytuj art. dokładnie (art. X § Y pkt Z)
- BEZ Markdown nagłówków (## itd.) — tylko czysty tekst
- BEZ list numerowanych — pisz akapitami`.trim();

  const result = await complete({
    systemPrompt: systemPrompt,
    messages: [{ role: "user", content: writePrompt }],
    maxTokens: 800,
    temperature: 0.4,
    role: "validator",
  });

  return {
    md: result.text.trim(),
    inputTokens: result.tokensInput,
    outputTokens: result.tokensOutput,
  };
}

async function writePhase(
  input: GenerationV2Input,
  plan: GenerationV2Plan,
): Promise<{
  sectionsWithMd: GenerationV2Section[];
  inputTokens: number;
  outputTokens: number;
  ms: number;
}> {
  return withSpan("ai.generation_v2.write", async () => {
    const t0 = Date.now();
    const results = await Promise.all(
      plan.sections.map((section) =>
        writeSection(input.systemPrompt, input.caseFacts, section),
      ),
    );
    let totalIn = 0;
    let totalOut = 0;
    const enriched = plan.sections.map((s, i) => {
      totalIn += results[i].inputTokens;
      totalOut += results[i].outputTokens;
      return { ...s, generated_md: results[i].md };
    });
    return {
      sectionsWithMd: enriched,
      inputTokens: totalIn,
      outputTokens: totalOut,
      ms: Date.now() - t0,
    };
  });
}

// ----- PHASE 3: Polish -----
async function polishPhase(
  input: GenerationV2Input,
  plan: GenerationV2Plan,
  sectionsWithMd: GenerationV2Section[],
): Promise<{
  finalMd: string;
  inputTokens: number;
  outputTokens: number;
  ms: number;
}> {
  return withSpan("ai.generation_v2.polish", async () => {
    const t0 = Date.now();

    const draft =
      `# ${plan.title}\n\n` +
      sectionsWithMd
        .map((s) => `## ${s.heading}\n\n${s.generated_md ?? ""}`)
        .join("\n\n") +
      (plan.closing_formula ? `\n\n${plan.closing_formula}` : "");

    const polishPrompt = `
${input.systemPrompt}

Otrzymałeś DRAFT pisma w 3 fazach (plan → write → polish).
Twoje zadanie: WYŁĄCZNIE polerowanie.

ZASADY:
1. Usuń powtórzenia argumentów między sekcjami
2. Zachowaj WSZYSTKIE cytaty przepisów (nie usuwaj art. X § Y)
3. Sprawdź spójność (np. te same kwoty/daty w różnych sekcjach)
4. Dopasuj rejestr językowy (formal, prawniczy)
5. Dodaj formułę końcową jeśli brakuje
6. NIE dopisuj nowych argumentów ani faktów
7. NIE skracaj treści — tylko szlifuj

Draft:
${draft}

Zwróć POLEROWANY markdown (bez komentarzy, bez wyjaśnień).`.trim();

    const result = await complete({
      systemPrompt: input.systemPrompt,
      messages: [{ role: "user", content: polishPrompt }],
      maxTokens: 3000,
      temperature: 0.2,
      role: "generator",
    });

    return {
      finalMd: result.text.trim(),
      inputTokens: result.tokensInput,
      outputTokens: result.tokensOutput,
      ms: Date.now() - t0,
    };
  });
}

// ----- Orchestrator -----
export async function runGenerationV2(
  input: GenerationV2Input,
): Promise<GenerationV2Result> {
  const start = Date.now();

  const planResult = await planPhase(input);
  const writeResult = await writePhase(input, planResult.plan);
  const polishResult = await polishPhase(input, planResult.plan, writeResult.sectionsWithMd);

  const totalInput =
    planResult.inputTokens + writeResult.inputTokens + polishResult.inputTokens;
  const totalOutput =
    planResult.outputTokens + writeResult.outputTokens + polishResult.outputTokens;

  const cost =
    estimateCostPln(planResult.inputTokens, planResult.outputTokens, "sonnet") +
    estimateCostPln(writeResult.inputTokens, writeResult.outputTokens, "haiku") +
    estimateCostPln(polishResult.inputTokens, polishResult.outputTokens, "sonnet");

  return {
    markdown: polishResult.finalMd,
    plan: {
      ...planResult.plan,
      sections: writeResult.sectionsWithMd,
    },
    total_input_tokens: totalInput,
    total_output_tokens: totalOutput,
    total_cost_pln: Math.round(cost * 10000) / 10000,
    duration_ms: Date.now() - start,
    phases: {
      plan_ms: planResult.ms,
      write_ms: writeResult.ms,
      polish_ms: polishResult.ms,
    },
  };
}
