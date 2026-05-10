/**
 * Tier 18 — Frequency cap enforcement.
 *
 * Sliding-window counter per user × channel:
 *  - perHour  → ostatnie 60 min
 *  - perDay   → ostatnie 24h
 *  - perWeek  → ostatnie 7 dni
 *
 * Critical priority pomija cap (security alert / D0 termin).
 * Wszystko sprawdzane w DB (tabela `notification_log`).
 */

import { createSupabaseServerClient } from "@/lib/db/supabase-server";
import type { Channel, NotificationPreferences, Priority } from "./preferences";

export interface CapDecision {
  allowed: boolean;
  reason?: "hour_cap" | "day_cap" | "week_cap";
  windowCount: number;
  cap: number;
}

export async function checkFrequencyCap(args: {
  userId: string;
  channel: Channel;
  priority: Priority;
  prefs: NotificationPreferences;
  now?: Date;
}): Promise<CapDecision> {
  const now = args.now ?? new Date();
  if (args.priority === "critical") {
    return { allowed: true, windowCount: 0, cap: -1 };
  }

  const supabase = await createSupabaseServerClient();

  const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const baseQuery = supabase
    .from("notification_log")
    .select("sent_at", { count: "exact", head: true })
    .eq("user_id", args.userId)
    .eq("channel", args.channel)
    .eq("delivered", true);

  const [hourRes, dayRes, weekRes] = await Promise.all([
    baseQuery.gte("sent_at", hourAgo.toISOString()),
    baseQuery.gte("sent_at", dayAgo.toISOString()),
    baseQuery.gte("sent_at", weekAgo.toISOString()),
  ]);

  const hourCount = hourRes.count ?? 0;
  const dayCount = dayRes.count ?? 0;
  const weekCount = weekRes.count ?? 0;

  if (hourCount >= args.prefs.caps.perHour) {
    return { allowed: false, reason: "hour_cap", windowCount: hourCount, cap: args.prefs.caps.perHour };
  }
  if (dayCount >= args.prefs.caps.perDay) {
    return { allowed: false, reason: "day_cap", windowCount: dayCount, cap: args.prefs.caps.perDay };
  }
  if (weekCount >= args.prefs.caps.perWeek) {
    return { allowed: false, reason: "week_cap", windowCount: weekCount, cap: args.prefs.caps.perWeek };
  }

  return { allowed: true, windowCount: dayCount, cap: args.prefs.caps.perDay };
}

export async function logNotification(args: {
  userId: string;
  channel: Channel;
  category: string;
  priority: Priority;
  delivered: boolean;
  errorMessage?: string;
  externalId?: string;
}): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase.from("notification_log").insert({
    user_id: args.userId,
    channel: args.channel,
    category: args.category,
    priority: args.priority,
    delivered: args.delivered,
    error_message: args.errorMessage ?? null,
    external_id: args.externalId ?? null,
    sent_at: new Date().toISOString(),
  });
}
