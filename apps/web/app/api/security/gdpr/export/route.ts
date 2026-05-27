import { NextRequest, NextResponse } from "next/server";
import { exportUserData, exportToJsonLines } from "@/lib/security/gdpr/data-export";
import { recordSecurityEvent } from "@/lib/security/security-events";

async function getSupabase() {
  const { createSupabaseServerClient } = await import("@/lib/db/supabase-server");
  return createSupabaseServerClient();
}

export async function POST(req: NextRequest) {
  const supabase = await getSupabase();
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const format = req.nextUrl.searchParams.get("format") ?? "json";
  try {
    const data = await exportUserData(supabase, user.id);
    await recordSecurityEvent(supabase, {
      userId: user.id,
      type: "gdpr.export_requested",
      ip: req.headers.get("x-forwarded-for") ?? undefined,
      userAgent: req.headers.get("user-agent") ?? undefined,
      metadata: { rowCount: data.metadata.rowCount, format },
    });

    if (format === "jsonl") {
      return new NextResponse(exportToJsonLines(data), {
        headers: {
          "Content-Type": "application/x-ndjson; charset=utf-8",
          "Content-Disposition": `attachment; filename="dlugomat-export-${user.id}.jsonl"`,
        },
      });
    }
    return NextResponse.json(data, {
      headers: { "Content-Disposition": `attachment; filename="dlugomat-export-${user.id}.json"` },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "export_failed" }, { status: 500 });
  }
}
