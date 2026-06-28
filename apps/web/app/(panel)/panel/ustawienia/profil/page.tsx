import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";
import { ProfileForm } from "./profile-form";

export const metadata: Metadata = {
  title: "Profil · Ustawienia",
  robots: { index: false, follow: false },
};

export default async function ProfileSettingsPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in?next=/panel/ustawienia/profil");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, phone, locale, marketing_opt_in")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <header>
        <h1 className="text-fluid-2xl font-bold text-ink-900 dark:text-white">Profil</h1>
        <p className="mt-1 text-fluid-base text-ink-600 dark:text-ink-300">
          Dane wyświetlane w pismach i na fakturach.
        </p>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>Dane osobiste</CardTitle>
          <CardDescription>
            Zmiana adresu email wymaga ponownej weryfikacji — użyj zakładki bezpieczeństwo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm
            email={user.email ?? ""}
            initialFullName={profile?.full_name ?? ""}
            initialPhone={profile?.phone ?? ""}
            initialLocale={profile?.locale ?? "pl"}
            initialMarketingOptIn={!!profile?.marketing_opt_in}
          />
        </CardContent>
      </Card>
    </div>
  );
}
