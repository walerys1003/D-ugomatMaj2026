/**
 * Tier 5.5 — Client-side error reporter.
 *
 * Lekki adapter, który:
 *  - W produkcji wysyła błąd na własny endpoint `/api/observability/error`
 *    przez `navigator.sendBeacon` (z fallbackiem do fetch + keepalive).
 *  - W dev wypisuje na console.error z dodatkowym kontekstem.
 *  - Nigdy nie rzuca — błąd reportowania nie może maskować oryginalnego.
 *
 * Brak twardej zależności od Sentry — gdy ustawiona jest zmienna
 * `NEXT_PUBLIC_SENTRY_DSN`, można w przyszłości doddać `@sentry/nextjs`
 * bez dotykania callsite'ów.
 */

export interface ErrorContext {
  boundary?: string;
  url?: string;
  user_id?: string;
  extra?: Record<string, unknown>;
}

interface ErrorPayload {
  message: string;
  name?: string;
  stack?: string | null;
  digest?: string | null;
  boundary?: string;
  url: string | null;
  user_agent: string | null;
  timestamp: string;
  extra?: Record<string, unknown>;
}

function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

function buildPayload(error: unknown, ctx: ErrorContext): ErrorPayload {
  const base: ErrorPayload = {
    message: "Unknown error",
    name: undefined,
    stack: null,
    digest: null,
    boundary: ctx.boundary,
    url:
      ctx.url ??
      (typeof window !== "undefined" ? window.location.href : null),
    user_agent:
      typeof navigator !== "undefined" ? navigator.userAgent ?? null : null,
    timestamp: new Date().toISOString(),
    extra: ctx.extra,
  };

  if (error instanceof Error) {
    base.message = error.message;
    base.name = error.name;
    base.stack = error.stack ?? null;
    const digest = (error as { digest?: string }).digest;
    if (typeof digest === "string") base.digest = digest;
  } else if (typeof error === "string") {
    base.message = error;
  } else if (error && typeof error === "object") {
    try {
      base.message = JSON.stringify(error).slice(0, 500);
    } catch {
      base.message = String(error);
    }
  }

  return base;
}

export function reportClientError(
  error: unknown,
  context: ErrorContext = {},
): void {
  try {
    const payload = buildPayload(error, context);

    if (!isProduction()) {
      // eslint-disable-next-line no-console
      console.error("[reportClientError]", payload);
      return;
    }

    const body = JSON.stringify(payload);

    if (
      typeof navigator !== "undefined" &&
      typeof navigator.sendBeacon === "function"
    ) {
      const blob = new Blob([body], { type: "application/json" });
      const ok = navigator.sendBeacon("/api/observability/error", blob);
      if (ok) return;
    }

    if (typeof fetch === "function") {
      void fetch("/api/observability/error", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true,
      }).catch(() => {
        /* noop — nie maskuj oryginalnego błędu */
      });
    }
  } catch {
    /* noop */
  }
}

/**
 * Globalny handler — instalowany po stronie klienta dla uncaught
 * exceptions / unhandled rejections (np. w `app/layout.tsx`
 * przez Web Vitals beacon).
 */
export function installGlobalClientErrorHandlers(): () => void {
  if (typeof window === "undefined") return () => {};

  const onError = (event: ErrorEvent) => {
    reportClientError(event.error ?? event.message, {
      boundary: "window.onerror",
      extra: {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      },
    });
  };

  const onRejection = (event: PromiseRejectionEvent) => {
    reportClientError(event.reason, {
      boundary: "unhandledrejection",
    });
  };

  window.addEventListener("error", onError);
  window.addEventListener("unhandledrejection", onRejection);

  return () => {
    window.removeEventListener("error", onError);
    window.removeEventListener("unhandledrejection", onRejection);
  };
}
