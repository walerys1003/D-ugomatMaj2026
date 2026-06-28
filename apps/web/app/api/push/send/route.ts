import { NextRequest, NextResponse } from "next/server";
import { fanoutPush } from "@/lib/push/subscriptions";

async function getSupabase() {
  const { createSupabaseServerClient } = await import("@/lib/db/supabase-server");
  return createSupabaseServerClient();
}

type Db = Awaited<ReturnType<typeof getSupabase>>;

async function requireAdmin(sb: Db) {
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return null;
  const { data } = await sb.from("profiles").select("role").eq("id", user.id).maybeSingle();
  // REALNY BUG (iter. 35): `role !== "owner"` był martwym warunkiem — UserRole
  // to "user" | "admin" | "moderator" (brak "owner"). Po dotypowaniu klienta
  // TypeScript wymusza poprawne wartości.
  if (data?.role !== "admin") return null;
  return user;
}

export async function POST(req: NextRequest) {
  // Audyt 2026-06-27 (iter. 35): typowany klient zamiast `as any`.
  const sb = await getSupabase();
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
