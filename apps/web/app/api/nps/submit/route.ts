/**
 * Tier 33-5 — Submit NPS response from in-app widget.
 *
 * POST /api/nps/submit { score: 0..10, comment?: string, channel?: "in_app" }
 *
 * Wymaga zalogowanego usera. Anti-spam: 1 odpowiedź per user per 30 dni
 * (sprawdzane przed insertem). Auto-trigger alertu w admin dashboard jeśli
 * score <= 6 (detractor) z komentarzem.
 */
import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/db/supabase-server";
import { recordNpsResponse } from "@/lib/analytics/nps-survey";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface SubmitBody {
  score: number;
  comment?: string | null;
  channel?: "in_app" | "email" | "sms";
}

export async function POST(req: Request) {
  let body: SubmitBody;
  try {
    body = (await req.json()) as SubmitBody;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const score = Number(body.score);
  if (!Number.isInteger(score) || score < 0 || score > 10) {
    return NextResponse.json({ error: "score_out_of_range" }, { status: 400 });
  }
  const comment = typeof body.comment === "string" ? body.comment.slice(0, 500) : null;
  const channel: "in_app" | "email" | "sms" = body.channel === "email" || body.channel === "sms" ? body.channel : "in_app";

  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb: any = await createServerSupabase();
  const { data: auth } = await sb.auth.getUser();
  if (!auth?.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const userId = auth.user.id;

  // Anti-spam: ostatnia odpowiedź < 30 dni temu?
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400_000).toISOString();
  const { count } = await sb
    .from("nps_responses")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", thirtyDaysAgo);
  if ((count ?? 0) > 0) {
    return NextResponse.json({ error: "cooldown_active" }, { status: 429 });
  }

  try {
    await recordNpsResponse({
      user_id: userId,
      score,
      comment: comment ?? undefined,
      channel,
    });

    // Detraktor z komentarzem → wpis do `incidents` jako info-alert
    if (score <= 6 && comment) {
      await sb.from("incidents").insert({
        severity: "info",
        title: `NPS detractor: ${score}/10`,
        description: comment.slice(0, 280),
        source: "nps_widget",
        user_id: userId,
        created_at: new Date().toISOString(),
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "unknown" },
      { status: 500 },
    );
  }
}
