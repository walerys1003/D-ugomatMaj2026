import { chromium } from "playwright";
const browser = await chromium.launch();
const routes = ['/', '/cennik', '/moduly/upadlosc', '/moduly/sprzeciw-epu', '/moduly/komornik', '/jak-to-dziala', '/skaner-nakazu', '/o-nas', '/kontakt'];
const viewports = [{w:375,n:"375"},{w:768,n:"768"},{w:1024,n:"1024"},{w:1280,n:"1280"}];
const overall = [];
for (const route of routes) {
  for (const vp of viewports) {
    const ctx = await browser.newContext({ viewport: { width: vp.w, height: 900 } });
    const page = await ctx.newPage();
    try {
      await page.goto(`http://localhost:3000${route}`, { waitUntil: "networkidle", timeout: 20000 });
      await page.waitForTimeout(400);
      const overflowing = await page.evaluate(() => {
        const vpW = window.innerWidth;
        const all = document.querySelectorAll('*');
        const results = new Set();
        all.forEach((el) => {
          const r = el.getBoundingClientRect();
          if (r.right > vpW + 1 && r.width < 2000 && r.width > 50 && r.height > 0) {
            const cs = getComputedStyle(el);
            if (cs.display === 'none' || cs.visibility === 'hidden') return;
            // Skip if parent has overflow:hidden (it'll be clipped anyway)
            let p = el.parentElement;
            let clipped = false;
            while (p && p !== document.body) {
              const pcs = getComputedStyle(p);
              if (pcs.overflow === 'hidden' || pcs.overflowX === 'hidden') { clipped = true; break; }
              p = p.parentElement;
            }
            if (clipped) return;
            const tag = el.tagName.toLowerCase();
            const id = el.id || el.getAttribute('aria-labelledby') || '';
            results.add(`${tag}#${id} right=${Math.round(r.right)} w=${Math.round(r.width)}`);
          }
        });
        return [...results].slice(0, 3);
      });
      if (overflowing.length > 0) {
        console.log(`\n❌ ${route} @ ${vp.n}px:`);
        overflowing.forEach(s => console.log('   ', s));
        overall.push({route, vp: vp.n, overflow: overflowing});
      }
    } catch (e) {
      console.log(`⚠️  ${route} @ ${vp.n}: ${e.message.slice(0, 50)}`);
    }
    await ctx.close();
  }
}
console.log(`\n=== ${overall.length === 0 ? '✅ ALL CLEAR' : `❌ ${overall.length} issues`} ===`);
await browser.close();
