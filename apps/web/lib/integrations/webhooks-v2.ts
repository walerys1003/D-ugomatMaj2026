/**
 * Tier 12 — Webhooks v2 with signed delivery, retries, and dead-letter queue.
 * HMAC-SHA256 signature in X-Dlugomat-Signature header, X-Dlugomat-Timestamp for replay protection.
 */
import { createHash, createHmac, randomUUID } from "crypto";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";

export type WebhookEvent =
  | "case.created"
  | "case.updated"
  | "case.deleted"
  | "document.generated"
  | "payment.succeeded"
  | "payment.failed"
  | "subscription.created"
  | "subscription.canceled"
  | "subscription.renewed"
  | "user.signed_up"
  | "deadline.approaching"
  | "ai.completed"
  | "invoice.issued"
  | "affiliate.commission";

export interface WebhookEndpoint {
  id: string;
  user_id: string;
  url: string;
  secret: string;
  events: WebhookEvent[];
  enabled: boolean;
  failure_count: number;
  last_success_at?: string | null;
  last_failure_at?: string | null;
}

export interface WebhookDelivery {
  id: string;
  endpoint_id: string;
  event: WebhookEvent;
  payload: Record<string, unknown>;
  status: "pending" | "delivered" | "failed" | "dead_lettered";
  attempts: number;
  next_attempt_at?: string | null;
  last_response_status?: number | null;
  last_response_body?: string | null;
}

const MAX_ATTEMPTS = 8;
// Exponential backoff: 30s / 2m / 10m / 30m / 1h / 4h / 12h / 24h
const BACKOFF_SECONDS = [30, 120, 600, 1800, 3600, 14400, 43200, 86400];

export function newSecret(): string {
  return `whsec_${randomUUID().replace(/-/g, "")}`;
}

export function signPayload(secret: string, timestamp: number, body: string): string {
  const h = createHmac("sha256", secret);
  h.update(`${timestamp}.${body}`);
  return `t=${timestamp},v1=${h.digest("hex")}`;
}

export function verifySignature(secret: string, header: string, body: string, toleranceSec = 300): boolean {
  const parts = Object.fromEntries(header.split(",").map((p) => p.split("=") as [string, string]));
  const t = parseInt(parts.t ?? "0", 10);
  const sig = parts.v1;
  if (!t || !sig) return false;
  if (Math.abs(Date.now() / 1000 - t) > toleranceSec) return false;
  const expected = createHmac("sha256", secret).update(`${t}.${body}`).digest("hex");
  // constant-time compare
  if (sig.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < sig.length; i++) diff |= sig.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff === 0;
}

export async function registerEndpoint(input: {
  user_id: string;
  url: string;
  events: WebhookEvent[];
}): Promise<WebhookEndpoint> {
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb: any = await createSupabaseServerClient();
  const endpoint: Omit<WebhookEndpoint, never> = {
    id: randomUUID(),
    user_id: input.user_id,
    url: input.url,
    secret: newSecret(),
    events: input.events,
    enabled: true,
    failure_count: 0,
  };
  await sb.from("webhook_endpoints").insert({
    ...endpoint,
    created_at: new Date().toISOString(),
  });
  return endpoint;
}

export async function emitEvent(event: WebhookEvent, userId: string, payload: Record<string, unknown>): Promise<number> {
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb: any = await createSupabaseServerClient();
  const { data: endpoints } = await sb
    .from("webhook_endpoints")
    .select("*")
    .eq("user_id", userId)
    .eq("enabled", true)
    .contains("events", [event]);
  if (!endpoints || endpoints.length === 0) return 0;
  const now = new Date().toISOString();
  const rows = endpoints.map((e: any) => ({
    id: randomUUID(),
    endpoint_id: e.id,
    event,
    payload,
    status: "pending",
    attempts: 0,
    next_attempt_at: now,
    created_at: now,
  }));
  await sb.from("webhook_deliveries").insert(rows);
  return rows.length;
}

export async function processDueDeliveries(batchSize = 25): Promise<{ delivered: number; failed: number; dead: number }> {
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb: any = await createSupabaseServerClient();
  const now = new Date().toISOString();
  const { data: due } = await sb
    .from("webhook_deliveries")
    .select("*, endpoint:webhook_endpoints(*)")
    .in("status", ["pending", "failed"])
    .lte("next_attempt_at", now)
    .lt("attempts", MAX_ATTEMPTS)
    .order("next_attempt_at", { ascending: true })
    .limit(batchSize);
  let delivered = 0;
  let failed = 0;
  let dead = 0;
  for (const d of (due as any[]) ?? []) {
    const endpoint = d.endpoint as WebhookEndpoint;
    if (!endpoint || !endpoint.enabled) continue;
    const body = JSON.stringify({ id: d.id, event: d.event, data: d.payload, created_at: d.created_at ?? now });
    const ts = Math.floor(Date.now() / 1000);
    const sig = signPayload(endpoint.secret, ts, body);
    let respStatus = 0;
    let respText = "";
    try {
      const res = await fetch(endpoint.url, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "X-Dlugomat-Signature": sig,
          "X-Dlugomat-Timestamp": String(ts),
          "X-Dlugomat-Event": d.event,
          "User-Agent": "Dlugomat-Webhook/2.0",
        },
        body,
        signal: AbortSignal.timeout(10_000),
      });
      respStatus = res.status;
      respText = (await res.text()).slice(0, 1000);
    } catch (e) {
      respStatus = 0;
      respText = String(e).slice(0, 1000);
    }
    const ok = respStatus >= 200 && respStatus < 300;
    const attempts = (d.attempts ?? 0) + 1;
    if (ok) {
      delivered++;
      await sb
        .from("webhook_deliveries")
        .update({ status: "delivered", attempts, last_response_status: respStatus, last_response_body: respText, delivered_at: new Date().toISOString() })
        .eq("id", d.id);
      await sb.from("webhook_endpoints").update({ failure_count: 0, last_success_at: new Date().toISOString() }).eq("id", endpoint.id);
    } else if (attempts >= MAX_ATTEMPTS) {
      dead++;
      await sb
        .from("webhook_deliveries")
        .update({ status: "dead_lettered", attempts, last_response_status: respStatus, last_response_body: respText })
        .eq("id", d.id);
    } else {
      failed++;
      const backoff = BACKOFF_SECONDS[Math.min(attempts - 1, BACKOFF_SECONDS.length - 1)];
      const nextAt = new Date(Date.now() + backoff * 1000).toISOString();
      await sb
        .from("webhook_deliveries")
        .update({ status: "failed", attempts, next_attempt_at: nextAt, last_response_status: respStatus, last_response_body: respText })
        .eq("id", d.id);
      await sb
        .from("webhook_endpoints")
        .update({ failure_count: (endpoint.failure_count ?? 0) + 1, last_failure_at: new Date().toISOString() })
        .eq("id", endpoint.id);
    }
  }
  return { delivered, failed, dead };
}

export function fingerprintPayload(payload: Record<string, unknown>): string {
  return createHash("sha256").update(JSON.stringify(payload)).digest("hex").slice(0, 16);
}
