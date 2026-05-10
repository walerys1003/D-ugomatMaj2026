import { NextRequest, NextResponse } from "next/server";
import { runJob, runDueJobs, SCHEDULED_JOBS } from "@/lib/jobs/scheduler";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET() {
  return NextResponse.json({ jobs: SCHEDULED_JOBS.map((j) => ({ key: j.key, description: j.description, cron: j.cron })) });
}

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret");
  if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const body = await req.json().catch(() => null);
  if (body?.key) {
    const r = await runJob(body.key);
    return NextResponse.json(r);
  }
  const results = await runDueJobs();
  return NextResponse.json({ results });
}
