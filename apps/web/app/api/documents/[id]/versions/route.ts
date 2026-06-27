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
  // Audyt 2026-06-27 (iter. 36): zamiast `(doc as any)` zawężamy tylko
  // osadzony join `cases` (PostgREST zwraca go jako obiekt lub tablicę
  // zależnie od kardynalności relacji).
  const joined = doc?.cases as { user_id: string } | { user_id: string }[] | null | undefined;
  const ownerId = Array.isArray(joined) ? joined[0]?.user_id : joined?.user_id;
  if (!doc || ownerId !== auth.user.id) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  const versions = await listDocumentVersions(id);
  return NextResponse.json({ versions });
}
