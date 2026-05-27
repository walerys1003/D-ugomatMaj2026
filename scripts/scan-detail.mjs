import { chromium } from "playwright";
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 375, height: 800 } });
const p = await ctx.newPage();
await p.goto("http://localhost:3000/v5/showcase", { waitUntil: "networkidle", timeout: 30000 });
await p.waitForTimeout(800);
const items = await p.evaluate(() => {
  const out = [];
  document.querySelectorAll("*").forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.right > 376 && r.width < 2000 && r.width > 50 && r.height > 0) {
      const cs = getComputedStyle(el);
      if (cs.display === "none") return;
      let par = el.parentElement, clip = false;
      while (par && par !== document.body) {
        const pcs = getComputedStyle(par);
        if (pcs.overflow === "hidden" || pcs.overflowX === "hidden") { clip = true; break; }
        par = par.parentElement;
      }
      if (clip) return;
      // Find closest section
      let sec = el.closest("section,[id]");
      out.push({
        tag: el.tagName,
        cls: (typeof el.className === "string" ? el.className : "").slice(0, 80),
        right: Math.round(r.right),
        width: Math.round(r.width),
        section: sec?.id || sec?.tagName,
      });
    }
  });
  return out.slice(0, 10);
});
console.log(JSON.stringify(items, null, 2));
await b.close();
