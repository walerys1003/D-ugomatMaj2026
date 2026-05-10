"use client";

/**
 * Tier 6 zad. 273 — Frontend Error Boundary.
 *
 * Wrapuje główne sekcje UI (np. /app/dashboard, /baza-wiedzy). Łapie
 * błędy renderu React i wysyła do `/api/observability/error` (via
 * navigator.sendBeacon). Wyświetla user-friendly fallback z CTA "Odśwież"
 * i "Wróć do dashboardu".
 *
 * UWAGA: Next 15 App Router ma własne `error.tsx` per-segment. Ten
 * komponent jest komplementarny dla głębokich poddrzew (np. wizard,
 * generator pism).
 */
import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  resetKeys?: Array<string | number>;
  scope?: string;
}

interface State {
  hasError: boolean;
  errorMsg?: string;
  errorId?: string;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(err: Error): State {
    return {
      hasError: true,
      errorMsg: err.message,
      errorId: Math.random().toString(36).slice(2, 10),
    };
  }

  componentDidUpdate(prevProps: Props): void {
    // Reset gdy resetKeys się zmienia (np. po nawigacji).
    if (!this.state.hasError) return;
    const prev = prevProps.resetKeys ?? [];
    const curr = this.props.resetKeys ?? [];
    if (prev.length !== curr.length || prev.some((k, i) => k !== curr[i])) {
      this.setState({ hasError: false, errorMsg: undefined, errorId: undefined });
    }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    const payload = {
      message: error.message?.slice(0, 500),
      stack: error.stack?.slice(0, 2000),
      component_stack: info.componentStack?.slice(0, 2000),
      scope: this.props.scope ?? "unknown",
      error_id: this.state.errorId,
      url: typeof window !== "undefined" ? window.location.href : "",
      timestamp: Date.now(),
    };
    try {
      if (typeof navigator !== "undefined" && navigator.sendBeacon) {
        const blob = new Blob([JSON.stringify(payload)], {
          type: "application/json",
        });
        navigator.sendBeacon("/api/observability/error", blob);
      } else if (typeof fetch !== "undefined") {
        fetch("/api/observability/error", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload),
          keepalive: true,
        }).catch(() => {});
      }
    } catch {
      // ignore
    }
  }

  handleReset = (): void => {
    this.setState({ hasError: false, errorMsg: undefined, errorId: undefined });
  };

  render(): ReactNode {
    if (!this.state.hasError) return this.props.children;
    if (this.props.fallback) return this.props.fallback;

    return (
      <div
        role="alert"
        aria-live="assertive"
        className="flex min-h-[400px] flex-col items-center justify-center gap-4 rounded-2xl border border-red-200 bg-red-50 p-8 text-center"
      >
        <div className="text-4xl" aria-hidden="true">
          ⚠️
        </div>
        <h2 className="text-xl font-semibold text-red-900">
          Wystąpił nieoczekiwany błąd
        </h2>
        <p className="max-w-md text-sm text-red-700">
          Zespół Długomata został powiadomiony. Spróbuj odświeżyć stronę lub
          wróć do panelu głównego.
        </p>
        {this.state.errorId && (
          <p className="font-mono text-xs text-red-600">
            ID błędu: {this.state.errorId}
          </p>
        )}
        <div className="mt-2 flex gap-3">
          <button
            type="button"
            onClick={this.handleReset}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Spróbuj ponownie
          </button>
          <a
            href="/app"
            className="rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Wróć do dashboardu
          </a>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
