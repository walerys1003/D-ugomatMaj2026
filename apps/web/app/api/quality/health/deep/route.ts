import { NextResponse } from "next/server";
import { runDeepHealthChecks } from "@/lib/quality/health-checks";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const report = await runDeepHealthChecks();
  const httpStatus = report.aggregateStatus === "healthy" ? 200 : report.aggregateStatus === "degraded" ? 200 : 503;
  return NextResponse.json(report, { status: httpStatus });
}
