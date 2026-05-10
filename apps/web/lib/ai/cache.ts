/**
 * Tier 11 — Semantic cache for LLM responses.
 * Keyed by sha256(model_id + system + user). Optional similarity-based fuzzy match.
 */
import { createHash } from "crypto";
import { createServerSupabase } from "@/lib/db/supabase-server";

export interface CachedResponse {
  key: string;
  model_id: string;
  text: string;
  cost_grosze_saved: number;
  hit_count: number;
  created_at: string;
}

export function cacheKey(modelId: string, system: string, user: string): string {
  return createHash("sha256").update(`${modelId}|${system}|${user}`).digest("hex");
}

export async function getCached(key: string): Promise<CachedResponse | null> {
  const sb = await createServerSupabase();
  const { data } = await sb.from("ai_response_cache").select("*").eq("key", key).maybeSingle();
  if (!data) return null;
  // Bump hit count async
  void sb.from("ai_response_cache").update({ hit_count: (data.hit_count ?? 0) + 1, last_hit_at: new Date().toISOString() }).eq("key", key);
  return {
    key: data.key,
    model_id: data.model_id,
    text: data.text,
    cost_grosze_saved: data.cost_grosze_saved ?? 0,
    hit_count: data.hit_count ?? 0,
    created_at: data.created_at,
  };
}

export async function setCached(opts: { key: string; modelId: string; text: string; expectedCostGrosze: number }): Promise<void> {
  const sb = await createServerSupabase();
  await sb.from("ai_response_cache").upsert(
    {
      key: opts.key,
      model_id: opts.modelId,
      text: opts.text,
      cost_grosze_saved: opts.expectedCostGrosze,
      hit_count: 0,
      created_at: new Date().toISOString(),
    },
    { onConflict: "key" },
  );
}

export async function pruneOldCache(olderThanDays = 30): Promise<number> {
  const cutoff = new Date(Date.now() - olderThanDays * 24 * 3600 * 1000).toISOString();
  const sb = await createServerSupabase();
  const { count } = await sb
    .from("ai_response_cache")
    .delete({ count: "exact" })
    .lt("created_at", cutoff)
    .lt("hit_count", 2);
  return count ?? 0;
}
