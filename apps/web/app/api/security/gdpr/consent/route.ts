import { NextRequest, NextResponse } from "next/server";
import { recordConsent, currentConsent, listConsents, ConsentPurpose } from "@/lib/security/gdpr/consent-ledger";
import { recordSecurityEvent } from "@/lib/security/security-events";

async function getSupabase() {
  const { createSupabaseServerClient } = await import("@/lib/db/supabase-server");
  return createSupabaseServerClient();
}

export async function GET(req: NextRequest) {
  const supabase = await getSupabase();
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const ledger = req.nextUrl.searchParams.get("ledger") === "1";
  try {
    if (ledger) {
      const entries = await listConsents(supabase, user.id);
      return NextResponse.json({ entries });
    }
    const consents = await currentConsent(supabase, user.id);
    return NextResponse.json({ consents });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "consent_failed" }, { status: 500 });
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
  if (!body.purpose || typeof body.granted !== "boolean" || !body.policyVersion) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }
  try {
    const entry = await recordConsent(supabase, {
      userId: user.id,
      purpose: body.purpose as ConsentPurpose,
      granted: body.granted,
      policyVersion: body.policyVersion,
      source: body.source ?? "settings",
      ip: req.headers.get("x-forwarded-for") ?? undefined,
      userAgent: req.headers.get("user-agent") ?? undefined,
    });
    await recordSecurityEvent(supabase, {
      userId: user.id,
      type: body.granted ? "gdpr.consent_granted" : "gdpr.consent_withdrawn",
      metadata: { purpose: body.purpose, policyVersion: body.policyVersion },
    });
    return NextResponse.json({ entry }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "consent_failed" }, { status: 500 });
  }
}
