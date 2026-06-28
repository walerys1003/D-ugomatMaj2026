/**
 * Tier 10 — Final SEO pass: sitemap & robots helpers, canonical builder.
 */
import type { Locale } from "@/lib/i18n/locales";

export interface SitemapEntry {
  loc: string;
  lastmod?: string;
  changefreq?: "daily" | "weekly" | "monthly" | "yearly";
  priority?: number;
  alternates?: { locale: Locale; href: string }[];
}

export function buildSitemapXml(entries: SitemapEntry[]): string {
  const xmlns = 'xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"';
  const xhtml = 'xmlns:xhtml="http://www.w3.org/1999/xhtml"';
  const parts = [`<?xml version="1.0" encoding="UTF-8"?>`, `<urlset ${xmlns} ${xhtml}>`];
  for (const e of entries) {
    parts.push("<url>");
    parts.push(`<loc>${escapeXml(e.loc)}</loc>`);
    if (e.lastmod) parts.push(`<lastmod>${e.lastmod}</lastmod>`);
    if (e.changefreq) parts.push(`<changefreq>${e.changefreq}</changefreq>`);
    if (typeof e.priority === "number") parts.push(`<priority>${e.priority.toFixed(1)}</priority>`);
    for (const a of e.alternates ?? []) {
      parts.push(`<xhtml:link rel="alternate" hreflang="${a.locale}" href="${escapeXml(a.href)}"/>`);
    }
    parts.push("</url>");
  }
  parts.push("</urlset>");
  return parts.join("\n");
}

export function buildRobotsTxt(opts: { allowAll?: boolean; sitemapUrl: string; disallow?: string[] }): string {
  const lines = ["User-agent: *"];
  if (opts.allowAll === false) lines.push("Disallow: /");
  else {
    for (const d of opts.disallow ?? ["/api/", "/panel/", "/admin/"]) lines.push(`Disallow: ${d}`);
    lines.push("Allow: /");
  }
  lines.push("", `Sitemap: ${opts.sitemapUrl}`);
  return lines.join("\n");
}

export function canonical(baseUrl: string, path: string): string {
  const b = baseUrl.replace(/\/$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${b}${p}`;
}

function escapeXml(s: string): string {
  return s.replace(/[<>&"']/g, (c) =>
    c === "<" ? "&lt;" : c === ">" ? "&gt;" : c === "&" ? "&amp;" : c === '"' ? "&quot;" : "&apos;",
  );
}
