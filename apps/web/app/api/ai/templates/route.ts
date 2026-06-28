import { NextResponse } from "next/server";
import { listTemplates } from "@/lib/ai/prompt-templates";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ templates: listTemplates() });
}
