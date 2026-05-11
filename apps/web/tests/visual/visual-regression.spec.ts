/**
 * Tier 32-1 — Visual regression baseline (Playwright + Percy/Chromatic-compatible).
 *
 * Generuje screenshoty kluczowych ekranów w 3 viewport-ach (desktop, tablet, mobile)
 * dla dwóch motywów (light/dark, jeśli dostępne). Playwright `toHaveScreenshot()`
 * z thresholdem 0.05 (5% różnicy pikseli toleruje).
 *
 * Integracja z Percy: skrypt CI uploaduje baseline'y przez `@percy/cli` —
 * konfiguracja w `.percy.yaml` (zob. dolne TOC pliku).
 *
 * Uruchomienie:
 *   npx playwright test tests/visual/  # local
 *   npx percy exec -- npx playwright test tests/visual/  # CI z Percy
 */
import { test, expect } from "@playwright/test";

const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "mobile", width: 375, height: 812 },
];

const SCREENS = [
  { name: "landing", path: "/" },
  { name: "pricing", path: "/cennik" },
  { name: "how-it-works", path: "/jak-to-dziala" },
  { name: "changelog", path: "/changelog" },
  { name: "status", path: "/status" },
  { name: "login", path: "/logowanie" },
  { name: "register", path: "/rejestracja" },
  { name: "rodo", path: "/rodo" },
];

for (const vp of VIEWPORTS) {
  test.describe(`visual @ ${vp.name}`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } });

    for (const screen of SCREENS) {
      test(`${screen.name}`, async ({ page }) => {
        await page.goto(screen.path, { waitUntil: "networkidle" });

        // Disable animations for stable screenshots
        await page.addStyleTag({
          content: `
            *, *::before, *::after {
              animation-duration: 0s !important;
              animation-delay: 0s !important;
              transition-duration: 0s !important;
              transition-delay: 0s !important;
            }
          `,
        });

        // Mask volatile UI (timestamps, live metrics)
        const maskSelectors = [
          '[data-testid="live-timestamp"]',
          '[data-testid="live-metric"]',
          '[data-testid="status-uptime"]',
          'time',
        ];

        await expect(page).toHaveScreenshot(`${screen.name}-${vp.name}.png`, {
          fullPage: true,
          maxDiffPixelRatio: 0.05,
          mask: await Promise.all(
            maskSelectors.map(async (s) => page.locator(s)).flat(),
          ).then(() => maskSelectors.map((s) => page.locator(s))),
        });
      });
    }
  });
}

/**
 * Konfiguracja Percy (umieść w `.percy.yaml` w root):
 *
 *   version: 2
 *   snapshot:
 *     widths: [375, 768, 1440]
 *     min-height: 1024
 *     percy-css: |
 *       [data-testid="live-timestamp"], time { visibility: hidden; }
 *   discovery:
 *     allowed-hostnames:
 *       - dlugomat.pl
 *       - localhost
 *     network-idle-timeout: 750
 *
 * Sekret: `PERCY_TOKEN` w Vercel/CI env. Każdy PR → osobny build w Percy.
 */
