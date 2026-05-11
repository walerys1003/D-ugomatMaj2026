import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";
import { SessionsClient } from "./sessions-client";

export const metadata: Metadata = {
  title: "Aktywne sesje · Ustawienia",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function SessionsPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/sign-in?next=/panel/ustawienia/sesje");

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <header>
        <h1 className="text-fluid-2xl font-bold text-iron-900 dark:text-white">Aktywne sesje</h1>
        <p className="mt-1 text-fluid-base text-iron-600 dark:text-iron-300">
          Przeglądaj zalogowane urządzenia i wyloguj zdalnie te, których nie rozpoznajesz.
        </p>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>Lista urządzeń</CardTitle>
          <CardDescription>Sesje wygasają automatycznie po 30 dniach bezczynności.</CardDescription>
        </CardHeader>
        <CardContent>
          <SessionsClient />
        </CardContent>
      </Card>
    </div>
  );
}
