/**
 * Tier 5 zad. 248 — Sentry client-side init (browser).
 *
 * Plik jest wykrywany automatycznie przez `@sentry/nextjs`:
 *   - Next.js 14 + `@sentry/nextjs` 7.x oczekuje sentry.client.config.ts
 *     w roocie aplikacji (apps/web).
 *
 * Bezpieczne dla MVP — gdy `@sentry/nextjs` NIE jest zainstalowany, ten
 * import wywali się i jest obwarowany try/catch w `instrumentation.ts`.
 * Sam ten plik nie jest importowany bezpośrednio przez kod aplikacji —
 * Sentry SDK ładuje go w build/runtime.
 *
 * Włączenie:
 *   1) `npm i @sentry/nextjs`
 *   2) ustaw env: NEXT_PUBLIC_SENTRY_DSN, SENTRY_AUTH_TOKEN, SENTRY_ORG, SENTRY_PROJECT
 *   3) (opcjonalnie) `npx @sentry/wizard@latest -i nextjs` — scal z tym configiem
 */

import {
  getSentryReleaseConfig,
  sentryBeforeSend,
} from "@/lib/observability/sentry-config";

/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any */
const cfg = getSentryReleaseConfig();

if (cfg.enabled && cfg.dsn) {
  try {
    // Lazy require — gdy @sentry/nextjs nie jest zainstalowany, brak crashu.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Sentry = require("@sentry/nextjs") as any;
    Sentry.init({
      dsn: cfg.dsn,
      release: cfg.release,
      environment: cfg.environment,
      dist: cfg.dist,
      beforeSend: sentryBeforeSend,
      // Tracing — 10% sample (low cost na MVP, można podnieść).
      tracesSampleRate: 0.1,
      // Session Replay — RODO-friendly: tylko przy błędach, brak idle replay.
      replaysSessionSampleRate: 0,
      replaysOnErrorSampleRate: 0.1,
      // Brak autocapture form values (RODO).
      sendDefaultPii: false,
      // Integracje — domyślne SDK + opcjonalnie Replay z PII masking.
      integrations: (defaults: unknown[]) => defaults,
    });
  } catch {
    // SDK niezainstalowany — no-op.
  }
}
/* eslint-enable */
