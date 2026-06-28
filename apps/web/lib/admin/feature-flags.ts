/**
 * Tier 10 — Feature flags with DB persistence, percentage rollout, and user overrides.
 */
import { createSupabaseServerClient } from "@/lib/db/supabase-server";
import { createHash } from "crypto";

export interface FeatureFlag {
  key: string;
  enabled: boolean;
  rollout_pct: number; // 0..100
  description?: string;
  user_overrides?: Record<string, boolean>;
  updated_at?: string;
}

const cache = new Map<string, { value: FeatureFlag; expiresAt: number }>();
const TTL_MS = 30_000;

export async function getFlag(key: string): Promise<FeatureFlag | null> {
  const cached = cache.get(key);
  if (cached && cached.expiresAt > Date.now()) return cached.value;
  try {
    // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb: any = await createSupabaseServerClient();
    const { data } = await sb.from("feature_flags").select("*").eq("key", key).maybeSingle();
    if (!data) return null;
    const flag: FeatureFlag = {
      key: data.key,
      enabled: !!data.enabled,
      rollout_pct: Number(data.rollout_pct ?? 0),
      description: data.description ?? undefined,
      user_overrides: (data.user_overrides as Record<string, boolean>) ?? undefined,
      updated_at: data.updated_at ?? undefined,
    };
    cache.set(key, { value: flag, expiresAt: Date.now() + TTL_MS });
    return flag;
  } catch {
    return null;
  }
}

export async function isFlagEnabled(key: string, userId?: string | null): Promise<boolean> {
  const flag = await getFlag(key);
  if (!flag) return false;
  if (!flag.enabled) return false;
  if (userId && flag.user_overrides && userId in flag.user_overrides) {
    return !!flag.user_overrides[userId];
  }
  if (flag.rollout_pct >= 100) return true;
  if (flag.rollout_pct <= 0) return false;
  const subject = userId ?? "anonymous";
  const h = createHash("sha256").update(`${key}:${subject}`).digest();
  const bucket = h.readUInt16BE(0) % 100;
  return bucket < flag.rollout_pct;
}

export async function upsertFlag(flag: FeatureFlag, actorId: string): Promise<void> {
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb: any = await createSupabaseServerClient();
  await sb.from("feature_flags").upsert(
    {
      key: flag.key,
      enabled: flag.enabled,
      rollout_pct: flag.rollout_pct,
      description: flag.description ?? null,
      user_overrides: flag.user_overrides ?? {},
      updated_at: new Date().toISOString(),
      updated_by: actorId,
    },
    { onConflict: "key" },
  );
  cache.delete(flag.key);
}

export async function listFlags(): Promise<FeatureFlag[]> {
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb: any = await createSupabaseServerClient();
  const { data } = await sb.from("feature_flags").select("*").order("key");
  return (data ?? []).map((d: any) => ({
    key: d.key,
    enabled: !!d.enabled,
    rollout_pct: Number(d.rollout_pct ?? 0),
    description: d.description ?? undefined,
    user_overrides: (d.user_overrides as Record<string, boolean>) ?? undefined,
    updated_at: d.updated_at ?? undefined,
  }));
}
