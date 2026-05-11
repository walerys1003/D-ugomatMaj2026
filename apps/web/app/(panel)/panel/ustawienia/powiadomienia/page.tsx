import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";
import { NotificationsForm } from "./notifications-form";

export const metadata: Metadata = {
  title: "Powiadomienia · Ustawienia",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function NotificationsSettingsPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/sign-in?next=/panel/ustawienia/powiadomienia");

  const { data: prefs } = await supabase
    .from("notification_preferences")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <header>
        <h1 className="text-fluid-2xl font-bold text-iron-900 dark:text-white">Powiadomienia</h1>
        <p className="mt-1 text-fluid-base text-iron-600 dark:text-iron-300">
          Wybierz kanały i kategorie. Wiadomości krytyczne (np. terminy procesowe) są wysyłane zawsze.
        </p>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>Preferencje</CardTitle>
          <CardDescription>Zmiany zapisują się automatycznie.</CardDescription>
        </CardHeader>
        <CardContent>
          <NotificationsForm
            initial={{
              email_deadlines: prefs?.email_deadlines ?? true,
              email_case_updates: prefs?.email_case_updates ?? true,
              email_payments: prefs?.email_payments ?? true,
              email_marketing: prefs?.email_marketing ?? false,
              sms_deadlines: prefs?.sms_deadlines ?? false,
              sms_critical: prefs?.sms_critical ?? true,
              push_enabled: prefs?.push_enabled ?? true,
              push_quiet_start: prefs?.push_quiet_start ?? "22:00",
              push_quiet_end: prefs?.push_quiet_end ?? "07:00",
              digest_frequency: prefs?.digest_frequency ?? "daily",
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
