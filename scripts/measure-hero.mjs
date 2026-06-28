import { chromium } from "playwright";
const browser = await chromium.launch();
for (const vp of [{w:1024,h:900},{w:1280,h:900},{w:1440,h:900}]) {
  const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h } });
  const page = await ctx.newPage();
  await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  const m = await page.evaluate(() => {
    const headline = document.querySelector('#hero-headline');
    const hr = headline?.getBoundingClientRect();
    const headlineStyle = headline ? getComputedStyle(headline) : null;
    const grid = document.querySelector('[aria-labelledby="hero-headline"] .grid');
    const cols = grid ? Array.from(grid.children).map(c => { const r = c.getBoundingClientRect(); return { w: Math.round(r.width), left: Math.round(r.left), right: Math.round(r.right), top: Math.round(r.top), bottom: Math.round(r.bottom) }; }) : [];
    const cards = document.querySelectorAll('[aria-label="Wynik skanera"], [aria-label="Podgląd pisma — sprzeciw"]');
    return {
      vpW: window.innerWidth,
      headline: hr ? { w: Math.round(hr.width), height: Math.round(hr.height), fontSize: headlineStyle?.fontSize, lineCount: Math.round(hr.height / parseFloat(headlineStyle?.lineHeight || '1')) } : null,
      cols,
      cards: Array.from(cards).map(c => { const r = c.getBoundingClientRect(); return { label: c.getAttribute('aria-label'), w: Math.round(r.width), left: Math.round(r.left), right: Math.round(r.right) }; }),
    };
  });
  console.log(`\n--- vp ${vp.w} ---`);
  console.log(`  headline: w=${m.headline?.w} h=${m.headline?.height} font=${m.headline?.fontSize}`);
  console.log(`  cols: ${m.cols.map((c,i) => `[${i}]w=${c.w} top=${c.top}-${c.bottom}`).join(' | ')}`);
  m.cards.forEach(c => console.log(`  card ${c.label}: w=${c.w} right=${c.right} (vp ${m.vpW})`));
  await ctx.close();
}
await browser.close();
