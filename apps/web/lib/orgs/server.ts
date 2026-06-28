/**
 * Server-side helpers do rozwiązywania aktywnej organizacji uzytkownika
 * w Server Components panelu B2B (firma / kancelaria / organizacja).
 *
 * Zwraca pierwsza organizacje, do ktorej nalezy zalogowany uzytkownik
 * (wraz z jego rola). RLS na org_memberships filtruje po auth.uid().
 */
import { createSupabaseServerClient } from "@/lib/db/supabase-server";

export interface ActiveOrg {
  id: string;
  slug: string;
  name: string;
  plan: string;
  seats_purchased: number;
  data_residency: string;
  domain: string | null;
  created_at: string;
  role: string;
}

/**
 * Zwraca aktywna organizacje zalogowanego uzytkownika lub null,
 * jesli uzytkownik nie nalezy do zadnej organizacji.
 */
export async function getActiveOrgForUser(userId: string): Promise<ActiveOrg | null> {
  const supabase = await createSupabaseServerClient();

  const { data: membership } = await supabase
    .from("org_memberships")
    .select("org_id, role")
    .eq("user_id", userId)
    .order("joined_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!membership) return null;

  const { data: org } = await supabase
    .from("organizations")
    .select("id, slug, name, plan, seats_purchased, data_residency, domain, created_at")
    .eq("id", membership.org_id)
    .single();

  if (!org) return null;

  return { ...org, role: membership.role };
}
