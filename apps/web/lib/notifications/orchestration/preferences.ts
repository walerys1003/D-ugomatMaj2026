/**
 * Tier 18 — Notification preferences + DND (Do Not Disturb).
 *
 * Model:
 *  - per-user preferencje per kanał (email/sms/push/whatsapp) z togglem on/off
 *  - per-kategoria (deadline/marketing/system/security) z różnymi domyślnymi
 *  - DND window (godziny ciszy + strefa czasowa)
 *  - frequency cap (max liczba powiadomień / godz., /dobę, /tydzień)
 *  - quiet days (np. niedziele) — z wyjątkiem "critical" (D0/D1 + security)
 */

import { createSupabaseServerClient } from "@/lib/db/supabase-server";

export type Channel = "email" | "sms" | "push" | "whatsapp" | "inapp";
export type Category =
  | "deadline"
  | "case_update"
  | "marketing"
  | "system"
  | "security"
  | "billing"
  | "onboarding";

export type Priority = "low" | "normal" | "high" | "critical";

export interface NotificationPreferences {
  user_id: string;
  channels: Record<Channel, boolean>;
  categories: Record<Category, Channel[]>;
  dnd_start: string | null; // "22:00"
  dnd_end: string | null;   // "07:00"
  timezone: string;          // "Europe/Warsaw"
  quiet_days: number[];      // 0-6 (Sun=0)
  caps: {
    perHour: number;
    perDay: number;
    perWeek: number;
  };
  updated_at: string;
}

export const DEFAULT_PREFS: Omit<NotificationPreferences, "user_id" | "updated_at"> = {
  channels: {
    email: true,
    sms: true,
    push: true,
    whatsapp: false,
    inapp: true,
  },
  categories: {
    deadline:    ["email", "push", "inapp", "sms"],
    case_update: ["email", "push", "inapp"],
    marketing:   ["email"],
    system:      ["email", "inapp"],
    security:    ["email", "push", "sms"],
    billing:     ["email", "inapp"],
    onboarding:  ["email", "inapp"],
  },
  dnd_start: "22:00",
  dnd_end: "07:00",
  timezone: "Europe/Warsaw",
  quiet_days: [],
  caps: { perHour: 6, perDay: 30, perWeek: 120 },
};

export async function getUserPreferences(userId: string): Promise<NotificationPreferences> {
  const supabase = await createSupabaseServerClient();
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;
  const { data, error } = await sb
    .from("notification_preferences")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  if (data) return data as NotificationPreferences;
  return {
    user_id: userId,
    ...DEFAULT_PREFS,
    updated_at: new Date().toISOString(),
  };
}

export async function updateUserPreferences(
  userId: string,
  patch: Partial<NotificationPreferences>,
): Promise<NotificationPreferences> {
  const supabase = await createSupabaseServerClient();
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;
  const merged = { ...(await getUserPreferences(userId)), ...patch, user_id: userId, updated_at: new Date().toISOString() };
  const { data, error } = await sb
    .from("notification_preferences")
    .upsert(merged, { onConflict: "user_id" })
    .select("*")
    .single();
  if (error) throw error;
  return data as NotificationPreferences;
}

/** Czy aktualnie obowiązuje DND? Wewnątrz strefy czasowej użytkownika. */
export function isWithinDnd(prefs: NotificationPreferences, now: Date = new Date()): boolean {
  if (!prefs.dnd_start || !prefs.dnd_end) return false;
  const minutes = localMinutes(now, prefs.timezone);
  const start = parseHm(prefs.dnd_start);
  const end = parseHm(prefs.dnd_end);
  if (start === null || end === null) return false;
  if (start === end) return false;
  if (start < end) {
    return minutes >= start && minutes < end;
  }
  // okno przechodzi przez północ
  return minutes >= start || minutes < end;
}

function parseHm(hm: string): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hm);
  if (!m) return null;
  return Number(m[1]) * 60 + Number(m[2]);
}

function localMinutes(d: Date, tz: string): number {
  try {
    const fmt = new Intl.DateTimeFormat("en-GB", {
      timeZone: tz,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const [hh, mm] = fmt.format(d).split(":").map(Number);
    return hh * 60 + mm;
  } catch {
    return d.getUTCHours() * 60 + d.getUTCMinutes();
  }
}

/** Czy dzień tygodnia jest quiet day? */
export function isQuietDay(prefs: NotificationPreferences, now: Date = new Date()): boolean {
  try {
    const fmt = new Intl.DateTimeFormat("en-US", {
      timeZone: prefs.timezone,
      weekday: "short",
    });
    const weekdayMap: Record<string, number> = {
      Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
    };
    const wd = weekdayMap[fmt.format(now)];
    return prefs.quiet_days.includes(wd);
  } catch {
    return prefs.quiet_days.includes(now.getUTCDay());
  }
}

/**
 * Decyzja: czy w danym momencie wolno wysłać powiadomienie konkretnej kategorii
 * o danym priorytecie? Critical zawsze przechodzi, niezależnie od DND/quiet.
 */
export function shouldSendNow(args: {
  prefs: NotificationPreferences;
  category: Category;
  priority: Priority;
  channel: Channel;
  now?: Date;
}): { allowed: boolean; reason?: string } {
  const { prefs, category, priority, channel, now } = args;
  if (!prefs.channels[channel]) return { allowed: false, reason: "channel_disabled" };
  const channelsForCategory = prefs.categories[category] ?? [];
  if (!channelsForCategory.includes(channel)) {
    return { allowed: false, reason: "category_channel_off" };
  }
  if (priority === "critical") return { allowed: true };
  if (isWithinDnd(prefs, now)) return { allowed: false, reason: "dnd_active" };
  if (isQuietDay(prefs, now)) return { allowed: false, reason: "quiet_day" };
  return { allowed: true };
}
