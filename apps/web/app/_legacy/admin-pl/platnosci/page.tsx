import type { Metadata } from "next";
import Link from "next/link";

import { requireAdminOrRedirect } from "@/lib/admin/rbac";
import { createSupabaseAdminClient } from "@/lib/db/supabase-server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AdminRefundForm } from "./refund-form";

export const metadata: Metadata = {
  title: "Płatności — Admin",
  robots: { index: false, follow: false },
};

export const revalidate = 30;
export const dynamic = "force-dynamic";

function formatPLN(grosze: number): string {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
    minimumFractionDigits: 2,
  }).format(grosze / 100);
}

function formatPL(date: string): string {
  return new Intl.DateTimeFormat("pl-PL", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(date));
}

const STATUS_TONE: Record<
  string,
  "info" | "success" | "warning" | "danger" | "neutral"
> = {
  pending: "neutral",
  completed: "success",
  failed: "danger",
  refunded: "warning",
  expired: "neutral",
};

export default async function AdminPaymentsPage() {
  const admin = await requireAdminOrRedirect();
  const isFullAdmin = admin.role === "admin";
  const supabase = createSupabaseAdminClient();

  // Last 100 payments (most recent first) + count of refunds.
  const { data: payments } = await supabase
    .from("payments")
    .select(
      "id, user_id, case_id, amount, currency, vat_rate, status, product_name, customer_type, invoice_nip, stripe_payment_intent_id, paid_at, refunded_at, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(100);

  // Pull associated refunds for these payments
  const paymentIds = (payments ?? []).map((p) => p.id);
  const { data: refunds } = paymentIds.length
    ? await supabase
        .from("refunds")
        .select("payment_id, amount, status, stripe_refund_id, created_at, reason")
        .in("payment_id", paymentIds)
        .order("created_at", { ascending: false })
    : { data: [] as Array<{
        payment_id: string;
        amount: number;
        status: string;
        stripe_refund_id: string | null;
        created_at: string;
        reason: string | null;
      }> };

  const refundsByPayment = new Map<
    string,
    Array<{
      payment_id: string;
      amount: number;
      status: string;
      stripe_refund_id: string | null;
      created_at: string;
      reason: string | null;
    }>
  >();
  for (const r of refunds ?? []) {
    const arr = refundsByPayment.get(r.payment_id) ?? [];
    arr.push(r);
    refundsByPayment.set(r.payment_id, arr);
  }

  // Aggregate metrics
  const completed = (payments ?? []).filter((p) => p.status === "completed");
  const refundedTotal = (refunds ?? [])
    .filter((r) => r.status === "succeeded")
    .reduce((sum, r) => sum + r.amount, 0);
  const revenueGrosze = completed.reduce((sum, p) => sum + p.amount, 0);
  const netRevenue = revenueGrosze - refundedTotal;

  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="text-fluid-xs font-semibold uppercase tracking-wider text-dlugomat-600 dark:text-dlugomat-300">
          Płatności i refundy
        </p>
        <h1 className="mt-1 font-serif text-fluid-3xl font-semibold text-iron-900 dark:text-white">
          Płatności
        </h1>
        <p className="mt-2 max-w-2xl text-fluid-sm text-iron-600 dark:text-iron-300">
          Ostatnie 100 transakcji. Refundy w pełnej lub częściowej kwocie —
          tylko pełen admin (audyt w <code>case_events</code>).
        </p>
      </header>

      {/* Tier 4 zad. 165 — payment analytics tile */}
      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-fluid-sm font-medium text-iron-600 dark:text-iron-300">
              Przychód (ostatnie 100)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-serif text-fluid-3xl font-semibold text-iron-900 dark:text-white">
              {formatPLN(revenueGrosze)}
            </div>
            <p className="mt-1 text-fluid-xs text-iron-500">
              {completed.length} zakończonych transakcji
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-fluid-sm font-medium text-iron-600 dark:text-iron-300">
              Refundy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-serif text-fluid-3xl font-semibold text-iron-900 dark:text-white">
              {formatPLN(refundedTotal)}
            </div>
            <p className="mt-1 text-fluid-xs text-iron-500">
              {(refunds ?? []).filter((r) => r.status === "succeeded").length}{" "}
              udanych refundów
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-fluid-sm font-medium text-iron-600 dark:text-iron-300">
              Przychód netto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-serif text-fluid-3xl font-semibold text-accent-700 dark:text-accent-300">
              {formatPLN(netRevenue)}
            </div>
            <p className="mt-1 text-fluid-xs text-iron-500">
              Po odjęciu udanych refundów
            </p>
          </CardContent>
        </Card>
      </section>

      <section>
        <Card>
          <CardHeader>
            <CardTitle className="text-fluid-base">
              Ostatnie 100 płatności
            </CardTitle>
            <CardDescription className="text-fluid-xs">
              Refund możliwy tylko dla płatności o statusie{" "}
              <code>completed</code> z payment_intent_id. Refund tworzy event
              w audicie i wywołuje Stripe API natychmiast.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] border-collapse text-fluid-xs">
                <thead className="border-b border-iron-200 text-iron-600 dark:border-iron-800 dark:text-iron-400">
                  <tr className="text-left">
                    <th className="py-2 pr-4">Data</th>
                    <th className="py-2 pr-4">Produkt</th>
                    <th className="py-2 pr-4">Klient</th>
                    <th className="py-2 pr-4 text-right">Kwota</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2 pr-4">Refundy</th>
                    <th className="py-2">Akcje</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-iron-100 dark:divide-iron-900">
                  {(payments ?? []).map((p) => {
                    const paymentRefunds = refundsByPayment.get(p.id) ?? [];
                    const refundedSum = paymentRefunds
                      .filter((r) => r.status === "succeeded")
                      .reduce((s, r) => s + r.amount, 0);
                    const canRefund =
                      isFullAdmin &&
                      p.status === "completed" &&
                      p.stripe_payment_intent_id &&
                      refundedSum < p.amount;

                    return (
                      <tr
                        key={p.id}
                        className="align-top text-iron-800 dark:text-iron-200"
                      >
                        <td className="py-2 pr-4 font-mono text-iron-600 dark:text-iron-400">
                          {formatPL(p.created_at)}
                        </td>
                        <td className="py-2 pr-4">
                          <div className="font-medium">{p.product_name}</div>
                          {p.case_id && (
                            <Link
                              href={`/admin/sprawy/${p.case_id}`}
                              className="text-fluid-xs text-dlugomat-600 hover:underline dark:text-dlugomat-300"
                            >
                              sprawa →
                            </Link>
                          )}
                        </td>
                        <td className="py-2 pr-4 font-mono text-iron-600 dark:text-iron-400">
                          {p.customer_type === "b2b" ? (
                            <>
                              <span className="font-semibold">B2B</span>
                              <br />
                              {p.invoice_nip ?? "brak NIP"}
                            </>
                          ) : (
                            "B2C"
                          )}
                        </td>
                        <td className="py-2 pr-4 text-right font-mono font-semibold">
                          {formatPLN(p.amount)}
                          <div className="font-normal text-iron-500">
                            VAT {p.vat_rate}%
                          </div>
                        </td>
                        <td className="py-2 pr-4">
                          <Badge tone={STATUS_TONE[p.status] ?? "neutral"}>
                            {p.status}
                          </Badge>
                        </td>
                        <td className="py-2 pr-4">
                          {paymentRefunds.length === 0 ? (
                            <span className="text-iron-400">—</span>
                          ) : (
                            <ul className="space-y-0.5 font-mono text-fluid-xs">
                              {paymentRefunds.map((r) => (
                                <li key={r.stripe_refund_id ?? r.created_at}>
                                  {formatPLN(r.amount)}{" "}
                                  <Badge
                                    tone={
                                      r.status === "succeeded"
                                        ? "success"
                                        : r.status === "failed"
                                          ? "danger"
                                          : "neutral"
                                    }
                                  >
                                    {r.status}
                                  </Badge>
                                </li>
                              ))}
                            </ul>
                          )}
                        </td>
                        <td className="py-2">
                          {canRefund ? (
                            <AdminRefundForm
                              paymentId={p.id}
                              fullAmount={p.amount}
                              alreadyRefunded={refundedSum}
                              productName={p.product_name}
                            />
                          ) : (
                            <span className="text-iron-400">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {(payments ?? []).length === 0 && (
              <p className="py-6 text-center text-fluid-sm text-iron-500">
                Brak płatności do wyświetlenia.
              </p>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
