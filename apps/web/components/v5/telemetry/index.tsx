"use client";
/**
 * V5-INFRA · telemetry hooks (Wave 5 · AGENT B5)
 * ----------------------------------------------------------------
 * Lightweight, privacy-first telemetry for V5 surface.
 *
 * Principles:
 *   - No PII transmitted (no email, name, IP — IP truncated server-side)
 *   - sendBeacon API for non-blocking (silent fail)
 *   - Sampled at 10% in dev, 100% in prod
 *   - DNT respected
 *
 * Hooks:
 *   - useV5Pageview()  — tracks route view + duration
 *   - useV5Event()     — track named event with payload
 *   - <V5TelemetryMount /> — mount once at layout root
 */
import * as React from "react";

const ENDPOINT = "/api/telemetry/v5-event";
const SAMPLE_RATE_DEV = 0.1;
const SAMPLE_RATE_PROD = 1.0;

type EventPayload = Record<string, string | number | boolean | null | undefined>;

function shouldSample(): boolean {
  // Respect DNT
  if (typeof navigator !== "undefined" && navigator.doNotTrack === "1") {
    return false;
  }
  const rate =
    process.env.NODE_ENV === "production" ? SAMPLE_RATE_PROD : SAMPLE_RATE_DEV;
  return Math.random() < rate;
}

function emit(event: string, payload: EventPayload = {}): void {
  if (typeof window === "undefined") return;
  if (!shouldSample()) return;

  const body = {
    event,
    ts: Date.now(),
    path: window.location.pathname,
    referrer: document.referrer || null,
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    ...payload,
  };

  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon(
        ENDPOINT,
        new Blob([JSON.stringify(body)], { type: "application/json" }),
      );
    } else {
      // Fallback: fire-and-forget fetch
      void fetch(ENDPOINT, {
        method: "POST",
        body: JSON.stringify(body),
        headers: { "Content-Type": "application/json" },
        keepalive: true,
      }).catch(() => {});
    }
  } catch {
    // silent fail — telemetry never blocks UX
  }
}

/* ──────────────────────────────────────────────────────────────────
 * useV5Pageview — emits pageview + measures time-on-page
 * ──────────────────────────────────────────────────────────────── */
export function useV5Pageview(extra: EventPayload = {}): void {
  React.useEffect(() => {
    const start = Date.now();
    emit("v5_pageview", extra);

    return () => {
      const duration = Date.now() - start;
      emit("v5_pageleave", { duration_ms: duration, ...extra });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

/* ──────────────────────────────────────────────────────────────────
 * useV5Event — manually emit named event
 * ──────────────────────────────────────────────────────────────── */
export function useV5Event(): (
  name: string,
  payload?: EventPayload,
) => void {
  return React.useCallback((name: string, payload?: EventPayload) => {
    emit(name, payload);
  }, []);
}

/* ──────────────────────────────────────────────────────────────────
 * V5TelemetryMount — mount-once component
 * ──────────────────────────────────────────────────────────────── */
export function V5TelemetryMount() {
  useV5Pageview();

  // Track web vitals if available
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("PerformanceObserver" in window)) return;

    try {
      // LCP
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const last = entries[entries.length - 1] as PerformanceEntry | undefined;
        if (last) {
          emit("v5_vital_lcp", { value_ms: Math.round(last.startTime) });
        }
      });
      lcpObserver.observe({ type: "largest-contentful-paint", buffered: true });

      // CLS
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as PerformanceEntry[]) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const e = entry as any;
          if (!e.hadRecentInput) {
            clsValue += e.value;
          }
        }
      });
      clsObserver.observe({ type: "layout-shift", buffered: true });

      // Report CLS on page hide
      const handler = () => {
        emit("v5_vital_cls", { value: Math.round(clsValue * 1000) / 1000 });
      };
      window.addEventListener("pagehide", handler, { once: true });

      return () => {
        lcpObserver.disconnect();
        clsObserver.disconnect();
        window.removeEventListener("pagehide", handler);
      };
    } catch {
      // PerformanceObserver not supported — silent
    }
  }, []);

  return null;
}
