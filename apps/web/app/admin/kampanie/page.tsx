import type { Metadata } from "next";
import { CheckCircle2, Mail, Plus, Send, TrendingUp } from "lucide-react";

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
  title: "Kampanie · Admin · Długomat",
};

type Campaign = {
  id: string;
  name: string;
  segment: string;
  status: "draft" | "scheduled" | "sending" | "done";
  recipients: number;
  open_rate: number; // %
  click_rate: number; // %
  scheduled_at?: string;
};

const CAMPAIGNS: Campaign[] = [
  {
    id: "cmp_001",
    name: "Reaktywacja: dłużnicy 30+ dni nieaktywni",
    segment: "user.last_seen < -30d AND case.status != completed",
    status: "done",
    recipients: 8420,
    open_rate: 41.2,
    click_rate: 11.8,
    scheduled_at: "2026-05-08T09:00:00Z",
  },
  {
    id: "cmp_002",
    name: "Kancelarie: nowa funkcja white-label",
    segment: "org.tier = enterprise AND org.type = law-firm",
    status: "sending",
    recipients: 312,
    open_rate: 38.1,
    click_rate: 7.4,
    scheduled_at: "2026-05-11T08:00:00Z",
  },
  {
    id: "cmp_003",
    name: "Onboarding D5 — przedawnienie",
    segment: "user.signup > -7d AND case.module = D5",
    status: "scheduled",
    recipients: 1240,
    open_rate: 0,
    click_rate: 0,
    scheduled_at: "2026-05-12T07:30:00Z",
  },
  {
    id: "cmp_004",
    name: "Q2 newsletter: orzecznictwo SN",
    segment: "user.opted_newsletter = true",
    status: "draft",
    recipients: 32_120,
    open_rate: 0,
    click_rate: 0,
  },
];

const TONE: Record<Campaign["status"], "neutral" | "info" | "warning" | "success"> = {
  draft: "neutral",
  scheduled: "info",
  sending: "warning",
  done: "success",
};

const LABEL: Record<Campaign["status"], string> = {
  draft: "Szkic",
  scheduled: "Zaplanowana",
  sending: "Wysyłka",
  done: "Zakończona",
};

export default function KampaniePage() {
  const totalRecipients = CAMPAIGNS.reduce((s, c) => s + c.recipients, 0);
  const avgOpen =
    CAMPAIGNS.filter((c) => c.open_rate > 0).reduce(
      (s, c) => s + c.open_rate,
      0,
    ) / Math.max(1, CAMPAIGNS.filter((c) => c.open_rate > 0).length);

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-fluid-sm font-semibold uppercase tracking-wider text-dlugomat-600">
            Komunikacja
          </p>
          <h1 className="text-fluid-3xl font-bold tracking-tight text-dlugomat-900 dark:text-white">
            Kampanie
          </h1>
          <p className="mt-1 max-w-2xl text-fluid-base text-iron-600 dark:text-iron-300">
            Segmentowe kampanie e-mail i powiadomienia in-app. Soft-throttle
            1000/min, zgody RODO weryfikowane przy każdej wysyłce.
          </p>
        </div>
        <Button>
          <Plus className="size-4" />
          Nowa kampania
        </Button>
      </header>

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard
          icon={<Mail className="size-5" />}
          label="Odbiorcy łącznie"
          value={totalRecipients.toLocaleString("pl-PL")}
        />
        <StatCard
          icon={<CheckCircle2 className="size-5" />}
          label="Średni open rate"
          value={`${avgOpen.toFixed(1)}%`}
        />
        <StatCard
          icon={<TrendingUp className="size-5" />}
          label="Kampanie aktywne"
          value={String(
            CAMPAIGNS.filter((c) => c.status !== "draft").length,
          )}
        />
      </div>

      <Card elevation="subtle" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-fluid-sm">
            <thead className="border-b border-iron-200 bg-iron-50/60 dark:border-dlugomat-800 dark:bg-dlugomat-900/40">
              <tr className="text-left text-iron-600 dark:text-iron-300">
                <th className="px-5 py-3 font-semibold">Nazwa</th>
                <th className="px-5 py-3 font-semibold">Segment</th>
                <th className="px-5 py-3 text-right font-semibold">Odbiorcy</th>
                <th className="px-5 py-3 text-right font-semibold">Open</th>
                <th className="px-5 py-3 text-right font-semibold">Click</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Akcja</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-iron-100 dark:divide-dlugomat-800">
              {CAMPAIGNS.map((c) => (
                <tr key={c.id}>
                  <td className="px-5 py-3 font-semibold text-iron-900 dark:text-iron-50">
                    {c.name}
                  </td>
                  <td className="px-5 py-3 max-w-xs">
                    <code className="line-clamp-1 font-mono text-fluid-xs text-iron-500">
                      {c.segment}
                    </code>
                  </td>
                  <td className="px-5 py-3 text-right tabular-nums">
                    {c.recipients.toLocaleString("pl-PL")}
                  </td>
                  <td className="px-5 py-3 text-right tabular-nums">
                    {c.open_rate > 0 ? `${c.open_rate}%` : "—"}
                  </td>
                  <td className="px-5 py-3 text-right tabular-nums">
                    {c.click_rate > 0 ? `${c.click_rate}%` : "—"}
                  </td>
                  <td className="px-5 py-3">
                    <Badge tone={TONE[c.status]} withDot>
                      {LABEL[c.status]}
                    </Badge>
                  </td>
                  <td className="px-5 py-3">
                    <Button size="sm" variant="ghost">
                      <Send className="size-4" />
                      {c.status === "draft" ? "Wyślij" : "Szczegóły"}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Card elevation="subtle">
      <CardContent className="flex items-center gap-3 p-5">
        <span className="grid size-10 place-items-center rounded-lg bg-dlugomat-100 text-dlugomat-700 dark:bg-dlugomat-850 dark:text-dlugomat-300">
          {icon}
        </span>
        <div className="flex flex-col">
          <span className="text-fluid-xs font-semibold uppercase tracking-wider text-iron-500">
            {label}
          </span>
          <span className="text-fluid-xl font-bold tabular-nums text-iron-900 dark:text-iron-50">
            {value}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
