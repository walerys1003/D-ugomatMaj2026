import { chromium } from "playwright";
const browser = await chromium.launch();
for (const vp of [{w:375,h:700,n:"375"},{w:768,h:900,n:"768"},{w:1024,h:800,n:"1024"},{w:1280,h:900,n:"1280"},{w:1440,h:900,n:"1440"}]) {
  const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h } });
  const page = await ctx.newPage();
  await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  const overflowing = await page.evaluate(() => {
    const vpW = window.innerWidth;
    const all = document.querySelectorAll('*');
    const results = new Set();
    all.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.right > vpW + 1 && r.width < 2000 && r.width > 20 && r.height > 0) {
        const tag = el.tagName.toLowerCase();
        const id = el.id || el.getAttribute('aria-labelledby') || el.getAttribute('aria-label') || '';
        const cls = (el.className && el.className.toString) ? el.className.toString().split(' ').slice(0,3).join(' ') : '';
        results.add(`${tag}#${id}.${cls} right=${Math.round(r.right)} w=${Math.round(r.width)}`);
      }
    });
    return { vpW, overflowing: [...results].slice(0, 8) };
  });
  console.log(`\n--- vp ${vp.n} ---`);
  if (overflowing.overflowing.length === 0) console.log('  ✅ no overflow');
  else overflowing.overflowing.forEach(s => console.log('  ❌', s));
  await ctx.close();
}
await browser.close();
