import { chromium } from "playwright";
const browser = await chromium.launch();
// Subset of new Wave 5 routes — focus on quality verification
const routes = [
  "/v5/cennik",
  "/v5/jak-to-dziala",
  "/v5/dla-firm",
  "/v5/moduly/sprzeciw-epu",
  "/v5/faq",
  "/v5/changelog",
  "/v5/status",
];
const viewports = [
  { w: 375, h: 800, n: "375" },
  { w: 768, h: 900, n: "768" },
  { w: 1280, h: 900, n: "1280" },
];
const overall = [];

for (const route of routes) {
  for (const vp of viewports) {
    const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h } });
    const page = await ctx.newPage();
    try {
      await page.goto(`http://localhost:3000${route}`, {
        waitUntil: "networkidle",
        timeout: 30000,
      });
      await page.waitForTimeout(400);
      const overflowing = await page.evaluate(() => {
        const vpW = window.innerWidth;
        const all = document.querySelectorAll("*");
        const results = [];
        all.forEach((el) => {
          const r = el.getBoundingClientRect();
          if (r.right > vpW + 1 && r.width < 2000 && r.width > 50 && r.height > 0) {
            const cs = getComputedStyle(el);
            if (cs.display === "none" || cs.visibility === "hidden") return;
            let p = el.parentElement;
            let clipped = false;
            while (p && p !== document.body) {
              const pcs = getComputedStyle(p);
              if (pcs.overflow === "hidden" || pcs.overflowX === "hidden") {
                clipped = true;
                break;
              }
              p = p.parentElement;
            }
            if (clipped) return;
            results.push({
              tag: el.tagName,
              cls: typeof el.className === "string" ? el.className.slice(0, 40) : "",
              right: Math.round(r.right),
              width: Math.round(r.width),
            });
          }
        });
        return results.slice(0, 3);
      });
      const pageH = await page.evaluate(() => document.body.scrollHeight);
      overall.push({ route, vp: vp.n, overflow: overflowing.length, pageH });
      console.log(
        `${route} @${vp.n}: ${overflowing.length === 0 ? "✓ PASS" : "✗ FAIL"} · h=${pageH}px${overflowing.length ? " · " + JSON.stringify(overflowing.slice(0, 1)) : ""}`,
      );
    } catch (e) {
      console.log(`${route} @${vp.n}: ERROR ${e.message}`);
      overall.push({ route, vp: vp.n, overflow: 999, pageH: 0 });
    } finally {
      await ctx.close();
    }
  }
}
await browser.close();
const fails = overall.filter((o) => o.overflow > 0).length;
console.log(
  `\n${fails === 0 ? "✓" : "✗"} ${overall.length - fails}/${overall.length} viewport-route combos passed`,
);
process.exit(fails === 0 ? 0 : 1);
