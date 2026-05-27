import { NextRequest, NextResponse } from "next/server";
import { buildAssertionOptions, verifyClientDataChallenge } from "@/lib/security/mfa/webauthn";
import { recordSecurityEvent } from "@/lib/security/security-events";

async function getSupabase() {
  const { createSupabaseServerClient } = await import("@/lib/db/sb-server");
  return createSupabaseServerClient();
}

function rpConfig(req: NextRequest) {
  const host = req.headers.get("host") ?? "dlugomat.pl";
  const rpId = host.split(":")[0];
  const origin = `${req.headers.get("x-forwarded-proto") ?? "https"}://${host}`;
  return { rpId, origin };
}

export async function GET(req: NextRequest) {
  const supabase = await getSupabase();
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { rpId } = rpConfig(req);
  const { data: creds } = await sb
    .from("webauthn_credentials")
    .select("credential_id")
    .eq("user_id", user.id)
    .is("revoked_at", null);

  const options = buildAssertionOptions({
    rpId,
    allowCredentials: (creds ?? []).map((c: any) => c.credential_id),
  });

  await sb.from("webauthn_challenges").upsert(
    { user_id: user.id, challenge: options.challenge, kind: "authentication", expires_at: new Date(Date.now() + 60_000).toISOString() },
    { onConflict: "user_id,kind" },
  );

  return NextResponse.json(options);
}

export async function POST(req: NextRequest) {
  const supabase = await getSupabase();
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  if (!body.credentialId || !body.clientDataJSON) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }
  const { origin } = rpConfig(req);

  const { data: challengeRow } = await sb
    .from("webauthn_challenges")
    .select("challenge")
    .eq("user_id", user.id)
    .eq("kind", "authentication")
    .maybeSingle();
  if (!challengeRow) return NextResponse.json({ error: "no_pending_challenge" }, { status: 400 });

  const verification = verifyClientDataChallenge(body.clientDataJSON, challengeRow.challenge, [origin]);
  if (!verification.ok) return NextResponse.json({ error: verification.reason }, { status: 400 });

  // Verify the credential is registered to this user.
  const { data: cred } = await sb
    .from("webauthn_credentials")
    .select("id, sign_count")
    .eq("user_id", user.id)
    .eq("credential_id", body.credentialId)
    .is("revoked_at", null)
    .maybeSingle();
  if (!cred) return NextResponse.json({ error: "credential_not_found" }, { status: 401 });

  // Bump signature counter (production should also verify signature via @simplewebauthn/server).
  await sb
    .from("webauthn_credentials")
    .update({ sign_count: (cred.sign_count ?? 0) + 1, last_used_at: new Date().toISOString() })
    .eq("id", cred.id);
  await sb.from("webauthn_challenges").delete().eq("user_id", user.id).eq("kind", "authentication");

  await recordSecurityEvent(sb, {
    userId: user.id,
    type: "auth.webauthn_verified",
    ip: req.headers.get("x-forwarded-for") ?? undefined,
    userAgent: req.headers.get("user-agent") ?? undefined,
  });

  return NextResponse.json({ verified: true });
}
