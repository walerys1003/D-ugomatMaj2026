import { NextRequest, NextResponse } from "next/server";
import { verifyTotp } from "@/lib/security/mfa/totp";
import { decryptField } from "@/lib/security/encryption/field-crypto";
import { recordSecurityEvent } from "@/lib/security/security-events";

async function getSupabase() {
  const { createSupabaseServerClient } = await import("@/lib/db/supabase-server");
  return createSupabaseServerClient();
}

export async function POST(req: NextRequest) {
  const supabase = await getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const token = String(body.token ?? "").trim();
  if (!token) return NextResponse.json({ error: "token_required" }, { status: 400 });

  const { data } = await supabase
    .from("mfa_secrets")
    .select("secret_encrypted")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!data) return NextResponse.json({ error: "mfa_not_configured" }, { status: 404 });

  if (!verifyTotp(token, decryptField(data.secret_encrypted))) {
    return NextResponse.json({ error: "invalid_token" }, { status: 401 });
  }

  await supabase.from("mfa_secrets").delete().eq("user_id", user.id);
  await recordSecurityEvent(supabase, {
    userId: user.id,
    type: "auth.session_revoked",
    ip: req.headers.get("x-forwarded-for") ?? undefined,
    userAgent: req.headers.get("user-agent") ?? undefined,
    metadata: { action: "mfa_disabled" },
  });
  return NextResponse.json({ disabled: true });
}
