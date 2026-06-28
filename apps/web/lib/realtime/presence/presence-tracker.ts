/**
 * Tier 21 — Presence tracker.
 *
 * Śledzi "kto jest online" na poziomie:
 *  - globalnym (user_id online/offline)
 *  - kontekstowym (user_id w "case:42" / "doc:abc")
 *
 * Cechy:
 *  - heartbeat co 20s (klient pinguje), TTL 60s
 *  - rich state: status (online/away/busy), focused_topic, device, color
 *  - "stable color" — deterministyczny hash user_id → paleta 12 kolorów
 *  - aggregation: listPresenceForTopic + presenceCountByStatus
 *  - sweep wygasłych co 60s
 */

import { createHash } from "crypto";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";
import type { Json } from "@/lib/db/types";

export type PresenceStatus = "online" | "away" | "busy" | "offline";

export interface PresenceState {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  status: PresenceStatus;
  topic: string | null;
  device: "web" | "ios" | "android" | "desktop";
  color: string;
  last_seen_at: string;
  expires_at: string;
  metadata: Record<string, unknown>;
}

const PRESENCE_TTL_MS = 60_000;

const COLOR_PALETTE = [
  "#7C3AED", "#EC4899", "#F59E0B", "#10B981", "#0EA5E9", "#EF4444",
  "#22C55E", "#3B82F6", "#A855F7", "#F43F5E", "#14B8A6", "#F97316",
];

export function colorForUser(userId: string): string {
  const h = createHash("md5").update(userId).digest();
  return COLOR_PALETTE[h.readUInt8(0) % COLOR_PALETTE.length];
}

export async function heartbeat(args: {
  userId: string;
  displayName?: string | null;
  avatarUrl?: string | null;
  status?: PresenceStatus;
  topic?: string | null;
  device?: PresenceState["device"];
  metadata?: Record<string, unknown>;
}): Promise<PresenceState> {
  const supabase = await createSupabaseServerClient();
  const sb = supabase;
  const now = new Date();
  const row = {
    user_id: args.userId,
    display_name: args.displayName ?? null,
    avatar_url: args.avatarUrl ?? null,
    status: args.status ?? "online",
    topic: args.topic ?? null,
    device: args.device ?? "web",
    color: colorForUser(args.userId),
    last_seen_at: now.toISOString(),
    expires_at: new Date(now.getTime() + PRESENCE_TTL_MS).toISOString(),
    metadata: (args.metadata ?? {}) as Json,
  };
  const { data, error } = await sb
    .from("presence_state")
    .upsert(row, { onConflict: "user_id" })
    .select("*")
    .single();
  if (error) throw error;
  return data as PresenceState;
}

export async function setOffline(userId: string): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const sb = supabase;
  await sb
    .from("presence_state")
    .update({
      status: "offline",
      last_seen_at: new Date().toISOString(),
      expires_at: new Date().toISOString(),
    })
    .eq("user_id", userId);
}

export async function listPresenceForTopic(topic: string): Promise<PresenceState[]> {
  const supabase = await createSupabaseServerClient();
  const sb = supabase;
  const now = new Date().toISOString();
  const { data, error } = await sb
    .from("presence_state")
    .select("*")
    .eq("topic", topic)
    .gt("expires_at", now)
    .neq("status", "offline")
    .order("last_seen_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  return (data ?? []) as PresenceState[];
}

export async function presenceCountByStatus(): Promise<Record<PresenceStatus, number>> {
  const supabase = await createSupabaseServerClient();
  const sb = supabase;
  const now = new Date().toISOString();
  const { data, error } = await sb
    .from("presence_state")
    .select("status")
    .gt("expires_at", now);
  if (error) throw error;
  const out: Record<PresenceStatus, number> = { online: 0, away: 0, busy: 0, offline: 0 };
  for (const row of (data ?? []) as Array<{ status: PresenceStatus }>) {
    out[row.status] = (out[row.status] ?? 0) + 1;
  }
  return out;
}

export async function sweepExpiredPresence(): Promise<number> {
  const supabase = await createSupabaseServerClient();
  const sb = supabase;
  const { data, error } = await sb
    .from("presence_state")
    .update({ status: "offline" })
    .lt("expires_at", new Date().toISOString())
    .neq("status", "offline")
    .select("user_id");
  if (error) throw error;
  return (data ?? []).length;
}
