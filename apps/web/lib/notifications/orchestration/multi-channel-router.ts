/**
 * Tier 18 — Multi-channel notification router.
 *
 * Wybiera optymalny kanał (lub kanały) dla powiadomienia, biorąc pod uwagę:
 *  - preferencje użytkownika (kategoria → kanały)
 *  - DND / quiet days
 *  - frequency cap per kanał
 *  - priorytet (critical pomija ograniczenia)
 *  - fallback chain: jeśli preferowany kanał blokowany, próbuj kolejny
 *
 * Zwraca listę "delivery plans" — które kanały odpalić i jakim payloadem.
 */

import {
  getUserPreferences,
  shouldSendNow,
  type Category,
  type Channel,
  type Priority,
} from "./preferences";
import { checkFrequencyCap, logNotification } from "./frequency-cap";

export interface NotificationPayload {
  email?: { subject: string; html: string; text: string };
  sms?: { body: string };
  push?: { title: string; body: string; url?: string };
  whatsapp?: { body: string; template?: string };
  inapp?: { title: string; body: string; url?: string };
}

export interface DeliveryPlan {
  channel: Channel;
  reason: "preferred" | "fallback";
  payload: NotificationPayload[Channel];
}

export interface RoutingResult {
  plans: DeliveryPlan[];
  skipped: Array<{ channel: Channel; reason: string }>;
}

export async function routeNotification(args: {
  userId: string;
  category: Category;
  priority: Priority;
  payload: NotificationPayload;
  now?: Date;
}): Promise<RoutingResult> {
  const prefs = await getUserPreferences(args.userId);
  const plans: DeliveryPlan[] = [];
  const skipped: Array<{ channel: Channel; reason: string }> = [];

  const channelsForCategory = prefs.categories[args.category] ?? [];
  // Critical: dorzucamy security/sms nawet jeśli kategoria ich nie ma.
  const effective: Channel[] = args.priority === "critical"
    ? Array.from(new Set([...channelsForCategory, "email", "push", "inapp"]))
    : channelsForCategory;

  for (const channel of effective) {
    const payload = args.payload[channel];
    if (!payload) {
      skipped.push({ channel, reason: "no_payload" });
      continue;
    }
    const policy = shouldSendNow({
      prefs,
      category: args.category,
      priority: args.priority,
      channel,
      now: args.now,
    });
    if (!policy.allowed) {
      skipped.push({ channel, reason: policy.reason ?? "policy_blocked" });
      continue;
    }
    const cap = await checkFrequencyCap({
      userId: args.userId,
      channel,
      priority: args.priority,
      prefs,
      now: args.now,
    });
    if (!cap.allowed) {
      skipped.push({ channel, reason: cap.reason ?? "cap_blocked" });
      continue;
    }
    plans.push({ channel, reason: "preferred", payload });
  }

  // Fallback chain dla critical jeśli wszystkie preferred zablokowane.
  if (plans.length === 0 && args.priority === "critical") {
    for (const channel of ["push", "email", "sms", "inapp"] as Channel[]) {
      if (!args.payload[channel]) continue;
      if (plans.find((p) => p.channel === channel)) continue;
      plans.push({ channel, reason: "fallback", payload: args.payload[channel] });
    }
  }

  return { plans, skipped };
}

/**
 * Wykonuje delivery plans używając konkretnych klientów kanałowych.
 * Sender functions są wstrzykiwane (DI) by uniknąć cyklicznych importów.
 */
export interface ChannelSenders {
  email?: (userId: string, p: NonNullable<NotificationPayload["email"]>) => Promise<{ externalId?: string }>;
  sms?: (userId: string, p: NonNullable<NotificationPayload["sms"]>) => Promise<{ externalId?: string }>;
  push?: (userId: string, p: NonNullable<NotificationPayload["push"]>) => Promise<{ externalId?: string }>;
  whatsapp?: (userId: string, p: NonNullable<NotificationPayload["whatsapp"]>) => Promise<{ externalId?: string }>;
  inapp?: (userId: string, p: NonNullable<NotificationPayload["inapp"]>) => Promise<{ externalId?: string }>;
}

export async function executeDeliveryPlans(args: {
  userId: string;
  category: Category;
  priority: Priority;
  plans: DeliveryPlan[];
  senders: ChannelSenders;
}): Promise<Array<{ channel: Channel; ok: boolean; error?: string; externalId?: string }>> {
  const results: Array<{ channel: Channel; ok: boolean; error?: string; externalId?: string }> = [];
  for (const plan of args.plans) {
    const sender = args.senders[plan.channel];
    if (!sender) {
      results.push({ channel: plan.channel, ok: false, error: "no_sender_configured" });
      await logNotification({
        userId: args.userId,
        channel: plan.channel,
        category: args.category,
        priority: args.priority,
        delivered: false,
        errorMessage: "no_sender_configured",
      });
      continue;
    }
    try {
      // @ts-expect-error — payload type narrowed by channel
      const res = await sender(args.userId, plan.payload);
      results.push({ channel: plan.channel, ok: true, externalId: res?.externalId });
      await logNotification({
        userId: args.userId,
        channel: plan.channel,
        category: args.category,
        priority: args.priority,
        delivered: true,
        externalId: res?.externalId,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      results.push({ channel: plan.channel, ok: false, error: msg });
      await logNotification({
        userId: args.userId,
        channel: plan.channel,
        category: args.category,
        priority: args.priority,
        delivered: false,
        errorMessage: msg,
      });
    }
  }
  return results;
}
