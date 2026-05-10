import { NextRequest, NextResponse } from "next/server";
import { generateSecret, otpauthUrl } from "@/lib/security/mfa/totp";
import { generateBackupCodes, hashBackupCode } from "@/lib/security/mfa/backup-codes";
import { encryptField } from "@/lib/security/encryption/field-crypto";
import { recordSecurityEvent } from "@/lib/security/security-events";

async function getSupabase() {
  const { createSupabaseServerClient } = await import("@/lib/db/supabase-server");
  return createSupabaseServerClient();
}

export async function POST(req: NextRequest) {
  const supabase = await getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const secret = generateSecret(user.email ?? user.id);
  const backupCodes = generateBackupCodes(10);
  const hashedCodes = backupCodes.map((c) => ({ code_hash: hashBackupCode(c), used: false }));

  const { error } = await supabase.from("mfa_secrets").upsert(
    {
      user_id: user.id,
      secret_encrypted: encryptField(secret.secret),
      issuer: secret.issuer,
      account: secret.account,
      backup_codes: hashedCodes,
      verified: false,
    },
    { onConflict: "user_id" },
  );
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await recordSecurityEvent(supabase, {
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
