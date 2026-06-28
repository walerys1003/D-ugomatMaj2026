/**
 * POST /api/email/leads — captureLead endpoint dla lead magnet form.
 * Body: { email, magnet_slug, consent_marketing, source?, medium?, campaign? }
 */
import { NextResponse } from "next/server";
import { captureLead } from "@/lib/growth/lead-magnets";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    email?: string;
    magnet_slug?: string;
    consent_marketing?: boolean;
    source?: string;
    medium?: string;
    campaign?: string;
  };
  if (!body.email || !body.magnet_slug) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }
  if (!body.consent_marketing) {
    return NextResponse.json({ error: "consent_required" }, { status: 400 });
  }
  const result = await captureLead({
    email: body.email,
    magnetSlug: body.magnet_slug,
    consentMarketing: true,
    source: body.source,
    medium: body.medium,
    campaign: body.campaign,
  });
  if (!result.ok) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
  return NextResponse.json({
    ok: true,
    magnet: {
      title: result.magnet?.title,
      file_url: result.magnet?.fileUrl,
    },
  });
}
