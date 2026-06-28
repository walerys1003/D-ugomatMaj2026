import { NextResponse, type NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/server-auth";
import { buildCaseTimeline } from "@/lib/cases/timeline";
import { logger } from "@/lib/observability/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const auth = await getAuthenticatedUser(req);
  if (!auth.ok) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  try {
    const url = new URL(req.url);
    const includeAi = url.searchParams.get("ai") === "1";
    const order = (url.searchParams.get("order") as "asc" | "desc") ?? "desc";
    const events = await buildCaseTimeline({
      case_id: id,
      user_id: auth.user.id,
      include_ai_runs: includeAi,
      order,
    });
    return NextResponse.json({ events });
  } catch (err) {
    logger.error("timeline.api_failed", { error: (err as Error).message });
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
