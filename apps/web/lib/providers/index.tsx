"use client";

import * as React from "react";
import { ThemeProvider } from "@/lib/providers/theme-provider";
import { PostHogProvider } from "@/lib/providers/posthog-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ToastViewportProvider } from "@/components/ui/toast";

/**
 * Composite client-side providers for the whole app.
 * Order matters: theme first (so child providers can read CSS vars),
 * tooltip provider before any tooltip user, toast provider+viewport last.
 *
 * Tier 5 zad. 247 — PostHogProvider wewnątrz Suspense (bo używa
 * useSearchParams) — z punktu widzenia call-sites jest no-op gdy
 * NEXT_PUBLIC_POSTHOG_KEY nie jest ustawione.
 */
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <React.Suspense fallback={null}>
        <PostHogProvider>
          <TooltipProvider delayDuration={250}>
            <ToastViewportProvider>{children}</ToastViewportProvider>
          </TooltipProvider>
        </PostHogProvider>
      </React.Suspense>
    </ThemeProvider>
  );
}
