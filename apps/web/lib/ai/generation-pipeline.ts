import "server-only";

/**
 * AI generation pipeline — pełen flow:
 *
 *   variables (z wizard answers) →
 *     load active prompt template →
 *     RAG retrieve relevant chunks →
 *     compose system + user prompt →
 *     Sonnet 4.5 (generator) →
 *     Haiku 4.5 (validator) →
 *     [if score < 70] Opus 4.5 (escalator) →
 *     return final markdown + metrics
 *
 * Wszystkie błędy LLM są łapane — w razie pełnej awarii pipeline
 * rzuca `AiUnavailableError`, którą wyższy poziom (document-actions.ts)
 * łapie i fallbackuje na Tier 2 static template.
 */
import {
  AiUnavailableError,
  complete,
  completeStreaming,
  type CompletionResponse,
} from "./apipod-client";
import { models } from "./models";
import { formatRagContext, retrieveContext, type RagContext } from "./rag-retriever";
import {
  loadActivePromptTemplate,
  renderPrompt,
  validateRequiredVariables,
  PromptNotFoundError,
} from "./prompt-loader";
import {
  assertWithinBudget,
  BudgetExceededError,
} from "./token-tracker";
import type { CaseType, PromptTemplateRow } from "@/lib/db/types";

// -----------------------------------------------------------------------------
// Public types
// -----------------------------------------------------------------------------
export interface GenerationInput {
  caseType: CaseType;
  /** Zmienne z wizard.answers + caseRow (po dispatch w document-actions). */
  variables: Record<string, unknown>;
  /** Query do RAG retriever — domyślnie pełny system+user prompt. */
  ragQuery?: string;
  /** Tags filter dla TF-IDF fallbacku (np. ['ai-engine','modules']). */
  ragTags?: string[];
  /** Pomiń walidację Haiku (np. szybki preview). */
  skipValidation?: boolean;
  /** Tier 3 zad. 109/110 — sprawdź budżet user/case przed wywołaniem. */
  userId?: string;
  caseId?: string;
}

export interface GenerationResult {
  markdown: string;
  modelId: string;
  tokensInput: number;
  tokensOutput: number;
  costUsd: number;
  durationMs: number;
  validation: ValidationResult | null;
  ragSource: RagContext["source"];
  promptHash: string;
  /** Wersja modelu po ewentualnej eskalacji ('generator' | 'escalator'). */
  finalRole: "generator" | "escalator";
}

export interface ValidationResult {
  pass: boolean;
  score: number; // 0..100
  issues: ValidationIssue[];
  raw: string;
  modelId: string;
  tokensInput: number;
  tokensOutput: number;
  costUsd: number;
  durationMs: number;
}

export interface ValidationIssue {
  category: "missing" | "incorrect" | "style" | "legal";
  severity: "low" | "medium" | "high";
  message: string;
  hint?: string;
}

// -----------------------------------------------------------------------------
// Validation prompts (system-side checklist) — szczegółowo udokumentowane,
// by Haiku miał deterministyczny output.
// -----------------------------------------------------------------------------
const VALIDATOR_SYSTEM_PROMPT = `Jesteś prawnikiem-walidatorem. Otrzymujesz pismo procesowe wygenerowane przez innego prawnika oraz dane wejściowe użytkownika. Twoim zadaniem jest sprawdzenie pisma według poniższej listy kontrolnej i zwrócenie wyłącznie poprawnego JSON-a.

## Lista kontrolna
1. **Kompletność danych** — pismo zawiera: oznaczenie sądu, sygnaturę, dane stron, datę, podpis.
2. **Petitum** — sformułowane w I osobie, zawiera precyzyjne wnioski (np. uchylenie nakazu, oddalenie powództwa).
3. **Uzasadnienie** — co najmniej 2 akapity z cytatami przepisów (np. art. 503 § 1 k.p.c., art. 117 k.c.).
4. **Zgodność z danymi wejściowymi** — kwoty, sygnatury, daty zgadzają się z input variables.
5. **Język** — formalny, polski, bez błędów gramatycznych, bez wulgaryzmów.
6. **Brak halucynacji** — pismo nie cytuje nieistniejących artykułów ani nie podaje danych spoza variables.

## Format odpowiedzi (WYŁĄCZNIE poprawny JSON, bez prefiksów Markdown)
{
  "pass": boolean,        // true tylko gdy score >= 70
  "score": int 0-100,
  "issues": [
    {
      "category": "missing"|"incorrect"|"style"|"legal",
      "severity": "low"|"medium"|"high",
      "message": "...",
      "hint": "opcjonalna sugestia naprawy"
    }
  ]
}`;

// -----------------------------------------------------------------------------
// Public entry point
// -----------------------------------------------------------------------------
export async function runGenerationPipeline(
  input: GenerationInput,
): Promise<GenerationResult> {
  // 0) Budget guardrail (Tier 3 zad. 109/110) — sprawdzamy budżet PRZED pipeline
  if (input.userId) {
    try {
      await assertWithinBudget({ userId: input.userId, caseId: input.caseId });
    } catch (err) {
      if (err instanceof BudgetExceededError) {
        // Konwertujemy na AiUnavailableError, by warstwa wyżej fallbackowała
        // na Tier 2 static template (zamiast pokazywać błąd 500).
        throw new AiUnavailableError(err.message, err);
      }
      throw err;
    }
  }

  // 1) Load active prompt template
  const template = await loadActivePromptTemplate(input.caseType);

  // 2) Validate required variables
  const check = validateRequiredVariables(template, input.variables);
  if (!check.ok) {
    throw new AiUnavailableError(
      `Brakujące pola: ${check.missing.join(", ")}. Wróć do kreatora i uzupełnij.`,
    );
  }

  // 3) RAG context
  const ragQuery =
    input.ragQuery ??
    `${input.caseType} ${Object.values(input.variables).slice(0, 6).join(" ")}`;
  const rag = await retrieveContext(ragQuery, {
    k: 5,
    tags: input.ragTags,
  });

  // 4) Compose prompts
  const userPrompt = renderPrompt(template.user_prompt_template, input.variables);
  const ragBlock = formatRagContext(rag);
  const finalUserPrompt = ragBlock
    ? `${ragBlock}\n\n---\n\n${userPrompt}`
    : userPrompt;

  // 5) Generate (Sonnet)
  let generation = await complete({
    role: "generator",
    systemPrompt: template.system_prompt,
    messages: [{ role: "user", content: finalUserPrompt }],
    temperature: Number(template.temperature),
    maxTokens: template.max_tokens,
  });

  let validation: ValidationResult | null = null;
  let finalRole: "generator" | "escalator" = "generator";

  // 6) Validate (Haiku)
  if (!input.skipValidation) {
    validation = await runValidator(generation.text, input.variables);

    // 7) Escalate to Opus if score < 70
    if (validation.score < 70) {
      const escalated = await complete({
        role: "escalator",
        systemPrompt:
          template.system_prompt +
          "\n\nUWAGA: Poprzednia wersja pisma uzyskała niski wynik walidacji. " +
          "Popraw treść z uwzględnieniem zgłoszonych zastrzeżeń: " +
          validation.issues.map((i) => `- ${i.message}`).join("\n"),
        messages: [
          { role: "user", content: finalUserPrompt },
          { role: "assistant", content: generation.text },
          {
            role: "user",
            content:
              "Zwróć poprawioną wersję pisma. Zachowaj format Markdown. " +
              "Nie dodawaj komentarzy do edycji — tylko gotowe pismo.",
          },
        ],
        temperature: Number(template.temperature),
        maxTokens: template.max_tokens,
      });
      generation = escalated;
      finalRole = "escalator";

      // Re-walidacja po eskalacji (best effort — nie blokujemy)
      try {
        validation = await runValidator(escalated.text, input.variables);
      } catch {
        // ignore — i tak zwracamy lepszą wersję niż pierwsza
      }
    }
  }

  // 8) Compose result
  return {
    markdown: postProcessMarkdown(generation.text),
    modelId: generation.modelId,
    tokensInput: generation.tokensInput,
    tokensOutput: generation.tokensOutput,
    costUsd: generation.costUsd,
    durationMs: generation.durationMs,
    validation,
    ragSource: rag.source,
    promptHash: hashPrompt(template, input.variables),
    finalRole,
  };
}

// -----------------------------------------------------------------------------
// Audyt #17 — Prawdziwy streaming generacji (per-token SSE)
//
// `runGenerationPipeline` jest blokujący: czeka na pełny output Sonneta,
// potem (opcjonalnie) Haiku + Opus, a UI dostaje "soft-stream" (dzielenie
// gotowego tekstu na akapity). User widzi heartbeat przez kilkadziesiąt
// sekund → percepcja zawieszenia.
//
// Ta wersja streamuje FAZĘ GENERATORA prawdziwie (per-token przez
// `completeStreaming`), wołając `onDelta` na każdy fragment. Walidacja
// (Haiku) i ewentualna eskalacja (Opus) wykonują się PO zakończeniu
// streamu — wynik walidacji emitujemy jako osobny event. Gdy backend nie
// wspiera SSE, `completeStreaming` sam degraduje do non-streaming (fallback
// zachowany). Budżet i RAG działają identycznie jak w wersji blokującej.
// -----------------------------------------------------------------------------
export interface StreamingPipelineCallbacks {
  /** Wołane na każdy fragment tekstu z generatora (prawdziwy per-token). */
  onDelta: (text: string) => void | Promise<void>;
}

export async function runGenerationPipelineStreaming(
  input: GenerationInput,
  callbacks: StreamingPipelineCallbacks,
): Promise<GenerationResult> {
  const startedAt = Date.now();

  // 0) Budget guardrail — identycznie jak w wersji blokującej.
  if (input.userId) {
    try {
      await assertWithinBudget({ userId: input.userId, caseId: input.caseId });
    } catch (err) {
      if (err instanceof BudgetExceededError) {
        throw new AiUnavailableError(err.message, err);
      }
      throw err;
    }
  }

  // 1-4) Template + walidacja zmiennych + RAG + kompozycja promptu.
  const template = await loadActivePromptTemplate(input.caseType);
  const check = validateRequiredVariables(template, input.variables);
  if (!check.ok) {
    throw new AiUnavailableError(
      `Brakujące pola: ${check.missing.join(", ")}. Wróć do kreatora i uzupełnij.`,
    );
  }
  const ragQuery =
    input.ragQuery ??
    `${input.caseType} ${Object.values(input.variables).slice(0, 6).join(" ")}`;
  const rag = await retrieveContext(ragQuery, { k: 5, tags: input.ragTags });
  const userPrompt = renderPrompt(template.user_prompt_template, input.variables);
  const ragBlock = formatRagContext(rag);
  const finalUserPrompt = ragBlock
    ? `${ragBlock}\n\n---\n\n${userPrompt}`
    : userPrompt;

  // 5) Generator — PRAWDZIWY streaming. Zbieramy pełny tekst do walidacji,
  // ale każdy fragment od razu trafia do klienta przez onDelta.
  let fullText = "";
  let tokensInput = 0;
  let tokensOutput = 0;
  let costUsd = 0;
  let streamErrored = false;

  for await (const chunk of completeStreaming({
    role: "generator",
    systemPrompt: template.system_prompt,
    messages: [{ role: "user", content: finalUserPrompt }],
    temperature: Number(template.temperature),
    maxTokens: template.max_tokens,
  })) {
    if (chunk.type === "delta" && chunk.delta) {
      fullText += chunk.delta;
      await callbacks.onDelta(chunk.delta);
    } else if (chunk.type === "done") {
      tokensInput = chunk.tokensInput ?? tokensInput;
      tokensOutput = chunk.tokensOutput ?? tokensOutput;
      costUsd = chunk.costUsd ?? costUsd;
    } else if (chunk.type === "error") {
      streamErrored = true;
    }
  }

  if (streamErrored && fullText.trim().length === 0) {
    throw new AiUnavailableError(
      "Streaming generacji nie powiódł się i brak treści fallbacku.",
    );
  }

  const modelId = models.generator.id;
  let validation: ValidationResult | null = null;
  let finalRole: "generator" | "escalator" = "generator";

  // 6) Walidacja PO streamie (Haiku). Wynik emitujemy osobnym eventem w route.
  if (!input.skipValidation) {
    validation = await runValidator(fullText, input.variables);

    // 7) Eskalacja do Opus przy score < 70 — tu już bez streamingu (rzadka
    // ścieżka; poprawiony tekst zastępuje treść). UI dostanie sygnał przez
    // event 'validation', a finalRole='escalator'.
    if (validation.score < 70) {
      const escalated = await complete({
        role: "escalator",
        systemPrompt:
          template.system_prompt +
          "\n\nUWAGA: Poprzednia wersja pisma uzyskała niski wynik walidacji. " +
          "Popraw treść z uwzględnieniem zgłoszonych zastrzeżeń: " +
          validation.issues.map((i) => `- ${i.message}`).join("\n"),
        messages: [
          { role: "user", content: finalUserPrompt },
          { role: "assistant", content: fullText },
          {
            role: "user",
            content:
              "Zwróć poprawioną wersję pisma. Zachowaj format Markdown. " +
              "Nie dodawaj komentarzy do edycji — tylko gotowe pismo.",
          },
        ],
        temperature: Number(template.temperature),
        maxTokens: template.max_tokens,
      });
      fullText = escalated.text;
      tokensInput += escalated.tokensInput;
      tokensOutput += escalated.tokensOutput;
      costUsd += escalated.costUsd;
      finalRole = "escalator";
      try {
        validation = await runValidator(escalated.text, input.variables);
      } catch {
        /* ignore — i tak zwracamy lepszą wersję niż pierwsza */
      }
    }
  }

  return {
    markdown: postProcessMarkdown(fullText),
    modelId,
    tokensInput,
    tokensOutput,
    costUsd,
    durationMs: Date.now() - startedAt,
    validation,
    ragSource: rag.source,
    promptHash: hashPrompt(template, input.variables),
    finalRole,
  };
}

// -----------------------------------------------------------------------------
// Validator — Haiku
// -----------------------------------------------------------------------------
async function runValidator(
  pismoMarkdown: string,
  variables: Record<string, unknown>,
): Promise<ValidationResult> {
  const userPrompt = [
    "## Pismo do walidacji",
    pismoMarkdown,
    "",
    "## Dane wejściowe",
    JSON.stringify(variables, null, 2),
  ].join("\n");

  const resp = await complete({
    role: "validator",
    systemPrompt: VALIDATOR_SYSTEM_PROMPT,
    messages: [{ role: "user", content: userPrompt }],
    temperature: 0.0,
    maxTokens: 1024,
  });

  return parseValidatorResponse(resp);
}

function parseValidatorResponse(resp: CompletionResponse): ValidationResult {
  let parsed: {
    pass?: boolean;
    score?: number;
    issues?: ValidationIssue[];
  } = {};
  try {
    // Haiku czasem dorzuca ```json ``` — wycinamy.
    const cleaned = resp.text.replace(/^```json\s*|```\s*$/g, "").trim();
    parsed = JSON.parse(cleaned) as typeof parsed;
  } catch {
    // jeśli niedeterministyczny output — przyznaj średni score, by nie
    // blokować flow, ale flag'uj issue
    parsed = {
      pass: false,
      score: 50,
      issues: [
        {
          category: "style",
          severity: "low",
          message: "Validator zwrócił nieparowalną odpowiedź (parse error).",
        },
      ],
    };
  }

  const score = clamp(Number(parsed.score ?? 0), 0, 100);
  return {
    pass: parsed.pass === true && score >= 70,
    score,
    issues: parsed.issues ?? [],
    raw: resp.text,
    modelId: resp.modelId,
    tokensInput: resp.tokensInput,
    tokensOutput: resp.tokensOutput,
    costUsd: resp.costUsd,
    durationMs: resp.durationMs,
  };
}

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------
function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function postProcessMarkdown(text: string): string {
  // Sonnet czasem owija pismo w fence ```markdown ... ``` — wycinamy.
  let out = text.trim();
  out = out.replace(/^```(?:markdown|md)?\s*/i, "");
  out = out.replace(/```\s*$/i, "");
  return out.trim();
}

function hashPrompt(
  template: PromptTemplateRow,
  variables: Record<string, unknown>,
): string {
  // Deterministyczny digest BEZ surowych danych userskich (PII-safe).
  const keys = Object.keys(variables).sort().join(",");
  return `tpl:${template.case_type}:${template.variant}:v${template.version}|vars:${keys}`;
}

// Re-export żeby document-actions miało jeden import
export { PromptNotFoundError, AiUnavailableError };
