/**
 * Tier 25 — Admin Legal Hold + e-Discovery UI.
 *  - lista aktywnych legal holds
 *  - form do nałożenia/zwolnienia holda
 *  - panel uruchamiania e-discovery query (slow query, full text + custody chain)
 */
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";
import { LegalHoldClient } from "@/components/admin/compliance/legal-hold-client";

export const metadata: Metadata = {
  title: "Legal Hold & e-Discovery",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function LegalHoldPage() {
  const sb = await createSupabaseServerClient();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) redirect("/sign-in?next=/admin/legal-hold");

  // Audyt 2026-06-27 (iter. 38): komponent oczekuje kształtu LegalHold
  // (resource_type/resource_id/expires_at/reason), a tabela `legal_holds` ma
  // case_reference/description/resource_types[]/active/release_reason.
  // Mapujemy zamiast `as any`.
  const [{ data: holdsRaw }, { data: queriesRaw }] = await Promise.all([
    sb
      .from("legal_holds")
      .select("*")
      .is("released_at", null)
      .order("imposed_at", { ascending: false })
      .limit(50),
    sb
      .from("ediscovery_queries")
      // REALNY BUG: strona pytała o kolumny query/items_count/created_at, które
      // NIE istnieją w tabeli `ediscovery_queries`. Prawdziwe kolumny to
      // filters (jsonb) / result_count / requested_at. Maskowane przez `as any`.
      .select(
        "id, requested_by, filters, status, result_count, requested_at, completed_at",
      )
      .order("requested_at", { ascending: false })
      .limit(20),
  ]);
  const holds = (holdsRaw ?? []).map((h) => ({
    id: h.id,
    resource_type: (h.resource_types ?? []).join(", "),
    resource_id: h.case_reference,
    imposed_by: h.imposed_by,
    imposed_at: h.imposed_at,
    expires_at: null as string | null,
    reason: h.description,
    released_at: h.released_at,
  }));
  const queries = (queriesRaw ?? []).map((q) => ({
    id: q.id,
    requested_by: q.requested_by,
    // filters (jsonb) → query (kształt oczekiwany przez komponent)
    query: (q.filters ?? {}) as Record<string, unknown>,
    // DB używa "pending"; komponent oczekuje "queued" — mapujemy.
    status: (q.status === "pending" ? "queued" : q.status) as
      | "queued"
      | "running"
      | "completed"
      | "failed",
    items_count: q.result_count,
    created_at: q.requested_at,
    completed_at: q.completed_at,
  }));

  return (
    <main className="container py-8 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Legal Hold &amp; e-Discovery</h1>
          <p className="text-ink-600 dark:text-ink-300">
            Tamper-evident wstrzymanie usuwania danych + zapytania śledcze z chain-of-custody.
          </p>
        </div>
        <Link href="/admin" className="text-dlugomat-600 hover:underline text-sm">
          ← Panel admina
        </Link>
      </header>

      <LegalHoldClient initialHolds={holds} initialQueries={queries} />
    </main>
  );
}
