import { NextRequest, NextResponse } from "next/server";
import { generateSecret, otpauthUrl } from "@/lib/security/mfa/totp";
import { generateBackupCodes, hashBackupCode } from "@/lib/security/mfa/backup-codes";
import { encryptField } from "@/lib/security/encryption/field-crypto";
import { recordSecurityEvent } from "@/lib/security/security-events";
import type { Json } from "@/lib/db/types";

async function getSupabase() {
  const { createSupabaseServerClient } = await import("@/lib/db/supabase-server");
  return createSupabaseServerClient();
}

export async function POST(req: NextRequest) {
  // Audyt 2026-06-27 (iter. 35): tabela `mfa_secrets` jest dotypowana —
  // usuwamy `as any`.
  const sb = await getSupabase();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const secret = generateSecret(user.email ?? user.id);
  const backupCodes = generateBackupCodes(10);
  const hashedCodes = backupCodes.map((c) => ({ code_hash: hashBackupCode(c), used: false }));

  // REALNY BUG (iter. 35): poprzedni kod zapisywał kolumny `issuer` i `account`,
  // których NIE MA w schemacie `mfa_secrets` (migracja 20260520000000). Przy
  // typowanym kliencie upsert by się nie skompilował — wcześniej `as any` to
  // maskowało, a w runtime PostgREST zwracał błąd "column does not exist".
  // issuer/account są częścią otpauth URL (zwracane niżej), więc nie ma potrzeby
  // ich utrwalać w DB.
  const { error } = await sb.from("mfa_secrets").upsert(
    {
      user_id: user.id,
      secret_encrypted: encryptField(secret.secret),
      backup_codes: hashedCodes as unknown as Json,
      verified: false,
    },
    { onConflict: "user_id" },
  );
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await recordSecurityEvent(sb, {
    userId: user.id,
    type: "auth.mfa_setup",
    ip: req.headers.get("x-forwarded-for") ?? undefined,
    userAgent: req.headers.get("user-agent") ?? undefined,
  });

  // Plaintext shown ONCE for QR + backup printout.
  return NextResponse.json({
    otpauth: otpauthUrl(secret),
    secret: secret.secret,
    backupCodes,
  });
}
