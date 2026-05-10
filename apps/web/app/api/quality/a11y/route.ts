import { NextRequest, NextResponse } from "next/server";
import { auditHtml } from "@/lib/quality/a11y-audit";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const html = typeof body?.html === "string" ? body.html : null;
  if (!html) {
    return NextResponse.json({ error: "missing html" }, { status: 400 });
  }
  const report = auditHtml(html);
  return NextResponse.json(report);
}
