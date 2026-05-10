"use client";

import { useReportWebVitals } from "next/web-vitals";
import * as React from "react";

import { installGlobalClientErrorHandlers } from "@/lib/observability/error-reporter";

/**
 * Tier 5.5 — Web Vitals beacon + global error handlers.
 *
 * Komponent jest dziećmi RootLayout, więc montowany raz na cały
 * cykl życia aplikacji.
 *  - useReportWebVitals (Next.js 14) wystrzeliwuje metryki Core Web
 *    Vitals (CLS, INP, LCP, FCP, TTFB).
 *  - sendBeacon → keepalive fetch fallback.
 *  - W dev wypisuje na console.info z kontekstem.
 *  - W produkcji wysyła do `/api/observability/vitals`.
 *  - Dodatkowo instaluje `window.onerror` + `unhandledrejection` handlery.
 */

const ENDPOINT = "/api/observability/vitals";

function sendVital(payload: object): void {
  try {
    const body = JSON.stringify(payload);

    if (
      typeof navigator !== "undefined" &&
      typeof navigator.sendBeacon === "function"
    ) {
      const blob = new Blob([body], { type: "application/json" });
      const ok = navigator.sendBeacon(ENDPOINT, blob);
      if (ok) return;
    }

    if (typeof fetch === "function") {
      void fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true,
      }).catch(() => {
        /* noop */
      });
    }
  } catch {
    /* noop */
  }
}

export function WebVitalsReporter() {
  // Globalne handlery uncaught error / promise rejection.
  React.useEffect(() => {
    return installGlobalClientErrorHandlers();
  }, []);

  useReportWebVitals((metric) => {
    const payload = {
      id: metric.id,
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
      navigationType: metric.navigationType,
      url:
        typeof window !== "undefined" ? window.location.pathname : null,
    };

    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.info("[web-vitals]", payload);
      return;
    }

    sendVital(payload);
  });

  return null;
}
