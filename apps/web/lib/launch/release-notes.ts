/**
 * Tier 31 — Release notes registry.
 * Aktualizowane manualnie przy każdym release (lub generowane z PR titles).
 */
export interface ReleaseNote {
  version: string;
  date: string; // ISO yyyy-mm-dd
  highlights: string[];
  changes: {
    type: "feature" | "fix" | "improvement" | "security" | "breaking";
    description: string;
  }[];
  migration_notes?: string;
}

export const RELEASE_HISTORY: ReleaseNote[] = [
  {
    version: "v1.0.0-rc.1",
    date: "2026-05-11",
    highlights: [
      "Production launch readiness",
      "Pełny portal użytkownika (8 sekcji ustawień)",
      "Unifikowany admin compliance console",
      "E2E smoke testy + Lighthouse CI",
      "Onboarding tour + help center",
    ],
    changes: [
      { type: "feature", description: "Tier 29: Onboarding welcome tour z localStorage persistence" },
      { type: "feature", description: "Tier 29: HelpCenter floating button" },
      { type: "feature", description: "Tier 29: ContextualTooltip dla podpowiedzi prawnych" },
      { type: "feature", description: "Tier 29: PageSkeleton loading patterns dla wszystkich panel pages" },
      { type: "feature", description: "Tier 29: Microcopy library z A/B variants" },
      { type: "feature", description: "Tier 29: EmptyState presets (cases, search, notifications, api-keys)" },
      { type: "feature", description: "Tier 30: Critical-flows.spec.ts — Playwright smoke tests" },
      { type: "feature", description: "Tier 30: Security-headers.spec.ts — CSP/HSTS verification" },
      { type: "feature", description: "Tier 30: ErrorBoundary client z Sentry integration" },
      { type: "feature", description: "Tier 30: GlobalError.tsx — root error fallback" },
      { type: "feature", description: "Tier 30: Health-detailed lib (Resend, PostHog, OpenAI, OAuth providers)" },
      { type: "feature", description: "Tier 31: i18n panel strings (pl/en/uk/cs/ro)" },
      { type: "feature", description: "Tier 31: OptimizedImage wrapper z CLS protection" },
      { type: "improvement", description: "Tier 27: Unified admin compliance console layout" },
      { type: "improvement", description: "Tier 28: Settings hub z 8 sekcjami" },
      { type: "security", description: "Tier 28: One-time-reveal pattern dla API keys" },
      { type: "security", description: "Tier 28: WebAuthn credentials management UI" },
    ],
  },
  {
    version: "v0.26.0",
    date: "2026-05-10",
    highlights: ["Tier 24-26 — external integrations + wizard catalog"],
    changes: [
      { type: "feature", description: "Microsoft 365 Graph API client" },
      { type: "feature", description: "Court e-filing gateway (EPU/PRS/KRZ/PI)" },
      { type: "feature", description: "OpenAPI 3.1 + TS/Python SDK generators" },
      { type: "feature", description: "Wizard catalog launcher (sticky filter)" },
      { type: "fix", description: "React.Children.only crash w button.tsx (asChild Slot)" },
    ],
  },
];

export function getLatestRelease(): ReleaseNote {
  return RELEASE_HISTORY[0];
}

export function getReleaseByVersion(version: string): ReleaseNote | undefined {
  return RELEASE_HISTORY.find((r) => r.version === version);
}
