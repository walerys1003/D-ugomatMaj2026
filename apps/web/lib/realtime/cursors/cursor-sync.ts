/**
 * Tier 21 — Collaborative cursors / selections.
 *
 * Lekki, efemeryczny tracker pozycji kursora i selekcji w dokumencie/edytorze.
 * Współdziała z:
 *  - realtime/channel/channel-broker.ts — broadcast cursor updates
 *  - realtime/crdt/y-doc-store.ts — awareness state (cursor jest częścią awareness)
 *  - realtime/presence/presence-tracker.ts — kto jest w dokumencie
 *
 * Cechy:
 *  - throttle 33ms (~30 FPS) na kliencie przed wysyłką
 *  - rate limit serwerowy: 60 updates/sek/user (overflow → drop, last-wins)
 *  - smooth interpolation hint (klient interpoluje 16ms)
 *  - "ghost" cursor wygasa po 5s braku update'u
 */

import { channelBroker } from "../channel/channel-broker";
import { colorForUser } from "../presence/presence-tracker";

export interface CursorAnchor {
  /** offset w tekście (CRDT-relative) lub blok+offset w editor structured. */
  blockId?: string;
  offset: number;
}

export interface CursorState {
  userId: string;
  clientId: string;
  displayName: string | null;
  color: string;
  /** Pojedyncza pozycja kursora. */
  anchor: CursorAnchor;
  /** Opcjonalna selekcja: head ≠ anchor jeśli zakres. */
  head?: CursorAnchor;
  /** Camera focus (np. dla follow-mode w call). */
  scrollY?: number;
  updatedAt: string;
}

const RATE_WINDOW_MS = 1000;
const RATE_LIMIT_PER_WINDOW = 60;
const rateMap = new Map<string, number[]>();

function checkRateLimit(userId: string, clientId: string): boolean {
  const key = `${userId}:${clientId}`;
  const now = Date.now();
  const cutoff = now - RATE_WINDOW_MS;
  const arr = rateMap.get(key) ?? [];
  const recent = arr.filter((t) => t >= cutoff);
  if (recent.length >= RATE_LIMIT_PER_WINDOW) {
    rateMap.set(key, recent);
    return false;
  }
  recent.push(now);
  rateMap.set(key, recent);
  return true;
}

export async function publishCursor(args: {
  docId: string;
  userId: string;
  clientId: string;
  displayName?: string | null;
  anchor: CursorAnchor;
  head?: CursorAnchor;
  scrollY?: number;
}): Promise<{ ok: true } | { ok: false; reason: "rate_limited" }> {
  if (!checkRateLimit(args.userId, args.clientId)) {
    return { ok: false, reason: "rate_limited" };
  }
  const state: CursorState = {
    userId: args.userId,
    clientId: args.clientId,
    displayName: args.displayName ?? null,
    color: colorForUser(args.userId),
    anchor: args.anchor,
    head: args.head,
    scrollY: args.scrollY,
    updatedAt: new Date().toISOString(),
  };
  // Nie persistujemy — cursor jest efemeryczny (5s TTL klientowy).
  await channelBroker.publish({
    topic: `doc:${args.docId}`,
    kind: "doc.cursor",
    payload: state as unknown as Record<string, unknown>,
    userId: args.userId,
    persist: false,
  });
  return { ok: true };
}

/**
 * Stała: client-side TTL ghost-cursor (po tym czasie chowamy obcego kursora).
 */
export const CURSOR_GHOST_TTL_MS = 5_000;

/**
 * Client-side helper — zwraca pozycję interpolowaną.
 * Używany w komponencie React do animacji 16ms.
 */
export function interpolateCursor(prev: CursorAnchor, next: CursorAnchor, t: number): CursorAnchor {
  if (prev.blockId !== next.blockId) return next; // skok między blokami — brak interpolacji
  const clampedT = Math.max(0, Math.min(1, t));
  return {
    blockId: next.blockId,
    offset: Math.round(prev.offset + (next.offset - prev.offset) * clampedT),
  };
}

/**
 * Client throttle (ms) — używać w setupie:
 *   const throttled = throttle(publish, CURSOR_CLIENT_THROTTLE_MS)
 */
export const CURSOR_CLIENT_THROTTLE_MS = 33;
