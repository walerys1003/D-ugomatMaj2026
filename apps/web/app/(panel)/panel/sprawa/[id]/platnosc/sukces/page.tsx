import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, FileDown, ReceiptText } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";
import { getCaseById } from "@/lib/cases/case-repository";
import { formatDateTimePL } from "@/lib/utils";
import { formatPriceGrosze } from "@/lib/payments/pricing";

export const metadata: Metadata = {
  title: "Płatność potwierdzona · Długomat",
  robots: { index: false, follow: false },
};

interface Props {
  params: { id: string };
  searchParams: { session_id?: string };
}

/**
 * Strona "po sukcesie" Stripe Checkout.
 *
 * UWAGA o race condition: webhook może jeszcze nie dotrzeć w momencie
 * gdy user wraca na tę stronę. Dlatego:
 *  - jeśli payments.status !== 'completed' → pokazujemy "Przetwarzamy…" + meta-refresh
 *  - jeśli 'completed' → pełne potwierdzenie + link do faktury i pisma
 */
export default async function PlatnoscSukcesPage({
  params,
  searchParams,
}: Props) {
  const sessionId = searchParams.session_id;
  if (!sessionId) notFound();

  const caseRow = await getCaseById(params.id);
  if (!caseRow) notFound();

  const supabase = createSupabaseServerClient();

  // Lookup payment via stripe_session_id (RLS — user widzi tylko swoje)
  const { data: payment } = await supabase
    .from("payments")
    .select(
      "id, status, amount, currency, paid_at, case_id, product_name, fakturownia_invoice_url, fakturownia_invoice_number",
    )
    .eq("stripe_session_id", sessionId)
    .maybeSingle();

  // Race condition: webhook może jeszcze nie dotrzeć przed redirectem.
  // Pokazujemy "Przetwarzamy…" i refreshujemy się co 3s przez meta-refresh.
  const isStillPending =
    !payment ||
    (payment.status !== "completed" && payment.status !== "refunded");

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {isStillPending && (
        // 3-sekundowy auto-refresh aż webhook zaktualizuje status
        <meta httpEquiv="refresh" content="3" />
      )}

      <Card urgency={isStillPending ? "info" : "success"} elevation="pop">
        <CardHeader className="text-center">
          {isStillPending ? (
            <>
              <div className="mx-auto mb-3 size-12 rounded-full bg-shield-100 p-3 text-shield-700 dark:bg-shield-900/40 dark:text-shield-300">
                <ReceiptText className="size-6" aria-hidden />
              </div>
              <CardTitle>Przetwarzamy płatność…</CardTitle>
              <CardDescription>
                Stripe potwierdza transakcję — to potrwa kilka sekund.
                Strona odświeży się automatycznie.
              </CardDescription>
            </>
          ) : (
            <>
              <div className="mx-auto mb-3 size-12 rounded-full bg-hope-100 p-3 text-hope-700 dark:bg-hope-900/40 dark:text-hope-300">
                <CheckCircle2 className="size-6" aria-hidden />
              </div>
              <CardTitle>Płatność zaksięgowana</CardTitle>
              <CardDescription>
                Dziękujemy. Twoje pismo jest gotowe do pobrania, a faktura VAT
                zostanie dosłana e-mailem.
              </CardDescription>
            </>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          {payment && (
            <dl className="grid gap-2 rounded-xl border border-ink-200 bg-ink-50/60 p-4 text-fluid-sm dark:border-ink-800 dark:bg-ink-900/40">
              <div className="flex justify-between gap-3">
                <dt className="text-ink-600 dark:text-ink-400">Produkt</dt>
                <dd className="text-right font-medium text-ink-900 dark:text-ink-100">
                  {payment.product_name}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-ink-600 dark:text-ink-400">Kwota</dt>
                <dd className="text-right font-medium text-ink-900 dark:text-ink-100">
                  {formatPriceGrosze(payment.amount)}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-ink-600 dark:text-ink-400">Status</dt>
                <dd className="text-right">
                  <Badge tone={isStillPending ? "info" : "success"}>
                    {isStillPending ? "Przetwarzanie" : "Opłacono"}
                  </Badge>
                </dd>
              </div>
              {payment.paid_at && (
                <div className="flex justify-between gap-3">
                  <dt className="text-ink-600 dark:text-ink-400">
                    Czas zapłaty
                  </dt>
                  <dd className="text-right text-ink-800 dark:text-ink-200">
                    {formatDateTimePL(new Date(payment.paid_at))}
                  </dd>
                </div>
              )}
              {payment.fakturownia_invoice_number && (
                <div className="flex justify-between gap-3">
                  <dt className="text-ink-600 dark:text-ink-400">
                    Faktura VAT
                  </dt>
                  <dd className="text-right text-ink-800 dark:text-ink-200">
                    {payment.fakturownia_invoice_url ? (
                      <a
                        href={payment.fakturownia_invoice_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-shield-700 underline-offset-2 hover:underline dark:text-shield-400"
                      >
                        {payment.fakturownia_invoice_number}
                      </a>
                    ) : (
                      payment.fakturownia_invoice_number
                    )}
                  </dd>
                </div>
              )}
            </dl>
          )}

          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href={`/panel/sprawa/${params.id}`}>
                <FileDown className="mr-2 size-4" />
                Otwórz pismo
              </Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/panel">Wróć do panelu</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <p className="text-center text-fluid-xs text-ink-500 dark:text-ink-400">
        Jeżeli faktura nie pojawi się w ciągu 5 minut — napisz na{" "}
        <a
          href="mailto:pomoc@dlugomat.pl"
          className="underline underline-offset-2"
        >
          pomoc@dlugomat.pl
        </a>
        . Wystawimy ją ręcznie tego samego dnia.
      </p>
    </div>
  );
}
