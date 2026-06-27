import { NextRequest, NextResponse } from "next/server";
import { ocrDocumentFromImageUrl } from "@/lib/ai/ocr/document-ocr";
import { recordAiUsage } from "@/lib/ai/usage-tracker";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.image_url) return NextResponse.json({ error: "missing image_url" }, { status: 400 });
  const sb = await createSupabaseServerClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const res = await ocrDocumentFromImageUrl(body.image_url);
  await recordAiUsage({
    user_id: user.id,
    model_id: "claude-sonnet-4-5",
    task_type: "ocr",
    input_tokens: 0,
    output_tokens: 0,
    cost_grosze: 0,
    metadata: { document_type: res.document_type, confidence: res.confidence },
  });
  return NextResponse.json(res);
}
