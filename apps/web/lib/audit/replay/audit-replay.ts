/**
 * Tier 21 — Audit log replay.
 *
 * Umożliwia odtworzenie historii zdarzeń realtime / audytowych:
 *  - po topicu (np. "case:42" — pełna oś czasu)
 *  - po użytkowniku (kto co robił w zakresie czasu)
 *  - po typie eventu (np. wszystkie "doc.updated")
 *  - z paginacją (cursor-based — occurred_at + id)
 *
 * Źródła:
 *  - `realtime_events` (Tier 21 — fan-out broker events)
 *  - `audit_log` (Tier 13 / 17 — auth, security, admin actions) — opcjonalnie merge
 *
 * Replay vs streaming:
 *  - replay = historyczna oś czasu (oddany na żądanie REST)
 *  - streaming = live SSE przez channel-broker
 *  - klient łączy: pobiera replay od `since`, potem subskrybuje SSE z `id > last`
 */

import { createSupabaseServerClient } from "@/lib/db/supabase-server";
import type { RealtimeEvent, RealtimeEventKind } from "@/lib/realtime/channel/channel-broker";

export interface ReplayCursor {
  occurred_at: string;
  id: string;
}

export interface ReplayFilter {
  topic?: string;
  topicPrefix?: string; // np. "case:" — wszystkie sprawy
  userId?: string;
  kinds?: RealtimeEventKind[];
  since?: string; // ISO
  until?: string; // ISO
}

export interface ReplayPage {
  events: RealtimeEvent[];
  nextCursor: ReplayCursor | null;
  hasMore: boolean;
}

const DEFAULT_LIMIT = 200;
const MAX_LIMIT = 1000;

/**
 * Główna funkcja replay — zwraca posortowaną stronę eventów.
 */
export async function replayEvents(args: {
  filter: ReplayFilter;
  cursor?: ReplayCursor;
  limit?: number;
}): Promise<ReplayPage> {
  const limit = Math.min(args.limit ?? DEFAULT_LIMIT, MAX_LIMIT);
  const supabase = await createSupabaseServerClient();

  let q = supabase
    .from("realtime_events")
    .select("*")
    .order("occurred_at", { ascending: true })
    .order("id", { ascending: true })
    .limit(limit + 1);

  if (args.filter.topic) {
    q = q.eq("topic", args.filter.topic);
  } else if (args.filter.topicPrefix) {
    q = q.like("topic", `${args.filter.topicPrefix}%`);
  }
  if (args.filter.userId) q = q.eq("user_id", args.filter.userId);
  if (args.filter.kinds && args.filter.kinds.length > 0) {
    q = q.in("kind", args.filter.kinds);
  }
  if (args.filter.since) q = q.gte("occurred_at", args.filter.since);
  if (args.filter.until) q = q.lte("occurred_at", args.filter.until);

  // Cursor-based pagination — (occurred_at, id) > cursor
  if (args.cursor) {
    q = q.or(
      `occurred_at.gt.${args.cursor.occurred_at},and(occurred_at.eq.${args.cursor.occurred_at},id.gt.${args.cursor.id})`,
    );
  }

  const { data, error } = await q;
  if (error) throw error;
  const rows = (data ?? []) as RealtimeEvent[];

  const hasMore = rows.length > limit;
  const events = hasMore ? rows.slice(0, limit) : rows;
  const last = events[events.length - 1];
  const nextCursor: ReplayCursor | null = hasMore && last
    ? { occurred_at: last.occurred_at, id: last.id }
    : null;

  return { events, nextCursor, hasMore };
}

/**
 * Skompresowana oś czasu dla UI — grupuje eventy po dniu + zwraca count per kind.
 */
export async function timelineSummary(args: {
  filter: ReplayFilter;
  bucket?: "hour" | "day" | "week";
}): Promise<Array<{ bucket: string; total: number; perKind: Record<string, number> }>> {
  const page = await replayEvents({ filter: args.filter, limit: MAX_LIMIT });
  const bucket = args.bucket ?? "day";
  const buckets = new Map<string, { total: number; perKind: Record<string, number> }>();

  for (const ev of page.events) {
    const date = new Date(ev.occurred_at);
    const key = bucketKey(date, bucket);
    let entry = buckets.get(key);
    if (!entry) {
      entry = { total: 0, perKind: {} };
      buckets.set(key, entry);
    }
    entry.total++;
    entry.perKind[ev.kind] = (entry.perKind[ev.kind] ?? 0) + 1;
  }

  return Array.from(buckets.entries())
    .map(([bucket, v]) => ({ bucket, ...v }))
    .sort((a, b) => a.bucket.localeCompare(b.bucket));
}

function bucketKey(d: Date, bucket: "hour" | "day" | "week"): string {
  if (bucket === "hour") return d.toISOString().slice(0, 13) + ":00";
  if (bucket === "day") return d.toISOString().slice(0, 10);
  // ISO week
  const tmp = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const day = tmp.getUTCDay() || 7;
  tmp.setUTCDate(tmp.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
  const weekNum = Math.ceil(((tmp.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${tmp.getUTCFullYear()}-W${String(weekNum).padStart(2, "0")}`;
}

/**
 * Reconstruktor stanu — re-aplikuje eventy danego typu by zbudować snapshot.
 * Używane np. dla "podgląd stanu sprawy z 2026-04-01" (point-in-time replay).
 */
export async function reconstructSnapshot<T extends Record<string, unknown>>(args: {
  topic: string;
  asOf: string;
  initial: T;
  reducer: (state: T, event: RealtimeEvent) => T;
}): Promise<T> {
  let state = args.initial;
  let cursor: ReplayCursor | undefined;
  for (let pages = 0; pages < 50; pages++) {
    const page = await replayEvents({
      filter: { topic: args.topic, until: args.asOf },
      cursor,
      limit: 500,
    });
    for (const ev of page.events) {
      state = args.reducer(state, ev);
    }
    if (!page.hasMore || !page.nextCursor) break;
    cursor = page.nextCursor;
  }
  return state;
}

/**
 * Eksport audytu (np. dla DPO / GDPR data export) — strumień NDJSON dla danego usera.
 */
export async function exportUserAuditTrail(args: {
  userId: string;
  since?: string;
  until?: string;
}): Promise<string> {
  let cursor: ReplayCursor | undefined;
  const lines: string[] = [];
  for (let pages = 0; pages < 100; pages++) {
    const page = await replayEvents({
      filter: { userId: args.userId, since: args.since, until: args.until },
      cursor,
      limit: 1000,
    });
    for (const ev of page.events) {
      lines.push(JSON.stringify(ev));
    }
    if (!page.hasMore || !page.nextCursor) break;
    cursor = page.nextCursor;
  }
  return lines.join("\n");
}
