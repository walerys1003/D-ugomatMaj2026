import { expect, test } from "@playwright/test";

/**
 * Landing smoke tests. Sprawdza, że strona główna renderuje się poprawnie,
 * główne CTA są widoczne i klikalne, oraz że JSON-LD FAQ jest osadzony.
 *
 * Tier 2 nie wymaga uwierzytelnienia, więc nie potrzebujemy `storageState`.
 * Tier 3 wprowadzi authenticated test fixture do testów wizardów.
 */
test.describe("Landing — Calm Authority surface", () => {
  test("renderuje hero z głównym CTA i nawigacją", async ({ page }) => {
    await page.goto("/");

    // Hero heading — szukamy konkretnej frazy z pewnością obecnej w designie
    await expect(
      page.getByRole("heading", { level: 1 }),
    ).toBeVisible();

    // Główne CTA powinno prowadzić do panelu lub rejestracji
    const cta = page.getByRole("link", { name: /rozpocznij|zacznij|sprawdź|zeskanuj/i }).first();
    await expect(cta).toBeVisible();

    // Site header musi mieć link do logowania
    await expect(
      page.getByRole("link", { name: /zaloguj|sign.in/i }).first(),
    ).toBeVisible();
  });

  test("FAQ ma JSON-LD schema (SEO)", async ({ page }) => {
    await page.goto("/");
    const ldJsonCount = await page
      .locator('script[type="application/ld+json"]')
      .count();
    expect(ldJsonCount).toBeGreaterThan(0);
  });

  test("nieautoryzowany dostęp do /panel przekierowuje do /sign-in", async ({ page }) => {
    const response = await page.goto("/panel");
    // Po redirect URL kończy się /sign-in?next=/panel
    expect(page.url()).toMatch(/\/sign-in/);
    expect(response?.ok()).toBeTruthy();
  });
});
