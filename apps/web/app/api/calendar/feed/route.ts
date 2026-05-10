import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseAdmin } from "@/lib/db/supabase-admin";
import { buildIcsFeed, verifyFeedToken, type IcsEvent } from "@/lib/calendar/ics-export";
import { logger } from "@/lib/observability/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const userId = url.searchParams.get("user");
  const token = url.searchParams.get("token");
  if (!userId || !token) return new NextResponse("missing params", { status: 400 });
  if (!verifyFeedToken(userId, token)) return new NextResponse("invalid token", { status: 403 });

  const supabase = getSupabaseAdmin();
  const events: IcsEvent[] = [];
  try {
    const { data: deadlines } = await supabase
      .from("deadlines")
      .select("id, case_id, kind, title, due_at, completed_at")
      .eq("user_id", userId)
      .gte("due_at", new Date(Date.now() - 30 * 86_400_000).toISOString());
    for (const d of deadlines ?? []) {
      if (d.completed_at) continue;
      events.push({
        uid: `deadline-${d.id}`,
        summary: `📅 Termin: ${d.title ?? d.kind}`,
        description: `Sprawa: ${d.case_id}\nRodzaj: ${d.kind}`,
        dtstart: d.due_at,
        all_day: true,
        category: "deadline",
        url: `${process.env.NEXT_PUBLIC_APP_URL ?? "https://dlugomat.pl"}/app/sprawy/${d.case_id}`,
        alarm_minutes_before: 1440,
      });
    }
    const { data: hearings } = await supabase
      .from("case_events")
      .select("id, case_id, title, occurred_at, metadata")
      .eq("user_id", userId)
      .eq("kind", "hearing_scheduled")
      .gte("occurred_at", new Date().toISOString());
    for (const h of hearings ?? []) {
      events.push({
        uid: `hearing-${h.id}`,
        summary: `⚖️ Rozprawa: ${h.title ?? "termin sądowy"}`,
        description: `Sprawa: ${h.case_id}`,
        dtstart: h.occurred_at,
        location: ((h.metadata as any) ?? {}).location ?? undefined,
        category: "hearing",
        url: `${process.env.NEXT_PUBLIC_APP_URL ?? "https://dlugomat.pl"}/app/sprawy/${h.case_id}`,
        alarm_minutes_before: 1440,
      });
    }
  } catch (err) {
    logger.warn("calendar.feed_load_failed", { error: (err as Error).message });
  }

  const ics = buildIcsFeed(events);
  return new NextResponse(ics, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="dlugomat.ics"',
      "Cache-Control": "private, max-age=900",
    },
  });
}
