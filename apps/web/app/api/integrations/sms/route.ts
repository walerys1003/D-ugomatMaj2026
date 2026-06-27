import { NextRequest, NextResponse } from "next/server";
import { sendSms, MessagingChannel } from "@/lib/integrations/sms-whatsapp";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const sb = await createSupabaseServerClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const body = await req.json().catch(() => null);
  if (!body?.to || !body?.body) return NextResponse.json({ error: "missing to or body" }, { status: 400 });
  const channel = (body.channel as MessagingChannel) ?? "sms";
  const res = await sendSms(body.to, body.body, channel);
  return NextResponse.json(res);
}
