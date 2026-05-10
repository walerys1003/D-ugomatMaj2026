/**
 * POST /api/affiliate/track-click — beacon endpoint dla affiliate click tracking.
 * Wywoływane z middleware lub client-side gdy widać ?ref=slug.
 */
import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { trackAffiliateClick } from "@/lib/affiliate/tracking";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    slug?: string;
    landing_path?: string;
  };
  if (!body.slug) return NextResponse.json({ error: "missing_slug" }, { status: 400 });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "";
  const ipHash = ip
    ? crypto.createHash("sha256").update(ip).digest("hex").slice(0, 32)
    : undefined;

  await trackAffiliateClick(body.slug, {
    ipHash,
    userAgent: req.headers.get("user-agent") ?? undefined,
    referer: req.headers.get("referer") ?? undefined,
    landingPath: body.landing_path,
  });

  return NextResponse.json({ ok: true });
}
