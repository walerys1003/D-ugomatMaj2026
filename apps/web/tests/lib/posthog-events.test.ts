import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  ALERTS,
  FUNNELS,
  trackEvent,
} from "@/lib/observability/posthog-events";

/**
 * Tier 5 zad. 247 — testy taxonomy + funnel definitions.
 *
 * Te testy chronią przed regresją taxonomy (przypadkowa zmiana nazwy
 * eventu = zerwanie historycznych dashboardów PostHog).
 */

describe("trackEvent", () => {
  let infoSpy: ReturnType<typeof vi.spyOn>;
  let originalNodeEnv: string | undefined;

  beforeEach(() => {
    infoSpy = vi.spyOn(console, "info").mockImplementation(() => {});
    originalNodeEnv = process.env.NODE_ENV;
  });

  afterEach(() => {
    infoSpy.mockRestore();
    if (originalNodeEnv === undefined) {
      delete (process.env as Record<string, string | undefined>).NODE_ENV;
    } else {
      (process.env as Record<string, string | undefined>).NODE_ENV =
        originalNodeEnv;
    }
  });

  it("does not throw on unknown payload", () => {
    expect(() =>
      trackEvent("page_view", { path: "/", custom: { x: 1 } }),
    ).not.toThrow();
  });

  it("emits structured log when no SDK present (dev mode)", () => {
    (process.env as Record<string, string | undefined>).NODE_ENV =
      "development";
    trackEvent("payment_completed", { amount_grosze: 4900 });
    expect(infoSpy).toHaveBeenCalled();
    const arg = String(infoSpy.mock.calls[0]?.[0] ?? "");
    expect(arg).toContain("payment_completed");
    expect(arg).toContain('"source":"analytics"');
  });
});

describe("FUNNELS — taxonomy invariants", () => {
  it("has at least 4 funnels (acquisition / scanner / wizard / retention)", () => {
    expect(FUNNELS.length).toBeGreaterThanOrEqual(4);
  });

  it("each funnel has unique id and >= 2 steps", () => {
    const ids = new Set<string>();
    for (const f of FUNNELS) {
      expect(ids.has(f.id)).toBe(false);
      ids.add(f.id);
      expect(f.steps.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("scanner_to_paid funnel terminates with payment_completed", () => {
    const f = FUNNELS.find((x) => x.id === "scanner_to_paid");
    expect(f).toBeDefined();
    expect(f!.steps.at(-1)?.event).toBe("payment_completed");
  });
});

describe("ALERTS — sanity", () => {
  it("each alert has id, severity and channel", () => {
    for (const a of ALERTS) {
      expect(a.id.length).toBeGreaterThan(0);
      expect(["info", "warn", "critical"]).toContain(a.severity);
      expect(["email", "slack", "both"]).toContain(a.channel);
    }
  });

  it("at least one critical alert covers payments", () => {
    const crit = ALERTS.filter((a) => a.severity === "critical");
    expect(crit.some((a) => /payment/i.test(a.id) || /payment/i.test(a.name))).toBe(
      true,
    );
  });
});
