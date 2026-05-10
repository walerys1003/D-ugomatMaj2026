import { NextResponse } from "next/server";
import { buildIcs } from "@/lib/integrations/calendar/ics-export";
import { createServerSupabase } from "@/lib/db/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const sb = await createServerSupabase();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return new NextResponse("unauthorized", { status: 401 });
  const { data: deadlines } = await sb
    .from("deadlines")
    .select("id, case_id, kind, due_at, title")
    .eq("user_id", user.id)
    .gte("due_at", new Date().toISOString())
    .order("due_at", { ascending: true })
    .limit(200);
  const events = (deadlines ?? []).map((d: any) => {
    const start = new Date(d.due_at);
    return {
      uid: `deadline-${d.id}@dlugomat.pl`,
      start,
      end: new Date(start.getTime() + 3600_000),
      summary: d.title ?? `Termin: ${d.kind}`,
      description: `Sprawa: ${d.case_id}`,
      url: `https://dlugomat.pl/panel/sprawa/${d.case_id}`,
    };
  });
  const ics = buildIcs(events);
  return new NextResponse(ics, {
    headers: {
      "content-type": "text/calendar; charset=utf-8",
      "content-disposition": "inline; filename=dlugomat.ics",
    },
  });
}
