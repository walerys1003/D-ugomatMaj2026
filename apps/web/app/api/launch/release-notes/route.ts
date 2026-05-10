import { NextResponse } from "next/server";
import { RELEASE_NOTES } from "@/lib/launch/release-notes";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ releases: RELEASE_NOTES });
}
