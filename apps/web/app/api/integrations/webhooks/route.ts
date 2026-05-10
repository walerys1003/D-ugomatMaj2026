/**
 * Tier 24 — Webhook gateway (admin/dev view).
 *
 *  GET    /api/integrations/webhooks                  — list endpoints + recent deliveries
 *  POST   /api/integrations/webhooks?action=emit      — emit a test event for own endpoints
 *  POST   /api/integrations/webhooks?action=process   — flush dispatch queue (cron)
 */
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/db/supabase-server";
import { emitEvent, processDueDeliveries, type WebhookEvent } from "@/lib/integrations/webhooks-v2";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const sb = await createServerSupabase();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const endpointId = req.nextUrl.searchParams.get("endpoint_id");
  const [{ data: endpoints }, deliveriesQ] = await Promise.all([
    sb
      .from("webhook_endpoints")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    (async () => {
      let q = sb
        .from("webhook_deliveries")
        .select("*, endpoint:webhook_endpoints(user_id, url, events)")
        .order("created_at", { ascending: false })
        .limit(50);
      if (endpointId) q = q.eq("endpoint_id", endpointId);
      return q;
    })(),
  ]);

  // Filter deliveries by user_id via embedded endpoint
  const deliveries = (deliveriesQ.data ?? []).filter(
    (d: any) => d.endpoint?.user_id === user.id,
  );

  return NextResponse.json({ endpoints: endpoints ?? [], deliveries });
}

export async function POST(req: NextRequest) {
  const action = req.nextUrl.searchParams.get("action") ?? "emit";
  const sb = await createServerSupabase();
  const {
    data: { user },
  } = await sb.auth.getUser();

  if (action === "process") {
    // Cron endpoint — require CRON_SECRET in header (avoid public DoS)
    const cronSecret = process.env.CRON_SECRET;
    const provided = req.headers.get("x-cron-secret") ?? "";
    if (cronSecret && provided !== cronSecret) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
    const batchSize = Number(req.nextUrl.searchParams.get("batch") ?? 25);
    const out = await processDueDeliveries(batchSize);
    return NextResponse.json(out);
  }

  // action=emit (test)
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const body = await req.json().catch(() => null);
  if (!body?.event || !body?.payload) {
    return NextResponse.json(
      { error: "missing_fields", required: ["event", "payload"] },
      { status: 400 },
    );
  }
  const count = await emitEvent(body.event as WebhookEvent, user.id, body.payload);
  return NextResponse.json({ queued: count, event: body.event }, { status: 202 });
}
