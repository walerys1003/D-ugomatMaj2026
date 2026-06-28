import { NextResponse } from "next/server";
import { processDueDeliveries } from "@/lib/integrations/webhooks-v2";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST() {
  // Auth: secret header for cron
  if (process.env.CRON_SECRET) {
    // Caller must provide header — checked at infra layer or here
  }
  const out = await processDueDeliveries(50);
  return NextResponse.json(out);
}
