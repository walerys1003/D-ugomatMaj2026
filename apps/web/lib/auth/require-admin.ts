/**
 * Tier 10 — Admin auth gate used by /api/admin/* routes.
 * Checks profile.role='admin' for the authenticated Supabase user.
 */
import { createServerSupabase } from "@/lib/db/supabase-server";

export type RequireAdminResult =
  | { ok: true; userId: string }
  | { ok: false; reason: string; status: number };

export async function requireAdmin(): Promise<RequireAdminResult> {
  try {
    const sb = await createServerSupabase();
    const {
      data: { user },
    } = await sb.auth.getUser();
    if (!user) return { ok: false, reason: "unauthenticated", status: 401 };
    const { data: profile } = await sb
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    if (!profile || profile.role !== "admin") {
      return { ok: false, reason: "forbidden", status: 403 };
    }
    return { ok: true, userId: user.id };
  } catch {
    return { ok: false, reason: "server_error", status: 500 };
  }
}
