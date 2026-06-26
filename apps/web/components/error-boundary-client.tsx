"use client";

import * as React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * Tier 30 — Production-grade client error boundary.
 * Łapie błędy renderingu, wysyła do Sentry (jeśli skonfigurowane),
 * pokazuje fallback z przyciskiem reset.
 */

interface State {
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

interface Props {
  children: React.ReactNode;
  fallback?: (error: Error, reset: () => void) => React.ReactNode;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });
    // Wyślij do Sentry jeśli dostępny
    try {
      // Sentry browser SDK loads dynamically; globalThis cast avoids hard dep.
      const Sentry = (globalThis as any).Sentry;
      if (Sentry?.captureException) {
        Sentry.captureException(error, {
          contexts: { react: { componentStack: errorInfo.componentStack } },
        });
      }
    } catch {
      /* tolerable */
    }
    // POST do API observability
    try {
      fetch("/api/observability/error", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: error.message,
          stack: error.stack,
          component_stack: errorInfo.componentStack,
          url: typeof window !== "undefined" ? window.location.href : "",
          ua: typeof navigator !== "undefined" ? navigator.userAgent : "",
        }),
      }).catch(() => {});
    } catch {
      /* tolerable */
    }
  }

  reset = () => {
    this.setState({ error: null, errorInfo: null });
  };

  render() {
    if (!this.state.error) return this.props.children;
    if (this.props.fallback) {
      return this.props.fallback(this.state.error, this.reset);
    }
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center gap-4 rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center dark:border-rose-900 dark:bg-rose-950">
        <div className="rounded-full bg-rose-100 p-3 text-rose-600 dark:bg-rose-900 dark:text-rose-300">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h2 className="text-fluid-lg font-bold text-rose-900 dark:text-rose-100">
          Coś poszło nie tak
        </h2>
        <p className="text-fluid-sm text-rose-800 dark:text-rose-200">
          Nasi inżynierowie zostali powiadomieni. Spróbuj odświeżyć stronę.
        </p>
        {process.env.NODE_ENV !== "production" && (
          <pre className="max-h-32 w-full overflow-auto rounded bg-rose-100 p-2 text-left font-mono text-fluid-xs text-rose-900 dark:bg-rose-900 dark:text-rose-100">
            {this.state.error.message}
          </pre>
        )}
        <Button onClick={this.reset} variant="outline">
          <RefreshCw className="h-4 w-4" />
          Spróbuj ponownie
        </Button>
      </div>
    );
  }
}
