import { NextResponse } from "next/server";
import { buildZapierManifest } from "@/lib/integrations/zapier-connector";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const base = new URL(req.url).origin;
  return NextResponse.json(buildZapierManifest(base));
}
