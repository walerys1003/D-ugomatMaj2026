/**
 * Tier 10 — Release notes registry. Used to render /aktualnosci + /api/launch/release-notes.
 */
export interface ReleaseNote {
  version: string;
  date: string; // YYYY-MM-DD
  highlights: string[];
  changes: { type: "feat" | "fix" | "perf" | "docs" | "chore"; text: string }[];
}

export const RELEASE_NOTES: ReleaseNote[] = [
  {
    version: "v2.10.0",
    date: "2026-05-13",
    highlights: [
      "Pricing v2 — 5 planów subskrypcyjnych z roczną zniżką 20%",
      "Program afiliacyjny (20%/10% × 12 mies.) + referral v2 z kredytami",
      "Mobile apps (PWA + Capacitor bridge) + offline sync",
      "CEE expansion (CZ/SK/HU/RO) — 6 locale, 21 typów spraw",
      "Final polish — admin dashboard, feature flags, OpenAPI docs",
    ],
    changes: [
      { type: "feat", text: "Pricing v2 + Stripe Customer Portal + proration" },
      { type: "feat", text: "Lifecycle drip campaigns (7 kampanii)" },
      { type: "feat", text: "EU OSS VAT + PL VAT faktury (Fakturownia)" },
      { type: "feat", text: "Native push (FCM/APNs) + biometric auth bridge" },
      { type: "feat", text: "WCAG 2.1 AA programowy audyt" },
      { type: "perf", text: "IndexedDB offline queue + exp backoff" },
      { type: "docs", text: "OpenAPI 3.1 spec dla publicznego API" },
    ],
  },
];

export function latestRelease(): ReleaseNote | null {
  return RELEASE_NOTES[0] ?? null;
}
