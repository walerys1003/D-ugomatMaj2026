import type { Metadata } from "next";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CsrfInput } from "@/components/ui/csrf-input";
import { startCaseAction } from "@/lib/cases/case-actions";
import { caseTypeMeta, moduleIndex } from "@/lib/cases/case-types";
import type { CaseType, ModuleId } from "@/lib/db/types";
import { formatPLN } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Nowa sprawa · Długomat",
  description: "Wybierz moduł, w którym chcesz utworzyć nową sprawę.",
};

const allTypes = Object.keys(caseTypeMeta) as CaseType[];

export default function NowaSprawaPage() {
  // Group case types by module
  const byModule = new Map<ModuleId, CaseType[]>();
  for (const type of allTypes) {
    const m = caseTypeMeta[type].module;
    const arr = byModule.get(m) ?? [];
    arr.push(type);
    byModule.set(m, arr);
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <header className="space-y-2">
        <Link
          href="/panel"
          className="text-fluid-xs text-iron-500 hover:text-iron-700 dark:text-iron-400 dark:hover:text-iron-200"
        >
          ← Panel
        </Link>
        <h1 className="font-serif text-fluid-3xl text-iron-900 dark:text-iron-50">
          Nowa sprawa
        </h1>
        <p className="text-fluid-sm text-iron-600 dark:text-iron-400">
          Wybierz moduł i typ pisma. Możesz wrócić do nieukończonej sprawy w dowolnym momencie — auto-zapis działa od pierwszego kroku.
        </p>
      </header>

      {/* D1 Skaner — darmowy entry point */}
      <Link
        href="/panel/skaner"
        className="group flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-shield-200 bg-shield-50/50 p-4 transition hover:border-shield-400 hover:bg-shield-50"
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Badge tone="success" withDot>D1 · Bezpłatnie</Badge>
            <span className="text-fluid-xs uppercase tracking-wide text-shield-700">
              Skaner nakazu
            </span>
          </div>
          <h2 className="mt-1 font-serif text-fluid-lg text-shield-950">
            Nie wiesz, z czym masz do czynienia? Wgraj skan.
          </h2>
          <p className="text-fluid-sm text-iron-700">
            Rozpoznamy nakaz EPU, pismo komornika lub raport BIK i podpowiemy
            właściwy moduł. Skan jest bezpłatny.
          </p>
        </div>
        <span className="text-shield-700 transition group-hover:translate-x-1">
          Otwórz skaner →
        </span>
      </Link>

      {(["D2", "D3", "D4", "D5", "D6", "D7", "D8"] as ModuleId[]).map((mod) => {
        const types = byModule.get(mod) ?? [];
        if (types.length === 0) return null;
        const meta = moduleIndex[mod];
        return (
          <section key={mod} className="space-y-3">
            <header className="flex flex-wrap items-baseline justify-between gap-3">
              <div>
                <h2 className="font-serif text-fluid-xl text-iron-900 dark:text-iron-50">
                  {mod} · {meta.title}
                </h2>
                <p className="text-fluid-sm text-iron-600 dark:text-iron-400">
                  {meta.tagline}
                </p>
              </div>
              <ModuleStatusBadge status={meta.status} />
            </header>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {types.map((type) => {
                const t = caseTypeMeta[type];
                const isLive = t.status === "live";
                return (
                  <Card
                    key={type}
                    className={
                      isLive
                        ? "transition hover:shadow-pop"
                        : "opacity-70"
                    }
                  >
                    <CardHeader>
                      <CardTitle className="text-fluid-base">
                        {t.shortTitle}
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {t.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between gap-3">
                      <span className="text-fluid-sm font-medium text-iron-800 dark:text-iron-200 tabular-nums">
                        {t.priceGrosze === 0 ? "Bezpłatnie" : formatPLN(t.priceGrosze / 100)}
                      </span>
                      {isLive ? (
                        <form action={startCaseAction}>
                          {/* Tier 5 zad. 203 — CSRF token przed mutacją. */}
                          {/* @ts-expect-error Async Server Component */}
                          <CsrfInput />
                          <input type="hidden" name="type" value={type} />
                          <Button type="submit" size="sm">
                            Rozpocznij
                          </Button>
                        </form>
                      ) : (
                        <Badge tone="neutral">Wkrótce</Badge>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function ModuleStatusBadge({ status }: { status: "live" | "beta" | "planned" }) {
  if (status === "live") {
    return <Badge tone="success" withDot>Dostępny</Badge>;
  }
  if (status === "beta") {
    return <Badge tone="warning" withDot>Beta</Badge>;
  }
  return <Badge tone="neutral">Wkrótce</Badge>;
}
