import { NextResponse, type NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/server-auth";
import { transcribeAudio, tidyTranscript } from "@/lib/voice/transcription";
import { logger } from "@/lib/observability/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 25 * 1024 * 1024;

export async function POST(req: NextRequest) {
  const auth = await getAuthenticatedUser(req);
  if (!auth.ok) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const contentType = req.headers.get("content-type") ?? "";
  if (!contentType.startsWith("multipart/form-data")) {
    return NextResponse.json({ error: "expected_multipart" }, { status: 400 });
  }
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "invalid_form" }, { status: 400 });
  }
  const file = form.get("file");
  if (!(file instanceof Blob)) return NextResponse.json({ error: "no_file" }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "file_too_large" }, { status: 413 });

  const filename = (form.get("filename") as string | null) ?? "voice.webm";
  const language = (form.get("language") as string | null) ?? "pl";
  const prompt = (form.get("prompt") as string | null) ?? undefined;

  try {
    const result = await transcribeAudio({ audio: file, filename, language, prompt });
    return NextResponse.json({ ...result, text: tidyTranscript(result.text) });
  } catch (err) {
    logger.error("voice.transcribe_failed", { error: (err as Error).message });
    return NextResponse.json({ error: "transcribe_failed" }, { status: 500 });
  }
}
