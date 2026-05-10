// Distributed rate limiter — sliding window with per-key buckets. Designed for
// Edge-friendly KV stores (Cloudflare KV, Upstash, in-memory dev), but ships
// with an in-memory fallback for local development.

export interface RateLimitConfig {
  windowMs: number;
  max: number;
  keyPrefix?: string;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfterMs: number;
}

export interface RateLimitStore {
  get(key: string): Promise<number[] | null>;
  set(key: string, timestamps: number[], ttlMs: number): Promise<void>;
}

class MemoryStore implements RateLimitStore {
  private data = new Map<string, { ts: number[]; exp: number }>();
  async get(key: string): Promise<number[] | null> {
    const v = this.data.get(key);
    if (!v) return null;
    if (v.exp < Date.now()) { this.data.delete(key); return null; }
    return v.ts;
  }
  async set(key: string, timestamps: number[], ttlMs: number): Promise<void> {
    this.data.set(key, { ts: timestamps, exp: Date.now() + ttlMs });
  }
}

let store: RateLimitStore = new MemoryStore();
export function setRateLimitStore(s: RateLimitStore): void { store = s; }

export async function checkRateLimit(key: string, cfg: RateLimitConfig): Promise<RateLimitResult> {
  const fullKey = `${cfg.keyPrefix ?? "rl"}:${key}`;
  const now = Date.now();
  const windowStart = now - cfg.windowMs;
  const existing = (await store.get(fullKey)) ?? [];
  const fresh = existing.filter((t) => t > windowStart);
  if (fresh.length >= cfg.max) {
    const oldest = fresh[0];
    return {
      allowed: false,
      remaining: 0,
      resetAt: oldest + cfg.windowMs,
      retryAfterMs: oldest + cfg.windowMs - now,
    };
  }
  fresh.push(now);
  await store.set(fullKey, fresh, cfg.windowMs);
  return {
    allowed: true,
    remaining: cfg.max - fresh.length,
    resetAt: now + cfg.windowMs,
    retryAfterMs: 0,
  };
}

// Standard buckets used across the app.
export const RATE_LIMITS = {
  login: { windowMs: 15 * 60_000, max: 10, keyPrefix: "rl:login" },
  signup: { windowMs: 60 * 60_000, max: 5, keyPrefix: "rl:signup" },
  passwordReset: { windowMs: 60 * 60_000, max: 3, keyPrefix: "rl:pwreset" },
  aiInvoke: { windowMs: 60_000, max: 30, keyPrefix: "rl:ai" },
  api: { windowMs: 60_000, max: 120, keyPrefix: "rl:api" },
  push: { windowMs: 60_000, max: 60, keyPrefix: "rl:push" },
} as const;
