/**
 * Tier 5 zad. 248 — Sentry release tracking + sourcemaps config helper.
 *
 * Sentry SDK NIE jest instalowany domyślnie (decyzja: zależnościowa
 * lekkość MVP). Ten plik dostarcza:
 *
 *   1) Stabilną konfigurację release/environment dla momentu, w którym
 *      `@sentry/nextjs` zostanie dodany do package.json.
 *   2) Single source of truth dla `release` ID — używamy go równolegle
 *      w `error-reporter.ts` (custom endpoint) by łatwo skorelować błędy
 *      z buildem.
 *   3) Hook na `beforeSend`: PII scrubber zgodny z polityką RODO
 *      (zad. 206 + 207).
 *
 * Jak włączyć Sentry:
 *   1) `npm i @sentry/nextjs`
 *   2) `npx @sentry/wizard@latest -i nextjs`  (generuje sentry.{client,server,edge}.config.ts)
 *   3) W każdym z config files importuj `getSentryReleaseConfig()` poniżej
 *      i merguj z opcjami z wizarda.
 *   4) Ustaw env: SENTRY_DSN, SENTRY_AUTH_TOKEN, SENTRY_ORG, SENTRY_PROJECT.
 *   5) Sourcemaps upload: `next build` z `@sentry/nextjs` automatycznie wgra
 *      sourcemapy i ustawi release.
 *
 * Architektura: zostawiamy ten helper niezależny od `@sentry/nextjs`, bo
 * dzięki temu można go zaimportować w komponencie nawet bez Sentry SDK
 * (zwraca config — caller decyduje czy go używa).
 */

export interface SentryReleaseConfig {
  /** Stable release ID — `dlugomat-web@<version>+<git-sha-short>`. */
  release: string;
  /** Środowisko: production / preview / development. */
  environment: string;
  /** Init dist (rolling) — bumper przy każdym deployu (commit SHA). */
  dist: string;
  /** Sentry DSN (z env) — `null` gdy Sentry nieaktywne. */
  dsn: string | null;
  /** Auth token do upload sourcemap (build-time only). */
  authToken: string | null;
  /** Org / project Sentry (build-time). */
  org: string | null;
  project: string | null;
  /** Włącz Sentry tylko w produkcji + preview (nie lokalnie). */
  enabled: boolean;
}

/**
 * Składa Sentry config z env i Vercel meta. Bezpieczny do wywołania
 * w runtime — nigdy nie throw.
 */
export function getSentryReleaseConfig(): SentryReleaseConfig {
  const version = process.env.NEXT_PUBLIC_APP_VERSION ?? "0.0.0";
  const sha =
    process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 12) ??
    process.env.NEXT_PUBLIC_BUILD_SHA?.slice(0, 12) ??
    "dev";
  const environment =
    process.env.VERCEL_ENV ??
    process.env.NEXT_PUBLIC_VERCEL_ENV ??
    process.env.NODE_ENV ??
    "development";

  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN ?? null;
  const enabled = Boolean(dsn) && environment !== "development";

  return {
    release: `dlugomat-web@${version}+${sha}`,
    environment,
    dist: sha,
    dsn,
    authToken: process.env.SENTRY_AUTH_TOKEN ?? null,
    org: process.env.SENTRY_ORG ?? null,
    project: process.env.SENTRY_PROJECT ?? null,
    enabled,
  };
}

/* ─────────────────────────────────────────────────────────────────────
   PII scrubber — zgodny z polityką RODO + zad. 206.
   Wywoływany z `beforeSend` w sentry config.
   Strategia: usuwamy/maskujemy wszystkie pola, które MOGĄ zawierać PII.
   ───────────────────────────────────────────────────────────────────── */

/**
 * Pattern set — wszystko co matchuje, jest maskowane.
 *
 * UWAGA: lista jest świadomie konserwatywna — wolimy false-positive
 * (zamaskować bezpieczny string) niż false-negative (przepuścić PESEL).
 */
const PII_PATTERNS: ReadonlyArray<{ name: string; rx: RegExp }> = [
  // PESEL = 11 cyfr (osobno od telefonu — telefon zwykle ma + lub spacje)
  { name: "pesel", rx: /\b\d{11}\b/g },
  // NIP = 10 cyfr (z separatorami: 123-456-78-90)
  { name: "nip", rx: /\b\d{3}-\d{3}-\d{2}-\d{2}\b/g },
  { name: "nip_clean", rx: /\b\d{10}\b/g },
  // Numer rachunku (PL: 26 cyfr, opcjonalnie z PL prefix i spacjami)
  { name: "iban_pl", rx: /\b(?:PL\s?)?(?:\d{2,4}\s?){6,7}\b/g },
  // E-mail
  { name: "email", rx: /[\w.+-]+@[\w-]+\.[\w.-]+/g },
  // Telefony PL: +48 XXX XXX XXX, 9 cyfr, separators .,- ,space
  { name: "phone_pl", rx: /(?:\+48[\s.-]?)?(?:\d{3}[\s.-]?){2}\d{3}/g },
  // JWT-y / Bearer tokens (długie podpisane stringi)
  { name: "jwt", rx: /eyJ[\w-]+\.[\w-]+\.[\w-]+/g },
];

/** Klucze, których wartości w obiekcie ZAWSZE maskujemy. */
const SENSITIVE_KEYS = new Set([
  "password",
  "passwd",
  "pwd",
  "secret",
  "api_key",
  "apikey",
  "token",
  "access_token",
  "refresh_token",
  "id_token",
  "authorization",
  "cookie",
  "set-cookie",
  "stripe_key",
  "webhook_secret",
  "encryption_key",
  "pesel",
  "nip",
  "iban",
  "regon",
  "card_number",
  "cvv",
  "cvc",
]);

const MASK = "[REDACTED]";

/**
 * Sanityzuje string — zamienia wszystkie matchujące patterny na MASK.
 */
export function scrubPiiString(input: string): string {
  let result = input;
  for (const { rx } of PII_PATTERNS) {
    result = result.replace(rx, MASK);
  }
  return result;
}

/**
 * Sanityzuje wartość rekursywnie. Bezpieczne dla cyklicznych referencji
 * (Set seen). Maks 4 poziomy zagłębienia (poza tym → "[depth-limit]").
 */
export function scrubPiiValue(
  value: unknown,
  depth = 0,
  seen: WeakSet<object> = new WeakSet(),
): unknown {
  if (depth > 4) return "[depth-limit]";
  if (value === null || value === undefined) return value;

  if (typeof value === "string") return scrubPiiString(value);
  if (typeof value === "number" || typeof value === "boolean") return value;

  if (Array.isArray(value)) {
    return value.slice(0, 50).map((v) => scrubPiiValue(v, depth + 1, seen));
  }

  if (typeof value === "object") {
    if (seen.has(value as object)) return "[circular]";
    seen.add(value as object);

    const out: Record<string, unknown> = {};
    const entries = Object.entries(value as Record<string, unknown>).slice(0, 50);
    for (const [k, v] of entries) {
      const lk = k.toLowerCase();
      if (SENSITIVE_KEYS.has(lk)) {
        out[k] = MASK;
        continue;
      }
      out[k] = scrubPiiValue(v, depth + 1, seen);
    }
    return out;
  }

  // function, symbol, bigint — ignorujemy
  return undefined;
}

/**
 * Sentry `beforeSend` hook. Importuj w `sentry.{client,server,edge}.config.ts`:
 *
 *   import * as Sentry from "@sentry/nextjs";
 *   import { sentryBeforeSend, getSentryReleaseConfig } from "@/lib/observability/sentry-config";
 *
 *   const cfg = getSentryReleaseConfig();
 *   if (cfg.enabled) {
 *     Sentry.init({
 *       dsn: cfg.dsn!,
 *       release: cfg.release,
 *       environment: cfg.environment,
 *       dist: cfg.dist,
 *       beforeSend: sentryBeforeSend,
 *       tracesSampleRate: 0.1,
 *       replaysSessionSampleRate: 0.0,
 *       replaysOnErrorSampleRate: 0.1,
 *     });
 *   }
 */
export function sentryBeforeSend<T extends Record<string, unknown>>(
  event: T,
): T | null {
  try {
    // Najczęstsze pola Sentry, które zawierają user data:
    if (event.message && typeof event.message === "string") {
      (event as Record<string, unknown>).message = scrubPiiString(event.message);
    }
    if (event.request && typeof event.request === "object") {
      (event as Record<string, unknown>).request = scrubPiiValue(event.request);
    }
    if (event.extra && typeof event.extra === "object") {
      (event as Record<string, unknown>).extra = scrubPiiValue(event.extra);
    }
    if (event.contexts && typeof event.contexts === "object") {
      (event as Record<string, unknown>).contexts = scrubPiiValue(event.contexts);
    }
    if (event.breadcrumbs && Array.isArray(event.breadcrumbs)) {
      (event as Record<string, unknown>).breadcrumbs = scrubPiiValue(
        event.breadcrumbs,
      );
    }
    // exception.values[].stacktrace.frames[].vars — zostawiamy (potrzebne
    // do debug), ale Sentry domyślnie maskuje. Można dodać scrub tutaj
    // jeśli zauważymy wycieki.
    return event;
  } catch {
    // Fallback — w razie awarii scrubbera DROP event (lepiej zgubić niż
    // wysłać z PII).
    return null;
  }
}
