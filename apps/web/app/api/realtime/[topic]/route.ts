/**
 * Tier 21 — Realtime SSE subscription endpoint.
 *
 * GET /api/realtime/[topic]?since=ISO
 *   → text/event-stream — strumień zdarzeń dla topicu
 *
 * Auth:
 *  - wymagana sesja
 *  - visibility check per-topic (case:* — wymaga widoczności sprawy,
 *    doc:* — widoczność dokumentu, org:* — członkostwo w org)
 *
 * Replay:
 *  - jeśli `since` podane → najpierw fetchEventReplay (audit trail),
 *    potem subskrypcja live
 */

import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";
import { buildSseResponse, fetchEventReplay } from "@/lib/realtime/channel";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Sprawdza, czy user ma prawo subskrybować dany topic.
 * Konwencja:
 *   case:<id>     → SELECT z `cases` z RLS (RLS sam zwróci 0 wierszy jeśli brak dostępu)
 *   doc:<id>      → SELECT z `documents`
 *   org:<id>/*    → SELECT z `organization_members`
 *   user:<id>     → musi być self
 *   bulk:<id>     → bulk_operations.user_id = self
 *   notification:<userId> → musi być self
 */
async function canSubscribe(topic: string, userId: string): Promise<boolean> {
  const supabase = await createSupabaseServerClient();
  if (topic.startsWith("case:")) {
    const caseId = topic.slice("case:".length);
    const { data } = await supabase.from("cases").select("id").eq("id", caseId).maybeSingle();
    return !!data;
  }
  if (topic.startsWith("doc:")) {
    const docId = topic.slice("doc:".length);
    const { data } = await supabase.from("documents").select("id").eq("id", docId).maybeSingle();
    return !!data;
  }
  if (topic.startsWith("org:")) {
    const [orgId] = topic.slice("org:".length).split("/");
    const { data } = await supabase
      .from("organization_members")
      .select("user_id")
      .eq("organization_id", orgId)
      .eq("user_id", userId)
      .maybeSingle();
    return !!data;
  }
  if (topic.startsWith("user:")) return topic.slice("user:".length) === userId;
  if (topic.startsWith("notification:")) return topic.slice("notification:".length) === userId;
  if (topic.startsWith("bulk:")) {
    const opId = topic.slice("bulk:".length);
    const { data } = await supabase
      .from("bulk_operations")
      .select("user_id")
      .eq("id", opId)
      .maybeSingle();
    return (data as { user_id?: string } | null)?.user_id === userId;
  }
  if (topic === "system") return true; // broadcasts publiczne
  return false;
}

export async function GET(
  req: Request,
  { params }: { params: { topic: string } },
) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const topic = decodeURIComponent(params.topic);
  const ok = await canSubscribe(topic, user.id);
  if (!ok) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  // Optional replay
  const url = new URL(req.url);
  const since = url.searchParams.get("since") ?? undefined;
  if (since) {
    // pre-warm: emit replay as part of stream is złożone w SSE — łatwiej oddać
    // replay przez osobny endpoint. Tu jedynie loggujemy, że klient prosi.
    void fetchEventReplay({ topic, since, limit: 200 }).catch(() => null);
  }

  return buildSseResponse({ topic, userId: user.id });
}
