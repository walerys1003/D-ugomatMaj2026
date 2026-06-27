import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";
import { SecurityClient } from "./security-client";

export const metadata: Metadata = {
  title: "Bezpieczeństwo · Ustawienia",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function SecuritySettingsPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/sign-in?next=/panel/ustawienia/bezpieczenstwo");

  const { data: mfa } = await supabase
    .from("mfa_secrets")
    .select("verified, created_at")
    .eq("user_id", user.id)
    .maybeSingle();

  // REALNY BUG: strona pytała o kolumnę `device_name`, która NIE istnieje w
  // tabeli `webauthn_credentials`. Prawdziwa kolumna to `label`. Maskowane przez
  // `as any`. Pobieramy prawdziwą kolumnę i mapujemy do kształtu komponentu.
  const { data: webauthnRaw } = await supabase
    .from("webauthn_credentials")
    .select("id, label, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  const webauthn = (webauthnRaw ?? []).map((c) => ({
    id: c.id,
    device_name: c.label,
    created_at: c.created_at,
  }));

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <header className="flex items-center gap-3">
        <ShieldCheck className="h-7 w-7 text-dlugomat-600" />
        <div>
          <h1 className="text-fluid-2xl font-bold text-ink-900 dark:text-white">Bezpieczeństwo</h1>
          <p className="text-fluid-base text-ink-600 dark:text-ink-300">
            Druga warstwa ochrony Twojego konta.
          </p>
        </div>
      </header>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-3">
          <div>
            <CardTitle>Uwierzytelnianie dwuskładnikowe (TOTP)</CardTitle>
            <CardDescription>
              Aplikacje typu Google Authenticator / Authy / 1Password.
            </CardDescription>
          </div>
          <Badge tone={mfa?.verified ? "success" : "warning"} withDot>
            {mfa?.verified ? "Aktywne" : "Nieaktywne"}
          </Badge>
        </CardHeader>
        <CardContent>
          <SecurityClient
            mfaEnabled={!!mfa?.verified}
            webauthnCredentials={webauthn}
          />
        </CardContent>
      </Card>
    </div>
  );
}
