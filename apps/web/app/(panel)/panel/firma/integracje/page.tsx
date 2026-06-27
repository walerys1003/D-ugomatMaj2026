import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";
import { getActiveOrgForUser } from "@/lib/orgs/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Integracje API - panel firmy | Dlugomat",
  description: "Klucze API i integracje organizacji.",
};

function fmtDate(value: string | null): string {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function fmtDay(value: string | null): string {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("pl-PL", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default async function FirmaIntegracjePage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/logowanie?next=/panel/firma/integracje");
  }

  const org = await getActiveOrgForUser(user.id);

  let apiKeys: {
    id: string;
    name: string;
    key_prefix: string;
    scopes: string[];
    last_used_at: string | null;
    revoked_at: string | null;
    created_at: string;
  }[] = [];

  if (org) {
    const { data: rows } = await supabase
      .from("api_keys")
      .select("id, name, key_prefix, scopes, last_used_at, revoked_at, created_at")
      .eq("organization_id", org.id)
      .order("created_at", { ascending: false });
    apiKeys = (rows ?? []).map((k) => ({
      id: k.id,
      name: k.name,
      key_prefix: k.key_prefix,
      scopes: Array.isArray(k.scopes) ? k.scopes : [],
      last_used_at: k.last_used_at,
      revoked_at: k.revoked_at,
      created_at: k.created_at,
    }));
  }

  const activeKeys = apiKeys.filter((k) => !k.revoked_at);

  return (
    <div className="space-y-8 px-6 py-8 lg:px-10">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <Badge tone="info" withDot>
            Panel firmy - integracje
          </Badge>
          <h1 className="font-display text-3xl text-dlugomat-900">Integracje API</h1>
          <p className="max-w-2xl text-sm text-dlugomat-600">
            Zarzadzaj kluczami API organizacji do integracji serwer-do-serwera. Pelna konfiguracja kluczy
            dostepna jest w sekcji organizacji.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" size="md" asChild>
            <a href="/dla-firm/api-dokumentacja">Dokumentacja API</a>
          </Button>
          <Button variant="primary" size="md" asChild>
            <a href="/panel/organizacja/api-klucze">Zarzadzaj kluczami</a>
          </Button>
        </div>
      </header>

      {!org ? (
        <EmptyState
          title="Brak organizacji"
          description="Klucze API sa dostepne dla organizacji firmowych. Dolacz do organizacji lub utworz wlasna."
        />
      ) : (
        <>
          <section aria-label="Statystyki integracji" className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card elevation="subtle" className="p-5">
              <p className="text-xs uppercase tracking-wide text-dlugomat-500">Aktywne klucze API</p>
              <p className="mt-2 font-display text-2xl text-dlugomat-900">{activeKeys.length}</p>
            </Card>
            <Card elevation="subtle" className="p-5">
              <p className="text-xs uppercase tracking-wide text-dlugomat-500">Klucze lacznie</p>
              <p className="mt-2 font-display text-2xl text-dlugomat-900">{apiKeys.length}</p>
            </Card>
            <Card elevation="subtle" className="p-5">
              <p className="text-xs uppercase tracking-wide text-dlugomat-500">Uniewaznione</p>
              <p className="mt-2 font-display text-2xl text-dlugomat-900">
                {apiKeys.length - activeKeys.length}
              </p>
            </Card>
          </section>

          <section aria-label="Klucze API">
            <Card elevation="subtle" className="p-6">
              <header className="mb-4 flex items-end justify-between">
                <div>
                  <h2 className="font-display text-lg text-dlugomat-900">Klucze API</h2>
                  <p className="text-xs text-dlugomat-500">
                    Bearer tokens dla aplikacji wewnetrznych i integracji partnerow.
                  </p>
                </div>
                <Button variant="secondary" size="sm" asChild>
                  <a href="/panel/organizacja/api-klucze">Wygeneruj klucz</a>
                </Button>
              </header>
              {apiKeys.length === 0 ? (
                <EmptyState
                  title="Brak kluczy API"
                  description="Nie utworzono jeszcze zadnego klucza API. Wygeneruj pierwszy klucz, aby zintegrowac systemy zewnetrzne."
                />
              ) : (
                <ul className="space-y-3 text-sm">
                  {apiKeys.map((k) => (
                    <li
                      key={k.id}
                      className="flex items-center justify-between rounded-md bg-dlugomat-50 px-4 py-3"
                    >
                      <div>
                        <div className="flex items-center gap-2 font-medium text-dlugomat-900">
                          {k.name}
                          {k.revoked_at ? (
                            <Badge tone="danger">uniewazniony</Badge>
                          ) : (
                            <Badge tone="success">aktywny</Badge>
                          )}
                        </div>
                        <div className="text-xs text-dlugomat-500">
                          <span className="font-mono">{k.key_prefix}…</span> - utworzony{" "}
                          {fmtDay(k.created_at)} - uzyty {fmtDate(k.last_used_at)}
                          {k.scopes.length > 0 ? ` - ${k.scopes.join(", ")}` : ""}
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <a href="/panel/organizacja/api-klucze">Zarzadzaj</a>
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </section>

          <section aria-label="Integracje systemowe">
            <Card elevation="subtle" className="p-6">
              <h2 className="font-display text-lg text-dlugomat-900">Integracje systemowe</h2>
              <p className="mt-1 text-xs text-dlugomat-500">
                Polaczenia z systemami ERP, ksiegowymi i bankowymi.
              </p>
              <div className="mt-4">
                <EmptyState
                  title="Brak skonfigurowanych integracji"
                  description="Integracje z systemami zewnetrznymi (ERP, ksiegowosc, bankowosc) nie zostaly jeszcze skonfigurowane dla tej organizacji."
                />
              </div>
            </Card>
          </section>
        </>
      )}
    </div>
  );
}
