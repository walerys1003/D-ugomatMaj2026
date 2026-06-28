/**
 * Tier 25 — Admin RBAC Policies UI.
 * Edytor polityk fine-grained (resource/action patterns + warunki + role).
 */
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";
import { RbacPoliciesClient } from "@/components/admin/compliance/rbac-policies-client";

export const metadata: Metadata = {
  title: "RBAC — polityki fine-grained",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function RbacPage() {
  const sb = await createSupabaseServerClient();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) redirect("/sign-in?next=/admin/rbac");

  // Audyt 2026-06-27 (iter. 37): zapytanie zwraca realne kolumny tabeli
  // `rbac_policies` (actions[]/resources[]/subjects/conditions), a komponent
  // kliencki oczekuje kształtu Policy (resource_pattern/action_pattern/roles/
  // condition). Mapujemy zamiast `as any`.
  const { data: policiesRaw } = await sb
    .from("rbac_policies")
    .select("*")
    .order("priority", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(200);
  const policies = (policiesRaw ?? []).map((p) => ({
    id: p.id,
    name: p.name,
    effect: p.effect,
    resource_pattern: (p.resources ?? []).join(", "),
    action_pattern: (p.actions ?? []).join(", "),
    roles: Array.isArray(p.subjects) ? (p.subjects as string[]) : [],
    condition: (p.conditions ?? null) as Record<string, unknown> | null,
    priority: p.priority,
    enabled: p.enabled,
    created_at: p.created_at,
  }));

  return (
    <main className="container py-8 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">RBAC fine-grained</h1>
          <p className="text-ink-600 dark:text-ink-300">
            Polityki dziedziczenia ról (owner › admin › member › viewer) + ABAC.
          </p>
        </div>
        <Link href="/admin" className="text-dlugomat-600 hover:underline text-sm">
          ← Panel admina
        </Link>
      </header>

      <RbacPoliciesClient initialPolicies={policies} />
    </main>
  );
}
