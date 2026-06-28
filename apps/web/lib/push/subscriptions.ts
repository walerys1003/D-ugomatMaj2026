// Push subscription persistence — one row per (user, endpoint).
import { randomUUID, createHash } from "crypto";
import type { PushSubscriptionJSON, PushPayload } from "./web-push";

export interface PushSubscriptionRow {
  id: string;
  userId: string;
  endpoint: string;
  endpointHash: string;
  p256dh: string;
  auth: string;
  userAgent?: string;
  createdAt: string;
  lastSeenAt: string;
  active: boolean;
}

export async function upsertPushSubscription(
  supabase: any,
  userId: string,
  sub: PushSubscriptionJSON,
  userAgent?: string,
): Promise<PushSubscriptionRow> {
  const endpointHash = createHash("sha256").update(sub.endpoint).digest("hex");
  const row = {
    id: randomUUID(),
    user_id: userId,
    endpoint: sub.endpoint,
    endpoint_hash: endpointHash,
    p256dh: sub.keys.p256dh,
    auth: sub.keys.auth,
    user_agent: userAgent ?? null,
    last_seen_at: new Date().toISOString(),
    active: true,
  };
  const { data, error } = await supabase
    .from("push_subscriptions")
    .upsert(row, { onConflict: "user_id,endpoint_hash" })
    .select("*")
    .single();
  if (error) throw error;
  return mapSubscription(data);
}

export async function listUserSubscriptions(supabase: any, userId: string): Promise<PushSubscriptionRow[]> {
  const { data, error } = await supabase
    .from("push_subscriptions")
    .select("*")
    .eq("user_id", userId)
    .eq("active", true);
  if (error) throw error;
  return (data ?? []).map(mapSubscription);
}

export async function deactivateSubscription(supabase: any, endpointHash: string): Promise<void> {
  await supabase.from("push_subscriptions").update({ active: false }).eq("endpoint_hash", endpointHash);
}

export async function fanoutPush(
  supabase: any,
  userId: string,
  payload: PushPayload,
  cfg: { vapidPublicKey: string; vapidPrivateKey: string; vapidSubject: string },
): Promise<{ delivered: number; failed: number }> {
  const subs = await listUserSubscriptions(supabase, userId);
  const { deliverPush } = await import("./web-push");
  let delivered = 0;
  let failed = 0;
  for (const s of subs) {
    const result = await deliverPush(
      { endpoint: s.endpoint, expirationTime: null, keys: { p256dh: s.p256dh, auth: s.auth } },
      payload,
      cfg,
    );
    if (result.ok) {
      delivered++;
    } else {
      failed++;
      // Stale / unsubscribed — deactivate so we stop trying.
      if (result.statusCode === 404 || result.statusCode === 410) {
        await deactivateSubscription(supabase, s.endpointHash);
      }
    }
  }
  return { delivered, failed };
}

function mapSubscription(r: any): PushSubscriptionRow {
  return {
    id: r.id,
    userId: r.user_id,
    endpoint: r.endpoint,
    endpointHash: r.endpoint_hash,
    p256dh: r.p256dh,
    auth: r.auth,
    userAgent: r.user_agent ?? undefined,
    createdAt: r.created_at,
    lastSeenAt: r.last_seen_at,
    active: !!r.active,
  };
}
