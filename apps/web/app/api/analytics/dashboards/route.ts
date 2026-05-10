import { NextRequest, NextResponse } from "next/server";
import { DASHBOARDS, getDashboard } from "@/lib/analytics/dashboards";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (id) {
    const d = getDashboard(id);
    if (!d) return NextResponse.json({ error: "not_found" }, { status: 404 });
    return NextResponse.json(d);
  }
  return NextResponse.json({ dashboards: DASHBOARDS });
}
