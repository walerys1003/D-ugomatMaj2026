import { NextResponse } from "next/server";
import { buildMakeBlueprint } from "@/lib/integrations/make-blueprint";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const base = new URL(req.url).origin;
  return NextResponse.json(buildMakeBlueprint(base));
}
