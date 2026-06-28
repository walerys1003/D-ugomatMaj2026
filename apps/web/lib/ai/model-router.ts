/**
 * Tier 11 — Multi-model router with fallback chain, cost tracking, and quality routing.
 * Default chain: Anthropic Claude Sonnet 4.5 → Claude Haiku → OpenAI GPT-4o → fallback template.
 */
export type ModelProvider = "anthropic" | "openai" | "gemini" | "local";
export type ModelTier = "premium" | "standard" | "fast" | "fallback";

export interface ModelDescriptor {
  id: string;
  provider: ModelProvider;
  tier: ModelTier;
  context_window: number;
  input_cost_per_1k_grosze: number; // 1 grosz = 0.01 PLN
  output_cost_per_1k_grosze: number;
  supports_tools: boolean;
  supports_vision: boolean;
}

export const MODEL_REGISTRY: Record<string, ModelDescriptor> = {
  "claude-sonnet-4-5": {
    id: "claude-sonnet-4-5",
    provider: "anthropic",
    tier: "premium",
    context_window: 200_000,
    input_cost_per_1k_grosze: 12,
    output_cost_per_1k_grosze: 60,
    supports_tools: true,
    supports_vision: true,
  },
  "claude-haiku-4": {
    id: "claude-haiku-4",
    provider: "anthropic",
    tier: "fast",
    context_window: 200_000,
    input_cost_per_1k_grosze: 1,
    output_cost_per_1k_grosze: 5,
    supports_tools: true,
    supports_vision: true,
  },
  "gpt-4o": {
    id: "gpt-4o",
    provider: "openai",
    tier: "standard",
    context_window: 128_000,
    input_cost_per_1k_grosze: 10,
    output_cost_per_1k_grosze: 40,
    supports_tools: true,
    supports_vision: true,
  },
  "gpt-4o-mini": {
    id: "gpt-4o-mini",
    provider: "openai",
    tier: "fast",
    context_window: 128_000,
    input_cost_per_1k_grosze: 1,
    output_cost_per_1k_grosze: 4,
    supports_tools: true,
    supports_vision: false,
  },
};

export interface RouteSelection {
  primary: ModelDescriptor;
  fallbacks: ModelDescriptor[];
  reason: string;
}

export function selectModel(opts: {
  taskType: "legal_reasoning" | "document_draft" | "quick_summary" | "classification" | "ocr";
  expectedTokens?: number;
  qualityHint?: "premium" | "standard" | "fast";
  budget_grosze?: number;
}): RouteSelection {
  const quality = opts.qualityHint ?? "premium";
  if (opts.taskType === "legal_reasoning" || opts.taskType === "document_draft") {
    if (quality === "premium") {
      return {
        primary: MODEL_REGISTRY["claude-sonnet-4-5"],
        fallbacks: [MODEL_REGISTRY["gpt-4o"], MODEL_REGISTRY["claude-haiku-4"]],
        reason: "legal_premium",
      };
    }
    return {
      primary: MODEL_REGISTRY["claude-haiku-4"],
      fallbacks: [MODEL_REGISTRY["gpt-4o-mini"]],
      reason: "legal_standard",
    };
  }
  if (opts.taskType === "quick_summary" || opts.taskType === "classification") {
    return {
      primary: MODEL_REGISTRY["claude-haiku-4"],
      fallbacks: [MODEL_REGISTRY["gpt-4o-mini"]],
      reason: "fast_summary",
    };
  }
  return {
    primary: MODEL_REGISTRY["gpt-4o"],
    fallbacks: [MODEL_REGISTRY["claude-sonnet-4-5"]],
    reason: "default",
  };
}

export function estimateCostGrosze(model: ModelDescriptor, inputTokens: number, outputTokens: number): number {
  return Math.ceil(
    (inputTokens / 1000) * model.input_cost_per_1k_grosze +
      (outputTokens / 1000) * model.output_cost_per_1k_grosze,
  );
}
