import { NextRequest, NextResponse } from "next/server";
import { createScimUser, listScimUsers } from "@/lib/enterprise/scim";

export const runtime = "nodejs";

async function checkScimToken(req: NextRequest, orgId: string): Promise<boolean> {
  const auth = req.headers.get("authorization") ?? "";
  const token = auth.replace(/^Bearer\s+/i, "");
  if (!token) return false;
  // Token validation done via scim_tokens table — simplified: env-based check here
  const expected = process.env[`SCIM_TOKEN_${orgId.replace(/-/g, "_").toUpperCase()}`];
  return !!expected && token === expected;
}

export async function GET(req: NextRequest, ctx: { params: { orgId: string } }) {
  if (!(await checkScimToken(req, ctx.params.orgId))) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const startIndex = parseInt(req.nextUrl.searchParams.get("startIndex") ?? "1", 10);
  const count = parseInt(req.nextUrl.searchParams.get("count") ?? "50", 10);
  const list = await listScimUsers(ctx.params.orgId, { startIndex, count });
  return NextResponse.json({ schemas: ["urn:ietf:params:scim:api:messages:2.0:ListResponse"], ...list });
}

export async function POST(req: NextRequest, ctx: { params: { orgId: string } }) {
  if (!(await checkScimToken(req, ctx.params.orgId))) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  const u = await createScimUser(ctx.params.orgId, body);
  return NextResponse.json({ schemas: ["urn:ietf:params:scim:schemas:core:2.0:User"], ...u }, { status: 201 });
}
