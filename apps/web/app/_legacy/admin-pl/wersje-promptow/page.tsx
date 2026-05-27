import type { Metadata } from "next";
import { ArrowRight, GitBranch, History, ShieldCheck } from "lucide-react";

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
  title: "Wersje promptów · Admin · Długomat",
};

type PromptVersion = {
  v: string;
  date: string;
  author: string;
  status: "draft" | "shadow" | "production" | "deprecated";
  changes: string;
  win_rate?: number;
  cost_pln?: number;
};

const PROMPTS: { id: string; key: string; title: string; versions: PromptVersion[] }[] = [
  {
    id: "p_sprzeciw_epu",
    key: "letter.D1.sprzeciw_epu",
    title: "Sprzeciw od nakazu zapłaty (EPU)",
    versions: [
      {
        v: "v7",
        date: "2026-05-10",
        author: "ml-team",
        status: "production",
        changes: "Lepsze przywołanie wyroku SN III CZP 27/22",
        win_rate: 82.4,
        cost_pln: 0.031,
      },
      {
        v: "v6",
        date: "2026-04-22",
        author: "ml-team",
        status: "deprecated",
        changes: "Pierwsza wersja z post-edytorem",
        win_rate: 76.1,
        cost_pln: 0.038,
      },
      {
        v: "v8-draft",
        date: "2026-05-11",
        author: "anna.k",
        status: "shadow",
        changes: "Skraca wstęp o 40%, dodaje sekcję dot. RODO",
        win_rate: 79.0,
        cost_pln: 0.027,
      },
    ],
  },
  {
    id: "p_ugoda",
    key: "letter.D3.ugoda_rozlozenie",
    title: "Wniosek o rozłożenie na raty",
    versions: [
      {
        v: "v3",
        date: "2026-05-01",
        author: "ml-team",
        status: "production",
        changes: "Auto-kalkulacja harmonogramu z parametrów",
        win_rate: 68.5,
        cost_pln: 0.022,
      },
    ],
  },
];

const TONE: Record<
  PromptVersion["status"],
  "neutral" | "info" | "success" | "warning"
> = {
  draft: "neutral",
  shadow: "warning",
  production: "success",
  deprecated: "neutral",
};

const LABEL: Record<PromptVersion["status"], string> = {
  draft: "Szkic",
  shadow: "Shadow",
  production: "Produkcja",
  deprecated: "Wycofany",
};

export default function WersjePromptowPage() {
  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <p className="text-fluid-sm font-semibold uppercase tracking-wider text-dlugomat-600">
          AI Ops
        </p>
        <h1 className="text-fluid-3xl font-bold tracking-tight text-dlugomat-900 dark:text-white">
          Wersje promptów
        </h1>
        <p className="max-w-2xl text-fluid-base text-iron-600 dark:text-iron-300">
          Każda wersja prompta jest podpisana, ma swój hash i metryki.
          Wersję shadow porównujemy z produkcją na 5% ruchu przed wdrożeniem.
        </p>
      </header>

      <div className="flex flex-col gap-4">
        {PROMPTS.map((p) => (
          <Card key={p.id} elevation="subtle">
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <CardTitle className="text-fluid-lg">{p.title}</CardTitle>
                  <CardDescription>
                    <code className="font-mono text-fluid-xs">{p.key}</code>
                  </CardDescription>
                </div>
                <Button size="sm" variant="secondary">
                  <GitBranch className="size-4" />
                  Nowa wersja
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-fluid-sm">
                  <thead className="border-b border-iron-200 text-left text-iron-600 dark:border-dlugomat-800 dark:text-iron-300">
                    <tr>
                      <th className="px-3 py-2 font-semibold">Wersja</th>
                      <th className="px-3 py-2 font-semibold">Data</th>
                      <th className="px-3 py-2 font-semibold">Autor</th>
                      <th className="px-3 py-2 font-semibold">Status</th>
                      <th className="px-3 py-2 font-semibold">Zmiany</th>
                      <th className="px-3 py-2 text-right font-semibold">Win rate</th>
                      <th className="px-3 py-2 text-right font-semibold">Koszt/pismo</th>
                      <th className="px-3 py-2 font-semibold">Akcja</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-iron-100 dark:divide-dlugomat-800">
                    {p.versions.map((v) => (
                      <tr key={v.v}>
                        <td className="px-3 py-2">
                          <code className="font-mono font-semibold text-iron-900 dark:text-iron-50">
                            {v.v}
                          </code>
                        </td>
                        <td className="px-3 py-2 text-iron-500">{v.date}</td>
                        <td className="px-3 py-2 text-iron-500">{v.author}</td>
                        <td className="px-3 py-2">
                          <Badge tone={TONE[v.status]} withDot>
                            {LABEL[v.status]}
                          </Badge>
                        </td>
                        <td className="px-3 py-2 max-w-xs text-iron-700 dark:text-iron-200">
                          <span className="line-clamp-2">{v.changes}</span>
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums">
                          {v.win_rate !== undefined ? `${v.win_rate}%` : "—"}
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums">
                          {v.cost_pln !== undefined
                            ? `${v.cost_pln.toFixed(3)} zł`
                            : "—"}
                        </td>
                        <td className="px-3 py-2">
                          {v.status === "shadow" ? (
                            <Button size="sm" variant="success">
                              <ShieldCheck className="size-4" />
                              Promuj
                            </Button>
                          ) : (
                            <Button size="sm" variant="ghost">
                              <History className="size-4" />
                              Diff
                              <ArrowRight className="size-4" />
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
