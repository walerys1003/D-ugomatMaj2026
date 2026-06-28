/**
 * POST /api/mobile/devices/register — rejestruje native device.
 * Body: { device_id, platform, push_token?, app_version, os_version?, locale? }
 */
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";
import { registerOrUpdateDevice } from "@/lib/mobile/device-registration";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    device_id?: string;
    platform?: "ios" | "android";
    push_token?: string | null;
    app_version?: string;
    os_version?: string;
    locale?: string;
  };
  if (!body.device_id || !body.platform || !body.app_version) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }
  if (!["ios", "android"].includes(body.platform)) {
    return NextResponse.json({ error: "invalid_platform" }, { status: 400 });
  }
  const supabase = createSupabaseServerClient();
  const { data: auth } = await supabase.auth.getUser();

  try {
    const device = await registerOrUpdateDevice({
      deviceId: body.device_id,
      platform: body.platform,
      pushToken: body.push_token ?? null,
      appVersion: body.app_version,
      osVersion: body.os_version ?? null,
      locale: body.locale ?? null,
      userId: auth.user?.id ?? null,
    });
    return NextResponse.json({ device });
  } catch (err) {
    return NextResponse.json(
      { error: "register_failed", detail: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
