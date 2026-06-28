/**
 * Wave 7 / T003-105 — POST /api/calendar/ics-export
 *
 * Alias / convenience endpoint called by panel kalendarz page.
 * Generuje token + zwraca pełny URL feedu ICS (`/api/calendar/feed`).
 *
 * Wewnątrz korzysta z istniejącego `lib/calendar/ics-export.signFeedToken`.
 */
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";
import { signFeedToken } from "@/lib/calendar/ics-export";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const sb = await createSupabaseServerClient();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  let token: string;
  try {
    token = signFeedToken(user.id);
  } catch (err) {
    // signFeedToken may throw if CALENDAR_FEED_SECRET is missing — fall back to opaque empty.
    return NextResponse.json(
      {
        error: "feed_secret_missing",
        details: err instanceof Error ? err.message : "config error",
      },
      { status: 500 },
    );
  }

  const origin = new URL(req.url).origin;
  const feedUrl = `${origin}/api/calendar/feed?user=${encodeURIComponent(
    user.id,
  )}&token=${encodeURIComponent(token)}`;

  // Native <form action="..."> redirects; AJAX expects JSON.
  const accept = req.headers.get("accept") ?? "";
  if (accept.includes("application/json")) {
    return NextResponse.json({ url: feedUrl, token }, { status: 200 });
  }

  // For form post: redirect back to calendar with the feed URL as query param.
  return NextResponse.redirect(
    new URL(`/panel/kalendarz?ics=${encodeURIComponent(feedUrl)}`, req.url),
    { status: 303 },
  );
}

export async function GET(req: NextRequest) {
  // Convenience: same as POST.
  return POST(req);
}
