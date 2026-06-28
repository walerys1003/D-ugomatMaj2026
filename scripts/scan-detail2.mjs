import { chromium } from "playwright";
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 375, height: 800 } });
const p = await ctx.newPage();
await p.goto("http://localhost:3000/v5/showcase", { waitUntil: "networkidle", timeout: 30000 });
await p.waitForTimeout(800);
// Find a specific wide div and check its first wide DESCENDANT
const items = await p.evaluate(() => {
  const sel = document.querySelectorAll(".v5-surface-raised");
  for (const s of sel) {
    const r = s.getBoundingClientRect();
    if (r.right > 376 && r.width > 376) {
      // find first descendant wider than viewport
      const desc = s.querySelectorAll("*");
      for (const d of desc) {
        const dr = d.getBoundingClientRect();
        if (dr.width > 376) {
          return {
            container: { cls: s.className.slice(0, 60), width: Math.round(r.width), top: Math.round(r.top) },
            culprit: { tag: d.tagName, cls: (typeof d.className === "string" ? d.className : "").slice(0, 80), width: Math.round(dr.width), text: d.textContent?.slice(0, 80) || "" },
          };
        }
      }
    }
  }
  return null;
});
console.log(JSON.stringify(items, null, 2));
await b.close();
