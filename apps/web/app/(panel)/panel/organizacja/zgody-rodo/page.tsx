import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { FileText, ShieldCheck } from "lucide-react";

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

export const metadata: Metadata = {
  title: "Zgody RODO · Organizacja · Długomat",
};

export const dynamic = "force-dynamic";

type Consent = {
  id: string;
  scope: string;
  description: string;
  granted: boolean;
  signed_at: string;
  source: string | null;
  version: string | null;
};

export default async function ZgodyRodoPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/logowanie?next=/panel/organizacja/zgody-rodo");

  const { data: rows } = await supabase
    .from("consent_ledger")
    .select("id, purpose, granted, version, source, recorded_at")
    .order("recorded_at", { ascending: false })
    .limit(50);

  const CONSENTS: Consent[] = (rows ?? []).map((c) => ({
    id: c.id,
    scope: c.purpose,
    description: `Cel przetwarzania: ${c.purpose}.`,
    granted: !!c.granted,
    signed_at: c.recorded_at,
    source: c.source,
    version: c.version,
  }));

  const allGranted = CONSENTS.length > 0 && CONSENTS.every((c) => c.granted);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8">
      <header className="flex flex-col gap-2">
        <p className="text-fluid-sm font-semibold uppercase tracking-wider text-dlugomat-600">
          Organizacja · Compliance
        </p>
        <h1 className="text-fluid-3xl font-bold tracking-tight text-dlugomat-900 dark:text-white">
          Zgody RODO
        </h1>
        <p className="max-w-2xl text-fluid-base text-ink-600 dark:text-ink-300">
          Wszystkie zgody administratora organizacji w jednym miejscu.
          Pełna historia zmian dostępna w sekcji Audyt.
        </p>
      </header>

      {allGranted ? (
        <Card elevation="subtle" urgency="success">
          <CardHeader>
            <div className="flex items-start gap-3">
              <span
                aria-hidden
                className="grid size-9 shrink-0 place-items-center rounded-lg bg-accent-100 text-accent-700 dark:bg-accent-700/20 dark:text-accent-300"
              >
                <ShieldCheck className="size-5" />
              </span>
              <div>
                <CardTitle className="text-fluid-base">
                  Wszystkie zarejestrowane zgody udzielone
                </CardTitle>
                <CardDescription>
                  Wszystkie zgody w rejestrze maja status „udzielona”.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
      ) : null}

      {CONSENTS.length === 0 ? (
        <EmptyState
          title="Brak zarejestrowanych zgód"
          description="W rejestrze zgód nie ma jeszcze żadnych wpisów. Zgody pojawia sie po zaakceptowaniu celów przetwarzania."
        />
      ) : (
      <div className="flex flex-col gap-3">
        {CONSENTS.map((c) => (
          <Card key={c.id} elevation="subtle">
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex flex-col gap-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <CardTitle className="text-fluid-base">
                      {c.scope}
                    </CardTitle>
                    {c.version ? (
                      <Badge tone="neutral">wersja {c.version}</Badge>
                    ) : null}
                    <Badge tone={c.granted ? "success" : "warning"} withDot>
                      {c.granted ? "Udzielona" : "Wycofana"}
                    </Badge>
                  </div>
                  <CardDescription>{c.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-fluid-xs text-ink-500">
                  {new Date(c.signed_at).toLocaleString("pl-PL")}
                  {c.source ? ` · źródło: ${c.source}` : ""}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      )}

      <Card elevation="subtle">
        <CardHeader>
          <span
            aria-hidden
            className="grid size-9 place-items-center rounded-lg bg-dlugomat-100 text-dlugomat-700 dark:bg-dlugomat-850 dark:text-dlugomat-300"
          >
            <FileText className="size-5" />
          </span>
          <CardTitle className="mt-2 text-fluid-lg">
            Polityka prywatności i regulamin
          </CardTitle>
          <CardDescription>
            Aktualne wersje dokumentów obowiązujących Twoją organizację.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button asChild variant="secondary">
            <a href="/polityka-prywatnosci">Polityka prywatności (v3.2)</a>
          </Button>
          <Button asChild variant="secondary">
            <a href="/rodo">Polityka RODO (v2.4)</a>
          </Button>
          <Button asChild variant="secondary">
            <a href="/regulamin">Regulamin (v4.0)</a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
