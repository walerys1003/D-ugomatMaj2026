/**
 * Tier 34-1 — Multi-region deployment + edge caching configuration.
 *
 * Długomat deployment matrix:
 *   - Primary:   eu-central-1 (Frankfurt) — Vercel `fra1` + Supabase `eu-central-1`
 *   - Secondary: eu-west-3    (Paris)     — Vercel `cdg1` failover
 *   - Edge:      Cloudflare global PoPs   — static assets + ISR
 *
 * Routing strategy:
 *   1. DNS GeoSteering — userzy PL → Frankfurt; reszta UE → Paris
 *   2. Health-check failover — jeśli `fra1` 5xx > 1% w 60s, RPS redirect → `cdg1`
 *   3. Read-replica per region — Supabase read replicas w PAR i FRA
 *   4. Write-path zawsze do primary (FRA) — async replication < 200 ms
 *
 * Edge caching matrix (Vercel + Cloudflare):
 *   - /api/changelog          → s-maxage=3600,  stale-while-revalidate=86400
 *   - /api/status             → s-maxage=30,    stale-while-revalidate=300
 *   - /api/health             → no-store
 *   - /api/admin/*            → no-store, private
 *   - /(marketing)/*          → ISR 1h
 *   - /_next/static/*         → public, max-age=31536000, immutable
 */

export type RegionCode = "fra1" | "cdg1" | "ams1";

export interface RegionConfig {
  code: RegionCode;
  vercel_region: string;
  supabase_region: string;
  display_name: string;
  is_primary: boolean;
  /** Latency budget for cross-region writes (ms). */
  write_latency_budget_ms: number;
}

export const REGIONS: Record<RegionCode, RegionConfig> = {
  fra1: {
    code: "fra1",
    vercel_region: "fra1",
    supabase_region: "eu-central-1",
    display_name: "Frankfurt (Primary)",
    is_primary: true,
    write_latency_budget_ms: 150,
  },
  cdg1: {
    code: "cdg1",
    vercel_region: "cdg1",
    supabase_region: "eu-west-3",
    display_name: "Paris (Failover)",
    is_primary: false,
    write_latency_budget_ms: 200,
  },
  ams1: {
    code: "ams1",
    vercel_region: "ams1",
    supabase_region: "eu-west-1",
    display_name: "Amsterdam (Edge)",
    is_primary: false,
    write_latency_budget_ms: 200,
  },
};

export interface EdgeCacheRule {
  pattern: RegExp;
  cache_control: string;
  cdn_cache_control?: string;
  vary?: string[];
}

export const EDGE_CACHE_RULES: EdgeCacheRule[] = [
  {
    pattern: /^\/api\/changelog$/,
    cache_control: "public, s-maxage=3600, stale-while-revalidate=86400",
    cdn_cache_control: "public, max-age=3600",
  },
  {
    pattern: /^\/api\/status(\/|$)/,
    cache_control: "public, s-maxage=30, stale-while-revalidate=300",
  },
  {
    pattern: /^\/api\/health/,
    cache_control: "no-store",
  },
  {
    pattern: /^\/api\/admin\//,
    cache_control: "no-store, private",
  },
  {
    pattern: /^\/(cennik|o-nas|jak-to-dziala|blog)(\/|$)/,
    cache_control: "public, s-maxage=3600, stale-while-revalidate=86400",
    vary: ["Accept-Language"],
  },
  {
    pattern: /^\/_next\/static\//,
    cache_control: "public, max-age=31536000, immutable",
  },
];

export function matchEdgeRule(path: string): EdgeCacheRule | null {
  for (const rule of EDGE_CACHE_RULES) {
    if (rule.pattern.test(path)) return rule;
  }
  return null;
}

export interface RegionPickContext {
  country?: string; // ISO-3166-1 alpha-2
  forceRegion?: RegionCode;
  primaryHealthy?: boolean;
}

/**
 * Wybierz region docelowy dla requesta. Logika:
 *   - jeśli primary niesprawny → cdg1
 *   - jeśli kraj PL → fra1 (najniższe RTT)
 *   - jeśli DACH (DE/AT/CH) → fra1
 *   - jeśli FR/ES/IT/PT → cdg1
 *   - default → fra1
 */
export function pickRegion(ctx: RegionPickContext): RegionCode {
  if (ctx.forceRegion) return ctx.forceRegion;
  if (ctx.primaryHealthy === false) return "cdg1";
  const country = (ctx.country ?? "").toUpperCase();
  if (["FR", "ES", "IT", "PT", "BE", "LU"].includes(country)) return "cdg1";
  return "fra1";
}

/** Wygeneruj Vercel `vercel.json` `regions` array. */
export function getVercelRegions(): string[] {
  return Object.values(REGIONS).map((r) => r.vercel_region);
}
