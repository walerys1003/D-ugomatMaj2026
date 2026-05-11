"use client";

import * as React from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

/**
 * Tier 61 - Error boundary dla segmentu (panel)
 * Spokojny komunikat zgodny z archetypem Tarcza.
 */
export default function PanelError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      console.error("[panel-error]", error);
    }
  }, [error]);

  return (
    <main className="flex min-h-[70vh] items-center justify-center px-6 py-16">
      <Card elevation="pop" urgency="warning" className="w-full max-w-xl p-10">
        <p className="font-mono text-xs uppercase tracking-wider text-warn">Blad aplikacji</p>
        <h1 className="mt-4 font-display text-3xl text-dlugomat-900">Cos poszlo nie tak</h1>
        <p className="mt-3 text-sm text-dlugomat-600">
          Wystapil nieoczekiwany blad podczas ladowania tego widoku. Twoje dane sa bezpieczne -
          mozesz sprobowac ponownie lub wrocic do panelu glownego.
        </p>
        {error.digest ? (
          <p className="mt-4 rounded-md bg-dlugomat-50 px-3 py-2 font-mono text-xs text-dlugomat-500">
            ID bledu: {error.digest}
          </p>
        ) : null}
        <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row">
          <Button variant="primary" size="md" onClick={() => reset()}>
            Sprobuj ponownie
          </Button>
          <Button variant="secondary" size="md" asChild>
            <Link href="/panel">Powrot do panelu</Link>
          </Button>
          <Button variant="ghost" size="md" asChild>
            <Link href="/panel/wsparcie">Zglos problem</Link>
          </Button>
        </div>
      </Card>
    </main>
  );
}
