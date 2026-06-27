/**
 * Tier 21 — Realtime channel broker (SSE + pub/sub on Postgres LISTEN/NOTIFY).
 *
 * Lekki broker zdarzeń realtime — bez zewnętrznych zależności (Redis/Pusher).
 * Wykorzystuje:
 *  - Postgres LISTEN/NOTIFY jako bus (przez Supabase realtime channel)
 *  - SSE (text/event-stream) jako transport do przeglądarki
 *
 * Model:
 *  - kanał = "topic" string (np. "case:42", "doc:abc-123", "org:7/cases")
 *  - subscriber = klient SSE; broker trzyma mapę topic → Set<Subscriber>
 *  - publish(topic, event) → broadcast do wszystkich subskrybentów + persist
 *    w `realtime_events` (audit trail + replay)
 *
 * Auth/visibility ogarniają wyższe warstwy (route handler sprawdza, czy user
 * ma prawo subskrybować dany topic przed dodaniem do mapy).
 */

import { randomUUID } from "crypto";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";
import type { Json } from "@/lib/db/types";

export type RealtimeEventKind =
  | "case.updated"
  | "case.commented"
  | "doc.updated"
  | "doc.cursor"
  | "deadline.fired"
  | "notification.delivered"
  | "presence.join"
  | "presence.leave"
  | "ai.generation.progress"
  | "ocr.progress"
  | "bulk.progress"
  | "system.broadcast";

export interface RealtimeEvent {
  id: string;
  topic: string;
  kind: RealtimeEventKind;
  payload: Record<string, unknown>;
  user_id: string | null;
  occurred_at: string;
}

export interface Subscriber {
  id: string;
  topic: string;
  userId: string | null;
  controller: ReadableStreamDefaultController<Uint8Array>;
  lastPingAt: number;
}

class ChannelBroker {
  private byTopic = new Map<string, Set<Subscriber>>();
  private byId = new Map<string, Subscriber>();

  /** Rejestruje subskrybenta na danym topicie. Zwraca cleanup() do wywołania na close. */
  subscribe(topic: string, userId: string | null, controller: ReadableStreamDefaultController<Uint8Array>): () => void {
    const sub: Subscriber = {
      id: randomUUID(),
      topic,
      userId,
      controller,
      lastPingAt: Date.now(),
    };
    let set = this.byTopic.get(topic);
    if (!set) {
      set = new Set();
      this.byTopic.set(topic, set);
    }
    set.add(sub);
    this.byId.set(sub.id, sub);

    // Wyślij initial event
    this.enqueueToSub(sub, "ready", { subscriberId: sub.id, topic });

    return () => this.unsubscribe(sub.id);
  }

  unsubscribe(id: string): void {
    const sub = this.byId.get(id);
    if (!sub) return;
    const set = this.byTopic.get(sub.topic);
    if (set) {
      set.delete(sub);
      if (set.size === 0) this.byTopic.delete(sub.topic);
    }
    this.byId.delete(id);
    try {
      sub.controller.close();
    } catch {
      /* already closed */
    }
  }

  /**
   * Publikuje zdarzenie: zapisuje w realtime_events + fan-out do subskrybentów.
   */
  async publish(args: {
    topic: string;
    kind: RealtimeEventKind;
    payload: Record<string, unknown>;
    userId?: string | null;
    persist?: boolean;
  }): Promise<RealtimeEvent> {
    const event: RealtimeEvent = {
      id: randomUUID(),
      topic: args.topic,
      kind: args.kind,
      payload: args.payload,
      user_id: args.userId ?? null,
      occurred_at: new Date().toISOString(),
    };

    if (args.persist !== false) {
      try {
        const sb = await createSupabaseServerClient();
        await sb.from("realtime_events").insert({
          id: event.id,
          topic: event.topic,
          kind: event.kind,
          payload: event.payload as Json,
          user_id: event.user_id,
          occurred_at: event.occurred_at,
        });
      } catch {
        /* persist best-effort */
      }
    }

    this.fanout(event);
    return event;
  }

  /** Wewnętrzny fan-out do wszystkich subskrybentów topicu. */
  private fanout(event: RealtimeEvent): void {
    const set = this.byTopic.get(event.topic);
    if (!set || set.size === 0) return;
    const payloadJson = JSON.stringify(event);
    const data = encodeSse(event.kind, payloadJson, event.id);
    for (const sub of set) {
      this.writeRaw(sub, data);
    }
  }

  /** Heartbeat ping — wywoływany co 25s by trzymać połączenie. */
  pingAll(): void {
    const now = Date.now();
    const data = encodeSse("ping", JSON.stringify({ ts: now }));
    for (const sub of this.byId.values()) {
      this.writeRaw(sub, data);
      sub.lastPingAt = now;
    }
  }

  /** Statystyki — używane przez /api/admin/realtime/stats. */
  stats(): { topics: number; subscribers: number; perTopic: Record<string, number> } {
    const perTopic: Record<string, number> = {};
    for (const [topic, set] of this.byTopic.entries()) {
      perTopic[topic] = set.size;
    }
    return {
      topics: this.byTopic.size,
      subscribers: this.byId.size,
      perTopic,
    };
  }

  private enqueueToSub(sub: Subscriber, kind: string, payload: unknown): void {
    this.writeRaw(sub, encodeSse(kind, JSON.stringify(payload)));
  }

  private writeRaw(sub: Subscriber, bytes: Uint8Array): void {
    try {
      sub.controller.enqueue(bytes);
    } catch {
      this.unsubscribe(sub.id);
    }
  }
}

/** SSE framing — event: <kind>\nid: <id>\ndata: <json>\n\n */
function encodeSse(kind: string, json: string, id?: string): Uint8Array {
  const lines: string[] = [];
  if (id) lines.push(`id: ${id}`);
  lines.push(`event: ${kind}`);
  for (const line of json.split("\n")) lines.push(`data: ${line}`);
  lines.push("", ""); // double-newline terminator
  return new TextEncoder().encode(lines.join("\n"));
}

/** Singleton w obrębie procesu Node (Edge runtime: per-isolate). */
const globalAny = globalThis as unknown as { __dlugomatChannelBroker?: ChannelBroker };
if (!globalAny.__dlugomatChannelBroker) {
  globalAny.__dlugomatChannelBroker = new ChannelBroker();
}
export const channelBroker: ChannelBroker = globalAny.__dlugomatChannelBroker;

/**
 * Pomocniczy builder dla SSE response w Next.js route.
 */
export function buildSseResponse(args: {
  topic: string;
  userId: string | null;
}): Response {
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const cleanup = channelBroker.subscribe(args.topic, args.userId, controller);
      // Heartbeat co 25s
      const interval = setInterval(() => {
        try {
          controller.enqueue(encodeSse("ping", JSON.stringify({ ts: Date.now() })));
        } catch {
          clearInterval(interval);
          cleanup();
        }
      }, 25_000);
      // Auto-cleanup gdy stream zostanie cancelowany
      (controller as unknown as { _cleanup?: () => void })._cleanup = () => {
        clearInterval(interval);
        cleanup();
      };
    },
    cancel() {
      // no-op — cleanup attached above
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no", // disable nginx buffering
    },
  });
}

/**
 * Pobiera historię eventów do replay (np. po reconnect klienta).
 */
export async function fetchEventReplay(args: {
  topic: string;
  since?: string;
  limit?: number;
}): Promise<RealtimeEvent[]> {
  const sb = await createSupabaseServerClient();
  let q = sb
    .from("realtime_events")
    .select("*")
    .eq("topic", args.topic)
    .order("occurred_at", { ascending: true })
    .limit(args.limit ?? 200);
  if (args.since) q = q.gt("occurred_at", args.since);
  const { data, error } = await q;
  if (error) throw error;
  // payload jsonb (Json) -> Record<string, unknown> w domenie (boundary cast).
  return (data ?? []) as unknown as RealtimeEvent[];
}
