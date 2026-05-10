/**
 * Tier 23 — Compliance reports API.
 *
 * GET  /api/compliance/reports?kind=dpia|ropa|soc2|audit_integrity  → generate live
 * GET  /api/compliance/reports?list=true                            → list saved
 * POST /api/compliance/reports                                       → generate + save
 */

import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";
import {
  generateRoPa,
  generateDpia,
  generateSoc2Evidence,
  saveComplianceReport,
  listComplianceReports,
} from "@/lib/compliance/reports";
import { verifyAuditChain } from "@/lib/security/audit-signing";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function getAdmin(): Promise<{ ok: boolean; userId?: string }> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false };
  const role = (user.app_metadata as Record<string, unknown> | undefined)?.role;
  return { ok: role === "admin", userId: user.id };
}

export async function GET(req: Request) {
  const admin = await getAdmin();
  if (!admin.ok) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const url = new URL(req.url);
  if (url.searchParams.get("list") === "true") {
    const kind = url.searchParams.get("kind") as
      | "dpia"
      | "ropa"
      | "soc2"
      | "iso27001"
      | "audit_integrity"
      | null;
    const reports = await listComplianceReports({
      kind: kind ?? undefined,
      limit: parseInt(url.searchParams.get("limit") ?? "50", 10),
    });
    return NextResponse.json({ reports });
  }

  const kind = url.searchParams.get("kind") ?? "dpia";
  const periodStart = url.searchParams.get("periodStart") ?? undefined;
  const periodEnd = url.searchParams.get("periodEnd") ?? undefined;

  switch (kind) {
    case "ropa": {
      const data = await generateRoPa({});
      return NextResponse.json({ kind: "ropa", data });
    }
    case "dpia": {
      const data = await generateDpia({ periodStart, periodEnd });
      return NextResponse.json({ kind: "dpia", data });
    }
    case "soc2": {
      const data = await generateSoc2Evidence({ periodStart, periodEnd });
      return NextResponse.json({ kind: "soc2", data });
    }
    case "audit_integrity": {
      const data = await verifyAuditChain();
      return NextResponse.json({ kind: "audit_integrity", data });
    }
    default:
      return NextResponse.json({ error: "unsupported_kind" }, { status: 400 });
  }
}

export async function POST(req: Request) {
  const admin = await getAdmin();
  if (!admin.ok) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const body = (await req.json().catch(() => null)) as
    | {
        kind?: "dpia" | "ropa" | "soc2" | "audit_integrity";
        organizationId?: string | null;
        periodStart?: string;
        periodEnd?: string;
      }
    | null;
  if (!body?.kind) return NextResponse.json({ error: "missing_kind" }, { status: 400 });

  const periodStart =
    body.periodStart ?? new Date(Date.now() - 90 * 86400000).toISOString();
  const periodEnd = body.periodEnd ?? new Date().toISOString();

  let data: Record<string, unknown>;
  switch (body.kind) {
    case "ropa":
      data = { entries: await generateRoPa({ organizationId: body.organizationId }) };
      break;
    case "dpia":
      data = (await generateDpia({
        organizationId: body.organizationId,
        periodStart,
        periodEnd,
      })) as unknown as Record<string, unknown>;
      break;
    case "soc2":
      data = await generateSoc2Evidence({ periodStart, periodEnd });
      break;
    case "audit_integrity":
      data = (await verifyAuditChain()) as unknown as Record<string, unknown>;
      break;
    default:
      return NextResponse.json({ error: "unsupported_kind" }, { status: 400 });
  }

  const report = await saveComplianceReport({
    kind: body.kind,
    organizationId: body.organizationId ?? null,
    data,
    periodStart,
    periodEnd,
  });
  return NextResponse.json({ report }, { status: 201 });
}
