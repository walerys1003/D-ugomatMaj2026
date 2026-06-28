import "server-only";

/**
 * Tier 3 zad. 114 — Markdown → PDF via Puppeteer (z lazy require + fallback).
 *
 * Strategia:
 *   1) Próbujemy załadować `puppeteer` lub `puppeteer-core` + `@sparticuz/chromium`
 *      (Vercel-compatible). Jeżeli oba są niedostępne — zwracamy `null` i wyższy
 *      poziom (document-actions) fallbackuje na `composePrintableHtml` + window.print.
 *   2) Renderujemy `composePrintableHtml(...)` jako HTML, ładujemy do Puppeteer
 *      i zwracamy `Buffer` z PDF-em.
 *   3) Caller (document-actions) wrzuca PDF do Supabase Storage `generated`
 *      i zwraca signed URL.
 *
 * Dlaczego lazy require?
 *   - Puppeteer dokłada ~300MB Chromium binarki — wzbrania się jej bundle'a
 *     w Edge runtime (Cloudflare/Vercel Edge).
 *   - Lokalny dev + Node.js runtime serwerowy: pełen Puppeteer.
 *   - Vercel Functions: `puppeteer-core` + `@sparticuz/chromium` (slim).
 *   - Brak obu paczek: graceful degradation → window.print() na frontu.
 *
 * Patrz: docs/edge-caching.md §3 (which routes are node vs edge).
 */
import { composePrintableHtml } from "./pdf-renderer";

export interface RenderPdfOptions {
  title?: string;
  /** Inject letterhead HTML do header/footer template. */
  headerHtml?: string;
  footerHtml?: string;
  /** A4 default; A4-landscape jeśli pismo ma tabele szerokie. */
  format?: "A4" | "A4-landscape";
}

export interface RenderPdfResult {
  buffer: Buffer;
  bytes: number;
  durationMs: number;
  engine: "puppeteer" | "puppeteer-core-sparticuz";
}

/**
 * Renderuje markdown → PDF buffer. Zwraca `null` jeżeli żaden engine nie jest
 * dostępny (caller fallbackuje na print stylesheet w trybie window.print).
 */
export async function renderMarkdownToPdf(
  markdown: string,
  opts: RenderPdfOptions = {},
): Promise<RenderPdfResult | null> {
  const html = composePrintableHtml(markdown, { title: opts.title });

  // Próba 1: pełen Puppeteer (dev / self-hosted).
  const puppeteerFull = await tryLoadFullPuppeteer();
  if (puppeteerFull) {
    return renderWithFullPuppeteer(puppeteerFull, html, opts);
  }

  // Próba 2: Puppeteer-core + Sparticuz Chromium (Vercel/Lambda).
  const puppeteerSlim = await tryLoadSparticuzPuppeteer();
  if (puppeteerSlim) {
    return renderWithSparticuz(puppeteerSlim, html, opts);
  }

  // Żaden engine niedostępny — graceful degradation.
  return null;
}

// ─── Internal: dynamic loaders ────────────────────────────────────────────

type FullPuppeteer = {
  launch: (args: Record<string, unknown>) => Promise<{
    newPage: () => Promise<{
      setContent: (html: string, opts?: Record<string, unknown>) => Promise<void>;
      pdf: (opts?: Record<string, unknown>) => Promise<Buffer>;
      close: () => Promise<void>;
    }>;
    close: () => Promise<void>;
  }>;
};

async function tryLoadFullPuppeteer(): Promise<FullPuppeteer | null> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require("puppeteer") as unknown;
    if (mod && typeof (mod as FullPuppeteer).launch === "function") {
      return mod as FullPuppeteer;
    }
    return null;
  } catch {
    return null;
  }
}

interface SparticuzBundle {
  puppeteer: FullPuppeteer;
  chromium: {
    args: string[];
    defaultViewport: Record<string, unknown> | null;
    executablePath: () => Promise<string>;
    headless: boolean | "shell" | "new";
  };
}

async function tryLoadSparticuzPuppeteer(): Promise<SparticuzBundle | null> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const puppeteer = require("puppeteer-core") as FullPuppeteer;
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const chromium = require("@sparticuz/chromium") as SparticuzBundle["chromium"];
    if (
      typeof puppeteer?.launch === "function" &&
      typeof chromium?.executablePath === "function"
    ) {
      return { puppeteer, chromium };
    }
    return null;
  } catch {
    return null;
  }
}

// ─── Internal: rendering ──────────────────────────────────────────────────

async function renderWithFullPuppeteer(
  puppeteer: FullPuppeteer,
  html: string,
  opts: RenderPdfOptions,
): Promise<RenderPdfResult> {
  const start = Date.now();
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--font-render-hinting=none"],
  });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0", timeout: 30_000 });
    const buffer = await page.pdf(buildPdfOptions(opts));
    await page.close();
    return {
      buffer,
      bytes: buffer.byteLength,
      durationMs: Date.now() - start,
      engine: "puppeteer",
    };
  } finally {
    await browser.close().catch(() => undefined);
  }
}

async function renderWithSparticuz(
  bundle: SparticuzBundle,
  html: string,
  opts: RenderPdfOptions,
): Promise<RenderPdfResult> {
  const start = Date.now();
  const executablePath = await bundle.chromium.executablePath();
  const browser = await bundle.puppeteer.launch({
    args: bundle.chromium.args,
    defaultViewport: bundle.chromium.defaultViewport,
    executablePath,
    headless: bundle.chromium.headless,
  });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0", timeout: 30_000 });
    const buffer = await page.pdf(buildPdfOptions(opts));
    await page.close();
    return {
      buffer,
      bytes: buffer.byteLength,
      durationMs: Date.now() - start,
      engine: "puppeteer-core-sparticuz",
    };
  } finally {
    await browser.close().catch(() => undefined);
  }
}

function buildPdfOptions(opts: RenderPdfOptions): Record<string, unknown> {
  const isLandscape = opts.format === "A4-landscape";
  const base: Record<string, unknown> = {
    format: "A4",
    landscape: isLandscape,
    printBackground: true,
    margin: {
      top: "22mm",
      bottom: "22mm",
      left: "25mm",
      right: "20mm",
    },
  };
  if (opts.headerHtml || opts.footerHtml) {
    base.displayHeaderFooter = true;
    if (opts.headerHtml) base.headerTemplate = opts.headerHtml;
    if (opts.footerHtml) {
      base.footerTemplate = opts.footerHtml;
    } else {
      // Domyślny footer: numer strony.
      base.footerTemplate = `
        <div style="font-size:8pt; color:#475569; width:100%; text-align:center; padding:4mm;">
          Strona <span class="pageNumber"></span> z <span class="totalPages"></span>
        </div>`;
    }
  }
  return base;
}
