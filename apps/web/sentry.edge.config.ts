/**
 * Tier 5 zad. 248 — Sentry edge runtime init.
 *
 * Wywoływany dla middleware.ts oraz API routes z `runtime: 'edge'`.
 * Edge runtime ma ograniczone API (brak `crypto.timingSafeEqual` etc.),
 * więc Sentry SDK ma tu reduced feature set.
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
      // Edge: niższy sample rate (każde wywołanie = koszt + latency).
      tracesSampleRate: 0.05,
      sendDefaultPii: false,
    });
  } catch {
    // SDK niezainstalowany — no-op.
  }
}
/* eslint-enable */
