/**
 * Background sync helpers — zad. 331 (auto-tag deadline reminders from OCR'd letters)
 *
 * When a user OCRs a letter while offline (or on a flaky connection), enqueue the
 * parse+deadline auto-tag work via the service worker's `dlugomat-pending-events`
 * tag. When the SW fires `sync`, this module replays the queue.
 */

interface PendingEvent {
  id: string;
  kind: "letter_parse_and_tag" | "case_create" | "document_save";
  payload: Record<string, unknown>;
  enqueued_at: string;
  attempts: number;
}

const STORE_KEY = "dlugomat_pending_events_v1";

function getStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function enqueuePendingEvent(kind: PendingEvent["kind"], payload: Record<string, unknown>): boolean {
  const storage = getStorage();
  if (!storage) return false;
  const list = readQueue(storage);
  const event: PendingEvent = {
    id: cryptoRandomId(),
    kind,
    payload,
    enqueued_at: new Date().toISOString(),
    attempts: 0,
  };
  list.push(event);
  storage.setItem(STORE_KEY, JSON.stringify(list));
  // Request a background sync
  if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
    navigator.serviceWorker.ready
      .then((reg) => {
        // Background Sync API (reg.sync) nie jest w domyślnych typach lib.dom.
        const syncMgr = (reg as ServiceWorkerRegistration & {
          sync?: { register(tag: string): Promise<void> };
        }).sync;
        if (syncMgr) return syncMgr.register("dlugomat-pending-events");
      })
      .catch(() => {});
  }
  return true;
}

export function readPendingEvents(): PendingEvent[] {
  const storage = getStorage();
  if (!storage) return [];
  return readQueue(storage);
}

export function clearPendingEvent(id: string): void {
  const storage = getStorage();
  if (!storage) return;
  const list = readQueue(storage).filter((e) => e.id !== id);
  storage.setItem(STORE_KEY, JSON.stringify(list));
}

function readQueue(storage: Storage): PendingEvent[] {
  try {
    const raw = storage.getItem(STORE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as PendingEvent[];
  } catch {
    return [];
  }
}

function cryptoRandomId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

/**
 * Replay pending events. Called by the SW or on app boot.
 * Returns the number of successfully processed events.
 */
export async function replayPendingEvents(
  fetchImpl: typeof fetch = fetch,
): Promise<{ processed: number; failed: number; remaining: number }> {
  const events = readPendingEvents();
  let processed = 0;
  let failed = 0;
  for (const ev of events) {
    try {
      let url: string;
      let body: unknown;
      switch (ev.kind) {
        case "letter_parse_and_tag":
          url = "/api/letters/parse";
          body = ev.payload;
          break;
        case "case_create":
          url = "/api/cases";
          body = ev.payload;
          break;
        case "document_save":
          url = "/api/documents";
          body = ev.payload;
          break;
        default:
          continue;
      }
      const resp = await fetchImpl(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (resp.ok) {
        clearPendingEvent(ev.id);
        processed++;
      } else if (resp.status >= 400 && resp.status < 500 && resp.status !== 429) {
        // Permanent failure — discard
        clearPendingEvent(ev.id);
        failed++;
      } else {
        failed++;
      }
    } catch {
      failed++;
    }
  }
  const remaining = readPendingEvents().length;
  return { processed, failed, remaining };
}
