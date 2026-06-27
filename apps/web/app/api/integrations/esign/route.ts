import { NextRequest, NextResponse } from "next/server";
import { createSignatureRequest, refreshSignatureStatus } from "@/lib/integrations/esign/document-signing";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const sb = await createSupabaseServerClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const body = await req.json().catch(() => null);
  if (!body?.document_id || !body?.document_url || !Array.isArray(body?.signers)) {
    return NextResponse.json({ error: "missing fields" }, { status: 400 });
  }
  const r = await createSignatureRequest({
    user_id: user.id,
    document_id: body.document_id,
    document_url: body.document_url,
    provider: body.provider,
    signers: body.signers,
    subject: body.subject,
    message: body.message,
    expires_in_days: body.expires_in_days,
  });
  return NextResponse.json(r, { status: 201 });
}

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "missing id" }, { status: 400 });
  const status = await refreshSignatureStatus(id);
  return NextResponse.json({ id, status });
}
