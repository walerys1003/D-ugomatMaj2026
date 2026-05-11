import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowDownRight, ArrowUpRight, Wallet, FileText, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Finanse — panel",
  robots: { index: false, follow: false },
};

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
  amount: number;
  invoice_no: string | null;
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

const TX: ReadonlyArray<Transaction> = [
  { id: "t1", date: "2026-05-09", desc: "Sprzeciw EPU — Bank PKO", category: "pismo", amount: -149, invoice_no: "FV/2026/05/0142", status: "rozliczone" },
  { id: "t2", date: "2026-05-05", desc: "Rata 3/12 — wierzyciel Provident", category: "splata", amount: -780, invoice_no: null, status: "rozliczone" },
  { id: "t3", date: "2026-05-02", desc: "Konsultacja z prawnikiem", category: "konsultacja", amount: -99, invoice_no: "FV/2026/05/0089", status: "rozliczone" },
  { id: "t4", date: "2026-04-28", desc: "Zwrot oplaty sadowej", category: "zwrot", amount: 200, invoice_no: null, status: "rozliczone" },
  { id: "t5", date: "2026-04-22", desc: "Pakiet komorniczy (4 pisma)", category: "pismo", amount: -199, invoice_no: "FV/2026/04/0411", status: "rozliczone" },
  { id: "t6", date: "2026-04-14", desc: "Rata 2/12 — wierzyciel Provident", category: "splata", amount: -780, invoice_no: null, status: "rozliczone" },
  { id: "t7", date: "2026-05-14", desc: "Rata 4/12 — wierzyciel Provident", category: "splata", amount: -780, invoice_no: null, status: "oczekuje" },
];

export default function FinansePage() {
  const totalSpent = TX.filter((t) => t.amount < 0 && t.status === "rozliczone").reduce((s, t) => s + Math.abs(t.amount), 0);
  const totalReturned = TX.filter((t) => t.amount > 0 && t.status === "rozliczone").reduce((s, t) => s + t.amount, 0);
  const pendingTotal = TX.filter((t) => t.status === "oczekuje").reduce((s, t) => s + Math.abs(t.amount), 0);
  const pismaCount = TX.filter((t) => t.category === "pismo").length;

  return (
    <div className="space-y-6">
      <Link href="/panel" className="inline-flex items-center gap-2 text-sm text-iron-600 hover:text-dlugomat-900">
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Powrot do panelu
      </Link>

      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-iron-500">Finanse</p>
          <h1 className="font-display text-fluid-h1 text-dlugomat-950 flex items-center gap-3">
            <Wallet className="h-7 w-7 text-dlugomat-700" aria-hidden />
            Twoje finanse
          </h1>
          <p className="mt-1 text-sm text-iron-600">Wszystkie transakcje, faktury i splaty w jednym miejscu.</p>
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
            <p className="text-xs text-iron-500 flex items-center gap-1">
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
            <p className="text-xs text-iron-500 flex items-center gap-1">
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
            <p className="text-xs text-iron-500">{TX.filter((t) => t.status === "oczekuje").length} pozycja</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Pisma w tym roku</CardDescription>
            <CardTitle className="font-display text-fluid-h3 text-dlugomat-950">{pismaCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-iron-500">Z fakturami VAT</p>
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
          <table className="w-full text-sm">
            <thead className="border-b border-iron-100 bg-iron-50/50 text-xs uppercase tracking-wide text-iron-600">
              <tr>
                <th className="px-5 py-2 text-left font-medium">Data</th>
                <th className="px-5 py-2 text-left font-medium">Opis</th>
                <th className="px-5 py-2 text-left font-medium">Kategoria</th>
                <th className="px-5 py-2 text-right font-medium">Kwota</th>
                <th className="px-5 py-2 text-left font-medium">FV</th>
                <th className="px-5 py-2 text-left font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-iron-100">
              {TX.map((t) => (
                <tr key={t.id}>
                  <td className="px-5 py-3 font-mono text-xs text-iron-600">{t.date}</td>
                  <td className="px-5 py-3 text-dlugomat-900">{t.desc}</td>
                  <td className="px-5 py-3">
                    <Badge tone={CATEGORY_TONE[t.category]}>{CATEGORY_LABEL[t.category]}</Badge>
                  </td>
                  <td className={`px-5 py-3 text-right font-mono ${t.amount > 0 ? "text-accent-700" : "text-dlugomat-900"}`}>
                    {t.amount > 0 ? "+" : ""}{fmtPLN.format(t.amount)}
                  </td>
                  <td className="px-5 py-3 font-mono text-xs text-iron-600">{t.invoice_no ?? "—"}</td>
                  <td className="px-5 py-3">
                    <Badge tone={STATUS_TONE[t.status]} withDot>{t.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
