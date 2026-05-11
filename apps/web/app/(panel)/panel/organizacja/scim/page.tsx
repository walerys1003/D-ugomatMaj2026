import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "SCIM | Organizacja | Długomat" };

interface ScimConfig {
  enabled: boolean;
  tenant_url?: string;
  bearer_token_preview?: string;
  last_sync_at?: string;
  users_synced?: number;
}

async function fetchScim(): Promise<ScimConfig> {
  try {
    const res = await fetch("/api/orgs/scim", { cache: "no-store" });
    if (!res.ok) return { enabled: false };
    return (await res.json()) as ScimConfig;
  } catch {
    return { enabled: false };
  }
}

export default async function ScimPage() {
  const scim = await fetchScim();

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
      <div>
        <Link href="/panel/organizacja" className="text-xs text-iron-500 hover:text-iron-700">
          ← Organizacja
        </Link>
        <h1 className="font-display text-3xl font-semibold text-iron-900 dark:text-iron-50 mt-2">
          SCIM Provisioning
        </h1>
        <p className="text-sm text-iron-500 mt-1">
          Automatyczna synchronizacja użytkowników z Twojego IdP (Okta, Azure AD, OneLogin)
          poprzez standard SCIM 2.0.
        </p>
      </div>

      <Card elevation="subtle">
        <CardHeader>
          <CardTitle>Status synchronizacji</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                scim.enabled ? "bg-accent-600" : "bg-iron-400"
              }`}
            />
            <span className="text-iron-900 dark:text-iron-50">
              {scim.enabled ? "Aktywne" : "Nieaktywne"}
            </span>
          </div>
          {scim.last_sync_at && (
            <div className="text-iron-500">
              Ostatnia synchronizacja:{" "}
              {new Date(scim.last_sync_at).toLocaleString("pl-PL")}
            </div>
          )}
          {typeof scim.users_synced === "number" && (
            <div className="text-iron-500">
              Zsynchronizowanych użytkowników: {scim.users_synced}
            </div>
          )}
        </CardContent>
      </Card>

      <Card elevation="subtle">
        <CardHeader>
          <CardTitle>Dane do konfiguracji IdP</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div>
            <div className="text-xs uppercase tracking-wider text-iron-500 mb-1">Tenant URL</div>
            <code className="block font-mono text-xs px-3 py-2 rounded-md bg-iron-100 dark:bg-iron-800 break-all">
              {scim.tenant_url ?? "https://app.dlugomat.pl/api/scim/v2"}
            </code>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider text-iron-500 mb-1">Bearer token</div>
            <code className="block font-mono text-xs px-3 py-2 rounded-md bg-iron-100 dark:bg-iron-800">
              {scim.bearer_token_preview ?? "•••••••••• (wygeneruj nowy)"}
            </code>
          </div>
          <form method="post" action="/api/orgs/scim/regenerate-token">
            <Button type="submit" variant="secondary">
              Wygeneruj nowy token
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card elevation="subtle">
        <CardHeader>
          <CardTitle>Wspierane operacje SCIM 2.0</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-1 text-sm text-iron-700 dark:text-iron-300 list-disc list-inside">
            <li>Tworzenie i aktualizacja użytkowników (Users)</li>
            <li>Dezaktywacja (active = false) i kasowanie</li>
            <li>Mapowanie ról przez grupy (Groups → Role mapping)</li>
            <li>Filtrowanie wg <code className="text-xs">userName</code> i <code className="text-xs">emails.value</code></li>
          </ul>
        </CardContent>
      </Card>
    </main>
  );
}
