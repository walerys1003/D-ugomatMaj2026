import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Plug, CheckCircle2, AlertCircle, XCircle, Settings, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Integracje — admin",
  robots: { index: false, follow: false },
};

interface Integration {
  slug: string;
  name: string;
  category: "CRM" | "SSO" | "Platnosci" | "Storage" | "E-mail" | "Inne";
  status: "connected" | "error" | "disconnected" | "pending";
  last_sync: string | null;
  events_24h: number;
  errors_24h: number;
}

const INTEGRATIONS: ReadonlyArray<Integration> = [
  { slug: "salesforce", name: "Salesforce", category: "CRM", status: "connected", last_sync: "2026-05-11 09:12", events_24h: 1240, errors_24h: 0 },
  { slug: "okta", name: "Okta SSO", category: "SSO", status: "connected", last_sync: "2026-05-11 09:14", events_24h: 89, errors_24h: 0 },
  { slug: "stripe", name: "Stripe", category: "Platnosci", status: "connected", last_sync: "2026-05-11 09:13", events_24h: 412, errors_24h: 2 },
  { slug: "azure-ad", name: "Azure AD", category: "SSO", status: "error", last_sync: "2026-05-11 06:42", events_24h: 18, errors_24h: 14 },
  { slug: "s3", name: "AWS S3 (storage)", category: "Storage", status: "connected", last_sync: "2026-05-11 09:00", events_24h: 5680, errors_24h: 0 },
  { slug: "sendgrid", name: "SendGrid", category: "E-mail", status: "connected", last_sync: "2026-05-11 09:11", events_24h: 2410, errors_24h: 5 },
  { slug: "hubspot", name: "HubSpot", category: "CRM", status: "pending", last_sync: null, events_24h: 0, errors_24h: 0 },
  { slug: "tpay", name: "Tpay", category: "Platnosci", status: "disconnected", last_sync: "2026-04-18 11:00", events_24h: 0, errors_24h: 0 },
];

const STATUS_TONE: Record<Integration["status"], "success" | "danger" | "neutral" | "warning"> = {
  connected: "success",
  error: "danger",
  disconnected: "neutral",
  pending: "warning",
};

const STATUS_LABEL: Record<Integration["status"], string> = {
  connected: "Polaczone",
  error: "Blad",
  disconnected: "Rozlaczone",
  pending: "Oczekuje",
};

const STATUS_ICON = {
  connected: CheckCircle2,
  error: XCircle,
  disconnected: XCircle,
  pending: AlertCircle,
};

export default function IntegracjeAdminPage() {
  const connectedCount = INTEGRATIONS.filter((i) => i.status === "connected").length;
  const errorCount = INTEGRATIONS.filter((i) => i.status === "error").length;
  const totalEvents = INTEGRATIONS.reduce((s, i) => s + i.events_24h, 0);
  const totalErrors = INTEGRATIONS.reduce((s, i) => s + i.errors_24h, 0);

  return (
    <div className="space-y-6">
      <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-iron-600 hover:text-dlugomat-900">
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Powrot do panelu admin
      </Link>

      <header>
        <p className="text-xs uppercase tracking-[0.18em] text-iron-500">Admin · Integracje</p>
        <h1 className="font-display text-fluid-h1 text-dlugomat-950 flex items-center gap-3">
          <Plug className="h-7 w-7 text-dlugomat-700" aria-hidden />
          Integracje systemowe
        </h1>
        <p className="mt-1 text-sm text-iron-600">
          Status polaczen, ostatnia synchronizacja, eventy i bledy z 24 h.
        </p>
      </header>

      <section className="grid gap-4 lg:grid-cols-4" aria-label="KPI integracji">
        <Card urgency="success">
          <CardHeader>
            <CardDescription>Polaczone</CardDescription>
            <CardTitle className="font-display text-fluid-h3 text-accent-700">{connectedCount}/{INTEGRATIONS.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card urgency={errorCount > 0 ? "critical" : "none"}>
          <CardHeader>
            <CardDescription>Z bledem</CardDescription>
            <CardTitle className="font-display text-fluid-h3 text-danger">{errorCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Eventy / 24 h</CardDescription>
            <CardTitle className="font-display text-fluid-h3 text-dlugomat-950">{totalEvents.toLocaleString("pl-PL")}</CardTitle>
          </CardHeader>
        </Card>
        <Card urgency={totalErrors > 10 ? "warning" : "none"}>
          <CardHeader>
            <CardDescription>Bledy / 24 h</CardDescription>
            <CardTitle className="font-display text-fluid-h3 text-warn">{totalErrors}</CardTitle>
          </CardHeader>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle>Wszystkie integracje</CardTitle>
              <CardDescription>{INTEGRATIONS.length} polaczen</CardDescription>
            </div>
            <Button variant="secondary" size="sm">
              <Plug className="mr-2 h-4 w-4" aria-hidden />
              Dodaj integracje
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ul className="divide-y divide-iron-100">
            {INTEGRATIONS.map((i) => {
              const Icon = STATUS_ICON[i.status];
              return (
                <li key={i.slug} className="px-5 py-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`h-5 w-5 ${
                          i.status === "connected"
                            ? "text-accent-700"
                            : i.status === "error"
                            ? "text-danger"
                            : i.status === "pending"
                            ? "text-warn"
                            : "text-iron-400"
                        }`}
                        aria-hidden
                      />
                      <div>
                        <p className="text-sm font-medium text-dlugomat-900">{i.name}</p>
                        <div className="mt-1 flex items-center gap-2">
                          <Badge tone="neutral">{i.category}</Badge>
                          <Badge tone={STATUS_TONE[i.status]} withDot>{STATUS_LABEL[i.status]}</Badge>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 text-xs text-iron-600">
                      <div>
                        <p className="font-mono">{i.events_24h.toLocaleString("pl-PL")}</p>
                        <p className="text-iron-500">eventow / 24h</p>
                      </div>
                      <div>
                        <p className={`font-mono ${i.errors_24h > 0 ? "text-danger" : ""}`}>
                          {i.errors_24h}
                        </p>
                        <p className="text-iron-500">bledow / 24h</p>
                      </div>
                      <div>
                        <p className="font-mono">{i.last_sync ?? "—"}</p>
                        <p className="text-iron-500">ostatnia sync</p>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" aria-label="Konfiguracja">
                          <Settings className="h-4 w-4" aria-hidden />
                        </Button>
                        <Button variant="ghost" size="sm" aria-label="Otworz w nowej karcie">
                          <ExternalLink className="h-4 w-4" aria-hidden />
                        </Button>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
