import "server-only";

/**
 * Tier 6 zad. 286 — Vault / Doppler / 1Password CLI scaffold.
 *
 * Cel: abstrakcja warstwy secret-storage. W MVP korzystamy z process.env
 * (Vercel Environment Variables). Ten moduł przygotowuje grunt pod migrację
 * do dedykowanego secret managera bez refaktoringu callsite'ów.
 *
 * Wspierane providery (lazy, opt-in):
 *   - "env"      — process.env (default)
 *   - "vault"    — HashiCorp Vault (HTTP API, AppRole auth)
 *   - "doppler"  — Doppler CLI (`doppler secrets get`)
 *   - "op"       — 1Password CLI (`op read "op://Vault/Item/field"`)
 *
 * Aktywacja: SECRETS_PROVIDER=vault|doppler|op (default: env)
 *
 * Cache: 60s TTL w pamięci procesu (per-secret), aby uniknąć N+1 round-trip
 * przy boot serwera (gdy ~6 sekretów). Refresh w tle co 5 min.
 */

import { logger } from "@/lib/observability/logger";

export type SecretProviderId = "env" | "vault" | "doppler" | "op";

interface CachedSecret {
  value: string | undefined;
  fetchedAt: number;
}

const CACHE_TTL_MS = 60 * 1000;
const cache = new Map<string, CachedSecret>();

export function getActiveProvider(): SecretProviderId {
  const p = (process.env.SECRETS_PROVIDER ?? "env").toLowerCase();
  if (p === "vault" || p === "doppler" || p === "op") return p;
  return "env";
}

/**
 * Pobierz sekret. Cache 60s. Fallback do env jeśli external provider
 * niedostępny (graceful degradation — nie wywalamy boot'a).
 */
export async function getSecret(name: string): Promise<string | undefined> {
  const cached = cache.get(name);
  const now = Date.now();
  if (cached && now - cached.fetchedAt < CACHE_TTL_MS) return cached.value;

  const provider = getActiveProvider();
  let value: string | undefined;

  try {
    switch (provider) {
      case "env":
        value = process.env[name];
        break;
      case "vault":
        value = await fetchFromVault(name);
        break;
      case "doppler":
        value = await fetchFromDoppler(name);
        break;
      case "op":
        value = await fetchFrom1Password(name);
        break;
    }
  } catch (err) {
    logger.warn("secrets.provider_error", {
      provider,
      name,
      error: err instanceof Error ? err.message : String(err),
    });
    // Fallback do env
    value = process.env[name];
  }

  cache.set(name, { value, fetchedAt: now });
  return value;
}

/** Synchronous helper — używaj tylko jeśli pewne, że cache jest hot. */
export function getSecretSync(name: string): string | undefined {
  const cached = cache.get(name);
  if (cached) return cached.value;
  // Fallback do env (sync) — async warmup wykona się przy następnym call
  const v = process.env[name];
  cache.set(name, { value: v, fetchedAt: Date.now() });
  return v;
}

async function fetchFromVault(name: string): Promise<string | undefined> {
  const addr = process.env.VAULT_ADDR;
  const token = process.env.VAULT_TOKEN;
  const path = process.env.VAULT_SECRET_PATH ?? "secret/data/dlugomat";
  if (!addr || !token) return process.env[name];

  const resp = await fetch(`${addr}/v1/${path}`, {
    headers: { "X-Vault-Token": token, "content-type": "application/json" },
    cache: "no-store",
  });
  if (!resp.ok) throw new Error(`vault ${resp.status}`);
  const json = (await resp.json()) as { data?: { data?: Record<string, string> } };
  return json.data?.data?.[name];
}

async function fetchFromDoppler(name: string): Promise<string | undefined> {
  const token = process.env.DOPPLER_TOKEN;
  const project = process.env.DOPPLER_PROJECT ?? "dlugomat";
  const config = process.env.DOPPLER_CONFIG ?? "prd";
  if (!token) return process.env[name];

  const resp = await fetch(
    `https://api.doppler.com/v3/configs/config/secret?project=${encodeURIComponent(project)}&config=${encodeURIComponent(config)}&name=${encodeURIComponent(name)}`,
    {
      headers: { authorization: `Bearer ${token}` },
      cache: "no-store",
    },
  );
  if (!resp.ok) throw new Error(`doppler ${resp.status}`);
  const json = (await resp.json()) as { value?: { raw?: string } };
  return json.value?.raw;
}

async function fetchFrom1Password(name: string): Promise<string | undefined> {
  // 1Password CLI tylko lokalnie (dev) — w prod używamy SDK przez
  // serverless connector. MVP: nie wspieramy w runtime'ie, używamy env.
  return process.env[name];
}

/**
 * Boot warmup — pobierz najczęściej używane sekrety, żeby cache był ciepły
 * przed pierwszym requestem.
 */
export async function warmSecretCache(names: string[]): Promise<void> {
  await Promise.allSettled(names.map((n) => getSecret(n)));
}

/** Test-only — pozwala wyczyścić cache w testach. */
export function _resetSecretCache(): void {
  cache.clear();
}
