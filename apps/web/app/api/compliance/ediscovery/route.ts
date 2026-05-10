/**
 * Tier 23 — E-discovery + legal hold API.
 *
 * GET  /api/compliance/ediscovery?holds=true   → list active legal holds
 * GET  /api/compliance/ediscovery?queries=true → list recent queries
 * POST /api/compliance/ediscovery               → action: 'impose_hold' | 'release_hold' | 'run_query'
 */

import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";
import {
  imposeLegalHold,
  releaseLegalHold,
  listActiveLegalHolds,
  runEDiscoveryQuery,
  listEDiscoveryQueries,
  type EDiscoveryQuery,
} from "@/lib/compliance/ediscovery";

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
  if (url.searchParams.get("holds") === "true") {
    const holds = await listActiveLegalHolds();
    return NextResponse.json({ holds });
  }
  if (url.searchParams.get("queries") === "true") {
    const queries = await listEDiscoveryQueries({
      limit: parseInt(url.searchParams.get("limit") ?? "50", 10),
    });
    return NextResponse.json({ queries });
  }
  return NextResponse.json({ error: "specify_holds_or_queries" }, { status: 400 });
}

export async function POST(req: Request) {
  const admin = await getAdmin();
  if (!admin.ok || !admin.userId) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const body = (await req.json().catch(() => null)) as
    | {
        action?: "impose_hold" | "release_hold" | "run_query";
        caseReference?: string;
        description?: string;
        targetUserIds?: string[];
        targetOrganizationId?: string | null;
        resourceTypes?: string[];
        holdId?: string;
        releaseReason?: string;
        filters?: EDiscoveryQuery["filters"];
      }
    | null;
  if (!body?.action) return NextResponse.json({ error: "missing_action" }, { status: 400 });

  switch (body.action) {
    case "impose_hold": {
      if (!body.caseReference || !body.description) {
        return NextResponse.json({ error: "missing_fields" }, { status: 400 });
      }
      try {
        const hold = await imposeLegalHold({
          caseReference: body.caseReference,
          description: body.description,
          targetUserIds: body.targetUserIds,
          targetOrganizationId: body.targetOrganizationId,
          resourceTypes: body.resourceTypes,
          imposedBy: admin.userId,
        });
        return NextResponse.json({ hold }, { status: 201 });
      } catch (err) {
        return NextResponse.json(
          { error: err instanceof Error ? err.message : "impose_failed" },
          { status: 400 },
        );
      }
    }
    case "release_hold": {
      if (!body.holdId || !body.releaseReason) {
        return NextResponse.json({ error: "missing_fields" }, { status: 400 });
      }
      await releaseLegalHold({
        holdId: body.holdId,
        releaseReason: body.releaseReason,
        releasedBy: admin.userId,
      });
      return NextResponse.json({ ok: true });
    }
    case "run_query": {
      if (!body.filters) {
        return NextResponse.json({ error: "missing_filters" }, { status: 400 });
      }
      const result = await runEDiscoveryQuery({
        filters: body.filters,
        requestedBy: admin.userId,
      });
      return NextResponse.json({ result });
    }
    default:
      return NextResponse.json({ error: "unsupported_action" }, { status: 400 });
  }
}
