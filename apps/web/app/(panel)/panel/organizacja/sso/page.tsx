import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "SSO | Organizacja | Długomat" };

interface SsoConfig {
  enabled: boolean;
  protocol: "saml" | "oidc" | null;
  idp_metadata_url?: string;
  entity_id?: string;
  acs_url?: string;
  configured_at?: string;
}

async function fetchSso(): Promise<SsoConfig | null> {
  try {
    const res = await fetch("/api/orgs/sso", { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as SsoConfig;
  } catch {
    return null;
  }
}

export default async function SsoPage() {
  const sso = (await fetchSso()) ?? { enabled: false, protocol: null };

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
      <div>
        <Link href="/panel/organizacja" className="text-xs text-iron-500 hover:text-iron-700">
          ← Organizacja
        </Link>
        <h1 className="font-display text-3xl font-semibold text-iron-900 dark:text-iron-50 mt-2">
          Single Sign-On
        </h1>
        <p className="text-sm text-iron-500 mt-1">
          Logowanie jednokrotne przez Twojego dostawcę tożsamości (Okta, Azure AD, Google Workspace).
        </p>
      </div>

      <Card elevation="subtle">
        <CardHeader>
          <CardTitle>Status</CardTitle>
        </CardHeader>
        <CardContent>
          {sso.enabled ? (
            <div className="flex items-center gap-2 text-sm">
              <span className="w-2 h-2 rounded-full bg-accent-600" />
              <span className="text-iron-900 dark:text-iron-50">
                SSO aktywne ({sso.protocol?.toUpperCase()})
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm">
              <span className="w-2 h-2 rounded-full bg-iron-400" />
              <span className="text-iron-600 dark:text-iron-400">SSO nieskonfigurowane</span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card elevation="subtle">
        <CardHeader>
          <CardTitle>Konfiguracja SAML 2.0</CardTitle>
        </CardHeader>
        <CardContent>
          <form method="post" action="/api/orgs/sso" className="space-y-4">
            <input type="hidden" name="protocol" value="saml" />
            <Field
              label="Adres metadanych IdP (XML)"
              name="idp_metadata_url"
              placeholder="https://idp.example.com/metadata.xml"
              defaultValue={sso.idp_metadata_url}
            />
            <Field
              label="Entity ID (SP)"
              name="entity_id"
              defaultValue={sso.entity_id ?? "urn:dlugomat:sp"}
              readOnly
            />
            <Field
              label="ACS URL (Assertion Consumer Service)"
              name="acs_url"
              defaultValue={sso.acs_url ?? "https://app.dlugomat.pl/api/auth/saml/acs"}
              readOnly
            />
            <Button type="submit" variant="primary">
              Zapisz konfigurację
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card elevation="subtle">
        <CardHeader>
          <CardTitle>Konfiguracja OIDC</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-iron-600 dark:text-iron-400">
            Alternatywnie skonfiguruj OpenID Connect, jeśli Twój IdP go preferuje.
          </p>
          <Link
            href="/dokumentacja/sso-oidc"
            className="text-sm text-accent-700 hover:text-accent-800 mt-2 inline-block"
          >
            Przeczytaj dokumentację OIDC →
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}

function Field({
  label,
  name,
  placeholder,
  defaultValue,
  readOnly,
}: {
  label: string;
  name: string;
  placeholder?: string;
  defaultValue?: string;
  readOnly?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-iron-700 dark:text-iron-300 mb-1.5 block">
        {label}
      </span>
      <input
        type="text"
        name={name}
        placeholder={placeholder}
        defaultValue={defaultValue}
        readOnly={readOnly}
        className={`w-full rounded-lg border border-iron-300 dark:border-iron-700 px-3 py-2 focus:outline-none focus-visible:shadow-shield-focus ${
          readOnly
            ? "bg-iron-50 dark:bg-iron-900 text-iron-500 font-mono text-xs"
            : "bg-white dark:bg-iron-900"
        }`}
      />
    </label>
  );
}
