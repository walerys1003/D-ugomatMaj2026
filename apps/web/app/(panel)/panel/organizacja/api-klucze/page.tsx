import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { EyeOff, Key, Plus, ShieldAlert } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";
import { getActiveOrgForUser } from "@/lib/orgs/server";

export const metadata: Metadata = {
  title: "Klucze API · Organizacja · Długomat",
};

export const dynamic = "force-dynamic";

type ApiKey = {
  id: string;
  name: string;
  prefix: string;
  scopes: string[];
  created_at: string;
  last_used_at: string | null;
  revoked_at: string | null;
  rate_limit: number;
};

export default async function ApiKluczePage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in?next=/panel/organizacja/api-klucze");

  const org = await getActiveOrgForUser(user.id);

  let KEYS: ApiKey[] = [];
  if (org) {
    const { data: rows } = await supabase
      .from("api_keys")
      .select(
        "id, name, key_prefix, scopes, rate_limit_per_minute, revoked_at, last_used_at, created_at",
      )
      .eq("organization_id", org.id)
      .order("created_at", { ascending: false });
    KEYS = (rows ?? []).map((k) => ({
      id: k.id,
      name: k.name,
      prefix: k.key_prefix,
      scopes: Array.isArray(k.scopes) ? k.scopes : [],
      created_at: k.created_at,
      last_used_at: k.last_used_at,
      revoked_at: k.revoked_at,
      rate_limit: k.rate_limit_per_minute,
    }));
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-fluid-sm font-semibold uppercase tracking-wider text-dlugomat-600">
            Organizacja
          </p>
          <h1 className="text-fluid-3xl font-bold tracking-tight text-dlugomat-900 dark:text-white">
            Klucze API
          </h1>
          <p className="mt-1 max-w-2xl text-fluid-base text-ink-600 dark:text-ink-300">
            Bearer tokens dla integracji serwer-do-serwera. Klucz pokażemy
            tylko raz w chwili utworzenia — zapisz go w sejfie sekretów.
          </p>
        </div>
        <Button>
          <Plus className="size-4" />
          Wygeneruj klucz
        </Button>
      </header>

      <Card elevation="subtle" urgency="warning">
        <CardHeader>
          <div className="flex items-start gap-3">
            <span
              aria-hidden
              className="grid size-9 shrink-0 place-items-center rounded-lg bg-warn-100 text-warn-600 dark:bg-warn-500/15"
            >
              <ShieldAlert className="size-5" />
            </span>
            <div>
              <CardTitle className="text-fluid-base">
                Bezpieczeństwo kluczy
              </CardTitle>
              <CardDescription>
                Klucze są aktywne natychmiast po utworzeniu. Trzymaj je w
                Vaulcie / Secrets Manager. Rotacja co 90 dni rekomendowana.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {!org ? (
        <EmptyState
          title="Brak organizacji"
          description="Klucze API sa dostepne w ramach planu organizacyjnego. Nie nalezysz jeszcze do zadnej organizacji."
        />
      ) : KEYS.length === 0 ? (
        <EmptyState
          title="Brak kluczy API"
          description="Nie utworzono jeszcze zadnego klucza API dla tej organizacji."
        />
      ) : (
      <Card elevation="subtle" className="overflow-hidden">
        <CardContent className="p-0">
          <table className="w-full text-fluid-sm">
            <thead className="border-b border-ink-200 bg-ink-50/60 dark:border-dlugomat-800 dark:bg-dlugomat-900/40">
              <tr className="text-left text-ink-600 dark:text-ink-300">
                <th className="px-5 py-3 font-semibold">Nazwa</th>
                <th className="px-5 py-3 font-semibold">Klucz</th>
                <th className="px-5 py-3 font-semibold">Uprawnienia</th>
                <th className="px-5 py-3 font-semibold">Ostatnio użyty</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100 dark:divide-dlugomat-800">
              {KEYS.map((k) => (
                <tr key={k.id}>
                  <td className="px-5 py-3">
                    <span className="flex items-center gap-2">
                      <Key
                        aria-hidden
                        className="size-4 text-dlugomat-600"
                      />
                      <span className="font-semibold text-ink-900 dark:text-ink-50">
                        {k.name}
                      </span>
                      {k.revoked_at ? (
                        <Badge tone="danger">odwołany</Badge>
                      ) : null}
                    </span>
                    <span className="block text-fluid-xs text-ink-500">
                      Utworzony {new Date(k.created_at).toLocaleDateString("pl-PL")} · limit {k.rate_limit}/min
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <code className="flex items-center gap-1 rounded bg-ink-100 px-2 py-1 font-mono text-fluid-xs text-ink-800 dark:bg-dlugomat-900 dark:text-ink-100">
                      {k.prefix}_••••••••
                      <EyeOff
                        aria-hidden
                        className="size-3 text-ink-400"
                      />
                    </code>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex flex-wrap gap-1">
                      {k.scopes.map((s) => (
                        <Badge key={s} tone="info">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-fluid-xs text-ink-500">
                    {k.last_used_at
                      ? new Date(k.last_used_at).toLocaleString("pl-PL")
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
      )}
    </div>
  );
}
