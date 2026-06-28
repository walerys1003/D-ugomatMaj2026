/**
 * POST /api/affiliate/signup — rejestracja w programie afiliacyjnym.
 * Body: { display_name, payout_email, preferred_slug? }
 */
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";
import { createAffiliateAccount } from "@/lib/affiliate/tracking";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    display_name?: string;
    payout_email?: string;
    preferred_slug?: string;
  };
  if (!body.display_name || !body.payout_email) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }
  const supabase = createSupabaseServerClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }
  try {
    const account = await createAffiliateAccount({
      userId: auth.user.id,
      displayName: body.display_name,
      payoutEmail: body.payout_email,
      preferredSlug: body.preferred_slug,
    });
    return NextResponse.json({ account });
  } catch (err) {
    return NextResponse.json(
      { error: "signup_failed", detail: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
