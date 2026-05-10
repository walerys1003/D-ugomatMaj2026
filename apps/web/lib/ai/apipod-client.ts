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
 * Tier 3 zad. 108 — Streamuje tokeny z modelu jako AsyncIterable (prawdziwy SSE).
 *
 * Implementuje Anthropic Messages API streaming format:
 *   - `message_start` → metadata + tokensInput
 *   - `content_block_delta` → kolejne fragmenty tekstu
 *   - `message_delta` → tokensOutput
 *   - `message_stop` → done
 *
 * Jeżeli backend zwraca 5xx/429 — fallback do non-streaming `complete()`
 * (deterministycznie, by UI nie zostało bez treści).
 */
export async function* completeStreaming(
  req: CompletionRequest,
): AsyncGenerator<StreamingChunk> {
  const backends = readBackends();
  if (backends.length === 0) {
    yield {
      type: "error",
      delta: "Brak skonfigurowanych backendów AI.",
    };
    return;
  }

  const m = models[req.role];
  const body = {
    model: m.id,
    system: req.systemPrompt,
    messages: req.messages,
    temperature: req.temperature ?? 0.2,
    max_tokens: req.maxTokens ?? m.defaultMaxTokens,
    stream: true,
  };

  // Próbujemy SSE na pierwszym dostępnym backendzie.
  const backend = backends[0];
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(`${backend.baseUrl}/messages`, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "content-type": "application/json",
        "anthropic-version": "2023-06-01",
        "x-api-key": backend.apiKey,
        accept: "text/event-stream",
      },
      body: JSON.stringify(body),
    });
  } catch (err) {
    clearTimeout(timer);
    // Fallback do non-streaming
    yield* fallbackToComplete(req);
    return;
  }

  if (!response.ok || !response.body) {
    clearTimeout(timer);
    yield* fallbackToComplete(req);
    return;
  }

  let tokensInput = 0;
  let tokensOutput = 0;
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      // SSE event boundaries: \n\n
      let boundary = buffer.indexOf("\n\n");
      while (boundary !== -1) {
        const event = buffer.slice(0, boundary);
        buffer = buffer.slice(boundary + 2);
        boundary = buffer.indexOf("\n\n");

        // Parse `data: {...}`
        const dataLine = event
          .split("\n")
          .find((l) => l.startsWith("data:"));
        if (!dataLine) continue;
        const payload = dataLine.slice(5).trim();
        if (!payload || payload === "[DONE]") continue;

        try {
          const parsed = JSON.parse(payload) as {
            type?: string;
            delta?: { type?: string; text?: string };
            message?: {
              usage?: { input_tokens?: number; output_tokens?: number };
            };
            usage?: { input_tokens?: number; output_tokens?: number };
          };

          if (parsed.type === "message_start" && parsed.message?.usage) {
            tokensInput = parsed.message.usage.input_tokens ?? 0;
          } else if (
            parsed.type === "content_block_delta" &&
            parsed.delta?.type === "text_delta" &&
            typeof parsed.delta.text === "string"
          ) {
            yield { type: "delta", delta: parsed.delta.text };
          } else if (parsed.type === "message_delta" && parsed.usage) {
            tokensOutput = parsed.usage.output_tokens ?? tokensOutput;
          }
        } catch {
          // Ignore malformed event — Anthropic sometimes sends pings.
        }
      }
    }

    yield {
      type: "done",
      costUsd: computeCostUsd(req.role, tokensInput, tokensOutput),
      tokensInput,
      tokensOutput,
    };
  } catch (err) {
    yield {
      type: "error",
      delta: err instanceof Error ? err.message : String(err),
    };
  } finally {
    clearTimeout(timer);
    reader.releaseLock();
  }
}

async function* fallbackToComplete(
  req: CompletionRequest,
): AsyncGenerator<StreamingChunk> {
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
