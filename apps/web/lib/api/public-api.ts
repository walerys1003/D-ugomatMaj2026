/**
 * Public REST API for kancelarie + webhook subscriptions — zad. 348, 349
 *
 * API-key authenticated endpoints under /api/v1/public/* allowing law firms
 * to integrate Długomat with their case management systems.
 *
 * Capabilities:
 *  - List/create cases
 *  - Generate documents
 *  - Subscribe to webhooks for events (case.created, document.generated, etc.)
 */

import { randomBytes, createHash, createHmac, timingSafeEqual } from "node:crypto";
import { getSupabaseAdmin } from "@/lib/db/supabase-admin";
import { logger } from "@/lib/observability/logger";

export type ApiKeyScope = "cases.read" | "cases.write" | "documents.read" | "documents.write" | "webhooks.manage";
export type WebhookEvent =
  | "case.created"
  | "case.updated"
  | "case.closed"
  | "document.generated"
  | "document.sent"
  | "deadline.approaching"
  | "deadline.missed"
  | "payment.succeeded"
  | "payment.refunded";

export interface ApiKey {
  id: string;
  organization_id: string;
  name: string;
  key_prefix: string;
  scopes: ApiKeyScope[];
  rate_limit_per_minute: number;
  revoked_at?: string;
  last_used_at?: string;
  created_at: string;
}

export interface WebhookSubscription {
  id: string;
  organization_id: string;
  url: string;
  events: WebhookEvent[];
  secret_hash: string;
  active: boolean;
  failure_count: number;
  last_delivery_at?: string;
  created_at: string;
}

const KEY_PREFIX_LEN = 8;

export function generateApiKey(): { raw: string; prefix: string; hash: string } {
  const raw = "dlk_" + randomBytes(28).toString("base64url");
  const prefix = raw.slice(0, KEY_PREFIX_LEN);
  const hash = createHash("sha256").update(raw).digest("hex");
  return { raw, prefix, hash };
}

export function generateWebhookSecret(): { raw: string; hash: string } {
  const raw = "whsec_" + randomBytes(28).toString("base64url");
  const hash = createHash("sha256").update(raw).digest("hex");
  return { raw, hash };
}

export async function createApiKey(
  organizationId: string,
  name: string,
  scopes: ApiKeyScope[],
): Promise<{ ok: true; key: string; prefix: string; id: string } | { ok: false; error: string }> {
  const supabase = getSupabaseAdmin();
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;
  const { raw, prefix, hash } = generateApiKey();
  const { data, error } = await sb
    .from("api_keys")
    .insert({
      organization_id: organizationId,
      name,
      key_prefix: prefix,
      key_hash: hash,
      scopes,
      rate_limit_per_minute: 60,
    })
    .select("id")
    .single();
  if (error || !data) return { ok: false, error: error?.message ?? "create_failed" };
  return { ok: true, key: raw, prefix, id: data.id };
}

export async function verifyApiKey(rawKey: string): Promise<{ ok: true; key: ApiKey } | { ok: false; reason: string }> {
  if (!rawKey?.startsWith("dlk_")) return { ok: false, reason: "invalid_format" };
  const supabase = getSupabaseAdmin();
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;
  const hash = createHash("sha256").update(rawKey).digest("hex");
  const { data, error } = await sb
    .from("api_keys")
    .select("*")
    .eq("key_hash", hash)
    .maybeSingle();
  if (error || !data) return { ok: false, reason: "not_found" };
  if (data.revoked_at) return { ok: false, reason: "revoked" };
  // Fire-and-forget last_used_at update
  sb.from("api_keys").update({ last_used_at: new Date().toISOString() }).eq("id", data.id).then(
    () => {},
    () => {},
  );
  return { ok: true, key: data as ApiKey };
}

export function hasApiScope(key: { scopes: ApiKeyScope[] }, required: ApiKeyScope): boolean {
  return key.scopes.includes(required);
}

/**
 * Sign webhook payload with HMAC-SHA256.
 */
export function signWebhookPayload(payload: string, secret: string): { timestamp: number; signature: string } {
  const timestamp = Math.floor(Date.now() / 1000);
  const signedPayload = `${timestamp}.${payload}`;
  const signature = createHmac("sha256", secret).update(signedPayload).digest("hex");
  return { timestamp, signature };
}

export function verifyWebhookSignature(payload: string, header: string, secret: string, toleranceSeconds = 300): boolean {
  // Header format: "t=1234567890,v1=abc..."
  const parts = header.split(",").reduce<Record<string, string>>((acc, kv) => {
    const [k, v] = kv.split("=");
    if (k && v) acc[k.trim()] = v.trim();
    return acc;
  }, {});
  const ts = parseInt(parts.t ?? "0", 10);
  const sig = parts.v1;
  if (!ts || !sig) return false;
  if (Math.abs(Math.floor(Date.now() / 1000) - ts) > toleranceSeconds) return false;
  const expected = createHmac("sha256", secret).update(`${ts}.${payload}`).digest("hex");
  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(sig));
  } catch {
    return false;
  }
}

export async function dispatchWebhook(event: WebhookEvent, organizationId: string, payload: Record<string, unknown>): Promise<void> {
  const supabase = getSupabaseAdmin();
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;
  const { data: subs } = await sb
    .from("webhook_subscriptions")
    .select("*")
    .eq("organization_id", organizationId)
    .eq("active", true);
  if (!subs || subs.length === 0) return;

  const body = JSON.stringify({ event, data: payload, delivered_at: new Date().toISOString() });

  await Promise.allSettled(
    subs
      .filter((s: any) => s.events?.includes(event))
      .map(async (s: any) => {
        try {
          // Get the raw secret for signing - in production, would store the raw secret encrypted
          const { data: secretRow } = await sb
            .from("webhook_secrets")
            .select("raw_secret")
            .eq("subscription_id", s.id)
            .maybeSingle();
          const secret = secretRow?.raw_secret ?? "";
          const { timestamp, signature } = signWebhookPayload(body, secret);
          const headers: Record<string, string> = {
            "Content-Type": "application/json",
            "X-Dlugomat-Event": event,
            "X-Dlugomat-Signature": `t=${timestamp},v1=${signature}`,
            "User-Agent": "Dlugomat-Webhooks/1.0",
          };
          const ac = new AbortController();
          const timer = setTimeout(() => ac.abort(), 10_000);
          try {
            const resp = await fetch(s.url, { method: "POST", headers, body, signal: ac.signal });
            const ok = resp.ok;
            await sb
              .from("webhook_subscriptions")
              .update({
                last_delivery_at: new Date().toISOString(),
                failure_count: ok ? 0 : (s.failure_count ?? 0) + 1,
                active: ok ? true : (s.failure_count ?? 0) < 10,
              })
              .eq("id", s.id);
          } finally {
            clearTimeout(timer);
          }
        } catch (err) {
          logger.warn("webhook.dispatch_failed", { sub_id: s.id, error: (err as Error).message });
          await sb
            .from("webhook_subscriptions")
            .update({ failure_count: (s.failure_count ?? 0) + 1, active: (s.failure_count ?? 0) < 10 })
            .eq("id", s.id);
        }
      }),
  );
}
