import { NextResponse } from "next/server";
import { RELEASE_HISTORY } from "@/lib/launch/release-notes";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ releases: RELEASE_HISTORY });
}
