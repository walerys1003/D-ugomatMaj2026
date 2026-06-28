import { NextResponse, type NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/server-auth";
import { searchLegalContext } from "@/lib/ai/rag-scaffold";
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
  if (!body.query || typeof body.query !== "string") {
    return NextResponse.json({ error: "query_required" }, { status: 400 });
  }
  if (body.query.length > 500) {
    return NextResponse.json({ error: "query_too_long" }, { status: 400 });
  }
  try {
    const result = await searchLegalContext({
      query: body.query,
      scope: body.scope ?? "all",
      case_type: body.case_type,
      limit: Math.min(body.limit ?? 5, 20),
    });
    return NextResponse.json(result);
  } catch (err) {
    logger.error("rag.search_failed", { error: (err as Error).message });
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
