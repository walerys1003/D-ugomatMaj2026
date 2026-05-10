import { NextResponse, type NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/server-auth";
import { createLawyerShare, listUserShares } from "@/lib/sharing/lawyer-share";
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
  if (!body.case_id || !Array.isArray(body.scopes)) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }
  try {
    const result = await createLawyerShare({
      user_id: auth.user.id,
      case_id: body.case_id,
      scopes: body.scopes,
      lawyer_email: body.lawyer_email,
      lawyer_name: body.lawyer_name,
      ttl_days: body.ttl_days,
      allow_download: body.allow_download,
    });
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
    return NextResponse.json(result);
  } catch (err) {
    logger.error("share.create_failed", { error: (err as Error).message });
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const auth = await getAuthenticatedUser(req);
  if (!auth.ok) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const url = new URL(req.url);
  const caseId = url.searchParams.get("case_id") ?? undefined;
  const shares = await listUserShares(auth.user.id, caseId);
  return NextResponse.json({ shares });
}
