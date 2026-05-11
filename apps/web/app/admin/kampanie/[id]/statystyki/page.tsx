import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowDownRight,
  ArrowUpRight,
  Download,
  Mail,
  MousePointerClick,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
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
  title: "Statystyki kampanii — Admin Dlugomat",
  description: "Pelne metryki kampanii: open rate, CTR, konwersje, ROI.",
};

type Campaign = {
  id: string;
  name: string;
  channel: "email" | "sms" | "push" | "inapp";
  status: "running" | "paused" | "completed" | "scheduled";
  startedAt: string;
  endsAt: string;
  audience: string;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  converted: number;
  unsubscribed: number;
  bounced: number;
};

type DayRow = { date: string; sent: number; opened: number; clicked: number };

const CAMPAIGNS: Record<string, Campaign> = {
  "kam-2841": {
    id: "kam-2841",
    name: "Reaktywacja klientow B2C — maj 2026",
    channel: "email",
    status: "running",
    startedAt: "2026-05-04",
    endsAt: "2026-05-18",
    audience: "B2C nieaktywni 60+ dni",
    sent: 12480,
    delivered: 12184,
    opened: 4082,
    clicked: 1247,
    converted: 384,
    unsubscribed: 47,
    bounced: 296,
  },
};

const DAILY: DayRow[] = [
  { date: "04 maj", sent: 1840, opened: 612, clicked: 184 },
  { date: "05 maj", sent: 1920, opened: 658, clicked: 201 },
  { date: "06 maj", sent: 1780, opened: 581, clicked: 178 },
  { date: "07 maj", sent: 1610, opened: 524, clicked: 162 },
  { date: "08 maj", sent: 1850, opened: 612, clicked: 188 },
  { date: "09 maj", sent: 1740, opened: 558, clicked: 167 },
  { date: "10 maj", sent: 1740, opened: 537, clicked: 167 },
];

const fmtNum = (n: number) => n.toLocaleString("pl-PL");
const fmtPct = (n: number) => `${(n * 100).toFixed(1)}%`;

async function loadCampaign(id: string): Promise<Campaign | null> {
  return CAMPAIGNS[id] ?? CAMPAIGNS["kam-2841"] ?? null;
}

export default async function CampaignStatsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const c = await loadCampaign(id);
  if (!c) return notFound();

  const deliveryRate = c.delivered / c.sent;
  const openRate = c.opened / c.delivered;
  const ctr = c.clicked / c.opened;
  const conversionRate = c.converted / c.clicked;
  const unsubRate = c.unsubscribed / c.delivered;

  const maxOpened = Math.max(...DAILY.map((d) => d.opened));

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8">
        <Link
          href="/admin/kampanie"
          className="text-sm text-slate-600 hover:text-slate-900"
        >
          ← Kampanie
        </Link>
        <div className="mt-3 flex items-start justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm text-slate-500">#{c.id}</span>
              <Badge tone="info" withDot>
                W trakcie
              </Badge>
              <Badge tone="neutral">{c.channel}</Badge>
            </div>
            <h1 className="mt-2 font-display text-2xl text-slate-900">
              {c.name}
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Audytorium: {c.audience} · {c.startedAt} - {c.endsAt}
            </p>
          </div>
          <Button variant="ghost" size="sm">
            <Download className="mr-1 h-4 w-4" />
            Eksport raportu
          </Button>
        </div>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        <Card elevation="subtle">
          <CardContent className="py-5">
            <p className="inline-flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500">
              <Mail className="h-3.5 w-3.5" />
              Dostarczalnosc
            </p>
            <p className="mt-2 font-display text-2xl text-slate-900">
              {fmtPct(deliveryRate)}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {fmtNum(c.delivered)} z {fmtNum(c.sent)}
            </p>
          </CardContent>
        </Card>
        <Card elevation="subtle">
          <CardContent className="py-5">
            <p className="inline-flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500">
              <Users className="h-3.5 w-3.5" />
              Open rate
            </p>
            <p className="mt-2 font-display text-2xl text-slate-900">
              {fmtPct(openRate)}
            </p>
            <p className="mt-1 inline-flex items-center gap-1 text-xs text-emerald-700">
              <ArrowUpRight className="h-3 w-3" />
              +4,2 p.p. vs srednia
            </p>
          </CardContent>
        </Card>
        <Card elevation="subtle">
          <CardContent className="py-5">
            <p className="inline-flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500">
              <MousePointerClick className="h-3.5 w-3.5" />
              CTR
            </p>
            <p className="mt-2 font-display text-2xl text-slate-900">
              {fmtPct(ctr)}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {fmtNum(c.clicked)} klikniec
            </p>
          </CardContent>
        </Card>
        <Card elevation="subtle">
          <CardContent className="py-5">
            <p className="inline-flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500">
              <Target className="h-3.5 w-3.5" />
              Konwersja
            </p>
            <p className="mt-2 font-display text-2xl text-emerald-700">
              {fmtPct(conversionRate)}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {fmtNum(c.converted)} aktywacji
            </p>
          </CardContent>
        </Card>
      </div>

      <Card elevation="subtle" className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-4 w-4 text-slate-500" />
            Trend dzienny
          </CardTitle>
          <CardDescription>
            Wysylki, otwarcia i klikniecia z 7 dni kampanii
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-3">
            {DAILY.map((d) => {
              const heightPct = (d.opened / maxOpened) * 100;
              return (
                <div key={d.date} className="flex flex-col items-center gap-2">
                  <div className="flex h-32 w-full items-end justify-center">
                    <div
                      className="w-full rounded-t bg-slate-900"
                      style={{ height: `${heightPct}%` }}
                      aria-label={`${d.date}: ${d.opened} otwarc`}
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-medium text-slate-900">
                      {fmtNum(d.opened)}
                    </p>
                    <p className="text-xs text-slate-500">{d.date}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card elevation="subtle">
          <CardHeader>
            <CardTitle className="text-base">Lej konwersji</CardTitle>
            <CardDescription>Od wysylki do aktywacji klienta</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {[
                { label: "Wyslane", value: c.sent, pct: 1 },
                { label: "Dostarczone", value: c.delivered, pct: deliveryRate },
                {
                  label: "Otwarte",
                  value: c.opened,
                  pct: c.opened / c.sent,
                },
                {
                  label: "Klikniete",
                  value: c.clicked,
                  pct: c.clicked / c.sent,
                },
                {
                  label: "Konwersje",
                  value: c.converted,
                  pct: c.converted / c.sent,
                },
              ].map((step) => (
                <li key={step.label}>
                  <div className="mb-1 flex items-center justify-between gap-2 text-sm">
                    <span className="text-slate-700">{step.label}</span>
                    <span className="text-slate-900">
                      {fmtNum(step.value)} ·{" "}
                      <span className="text-slate-500">{fmtPct(step.pct)}</span>
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-slate-900"
                      style={{ width: `${step.pct * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card elevation="subtle">
          <CardHeader>
            <CardTitle className="text-base">Sygnaly negatywne</CardTitle>
            <CardDescription>
              Wskazniki do monitorowania jakosci kampanii
            </CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-slate-500">Bounce rate</dt>
                <dd>
                  <span className="font-medium text-slate-900">
                    {fmtPct(c.bounced / c.sent)}
                  </span>
                  <span className="ml-2 text-xs text-slate-500">
                    {fmtNum(c.bounced)}
                  </span>
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-slate-500">Wypisania</dt>
                <dd>
                  <span className="font-medium text-slate-900">
                    {fmtPct(unsubRate)}
                  </span>
                  <span className="ml-2 text-xs text-slate-500">
                    {fmtNum(c.unsubscribed)}
                  </span>
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
                <dt className="inline-flex items-center gap-2 text-slate-500">
                  <ArrowDownRight className="h-3.5 w-3.5 text-emerald-600" />
                  Status jakosci
                </dt>
                <dd>
                  <Badge tone="success" withDot>
                    W normie
                  </Badge>
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
