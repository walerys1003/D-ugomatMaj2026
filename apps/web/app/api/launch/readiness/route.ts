import { NextResponse } from "next/server";
import { runReadinessChecks } from "@/lib/launch/readiness-checklist";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const report = runReadinessChecks();
  return NextResponse.json(report, { status: report.ready ? 200 : 503 });
}
