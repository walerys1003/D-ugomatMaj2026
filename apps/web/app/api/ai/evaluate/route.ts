import { NextResponse } from "next/server";
import { runEvaluation } from "@/lib/ai/quality/evaluation-harness";
import { requireAdmin } from "@/lib/auth/require-admin";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST() {
  const gate = await requireAdmin();
  if (!gate.ok) return NextResponse.json({ error: gate.reason }, { status: gate.status });
  const out = await runEvaluation();
  return NextResponse.json(out);
}
