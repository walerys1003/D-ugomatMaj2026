/**
 * Model registry — single source of truth dla nazw modeli, cen, limitów.
 *
 * APIPod jest gatewayem zgodnym z Anthropic Messages API. Nazwy modeli
 * trzymamy abstrakcyjne (`generator` / `validator` / `escalator`) — kod
 * aplikacyjny nigdy nie hardkoduje konkretnego modelu, więc upgrade
 * (np. Sonnet 4.6 → 4.7) sprowadza się do zmiany jednej linii.
 *
 * Ceny (USD per 1M tokenów) — orientacyjne wartości z spec §18.4. Tier 5
 * podmieni je na pull z APIPod /v1/models. Używamy ich tylko do tracking'u
 * kosztów per-document (validation_runs.cost_usd, documents.ai_cost_usd).
 */
export type ModelRole = "generator" | "validator" | "escalator" | "embedding";

export interface ModelDescriptor {
  /** APIPod / Anthropic identifier — to jest to, co przesyłamy w requeście. */
  id: string;
  /** Czytelna nazwa do logów / panelu admina. */
  label: string;
  /** Cena 1M tokenów wejścia w USD. */
  pricePerMillionInput: number;
  /** Cena 1M tokenów wyjścia w USD. */
  pricePerMillionOutput: number;
  /** Maksymalny output (zalecany — Sonnet potrafi 8k, my zostajemy przy 4k). */
  defaultMaxTokens: number;
}

/**
 * Mapowanie ról → konkretne modele.
 * Tier 3 startuje na obecnie najlepszych wersjach Anthropic.
 * (Zmiana wersji = jeden commit; wszystkie call-site'y używają roli, nie id.)
 */
export const models: Record<ModelRole, ModelDescriptor> = {
  generator: {
    id: "claude-sonnet-4-5-20251022",
    label: "Claude Sonnet 4.5",
    pricePerMillionInput: 3.0,
    pricePerMillionOutput: 15.0,
    defaultMaxTokens: 4096,
  },
  validator: {
    id: "claude-haiku-4-5-20251022",
    label: "Claude Haiku 4.5",
    pricePerMillionInput: 1.0,
    pricePerMillionOutput: 5.0,
    defaultMaxTokens: 1024,
  },
  escalator: {
    id: "claude-opus-4-5-20251022",
    label: "Claude Opus 4.5",
    pricePerMillionInput: 15.0,
    pricePerMillionOutput: 75.0,
    defaultMaxTokens: 4096,
  },
  embedding: {
    // Anthropic nie ma własnych embeddings — używamy OpenAI text-embedding-3-small
    // przez APIPod (kompatybilny endpoint). Jeśli APIPod ich nie proxuje, kod
    // automatycznie fallbackuje na deterministyczne TF-IDF z knowledge-base/.
    id: "text-embedding-3-small",
    label: "OpenAI text-embedding-3-small",
    pricePerMillionInput: 0.02,
    pricePerMillionOutput: 0,
    defaultMaxTokens: 0,
  },
};

/**
 * Oblicza koszt wywołania w USD na podstawie liczby tokenów.
 * Używane przez tracker do utrzymywania `documents.ai_cost_usd`.
 */
export function computeCostUsd(
  role: ModelRole,
  tokensInput: number,
  tokensOutput: number,
): number {
  const m = models[role];
  return (
    (tokensInput / 1_000_000) * m.pricePerMillionInput +
    (tokensOutput / 1_000_000) * m.pricePerMillionOutput
  );
}
