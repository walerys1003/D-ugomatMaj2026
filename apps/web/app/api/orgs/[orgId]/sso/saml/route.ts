import { NextRequest, NextResponse } from "next/server";
import { buildSpMetadataXml } from "@/lib/enterprise/sso/saml";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";

export const runtime = "nodejs";

export async function GET(req: NextRequest, ctx: { params: { orgId: string } }) {
  const base = new URL(req.url).origin;
  const xml = buildSpMetadataXml({
    sp_entity_id: `${base}/orgs/${ctx.params.orgId}`,
    sp_acs_url: `${base}/api/orgs/${ctx.params.orgId}/sso/saml/acs`,
  });
  return new NextResponse(xml, { headers: { "content-type": "application/xml; charset=utf-8" } });
}

export async function POST(req: NextRequest, ctx: { params: { orgId: string } }) {
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb: any = await createSupabaseServerClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const body = await req.json().catch(() => null);
  if (!body?.idp_entity_id || !body?.idp_sso_url || !body?.idp_x509_cert) {
    return NextResponse.json({ error: "missing fields" }, { status: 400 });
  }
  await sb.from("org_sso_configs").upsert(
    {
      org_id: ctx.params.orgId,
      protocol: "saml",
      idp_entity_id: body.idp_entity_id,
      idp_sso_url: body.idp_sso_url,
      idp_x509_cert: body.idp_x509_cert,
      attribute_mapping: body.attribute_mapping ?? { email: "email" },
      enabled: true,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "org_id,protocol" },
  );
  return NextResponse.json({ ok: true });
}
