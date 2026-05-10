import type { Metadata } from "next";
import { Bell, AlertTriangle, Clock, CheckCircle2 } from "lucide-react";

import { requireAdminOrRedirect } from "@/lib/admin/rbac";
import { getNotificationStats } from "@/lib/admin/admin-queries";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Notyfikacje — Admin",
  robots: { index: false, follow: false },
};

export const revalidate = 30;

const STATUS_TONE: Record<
  string,
  "info" | "success" | "warning" | "neutral" | "danger"
> = {
  pending: "warning",
  sent: "success",
  delivered: "success",
  failed: "danger",
  cancelled: "neutral",
};

export default async function AdminNotificationsPage() {
  await requireAdminOrRedirect();
  const stats = await getNotificationStats();

  return (
    <div className="flex flex-col gap-8">
      <header>
        <p className="text-fluid-xs font-semibold uppercase tracking-wider text-dlugomat-600 dark:text-dlugomat-300">
          Monitor
        </p>
        <h1 className="mt-1 font-serif text-fluid-3xl font-semibold text-iron-900 dark:text-white">
          Kolejka notyfikacji
        </h1>
        <p className="mt-2 max-w-2xl text-fluid-sm text-iron-600 dark:text-iron-300">
          Status emaili (Resend) i SMS-ów (SMSAPI.pl) z ostatnich 30 dni.
          Idempotencja wymuszana przez <code>dedup_key</code>.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-fluid-sm font-medium text-iron-600 dark:text-iron-300">
              Łącznie (30d)
            </CardTitle>
            <Bell className="h-4 w-4 text-iron-400" />
          </CardHeader>
          <CardContent>
            <div className="font-serif text-fluid-3xl font-semibold text-iron-900 dark:text-white">
              {stats.total.toLocaleString("pl-PL")}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-fluid-sm font-medium text-iron-600 dark:text-iron-300">
              Błędy (24h)
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-warning-500" />
          </CardHeader>
          <CardContent>
            <div className="font-serif text-fluid-3xl font-semibold text-iron-900 dark:text-white">
              {stats.failed_24h}
            </div>
            {stats.failed_24h > 0 ? (
              <p className="mt-1 text-fluid-xs">
                <Badge tone="danger">Wymagają interwencji</Badge>
              </p>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-fluid-sm font-medium text-iron-600 dark:text-iron-300">
              Oczekujące zaległe
            </CardTitle>
            <Clock className="h-4 w-4 text-iron-400" />
          </CardHeader>
          <CardContent>
            <div className="font-serif text-fluid-3xl font-semibold text-iron-900 dark:text-white">
              {stats.pending_overdue}
            </div>
            <p className="mt-1 text-fluid-xs text-iron-500">
              <code>scheduled_for</code> w przeszłości, status <code>pending</code>.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-fluid-sm font-medium text-iron-600 dark:text-iron-300">
              Dostarczone
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-accent-500" />
          </CardHeader>
          <CardContent>
            <div className="font-serif text-fluid-3xl font-semibold text-iron-900 dark:text-white">
              {(
                (stats.by_status.delivered ?? 0) +
                (stats.by_status.sent ?? 0)
              ).toLocaleString("pl-PL")}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-fluid-base">Rozkład statusów</CardTitle>
            <CardDescription className="text-fluid-xs">
              30 dni — wszystkie kanały.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-2 text-fluid-sm">
              {Object.entries(stats.by_status).length === 0 ? (
                <li className="text-iron-500">Brak danych.</li>
              ) : (
                Object.entries(stats.by_status)
                  .sort((a, b) => b[1] - a[1])
                  .map(([status, count]) => (
                    <li
                      key={status}
                      className="flex items-center justify-between"
                    >
                      <Badge tone={STATUS_TONE[status] ?? "neutral"}>
                        {status}
                      </Badge>
                      <span className="font-semibold text-iron-900 dark:text-white">
                        {count}
                      </span>
                    </li>
                  ))
              )}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-fluid-base">Kanały</CardTitle>
            <CardDescription className="text-fluid-xs">
              Email vs SMS — wolumeny.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-2 text-fluid-sm">
              {Object.entries(stats.by_channel).length === 0 ? (
                <li className="text-iron-500">Brak danych.</li>
              ) : (
                Object.entries(stats.by_channel)
                  .sort((a, b) => b[1] - a[1])
                  .map(([channel, count]) => (
                    <li
                      key={channel}
                      className="flex items-center justify-between"
                    >
                      <code className="text-iron-600 dark:text-iron-300">
                        {channel}
                      </code>
                      <span className="font-semibold text-iron-900 dark:text-white">
                        {count}
                      </span>
                    </li>
                  ))
              )}
            </ul>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
