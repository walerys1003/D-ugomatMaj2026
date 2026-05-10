/**
 * Tier 20 — Log correlation (trace ⇄ log).
 *
 * Łączy logi aplikacji z OTel spans przez `traceId`/`spanId` + dedicated
 * `request_id` (UUID v7-ish) + `user_id`/`tenant_id` jeśli dostępne.
 *
 * Wzorzec użycia:
 *   const ctx = createCorrelationContext({ req });
 *   logger.info("user signed in", { ...ctx });
 *
 * Wynikowy log JSON ma stabilne pola:
 *   { ts, level, msg, trace_id, span_id, request_id, user_id?, tenant_id? }
 */

import { extractTraceParent } from "../tracing/otel-tracer";

export interface CorrelationContext {
  request_id: string;
  trace_id: string | null;
  span_id: string | null;
  user_id?: string;
  tenant_id?: string;
  route?: string;
  method?: string;
}

export interface CorrelationInput {
  headers?: Headers | Record<string, string>;
  userId?: string;
  tenantId?: string;
  route?: string;
  method?: string;
}

/** Generator request_id — timestamp ms + 8B random hex (UUID v7-ish). */
export function newRequestId(): string {
  const ts = Date.now().toString(16).padStart(12, "0");
  const rnd = Math.random().toString(16).slice(2, 18).padStart(16, "0");
  return `${ts}-${rnd}`;
}

export function createCorrelationContext(input: CorrelationInput = {}): CorrelationContext {
  const trace = input.headers ? extractTraceParent(input.headers) : null;
  return {
    request_id: getOrCreateRequestId(input.headers),
    trace_id: trace?.traceId ?? null,
    span_id: trace?.spanId ?? null,
    user_id: input.userId,
    tenant_id: input.tenantId,
    route: input.route,
    method: input.method,
  };
}

function getOrCreateRequestId(headers?: Headers | Record<string, string>): string {
  if (!headers) return newRequestId();
  const get = (k: string): string | null => {
    if (typeof (headers as Headers).get === "function") return (headers as Headers).get(k);
    const obj = headers as Record<string, string>;
    return obj[k] ?? obj[k.toLowerCase()] ?? obj[k.toUpperCase()] ?? null;
  };
  return get("x-request-id") ?? get("X-Request-Id") ?? newRequestId();
}

/** Asynchroniczne propagation context — używać w async/await chains. */
const asyncContextStore = new Map<number, CorrelationContext>();
let asyncContextSeq = 0;

export function runWithContext<T>(ctx: CorrelationContext, fn: () => T): T {
  const id = ++asyncContextSeq;
  asyncContextStore.set(id, ctx);
  try {
    return fn();
  } finally {
    asyncContextStore.delete(id);
  }
}

/** Format JSON-line log z context'em korelacji. */
export interface LogRecord {
  ts: string;
  level: "debug" | "info" | "warn" | "error";
  msg: string;
  [key: string]: unknown;
}

export function formatLogRecord(
  level: LogRecord["level"],
  msg: string,
  ctx: Partial<CorrelationContext>,
  extra?: Record<string, unknown>,
): LogRecord {
  return {
    ts: new Date().toISOString(),
    level,
    msg,
    trace_id: ctx.trace_id ?? null,
    span_id: ctx.span_id ?? null,
    request_id: ctx.request_id,
    user_id: ctx.user_id,
    tenant_id: ctx.tenant_id,
    route: ctx.route,
    method: ctx.method,
    ...(extra ?? {}),
  };
}
