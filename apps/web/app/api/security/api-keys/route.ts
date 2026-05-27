import { NextRequest, NextResponse } from "next/server";
import { createApiKey, listApiKeys, revokeApiKey, ApiKeyScope } from "@/lib/security/api-keys/api-key-manager";
import { recordSecurityEvent } from "@/lib/security/security-events";

async function getSupabase() {
  const { createSupabaseServerClient } = await import("@/lib/db/supabase-server");
  return createSupabaseServerClient();
}

export async function GET(_req: NextRequest) {
  const supabase = await getSupabase();
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  try {
    const keys = await listApiKeys(supabase, user.id);
    return NextResponse.json({ keys });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "list_failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const supabase = await getSupabase();
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  if (!body.name || !Array.isArray(body.scopes)) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }
  try {
    const created = await createApiKey(supabase, {
      userId: user.id,
      name: body.name,
      scopes: body.scopes as ApiKeyScope[],
      expiresInDays: body.expiresInDays,
      env: body.env,
      rateLimitOverride: body.rateLimitOverride,
    });
    await recordSecurityEvent(supabase, {
      userId: user.id,
      type: "auth.api_key_created",
      ip: req.headers.get("x-forwarded-for") ?? undefined,
      userAgent: req.headers.get("user-agent") ?? undefined,
      metadata: { keyId: created.record.id, scopes: created.record.scopes },
    });
    return NextResponse.json({ key: created.record, plaintext: created.plaintext }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "create_failed" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const supabase = await getSupabase();
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const keyId = req.nextUrl.searchParams.get("id");
  if (!keyId) return NextResponse.json({ error: "id_required" }, { status: 400 });
  try {
    await revokeApiKey(supabase, keyId, user.id);
    await recordSecurityEvent(supabase, {
      userId: user.id,
      type: "auth.api_key_revoked",
      ip: req.headers.get("x-forwarded-for") ?? undefined,
      userAgent: req.headers.get("user-agent") ?? undefined,
      metadata: { keyId },
    });
    return NextResponse.json({ revoked: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "revoke_failed" }, { status: 500 });
  }
}
