import { NextRequest, NextResponse } from "next/server";
import { postSlackMessage, buildDeadlineSlackBlocks } from "@/lib/integrations/notify/slack-teams";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.webhook_url || !body?.text) return NextResponse.json({ error: "missing fields" }, { status: 400 });
  const blocks = body.deadline ? buildDeadlineSlackBlocks(body.deadline) : undefined;
  const ok = await postSlackMessage(body.webhook_url, { text: body.text, blocks });
  return NextResponse.json({ ok });
}
