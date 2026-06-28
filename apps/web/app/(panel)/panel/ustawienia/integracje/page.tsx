import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Link2 } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";
import { IntegrationsClient } from "./integrations-client";

export const metadata: Metadata = {
  title: "Integracje · Ustawienia",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export interface IntegrationProvider {
  id: string;
  name: string;
  description: string;
  icon_url?: string;
  oauth_path: string;
  scopes_label: string;
}

const PROVIDERS: IntegrationProvider[] = [
  {
    id: "google",
    name: "Google",
    description: "Kalendarz, dysk, Gmail. Synchronizuj terminy procesowe z Google Calendar.",
    oauth_path: "/api/integrations/oauth/google/start",
    scopes_label: "calendar.events · drive.file · gmail.send",
  },
  {
    id: "microsoft",
    name: "Microsoft 365",
    description: "Outlook Calendar + Mail + OneDrive. Idempotentny upsert wydarzeń.",
    oauth_path: "/api/integrations/oauth/microsoft/start",
    scopes_label: "Calendars.ReadWrite · Mail.Send · Files.ReadWrite",
  },
  {
    id: "slack",
    name: "Slack",
    description: "Powiadomienia o nowych dokumentach i terminach do wybranego kanału.",
    oauth_path: "/api/integrations/oauth/slack/start",
    scopes_label: "chat:write · channels:read",
  },
  {
    id: "notion",
    name: "Notion",
    description: "Eksport notatek z agentów AI do Twojej bazy Notion.",
    oauth_path: "/api/integrations/oauth/notion/start",
    scopes_label: "pages.write · databases.read",
  },
  {
    id: "fakturownia",
    name: "Fakturownia",
    description: "Automatyczne fakturowanie usług prawnych z planu pay-per-case.",
    oauth_path: "/api/integrations/accounting/sync?provider=fakturownia",
    scopes_label: "invoices.write",
  },
  {
    id: "zapier",
    name: "Zapier",
    description: "Triggers / actions w 5000+ aplikacjach. Wymaga klucza API.",
    oauth_path: "/api/integrations/zapier/manifest",
    scopes_label: "via API key",
  },
];

export default async function IntegrationsSettingsPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in?next=/panel/ustawienia/integracje");

  const { data: creds } = await supabase
    .from("oauth_credentials")
    .select("provider, scope, expires_at, created_at")
    .eq("user_id", user.id);

  const connectedMap: Record<
    string,
    { scope?: string; expires_at?: string; created_at: string }
  > = {};
  for (const c of creds ?? []) {
    connectedMap[c.provider] = {
      scope: c.scope ?? undefined,
      expires_at: c.expires_at ?? undefined,
      created_at: c.created_at,
    };
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <header className="flex items-center gap-3">
        <Link2 className="h-7 w-7 text-dlugomat-600" />
        <div>
          <h1 className="text-fluid-2xl font-bold text-ink-900 dark:text-white">Integracje</h1>
          <p className="text-fluid-base text-ink-600 dark:text-ink-300">
            Połącz konto Długomat z zewnętrznymi narzędziami przez OAuth.
          </p>
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Dostępne integracje</CardTitle>
          <CardDescription>
            Wszystkie połączenia można w każdej chwili rozłączyć — dane pozostaną w Twoim koncie Długomat.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <IntegrationsClient providers={PROVIDERS} initialConnected={connectedMap} />
        </CardContent>
      </Card>
    </div>
  );
}
