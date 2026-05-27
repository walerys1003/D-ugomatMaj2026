import type { Metadata } from "next";
import * as React from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { StatusAutoRefresh } from "./auto-refresh";

/**
 * Tier 5 zad. 244 — Public status page (status.dlugomat.pl).
 *
 * Server Component — pobiera GET /api/status (server-side, no auth).
 * Client wrapper `<StatusAutoRefresh />` re-fetchuje co 30 sekund.
 *
 * Endpoint /api/status zwraca:
 *   - overall_status: 'operational'|'degraded'|'down'|'unconfigured'
 *   - components[]: { name, status, latency_ms, detail }
 *
 * Strony nie indeksujemy (noindex) — dynamiczna treść, status wpływa
 * na CTR ale nie chcemy by Google rankował starą migawkę.
 */
export const metadata: Metadata = {
  title: "Status systemu · Długomat",
  description:
    "Aktualny status komponentów Długomat: bazy danych, AI, e-maili, SMS i płatności.",
  robots: { index: false, follow: true },
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

type CompStatus = "operational" | "degraded" | "unconfigured" | "down";

interface ComponentReport {
  name: string;
  status: CompStatus;
  latency_ms: number | null;
  detail: string | null;
}

interface StatusPayload {
  ok: boolean;
  overall_status: CompStatus;
  components: ComponentReport[];
  checked_at: string;
  service: string;
  env: string;
}

async function fetchStatus(): Promise<StatusPayload | null> {
  const base =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
    "http://localhost:3000";
  try {
    const res = await fetch(`${base}/api/status`, {
      cache: "no-store",
      next: { revalidate: 0 },
    });
    if (!res.ok && res.status !== 200) return null;
    return (await res.json()) as StatusPayload;
  } catch {
    return null;
  }
}

const STATUS_CONFIG: Record<
  CompStatus,
  { label: string; dot: string; banner: string; description: string }
> = {
  operational: {
    label: "Działa",
    dot: "bg-emerald-500",
    banner: "border-emerald-200 bg-emerald-50 text-emerald-900",
    description: "Wszystkie systemy działają prawidłowo.",
  },
  degraded: {
    label: "Spowolnienie",
    dot: "bg-amber-500",
    banner: "border-amber-200 bg-amber-50 text-amber-900",
    description: "Niektóre komponenty działają wolniej niż zwykle.",
  },
  unconfigured: {
    label: "Nie skonfigurowany",
    dot: "bg-ink-300",
    banner: "border-ink-200 bg-ink-50 text-ink-700",
    description: "Komponent nieustawiony — środowisko deweloperskie.",
  },
  down: {
    label: "Awaria",
    dot: "bg-rose-500",
    banner: "border-rose-200 bg-rose-50 text-rose-900",
    description: "Wykryliśmy awarię — zespół już nad tym pracuje.",
  },
};

export default async function StatusPage() {
  const status = await fetchStatus();

  if (!status) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h1 className="text-3xl font-semibold text-dlugomat-900">
          Status systemu
        </h1>
        <p className="mt-4 text-ink-600">
          Nie udało się pobrać aktualnego statusu. Spróbuj odświeżyć stronę
          za chwilę.
        </p>
      </div>
    );
  }

  const overall = STATUS_CONFIG[status.overall_status];

  return (
    <div className="container mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:py-16">
      <StatusAutoRefresh intervalMs={30_000} />

      <header className="space-y-3 pb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-dlugomat-900 sm:text-4xl">
          Status systemu
        </h1>
        <p className="text-ink-600">
          Sprawdzane co 30 sekund. Ostatnia aktualizacja:{" "}
          <time dateTime={status.checked_at} className="font-medium">
            {new Date(status.checked_at).toLocaleString("pl-PL")}
          </time>
        </p>
      </header>

      <div
        className={`rounded-lg border p-5 ${overall.banner}`}
        role="status"
        aria-live="polite"
      >
        <div className="flex items-center gap-3">
          <span className={`inline-block h-3 w-3 rounded-full ${overall.dot}`} />
          <span className="text-lg font-semibold">{overall.label}</span>
        </div>
        <p className="mt-1 text-sm">{overall.description}</p>
      </div>

      <section className="mt-10 space-y-4">
        <h2 className="text-lg font-semibold text-dlugomat-900">
          Komponenty
        </h2>
        <div className="space-y-3">
          {status.components.map((c) => {
            const cfg = STATUS_CONFIG[c.status];
            return (
              <Card key={c.name}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-block h-2.5 w-2.5 rounded-full ${cfg.dot}`}
                    />
                    <div>
                      <p className="font-medium text-ink-900">{c.name}</p>
                      {c.detail ? (
                        <p className="text-xs text-ink-500">{c.detail}</p>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-0.5">
                    <span className="text-sm font-medium text-ink-700">
                      {cfg.label}
                    </span>
                    {typeof c.latency_ms === "number" ? (
                      <span className="text-xs text-ink-500 tabular-nums">
                        {c.latency_ms} ms
                      </span>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="mt-12 space-y-3 rounded-lg border border-ink-200 bg-white p-6">
        <h3 className="font-semibold text-dlugomat-900">Coś nie działa?</h3>
        <p className="text-sm text-ink-600">
          Jeśli widzisz problem mimo zielonego statusu, napisz do nas:{" "}
          <a
            href="mailto:kontakt@dlugomat.pl"
            className="font-medium text-dlugomat-700 underline-offset-2 hover:underline"
          >
            kontakt@dlugomat.pl
          </a>
          . Zwykle odpowiadamy w ciągu kilku godzin.
        </p>
        <p className="text-xs text-ink-500">
          Środowisko: {status.env} · serwis: {status.service}
        </p>
      </section>
    </div>
  );
}
