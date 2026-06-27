import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { FileSignature } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Umowy · Partner · Długomat",
  description: "Dokumenty programu partnerskiego: umowa ramowa, DPA, regulamin prowizji.",
};

export default async function PartnerUmowyPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/logowanie?next=/panel/partner/umowy");

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8">
      <header className="flex flex-col gap-2">
        <Link href="/panel/partner" className="text-xs text-ink-500 hover:text-ink-700">
          ← Panel partnera
        </Link>
        <p className="text-fluid-sm font-semibold uppercase tracking-wider text-dlugomat-600">
          Partner · Dokumenty
        </p>
        <h1 className="text-fluid-3xl font-bold tracking-tight text-dlugomat-900 dark:text-white">
          Umowy
        </h1>
        <p className="max-w-2xl text-fluid-base text-ink-600 dark:text-ink-300">
          Dokumenty programu partnerskiego: umowa ramowa, DPA, regulamin prowizji.
        </p>
      </header>

      <Card elevation="subtle">
        <CardHeader>
          <span
            aria-hidden
            className="grid size-9 place-items-center rounded-lg bg-dlugomat-100 text-dlugomat-700 dark:bg-dlugomat-850 dark:text-dlugomat-300"
          >
            <FileSignature className="size-5" />
          </span>
          <CardTitle className="mt-2 text-fluid-lg">Dokumenty programu</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            title="Brak dokumentów"
            description="Nie udostępniono jeszcze żadnych dokumentów umownych dla Twojego konta partnerskiego. Dokumenty pojawią się tutaj po ich wystawieniu przez administratora programu."
          />
        </CardContent>
      </Card>
    </div>
  );
}
