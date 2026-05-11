import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, BarChart3, Calendar, Tag, Users } from "lucide-react";

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
  title: "Promocja — szczegóły",
  robots: { index: false, follow: false },
};

interface PageProps {
  params: Promise<{ id: string }>;
}

interface PromotionDetail {
  id: string;
  code: string;
  name: string;
  status: "draft" | "active" | "paused" | "expired";
  discount_type: "percent" | "fixed";
  discount_value: number;
  start_date: string;
  end_date: string;
  global_limit: number;
  used: number;
  unique_users: number;
  revenue_attributed_pln: number;
  plans: string[];
  channels: string[];
}

const STATUS_TONE: Record<
  PromotionDetail["status"],
  "success" | "info" | "warning" | "neutral"
> = {
  active: "success",
  draft: "info",
  paused: "warning",
  expired: "neutral",
};

function fmtPLN(n: number): string {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
    maximumFractionDigits: 0,
  }).format(n);
}

async function loadPromotion(id: string): Promise<PromotionDetail> {
  return {
    id,
    code: "WIOSNA26",
    name: "Wiosna 2026",
    status: "active",
    discount_type: "percent",
    discount_value: 20,
    start_date: "2026-05-15",
    end_date: "2026-06-30",
    global_limit: 2000,
    used: 487,
    unique_users: 412,
    revenue_attributed_pln: 184600,
    plans: ["Basic", "Pro"],
    channels: ["SEM", "Partner"],
  };
}

export default async function AdminPromotionDetailPage({ params }: PageProps) {
  const { id } = await params;
  const p = await loadPromotion(id);
  const usedPct = Math.round((p.used / p.global_limit) * 100);

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin/promocje"
          className="inline-flex items-center gap-2 text-sm text-iron-600 hover:text-dlugomat-900 focus-visible:outline-none focus-visible:shadow-shield-focus rounded"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Wróć do listy promocji
        </Link>
      </div>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.18em] text-iron-500">
            Promocja · {p.id}
          </p>
          <h1 className="font-display text-fluid-h1 text-dlugomat-950">{p.name}</h1>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={STATUS_TONE[p.status]} withDot>
              {p.status === "active"
                ? "aktywna"
                : p.status === "draft"
                ? "szkic"
                : p.status === "paused"
                ? "wstrzymana"
                : "wygasła"}
            </Badge>
            <Badge tone="neutral">
              <Tag className="mr-1 h-3 w-3" aria-hidden />
              {p.code}
            </Badge>
            <Badge tone="info">
              {p.discount_type === "percent" ? `${p.discount_value}%` : fmtPLN(p.discount_value)} rabatu
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary">Wstrzymaj</Button>
          <Button variant="danger">Wygaś</Button>
        </div>
      </header>

      <section className="grid gap-4 lg:grid-cols-4" aria-label="KPI promocji">
        <Card>
          <CardHeader>
            <CardDescription>Wykorzystanie</CardDescription>
            <CardTitle className="font-display text-fluid-h3 text-dlugomat-950">
              {p.used.toLocaleString("pl-PL")} / {p.global_limit.toLocaleString("pl-PL")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-2 w-full rounded-full bg-iron-100">
              <div
                className="h-2 rounded-full bg-dlugomat-700"
                style={{ width: `${usedPct}%` }}
                aria-hidden
              />
            </div>
            <p className="mt-2 text-xs text-iron-500">{usedPct}% limitu globalnego</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Unikalni użytkownicy</CardDescription>
            <CardTitle className="font-display text-fluid-h3 text-dlugomat-950">
              {p.unique_users.toLocaleString("pl-PL")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-iron-500">
              <Users className="mr-1 inline h-3 w-3" aria-hidden />
              Konwersja {Math.round((p.unique_users / p.used) * 100)}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Przypisany przychód</CardDescription>
            <CardTitle className="font-display text-fluid-h3 text-dlugomat-950">
              {fmtPLN(p.revenue_attributed_pln)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-iron-500">Model last-touch attribution</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Okres obowiązywania</CardDescription>
            <CardTitle className="font-display text-fluid-h4 text-dlugomat-950">
              {p.start_date} → {p.end_date}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-iron-500">
              <Calendar className="mr-1 inline h-3 w-3" aria-hidden />
              47 dni okna sprzedażowego
            </p>
          </CardContent>
        </Card>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Segmentacja</CardTitle>
            <CardDescription>Plany i kanały objęte promocją</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="text-xs uppercase tracking-wide text-iron-500">Plany</p>
              <div className="mt-1 flex flex-wrap gap-2">
                {p.plans.map((pl) => (
                  <Badge key={pl} tone="info">
                    {pl}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-iron-500">Kanały</p>
              <div className="mt-1 flex flex-wrap gap-2">
                {p.channels.map((c) => (
                  <Badge key={c} tone="neutral">
                    {c}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Trend dzienny</CardTitle>
            <CardDescription>Aktywacje kodu w ostatnich 7 dniach</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2 h-32" aria-hidden>
              {[24, 38, 31, 47, 52, 61, 49].map((v, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t bg-gradient-to-t from-dlugomat-700 to-dlugomat-500"
                  style={{ height: `${(v / 61) * 100}%` }}
                />
              ))}
            </div>
            <p className="mt-3 text-xs text-iron-500">
              <BarChart3 className="mr-1 inline h-3 w-3" aria-hidden />
              Średnia 43 aktywacje/dzień
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
