/**
 * Tier 11 — Unified LLM client with provider abstraction, retries, and circuit breaker.
 */
import { MODEL_REGISTRY, ModelDescriptor, estimateCostGrosze } from "./model-router";

export interface LlmMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LlmRequest {
  model: ModelDescriptor;
  messages: LlmMessage[];
  max_tokens?: number;
  temperature?: number;
  stop?: string[];
}

export interface LlmResponse {
  text: string;
  model_id: string;
  input_tokens: number;
  output_tokens: number;
  cost_grosze: number;
  latency_ms: number;
  finish_reason: "stop" | "length" | "tool" | "error";
}

interface CircuitState {
  failures: number;
  openUntil: number;
}
const circuits = new Map<string, CircuitState>();
const FAILURE_THRESHOLD = 3;
const OPEN_MS = 30_000;

function isCircuitOpen(modelId: string): boolean {
  const c = circuits.get(modelId);
  if (!c) return false;
  return c.openUntil > Date.now();
}

function recordFailure(modelId: string) {
  const c = circuits.get(modelId) ?? { failures: 0, openUntil: 0 };
  c.failures++;
  if (c.failures >= FAILURE_THRESHOLD) c.openUntil = Date.now() + OPEN_MS;
  circuits.set(modelId, c);
}

function recordSuccess(modelId: string) {
  circuits.set(modelId, { failures: 0, openUntil: 0 });
}

export async function callLlm(req: LlmRequest): Promise<LlmResponse> {
  if (isCircuitOpen(req.model.id)) {
    throw new Error(`circuit_open:${req.model.id}`);
  }
  const started = Date.now();
  try {
    let res: LlmResponse;
    if (req.model.provider === "anthropic") res = await callAnthropic(req);
    else if (req.model.provider === "openai") res = await callOpenAi(req);
    else throw new Error(`unsupported_provider:${req.model.provider}`);
    recordSuccess(req.model.id);
    res.latency_ms = Date.now() - started;
    return res;
  } catch (e) {
    recordFailure(req.model.id);
    throw e;
  }
}

async function callAnthropic(req: LlmRequest): Promise<LlmResponse> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not set");
  const system = req.messages.find((m) => m.role === "system")?.content;
  const turns = req.messages.filter((m) => m.role !== "system");
  const body = {
    model: req.model.id,
    max_tokens: req.max_tokens ?? 2048,
    temperature: req.temperature ?? 0.2,
    system,
    messages: turns.map((m) => ({ role: m.role, content: m.content })),
    stop_sequences: req.stop,
  };
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`anthropic_${r.status}`);
  const j: any = await r.json();
  const text = (j.content?.[0]?.text as string) ?? "";
  const inputTokens = j.usage?.input_tokens ?? 0;
  const outputTokens = j.usage?.output_tokens ?? 0;
  return {
    text,
    model_id: req.model.id,
    input_tokens: inputTokens,
    output_tokens: outputTokens,
    cost_grosze: estimateCostGrosze(req.model, inputTokens, outputTokens),
    latency_ms: 0,
    finish_reason: j.stop_reason === "end_turn" ? "stop" : j.stop_reason === "max_tokens" ? "length" : "stop",
  };
}

async function callOpenAi(req: LlmRequest): Promise<LlmResponse> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY not set");
  const body = {
    model: req.model.id,
    messages: req.messages,
    max_tokens: req.max_tokens ?? 2048,
    temperature: req.temperature ?? 0.2,
    stop: req.stop,
  };
  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`openai_${r.status}`);
  const j: any = await r.json();
  const choice = j.choices?.[0];
  const inputTokens = j.usage?.prompt_tokens ?? 0;
  const outputTokens = j.usage?.completion_tokens ?? 0;
  return {
    text: choice?.message?.content ?? "",
    model_id: req.model.id,
    input_tokens: inputTokens,
    output_tokens: outputTokens,
    cost_grosze: estimateCostGrosze(req.model, inputTokens, outputTokens),
    latency_ms: 0,
    finish_reason: choice?.finish_reason === "length" ? "length" : "stop",
  };
}

export async function callWithFallback(
  primary: ModelDescriptor,
  fallbacks: ModelDescriptor[],
  messages: LlmMessage[],
  opts?: { max_tokens?: number; temperature?: number },
): Promise<LlmResponse> {
  const chain = [primary, ...fallbacks];
  let lastError: unknown;
  for (const m of chain) {
    try {
      return await callLlm({ model: m, messages, ...opts });
    } catch (e) {
      lastError = e;
    }
  }
  void MODEL_REGISTRY; // ensure registry available for callers
  throw new Error(`all_models_failed:${String(lastError)}`);
}
