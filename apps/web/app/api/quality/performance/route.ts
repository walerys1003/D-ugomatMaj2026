import { NextRequest, NextResponse } from "next/server";
import { buildBudgetReport } from "@/lib/polish/performance-budgets";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const report = buildBudgetReport(body ?? {});
  return NextResponse.json(report);
}
