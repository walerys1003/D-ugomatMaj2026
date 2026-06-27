import { NextRequest, NextResponse } from "next/server";
import { fanoutPush } from "@/lib/push/subscriptions";

async function getSupabase() {
  const { createSupabaseServerClient } = await import("@/lib/db/supabase-server");
  return createSupabaseServerClient();
}

async function requireAdmin(sb: any) {
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return null;
  const { data } = await sb.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (data?.role !== "admin" && data?.role !== "owner") return null;
  return user;
}

export async function POST(req: NextRequest) {
  const supabase = await getSupabase();
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;
  if (!(await requireAdmin(sb))) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  if (!body.userId || !body.payload?.title) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  const cfg = {
    vapidPublicKey: process.env.VAPID_PUBLIC_KEY ?? "",
    vapidPrivateKey: process.env.VAPID_PRIVATE_KEY ?? "",
    vapidSubject: process.env.VAPID_SUBJECT ?? "mailto:noreply@dlugomat.pl",
  };
  if (!cfg.vapidPublicKey || !cfg.vapidPrivateKey) {
    return NextResponse.json({ error: "vapid_not_configured" }, { status: 503 });
  }

  try {
    const result = await fanoutPush(sb, body.userId, body.payload, cfg);
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "send_failed" }, { status: 500 });
  }
}
