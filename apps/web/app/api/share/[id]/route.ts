import { NextResponse, type NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/server-auth";
import { revokeLawyerShare } from "@/lib/sharing/lawyer-share";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const auth = await getAuthenticatedUser(req);
  if (!auth.ok) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const result = await revokeLawyerShare(auth.user.id, id);
  if (!result.ok) return NextResponse.json({ error: "revoke_failed" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
