import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ArrowDownRight, ArrowUpRight, Wallet, FileText, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";

export const metadata: Metadata = {
  title: "Finanse — panel",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const fmtPLN = new Intl.NumberFormat("pl-PL", {
  style: "currency",
  currency: "PLN",
  maximumFractionDigits: 2,
});

interface Transaction {
  id: string;
  date: string;
  desc: string;
  category: "pismo" | "splata" | "zwrot" | "konsultacja";
  amount: number; // w PLN (już przeliczone z groszy)
  invoice_no: string | null;
  invoice_url: string | null;
  status: "rozliczone" | "oczekuje" | "anulowane";
}

const CATEGORY_LABEL: Record<Transaction["category"], string> = {
  pismo: "Pismo",
  splata: "Splata zadluzenia",
  zwrot: "Zwrot",
  konsultacja: "Konsultacja",
};

const CATEGORY_TONE: Record<Transaction["category"], "info" | "warning" | "success" | "neutral"> = {
  pismo: "info",
  splata: "warning",
  zwrot: "success",
  konsultacja: "neutral",
};

const STATUS_TONE: Record<Transaction["status"], "success" | "warning" | "danger"> = {
  rozliczone: "success",
  oczekuje: "warning",
  anulowane: "danger",
};

function categorizeProduct(productType: string): Transaction["category"] {
  const p = productType.toLowerCase();
  if (p.includes("consult") || p.includes("konsult")) return "konsultacja";
  if (p.includes("refund") || p.includes("zwrot")) return "zwrot";
  if (p.includes("plan") || p.includes("rata") || p.includes("splat"))
    return "splata";
  return "pismo";
}

function mapPaymentStatus(status: string): Transaction["status"] {
  if (status === "completed" || status === "paid") return "rozliczone";
  if (status === "pending") return "oczekuje";
  return "anulowane";
}

export default async function FinansePage() {
  const supabase = createSupabaseServerClient();
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) redirect("/logowanie?next=/panel/finanse");

  const { data: payments } = await supabase
    .from("payments")
    .select(
      "id, created_at, paid_at, amount, product_type, product_name, status, fakturownia_invoice_number, fakturownia_invoice_url, refunded_at",
    )
    .order("created_at", { ascending: false })
    .limit(100);

  const TX: Transaction[] = (payments ?? []).map((p) => {
    const isRefund = p.refunded_at != null;
    const category = isRefund ? "zwrot" : categorizeProduct(p.product_type);
    // amount jest w groszach; zwroty pokazujemy jako dodatnie, opłaty jako ujemne.
    const pln = (p.amount ?? 0) / 100;
    return {
      id: p.id,
      date: (p.paid_at ?? p.created_at).slice(0, 10),
      desc: p.product_name ?? "Płatność",
      category,
      amount: category === "zwrot" ? Math.abs(pln) : -Math.abs(pln),
      invoice_no: p.fakturownia_invoice_number,
      invoice_url: p.fakturownia_invoice_url,
      status: mapPaymentStatus(p.status),
    };
  });

  const totalSpent = TX.filter((t) => t.amount < 0 && t.status === "rozliczone").reduce((s, t) => s + Math.abs(t.amount), 0);
  const totalReturned = TX.filter((t) => t.amount > 0 && t.status === "rozliczone").reduce((s, t) => s + t.amount, 0);
  const pendingTotal = TX.filter((t) => t.status === "oczekuje").reduce((s, t) => s + Math.abs(t.amount), 0);
  const pismaCount = TX.filter((t) => t.category === "pismo").length;

  return (
    <div className="space-y-6">
      <Link href="/panel" className="inline-flex items-center gap-2 text-sm text-ink-600 hover:text-dlugomat-900">
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Powrot do panelu
      </Link>

      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-ink-500">Finanse</p>
          <h1 className="font-display text-fluid-h1 text-dlugomat-950 flex items-center gap-3">
            <Wallet className="h-7 w-7 text-dlugomat-700" aria-hidden />
            Twoje finanse
          </h1>
          <p className="mt-1 text-sm text-ink-600">Wszystkie transakcje, faktury i splaty w jednym miejscu.</p>
        </div>
        <Button variant="secondary">
          <Download className="mr-2 h-4 w-4" aria-hidden />
          Eksport CSV
        </Button>
      </header>

      <section className="grid gap-4 lg:grid-cols-4" aria-label="KPI finansowe">
        <Card>
          <CardHeader>
            <CardDescription>Wydane (rozliczone)</CardDescription>
            <CardTitle className="font-display text-fluid-h3 text-dlugomat-950">{fmtPLN.format(totalSpent)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-ink-500 flex items-center gap-1">
              <ArrowDownRight className="h-3 w-3" aria-hidden />
              Ostatnie 30 dni
            </p>
          </CardContent>
        </Card>
        <Card urgency="success">
          <CardHeader>
            <CardDescription>Zwrocone</CardDescription>
            <CardTitle className="font-display text-fluid-h3 text-accent-700">{fmtPLN.format(totalReturned)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-ink-500 flex items-center gap-1">
              <ArrowUpRight className="h-3 w-3" aria-hidden />
              Zwroty oplat sadowych
            </p>
          </CardContent>
        </Card>
        <Card urgency={pendingTotal > 0 ? "warning" : "none"}>
          <CardHeader>
            <CardDescription>Oczekuje na platnosc</CardDescription>
            <CardTitle className="font-display text-fluid-h3 text-warn">{fmtPLN.format(pendingTotal)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-ink-500">{TX.filter((t) => t.status === "oczekuje").length} pozycja</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Pisma w tym roku</CardDescription>
            <CardTitle className="font-display text-fluid-h3 text-dlugomat-950">{pismaCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-ink-500">Z fakturami VAT</p>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-dlugomat-700" aria-hidden />
            Historia transakcji
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {TX.length === 0 ? (
            <div className="p-6">
              <EmptyState
                title="Brak transakcji"
                description="Gdy opłacisz pierwsze pismo lub usługę, pojawi się tu historia płatności i faktury VAT."
              />
            </div>
          ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-ink-100 bg-ink-50/50 text-xs uppercase tracking-wide text-ink-600">
              <tr>
                <th className="px-5 py-2 text-left font-medium">Data</th>
                <th className="px-5 py-2 text-left font-medium">Opis</th>
                <th className="px-5 py-2 text-left font-medium">Kategoria</th>
                <th className="px-5 py-2 text-right font-medium">Kwota</th>
                <th className="px-5 py-2 text-left font-medium">FV</th>
                <th className="px-5 py-2 text-left font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {TX.map((t) => (
                <tr key={t.id}>
                  <td className="px-5 py-3 font-mono text-xs text-ink-600">{t.date}</td>
                  <td className="px-5 py-3 text-dlugomat-900">{t.desc}</td>
                  <td className="px-5 py-3">
                    <Badge tone={CATEGORY_TONE[t.category]}>{CATEGORY_LABEL[t.category]}</Badge>
                  </td>
                  <td className={`px-5 py-3 text-right font-mono ${t.amount > 0 ? "text-accent-700" : "text-dlugomat-900"}`}>
                    {t.amount > 0 ? "+" : ""}{fmtPLN.format(t.amount)}
                  </td>
                  <td className="px-5 py-3 font-mono text-xs text-ink-600">
                    {t.invoice_url && t.invoice_no ? (
                      <a
                        href={t.invoice_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-dlugomat-700 underline-offset-2 hover:underline"
                      >
                        {t.invoice_no}
                      </a>
                    ) : (
                      t.invoice_no ?? "—"
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <Badge tone={STATUS_TONE[t.status]} withDot>{t.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
