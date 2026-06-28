import { NextRequest, NextResponse } from "next/server";
import { exportTableNdjson, WarehouseTable } from "@/lib/analytics/data-warehouse";
import { requireAdmin } from "@/lib/auth/require-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const gate = await requireAdmin();
  if (!gate.ok) return NextResponse.json({ error: gate.reason }, { status: gate.status });
  const table = (req.nextUrl.searchParams.get("table") ?? "events") as WarehouseTable;
  const since = req.nextUrl.searchParams.get("since") ?? undefined;
  const batch = await exportTableNdjson(table, { since });
  return new NextResponse(batch.ndjson, {
    headers: {
      "content-type": "application/x-ndjson",
      "x-row-count": String(batch.row_count),
      "content-disposition": `attachment; filename="${table}-${batch.generated_at.slice(0, 10)}.ndjson"`,
    },
  });
}
