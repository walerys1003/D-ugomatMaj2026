/**
 * Tier 25 — Admin Secret Vault UI.
 * AES-256-GCM secrets z PBKDF2 600k iter — odsłaniane tylko na żądanie.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";
import { SecretsClient } from "@/components/admin/compliance/secrets-client";

export const metadata: Metadata = {
  title: "Secret Vault",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function SecretsPage() {
  const sb = await createSupabaseServerClient();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) redirect("/sign-in?next=/admin/secrets");

  // Audyt 2026-06-27 (iter. 37): REALNY BUG — poprzednie zapytanie wybierało
  // kolumny `name`, `rotation_period_days`, `last_rotated_at`, `updated_at`,
  // które NIE ISTNIEJĄ w tabeli `secret_vault` (migracja 20260526000000).
  // Realne kolumny: `key`, `rotation_due_at`, `last_accessed_at`. `as any`
  // maskował błąd → strona padała w runtime. Wybieramy realne kolumny i
  // mapujemy je na kształt SecretMeta oczekiwany przez klienta.
  const { data: secretsRaw } = await sb
    .from("secret_vault")
    .select("id, key, description, rotation_due_at, last_accessed_at, created_at")
    .order("key");
  const secrets = (secretsRaw ?? []).map((s) => ({
    id: s.id,
    name: s.key,
    description: s.description,
    rotation_period_days: null,
    last_rotated_at: s.rotation_due_at,
    created_at: s.created_at,
    updated_at: s.created_at,
  }));

  return (
    <main className="container py-8 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Secret Vault</h1>
          <p className="text-ink-600 dark:text-ink-300">
            AES-256-GCM envelope (PBKDF2 600k iter). Wartości pokazywane tylko po jawnym
            żądaniu — każde odsłonięcie logowane do audit chain.
          </p>
        </div>
        <Link href="/admin" className="text-dlugomat-600 hover:underline text-sm">
          ← Panel admina
        </Link>
      </header>

      <SecretsClient initialSecrets={secrets} />
    </main>
  );
}
