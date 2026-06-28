import "server-only";

/**
 * Tier 6 zad. 280 — Subresource Integrity (SRI) hash generator.
 *
 * Cel: zapobieżenie kompromitacji external scripts (CDN supply-chain attack).
 * Każdy <script src="https://..."> i <link rel="stylesheet" href="https://...">
 * MUSI mieć `integrity="sha384-..."` + `crossorigin="anonymous"`.
 *
 * MVP: minimalna lista zewnętrznych assets — większość mamy self-hosted
 * (Next bundling) lub na własnym CDN.
 *
 * Build-time generation: `node scripts/generate-sri.mjs` — fetch + hash + zapis
 * do `apps/web/lib/security/sri-manifest.json`. Runtime czyta manifest.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createHash } from "node:crypto";

export interface SriEntry {
  url: string;
  integrity: string; // "sha384-<base64>"
  algorithm: "sha256" | "sha384" | "sha512";
  fetchedAt: string;
}

let cachedManifest: Record<string, SriEntry> | null = null;

export function loadSriManifest(): Record<string, SriEntry> {
  if (cachedManifest) return cachedManifest;
  try {
    const p = join(process.cwd(), "apps/web/lib/security/sri-manifest.json");
    const raw = readFileSync(p, "utf-8");
    cachedManifest = JSON.parse(raw) as Record<string, SriEntry>;
    return cachedManifest;
  } catch {
    cachedManifest = {};
    return cachedManifest;
  }
}

export function getIntegrity(url: string): string | null {
  const m = loadSriManifest();
  return m[url]?.integrity ?? null;
}

/**
 * Helper do generowania hash'a (server-side, np. w API GET /api/sri/hash).
 */
export async function computeIntegrity(
  url: string,
  algorithm: "sha384" | "sha512" = "sha384",
): Promise<string> {
  const resp = await fetch(url, { cache: "no-store" });
  if (!resp.ok) throw new Error(`fetch failed: ${resp.status}`);
  const buf = Buffer.from(await resp.arrayBuffer());
  const hash = createHash(algorithm).update(buf).digest("base64");
  return `${algorithm}-${hash}`;
}

/**
 * Zewnętrzne URL'e wymagające SRI. Aktualizuj gdy dodajesz nowy CDN script.
 * MVP: pusta — wszystko self-hosted. Lista przykładowa do referencji.
 */
export const EXTERNAL_SCRIPT_URLS: readonly string[] = [
  // "https://challenges.cloudflare.com/turnstile/v0/api.js", // Turnstile (jeśli włączone)
  // "https://js.stripe.com/v3/", // Stripe.js (jeśli korzystamy)
] as const;
