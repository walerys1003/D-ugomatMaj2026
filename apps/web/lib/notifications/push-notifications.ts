/**
 * Web Push notifications (PWA) — zad. 341
 *
 * VAPID-based push subscription management + send helper.
 * Lazy-imports `web-push` if installed; otherwise no-op.
 */

import { getSupabaseAdmin } from "@/lib/db/supabase-admin";
import { logger } from "@/lib/observability/logger";

export interface PushSubscriptionRecord {
  id?: string;
  user_id: string;
  endpoint: string;
  keys: { p256dh: string; auth: string };
  user_agent?: string;
  created_at?: string;
  last_seen_at?: string;
  failed_count?: number;
}

export interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  url?: string;
  tag?: string;
  /** Renotify even if same tag */
  renotify?: boolean;
  /** Vibration pattern */
  vibrate?: number[];
  /** Action buttons */
  actions?: Array<{ action: string; title: string; icon?: string }>;
  /** Custom data forwarded to SW */
  data?: Record<string, unknown>;
}

interface VapidConfig {
  publicKey: string;
  privateKey: string;
  subject: string;
}

function getVapidConfig(): VapidConfig | null {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT ?? "mailto:no-reply@dlugomat.pl";
  if (!publicKey || !privateKey) return null;
  return { publicKey, privateKey, subject };
}

export function getVapidPublicKey(): string | null {
  return process.env.VAPID_PUBLIC_KEY ?? null;
}

/**
 * Save / upsert a push subscription for the authenticated user.
 */
export async function saveSubscription(rec: PushSubscriptionRecord): Promise<{ ok: true } | { ok: false; error: string }> {
  const sb = getSupabaseAdmin();
  try {
    const { error } = await sb.from("push_subscriptions").upsert(
      {
        user_id: rec.user_id,
        endpoint: rec.endpoint,
        keys: rec.keys,
        user_agent: rec.user_agent ?? null,
        last_seen_at: new Date().toISOString(),
        failed_count: 0,
      },
      { onConflict: "endpoint" },
    );
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

export async function removeSubscription(endpoint: string): Promise<void> {
  const sb = getSupabaseAdmin();
  await sb.from("push_subscriptions").delete().eq("endpoint", endpoint);
}

/**
 * Send a push notification to all subscriptions of a user.
 * Returns count of successful sends.
 */
export async function sendPushToUser(userId: string, payload: PushPayload): Promise<number> {
  const cfg = getVapidConfig();
  if (!cfg) {
    logger.debug("push.disabled", { reason: "no_vapid" });
    return 0;
  }

  let webpush: any;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    webpush = await import("web-push").then((m: any) => m.default ?? m).catch(() => null);
  } catch {
    webpush = null;
  }
  if (!webpush) {
    logger.debug("push.web_push_not_installed");
    return 0;
  }

  webpush.setVapidDetails(cfg.subject, cfg.publicKey, cfg.privateKey);

  const sb = getSupabaseAdmin();
  const { data: subs, error } = await sb
    .from("push_subscriptions")
    .select("id, endpoint, keys, failed_count")
    .eq("user_id", userId);
  if (error || !subs) {
    logger.warn("push.fetch_subs_failed", { user_id: userId, error: error?.message });
    return 0;
  }

  let success = 0;
  for (const sub of subs) {
    try {
      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: sub.keys },
        JSON.stringify(payload),
        { TTL: 86400, urgency: "normal" },
      );
      success++;
      await sb
        .from("push_subscriptions")
        .update({ last_seen_at: new Date().toISOString(), failed_count: 0 })
        .eq("id", sub.id);
    } catch (err: any) {
      const status = err?.statusCode ?? 0;
      logger.warn("push.send_failed", { sub_id: sub.id, status, message: err?.message });
      // 410 Gone / 404: subscription is dead — remove
      if (status === 404 || status === 410) {
        await removeSubscription(sub.endpoint);
      } else {
        // increment failed count; remove after 5 failures
        const failed = (sub.failed_count ?? 0) + 1;
        if (failed >= 5) {
          await removeSubscription(sub.endpoint);
        } else {
          await sb.from("push_subscriptions").update({ failed_count: failed }).eq("id", sub.id);
        }
      }
    }
  }
  return success;
}

/**
 * Convenience for deadline reminders.
 */
export async function sendDeadlineReminder(
  userId: string,
  opts: { case_id: string; title: string; due_at: string; url?: string },
): Promise<number> {
  const dueDate = new Date(opts.due_at);
  const days = Math.ceil((dueDate.getTime() - Date.now()) / 86_400_000);
  return sendPushToUser(userId, {
    title: days <= 1 ? "⚠️ Termin jutro!" : `Termin za ${days} dni`,
    body: opts.title,
    url: opts.url ?? `/app/sprawy/${opts.case_id}`,
    tag: `deadline-${opts.case_id}`,
    renotify: true,
    icon: "/icons/icon-192.png",
    badge: "/icons/badge-72.png",
    actions: [
      { action: "view", title: "Otwórz sprawę" },
      { action: "snooze", title: "Przypomnij za 24h" },
    ],
    data: { case_id: opts.case_id, kind: "deadline_reminder" },
  });
}
