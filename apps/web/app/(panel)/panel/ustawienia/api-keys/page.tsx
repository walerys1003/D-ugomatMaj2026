import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";
import { ApiKeysClient } from "./api-keys-client";

export const metadata: Metadata = {
  title: "Klucze API · Ustawienia",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function ApiKeysPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in?next=/panel/ustawienia/api-keys");

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <header>
        <h1 className="text-fluid-2xl font-bold text-ink-900 dark:text-white">Klucze API</h1>
        <p className="mt-1 text-fluid-base text-ink-600 dark:text-ink-300">
          Wygeneruj tokeny dla SDK, Zapier, Make, własnych integracji.
        </p>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>Twoje klucze</CardTitle>
          <CardDescription>
            Token jest pokazywany tylko raz w momencie tworzenia. Zapisz go w bezpiecznym miejscu.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ApiKeysClient />
        </CardContent>
      </Card>
    </div>
  );
}
