/**
 * Wave 8 / T003-202 — GET /api/orgs/billing/invoices
 *
 * Lists invoices for the user's active organization, paginated.
 */
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/db/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const sb = await createServerSupabase();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const { data: m } = await sb
    .from("org_memberships")
    .select("org_id")
    .eq("user_id", user.id)
    .order("joined_at", { ascending: false })
    .limit(1);
  const orgId = m?.[0]?.org_id as string | undefined;
  if (!orgId) return NextResponse.json({ data: [], pagination: { limit: 0 } });

  const limit = Math.min(Number(req.nextUrl.searchParams.get("limit") ?? 50), 100);

  const sbLoose = sb as unknown as {
    from: (t: string) => {
      select: (c: string) => {
        eq: (col: string, v: unknown) => {
          order: (col: string, opts: { ascending: boolean }) => {
            limit: (n: number) => Promise<{ data: Array<Record<string, unknown>> | null; error: { message: string } | null }>;
          };
        };
      };
    };
  };

  try {
    const { data, error } = await sbLoose
      .from("invoices")
      .select("id, number, issued_at, due_at, status, total_grosze, currency, pdf_url")
      .eq("org_id", orgId)
      .order("issued_at", { ascending: false })
      .limit(limit);
    if (error) {
      return NextResponse.json({ data: [], pagination: { limit }, error: error.message });
    }
    return NextResponse.json({ data: data ?? [], pagination: { limit } });
  } catch (e: unknown) {
    return NextResponse.json({ data: [], pagination: { limit }, error: (e as Error).message });
  }
}
