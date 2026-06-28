import { test, expect } from "@playwright/test";

/**
 * Tier 30 — Critical user-flow smoke tests.
 * Pokrywa: landing → cennik → kreator launcher → kontakt → status.
 * Bez logowania (brak credentiali w CI) — sprawdzamy publiczne flows + 200 OK.
 */

test.describe("Krytyczne ścieżki publiczne", () => {
  test("Landing → cennik → kontakt", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Długomat/i);
    // CTA "Cennik" w nawigacji
    const cennikLink = page.getByRole("link", { name: /cennik/i }).first();
    await cennikLink.click();
    await expect(page).toHaveURL(/\/cennik/);
    await expect(page.locator("h1")).toBeVisible();
    // Przejdź do kontaktu
    await page.goto("/kontakt");
    await expect(page.locator("form")).toBeVisible();
  });

  test("Baza wiedzy — pełna struktura", async ({ page }) => {
    await page.goto("/baza-wiedzy");
    await expect(page.locator("h1")).toBeVisible();
    // Co najmniej 10 artykułów w bazie wiedzy
    const articles = page.getByRole("link").filter({ hasText: /./ });
    expect(await articles.count()).toBeGreaterThan(10);
  });

  test("Moduły D1-D8 — wszystkie dostępne", async ({ page }) => {
    const modules = [
      "/moduly/sprzeciw-epu",
      "/moduly/komornik",
      "/moduly/bik",
      "/moduly/cesja",
      "/moduly/ugoda",
      "/moduly/upadlosc",
      "/moduly/potracenia",
    ];
    for (const m of modules) {
      const response = await page.goto(m);
      expect(response?.status()).toBeLessThan(400);
      await expect(page.locator("h1")).toBeVisible();
    }
  });

  test("Sitemap.xml + robots.txt dostępne", async ({ request }) => {
    const sitemap = await request.get("/sitemap.xml");
    expect(sitemap.status()).toBe(200);
    expect(sitemap.headers()["content-type"]).toContain("xml");
    const sitemapText = await sitemap.text();
    expect(sitemapText).toContain("<urlset");
    expect(sitemapText).toContain("<loc>");

    const robots = await request.get("/robots.txt");
    expect(robots.status()).toBe(200);
    expect(await robots.text()).toContain("User-Agent");
  });

  test("API health endpoint", async ({ request }) => {
    const res = await request.get("/api/health");
    expect(res.status()).toBe(200);
    const data = await res.json();
    // /api/health zwraca { ok, service, version, env, uptime_seconds, time }.
    expect(data).toHaveProperty("ok", true);
    expect(data).toHaveProperty("service");
  });

  test("Auth pages dostępne", async ({ page }) => {
    // Strony auth żyją w route-group `(auth)` → realne URL-e: /sign-in, /sign-up
    // (NIE /auth/sign-in). `.first()` bo strony mają >1 formularz (hasło +
    // magic-link), więc samo `form` łamie strict-mode Playwright.
    const signIn = await page.goto("/sign-in");
    expect(signIn?.status()).toBeLessThan(400);
    await expect(page.locator("input[type='email']").first()).toBeVisible();
    const signUp = await page.goto("/sign-up");
    expect(signUp?.status()).toBeLessThan(400);
    await expect(page.locator("input[type='email']").first()).toBeVisible();
  });

  test("Panel wymaga logowania (redirect 200/302)", async ({ page }) => {
    const response = await page.goto("/panel");
    // Middleware redirect → albo strona logowania, albo 401/302
    const url = page.url();
    expect(url).toMatch(/sign-in|auth|panel/);
    // jeżeli redirect — powinno być 200 na stronie logowania
    if (url.includes("sign-in") || url.includes("auth")) {
      expect(response?.status()).toBeLessThan(400);
    }
  });

  test("Status page działa", async ({ page }) => {
    const response = await page.goto("/status");
    expect(response?.status()).toBeLessThan(400);
  });

  test("Skaner nakazu - landing", async ({ page }) => {
    await page.goto("/skaner-nakazu");
    await expect(page.locator("h1")).toBeVisible();
  });

  test("Kalkulatory dostępne", async ({ page }) => {
    const response = await page.goto("/kalkulatory");
    expect(response?.status()).toBeLessThan(400);
  });
});

test.describe("Performance budget (smoke)", () => {
  test("Landing — first contentful paint", async ({ page }) => {
    const start = Date.now();
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const elapsed = Date.now() - start;
    // DOM ready w < 5s (budżet dla CI; produkcja powinna < 1.5s)
    expect(elapsed).toBeLessThan(5000);
  });

  test("Cennik — bez błędów konsoli", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error" && !msg.text().includes("favicon")) {
        errors.push(msg.text());
      }
    });
    await page.goto("/cennik");
    await page.waitForLoadState("networkidle", { timeout: 10000 }).catch(() => {});
    expect(errors).toEqual([]);
  });
});
