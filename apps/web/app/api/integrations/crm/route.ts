import { NextRequest, NextResponse } from "next/server";
import { syncContact, CrmProvider } from "@/lib/integrations/crm-sync";
import { createServerSupabase } from "@/lib/db/supabase-server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const sb = await createServerSupabase();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const body = await req.json().catch(() => null);
  if (!body?.provider || !body?.contact?.email) {
    return NextResponse.json({ error: "missing provider or contact.email" }, { status: 400 });
  }
  try {
    const r = await syncContact(body.provider as CrmProvider, body.contact);
    return NextResponse.json(r);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 502 });
  }
}
