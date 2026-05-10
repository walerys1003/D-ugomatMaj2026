import { NextResponse, type NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/server-auth";
import { parseLetterText } from "@/lib/ai/letter-ocr";
import { logger } from "@/lib/observability/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const auth = await getAuthenticatedUser(req);
  if (!auth.ok) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  let body: any = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const text = typeof body.text === "string" ? body.text.trim() : "";
  if (!text || text.length < 10) {
    return NextResponse.json({ error: "text_too_short" }, { status: 400 });
  }
  if (text.length > 50_000) {
    return NextResponse.json({ error: "text_too_long" }, { status: 413 });
  }
  try {
    const result = await parseLetterText(text, { useAi: !!body.use_ai });
    return NextResponse.json(result);
  } catch (err) {
    logger.error("letters.parse_failed", { error: (err as Error).message });
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
