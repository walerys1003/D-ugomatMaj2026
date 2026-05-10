/**
 * Tier 10 — Admin user management helpers: suspend, unsuspend, change role.
 */
import { createServerSupabase } from "@/lib/db/supabase-server";

export async function suspendUser(userId: string, reason: string): Promise<void> {
  const sb = await createServerSupabase();
  await sb
    .from("profiles")
    .update({ suspended: true, suspended_at: new Date().toISOString(), suspended_reason: reason })
    .eq("id", userId);
}

export async function unsuspendUser(userId: string): Promise<void> {
  const sb = await createServerSupabase();
  await sb
    .from("profiles")
    .update({ suspended: false, suspended_at: null, suspended_reason: null })
    .eq("id", userId);
}

export async function setUserRole(userId: string, role: "user" | "admin" | "support"): Promise<void> {
  const sb = await createServerSupabase();
  await sb.from("profiles").update({ role }).eq("id", userId);
}

export async function searchUsers(query: string, limit = 25): Promise<unknown[]> {
  const sb = await createServerSupabase();
  const term = `%${query.replace(/[%_]/g, "")}%`;
  const { data } = await sb
    .from("profiles")
    .select("id, email, full_name, role, suspended, created_at, last_seen_at")
    .or(`email.ilike.${term},full_name.ilike.${term}`)
    .order("created_at", { ascending: false })
    .limit(limit);
  return data ?? [];
}
