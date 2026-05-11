/**
 * Tier 32 — Real-User Monitoring (RUM) collector.
 *
 * Zbiera Web Vitals + custom metrics z przeglądarki użytkownika i wysyła
 * do PostHog + bazy analytics_rum (dla agregowanych dashboardów).
 *
 * Tracked metrics:
 *   - Core Web Vitals: LCP, FID, CLS, INP, FCP, TTFB
 *   - Custom: route_change_duration, hydration_time, api_call_latency
 *   - Device: viewport, connection type, save-data, prefers-reduced-motion
 */

export interface RumSample {
  metric_name: "LCP" | "FID" | "CLS" | "INP" | "FCP" | "TTFB" | "hydration" | "route_change" | "api_call";
  value: number; // ms (lub raw value dla CLS)
  rating: "good" | "needs-improvement" | "poor";
  url: string;
  route: string;
  navigation_type?: "navigate" | "reload" | "back_forward" | "prerender";
  device_class?: "mobile" | "tablet" | "desktop";
  connection?: string;
  saved_data?: boolean;
  reduced_motion?: boolean;
  timestamp: string;
}

/** Progi z web-vitals (Google Web Performance Working Group). */
const THRESHOLDS: Record<string, { good: number; poor: number }> = {
  LCP: { good: 2500, poor: 4000 },
  FID: { good: 100, poor: 300 },
  CLS: { good: 0.1, poor: 0.25 },
  INP: { good: 200, poor: 500 },
  FCP: { good: 1800, poor: 3000 },
  TTFB: { good: 800, poor: 1800 },
};

export function classifyRating(metric: string, value: number): "good" | "needs-improvement" | "poor" {
  const t = THRESHOLDS[metric];
  if (!t) return "good";
  if (value <= t.good) return "good";
  if (value <= t.poor) return "needs-improvement";
  return "poor";
}

/**
 * Inicjuje collector w przeglądarce. Wywołuj raz w root layout.
 * Wymaga 'web-vitals' jako optional peer dependency (lazy import).
 */
export function initRumCollector(opts: {
  endpoint?: string;
  posthog?: boolean;
} = {}): void {
  if (typeof window === "undefined") return;

  const endpoint = opts.endpoint ?? "/api/observability/vitals";

  // Lazy-import web-vitals (~3KB)
  import("web-vitals")
    .then(({ onCLS, onFID, onLCP, onINP, onFCP, onTTFB }) => {
      const send = (metric: any) => {
        const sample: RumSample = {
          metric_name: metric.name as RumSample["metric_name"],
          value: metric.value,
          rating: classifyRating(metric.name, metric.value),
          url: window.location.href,
          route: window.location.pathname,
          navigation_type: metric.navigationType,
          device_class: getDeviceClass(),
          connection: getConnectionType(),
          saved_data: getSaveData(),
          reduced_motion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
          timestamp: new Date().toISOString(),
        };

        // PostHog event (jeśli włączony)
        if (opts.posthog && (window as any).posthog) {
          try {
            (window as any).posthog.capture("$web_vitals", sample);
          } catch {
            /* tolerable */
          }
        }

        // Beacon do API
        try {
          if (navigator.sendBeacon) {
            navigator.sendBeacon(endpoint, JSON.stringify(sample));
          } else {
            fetch(endpoint, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(sample),
              keepalive: true,
            }).catch(() => {});
          }
        } catch {
          /* tolerable */
        }
      };
      onCLS(send);
      onFID(send);
      onLCP(send);
      onINP(send);
      onFCP(send);
      onTTFB(send);
    })
    .catch(() => {
      /* web-vitals nie dostępne — pomijamy */
    });
}

function getDeviceClass(): "mobile" | "tablet" | "desktop" {
  if (typeof window === "undefined") return "desktop";
  const w = window.innerWidth;
  if (w < 768) return "mobile";
  if (w < 1024) return "tablet";
  return "desktop";
}

function getConnectionType(): string | undefined {
  const conn = (navigator as any).connection;
  return conn?.effectiveType;
}

function getSaveData(): boolean {
  const conn = (navigator as any).connection;
  return !!conn?.saveData;
}
