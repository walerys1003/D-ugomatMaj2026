import { NextRequest, NextResponse } from "next/server";
import { fanoutPush } from "@/lib/push/subscriptions";

async function getSupabase() {
  const { createServerSupabase } = await import("@/lib/supabase/server");
  return createSupabaseServerClient();
}

async function requireAdmin(supabase: any) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (data?.role !== "admin" && data?.role !== "owner") return null;
  return user;
}

export async function POST(req: NextRequest) {
  const supabase = await getSupabase();
  if (!(await requireAdmin(supabase))) return NextResponse.json({ error: "forbidden" }, { status: 403 });

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
    const result = await fanoutPush(supabase, body.userId, body.payload, cfg);
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "send_failed" }, { status: 500 });
  }
}
