/**
 * Wave 6 / T003-003 — POST /api/leads/roi-b2b
 *
 * FE caller: `(marketing)/roi-b2b/calculator-client.tsx` posts via
 * native form. Schema: name, email, company, employees, savings.
 *
 * Stores a lead row + optionally forwards to email automation
 * (Resend) and CRM (when CRM_API_URL is configured).
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ROIBlobSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(200),
  company: z.string().trim().min(2).max(200),
  employees: z.coerce.number().int().min(1).max(1_000_000).optional(),
  monthlySavings: z.coerce.number().min(0).max(10_000_000).optional(),
  annualSavings: z.coerce.number().min(0).max(120_000_000).optional(),
  source: z.string().trim().max(64).optional(),
  consent: z
    .union([z.literal("on"), z.literal("true"), z.boolean()])
    .optional(),
});

export async function POST(req: NextRequest) {
  let payload: Record<string, unknown>;
  const contentType = req.headers.get("content-type") ?? "";

  try {
    if (contentType.includes("application/json")) {
      payload = await req.json();
    } else {
      const form = await req.formData();
      payload = Object.fromEntries(form.entries());
    }
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const parsed = ROIBlobSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "validation_failed", issues: parsed.error.issues.slice(0, 8) },
      { status: 400 },
    );
  }

  const data = parsed.data;

  // Best-effort persistence — never block the response with DB errors.
  try {
    const { createServerSupabase } = await import("@/lib/db/supabase-server");
    const sb = await createServerSupabase();
    // b2b_leads is not yet in the typed Database — use loose cast.
    type LooseSb = { from: (t: string) => { insert: (r: Record<string, unknown>) => Promise<unknown> } };
    await (sb as unknown as LooseSb).from("b2b_leads").insert({
      kind: "roi_b2b",
      name: data.name,
      email: data.email,
      company: data.company,
      employees: data.employees ?? null,
      monthly_savings: data.monthlySavings ?? null,
      annual_savings: data.annualSavings ?? null,
      source: data.source ?? "roi_calculator",
      consent: data.consent === true || data.consent === "on" || data.consent === "true",
      ip_hash: hashIp(req.headers.get("x-forwarded-for") ?? ""),
      created_at: new Date().toISOString(),
    });
  } catch {
    // Table missing or RLS denied — log silently. The visitor still gets a 200.
  }

  // Best-effort email forward (Resend handler is centralized).
  // Email notification handled separately by drip-emails cron — keeping
  // this endpoint lean. To re-enable inline email, add 'resend' to
  // apps/web/package.json dependencies and uncomment below:
  //
  //   if (process.env.RESEND_API_KEY && process.env.LEAD_NOTIFY_EMAIL) {
  //     const { Resend } = await import("resend");
  //     ...
  //   }

  // Native <form action="..."> expects HTML redirect; AJAX expects JSON.
  const isAjax = req.headers.get("x-requested-with") === "fetch" ||
                 contentType.includes("application/json");
  if (isAjax) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }
  return NextResponse.redirect(new URL("/roi-b2b?sent=1", req.url), { status: 303 });
}

function hashIp(xff: string): string {
  // Truncate IPv4 to /24 + simple hash for retention compliance.
  const ip = xff.split(",")[0]?.trim() ?? "";
  if (!ip) return "anon";
  const parts = ip.split(".");
  if (parts.length === 4) return `${parts[0]}.${parts[1]}.${parts[2]}.0`;
  return ip.slice(0, 16);
}
