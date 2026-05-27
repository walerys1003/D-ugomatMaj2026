import { NextRequest, NextResponse } from "next/server";
import { generateSecret, otpauthUrl } from "@/lib/security/mfa/totp";
import { generateBackupCodes, hashBackupCode } from "@/lib/security/mfa/backup-codes";
import { encryptField } from "@/lib/security/encryption/field-crypto";
import { recordSecurityEvent } from "@/lib/security/security-events";

async function getSupabase() {
  const { createSupabaseServerClient } = await import("@/lib/db/sb-server");
  return createSupabaseServerClient();
}

export async function POST(req: NextRequest) {
  const supabase = await getSupabase();
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const secret = generateSecret(user.email ?? user.id);
  const backupCodes = generateBackupCodes(10);
  const hashedCodes = backupCodes.map((c) => ({ code_hash: hashBackupCode(c), used: false }));

  const { error } = await sb.from("mfa_secrets").upsert(
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
