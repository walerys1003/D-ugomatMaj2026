/**
 * Tier 31 — Public changelog API.
 * GET /api/changelog — JSON of all releases.
 * Used by external docs, marketing site, SDK auto-update notifications.
 */
import { NextResponse } from "next/server";
import { RELEASE_HISTORY } from "@/lib/launch/release-notes";

export const revalidate = 3600;

export async function GET() {
  return NextResponse.json({
    count: RELEASE_HISTORY.length,
    releases: RELEASE_HISTORY,
  });
}
