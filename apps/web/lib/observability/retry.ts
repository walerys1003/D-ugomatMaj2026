/**
 * Tier 6 zad. 256 — Retry with exponential backoff + jitter.
 *
 * Klasyfikacja błędów retriable vs non-retriable:
 *   - Anthropic: 429, 500, 502, 503, 504 → retriable
 *   - Stripe: 429, 5xx → retriable; 4xx (poza 429) → non-retriable
 *   - Supabase: connection errors → retriable; constraint violations → not
 *
 * Wzorzec:
 *   const result = await withRetry(() => fetch(...), {
 *     maxAttempts: 3,
 *     classify: (err) => isRetriable(err) ? "retry" : "fail",
 *   });
 */

import { logger } from "./logger";

export interface RetryOptions {
  /** Max attempts (including the initial call). Default: 3. */
  maxAttempts?: number;
  /** Initial backoff in ms. Default: 200. */
  baseDelayMs?: number;
  /** Max backoff ceiling in ms. Default: 8_000. */
  maxDelayMs?: number;
  /** Classify whether to retry on given error. Default: always retry. */
  classify?: (err: unknown) => "retry" | "fail";
  /** Hook for logging / metrics on each retry. */
  onRetry?: (attempt: number, err: unknown, delayMs: number) => void;
  /** Op name for logs. */
  opName?: string;
}

function expoBackoff(attempt: number, base: number, ceiling: number): number {
  // attempt is 1-indexed for the first retry.
  const expo = Math.min(ceiling, base * 2 ** (attempt - 1));
  const jitter = expo * 0.3 * Math.random();
  return Math.floor(expo + jitter);
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const maxAttempts = options.maxAttempts ?? 3;
  const baseDelayMs = options.baseDelayMs ?? 200;
  const maxDelayMs = options.maxDelayMs ?? 8_000;
  const classify = options.classify ?? (() => "retry" as const);
  const opName = options.opName ?? "retry-op";

  let lastErr: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      const decision = classify(err);
      if (decision === "fail" || attempt === maxAttempts) {
        logger.warn("retry.exhausted", {
          op: opName,
          attempts: attempt,
          err: err instanceof Error ? err.message : String(err),
        });
        throw err;
      }
      const delay = expoBackoff(attempt, baseDelayMs, maxDelayMs);
      options.onRetry?.(attempt, err, delay);
      logger.debug("retry.backoff", {
        op: opName,
        attempt,
        delay_ms: delay,
        err: err instanceof Error ? err.message : String(err),
      });
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  // Unreachable, but keeps TS happy.
  throw lastErr;
}

/** Anthropic-flavored retry classifier — for the AI pipeline. */
export function classifyAnthropic(err: unknown): "retry" | "fail" {
  if (!err) return "fail";
  // Heuristic: try to read .status / .statusCode / .response.status
  const e = err as {
    status?: number;
    statusCode?: number;
    response?: { status?: number };
    message?: string;
  };
  const status = e.status ?? e.statusCode ?? e.response?.status;
  if (typeof status === "number") {
    if (status === 429) return "retry";
    if (status >= 500) return "retry";
    return "fail";
  }
  const msg = String(e.message ?? "").toLowerCase();
  if (
    msg.includes("econnreset") ||
    msg.includes("etimedout") ||
    msg.includes("network") ||
    msg.includes("fetch failed")
  ) {
    return "retry";
  }
  return "fail";
}

/** Stripe-flavored retry classifier. */
export function classifyStripe(err: unknown): "retry" | "fail" {
  if (!err) return "fail";
  const e = err as { status?: number; statusCode?: number; type?: string };
  const status = e.statusCode ?? e.status;
  const type = e.type ?? "";
  if (type === "StripeIdempotencyError") return "fail";
  if (type === "StripeRateLimitError") return "retry";
  if (type === "StripeConnectionError" || type === "StripeAPIError") return "retry";
  if (typeof status === "number" && status >= 500) return "retry";
  return "fail";
}
