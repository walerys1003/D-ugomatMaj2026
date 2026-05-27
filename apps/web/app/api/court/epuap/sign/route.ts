/**
 * Tier 18 — ePUAP signing API.
 *
 * POST /api/court/epuap/sign         → initiate sign session (returns redirectUrl)
 * GET  /api/court/epuap/sign?session → fetch signed envelope after callback
 */

import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";
import {
  initiateSignSession,
  fetchSignedEnvelope,
  verifyEnvelopeAgainstHashes,
  type EpuapDocument,
} from "@/lib/court/epuap";

export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => null)) as
    | { caseId?: string; documents?: EpuapDocument[]; callbackUrl?: string; metadata?: Record<string, string> }
    | null;
  if (!body?.documents?.length || !body?.callbackUrl) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  try {
    const session = await initiateSignSession({
      userId: user.id,
      caseId: body.caseId,
      documents: body.documents,
      callbackUrl: body.callbackUrl,
      metadata: body.metadata,
    });
    // Persist session for later callback verification.
    await sb.from("epuap_sign_sessions").insert({
      session_id: session.sessionId,
      user_id: user.id,
      case_id: body.caseId ?? null,
      document_hashes: session.documentHashes,
      expires_at: session.expiresAt,
      status: "pending",
    });
    return NextResponse.json(
      { sessionId: session.sessionId, redirectUrl: session.redirectUrl, expiresAt: session.expiresAt },
      { status: 201 },
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}

export async function GET(req: Request) {
  const supabase = await createSupabaseServerClient();
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const sessionId = new URL(req.url).searchParams.get("session");
  if (!sessionId) return NextResponse.json({ error: "missing_session" }, { status: 400 });

  const { data: row, error } = await sb
    .from("epuap_sign_sessions")
    .select("*")
    .eq("session_id", sessionId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (error || !row) return NextResponse.json({ error: "not_found" }, { status: 404 });

  try {
    const env = await fetchSignedEnvelope(sessionId);
    const ok = verifyEnvelopeAgainstHashes(env, row.document_hashes as string[]);
    if (!ok) {
      await sb
        .from("epuap_sign_sessions")
        .update({ status: "hash_mismatch" })
        .eq("session_id", sessionId);
      return NextResponse.json({ error: "hash_mismatch" }, { status: 409 });
    }
    await sb
      .from("epuap_sign_sessions")
      .update({ status: "signed", signed_at: env.signedAt })
      .eq("session_id", sessionId);
    return NextResponse.json({ envelope: env });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
