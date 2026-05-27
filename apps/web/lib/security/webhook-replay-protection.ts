/**
 * Tier 32 — Webhook signature replay protection.
 *
 * Defense-in-depth dla webhooków wychodzących i przychodzących:
 *   - Timestamp window: requesty starsze niż 5 minut są odrzucane
 *   - Nonce store (Redis/DB): jednorazowy nonce per request, TTL = timestamp window
 *   - HMAC-SHA256 weryfikacja
 *   - Constant-time compare przeciwko timing attacks
 */
import "server-only";
import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import { createServerSupabase } from "@/lib/db/supabase-server";

/** Maksymalna różnica czasowa: 5 minut (sekundy). */
export const TIMESTAMP_TOLERANCE_SECONDS = 300;

/** TTL nonce w bazie: tyle ile timestamp tolerance + 1 min margines. */
export const NONCE_TTL_SECONDS = TIMESTAMP_TOLERANCE_SECONDS + 60;

export interface SignedWebhookHeaders {
  timestamp: string; // unix epoch (sekundy)
  nonce: string;
  signature: string; // hex HMAC-SHA256
}

export interface VerificationResult {
  ok: boolean;
  reason?:
    | "missing_headers"
    | "stale_timestamp"
    | "future_timestamp"
    | "invalid_signature"
    | "nonce_replay"
    | "server_error";
  metadata?: Record<string, unknown>;
}

/** Buduje nagłówki podpisu dla wychodzącego webhooka. */
export function buildSignedHeaders(secret: string, body: string): SignedWebhookHeaders {
  const timestamp = String(Math.floor(Date.now() / 1000));
  const nonce = randomBytes(16).toString("hex");
  const signature = computeSignature(secret, timestamp, nonce, body);
  return { timestamp, nonce, signature };
}

function computeSignature(secret: string, timestamp: string, nonce: string, body: string): string {
  // Format: {timestamp}.{nonce}.{body} — analogicznie jak Stripe
  const payload = `${timestamp}.${nonce}.${body}`;
  return createHmac("sha256", secret).update(payload).digest("hex");
}

/**
 * Weryfikuje przychodzący podpisany webhook.
 *
 * @param secret - HMAC secret zarejestrowany z endpointem
 * @param body - raw body request (string!)
 * @param headers - obiekt z timestamp/nonce/signature (lower-case)
 */
export async function verifyIncomingWebhook(
  secret: string,
  body: string,
  headers: Partial<SignedWebhookHeaders>,
): Promise<VerificationResult> {
  if (!headers.timestamp || !headers.nonce || !headers.signature) {
    return { ok: false, reason: "missing_headers" };
  }

  const ts = parseInt(headers.timestamp, 10);
  if (!Number.isFinite(ts)) {
    return { ok: false, reason: "missing_headers" };
  }
  const now = Math.floor(Date.now() / 1000);

  // 1) Timestamp window check
  if (now - ts > TIMESTAMP_TOLERANCE_SECONDS) {
    return {
      ok: false,
      reason: "stale_timestamp",
      metadata: { age_seconds: now - ts, tolerance: TIMESTAMP_TOLERANCE_SECONDS },
    };
  }
  if (ts - now > 60) {
    // Tolerujemy 60s clock skew w przód
    return { ok: false, reason: "future_timestamp", metadata: { skew_seconds: ts - now } };
  }

  // 2) Constant-time signature compare
  const expected = computeSignature(secret, headers.timestamp, headers.nonce, body);
  const provided = headers.signature;
  if (expected.length !== provided.length) {
    return { ok: false, reason: "invalid_signature" };
  }
  const a = Buffer.from(expected, "hex");
  const b = Buffer.from(provided, "hex");
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return { ok: false, reason: "invalid_signature" };
  }

  // 3) Nonce replay check — atomicznie INSERT z UNIQUE constraint
  try {
    // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb: any = await createServerSupabase();
    const { error } = await sb.from("webhook_nonces").insert({
      nonce: headers.nonce,
      timestamp_unix: ts,
      created_at: new Date().toISOString(),
      expires_at: new Date((ts + NONCE_TTL_SECONDS) * 1000).toISOString(),
    });
    if (error) {
      // Naruszenie UNIQUE → replay attack
      if (error.code === "23505" || /duplicate/i.test(error.message)) {
        return { ok: false, reason: "nonce_replay" };
      }
      return { ok: false, reason: "server_error", metadata: { db_error: error.message } };
    }
  } catch (e: any) {
    return { ok: false, reason: "server_error", metadata: { exception: e?.message } };
  }

  return { ok: true };
}

/**
 * Cron job: czyści wygasłe nonce'y z bazy.
 * Wywoływany co 10 minut przez Vercel Cron.
 */
export async function cleanupExpiredNonces(): Promise<{ deleted: number }> {
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb: any = await createServerSupabase();
  const cutoff = new Date(Date.now() - NONCE_TTL_SECONDS * 1000).toISOString();
  const { count, error } = await sb
    .from("webhook_nonces")
    .delete({ count: "exact" })
    .lt("expires_at", cutoff);
  if (error) throw new Error(`nonce_cleanup_failed: ${error.message}`);
  return { deleted: count ?? 0 };
}
