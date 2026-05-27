/**
 * Tier 25 — Admin Secret Vault UI.
 * AES-256-GCM secrets z PBKDF2 600k iter — odsłaniane tylko na żądanie.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/db/supabase-server";
import { SecretsClient } from "@/components/admin/compliance/secrets-client";

export const metadata: Metadata = {
  title: "Secret Vault",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function SecretsPage() {
  const sb = await createServerSupabase();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) redirect("/sign-in?next=/admin/secrets");

  // Lista bez wartości (tylko metadane)
  const { data: secrets } = await sb
    .from("secret_vault")
    .select("id, name, description, rotation_period_days, last_rotated_at, created_at, updated_at")
    .order("name");

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

      <SecretsClient initialSecrets={(secrets ?? []) as any} />
    </main>
  );
}
