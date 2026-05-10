import "server-only";

/**
 * APIPod HTTP client — minimalna, bez zewnętrznych SDK warstwa zgodna
 * z Anthropic Messages API.
 *
 * Dlaczego nie `@anthropic-ai/sdk`?
 *   - APIPod jest proxy z własnym base URL (`APIPOD_BASE_URL`),
 *   - chcemy własną obsługę retry/fallback (Sonnet → Opus),
 *   - chcemy strict token tracking i deterministyczne logi,
 *   - SDK Anthropica wciąga 60+ kB do bundle'a, czego unikniemy w Edge.
 *
 * Fallback chain (priorytet w kolejności):
 *   1. APIPod (`APIPOD_API_KEY` + `APIPOD_BASE_URL`)
 *   2. Anthropic direct (`ANTHROPIC_API_KEY`)
 *   3. Static template (signaled przez `AiUnavailableError` — caller
 *      łapie ją i sięga po Tier 2 renderer).
 */
import { models, computeCostUsd, type ModelRole } from "./models";

// -----------------------------------------------------------------------------
// Public types
// -----------------------------------------------------------------------------
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface CompletionRequest {
  role: ModelRole;
  systemPrompt: string;
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
  /** Optional metadata zapisywane w logach (np. case_id, document_id). */
  trace?: Record<string, string>;
}

export interface CompletionResponse {
  text: string;
  modelId: string;
  tokensInput: number;
  tokensOutput: number;
  costUsd: number;
  durationMs: number;
  /** Który backend obsłużył wywołanie. */
  provider: "apipod" | "anthropic-direct";
}

export class AiUnavailableError extends Error {
  override name = "AiUnavailableError" as const;
  constructor(message: string, readonly cause?: unknown) {
    super(message);
  }
}

export class AiTransientError extends Error {
  override name = "AiTransientError" as const;
  constructor(message: string, readonly cause?: unknown) {
    super(message);
  }
}

// -----------------------------------------------------------------------------
// Configuration
// -----------------------------------------------------------------------------
interface BackendConfig {
  baseUrl: string;
  apiKey: string;
  provider: "apipod" | "anthropic-direct";
}

function readBackends(): BackendConfig[] {
  const list: BackendConfig[] = [];
  const apipodKey = process.env.APIPOD_API_KEY;
  const apipodUrl = process.env.APIPOD_BASE_URL;
  if (apipodKey && apipodUrl) {
    list.push({
      provider: "apipod",
      baseUrl: apipodUrl.replace(/\/+$/, ""),
      apiKey: apipodKey,
    });
  }
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (anthropicKey) {
    list.push({
      provider: "anthropic-direct",
      baseUrl: "https://api.anthropic.com/v1",
      apiKey: anthropicKey,
    });
  }
  return list;
}

// -----------------------------------------------------------------------------
// Public: completion (z retry + fallback)
// -----------------------------------------------------------------------------
const MAX_ATTEMPTS_PER_BACKEND = 2;
const REQUEST_TIMEOUT_MS = 60_000;

export async function complete(
  req: CompletionRequest,
): Promise<CompletionResponse> {
  const backends = readBackends();
  if (backends.length === 0) {
    throw new AiUnavailableError(
      "Brak skonfigurowanych backendów AI (APIPod / Anthropic). " +
        "Ustaw APIPOD_API_KEY+APIPOD_BASE_URL lub ANTHROPIC_API_KEY.",
    );
  }

  const m = models[req.role];
  const body = {
    model: m.id,
    system: req.systemPrompt,
    messages: req.messages,
    temperature: req.temperature ?? 0.2,
    max_tokens: req.maxTokens ?? m.defaultMaxTokens,
  };

  let lastError: unknown = null;
  for (const backend of backends) {
    for (let attempt = 1; attempt <= MAX_ATTEMPTS_PER_BACKEND; attempt += 1) {
      try {
        const start = Date.now();
        const result = await sendRequest(backend, body);
        const tokensInput = result.usage?.input_tokens ?? 0;
        const tokensOutput = result.usage?.output_tokens ?? 0;
        return {
          text: result.text,
          modelId: m.id,
          tokensInput,
          tokensOutput,
          costUsd: computeCostUsd(req.role, tokensInput, tokensOutput),
          durationMs: Date.now() - start,
          provider: backend.provider,
        };
      } catch (err) {
        lastError = err;
        if (err instanceof AiTransientError && attempt < MAX_ATTEMPTS_PER_BACKEND) {
          // exponential backoff: 400ms, 1.6s
          const delay = 400 * Math.pow(4, attempt - 1);
          await new Promise((r) => setTimeout(r, delay));
          continue;
        }
        // przejdź do następnego backendu
        break;
      }
    }
  }

  throw new AiUnavailableError(
    "Wszystkie backendy AI zwróciły błąd.",
    lastError,
  );
}

// -----------------------------------------------------------------------------
// Internal: HTTP wrapper
// -----------------------------------------------------------------------------
interface AnthropicRawResponse {
  text: string;
  usage?: { input_tokens?: number; output_tokens?: number };
}

async function sendRequest(
  backend: BackendConfig,
  body: Record<string, unknown>,
): Promise<AnthropicRawResponse> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  let response: Response;
  try {
    response = await fetch(`${backend.baseUrl}/messages`, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "content-type": "application/json",
        // Anthropic + APIPod zgodne nagłówki:
        "anthropic-version": "2023-06-01",
        "x-api-key": backend.apiKey,
      },
      body: JSON.stringify(body),
    });
  } catch (err) {
    clearTimeout(timer);
    throw new AiTransientError(
      `Nie udało się połączyć z ${backend.provider}: ${
        err instanceof Error ? err.message : String(err)
      }`,
      err,
    );
  }
  clearTimeout(timer);

  if (!response.ok) {
    const txt = await response.text().catch(() => "");
    // 5xx i 429 — transient (warto powtórzyć)
    if (response.status >= 500 || response.status === 429) {
      throw new AiTransientError(
        `${backend.provider} zwrócił ${response.status}: ${txt.slice(0, 200)}`,
      );
    }
    throw new AiUnavailableError(
      `${backend.provider} zwrócił ${response.status}: ${txt.slice(0, 200)}`,
    );
  }

  const json = (await response.json()) as {
    content?: Array<{ type: string; text?: string }>;
    usage?: { input_tokens?: number; output_tokens?: number };
  };

  // Anthropic zwraca content jako array — łączymy text-bloki.
  const text = (json.content ?? [])
    .filter((b) => b.type === "text" && typeof b.text === "string")
    .map((b) => b.text as string)
    .join("\n")
    .trim();

  return { text, usage: json.usage };
}

// -----------------------------------------------------------------------------
// Public: streaming (SSE) — używane dla generacji "live" w UI (Tier 3.2)
// -----------------------------------------------------------------------------
export interface StreamingChunk {
  type: "delta" | "done" | "error";
  delta?: string;
  costUsd?: number;
  tokensInput?: number;
  tokensOutput?: number;
}

/**
 * Streamuje tokeny z modelu jako AsyncIterable.
 *
 * Tier 3 implementuje tylko shape — `complete()` jest wystarczający
 * dla MVP (generacja pisma trwa ~10–20 s i pokazujemy spinner).
 * Streaming wprowadzimy w Tier 4 razem z UX "pismo na żywo".
 */
export async function* completeStreaming(
  req: CompletionRequest,
): AsyncGenerator<StreamingChunk> {
  // MVP: jedno wywołanie, pojedynczy delta + done. Pełne SSE wprowadzimy
  // w Tier 4. Ten kontrakt zachowujemy, by call-site nie musiał być
  // zmieniany przy upgrade.
  try {
    const result = await complete(req);
    yield { type: "delta", delta: result.text };
    yield {
      type: "done",
      costUsd: result.costUsd,
      tokensInput: result.tokensInput,
      tokensOutput: result.tokensOutput,
    };
  } catch (err) {
    yield {
      type: "error",
      delta: err instanceof Error ? err.message : String(err),
    };
  }
}
