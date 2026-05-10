import { NextResponse, type NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/server-auth";
import { listDocumentVersions } from "@/lib/documents/versioning";
import { getSupabaseAdmin } from "@/lib/db/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const auth = await getAuthenticatedUser(req);
  if (!auth.ok) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const supabase = getSupabaseAdmin();
  const { data: doc } = await supabase
    .from("documents")
    .select("id, case_id, cases!inner(user_id)")
    .eq("id", id)
    .maybeSingle();
  if (!doc || (doc as any).cases?.user_id !== auth.user.id) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  const versions = await listDocumentVersions(id);
  return NextResponse.json({ versions });
}
