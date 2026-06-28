/**
 * Tier 5 zad. 222 — Visual regression tests (Playwright snapshots).
 *
 * Cel: wykrywać niezamierzone zmiany layoutu kluczowych stron (landing,
 * cennik, baza-wiedzy index, skaner-nakazu, status).
 *
 * Baseline:
 *   - Pierwsze uruchomienie: `npx playwright test visual-regression --update-snapshots`
 *   - CI failuje jeśli snapshot ≠ baseline (threshold maxDiffPixelRatio).
 *
 * Stabilizacja:
 *   - Maskowanie elementów dynamicznych (status timestamp, web vitals).
 *   - `fullPage: false` (tylko viewport) — strony są długie, full-page robi
 *     fałszywe pozytywy przy każdym tweaku CTA-bandu na końcu.
 *   - `animations: 'disabled'` — Framer Motion zatrzymane na końcowym frame.
 *
 * Wynik: artefakty w `tests/e2e/__screenshots__/` (commitowane do repo).
 */
import { test, expect } from "@playwright/test";

// Strony publiczne — statyczne, nie wymagają loginu.
const SNAPS = [
  { name: "landing", path: "/" },
  { name: "cennik", path: "/cennik" },
  { name: "baza-wiedzy-index", path: "/baza-wiedzy" },
  { name: "skaner-nakazu", path: "/skaner-nakazu" },
  { name: "moduly", path: "/moduly" },
  { name: "status", path: "/status" },
] as const;

for (const snap of SNAPS) {
  test(`Visual regression — ${snap.name}`, async ({ page }) => {
    await page.goto(snap.path);
    // Czekamy aż layout się ustabilizuje — main + jakikolwiek heading.
    await page.waitForLoadState("networkidle");
    await page.waitForSelector("main, [role='main']", { timeout: 10_000 });

    // Maskuj elementy dynamiczne (timestamp, web-vitals JSON, animated counters).
    // Naprawa kosmetyczna dla determinizmu CI.
    const masks = [
      page.locator("[data-testid='status-timestamp']"),
      page.locator("[data-testid='web-vitals']"),
      page.locator("time"),
      page.locator("[data-dynamic='true']"),
    ];

    await expect(page).toHaveScreenshot(`${snap.name}.png`, {
      fullPage: false,
      animations: "disabled",
      mask: masks,
      maxDiffPixelRatio: 0.02, // tolerancja 2% pikseli (subpixel rendering)
      timeout: 15_000,
    });
  });
}
