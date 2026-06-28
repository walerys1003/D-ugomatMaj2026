/**
 * Wave 6 / T003-002 — GET /api/orgs/mine
 *
 * FE caller: `lib/orgs/membership.ts → fetchUserOrgs()` expects
 * `{ orgs: Organization[] }`.
 *
 * Lists every organization the user is a member of, with their role.
 */
import { NextResponse } from "next/server";
import { listUserOrganizations } from "@/lib/enterprise/organizations";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const sb = await createSupabaseServerClient();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const memberships = await listUserOrganizations(user.id);
  // FE shape expectation: `{ orgs: Organization[] }`.
  return NextResponse.json(
    { orgs: memberships.map((m) => ({ ...m.org, role: m.role })) },
    { status: 200 },
  );
}
