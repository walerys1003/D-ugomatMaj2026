import { NextResponse, type NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/server-auth";
import { generateSuggestions } from "@/lib/ai/suggestions";
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
  if (!body.case_id || !body.case_type || !body.answers) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }
  try {
    const result = await generateSuggestions({
      caseId: body.case_id,
      caseType: body.case_type,
      stepId: typeof body.step_id === "string" ? body.step_id : "unknown",
      answers: body.answers ?? {},
    });
    return NextResponse.json(result);
  } catch (err: any) {
    if (err?.code === "rate_limited") {
      return NextResponse.json({ error: "rate_limited", retry_after_seconds: err.retry_after_seconds ?? 3600 }, { status: 429 });
    }
    logger.error("wizard.suggestions_failed", { error: (err as Error).message });
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
