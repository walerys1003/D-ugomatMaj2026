/**
 * POST /api/mobile/devices/push-token — aktualizuje push token dla device.
 * Body: { device_id, push_token }
 */
import { NextResponse } from "next/server";
import { updatePushToken } from "@/lib/mobile/device-registration";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    device_id?: string;
    push_token?: string | null;
  };
  if (!body.device_id) {
    return NextResponse.json({ error: "missing_device_id" }, { status: 400 });
  }
  await updatePushToken(body.device_id, body.push_token ?? null);
  return NextResponse.json({ ok: true });
}
