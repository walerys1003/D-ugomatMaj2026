"use client";
/**
 * V5-INFRA · error boundary (Wave 5 · AGENT B5)
 * ----------------------------------------------------------------
 * Server-side error boundary dla wszystkich /v5/** routes.
 * Stosuje token discipline + telemetry hook.
 */
import * as React from "react";
import {
  V5Container,
  V5Section,
  V5Surface,
  V5Eyebrow,
  V5Headline,
  V5Body,
  V5Button,
  V5Pill,
} from "@/components/v5/primitives";
import { V5Footer, V5Header } from "@/components/v5/landing/header";

export default function V5Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    // Telemetry hook — non-blocking, no PII
    if (typeof window !== "undefined") {
      try {
        const payload = {
          ts: Date.now(),
          path: window.location.pathname,
          msg: error.message?.slice(0, 200) ?? "unknown",
          digest: error.digest ?? null,
        };
        // eslint-disable-next-line no-console
        console.error("[V5][telemetry][error]", payload);
        // Best-effort beacon (silent fail)
        if (navigator.sendBeacon) {
          try {
            navigator.sendBeacon(
              "/api/telemetry/v5-error",
              new Blob([JSON.stringify(payload)], { type: "application/json" }),
            );
          } catch {
            // noop
          }
        }
      } catch {
        // noop
      }
    }
  }, [error]);

  return (
    <div className="bg-[hsl(var(--v5-infra-25))] overflow-x-hidden min-h-screen">
      <V5Header />
      <main className="min-w-0">
        <V5Section density="normal">
          <V5Container width="content">
            <V5Surface variant="raised" className="p-10 sm:p-14 text-center">
              <V5Pill tone="err" className="mb-6">
                ERROR · CRASH
              </V5Pill>
              <V5Eyebrow className="mb-4">błąd · 500</V5Eyebrow>
              <V5Headline level="h1" className="mb-5">
                Coś poszło nie tak.
              </V5Headline>
              <V5Body size="lg" className="mb-2 max-w-[58ch] mx-auto">
                Nasz system odnotował błąd i automatycznie raportuje go do
                zespołu inżynierów. Spróbuj ponownie — jeśli problem się
                powtarza, skontaktuj się z nami.
              </V5Body>
              {error.digest && (
                <div className="font-mono text-[0.6875rem] uppercase tracking-[var(--v5-tracking-uppercase)] text-[hsl(var(--v5-ink-500))] mb-8">
                  digest: <span className="text-[hsl(var(--v5-ink-900))]">{error.digest}</span>
                </div>
              )}
              <div className="flex flex-wrap items-center justify-center gap-3">
                <V5Button variant="primary" size="lg" onClick={reset}>
                  Spróbuj ponownie
                </V5Button>
                <V5Button variant="secondary" size="lg" asChild>
                  <a href="/v5">Strona główna V5</a>
                </V5Button>
                <V5Button variant="terminal" size="lg" asChild>
                  <a href="/v5/kontakt">Zgłoś problem</a>
                </V5Button>
              </div>
            </V5Surface>
          </V5Container>
        </V5Section>
      </main>
      <V5Footer />
    </div>
  );
}
