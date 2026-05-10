import { NextRequest, NextResponse } from "next/server";
import {
  buildRegistrationOptions,
  verifyClientDataChallenge,
  credentialFingerprint,
} from "@/lib/security/mfa/webauthn";
import { recordSecurityEvent } from "@/lib/security/security-events";

async function getSupabase() {
  const { createSupabaseServerClient } = await import("@/lib/db/supabase-server");
  return createSupabaseServerClient();
}

function rpConfig(req: NextRequest) {
  const host = req.headers.get("host") ?? "dlugomat.pl";
  const rpId = host.split(":")[0];
  const origin = `${req.headers.get("x-forwarded-proto") ?? "https"}://${host}`;
  return { rpId, origin };
}

// GET — issue registration challenge
export async function GET(req: NextRequest) {
  const supabase = await getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { rpId } = rpConfig(req);
  const options = buildRegistrationOptions({
    userId: user.id,
    userName: user.email ?? user.id,
    displayName: user.email ?? "Długomat User",
    rpName: "Długomat",
    rpId,
  });

  // Store challenge for later verification.
  await supabase.from("webauthn_challenges").upsert(
    { user_id: user.id, challenge: options.challenge, kind: "registration", expires_at: new Date(Date.now() + 60_000).toISOString() },
    { onConflict: "user_id,kind" },
  );

  return NextResponse.json(options);
}

// POST — finalize registration with attestation response from client
export async function POST(req: NextRequest) {
  const supabase = await getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  if (!body.credentialId || !body.clientDataJSON || !body.publicKey) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  const { rpId, origin } = rpConfig(req);

  // Get + consume the challenge.
  const { data: challengeRow } = await supabase
    .from("webauthn_challenges")
    .select("challenge")
    .eq("user_id", user.id)
    .eq("kind", "registration")
    .maybeSingle();
  if (!challengeRow) return NextResponse.json({ error: "no_pending_challenge" }, { status: 400 });

  const verification = verifyClientDataChallenge(body.clientDataJSON, challengeRow.challenge, [origin]);
  if (!verification.ok) return NextResponse.json({ error: verification.reason }, { status: 400 });

  await supabase.from("webauthn_credentials").insert({
    user_id: user.id,
    credential_id: body.credentialId,
    fingerprint: credentialFingerprint(body.credentialId),
    public_key: body.publicKey,
    rp_id: rpId,
    transports: body.transports ?? [],
    device_name: body.deviceName ?? null,
    sign_count: 0,
  });

  await supabase.from("webauthn_challenges").delete().eq("user_id", user.id).eq("kind", "registration");

  await recordSecurityEvent(supabase, {
    userId: user.id,
    type: "auth.webauthn_registered",
    ip: req.headers.get("x-forwarded-for") ?? undefined,
    userAgent: req.headers.get("user-agent") ?? undefined,
  });

  return NextResponse.json({ registered: true });
}
