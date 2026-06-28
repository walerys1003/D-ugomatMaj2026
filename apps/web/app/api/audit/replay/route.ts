/**
 * Tier 21 — Audit replay endpoint.
 *
 * GET /api/audit/replay
 *   ?topic=case:42
 *   &topicPrefix=case:
 *   &kinds=case.updated,doc.updated
 *   &since=2026-01-01T00:00:00Z
 *   &until=2026-05-01T00:00:00Z
 *   &cursor=<occurred_at>|<id>
 *   &limit=200
 *   &summary=day      → zwraca timelineSummary zamiast events
 *   &export=ndjson    → eksportuje pełny audit trail bieżącego usera
 *
 * Visibility:
 *  - przy filtrze topic → polegamy na RLS realtime_events (user może czytać
 *    zdarzenia o jego topicach / siebie)
 *  - bez topic → wymuszamy filter userId = self (lub admin)
 */

import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";
import {
  replayEvents,
  timelineSummary,
  exportUserAuditTrail,
  type ReplayCursor,
  type ReplayFilter,
} from "@/lib/audit/replay";
import type { RealtimeEventKind } from "@/lib/realtime/channel";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_KINDS: ReadonlyArray<RealtimeEventKind> = [
  "case.updated",
  "case.commented",
  "doc.updated",
  "doc.cursor",
  "deadline.fired",
  "notification.delivered",
  "presence.join",
  "presence.leave",
  "ai.generation.progress",
  "ocr.progress",
  "bulk.progress",
  "system.broadcast",
];

export async function GET(req: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const role = (user.app_metadata as Record<string, unknown> | undefined)?.role;
  const isAdmin = role === "admin";

  // Export shortcut
  if (url.searchParams.get("export") === "ndjson") {
    const since = url.searchParams.get("since") ?? undefined;
    const until = url.searchParams.get("until") ?? undefined;
    const targetUser = url.searchParams.get("userId") ?? user.id;
    if (targetUser !== user.id && !isAdmin) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
    const ndjson = await exportUserAuditTrail({ userId: targetUser, since, until });
    return new Response(ndjson, {
      headers: {
        "Content-Type": "application/x-ndjson",
        "Content-Disposition": `attachment; filename="audit-${targetUser}.ndjson"`,
      },
    });
  }

  const topic = url.searchParams.get("topic") ?? undefined;
  const topicPrefix = url.searchParams.get("topicPrefix") ?? undefined;
  const userIdParam = url.searchParams.get("userId") ?? undefined;
  const kindsRaw = url.searchParams.get("kinds");
  const kinds = kindsRaw
    ? kindsRaw
        .split(",")
        .map((s) => s.trim())
        .filter((k): k is RealtimeEventKind => (VALID_KINDS as readonly string[]).includes(k))
    : undefined;
  const since = url.searchParams.get("since") ?? undefined;
  const until = url.searchParams.get("until") ?? undefined;

  // Bez topic ani topicPrefix → user może czytać tylko swoje zdarzenia
  let effectiveUserId = userIdParam;
  if (!topic && !topicPrefix) {
    if (userIdParam && userIdParam !== user.id && !isAdmin) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
    effectiveUserId = userIdParam ?? user.id;
  } else if (userIdParam && userIdParam !== user.id && !isAdmin) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const filter: ReplayFilter = {
    topic,
    topicPrefix,
    userId: effectiveUserId,
    kinds,
    since,
    until,
  };

  // Summary mode
  const summary = url.searchParams.get("summary") as "hour" | "day" | "week" | null;
  if (summary === "hour" || summary === "day" || summary === "week") {
    const buckets = await timelineSummary({ filter, bucket: summary });
    return NextResponse.json({ buckets });
  }

  // Paged replay
  const cursorRaw = url.searchParams.get("cursor");
  let cursor: ReplayCursor | undefined;
  if (cursorRaw) {
    const [occurred_at, id] = cursorRaw.split("|");
    if (occurred_at && id) cursor = { occurred_at, id };
  }
  const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "200", 10), 1000);
  const page = await replayEvents({ filter, cursor, limit });
  const nextCursorStr = page.nextCursor
    ? `${page.nextCursor.occurred_at}|${page.nextCursor.id}`
    : null;
  return NextResponse.json({
    events: page.events,
    nextCursor: nextCursorStr,
    hasMore: page.hasMore,
  });
}
