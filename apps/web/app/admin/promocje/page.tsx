import type { Metadata } from "next";
import { Tag, Percent, Users, TrendingDown } from "lucide-react";

import { requireAdminOrRedirect } from "@/lib/admin/rbac";
import { getPromoStats } from "@/lib/admin/admin-queries";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Kody promocyjne — Admin",
  robots: { index: false, follow: false },
};

export const revalidate = 60;

function formatPLN(grosze: number): string {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
    maximumFractionDigits: 0,
  }).format(grosze / 100);
}

export default async function AdminPromoPage() {
  await requireAdminOrRedirect();
  const stats = await getPromoStats();

  return (
    <div className="flex flex-col gap-8">
      <header>
        <p className="text-fluid-xs font-semibold uppercase tracking-wider text-dlugomat-600 dark:text-dlugomat-300">
          Marketing
        </p>
        <h1 className="mt-1 font-serif text-fluid-3xl font-semibold text-iron-900 dark:text-white">
          Kody promocyjne
        </h1>
        <p className="mt-2 max-w-2xl text-fluid-sm text-iron-600 dark:text-iron-300">
          Walidacja i wykorzystanie kodów rabatowych. Idempotencja
          wymuszana przez unikalny indeks na <code>payment_id</code>.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-fluid-sm font-medium text-iron-600 dark:text-iron-300">
              Kody łącznie
            </CardTitle>
            <Tag className="h-4 w-4 text-iron-400" />
          </CardHeader>
          <CardContent>
            <div className="font-serif text-fluid-3xl font-semibold text-iron-900 dark:text-white">
              {stats.total_codes}
            </div>
            <p className="mt-1 text-fluid-xs">
              <Badge tone="info">{stats.active_codes} aktywnych</Badge>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-fluid-sm font-medium text-iron-600 dark:text-iron-300">
              Wykorzystania
            </CardTitle>
            <Users className="h-4 w-4 text-iron-400" />
          </CardHeader>
          <CardContent>
            <div className="font-serif text-fluid-3xl font-semibold text-iron-900 dark:text-white">
              {stats.total_redemptions}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-fluid-sm font-medium text-iron-600 dark:text-iron-300">
              Łączny rabat
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-warning-500" />
          </CardHeader>
          <CardContent>
            <div className="font-serif text-fluid-3xl font-semibold text-iron-900 dark:text-white">
              {formatPLN(stats.total_discount_grosze)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-fluid-sm font-medium text-iron-600 dark:text-iron-300">
              Średni rabat
            </CardTitle>
            <Percent className="h-4 w-4 text-iron-400" />
          </CardHeader>
          <CardContent>
            <div className="font-serif text-fluid-3xl font-semibold text-iron-900 dark:text-white">
              {stats.total_redemptions > 0
                ? formatPLN(
                    Math.round(
                      stats.total_discount_grosze / stats.total_redemptions,
                    ),
                  )
                : "—"}
            </div>
          </CardContent>
        </Card>
      </section>

      <section>
        <Card>
          <CardHeader>
            <CardTitle className="text-fluid-base">Top kody (TOP 10)</CardTitle>
            <CardDescription className="text-fluid-xs">
              Kody najczęściej wykorzystywane przez użytkowników.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats.top_codes.length === 0 ? (
              <p className="text-fluid-sm text-iron-500">
                Brak wykorzystań. Dodaj kod w bazie tabeli{" "}
                <code>promo_codes</code>.
              </p>
            ) : (
              <table className="w-full text-fluid-sm">
                <thead>
                  <tr className="border-b border-iron-200 text-left text-fluid-xs uppercase tracking-wider text-iron-500 dark:border-dlugomat-800">
                    <th className="py-2">Kod</th>
                    <th className="py-2 text-right">Wykorzystań</th>
                    <th className="py-2 text-right">Łączny rabat</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.top_codes.map((c) => (
                    <tr
                      key={c.code}
                      className="border-b border-iron-100 last:border-0 dark:border-dlugomat-800"
                    >
                      <td className="py-2">
                        <code className="font-semibold text-dlugomat-700 dark:text-dlugomat-300">
                          {c.code}
                        </code>
                      </td>
                      <td className="py-2 text-right font-semibold text-iron-900 dark:text-white">
                        {c.uses}
                      </td>
                      <td className="py-2 text-right text-iron-700 dark:text-iron-200">
                        {formatPLN(c.discount_grosze)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
