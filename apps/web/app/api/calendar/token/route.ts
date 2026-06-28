import { NextResponse, type NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/server-auth";
import { signFeedToken } from "@/lib/calendar/ics-export";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await getAuthenticatedUser(req);
  if (!auth.ok) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const token = signFeedToken(auth.user.id);
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://dlugomat.pl";
  const feed_url = `${base}/api/calendar/feed?user=${auth.user.id}&token=${token}`;
  return NextResponse.json({ feed_url, expires_in_hours: 48 });
}
