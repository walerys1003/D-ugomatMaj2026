import { NextResponse, type NextRequest } from "next/server";
import { searchPrecedents } from "@/lib/legal/precedent-search";
import { logger } from "@/lib/observability/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Public endpoint — no auth required (educational/research use)
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const query = url.searchParams.get("q") ?? "";
  if (query.length < 3) return NextResponse.json({ error: "query_too_short" }, { status: 400 });
  if (query.length > 200) return NextResponse.json({ error: "query_too_long" }, { status: 400 });
  try {
    const result = await searchPrecedents({
      query,
      court: (url.searchParams.get("court") as any) ?? "all",
      year_from: url.searchParams.get("year_from") ? Number(url.searchParams.get("year_from")) : undefined,
      year_to: url.searchParams.get("year_to") ? Number(url.searchParams.get("year_to")) : undefined,
      legal_area: url.searchParams.get("legal_area") ?? undefined,
      limit: url.searchParams.get("limit") ? Number(url.searchParams.get("limit")) : undefined,
      offset: url.searchParams.get("offset") ? Number(url.searchParams.get("offset")) : undefined,
    });
    return NextResponse.json(result);
  } catch (err) {
    logger.error("precedents.search_failed", { error: (err as Error).message });
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
