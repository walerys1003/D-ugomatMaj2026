import { NextResponse } from "next/server";
import { DEPLOYMENT_RUNBOOK, getRunbookMarkdown } from "@/lib/launch/deployment-runbook";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  if (url.searchParams.get("format") === "md") {
    return new NextResponse(getRunbookMarkdown(), { headers: { "content-type": "text/markdown; charset=utf-8" } });
  }
  return NextResponse.json({ steps: DEPLOYMENT_RUNBOOK });
}
