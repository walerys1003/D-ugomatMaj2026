"use client";

import * as React from "react";

/**
 * Tier 5.5 — Global error boundary (root layout fallback).
 *
 * Renderowany gdy `app/error.tsx` nie złapie błędu (np. błąd w samym
 * RootLayout lub providerach). Musi zawierać własne <html>/<body>.
 * Trzymamy minimalny inline-styled UI — bez Tailwind, bez fontów —
 * żeby zadziałał nawet gdy CSS się nie załadował.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    // Bezpieczny report — fetch może się nie powieść, łapiemy.
    try {
      void fetch("/api/observability/error", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: error.message,
          digest: error.digest ?? null,
          boundary: "global",
          url: typeof window !== "undefined" ? window.location.href : null,
        }),
        keepalive: true,
      });
    } catch {
      /* noop */
    }
  }, [error]);

  return (
    <html lang="pl">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily:
            "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
          background: "#f7f8fa",
          color: "#0b1530",
          padding: "2rem",
        }}
      >
        <div
          style={{
            maxWidth: 520,
            background: "#fff",
            borderRadius: 16,
            padding: "2rem",
            boxShadow: "0 10px 30px rgba(11, 21, 48, 0.08)",
            border: "1px solid #e2e6ee",
          }}
        >
          <h1 style={{ fontSize: "1.5rem", margin: "0 0 0.75rem" }}>
            Awaria krytyczna
          </h1>
          <p
            style={{
              margin: "0 0 1rem",
              lineHeight: 1.5,
              color: "#4a536b",
            }}
          >
            Spokojnie — Twoje dane są bezpieczne. Aplikacja napotkała
            niespodziewany błąd. Spróbuj odświeżyć stronę za chwilę.
          </p>
          {error.digest ? (
            <p
              style={{
                margin: "0 0 1rem",
                fontSize: "0.85rem",
                color: "#6b7280",
              }}
            >
              ID błędu: <code>{error.digest}</code>
            </p>
          ) : null}
          <button
            type="button"
            onClick={reset}
            style={{
              padding: "0.6rem 1.1rem",
              background: "#1f3a8a",
              color: "#fff",
              border: 0,
              borderRadius: 8,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Spróbuj ponownie
          </button>
        </div>
      </body>
    </html>
  );
}
