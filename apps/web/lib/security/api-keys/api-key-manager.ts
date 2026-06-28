// API key management — scoped, hashed, expirable. Plaintext key is shown
// only once at creation; the DB stores only the SHA-256 prefix + hash.
//
// Key format: dgmt_<env>_<random32> (e.g. dgmt_live_xK3p...).

import { createHash, randomBytes, timingSafeEqual } from "crypto";

export type ApiKeyScope =
  | "read:cases"
  | "write:cases"
  | "read:documents"
  | "write:documents"
  | "ai:invoke"
  | "billing:read"
  | "webhooks:emit"
  | "admin";

export interface ApiKeyRecord {
  id: string;
  name: string;
  userId: string;
  prefix: string; // first 12 chars including env tag
  scopes: ApiKeyScope[];
  lastUsedAt?: string;
  expiresAt?: string;
  active: boolean;
  rateLimitOverride?: number;
  createdAt: string;
}

export interface CreatedApiKey {
  record: ApiKeyRecord;
  plaintext: string; // SHOW ONCE — never persisted.
}

export function generateApiKey(env: "live" | "test" = "live"): string {
  return `dgmt_${env}_${randomBytes(24).toString("base64url")}`;
}

export function keyPrefix(plaintext: string): string {
  return plaintext.slice(0, 12);
}

export function hashKey(plaintext: string): string {
  return createHash("sha256").update(plaintext).digest("hex");
}

export function verifyKeyHash(plaintext: string, storedHash: string): boolean {
  const candidate = Buffer.from(hashKey(plaintext), "hex");
  const stored = Buffer.from(storedHash, "hex");
  if (candidate.length !== stored.length) return false;
  return timingSafeEqual(candidate, stored);
}

export async function createApiKey(
  supabase: any,
  params: { userId: string; name: string; scopes: ApiKeyScope[]; expiresInDays?: number; env?: "live" | "test"; rateLimitOverride?: number },
): Promise<CreatedApiKey> {
  const plaintext = generateApiKey(params.env ?? "live");
  const prefix = keyPrefix(plaintext);
  const hash = hashKey(plaintext);
  const expiresAt = params.expiresInDays
    ? new Date(Date.now() + params.expiresInDays * 86_400_000).toISOString()
    : null;

  const { data, error } = await supabase
    .from("api_keys")
    .insert({
      user_id: params.userId,
      name: params.name,
      prefix,
      key_hash: hash,
      scopes: params.scopes,
      expires_at: expiresAt,
      rate_limit_override: params.rateLimitOverride ?? null,
      active: true,
    })
    .select("*")
    .single();
  if (error) throw error;
  return { record: mapApiKey(data), plaintext };
}

export async function validateApiKey(
  supabase: any,
  plaintext: string,
  requiredScope?: ApiKeyScope,
): Promise<ApiKeyRecord | null> {
  if (!plaintext.startsWith("dgmt_")) return null;
  const prefix = keyPrefix(plaintext);
  const { data } = await supabase
    .from("api_keys")
    .select("*")
    .eq("prefix", prefix)
    .eq("active", true)
    .maybeSingle();
  if (!data) return null;
  if (!verifyKeyHash(plaintext, data.key_hash)) return null;
  if (data.expires_at && new Date(data.expires_at).getTime() < Date.now()) return null;
  if (requiredScope && !data.scopes.includes(requiredScope) && !data.scopes.includes("admin")) return null;
  // Async-ish last-used update.
  supabase.from("api_keys").update({ last_used_at: new Date().toISOString() }).eq("id", data.id).then(() => null);
  return mapApiKey(data);
}

export async function revokeApiKey(supabase: any, keyId: string, userId: string): Promise<void> {
  await supabase.from("api_keys").update({ active: false, revoked_at: new Date().toISOString() }).eq("id", keyId).eq("user_id", userId);
}

export async function listApiKeys(supabase: any, userId: string): Promise<ApiKeyRecord[]> {
  const { data, error } = await supabase
    .from("api_keys")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapApiKey);
}

function mapApiKey(r: any): ApiKeyRecord {
  return {
    id: r.id,
    name: r.name,
    userId: r.user_id,
    prefix: r.prefix,
    scopes: r.scopes ?? [],
    lastUsedAt: r.last_used_at ?? undefined,
    expiresAt: r.expires_at ?? undefined,
    active: !!r.active,
    rateLimitOverride: r.rate_limit_override ?? undefined,
    createdAt: r.created_at,
  };
}
