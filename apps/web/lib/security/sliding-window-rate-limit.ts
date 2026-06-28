/**
 * Tier 6 zad. 261 — Sliding Window Log rate limiter (tier-aware).
 *
 * Różni się od token-bucket (`rate-limit.ts`) tym, że trzyma precyzyjny log
 * timestampów ostatnich żądań i zlicza ile zmieściło się w oknie. Daje
 * bardziej deterministyczne wyniki na granicy okna, lepsze dla user-facing
 * limitów (np. "60 generacji / godzinę").
 *
 * Tier-aware:
 *   - 'anon'  — najsurowsze limity (botnety)
 *   - 'free'  — darmowi userzy
 *   - 'paid'  — opłaceni
 *   - 'pro'   — subskrybenci Pro (Tier 8)
 *   - 'admin' — full admin (praktycznie bez limitu)
 *
 * Edge runtime safe (in-memory, GC every minute).
 */

export type UserTier = "anon" | "free" | "paid" | "pro" | "admin";

export interface SlidingWindowConfig {
  /** Window size in ms. */
  windowMs: number;
  /** Max requests per window per tier. */
  perTier: Record<UserTier, number>;
}

interface LogEntry {
  ts: number;
}

const logs = new Map<string, LogEntry[]>();

const GC_TTL_MS = 10 * 60 * 1000;
let lastGc = Date.now();

function gc(now: number, windowMs: number): void {
  if (now - lastGc < 60_000) return;
  lastGc = now;
  for (const [k, arr] of logs.entries()) {
    const pruned = arr.filter((e) => now - e.ts < windowMs);
    if (pruned.length === 0) {
      logs.delete(k);
    } else {
      logs.set(k, pruned);
    }
  }
}

export interface SlidingWindowResult {
  allowed: boolean;
  remaining: number;
  resetMs: number;
  limit: number;
  tier: UserTier;
}

export function slidingWindowRateLimit(
  key: string,
  tier: UserTier,
  config: SlidingWindowConfig,
): SlidingWindowResult {
  const now = Date.now();
  gc(now, config.windowMs);

  const limit = config.perTier[tier];
  const arr = (logs.get(key) ?? []).filter((e) => now - e.ts < config.windowMs);

  if (arr.length >= limit) {
    // Resetuje się, gdy najstarszy wpis wypadnie z okna.
    const oldest = arr[0]?.ts ?? now;
    const resetMs = Math.max(0, oldest + config.windowMs - now);
    logs.set(key, arr);
    return {
      allowed: false,
      remaining: 0,
      resetMs,
      limit,
      tier,
    };
  }

  arr.push({ ts: now });
  logs.set(key, arr);

  return {
    allowed: true,
    remaining: Math.max(0, limit - arr.length),
    resetMs: 0,
    limit,
    tier,
  };
}

/** Pre-configured profiles for common endpoints. */
export const SLIDING_PROFILES = {
  /** AI generation: 60/h paid, 5/h free, 200/h pro, unlim admin. */
  aiGenerate: {
    windowMs: 60 * 60 * 1000,
    perTier: { anon: 1, free: 5, paid: 60, pro: 200, admin: 10_000 },
  } as SlidingWindowConfig,
  /** OCR / PDF parsing: 20/h paid, 3/h free. */
  ocrParse: {
    windowMs: 60 * 60 * 1000,
    perTier: { anon: 1, free: 3, paid: 20, pro: 50, admin: 1000 },
  } as SlidingWindowConfig,
  /** Auth-sensitive (sign-in/up): 10/15min anon, 30/15min logged. */
  authSensitive: {
    windowMs: 15 * 60 * 1000,
    perTier: { anon: 10, free: 30, paid: 30, pro: 30, admin: 100 },
  } as SlidingWindowConfig,
} as const;

/** Convenience helper used at call-sites with userId + tier. */
export function rlAiGenerate(userId: string, tier: UserTier): SlidingWindowResult {
  return slidingWindowRateLimit(`sw:ai-gen:${userId}`, tier, SLIDING_PROFILES.aiGenerate);
}
