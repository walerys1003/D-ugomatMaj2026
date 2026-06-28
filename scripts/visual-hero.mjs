import { chromium } from "playwright";
const browser = await chromium.launch();
for (const vp of [{w:375,h:900,n:'375'}, {w:768,h:900,n:'768'}, {w:1024,h:900,n:'1024'}, {w:1280,h:900,n:'1280'}, {w:1440,h:900,n:'1440'}]) {
  const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h } });
  await ctx.addInitScript(() => { try { localStorage.setItem('dlugomat:cookie-consent', JSON.stringify({choice:'accepted',timestamp:Date.now()})); } catch{} try { document.cookie = 'cookie-consent=accepted; path=/'; } catch{} });
  const page = await ctx.newPage();
  await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  // Hide cookie modal if still present
  await page.evaluate(() => {
    const modals = document.querySelectorAll('[role="dialog"], [class*="cookie"], [aria-label*="cookie"i]');
    modals.forEach(m => m.style.display = 'none');
    const fixedDivs = document.querySelectorAll('body > div');
    fixedDivs.forEach(d => { const cs = getComputedStyle(d); if (cs.position === 'fixed' && d.textContent.includes('prywatność')) d.style.display = 'none'; });
  });
  await page.waitForTimeout(200);
  await page.screenshot({ path: `/tmp/hero-v6-${vp.n}.png`, fullPage: false });
  console.log(`saved hero-v6-${vp.n}`);
}
await browser.close();
