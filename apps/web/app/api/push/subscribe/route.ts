import { NextRequest, NextResponse } from "next/server";
import { upsertPushSubscription, deactivateSubscription } from "@/lib/push/subscriptions";
import { createHash } from "crypto";

async function getSupabase() {
  const { createServerSupabase } = await import("@/lib/db/supabase-server");
  return createSupabaseServerClient();
}

export async function POST(req: NextRequest) {
  const supabase = await getSupabase();
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  if (!body.subscription?.endpoint || !body.subscription?.keys?.p256dh || !body.subscription?.keys?.auth) {
    return NextResponse.json({ error: "invalid_subscription" }, { status: 400 });
  }

  try {
    const row = await upsertPushSubscription(
      sb,
      user.id,
      body.subscription,
      req.headers.get("user-agent") ?? undefined,
    );
    return NextResponse.json({ subscription: { id: row.id, endpointHash: row.endpointHash } }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "subscribe_failed" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const supabase = await getSupabase();
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const endpoint = body.endpoint as string | undefined;
  if (!endpoint) return NextResponse.json({ error: "endpoint_required" }, { status: 400 });

  const endpointHash = createHash("sha256").update(endpoint).digest("hex");
  await deactivateSubscription(sb, endpointHash);
  return NextResponse.json({ ok: true });
}
