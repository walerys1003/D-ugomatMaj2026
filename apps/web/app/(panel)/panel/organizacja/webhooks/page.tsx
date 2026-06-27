import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";

export const metadata: Metadata = { title: "Webhooki | Organizacja | Długomat" };

export const dynamic = "force-dynamic";

interface Webhook {
  id: string;
  url: string;
  events: string[];
  status: "active" | "paused" | "failing";
  last_delivery_at?: string;
  failure_count: number;
}

const EVENT_CATALOG: Array<{ key: string; label: string }> = [
  { key: "case.created", label: "Sprawa utworzona" },
  { key: "case.updated", label: "Sprawa zaktualizowana" },
  { key: "case.closed", label: "Sprawa zamknięta" },
  { key: "document.signed", label: "Dokument podpisany" },
  { key: "payment.succeeded", label: "Płatność udana" },
  { key: "payment.failed", label: "Płatność nieudana" },
  { key: "user.invited", label: "Użytkownik zaproszony" },
  { key: "audit.high_severity", label: "Audyt: zdarzenie krytyczne" },
];

const STATUS_BADGE: Record<Webhook["status"], string> = {
  active: "bg-accent-50 text-accent-700 border-accent-200",
  paused: "bg-ink-100 text-ink-700 border-ink-200",
  failing: "bg-danger-50 text-danger-700 border-danger-200",
};

const STATUS_LABEL: Record<Webhook["status"], string> = {
  active: "Aktywny",
  paused: "Wstrzymany",
  failing: "Błędy",
};

export default async function WebhooksPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/logowanie?next=/panel/organizacja/webhooks");

  const { data } = await supabase
    .from("webhook_endpoints")
    .select("id, url, events, enabled, failure_count, last_success_at, last_failure_at, created_at")
    .order("created_at", { ascending: false });

  const webhooks: Webhook[] = (data ?? []).map((w) => {
    const events = Array.isArray(w.events)
      ? (w.events as unknown[]).map((e) => String(e))
      : [];
    const status: Webhook["status"] = !w.enabled
      ? "paused"
      : (w.failure_count ?? 0) > 0
      ? "failing"
      : "active";
    return {
      id: w.id,
      url: w.url,
      events,
      status,
      last_delivery_at: w.last_success_at ?? w.last_failure_at ?? undefined,
      failure_count: w.failure_count ?? 0,
    };
  });

  return (
    <main className="container mx-auto px-4 py-8 max-w-5xl space-y-6">
      <div>
        <Link href="/panel/organizacja" className="text-xs text-ink-500 hover:text-ink-700">
          ← Organizacja
        </Link>
        <h1 className="font-display text-3xl font-semibold text-ink-900 dark:text-ink-50 mt-2">
          Webhooki
        </h1>
        <p className="text-sm text-ink-500 mt-1">
          Wysyłamy zdarzenia HTTP POST do Twoich endpointów. Każde żądanie jest podpisane HMAC-SHA256.
        </p>
      </div>

      <Card elevation="subtle">
        <CardHeader>
          <CardTitle>Dodaj webhook</CardTitle>
        </CardHeader>
        <CardContent>
          <form method="post" action="/api/orgs/webhooks" className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-ink-700 dark:text-ink-300 mb-1.5 block">
                URL endpointu
              </span>
              <input
                type="url"
                name="url"
                required
                placeholder="https://api.firma.pl/dlugomat-events"
                className="w-full rounded-lg border border-ink-300 dark:border-ink-700 bg-white dark:bg-ink-900 px-3 py-2 focus:outline-none focus-visible:shadow-shield-focus"
              />
            </label>
            <fieldset>
              <legend className="text-sm font-medium text-ink-700 dark:text-ink-300 mb-2">
                Subskrybowane zdarzenia
              </legend>
              <div className="grid sm:grid-cols-2 gap-2">
                {EVENT_CATALOG.map((e) => (
                  <label
                    key={e.key}
                    className="flex items-center gap-2 text-sm rounded-md border border-ink-200 dark:border-ink-800 px-3 py-2 cursor-pointer hover:border-ink-300"
                  >
                    <input type="checkbox" name="events" value={e.key} className="rounded" />
                    <span className="text-ink-700 dark:text-ink-300">{e.label}</span>
                    <code className="text-xs text-ink-500 ml-auto">{e.key}</code>
                  </label>
                ))}
              </div>
            </fieldset>
            <Button type="submit" variant="primary">
              Utwórz webhook
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card elevation="subtle">
        <CardHeader>
          <CardTitle>Twoje webhooki</CardTitle>
        </CardHeader>
        <CardContent>
          {webhooks.length === 0 ? (
            <p className="text-sm text-ink-500">Brak skonfigurowanych webhooków.</p>
          ) : (
            <ul className="space-y-3">
              {webhooks.map((w) => (
                <li key={w.id} className="rounded-lg border border-ink-200 dark:border-ink-800 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <code className="font-mono text-sm text-ink-900 dark:text-ink-50 break-all">
                      {w.url}
                    </code>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_BADGE[w.status]}`}
                    >
                      {STATUS_LABEL[w.status]}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {w.events.map((ev) => (
                      <span
                        key={ev}
                        className="text-xs px-2 py-0.5 rounded-full bg-ink-100 dark:bg-ink-800 font-mono"
                      >
                        {ev}
                      </span>
                    ))}
                  </div>
                  <div className="text-xs text-ink-500">
                    {w.last_delivery_at
                      ? `Ostatnia dostawa: ${new Date(w.last_delivery_at).toLocaleString("pl-PL")}`
                      : "Brak dostaw"}
                    {w.failure_count > 0 && ` · ${w.failure_count} błędów`}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
