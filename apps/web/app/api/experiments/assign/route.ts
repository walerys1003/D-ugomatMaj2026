/**
 * GET /api/experiments/assign?key=X&seed=Y — zwraca variant dla seed.
 * Jeśli nie ma seed → użyje cookie `dlk_anon`.
 */
import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { getExperiment, assignVariant, recordExposure } from "@/lib/experiments/ab-testing";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const key = url.searchParams.get("key");
  if (!key) return NextResponse.json({ error: "missing_key" }, { status: 400 });

  const seedParam = url.searchParams.get("seed");
  const cookieHeader = req.headers.get("cookie") ?? "";
  const anonCookie = /dlk_anon=([a-zA-Z0-9_-]+)/.exec(cookieHeader)?.[1];
  let seed = seedParam ?? anonCookie ?? crypto.randomBytes(8).toString("hex");

  const exp = await getExperiment(key);
  if (!exp || exp.status !== "running") {
    return NextResponse.json({ variant: "control", running: false });
  }
  const variant = assignVariant(exp, seed);
  await recordExposure(exp.key, variant, seed).catch(() => undefined);

  const res = NextResponse.json({ variant, seed, running: true, exposed: true });
  if (!anonCookie) {
    res.cookies.set("dlk_anon", seed, {
      httpOnly: false,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    });
  }
  return res;
}
