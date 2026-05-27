import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CreditCard, Download, ExternalLink, FileText, RefreshCw } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";

export const metadata: Metadata = {
  title: "Płatności · Ustawienia",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function formatPLN(grosze: number): string {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
  }).format(grosze / 100);
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("pl-PL", { dateStyle: "medium" }).format(new Date(iso));
}

export default async function PaymentsSettingsPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/sign-in?next=/panel/ustawienia/platnosci");

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("plan_key, cycle, amount_grosze, status, current_period_end, cancel_at_period_end")
    .eq("user_id", user.id)
    .in("status", ["active", "trialing", "past_due"])
    .maybeSingle();

  const { data: invoices } = await supabase
    .from("invoices")
    .select("id, invoice_number, total_gross_grosze, issue_date, status, is_correction")
    .eq("user_id", user.id)
    .order("issue_date", { ascending: false })
    .limit(50);

  const { data: payments } = await supabase
    .from("payments")
    .select("id, amount_grosze, status, created_at, description")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <header>
        <h1 className="text-fluid-2xl font-bold text-ink-900 dark:text-white">Płatności i subskrypcja</h1>
        <p className="mt-1 text-fluid-base text-ink-600 dark:text-ink-300">
          Faktury VAT-PL, historia transakcji, zarządzanie planem.
        </p>
      </header>

      {/* Bieżąca subskrypcja */}
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Bieżący plan
            </CardTitle>
            <CardDescription>
              {subscription
                ? `Plan ${subscription.plan_key} (${subscription.cycle === "annual" ? "rocznie" : "miesięcznie"})`
                : "Brak aktywnej subskrypcji."}
            </CardDescription>
          </div>
          {subscription?.status && (
            <Badge
              tone={
                subscription.status === "active"
                  ? "success"
                  : subscription.status === "past_due"
                    ? "warning"
                    : "neutral"
              }
              withDot
            >
              {subscription.status}
            </Badge>
          )}
        </CardHeader>
        <CardContent>
          {subscription ? (
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div className="flex flex-col">
                  <span className="text-fluid-xs text-ink-500">Cena</span>
                  <span className="text-fluid-lg font-semibold">
                    {formatPLN(subscription.amount_grosze ?? 0)}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-fluid-xs text-ink-500">Cykl</span>
                  <span className="text-fluid-lg font-semibold">
                    {subscription.cycle === "annual" ? "Roczny" : "Miesięczny"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-fluid-xs text-ink-500">Następna płatność</span>
                  <span className="text-fluid-lg font-semibold">
                    {formatDate(subscription.current_period_end)}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-fluid-xs text-ink-500">Auto-odnowienie</span>
                  <span className="text-fluid-lg font-semibold">
                    {subscription.cancel_at_period_end ? "Nie" : "Tak"}
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button asChild>
                  <Link href="/cennik/subskrypcje">
                    <RefreshCw className="h-4 w-4" />
                    Zmień plan
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/api/billing/portal">
                    <ExternalLink className="h-4 w-4" />
                    Portal Stripe (płatności / anulowanie)
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <p className="text-fluid-sm text-ink-600 dark:text-ink-300">
                Korzystasz z planu pay-per-case (płatność za sprawę). Subskrypcja daje nielimitowane sprawy, wyższe limity AI i priorytetowy support.
              </p>
              <Button asChild>
                <Link href="/cennik/subskrypcje">Zobacz plany subskrypcji</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Faktury */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Faktury VAT-PL
          </CardTitle>
          <CardDescription>Pobierz PDF z formalnymi danymi do księgowości.</CardDescription>
        </CardHeader>
        <CardContent>
          {!invoices || invoices.length === 0 ? (
            <p className="text-fluid-sm text-ink-500">Nie masz jeszcze faktur.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-fluid-sm">
                <thead>
                  <tr className="border-b border-ink-200 text-left text-fluid-xs uppercase tracking-wider text-ink-500 dark:border-dlugomat-700">
                    <th className="py-2 pr-3">Numer</th>
                    <th className="py-2 pr-3">Data</th>
                    <th className="py-2 pr-3">Kwota</th>
                    <th className="py-2 pr-3">Status</th>
                    <th className="py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv: any) => (
                    <tr key={inv.id} className="border-b border-ink-100 dark:border-dlugomat-800">
                      <td className="py-2 pr-3 font-mono">{inv.invoice_number}</td>
                      <td className="py-2 pr-3">{formatDate(inv.issue_date)}</td>
                      <td className="py-2 pr-3 font-medium">{formatPLN(inv.total_gross_grosze)}</td>
                      <td className="py-2 pr-3">
                        <Badge tone={inv.status === "paid" ? "success" : "neutral"} withDot>
                          {inv.is_correction ? "Korekta" : inv.status}
                        </Badge>
                      </td>
                      <td className="py-2 text-right">
                        <Button asChild size="sm" variant="ghost">
                          <a href={`/api/invoices/${inv.id}?format=pdf`} target="_blank" rel="noopener">
                            <Download className="h-4 w-4" />
                            PDF
                          </a>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Historia transakcji */}
      <Card>
        <CardHeader>
          <CardTitle>Historia transakcji</CardTitle>
          <CardDescription>Ostatnie 20 operacji.</CardDescription>
        </CardHeader>
        <CardContent>
          {!payments || payments.length === 0 ? (
            <p className="text-fluid-sm text-ink-500">Brak transakcji.</p>
          ) : (
            <ul className="flex flex-col gap-1">
              {payments.map((p: any) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between gap-3 border-b border-ink-100 py-2 last:border-b-0 dark:border-dlugomat-800"
                >
                  <div className="flex flex-col">
                    <span className="text-fluid-sm font-medium">{p.description ?? "Płatność"}</span>
                    <span className="text-fluid-xs text-ink-500">
                      {new Date(p.created_at).toLocaleString("pl-PL")}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      tone={
                        p.status === "succeeded"
                          ? "success"
                          : p.status === "failed"
                            ? "warning"
                            : "neutral"
                      }
                      withDot
                    >
                      {p.status}
                    </Badge>
                    <span className="text-fluid-sm font-semibold">{formatPLN(p.amount_grosze)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
