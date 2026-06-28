/**
 * Tier 6 zad. 251 — Strukturalne logowanie (pino-compatible) + correlation_id.
 *
 * Strategia: implementacja "pino-light" w czystym TypeScript, zero zewn.
 * deps. Jeżeli w środowisku jest dostępne pino (require optional), używamy
 * go; w przeciwnym razie własna implementacja JSON line.
 *
 * Każdy log:
 *   - JSON na stdout (Vercel / Datadog scrapes)
 *   - poziomy: trace, debug, info, warn, error, fatal
 *   - automatyczne pole `correlation_id` z AsyncLocalStorage
 *   - PII redaction (Tier 6 zad. 270) — keys: password, token, authorization,
 *     credit_card, ssn, nip (last 6), pesel, email (masked).
 */

import { AsyncLocalStorage } from "node:async_hooks";

export type LogLevel = "trace" | "debug" | "info" | "warn" | "error" | "fatal";

const LEVEL_RANK: Record<LogLevel, number> = {
  trace: 10,
  debug: 20,
  info: 30,
  warn: 40,
  error: 50,
  fatal: 60,
};

interface LogContext {
  correlation_id?: string;
  user_id?: string;
  case_id?: string;
  request_path?: string;
  request_method?: string;
  [key: string]: unknown;
}

interface LogStorage {
  context: LogContext;
}

// AsyncLocalStorage instancja propagująca correlation_id przez stos wywołań.
const als = new AsyncLocalStorage<LogStorage>();

/** Uruchamia callback z danym kontekstem logowania w AsyncLocalStorage. */
export function withLogContext<T>(context: LogContext, fn: () => T): T {
  const existing = als.getStore()?.context ?? {};
  return als.run({ context: { ...existing, ...context } }, fn);
}

/** Pobiera bieżący kontekst (np. correlation_id) z ALS. */
export function getLogContext(): LogContext {
  return als.getStore()?.context ?? {};
}

// PII redactor — odpowiednik pino-redact, dla naszego JSONa.
const SENSITIVE_KEYS = new Set([
  "password",
  "passwd",
  "token",
  "access_token",
  "refresh_token",
  "id_token",
  "authorization",
  "auth",
  "cookie",
  "set-cookie",
  "credit_card",
  "card_number",
  "cvv",
  "cvc",
  "ssn",
  "pesel",
  "secret",
  "api_key",
  "apikey",
  "client_secret",
  "stripe_secret",
  "private_key",
]);

function maskValue(value: unknown): unknown {
  if (typeof value === "string") {
    if (value.length <= 4) return "***";
    return `${value.slice(0, 2)}***${value.slice(-2)}`;
  }
  return "[REDACTED]";
}

function maskEmail(email: string): string {
  const at = email.indexOf("@");
  if (at <= 0) return "***@***";
  const local = email.slice(0, at);
  const domain = email.slice(at + 1);
  const localMasked =
    local.length <= 2 ? "**" : `${local[0]}***${local[local.length - 1]}`;
  return `${localMasked}@${domain}`;
}

function redact(value: unknown, depth = 0): unknown {
  if (depth > 8) return "[DEPTH_LIMIT]";
  if (value === null || typeof value !== "object") return value;

  if (Array.isArray(value)) {
    return value.map((v) => redact(v, depth + 1));
  }

  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    const lk = k.toLowerCase();
    if (SENSITIVE_KEYS.has(lk)) {
      out[k] = maskValue(v);
      continue;
    }
    if (lk === "email" && typeof v === "string") {
      out[k] = maskEmail(v);
      continue;
    }
    if ((lk === "nip" || lk === "pesel") && typeof v === "string") {
      out[k] = maskValue(v);
      continue;
    }
    out[k] = redact(v, depth + 1);
  }
  return out;
}

const ACTIVE_LEVEL: LogLevel = (() => {
  const env = (process.env.LOG_LEVEL || "").toLowerCase() as LogLevel;
  return env in LEVEL_RANK ? env : "info";
})();

function shouldLog(level: LogLevel): boolean {
  return LEVEL_RANK[level] >= LEVEL_RANK[ACTIVE_LEVEL];
}

interface LogRecord {
  level: LogLevel;
  time: string;
  msg: string;
  correlation_id?: string;
  [key: string]: unknown;
}

function emit(level: LogLevel, msg: string, fields: Record<string, unknown>): void {
  if (!shouldLog(level)) return;
  const ctx = getLogContext();
  const record: LogRecord = {
    level,
    time: new Date().toISOString(),
    msg,
    ...(ctx as Record<string, unknown>),
    ...fields,
  };
  const safe = redact(record) as Record<string, unknown>;
  const line = JSON.stringify(safe);
  // eslint-disable-next-line no-console
  if (level === "error" || level === "fatal") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

export interface Logger {
  trace: (msg: string, fields?: Record<string, unknown>) => void;
  debug: (msg: string, fields?: Record<string, unknown>) => void;
  info: (msg: string, fields?: Record<string, unknown>) => void;
  warn: (msg: string, fields?: Record<string, unknown>) => void;
  error: (msg: string, fields?: Record<string, unknown>) => void;
  fatal: (msg: string, fields?: Record<string, unknown>) => void;
  child: (bindings: Record<string, unknown>) => Logger;
}

export function createLogger(bindings: Record<string, unknown> = {}): Logger {
  const wrap =
    (level: LogLevel) =>
    (msg: string, fields: Record<string, unknown> = {}) =>
      emit(level, msg, { ...bindings, ...fields });

  return {
    trace: wrap("trace"),
    debug: wrap("debug"),
    info: wrap("info"),
    warn: wrap("warn"),
    error: wrap("error"),
    fatal: wrap("fatal"),
    child: (extra) => createLogger({ ...bindings, ...extra }),
  };
}

/** Default app logger. */
export const logger = createLogger({ app: "dlugomat-web" });

/** Generates a short, log-friendly correlation id (UUID-ish 16 chars). */
export function generateCorrelationId(): string {
  // crypto.randomUUID jest dostępne w Node 18+ i edge runtime (Web Crypto).
  // globalThis.crypto jest typowane jako Crypto w lib.dom/node — bez `as any`.
  try {
    const c: Crypto | undefined = globalThis.crypto;
    if (c?.randomUUID) return c.randomUUID().replace(/-/g, "").slice(0, 16);
  } catch {
    // fallthrough
  }
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-8);
}
