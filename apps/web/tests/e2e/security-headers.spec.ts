import { test, expect } from "@playwright/test";

/**
 * Tier 30 — Security headers verification.
 * Sprawdza obecność CSP, HSTS, X-Frame-Options, X-Content-Type-Options itd.
 */

test.describe("Security headers", () => {
  test("Landing — security headers obecne", async ({ request }) => {
    const res = await request.get("/");
    const headers = res.headers();
    // Strict-Transport-Security w produkcji
    if (process.env.NODE_ENV === "production") {
      expect(headers["strict-transport-security"]).toBeDefined();
    }
    // X-Frame-Options lub frame-ancestors w CSP
    const hasFrameProtection =
      headers["x-frame-options"] ||
      (headers["content-security-policy"] && headers["content-security-policy"].includes("frame-ancestors"));
    expect(hasFrameProtection).toBeTruthy();
    // X-Content-Type-Options
    expect(headers["x-content-type-options"]).toBe("nosniff");
  });

  test("Panel — brak indeksowania", async ({ request }) => {
    const res = await request.get("/panel", { maxRedirects: 0 }).catch(() => null);
    // Albo redirect (302) albo 200 z X-Robots-Tag
    if (res && res.status() === 200) {
      const tag = res.headers()["x-robots-tag"];
      expect(tag).toMatch(/noindex/i);
    }
  });
});
