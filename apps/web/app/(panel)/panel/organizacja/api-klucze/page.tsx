import type { Metadata } from "next";
import { Eye, EyeOff, Key, Plus, ShieldAlert, Trash2 } from "lucide-react";

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
  title: "Klucze API · Organizacja · Długomat",
};

type ApiKey = {
  id: string;
  name: string;
  prefix: string;
  scopes: string[];
  created_by: string;
  created_at: string;
  last_used_at?: string;
  last_ip?: string;
};

const KEYS: ApiKey[] = [
  {
    id: "k_001",
    name: "Production · CRM sync",
    prefix: "dlg_live_4f2a",
    scopes: ["cases:read", "cases:write", "letters:read"],
    created_by: "anna.k@kowalska.pl",
    created_at: "2025-11-12",
    last_used_at: "2026-05-11T08:42:00Z",
    last_ip: "52.213.10.42",
  },
  {
    id: "k_002",
    name: "Staging · QA",
    prefix: "dlg_test_b39c",
    scopes: ["cases:read", "letters:read", "letters:write"],
    created_by: "qa@kowalska.pl",
    created_at: "2026-02-20",
    last_used_at: "2026-05-10T22:14:00Z",
    last_ip: "94.45.108.10",
  },
  {
    id: "k_003",
    name: "Analytics · BigQuery export",
    prefix: "dlg_live_71e8",
    scopes: ["analytics:read"],
    created_by: "data@kowalska.pl",
    created_at: "2026-03-04",
  },
];

export default function ApiKluczePage() {
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

      <Card elevation="subtle" className="overflow-hidden">
        <CardContent className="p-0">
          <table className="w-full text-fluid-sm">
            <thead className="border-b border-ink-200 bg-ink-50/60 dark:border-dlugomat-800 dark:bg-dlugomat-900/40">
              <tr className="text-left text-ink-600 dark:text-ink-300">
                <th className="px-5 py-3 font-semibold">Nazwa</th>
                <th className="px-5 py-3 font-semibold">Klucz</th>
                <th className="px-5 py-3 font-semibold">Uprawnienia</th>
                <th className="px-5 py-3 font-semibold">Ostatnio użyty</th>
                <th className="px-5 py-3" />
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
                    </span>
                    <span className="block text-fluid-xs text-ink-500">
                      Utworzony przez {k.created_by} · {k.created_at}
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
                    {k.last_used_at ? (
                      <>
                        {new Date(k.last_used_at).toLocaleString("pl-PL")}
                        <br />
                        <span className="font-mono">{k.last_ip}</span>
                      </>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost">
                        <Eye className="size-4" />
                        Pokaż
                      </Button>
                      <Button size="sm" variant="ghost" aria-label={`Usuń ${k.name}`}>
                        <Trash2 className="size-4 text-danger-600" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
