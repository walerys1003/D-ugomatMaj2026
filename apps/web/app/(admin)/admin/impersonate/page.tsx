/**
 * Tier 25 — Admin Impersonation UI.
 * Lista aktywnych sesji + form do startu nowej.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";
import { ImpersonationClient } from "@/components/admin/impersonate/impersonation-client";

export const metadata: Metadata = {
  title: "Impersonacja użytkowników",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function ImpersonatePage() {
  const sb = await createSupabaseServerClient();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) redirect("/sign-in?next=/admin/impersonate");

  // Audyt 2026-06-27 (iter. 38): REALNY BUG — kolumna `ended_at` NIE ISTNIEJE
  // w `impersonation_sessions` (realna kolumna kończąca sesję to `revoked_at`).
  // `as any` maskował błąd → zapytanie padało w runtime. Wybieramy realne
  // kolumny i mapujemy na kształt Session oczekiwany przez komponent.
  const { data: sessionsRaw } = await sb
    .from("impersonation_sessions")
    .select("id, target_user_id, scope, started_at, expires_at, revoked_at, reason")
    .is("revoked_at", null)
    .order("started_at", { ascending: false })
    .limit(50);
  const sessions = (sessionsRaw ?? []).map((s) => ({
    id: s.id,
    target_user_id: s.target_user_id,
    scope: s.scope,
    started_at: s.started_at,
    expires_at: s.expires_at,
    ended_at: s.revoked_at,
    reason: s.reason,
  }));

  return (
    <main className="container py-8 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Impersonacja użytkowników</h1>
          <p className="text-ink-600 dark:text-ink-300">
            Tymczasowe sesje support — wszystkie działania są logowane do{" "}
            <code>admin_audit_log</code>.
          </p>
        </div>
        <Link href="/admin" className="text-dlugomat-600 hover:underline text-sm">
          ← Panel admina
        </Link>
      </header>

      <ImpersonationClient initialSessions={sessions} />
    </main>
  );
}
