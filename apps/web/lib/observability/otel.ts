/**
 * Tier 6 zad. 252 — OpenTelemetry traces (lazy / optional).
 *
 * Decyzja: nie wymuszamy @opentelemetry/* jako twardej zależności.
 * Jeśli paczka jest dostępna w runtime (np. po `npm i @opentelemetry/api`),
 * korzystamy z prawdziwego tracera. W przeciwnym razie zwracamy no-op,
 * który nie zmienia wykonania.
 *
 * Wzorzec wywołania (sync lub async):
 *
 *   await withSpan("anthropic.complete", async (span) => {
 *     span.setAttribute("model", "claude-sonnet-4-5");
 *     return await anthropic.complete(...);
 *   });
 *
 * Span automatycznie:
 *   - nadziedziczy correlation_id z AsyncLocalStorage (via logger)
 *   - oznaczy się statusem error gdy callback rzuci
 *   - zamknie się w finally
 */

import { getLogContext } from "./logger";

export interface Span {
  setAttribute(key: string, value: string | number | boolean): void;
  setStatus(status: { code: "ok" | "error"; message?: string }): void;
  recordException(err: unknown): void;
  end(): void;
}

interface TracerImpl {
  startSpan(name: string, attrs?: Record<string, unknown>): Span;
}

// ── try-load real OpenTelemetry ─────────────────────────────────────────
let cachedTracer: TracerImpl | null | undefined;

function tryLoadOtelTracer(): TracerImpl | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
    const api = require("@opentelemetry/api");
    const tracer = api.trace.getTracer("dlugomat-web", process.env.npm_package_version || "1.0.0");
    return {
      startSpan(name: string, attrs?: Record<string, unknown>): Span {
        const s = tracer.startSpan(name, { attributes: attrs ?? {} });
        return {
          setAttribute: (k, v) => s.setAttribute(k, v),
          setStatus: ({ code, message }) =>
            s.setStatus({ code: code === "ok" ? api.SpanStatusCode.OK : api.SpanStatusCode.ERROR, message }),
          recordException: (e) => s.recordException(e as Error),
          end: () => s.end(),
        };
      },
    };
  } catch {
    return null;
  }
}

function getTracer(): TracerImpl {
  if (cachedTracer !== undefined) {
    return cachedTracer ?? noopTracer;
  }
  cachedTracer = tryLoadOtelTracer();
  return cachedTracer ?? noopTracer;
}

const noopSpan: Span = {
  setAttribute() {},
  setStatus() {},
  recordException() {},
  end() {},
};

const noopTracer: TracerImpl = {
  startSpan() {
    return noopSpan;
  },
};

/** Starts a span, runs the callback, ends span (records exceptions, sets status). */
export async function withSpan<T>(
  name: string,
  fn: (span: Span) => Promise<T> | T,
  attrs?: Record<string, unknown>,
): Promise<T> {
  const tracer = getTracer();
  const ctx = getLogContext();
  const span = tracer.startSpan(name, {
    "dlugomat.correlation_id": ctx.correlation_id,
    "dlugomat.user_id": ctx.user_id,
    "dlugomat.case_id": ctx.case_id,
    ...attrs,
  });
  try {
    const result = await fn(span);
    span.setStatus({ code: "ok" });
    return result;
  } catch (err) {
    span.recordException(err);
    span.setStatus({
      code: "error",
      message: err instanceof Error ? err.message : String(err),
    });
    throw err;
  } finally {
    span.end();
  }
}

/** Synchronous span (rarely needed; prefer async withSpan). */
export function withSpanSync<T>(
  name: string,
  fn: (span: Span) => T,
  attrs?: Record<string, unknown>,
): T {
  const tracer = getTracer();
  const span = tracer.startSpan(name, attrs);
  try {
    const result = fn(span);
    span.setStatus({ code: "ok" });
    return result;
  } catch (err) {
    span.recordException(err);
    span.setStatus({
      code: "error",
      message: err instanceof Error ? err.message : String(err),
    });
    throw err;
  } finally {
    span.end();
  }
}
