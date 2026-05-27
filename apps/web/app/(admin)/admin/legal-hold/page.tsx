/**
 * Tier 25 — Admin Legal Hold + e-Discovery UI.
 *  - lista aktywnych legal holds
 *  - form do nałożenia/zwolnienia holda
 *  - panel uruchamiania e-discovery query (slow query, full text + custody chain)
 */
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/db/supabase-server";
import { LegalHoldClient } from "@/components/admin/compliance/legal-hold-client";

export const metadata: Metadata = {
  title: "Legal Hold & e-Discovery",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function LegalHoldPage() {
  const sb = await createServerSupabase();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) redirect("/sign-in?next=/admin/legal-hold");

  const [{ data: holds }, { data: queries }] = await Promise.all([
    sb
      .from("legal_holds")
      .select("*")
      .is("released_at", null)
      .order("imposed_at", { ascending: false })
      .limit(50),
    sb
      .from("ediscovery_queries")
      .select("id, requested_by, query, status, items_count, created_at, completed_at")
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

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

      <LegalHoldClient initialHolds={(holds ?? []) as any} initialQueries={(queries ?? []) as any} />
    </main>
  );
}
