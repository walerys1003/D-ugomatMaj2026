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
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://dlugomat.pl";
  const events: IcsEvent[] = [];
  try {
    // REALNY BUG (maskowany przez as any): tabela `deadlines` (zreconcilowana do
    // schematu Tier18 — migracja 20260627030000) NIE MA kolumny `due_at`. Realny
    // termin to `effective_end_date`. Zapytania o `due_at` padały w runtime.
    const { data: deadlines } = await supabase
      .from("deadlines")
      .select("id, case_id, kind, title, effective_end_date, completed_at")
      .eq("user_id", userId)
      .gte("effective_end_date", new Date(Date.now() - 30 * 86_400_000).toISOString());
    for (const d of deadlines ?? []) {
      if (d.completed_at) continue;
      events.push({
        uid: `deadline-${d.id}`,
        summary: `📅 Termin: ${d.title ?? d.kind}`,
        description: `Sprawa: ${d.case_id}\nRodzaj: ${d.kind}`,
        dtstart: d.effective_end_date,
        all_day: true,
        category: "deadline",
        url: `${appUrl}/app/sprawy/${d.case_id}`,
        alarm_minutes_before: 1440,
      });
    }
    // REALNY BUG + KOLIZJA: istnieją DWIE migracje `case_events`. Wygrywa
    // WCZEŚNIEJSZA (20260510130800) ze schematem event_type/created_at/metadata.
    // Późniejsza (20260512200000) z kind/occurred_at/title jest pomijana przez
    // `if not exists`. Kod pytał o kind/occurred_at/title → kolumny NIE ISTNIEJĄ
    // na realnej bazie → zapytanie o rozprawy ZAWSZE puste/wywrotka. Przejście na
    // schemat zwycięski: event_type='hearing_scheduled', created_at, title z metadata.
    const { data: hearings } = await supabase
      .from("case_events")
      .select("id, case_id, event_type, metadata, created_at")
      .eq("user_id", userId)
      .eq("event_type", "hearing_scheduled")
      .gte("created_at", new Date().toISOString());
    for (const h of hearings ?? []) {
      const meta = (h.metadata ?? {}) as Record<string, unknown>;
      const startsAt = (meta.starts_at as string | undefined) ?? h.created_at;
      events.push({
        uid: `hearing-${h.id}`,
        summary: `⚖️ Rozprawa: ${(meta.title as string | undefined) ?? "termin sądowy"}`,
        description: `Sprawa: ${h.case_id}`,
        dtstart: startsAt,
        location: (meta.location as string | undefined) ?? undefined,
        category: "hearing",
        url: `${appUrl}/app/sprawy/${h.case_id}`,
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
