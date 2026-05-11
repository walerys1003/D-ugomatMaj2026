import type { Metadata } from "next";
import { Flag, ToggleLeft, ToggleRight, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Flagi funkcji · Admin · Długomat",
};

type Flag = {
  key: string;
  description: string;
  enabled: boolean;
  rollout_percent: number;
  audience: "all" | "internal" | "beta" | "enterprise";
  updated_at: string;
  owner: string;
};

const FLAGS: Flag[] = [
  {
    key: "feature.ai-letter-v2",
    description: "Nowy silnik AI dla pism (Claude 3.7 + post-editor)",
    enabled: true,
    rollout_percent: 35,
    audience: "beta",
    updated_at: "2026-05-09",
    owner: "ml-team",
  },
  {
    key: "feature.bulk-import-epu",
    description: "Import bezpośrednio z E-sądu po SSO",
    enabled: false,
    rollout_percent: 0,
    audience: "internal",
    updated_at: "2026-05-02",
    owner: "platform",
  },
  {
    key: "feature.payment-blik",
    description: "Płatność BLIK w checkoutach mobilnych",
    enabled: true,
    rollout_percent: 100,
    audience: "all",
    updated_at: "2026-04-20",
    owner: "payments",
  },
  {
    key: "feature.white-label",
    description: "White-label panel dla Enterprise",
    enabled: true,
    rollout_percent: 100,
    audience: "enterprise",
    updated_at: "2026-04-12",
    owner: "growth",
  },
  {
    key: "feature.eu-region",
    description: "Failover do regionu eu-central-2 (Frankfurt)",
    enabled: false,
    rollout_percent: 0,
    audience: "internal",
    updated_at: "2026-05-08",
    owner: "infra",
  },
];

const AUDIENCE_LABEL: Record<Flag["audience"], string> = {
  all: "Wszyscy",
  internal: "Wewnętrzni",
  beta: "Beta tester",
  enterprise: "Enterprise",
};

const AUDIENCE_TONE: Record<
  Flag["audience"],
  "info" | "warning" | "neutral" | "success"
> = {
  all: "success",
  internal: "warning",
  beta: "info",
  enterprise: "neutral",
};

export default function FlagiFunkcjiPage() {
  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <p className="text-fluid-sm font-semibold uppercase tracking-wider text-dlugomat-600">
          Wdrożenia
        </p>
        <h1 className="text-fluid-3xl font-bold tracking-tight text-dlugomat-900 dark:text-white">
          Flagi funkcji
        </h1>
        <p className="max-w-2xl text-fluid-base text-iron-600 dark:text-iron-300">
          Kontrola progresywnych rolloutów. Każda zmiana flagi jest
          natychmiast efektywna (cache 5s) i loguje się w audycie.
        </p>
      </header>

      <Card elevation="subtle" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-fluid-sm">
            <thead className="border-b border-iron-200 bg-iron-50/60 dark:border-dlugomat-800 dark:bg-dlugomat-900/40">
              <tr className="text-left text-iron-600 dark:text-iron-300">
                <th className="px-5 py-3 font-semibold">Klucz</th>
                <th className="px-5 py-3 font-semibold">Opis</th>
                <th className="px-5 py-3 font-semibold">Audiencja</th>
                <th className="px-5 py-3 text-right font-semibold">Rollout</th>
                <th className="px-5 py-3 font-semibold">Owner</th>
                <th className="px-5 py-3 font-semibold">Stan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-iron-100 dark:divide-dlugomat-800">
              {FLAGS.map((f) => (
                <tr key={f.key}>
                  <td className="px-5 py-3">
                    <code className="font-mono text-fluid-xs text-iron-700 dark:text-iron-200">
                      {f.key}
                    </code>
                  </td>
                  <td className="px-5 py-3 max-w-xs">
                    <span className="line-clamp-2 text-iron-700 dark:text-iron-200">
                      {f.description}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <Badge tone={AUDIENCE_TONE[f.audience]}>
                      <Users className="size-3" />
                      {AUDIENCE_LABEL[f.audience]}
                    </Badge>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <div className="h-2 w-28 overflow-hidden rounded-full bg-iron-100 dark:bg-dlugomat-900">
                        <div
                          className="h-full bg-accent-500"
                          style={{ width: `${f.rollout_percent}%` }}
                        />
                      </div>
                      <span className="w-10 text-right tabular-nums text-iron-700 dark:text-iron-200">
                        {f.rollout_percent}%
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-iron-500">{f.owner}</td>
                  <td className="px-5 py-3">
                    <Button
                      size="sm"
                      variant={f.enabled ? "success" : "secondary"}
                      aria-label={
                        f.enabled
                          ? `Wyłącz ${f.key}`
                          : `Włącz ${f.key}`
                      }
                    >
                      {f.enabled ? (
                        <>
                          <ToggleRight className="size-4" /> Aktywna
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="size-4" /> Wyłączona
                        </>
                      )}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card elevation="subtle">
        <CardHeader>
          <span
            aria-hidden
            className="grid size-9 place-items-center rounded-lg bg-dlugomat-100 text-dlugomat-700 dark:bg-dlugomat-850 dark:text-dlugomat-300"
          >
            <Flag className="size-5" />
          </span>
          <CardTitle className="mt-2 text-fluid-lg">
            Konwencje nazewnicze
          </CardTitle>
          <CardDescription>
            <code className="rounded bg-iron-100 px-1.5 py-0.5 font-mono text-fluid-xs dark:bg-dlugomat-900">
              feature.&lt;area&gt;-&lt;short-name&gt;
            </code>{" "}
            — feature toggle ·{" "}
            <code className="rounded bg-iron-100 px-1.5 py-0.5 font-mono text-fluid-xs dark:bg-dlugomat-900">
              kill.&lt;system&gt;
            </code>{" "}
            — emergency switch ·{" "}
            <code className="rounded bg-iron-100 px-1.5 py-0.5 font-mono text-fluid-xs dark:bg-dlugomat-900">
              experiment.&lt;hypothesis&gt;
            </code>{" "}
            — A/B test.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
