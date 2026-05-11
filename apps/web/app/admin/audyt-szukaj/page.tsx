import type { Metadata } from "next";
import Link from "next/link";
import { Filter, Search } from "lucide-react";

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
  title: "Wyszukiwarka audytu — Admin",
  robots: { index: false, follow: false },
};

interface PageProps {
  searchParams?: Promise<{
    actor?: string;
    action?: string;
    resource?: string;
    from?: string;
    to?: string;
  }>;
}

interface AuditEvent {
  id: string;
  ts: string;
  actor_email: string;
  action: string;
  resource: string;
  resource_id: string;
  ip: string;
  result: "success" | "denied" | "error";
}

const RESULT_TONE: Record<AuditEvent["result"], "success" | "warning" | "danger"> = {
  success: "success",
  denied: "warning",
  error: "danger",
};

const ACTIONS = [
  "user.login",
  "user.role_changed",
  "case.created",
  "case.deleted",
  "payment.refunded",
  "promotion.activated",
  "rbac.permission_granted",
  "secret.rotated",
  "feature_flag.toggled",
] as const;

const RESOURCES = ["user", "case", "payment", "promotion", "secret", "feature_flag", "template"] as const;

async function search(): Promise<AuditEvent[]> {
  return [
    {
      id: "evt_8123",
      ts: "2026-05-10T18:42:11Z",
      actor_email: "admin@dlugomat.pl",
      action: "promotion.activated",
      resource: "promotion",
      resource_id: "promo_WIOSNA26",
      ip: "10.0.0.42",
      result: "success",
    },
    {
      id: "evt_8122",
      ts: "2026-05-10T17:12:04Z",
      actor_email: "moderator@dlugomat.pl",
      action: "user.role_changed",
      resource: "user",
      resource_id: "usr_a1b2",
      ip: "10.0.0.84",
      result: "success",
    },
    {
      id: "evt_8121",
      ts: "2026-05-10T16:58:22Z",
      actor_email: "anna@example.pl",
      action: "user.login",
      resource: "user",
      resource_id: "usr_a1b2",
      ip: "89.64.21.12",
      result: "success",
    },
    {
      id: "evt_8120",
      ts: "2026-05-10T16:14:09Z",
      actor_email: "support@dlugomat.pl",
      action: "case.deleted",
      resource: "case",
      resource_id: "case_4711",
      ip: "10.0.0.18",
      result: "denied",
    },
    {
      id: "evt_8119",
      ts: "2026-05-10T11:02:33Z",
      actor_email: "admin@dlugomat.pl",
      action: "secret.rotated",
      resource: "secret",
      resource_id: "sec_stripe_main",
      ip: "10.0.0.42",
      result: "success",
    },
  ];
}

function fmtDate(iso: string): string {
  return new Intl.DateTimeFormat("pl-PL", {
    dateStyle: "short",
    timeStyle: "medium",
  }).format(new Date(iso));
}

export default async function AdminAuditSearchPage({ searchParams }: PageProps) {
  const sp = (await searchParams) ?? {};
  const events = await search();

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.18em] text-iron-500">
          Audyt · zaawansowane wyszukiwanie
        </p>
        <h1 className="font-display text-fluid-h1 text-dlugomat-950">
          Wyszukiwarka zdarzeń
        </h1>
        <p className="max-w-2xl text-iron-600">
          Pełnotekstowe wyszukiwanie po aktorze, akcji, zasobie i zakresie czasu.
          Każde zdarzenie jest podpisane kryptograficznie.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>
            <Filter className="mr-2 inline h-4 w-4" aria-hidden />
            Filtry
          </CardTitle>
          <CardDescription>Połączenie filtrów wykonywane jest operatorem AND</CardDescription>
        </CardHeader>
        <CardContent>
          <form method="get" className="grid gap-4 md:grid-cols-5">
            <label className="block md:col-span-2">
              <span className="block text-xs uppercase tracking-wide text-iron-500">
                Aktor (e-mail lub ID)
              </span>
              <input
                type="text"
                name="actor"
                defaultValue={sp.actor ?? ""}
                className="mt-1 w-full rounded-md border border-iron-300 bg-white px-3 py-2 text-sm focus:border-dlugomat-700 focus-visible:outline-none focus-visible:shadow-shield-focus"
                placeholder="admin@dlugomat.pl"
              />
            </label>
            <label className="block">
              <span className="block text-xs uppercase tracking-wide text-iron-500">Akcja</span>
              <select
                name="action"
                defaultValue={sp.action ?? ""}
                className="mt-1 w-full rounded-md border border-iron-300 bg-white px-3 py-2 text-sm focus:border-dlugomat-700 focus-visible:outline-none focus-visible:shadow-shield-focus"
              >
                <option value="">Wszystkie</option>
                {ACTIONS.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="block text-xs uppercase tracking-wide text-iron-500">Zasób</span>
              <select
                name="resource"
                defaultValue={sp.resource ?? ""}
                className="mt-1 w-full rounded-md border border-iron-300 bg-white px-3 py-2 text-sm focus:border-dlugomat-700 focus-visible:outline-none focus-visible:shadow-shield-focus"
              >
                <option value="">Wszystkie</option>
                {RESOURCES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="block text-xs uppercase tracking-wide text-iron-500">Od</span>
              <input
                type="date"
                name="from"
                defaultValue={sp.from ?? ""}
                className="mt-1 w-full rounded-md border border-iron-300 bg-white px-3 py-2 text-sm focus:border-dlugomat-700 focus-visible:outline-none focus-visible:shadow-shield-focus"
              />
            </label>
            <label className="block">
              <span className="block text-xs uppercase tracking-wide text-iron-500">Do</span>
              <input
                type="date"
                name="to"
                defaultValue={sp.to ?? ""}
                className="mt-1 w-full rounded-md border border-iron-300 bg-white px-3 py-2 text-sm focus:border-dlugomat-700 focus-visible:outline-none focus-visible:shadow-shield-focus"
              />
            </label>
            <div className="md:col-span-5 flex justify-end gap-2">
              <Button variant="ghost" type="reset">Wyczyść</Button>
              <Button type="submit">
                <Search className="mr-2 h-4 w-4" aria-hidden />
                Szukaj
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Wyniki ({events.length})</CardTitle>
          <CardDescription>Sortowanie: czas malejąco</CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-iron-200 text-sm">
              <thead className="bg-iron-50 text-xs uppercase tracking-wide text-iron-600">
                <tr>
                  <th className="px-4 py-2 text-left">Czas</th>
                  <th className="px-4 py-2 text-left">Aktor</th>
                  <th className="px-4 py-2 text-left">Akcja</th>
                  <th className="px-4 py-2 text-left">Zasób</th>
                  <th className="px-4 py-2 text-left">IP</th>
                  <th className="px-4 py-2 text-left">Wynik</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-iron-100 bg-white">
                {events.map((ev) => (
                  <tr key={ev.id}>
                    <td className="whitespace-nowrap px-4 py-2 font-mono text-xs text-iron-600">
                      {fmtDate(ev.ts)}
                    </td>
                    <td className="px-4 py-2 text-dlugomat-900">{ev.actor_email}</td>
                    <td className="px-4 py-2 font-mono text-xs text-dlugomat-900">{ev.action}</td>
                    <td className="px-4 py-2">
                      <Link
                        href={`/admin/${ev.resource === "user" ? "uzytkownicy" : ev.resource === "case" ? "sprawy" : ev.resource === "payment" ? "platnosci" : ev.resource === "promotion" ? "promocje" : "audyt"}/${ev.resource_id}`}
                        className="text-dlugomat-700 hover:text-dlugomat-900 focus-visible:outline-none focus-visible:shadow-shield-focus rounded"
                      >
                        {ev.resource}/{ev.resource_id}
                      </Link>
                    </td>
                    <td className="px-4 py-2 font-mono text-xs text-iron-600">{ev.ip}</td>
                    <td className="px-4 py-2">
                      <Badge tone={RESULT_TONE[ev.result]} withDot>
                        {ev.result}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
