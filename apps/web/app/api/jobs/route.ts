import { NextResponse, type NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/server-auth";
import { enqueueGenerationJob, listUserJobs, type JobStatus } from "@/lib/queue/generation-queue";
import { logger } from "@/lib/observability/logger";

// Audyt 2026-06-27 (iter. 36): walidacja statusu zamiast `as any`.
const VALID_JOB_STATUS: readonly JobStatus[] = ["queued", "running", "completed", "failed", "cancelled"];
function parseJobStatus(v: string | null): JobStatus | undefined {
  return VALID_JOB_STATUS.includes(v as JobStatus) ? (v as JobStatus) : undefined;
}

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
  if (!body.case_id || !body.kind) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }
  try {
    const result = await enqueueGenerationJob({
      user_id: auth.user.id,
      case_id: body.case_id,
      kind: body.kind,
      priority: body.priority,
      payload: body.payload ?? {},
      delay_seconds: body.delay_seconds,
      max_attempts: body.max_attempts,
    });
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: 500 });
    return NextResponse.json(result, { status: 202 });
  } catch (err) {
    logger.error("jobs.enqueue_failed", { error: (err as Error).message });
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const auth = await getAuthenticatedUser(req);
  if (!auth.ok) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const url = new URL(req.url);
  const status = parseJobStatus(url.searchParams.get("status"));
  const limit = parseInt(url.searchParams.get("limit") ?? "50", 10);
  const jobs = await listUserJobs(auth.user.id, { status, limit });
  return NextResponse.json({ jobs });
}
