import { chromium } from "playwright";
const browser = await chromium.launch();
const routes = [
  // Wave 1-4 — landing + framework
  "/v5",
  "/v5/showcase",
  "/v5/panel",
  "/v5/admin",
  "/v5/gallery",
  // Wave 5 — marketing suite (B3)
  "/v5/cennik",
  "/v5/jak-to-dziala",
  "/v5/skaner-nakazu",
  "/v5/dla-firm",
  "/v5/dla-kancelarii",
  "/v5/baza-wiedzy",
  "/v5/precedensy",
  "/v5/case-studies",
  "/v5/bezpieczenstwo",
  "/v5/rodo",
  "/v5/changelog",
  "/v5/status",
  "/v5/porownanie-konkurencja",
  "/v5/roi-b2b",
  "/v5/o-nas",
  "/v5/kontakt",
  "/v5/faq",
  // Wave 5 — module pages (B2) — sample subset
  "/v5/moduly/sprzeciw-epu",
  "/v5/moduly/komornik",
  "/v5/moduly/cesja",
  "/v5/moduly/bik",
  "/v5/moduly/wezwania",
];
const viewports = [
  { w: 375, h: 800, n: "375" },
  { w: 768, h: 900, n: "768" },
  { w: 1024, h: 900, n: "1024" },
  { w: 1280, h: 900, n: "1280" },
  { w: 1440, h: 900, n: "1440" },
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
      await page.waitForTimeout(500);
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
              cls: typeof el.className === "string" ? el.className.slice(0, 60) : "",
              right: Math.round(r.right),
              width: Math.round(r.width),
            });
          }
        });
        return results.slice(0, 5);
      });
      const pageH = await page.evaluate(() => document.body.scrollHeight);
      overall.push({ route, vp: vp.n, overflow: overflowing.length, pageH });
      console.log(
        `${route} @${vp.n}: ${overflowing.length === 0 ? "✓ PASS" : "✗ FAIL"} · height=${pageH}px${overflowing.length ? " · " + JSON.stringify(overflowing.slice(0, 2)) : ""}`,
      );
    } catch (e) {
      console.log(`${route} @${vp.n}: ERROR ${e.message}`);
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
