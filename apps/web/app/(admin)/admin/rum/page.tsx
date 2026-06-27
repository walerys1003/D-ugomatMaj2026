import type { Metadata } from "next";
import { Gauge } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "RUM · Web Vitals · Admin · Długomat",
};

export default function RumPage() {
  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <p className="text-fluid-sm font-semibold uppercase tracking-wider text-dlugomat-600">
          Wydajność
        </p>
        <h1 className="text-fluid-3xl font-bold tracking-tight text-dlugomat-900 dark:text-white">
          RUM · Web Vitals
        </h1>
        <p className="max-w-2xl text-fluid-base text-ink-600 dark:text-ink-300">
          Dane od prawdziwych użytkowników (Real User Monitoring) — wartości p75
          dla głównych metryk Web Vitals.
        </p>
      </header>

      <Card elevation="subtle">
        <CardHeader>
          <span
            aria-hidden
            className="grid size-9 place-items-center rounded-lg bg-dlugomat-100 text-dlugomat-700 dark:bg-dlugomat-850 dark:text-dlugomat-300"
          >
            <Gauge className="size-5" />
          </span>
          <CardTitle className="mt-2 text-fluid-lg">Metryki Web Vitals</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            title="Brak danych RUM"
            description="Zbieranie metryk Real User Monitoring (LCP, INP, CLS, TTFB, FCP) nie zostało jeszcze skonfigurowane lub nie zarejestrowano jeszcze żadnych próbek. Po wdrożeniu kolektora Web Vitals dane pojawią się tutaj automatycznie."
          />
        </CardContent>
      </Card>
    </div>
  );
}
