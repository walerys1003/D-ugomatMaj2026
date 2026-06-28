/**
 * Tier 20 — Metrics collector (OpenTelemetry Metrics + Prometheus-style).
 *
 * Lightweight in-process metrics registry z eksportem do:
 *  - OpenTelemetry meter (jeśli @opentelemetry/api dostępne)
 *  - Prometheus text format (na endpointcie /api/metrics)
 *
 * Typy:
 *  - counter (monotonic) — np. http_requests_total
 *  - gauge (point-in-time) — np. active_sessions
 *  - histogram (buckets) — np. http_request_duration_ms
 *  - summary (quantiles via approx tdigest)
 */

export type LabelValues = Record<string, string | number | boolean>;

interface CounterState {
  type: "counter";
  name: string;
  help: string;
  values: Map<string, number>;
}
interface GaugeState {
  type: "gauge";
  name: string;
  help: string;
  values: Map<string, number>;
}
interface HistogramState {
  type: "histogram";
  name: string;
  help: string;
  buckets: number[];
  counts: Map<string, number[]>; // per label-key → bucket counts
  sums: Map<string, number>;
  totals: Map<string, number>;
}

type MetricState = CounterState | GaugeState | HistogramState;

const registry = new Map<string, MetricState>();

function labelKey(labels?: LabelValues): string {
  if (!labels) return "";
  const keys = Object.keys(labels).sort();
  return keys.map((k) => `${k}=${String(labels[k])}`).join(",");
}

function getOrInit<T extends MetricState>(name: string, init: () => T): T {
  const existing = registry.get(name);
  if (existing) return existing as T;
  const created = init();
  registry.set(name, created);
  return created;
}

export function counter(name: string, help = ""): { inc: (n?: number, labels?: LabelValues) => void } {
  const state = getOrInit<CounterState>(name, () => ({
    type: "counter",
    name,
    help,
    values: new Map(),
  }));
  return {
    inc(n = 1, labels) {
      const key = labelKey(labels);
      state.values.set(key, (state.values.get(key) ?? 0) + n);
    },
  };
}

export function gauge(name: string, help = ""): {
  set: (v: number, labels?: LabelValues) => void;
  inc: (n?: number, labels?: LabelValues) => void;
  dec: (n?: number, labels?: LabelValues) => void;
} {
  const state = getOrInit<GaugeState>(name, () => ({
    type: "gauge",
    name,
    help,
    values: new Map(),
  }));
  return {
    set(v, labels) {
      state.values.set(labelKey(labels), v);
    },
    inc(n = 1, labels) {
      const key = labelKey(labels);
      state.values.set(key, (state.values.get(key) ?? 0) + n);
    },
    dec(n = 1, labels) {
      const key = labelKey(labels);
      state.values.set(key, (state.values.get(key) ?? 0) - n);
    },
  };
}

export const DEFAULT_HISTOGRAM_BUCKETS_MS = [5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000, 30000];

export function histogram(
  name: string,
  help = "",
  buckets: number[] = DEFAULT_HISTOGRAM_BUCKETS_MS,
): { observe: (v: number, labels?: LabelValues) => void } {
  const state = getOrInit<HistogramState>(name, () => ({
    type: "histogram",
    name,
    help,
    buckets: [...buckets].sort((a, b) => a - b),
    counts: new Map(),
    sums: new Map(),
    totals: new Map(),
  }));
  return {
    observe(v, labels) {
      const key = labelKey(labels);
      let arr = state.counts.get(key);
      if (!arr) {
        arr = new Array(state.buckets.length).fill(0);
        state.counts.set(key, arr);
      }
      for (let i = 0; i < state.buckets.length; i++) {
        if (v <= state.buckets[i]) arr[i]++;
      }
      state.sums.set(key, (state.sums.get(key) ?? 0) + v);
      state.totals.set(key, (state.totals.get(key) ?? 0) + 1);
    },
  };
}

/**
 * Eksport rejestru do formatu Prometheus text (v0.0.4).
 * Returns raw string content with Content-Type:
 *   "text/plain; version=0.0.4; charset=utf-8"
 */
export function renderPrometheus(): string {
  const lines: string[] = [];
  for (const m of registry.values()) {
    if (m.help) lines.push(`# HELP ${m.name} ${m.help}`);
    lines.push(`# TYPE ${m.name} ${m.type}`);
    if (m.type === "counter" || m.type === "gauge") {
      for (const [labels, value] of m.values.entries()) {
        lines.push(`${m.name}${labelsFmt(labels)} ${formatNumber(value)}`);
      }
    } else if (m.type === "histogram") {
      for (const [labels, counts] of m.counts.entries()) {
        let cumulative = 0;
        for (let i = 0; i < m.buckets.length; i++) {
          cumulative += counts[i];
          lines.push(
            `${m.name}_bucket${labelsFmt(labels, { le: String(m.buckets[i]) })} ${cumulative}`,
          );
        }
        const total = m.totals.get(labels) ?? 0;
        lines.push(`${m.name}_bucket${labelsFmt(labels, { le: "+Inf" })} ${total}`);
        lines.push(`${m.name}_sum${labelsFmt(labels)} ${formatNumber(m.sums.get(labels) ?? 0)}`);
        lines.push(`${m.name}_count${labelsFmt(labels)} ${total}`);
      }
    }
  }
  return lines.join("\n") + "\n";
}

function labelsFmt(serialized: string, extra?: Record<string, string>): string {
  const parts: string[] = [];
  if (serialized) {
    for (const p of serialized.split(",")) {
      const idx = p.indexOf("=");
      if (idx > 0) {
        const k = p.slice(0, idx);
        const v = p.slice(idx + 1);
        parts.push(`${k}="${escapeLabel(v)}"`);
      }
    }
  }
  if (extra) {
    for (const [k, v] of Object.entries(extra)) {
      parts.push(`${k}="${escapeLabel(v)}"`);
    }
  }
  return parts.length === 0 ? "" : `{${parts.join(",")}}`;
}

function escapeLabel(v: string): string {
  return v.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/"/g, '\\"');
}

function formatNumber(n: number): string {
  if (!Number.isFinite(n)) return n > 0 ? "+Inf" : n < 0 ? "-Inf" : "NaN";
  return String(n);
}

/** Standardowe metryki aplikacyjne — używaj zamiast tworzenia ad-hoc. */
export const METRICS = {
  httpRequests: counter("dlugomat_http_requests_total", "HTTP requests"),
  httpDuration: histogram("dlugomat_http_request_duration_ms", "HTTP request duration"),
  httpErrors: counter("dlugomat_http_errors_total", "HTTP errors"),
  aiInvocations: counter("dlugomat_ai_invocations_total", "AI model invocations"),
  aiLatency: histogram("dlugomat_ai_latency_ms", "AI invocation latency"),
  aiTokens: counter("dlugomat_ai_tokens_total", "AI tokens consumed"),
  ocrJobs: counter("dlugomat_ocr_jobs_total", "OCR jobs"),
  ocrDuration: histogram("dlugomat_ocr_duration_ms", "OCR processing duration"),
  queueDepth: gauge("dlugomat_queue_depth", "Queue depth (pending jobs)"),
  queueDuration: histogram("dlugomat_queue_job_duration_ms", "Queue job duration"),
  activeSessions: gauge("dlugomat_active_sessions", "Active user sessions"),
};
