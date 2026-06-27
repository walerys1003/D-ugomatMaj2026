import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Materiały | Partner | Długomat" };

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://dlugomat.pl";

export default async function MaterialyPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/logowanie?next=/panel/partner/materialy");

  const { data: account } = await supabase
    .from("affiliate_accounts")
    .select("slug, display_name, status")
    .eq("user_id", user.id)
    .maybeSingle();

  const referralLink = account ? `${SITE_URL}/?ref=${account.slug}` : null;

  return (
    <main className="container mx-auto max-w-6xl space-y-6 px-4 py-8">
      <div>
        <Link href="/panel/partner" className="text-xs text-ink-500 hover:text-ink-700">
          ← Panel partnera
        </Link>
        <h1 className="mt-2 font-display text-3xl font-semibold text-ink-900 dark:text-ink-50">
          Materiały marketingowe
        </h1>
        <p className="mt-1 text-sm text-ink-500">
          Twój link partnerski i materiały do promocji Długomat.
        </p>
      </div>

      {!account ? (
        <EmptyState
          title="Brak konta partnerskiego"
          description="Aby otrzymać link partnerski i materiały promocyjne, dołącz najpierw do programu partnerskiego."
        />
      ) : (
        <>
          <Card elevation="pop">
            <CardHeader>
              <CardTitle>Twój link partnerski</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <code className="block break-all rounded-md bg-ink-100 px-3 py-2 font-mono text-xs dark:bg-ink-800">
                {referralLink}
              </code>
              <div className="flex flex-wrap gap-2">
                <Link href="/panel/partner/pipeline">
                  <Button variant="secondary">Zobacz pipeline</Button>
                </Link>
                <Link href="/panel/partner/raporty">
                  <Button variant="ghost">Raporty</Button>
                </Link>
              </div>
              <p className="text-xs text-ink-500">
                Każda rejestracja przez ten link jest atrybuowana do Twojego konta
                partnerskiego ({account.display_name}).
              </p>
            </CardContent>
          </Card>

          <Card elevation="subtle">
            <CardHeader>
              <CardTitle>Materiały do pobrania</CardTitle>
            </CardHeader>
            <CardContent>
              <EmptyState
                title="Brak materiałów"
                description="Pakiet materiałów promocyjnych (banery, prezentacje, szablony e-mail) nie został jeszcze udostępniony. W międzyczasie możesz korzystać z linku partnerskiego powyżej."
              />
            </CardContent>
          </Card>
        </>
      )}
    </main>
  );
}
