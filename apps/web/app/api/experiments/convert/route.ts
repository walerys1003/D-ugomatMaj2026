/**
 * POST /api/experiments/convert — loguje konwersję dla experiment.
 * Body: { key, metric, value?, seed? }
 */
import { NextResponse } from "next/server";
import { recordConversion } from "@/lib/experiments/ab-testing";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    key?: string;
    metric?: string;
    value?: number;
    seed?: string;
  };
  if (!body.key || !body.metric) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }
  const cookieHeader = req.headers.get("cookie") ?? "";
  const anonCookie = /dlk_anon=([a-zA-Z0-9_-]+)/.exec(cookieHeader)?.[1];
  const seed = body.seed ?? anonCookie;
  if (!seed) return NextResponse.json({ error: "no_seed" }, { status: 400 });

  await recordConversion(body.key, seed, body.metric, body.value ?? 1).catch(() => undefined);
  return NextResponse.json({ ok: true });
}
