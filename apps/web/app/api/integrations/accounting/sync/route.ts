import { NextRequest, NextResponse } from "next/server";
import { syncInvoice, AccountingProvider } from "@/lib/integrations/accounting/fakturownia-v2";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const sb = await createSupabaseServerClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const body = await req.json().catch(() => null);
  if (!body?.provider || !body?.contractor || !Array.isArray(body?.lines)) {
    return NextResponse.json({ error: "missing fields" }, { status: 400 });
  }
  try {
    const r = await syncInvoice(body.provider as AccountingProvider, { contractor: body.contractor, lines: body.lines });
    return NextResponse.json(r);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 502 });
  }
}
