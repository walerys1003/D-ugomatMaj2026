import { NextRequest, NextResponse } from "next/server";
import { verifyTotp } from "@/lib/security/mfa/totp";
import { verifyBackupCode } from "@/lib/security/mfa/backup-codes";
import { decryptField } from "@/lib/security/encryption/field-crypto";
import { recordSecurityEvent } from "@/lib/security/security-events";
import type { Json } from "@/lib/db/types";

async function getSupabase() {
  const { createSupabaseServerClient } = await import("@/lib/db/supabase-server");
  return createSupabaseServerClient();
}

export async function POST(req: NextRequest) {
  // Audyt 2026-06-27 (iter. 35): tabela `mfa_secrets` jest dotypowana
  // w Database — usuwamy `as any`, korzystamy z typowanego klienta.
  const sb = await getSupabase();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const token = String(body.token ?? "").trim();
  if (!token) return NextResponse.json({ error: "token_required" }, { status: 400 });

  const { data, error } = await sb
    .from("mfa_secrets")
    .select("secret_encrypted, backup_codes, verified")
    .eq("user_id", user.id)
    .maybeSingle();
  if (error || !data) return NextResponse.json({ error: "mfa_not_configured" }, { status: 404 });

  const ip = req.headers.get("x-forwarded-for") ?? undefined;
  const ua = req.headers.get("user-agent") ?? undefined;

  // Try TOTP first.
  const secret = decryptField(data.secret_encrypted);
  if (verifyTotp(token, secret)) {
    if (!data.verified) await sb.from("mfa_secrets").update({ verified: true }).eq("user_id", user.id);
    await recordSecurityEvent(sb, { userId: user.id, type: "auth.mfa_verified", ip, userAgent: ua });
    return NextResponse.json({ verified: true, method: "totp" });
  }

  // Fall back to backup codes.
  const codes = (data.backup_codes ?? []) as unknown as Array<{ code_hash: string; used: boolean }>;
  for (let i = 0; i < codes.length; i++) {
    const c = codes[i];
    if (!c.used && verifyBackupCode(token, c.code_hash)) {
      codes[i] = { ...c, used: true };
      await sb.from("mfa_secrets").update({ backup_codes: codes as unknown as Json }).eq("user_id", user.id);
      await recordSecurityEvent(sb, { userId: user.id, type: "auth.backup_code_used", ip, userAgent: ua });
      return NextResponse.json({ verified: true, method: "backup_code", remainingBackupCodes: codes.filter((x) => !x.used).length });
    }
  }

  await recordSecurityEvent(sb, { userId: user.id, type: "auth.mfa_failed", ip, userAgent: ua });
  return NextResponse.json({ verified: false }, { status: 401 });
}
