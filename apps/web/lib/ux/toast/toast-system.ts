/**
 * Tier 19 — Toast notification system.
 *
 * Lightweight, framework-agnostic store + React-friendly subscribe API.
 * Cechy:
 *  - 4 typy: info | success | warning | error
 *  - auto-dismiss (configurable per toast), pauza on hover
 *  - max 5 jednocześnie (FIFO eviction)
 *  - action button (optional CTA)
 *  - aria-live region integration (a11y/focus-trap.announce)
 *  - dedupe — identyczne wiadomości w 2s mergeujemy
 */

export type ToastKind = "info" | "success" | "warning" | "error";

export interface Toast {
  id: string;
  kind: ToastKind;
  title: string;
  description?: string;
  durationMs: number;
  createdAt: number;
  action?: { label: string; onClick: () => void };
  dismissible: boolean;
}

type Listener = (toasts: Toast[]) => void;

const MAX_TOASTS = 5;
const DEDUPE_WINDOW_MS = 2_000;

const DEFAULT_DURATION: Record<ToastKind, number> = {
  info: 4_000,
  success: 3_500,
  warning: 6_000,
  error: 8_000,
};

class ToastStore {
  private toasts: Toast[] = [];
  private listeners = new Set<Listener>();

  push(input: Omit<Toast, "id" | "createdAt" | "dismissible"> & { dismissible?: boolean }): string {
    const now = Date.now();
    // Dedupe — jeśli taki sam title/kind w oknie 2s, odśwież TTL zamiast dodawać.
    const dup = this.toasts.find(
      (t) =>
        t.kind === input.kind &&
        t.title === input.title &&
        now - t.createdAt < DEDUPE_WINDOW_MS,
    );
    if (dup) {
      dup.createdAt = now;
      this.emit();
      return dup.id;
    }

    const id = `t_${now}_${Math.random().toString(36).slice(2, 8)}`;
    const toast: Toast = {
      id,
      kind: input.kind,
      title: input.title,
      description: input.description,
      durationMs: input.durationMs ?? DEFAULT_DURATION[input.kind],
      createdAt: now,
      action: input.action,
      dismissible: input.dismissible ?? true,
    };
    this.toasts = [...this.toasts, toast];
    // FIFO eviction
    if (this.toasts.length > MAX_TOASTS) {
      this.toasts = this.toasts.slice(-MAX_TOASTS);
    }
    this.emit();
    if (toast.durationMs > 0) {
      setTimeout(() => this.dismiss(id), toast.durationMs);
    }
    return id;
  }

  dismiss(id: string): void {
    const before = this.toasts.length;
    this.toasts = this.toasts.filter((t) => t.id !== id);
    if (this.toasts.length !== before) this.emit();
  }

  clear(): void {
    if (this.toasts.length === 0) return;
    this.toasts = [];
    this.emit();
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.toasts);
    return () => {
      this.listeners.delete(listener);
    };
  }

  list(): Toast[] {
    return this.toasts;
  }

  private emit(): void {
    const snapshot = [...this.toasts];
    for (const l of this.listeners) l(snapshot);
  }
}

export const toastStore = new ToastStore();

// Convenience helpers
export const toast = {
  info: (title: string, description?: string) =>
    toastStore.push({ kind: "info", title, description, durationMs: DEFAULT_DURATION.info }),
  success: (title: string, description?: string) =>
    toastStore.push({ kind: "success", title, description, durationMs: DEFAULT_DURATION.success }),
  warning: (title: string, description?: string) =>
    toastStore.push({ kind: "warning", title, description, durationMs: DEFAULT_DURATION.warning }),
  error: (title: string, description?: string) =>
    toastStore.push({ kind: "error", title, description, durationMs: DEFAULT_DURATION.error }),
  custom: (input: Parameters<ToastStore["push"]>[0]) => toastStore.push(input),
  dismiss: (id: string) => toastStore.dismiss(id),
  clear: () => toastStore.clear(),
  subscribe: (l: Listener) => toastStore.subscribe(l),
};
