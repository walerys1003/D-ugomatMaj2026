import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";

export const metadata: Metadata = {
  title: "Faktury i rozliczenia - panel firmy | Dlugomat",
  description: "Twoje faktury i platnosci za uslugi Dlugomat.",
};

export const dynamic = "force-dynamic";

const statusTone: Record<string, "neutral" | "info" | "success" | "warning" | "danger"> = {
  "do zaplaty": "warning",
  zaplacona: "success",
  przeterminowana: "danger",
  zwrocona: "neutral",
};

function mapStatus(s: string): string {
  const v = s.toLowerCase();
  if (v.includes("paid") || v.includes("succ") || v.includes("complete")) return "zaplacona";
  if (v.includes("refund")) return "zwrocona";
  if (v.includes("fail") || v.includes("cancel")) return "przeterminowana";
  return "do zaplaty";
}

const currency = new Intl.NumberFormat("pl-PL", { style: "currency", currency: "PLN", maximumFractionDigits: 0 });
const fmtDate = (iso: string | null) =>
  iso ? new Intl.DateTimeFormat("pl-PL", { dateStyle: "short" }).format(new Date(iso)) : "—";

export default async function FirmaFakturyPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/logowanie?next=/panel/firma/faktury");

  const { data: paymentsRaw } = await supabase
    .from("payments")
    .select(
      "id, amount, status, product_name, invoice_company_name, fakturownia_invoice_number, fakturownia_invoice_url, created_at, paid_at",
    )
    .order("created_at", { ascending: false })
    .limit(100);

  const invoices = (paymentsRaw ?? []).map((p) => ({
    id: p.fakturownia_invoice_number ?? p.id.slice(0, 12),
    issuer: p.invoice_company_name ?? "Dlugomat sp. z o.o.",
    subject: p.product_name,
    amount: (p.amount ?? 0) / 100,
    due: fmtDate(p.paid_at ?? p.created_at),
    status: mapStatus(p.status),
    pdfUrl: p.fakturownia_invoice_url,
  }));

  const paidSum = invoices.filter((i) => i.status === "zaplacona").reduce((s, i) => s + i.amount, 0);
  const dueSum = invoices.filter((i) => i.status === "do zaplaty").reduce((s, i) => s + i.amount, 0);
  const overdueSum = invoices
    .filter((i) => i.status === "przeterminowana")
    .reduce((s, i) => s + i.amount, 0);

  const summary = [
    { label: "Do zaplaty", value: currency.format(dueSum), tone: "warning" as const, note: `${invoices.filter((i) => i.status === "do zaplaty").length} faktur` },
    { label: "Zaplacone", value: currency.format(paidSum), tone: "success" as const, note: `${invoices.filter((i) => i.status === "zaplacona").length} faktur` },
    { label: "Nieudane/przeterm.", value: currency.format(overdueSum), tone: overdueSum > 0 ? "danger" as const : "success" as const, note: overdueSum > 0 ? "Wymaga uwagi" : "Wszystko zgodne" },
    { label: "Wszystkie pozycje", value: String(invoices.length), tone: "neutral" as const, note: "ostatnie 100" },
  ];

  return (
    <div className="space-y-8 px-6 py-8 lg:px-10">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <Badge tone="info" withDot>
            Panel firmy - finanse
          </Badge>
          <h1 className="font-display text-3xl text-dlugomat-900">Faktury i rozliczenia</h1>
          <p className="max-w-2xl text-sm text-dlugomat-600">
            Zarzadzaj kosztami platformy Dlugomat, faktury od kancelarii partnerskich, komornikow i zaliczki sadowe.
            Wszystkie dokumenty w jednym panelu - bez fragmentacji i potrzeby przelaczania systemow.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" size="md">Eksport ksiegowy</Button>
          <Button variant="primary" size="md">Dodaj fakture rozliczeniowa</Button>
        </div>
      </header>

      <section aria-label="Podsumowanie miesiaca" className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summary.map((s) => (
          <Card key={s.label} elevation="subtle" className="p-5">
            <p className="text-xs uppercase tracking-wide text-dlugomat-500">{s.label}</p>
            <p className="mt-2 font-display text-2xl text-dlugomat-900">{s.value}</p>
            <Badge tone={s.tone} className="mt-3">
              {s.note}
            </Badge>
          </Card>
        ))}
      </section>

      <section aria-label="Lista faktur">
        <Card elevation="subtle" className="overflow-hidden">
          <header className="flex items-center justify-between border-b border-dlugomat-100 px-6 py-4">
            <h2 className="font-display text-lg text-dlugomat-900">Faktury z ostatnich 60 dni</h2>
            <div className="flex items-center gap-2">
              <select
                aria-label="Filtr statusu"
                className="rounded-md border border-dlugomat-200 px-3 py-1.5 text-xs focus-visible:shadow-shield-focus"
              >
                <option>Wszystkie statusy</option>
                <option>Do zaplaty</option>
                <option>Zaplacone</option>
              </select>
              <select
                aria-label="Filtr wystawcy"
                className="rounded-md border border-dlugomat-200 px-3 py-1.5 text-xs focus-visible:shadow-shield-focus"
              >
                <option>Wszyscy wystawcy</option>
                <option>Dlugomat</option>
                <option>Kancelaria Kruk</option>
                <option>Kancelaria Nowak</option>
              </select>
            </div>
          </header>
          <table className="w-full text-left text-sm">
            <thead className="bg-dlugomat-50 text-xs uppercase tracking-wide text-dlugomat-500">
              <tr>
                <th className="px-6 py-3">Numer</th>
                <th className="px-6 py-3">Wystawca</th>
                <th className="px-6 py-3">Tytul</th>
                <th className="px-6 py-3">Kwota</th>
                <th className="px-6 py-3">Termin</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Akcje</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dlugomat-100">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-sm text-dlugomat-500">
                    Brak faktur. Pozycje pojawia sie po pierwszej platnosci za uslugi Dlugomat.
                  </td>
                </tr>
              ) : (
                invoices.map((iv) => (
                  <tr key={iv.id} className="text-dlugomat-700">
                    <td className="px-6 py-3 font-mono text-xs text-dlugomat-900">{iv.id}</td>
                    <td className="px-6 py-3">{iv.issuer}</td>
                    <td className="px-6 py-3 text-xs">{iv.subject}</td>
                    <td className="px-6 py-3 font-mono">{currency.format(iv.amount)}</td>
                    <td className="px-6 py-3 text-xs">{iv.due}</td>
                    <td className="px-6 py-3">
                      <Badge tone={statusTone[iv.status] ?? "neutral"}>{iv.status}</Badge>
                    </td>
                    <td className="px-6 py-3 text-right">
                      {iv.pdfUrl ? (
                        <a href={iv.pdfUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-accent-600 hover:underline">
                          PDF
                        </a>
                      ) : (
                        <span className="text-xs text-dlugomat-400">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </Card>
      </section>
    </div>
  );
}
