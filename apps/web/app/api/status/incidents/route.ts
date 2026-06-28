/**
 * Tier 34-4 — Public status incidents API (read-only) + RSS/Atom.
 *
 * GET /api/status/incidents       → JSON list, ISR 60s
 * GET /api/status/incidents?fmt=rss   → RSS 2.0
 * GET /api/status/incidents?fmt=atom  → Atom 1.0
 *
 * Brak danych userów. Tylko publiczna agregata.
 */
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";

export const runtime = "nodejs";
export const revalidate = 60;

interface IncidentRow {
  id: string;
  title: string;
  severity: string;
  status: string;
  started_at: string;
  resolved_at: string | null;
  affected_components: string[];
  summary: string | null;
  postmortem_url: string | null;
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function buildRss(items: IncidentRow[], baseUrl: string): string {
  const entries = items
    .map(
      (i) => `
    <item>
      <title>[${escapeXml(i.severity.toUpperCase())}] ${escapeXml(i.title)}</title>
      <link>${baseUrl}/status/history#${escapeXml(i.id)}</link>
      <guid isPermaLink="false">${escapeXml(i.id)}</guid>
      <pubDate>${new Date(i.started_at).toUTCString()}</pubDate>
      <description>${escapeXml(i.summary ?? "")}</description>
    </item>`,
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Długomat — status incidents</title>
    <link>${baseUrl}/status</link>
    <description>Historia incydentów infrastrukturalnych dlugomat.pl</description>
    <language>pl-PL</language>
    ${entries}
  </channel>
</rss>`;
}

function buildAtom(items: IncidentRow[], baseUrl: string): string {
  const updated = items[0]?.started_at ?? new Date().toISOString();
  const entries = items
    .map(
      (i) => `
  <entry>
    <id>urn:dlugomat:incident:${escapeXml(i.id)}</id>
    <title>[${escapeXml(i.severity.toUpperCase())}] ${escapeXml(i.title)}</title>
    <link href="${baseUrl}/status/history#${escapeXml(i.id)}"/>
    <updated>${i.resolved_at ?? i.started_at}</updated>
    <published>${i.started_at}</published>
    <summary>${escapeXml(i.summary ?? "")}</summary>
  </entry>`,
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>Długomat — status incidents</title>
  <link href="${baseUrl}/status"/>
  <id>urn:dlugomat:status</id>
  <updated>${updated}</updated>
  ${entries}
</feed>`;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const fmt = url.searchParams.get("fmt");
  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "https://dlugomat.pl").replace(/\/+$/, "");

  const sb = await createSupabaseServerClient();
  const { data } = await sb
    .from("status_incidents")
    .select(
      "id, title, severity, status, started_at, resolved_at, affected_components, summary, postmortem_url",
    )
    .order("started_at", { ascending: false })
    .limit(50);
  const items = (data ?? []) as IncidentRow[];

  if (fmt === "rss") {
    return new NextResponse(buildRss(items, baseUrl), {
      status: 200,
      headers: {
        "content-type": "application/rss+xml; charset=utf-8",
        "cache-control": "public, s-maxage=60, stale-while-revalidate=600",
      },
    });
  }
  if (fmt === "atom") {
    return new NextResponse(buildAtom(items, baseUrl), {
      status: 200,
      headers: {
        "content-type": "application/atom+xml; charset=utf-8",
        "cache-control": "public, s-maxage=60, stale-while-revalidate=600",
      },
    });
  }

  return NextResponse.json(
    { items, generated_at: new Date().toISOString() },
    {
      headers: {
        "cache-control": "public, s-maxage=60, stale-while-revalidate=600",
      },
    },
  );
}
