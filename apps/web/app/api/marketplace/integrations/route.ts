import { NextRequest, NextResponse } from "next/server";
import { listIntegrations, IntegrationDirectoryEntry } from "@/lib/marketplace/integrations-directory";

export async function GET(req: NextRequest) {
  const category = req.nextUrl.searchParams.get("category") as IntegrationDirectoryEntry["category"] | null;
  const integrations = listIntegrations(category ?? undefined);
  return NextResponse.json({ integrations });
}
