import { NextResponse, type NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/server-auth";
import { redactPii } from "@/lib/pdf/redaction";
import { logger } from "@/lib/observability/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_TEXT = 50_000;

export async function POST(req: NextRequest) {
  const auth = await getAuthenticatedUser(req);
  if (!auth.ok) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  let body: any = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const text = typeof body.text === "string" ? body.text : "";
  if (!text) return NextResponse.json({ error: "text_required" }, { status: 400 });
  if (text.length > MAX_TEXT) return NextResponse.json({ error: "text_too_long" }, { status: 413 });
  try {
    const result = await redactPii(text, {
      style: body.style,
      use_ai: !!body.use_ai,
      include: body.include,
      exclude: body.exclude,
    });
    return NextResponse.json(result);
  } catch (err) {
    logger.error("redact.failed", { error: (err as Error).message });
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
