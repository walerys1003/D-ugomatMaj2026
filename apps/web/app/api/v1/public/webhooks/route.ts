/**
 * Public webhook management endpoint — zad. 349
 *
 * POST /api/v1/public/webhooks — create subscription (returns secret once)
 * GET /api/v1/public/webhooks — list subscriptions
 */

import { NextResponse, type NextRequest } from "next/server";
import { verifyApiKey, hasApiScope, generateWebhookSecret } from "@/lib/api/public-api";
import { getSupabaseAdmin } from "@/lib/db/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function extractApiKey(req: NextRequest): string | null {
  const h = req.headers.get("authorization");
  return h?.match(/^Bearer\s+(.+)$/i)?.[1] ?? null;
}

const VALID_EVENTS = [
  "case.created", "case.updated", "case.closed",
  "document.generated", "document.sent",
  "deadline.approaching", "deadline.missed",
  "payment.succeeded", "payment.refunded",
];

export async function POST(req: NextRequest) {
  const apiKey = extractApiKey(req);
  if (!apiKey) return NextResponse.json({ error: "missing_api_key" }, { status: 401 });
  const verified = await verifyApiKey(apiKey);
  if (!verified.ok) return NextResponse.json({ error: verified.reason }, { status: 401 });
  if (!hasApiScope(verified.key, "webhooks.manage")) return NextResponse.json({ error: "insufficient_scope" }, { status: 403 });

  let body: any = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  if (!body.url || typeof body.url !== "string") return NextResponse.json({ error: "url_required" }, { status: 400 });
  try {
    const u = new URL(body.url);
    if (u.protocol !== "https:") return NextResponse.json({ error: "https_required" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "invalid_url" }, { status: 400 });
  }
  if (!Array.isArray(body.events) || body.events.length === 0) {
    return NextResponse.json({ error: "events_required" }, { status: 400 });
  }
  for (const e of body.events) {
    if (!VALID_EVENTS.includes(e)) return NextResponse.json({ error: `invalid_event:${e}` }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { raw, hash } = generateWebhookSecret();
  const { data, error } = await supabase
    .from("webhook_subscriptions")
    .insert({
      organization_id: verified.key.organization_id,
      url: body.url,
      events: body.events,
      secret_hash: hash,
      active: true,
      failure_count: 0,
    })
    .select("id, url, events, active, created_at")
    .single();
  if (error || !data) return NextResponse.json({ error: error?.message ?? "create_failed" }, { status: 500 });

  // Store raw secret for signing dispatch
  await supabase.from("webhook_secrets").insert({ subscription_id: data.id, raw_secret: raw });

  return NextResponse.json({ ...data, secret: raw, note: "save_this_secret_now_it_will_not_be_shown_again" }, { status: 201 });
}

export async function GET(req: NextRequest) {
  const apiKey = extractApiKey(req);
  if (!apiKey) return NextResponse.json({ error: "missing_api_key" }, { status: 401 });
  const verified = await verifyApiKey(apiKey);
  if (!verified.ok) return NextResponse.json({ error: verified.reason }, { status: 401 });
  if (!hasApiScope(verified.key, "webhooks.manage")) return NextResponse.json({ error: "insufficient_scope" }, { status: 403 });

  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("webhook_subscriptions")
    .select("id, url, events, active, failure_count, last_delivery_at, created_at")
    .eq("organization_id", verified.key.organization_id)
    .order("created_at", { ascending: false });
  return NextResponse.json({ data: data ?? [] });
}
