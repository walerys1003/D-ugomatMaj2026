/**
 * In-memory token bucket rate limiter.
 *
 * Działanie:
 *   - Każdy klucz (np. IP, user_id, IP+route) ma własny bucket.
 *   - Bucket startuje z `capacity` tokenów; każde żądanie zużywa 1 token.
 *   - Tokeny regenerują się z prędkością `refillPerSec` (do `capacity`).
 *   - Gdy tokenów < 1 → 429 (rate limit exceeded).
 *
 * UWAGA: in-memory state znika przy redeploy / horizontal scaling.
 * W Tier 5+ docelowo podmienimy na Upstash Redis (REST), ale dla wczesnych
 * etapów wystarczy — chroni przed prostymi botami i floodem.
 *
 * Edge runtime safe (zero deps, używa tylko Map + Date.now()).
 */
export interface RateLimitConfig {
  /** Maksymalna liczba tokenów w bucketcie. */
  capacity: number;
  /** Tempo regeneracji (tokenów / sekundę). */
  refillPerSec: number;
}

interface Bucket {
  tokens: number;
  lastRefill: number;
}

const buckets = new Map<string, Bucket>();

// Garbage collection — bucket nieużywany od 1h jest usuwany.
const GC_TTL_MS = 60 * 60 * 1000;
let lastGc = Date.now();

function gc(now: number) {
  if (now - lastGc < 60_000) return; // raz na minutę
  lastGc = now;
  for (const [k, b] of buckets.entries()) {
    if (now - b.lastRefill > GC_TTL_MS) buckets.delete(k);
  }
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetMs: number;
}

export function rateLimit(
  key: string,
  config: RateLimitConfig,
): RateLimitResult {
  const now = Date.now();
  gc(now);

  let bucket = buckets.get(key);
  if (!bucket) {
    bucket = { tokens: config.capacity, lastRefill: now };
    buckets.set(key, bucket);
  } else {
    const elapsedSec = (now - bucket.lastRefill) / 1000;
    const refill = elapsedSec * config.refillPerSec;
    if (refill > 0) {
      bucket.tokens = Math.min(config.capacity, bucket.tokens + refill);
      bucket.lastRefill = now;
    }
  }

  if (bucket.tokens >= 1) {
    bucket.tokens -= 1;
    return {
      allowed: true,
      remaining: Math.floor(bucket.tokens),
      resetMs: 0,
    };
  }

  // Ile ms do następnego dostępnego tokenu
  const need = 1 - bucket.tokens;
  const resetMs = Math.ceil((need / config.refillPerSec) * 1000);
  return { allowed: false, remaining: 0, resetMs };
}

/**
 * Pre-configured profile dla API (auth, document gen, payment intent itd.).
 * Wartości dobrane defensywnie — łatwo podkręcić.
 */
export const RATE_LIMIT_PROFILES = {
  /** Generacja dokumentu (drogie operacje AI) — 5 / min. */
  documentGenerate: { capacity: 5, refillPerSec: 5 / 60 },
  /** Stripe checkout — 10 / min. */
  payment: { capacity: 10, refillPerSec: 10 / 60 },
  /** Webhooki ze Stripe / Fakturowni — wyższe (60 / min). */
  webhook: { capacity: 60, refillPerSec: 60 / 60 },
  /** Generic API (form submit, savestate) — 60 / min. */
  api: { capacity: 60, refillPerSec: 60 / 60 },
  /** Auth (sign-in, password reset) — 20 / 5min. */
  auth: { capacity: 20, refillPerSec: 20 / 300 },
  /** Tight rate limit dla edge middleware — 120 / min na IP. */
  edge: { capacity: 120, refillPerSec: 120 / 60 },
} as const satisfies Record<string, RateLimitConfig>;

/**
 * Wyciąga najlepszy "client identifier" z requestu — preferowane kolejno:
 *   1. x-forwarded-for (pierwszy IP)
 *   2. x-real-ip
 *   3. cf-connecting-ip
 *   4. fallback: 'anon'
 */
export function clientIdFromHeaders(headers: Headers): string {
  const xff = headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  const real = headers.get("x-real-ip");
  if (real) return real.trim();
  const cf = headers.get("cf-connecting-ip");
  if (cf) return cf.trim();
  return "anon";
}
