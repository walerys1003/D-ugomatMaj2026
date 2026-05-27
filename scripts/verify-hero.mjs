// Verification script for V4-ι.3 hero fix - with cookie dismiss.
import { chromium } from "playwright";
import { writeFile } from "node:fs/promises";

const URL = process.env.URL || "http://localhost:3000";
const viewports = [
  { name: "mobile-375", w: 375, h: 700 },
  { name: "tablet-768", w: 768, h: 900 },
  { name: "laptop-1024", w: 1024, h: 800 },
  { name: "desktop-1280", w: 1280, h: 900 },
  { name: "desktop-1440", w: 1440, h: 900 },
];

const browser = await chromium.launch();
const results = [];

for (const v of viewports) {
  const ctx = await browser.newContext({ viewport: { width: v.w, height: v.h } });
  await ctx.addInitScript(() => {
    // Pre-dismiss cookie consent
    try { localStorage.setItem('dlugomat:cookie-consent', JSON.stringify({ choice: 'accepted', timestamp: Date.now() })); } catch {}
  });
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForSelector('[aria-labelledby="hero-headline"]', { timeout: 10000 });
  await page.waitForTimeout(800);

  const measurements = await page.evaluate(() => {
    const section = document.querySelector('[aria-labelledby="hero-headline"]');
    const grid = section?.querySelector('.grid');
    const cols = grid ? Array.from(grid.children) : [];
    const cards = document.querySelectorAll('[aria-label="Wynik skanera"], [aria-label="Podgląd pisma — sprzeciw"]');
    return {
      section: section ? (() => { const r = section.getBoundingClientRect(); return { left: Math.round(r.left), right: Math.round(r.right), width: Math.round(r.width) }; })() : null,
      grid: grid ? (() => { const r = grid.getBoundingClientRect(); return { left: Math.round(r.left), right: Math.round(r.right), width: Math.round(r.width) }; })() : null,
      cols: cols.map((c, i) => { const r = c.getBoundingClientRect(); return { idx: i, w: Math.round(r.width), left: Math.round(r.left), right: Math.round(r.right), top: Math.round(r.top) }; }),
      cards: Array.from(cards).map((c) => { const r = c.getBoundingClientRect(); return { label: c.getAttribute("aria-label"), w: Math.round(r.width), left: Math.round(r.left), right: Math.round(r.right), top: Math.round(r.top) }; }),
    };
  });

  await page.screenshot({ path: `/tmp/hero-${v.name}-nocookie.png`, fullPage: false });
  results.push({ viewport: v.name, vpW: v.w, ...measurements });

  console.log(`\n━━━ ${v.name} (${v.w}×${v.h}) ━━━`);
  console.log(`  cols: ${measurements.cols.map(c => `[${c.idx}]w=${c.w}`).join(' ')}`);
  measurements.cards.forEach((c) => {
    const status = c.right > v.w + 1 ? "❌" : "✓";
    console.log(`  ${status} ${c.label.slice(0,20)}: w=${c.w} right=${c.right} (vp ${v.w})`);
  });

  await ctx.close();
}

await browser.close();
await writeFile("/tmp/hero-verify.json", JSON.stringify(results, null, 2));
const anyOverflow = results.some((r) => r.cards.some((c) => c.right > r.vpW + 1));
console.log(`\n${anyOverflow ? "❌ FAILED" : "✅ OK"}`);
process.exit(anyOverflow ? 1 : 0);
