/**
 * Tier 5 zad. 248 — Sentry server-side init (Node.js runtime).
 *
 * Wywoływany dla wszystkich Server Components, API Route Handlers
 * (runtime: 'nodejs'), Server Actions i cron jobów.
 *
 * Aktywuje się tylko gdy `@sentry/nextjs` jest zainstalowany ORAZ
 * `NEXT_PUBLIC_SENTRY_DSN` ustawione.
 */

import {
  getSentryReleaseConfig,
  sentryBeforeSend,
} from "@/lib/observability/sentry-config";

/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any */
const cfg = getSentryReleaseConfig();

if (cfg.enabled && cfg.dsn) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Sentry = require("@sentry/nextjs") as any;
    Sentry.init({
      dsn: cfg.dsn,
      release: cfg.release,
      environment: cfg.environment,
      dist: cfg.dist,
      beforeSend: sentryBeforeSend,
      tracesSampleRate: 0.1,
      // Brak PII w żadnej formie (RODO art. 32 + zad. 206).
      sendDefaultPii: false,
      // Spam protection — ignoruj typowe szumy.
      ignoreErrors: [
        "AbortError",
        "Network request failed",
        "Load failed",
      ],
    });
  } catch {
    // SDK niezainstalowany — no-op.
  }
}
/* eslint-enable */
