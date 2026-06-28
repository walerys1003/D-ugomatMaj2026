/**
 * Tier 5 zad. 248 — Next.js 14 instrumentation hook.
 *
 * `instrumentation.ts` w roocie `apps/web/` jest oficjalnym mechanizmem
 * Next.js 14+ do uruchamiania kodu raz na boot procesu serwerowego /
 * edge runtime.
 *
 * Tutaj rejestrujemy Sentry server.config / edge.config dynamicznie
 * (per runtime). Client config jest ładowany automatycznie przez Next.js
 * z `sentry.client.config.ts` w bundle przeglądarki.
 *
 * Wymaga włączenia w next.config.mjs:
 *   experimental: { instrumentationHook: true }
 *
 * (W Next.js 15+ flag jest stable — można usunąć experimental.)
 *
 * Funkcja jest wywoływana raz; jeśli @sentry/nextjs nie jest
 * zainstalowany — silently no-op.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Audyt #11 — walidacja środowiska raz na boot (rzuca w prod gdy brak
    // krytycznych zmiennych; loguje ostrzeżenia poza produkcją).
    try {
      const { assertEnv } = await import("./lib/env");
      assertEnv();
    } catch (err) {
      // W produkcji propagujemy (fail-fast), poza nią tylko logujemy.
      if (process.env.NODE_ENV === "production") throw err;
      // eslint-disable-next-line no-console
      console.warn("[instrumentation] env validation:", err);
    }
    try {
      await import("./sentry.server.config");
    } catch {
      /* no-op gdy SDK / DSN nieobecne */
    }
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    try {
      await import("./sentry.edge.config");
    } catch {
      /* no-op gdy SDK / DSN nieobecne */
    }
  }
}
