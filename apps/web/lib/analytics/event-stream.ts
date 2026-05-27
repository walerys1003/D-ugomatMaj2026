/**
 * Tier 14 — Event stream ingestion (product analytics layer).
 * Tracks raw user/system events for downstream BI queries.
 */
import { createServerSupabase } from "@/lib/db/supabase-server";
import { createHash } from "crypto";

export interface AnalyticsEvent {
  user_id?: string | null;
  org_id?: string | null;
  session_id?: string | null;
  anonymous_id?: string | null;
  event: string;
  properties?: Record<string, unknown>;
  context?: { ip?: string; user_agent?: string; locale?: string; referrer?: string; path?: string };
  occurred_at?: string;
}

export async function trackEvent(e: AnalyticsEvent): Promise<{ id: string }> {
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb: any = await createServerSupabase();
  const occurred = e.occurred_at ?? new Date().toISOString();
  const id = createHash("sha256")
    .update(`${e.user_id ?? ""}|${e.event}|${occurred}|${JSON.stringify(e.properties ?? {})}`)
    .digest("hex")
    .slice(0, 24);
  await sb.from("analytics_events").insert({
    id,
    user_id: e.user_id ?? null,
    org_id: e.org_id ?? null,
    session_id: e.session_id ?? null,
    anonymous_id: e.anonymous_id ?? null,
    event: e.event,
    properties: e.properties ?? {},
    context: e.context ?? {},
    occurred_at: occurred,
    received_at: new Date().toISOString(),
  });
  return { id };
}

export async function trackBatch(events: AnalyticsEvent[]): Promise<{ inserted: number }> {
  if (events.length === 0) return { inserted: 0 };
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb: any = await createServerSupabase();
  const rows = events.map((e) => {
    const occurred = e.occurred_at ?? new Date().toISOString();
    const id = createHash("sha256")
      .update(`${e.user_id ?? ""}|${e.event}|${occurred}|${JSON.stringify(e.properties ?? {})}`)
      .digest("hex")
      .slice(0, 24);
    return {
      id,
      user_id: e.user_id ?? null,
      org_id: e.org_id ?? null,
      session_id: e.session_id ?? null,
      anonymous_id: e.anonymous_id ?? null,
      event: e.event,
      properties: e.properties ?? {},
      context: e.context ?? {},
      occurred_at: occurred,
      received_at: new Date().toISOString(),
    };
  });
  await sb.from("analytics_events").insert(rows);
  return { inserted: rows.length };
}
