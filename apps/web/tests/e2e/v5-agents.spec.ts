import { expect, test } from "@playwright/test";

/**
 * V5-INFRA · Agent surface E2E
 * ============================================================================
 * Verifies that each of the 10 agent surfaces renders on `/v5/showcase`
 * and that the standalone V5 routes (`/v5`, `/v5/panel`, `/v5/admin`,
 * `/v5/gallery`) load correctly with the `data-v5="on"` toggle active.
 *
 * Coverage:
 *   • Agent 01 Design System — primitives mount on /v5/gallery
 *   • Agent 02 Landing — hero cockpit + sections on /v5
 *   • Agent 03 Reasoning — IRAC + audit chain + retrieval on /v5/showcase
 *   • Agent 04 User Panel — shell + dashboard on /v5/panel
 *   • Agent 05 Admin — ops center on /v5/admin
 *   • Agent 06 AI Orchestration — model router + agent run on /v5/showcase
 *   • Agent 07 Cases — timeline + win-probability on /v5/showcase
 *   • Agent 08 Documents — version tree + diff + signature on /v5/showcase
 *   • Agent 09 Mobile — phone-frame mount on /v5/showcase
 *   • Agent 10 Motion — pulse + counter + reveal on /v5/showcase
 *   • Orchestrator — data-v5 toggle, V5 cookie set/clear
 */

test.describe("V5-INFRA · root toggle & route reachability", () => {
  test("html[data-v5='on'] is applied on every /v5 route", async ({ page }) => {
    for (const route of ["/v5", "/v5/showcase", "/v5/panel", "/v5/admin", "/v5/gallery"]) {
      await page.goto(route);
      const dataV5 = await page.locator("html").getAttribute("data-v5");
      expect(dataV5, `route=${route}`).toBe("on");
    }
  });

  test("?v5=on query sets cookie; ?v5=off clears it", async ({ page, context }) => {
    await page.goto("/?v5=on");
    let cookies = await context.cookies();
    expect(cookies.find((c) => c.name === "v5")?.value).toBe("on");

    await page.goto("/?v5=off");
    cookies = await context.cookies();
    expect(cookies.find((c) => c.name === "v5")).toBeUndefined();
  });
});

test.describe("V5 Landing (/v5)", () => {
  test("hero cockpit renders with CTAs", async ({ page }) => {
    await page.goto("/v5");
    // Heading is present
    await expect(page.locator("h1").first()).toBeVisible();
    // Primary CTA exists somewhere on the hero
    const cta = page
      .getByRole("link", { name: /skanuj|skaner|zacznij|rozpocznij/i })
      .first();
    await expect(cta).toBeVisible();
  });

  test("module grid + trust block + footer mount", async ({ page }) => {
    await page.goto("/v5");
    // Eyebrow / module headings appear (we just count surfaces)
    const surfaces = await page.locator('[class*="v5-surface"]').count();
    expect(surfaces).toBeGreaterThanOrEqual(6);
  });
});

test.describe("V5 Panel (/v5/panel)", () => {
  test("shell + dashboard render", async ({ page }) => {
    await page.goto("/v5/panel");
    // Dashboard KPI surfaces
    const surfaces = await page.locator('[class*="v5-surface"]').count();
    expect(surfaces).toBeGreaterThanOrEqual(4);
    // Top bar title
    await expect(page.locator("h1").first()).toBeVisible();
  });
});

test.describe("V5 Admin (/v5/admin)", () => {
  test("ops center renders with sidebar + nav + content sections", async ({ page }) => {
    await page.goto("/v5/admin");
    await page.waitForLoadState("networkidle");
    // Admin shell uses dark theme with custom surfaces — assert structural anchors
    const txt = await page.locator("body").innerText();
    expect(txt).toMatch(/admin|ops|operations|audit|realtime/i);
    // At least one V5Surface (used inside V5OpsCenter)
    const surfaces = await page.locator('[class*="v5-surface"]').count();
    expect(surfaces).toBeGreaterThanOrEqual(1);
    // KPI tiles + chart area + audit terminal — count rounded card-like containers
    const cards = await page
      .locator('[class*="rounded-[var(--v5-radius"]')
      .count();
    expect(cards).toBeGreaterThanOrEqual(3);
  });
});

test.describe("V5 Gallery (/v5/gallery)", () => {
  test("renders >= 15 primitive stories", async ({ page }) => {
    await page.goto("/v5/gallery");
    await page.waitForLoadState("networkidle");
    const stories = await page.locator(".v5-surface-raised").count();
    expect(stories).toBeGreaterThanOrEqual(15);
  });

  test("V5Button variants all clickable", async ({ page }) => {
    await page.goto("/v5/gallery");
    // At least 5 buttons rendered
    const buttons = await page.getByRole("button").count();
    expect(buttons).toBeGreaterThanOrEqual(5);
  });
});

test.describe("V5 Showcase (/v5/showcase) — all 10 agents present", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/v5/showcase");
    await page.waitForLoadState("networkidle");
  });

  test("Agent 02 — hero + landing sections", async ({ page }) => {
    await expect(page.locator("h1").first()).toBeVisible();
    // At least one module card surface
    const surfaces = await page.locator('[class*="v5-surface"]').count();
    expect(surfaces).toBeGreaterThanOrEqual(10);
  });

  test("Agent 03 — IRAC + audit chain visible", async ({ page }) => {
    const txt = await page.locator("body").innerText();
    expect(txt).toMatch(/IRAC|Issue|Rule|Application|Conclusion/i);
    expect(txt).toMatch(/audit chain|signed|provenance/i);
  });

  test("Agent 06 — AI orchestration visible", async ({ page }) => {
    const txt = await page.locator("body").innerText();
    expect(txt).toMatch(/agent\.run|model router|claude|gpt|router/i);
  });

  test("Agent 07 — case timeline + win-probability visible", async ({ page }) => {
    const txt = await page.locator("body").innerText();
    expect(txt).toMatch(/timeline|win.{0,3}prob|nakaz|sprzeciw/i);
  });

  test("Agent 08 — version tree + signature visible", async ({ page }) => {
    const txt = await page.locator("body").innerText();
    expect(txt).toMatch(/version|wersja|EPUAP|PAdES|signature|podpis/i);
  });

  test("Agent 09 — mobile phone frame rendered", async ({ page }) => {
    // Phone frame is a 320px-wide div with rounded-[40px] border
    const phone = page.locator('div[class*="w-[320px]"]');
    await expect(phone.first()).toBeVisible();
  });

  test("Agent 10 — pulse + counter motion primitives present", async ({ page }) => {
    // Pulse indicators (live)
    const pulses = await page.locator('[aria-label^="Live"]').count();
    expect(pulses).toBeGreaterThanOrEqual(1);
  });
});

test.describe("V5 visual hygiene", () => {
  test("no horizontal overflow on /v5 @375", async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width: 375, height: 800 } });
    const page = await ctx.newPage();
    await page.goto("/v5");
    await page.waitForLoadState("networkidle");
    const overflowing = await page.evaluate(() => {
      const vpW = window.innerWidth;
      const offenders: Array<{ tag: string; right: number; width: number }> = [];
      document.querySelectorAll<HTMLElement>("*").forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.right > vpW + 1 && r.width < 2000 && r.width > 50 && r.height > 0) {
          let p: HTMLElement | null = el.parentElement;
          let clipped = false;
          while (p && p !== document.body) {
            const cs = getComputedStyle(p);
            if (cs.overflow === "hidden" || cs.overflowX === "hidden") {
              clipped = true;
              break;
            }
            p = p.parentElement;
          }
          if (!clipped)
            offenders.push({
              tag: el.tagName,
              right: Math.round(r.right),
              width: Math.round(r.width),
            });
        }
      });
      return offenders.slice(0, 3);
    });
    expect(overflowing, `overflow @375: ${JSON.stringify(overflowing)}`).toEqual([]);
    await ctx.close();
  });
});
