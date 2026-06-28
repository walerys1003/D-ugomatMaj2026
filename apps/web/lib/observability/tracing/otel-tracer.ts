/**
 * Tier 20 — OpenTelemetry tracer (deep tracing).
 *
 * Rozszerza istniejące `otel.ts` o:
 *  - typowane span attributes (db, http, ai, ocr, payments, queue)
 *  - automatyczne propagation context (traceparent header)
 *  - sampling decisions (head-based + tail-based hints)
 *  - context manager `withSpan` z auto-end + status mapping
 *  - link spans (np. trace AI generation linkowany z trace upload OCR)
 *
 * Lazy import @opentelemetry/api by uniknąć ciężkiego boot w edge runtime.
 */

export type SpanKind = "server" | "client" | "internal" | "producer" | "consumer";

export interface SpanAttributes {
  [key: string]: string | number | boolean | undefined | null;
}

export interface StartSpanOptions {
  name: string;
  kind?: SpanKind;
  attributes?: SpanAttributes;
  links?: Array<{ traceId: string; spanId: string }>;
}

export interface ActiveSpan {
  end: (status?: "ok" | "error", err?: unknown) => void;
  addEvent: (name: string, attrs?: SpanAttributes) => void;
  setAttribute: (k: string, v: string | number | boolean) => void;
  setAttributes: (attrs: SpanAttributes) => void;
  recordException: (err: unknown) => void;
  spanContext: () => { traceId: string; spanId: string } | null;
}

const NOOP_SPAN: ActiveSpan = {
  end: () => undefined,
  addEvent: () => undefined,
  setAttribute: () => undefined,
  setAttributes: () => undefined,
  recordException: () => undefined,
  spanContext: () => null,
};

let cachedApi: typeof import("@opentelemetry/api") | null = null;
let apiLoadFailed = false;

async function loadApi(): Promise<typeof import("@opentelemetry/api") | null> {
  if (cachedApi) return cachedApi;
  if (apiLoadFailed) return null;
  try {
    cachedApi = await import("@opentelemetry/api");
    return cachedApi;
  } catch {
    apiLoadFailed = true;
    return null;
  }
}

/** Najczęściej używane attribute keys (semantic conventions). */
export const ATTR = {
  HTTP_METHOD: "http.request.method",
  HTTP_ROUTE: "http.route",
  HTTP_STATUS: "http.response.status_code",
  HTTP_URL: "url.full",
  DB_SYSTEM: "db.system",
  DB_OPERATION: "db.operation.name",
  DB_TABLE: "db.collection.name",
  AI_MODEL: "ai.model.name",
  AI_TOKENS_IN: "ai.tokens.input",
  AI_TOKENS_OUT: "ai.tokens.output",
  AI_LATENCY_MS: "ai.latency_ms",
  OCR_PROVIDER: "ocr.provider",
  OCR_CONFIDENCE: "ocr.confidence",
  CASE_TYPE: "dlugomat.case_type",
  TENANT_ID: "dlugomat.tenant_id",
  USER_ID: "dlugomat.user_id",
  PAY_PROVIDER: "payments.provider",
  PAY_AMOUNT_CENTS: "payments.amount_cents",
  QUEUE_NAME: "queue.name",
  QUEUE_JOB_ID: "queue.job_id",
} as const;

/**
 * Uruchamia span. Jeśli OTel nie jest dostępny, zwraca NOOP_SPAN
 * (kod aplikacji nie musi sprawdzać dostępności).
 */
export async function startSpan(opts: StartSpanOptions): Promise<ActiveSpan> {
  const api = await loadApi();
  if (!api) return NOOP_SPAN;
  const tracer = api.trace.getTracer("dlugomat-web", "1.0.0");
  const kindMap: Record<SpanKind, number> = {
    internal: api.SpanKind.INTERNAL,
    server: api.SpanKind.SERVER,
    client: api.SpanKind.CLIENT,
    producer: api.SpanKind.PRODUCER,
    consumer: api.SpanKind.CONSUMER,
  };
  const span = tracer.startSpan(opts.name, {
    kind: kindMap[opts.kind ?? "internal"],
    attributes: stripUndefined(opts.attributes),
    links: opts.links?.map((l) => ({
      context: {
        traceId: l.traceId,
        spanId: l.spanId,
        traceFlags: 1,
      },
    })) as never,
  });
  return wrapSpan(span, api);
}

/**
 * Wykonuje async fn wewnątrz spanu — auto-end z mapowaniem statusu i wyjątków.
 */
export async function withSpan<T>(
  opts: StartSpanOptions,
  fn: (span: ActiveSpan) => Promise<T>,
): Promise<T> {
  const span = await startSpan(opts);
  try {
    const result = await fn(span);
    span.end("ok");
    return result;
  } catch (err) {
    span.recordException(err);
    span.end("error", err);
    throw err;
  }
}

function wrapSpan(span: import("@opentelemetry/api").Span, api: typeof import("@opentelemetry/api")): ActiveSpan {
  return {
    end: (status, err) => {
      if (status === "error") {
        span.setStatus({
          code: api.SpanStatusCode.ERROR,
          message: err instanceof Error ? err.message : String(err ?? ""),
        });
      } else if (status === "ok") {
        span.setStatus({ code: api.SpanStatusCode.OK });
      }
      span.end();
    },
    addEvent: (name, attrs) => span.addEvent(name, stripUndefined(attrs)),
    setAttribute: (k, v) => span.setAttribute(k, v),
    setAttributes: (attrs) => span.setAttributes(stripUndefined(attrs)),
    recordException: (err) => span.recordException(err instanceof Error ? err : new Error(String(err))),
    spanContext: () => {
      const ctx = span.spanContext();
      if (!ctx?.traceId) return null;
      return { traceId: ctx.traceId, spanId: ctx.spanId };
    },
  };
}

function stripUndefined(attrs: SpanAttributes | undefined): Record<string, string | number | boolean> {
  if (!attrs) return {};
  const out: Record<string, string | number | boolean> = {};
  for (const [k, v] of Object.entries(attrs)) {
    if (v === undefined || v === null) continue;
    out[k] = v;
  }
  return out;
}

/**
 * Czyta traceparent z nagłówków przychodzącego requestu i zwraca traceId/spanId
 * do logów — pozwala skleić log z trace w obserwability backendzie.
 */
export function extractTraceParent(headers: Headers | Record<string, string>): { traceId: string; spanId: string } | null {
  const raw = typeof (headers as Headers).get === "function"
    ? (headers as Headers).get("traceparent")
    : (headers as Record<string, string>)["traceparent"] ?? (headers as Record<string, string>)["Traceparent"];
  if (!raw) return null;
  // format: 00-<traceId32>-<spanId16>-<flags2>
  const m = /^[0-9a-f]{2}-([0-9a-f]{32})-([0-9a-f]{16})-[0-9a-f]{2}$/i.exec(raw);
  if (!m) return null;
  return { traceId: m[1].toLowerCase(), spanId: m[2].toLowerCase() };
}
