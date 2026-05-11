import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, CreditCard, Download, FileText, RotateCcw, User } from "lucide-react";

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
  title: "Płatność — szczegóły",
  robots: { index: false, follow: false },
};

interface PageProps {
  params: Promise<{ id: string }>;
}

interface PaymentDetail {
  id: string;
  user_id: string;
  user_email: string;
  amount_pln: number;
  currency: "PLN";
  status: "succeeded" | "pending" | "failed" | "refunded";
  method: "card" | "blik" | "p24" | "transfer";
  card_brand?: string;
  card_last4?: string;
  invoice_no: string | null;
  description: string;
  created_at: string;
  processor: "Stripe" | "Przelewy24";
  processor_id: string;
  refund_amount_pln: number;
  events: Array<{ ts: string; type: string; note?: string }>;
}

const STATUS_TONE: Record<
  PaymentDetail["status"],
  "success" | "info" | "danger" | "warning"
> = {
  succeeded: "success",
  pending: "info",
  failed: "danger",
  refunded: "warning",
};

function fmtPLN(n: number): string {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
    maximumFractionDigits: 2,
  }).format(n);
}

function fmtDate(iso: string): string {
  return new Intl.DateTimeFormat("pl-PL", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

async function loadPayment(id: string): Promise<PaymentDetail> {
  return {
    id,
    user_id: "usr_a1b2",
    user_email: "anna.kowalska@example.pl",
    amount_pln: 399,
    currency: "PLN",
    status: "succeeded",
    method: "card",
    card_brand: "Visa",
    card_last4: "4242",
    invoice_no: "FV/2026/05/0142",
    description: "Plan Pro — abonament miesięczny",
    created_at: "2026-05-08T10:18:00Z",
    processor: "Stripe",
    processor_id: "pi_3O9k2xLpQ8mQ",
    refund_amount_pln: 0,
    events: [
      { ts: "2026-05-08T10:18:00Z", type: "payment_intent.created" },
      { ts: "2026-05-08T10:18:14Z", type: "payment_intent.succeeded" },
      { ts: "2026-05-08T10:18:22Z", type: "invoice.finalized", note: "FV/2026/05/0142" },
      { ts: "2026-05-08T10:18:23Z", type: "email.sent", note: "invoice → anna.kowalska@example.pl" },
    ],
  };
}

export default async function AdminPaymentDetailPage({ params }: PageProps) {
  const { id } = await params;
  const p = await loadPayment(id);

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin/platnosci"
          className="inline-flex items-center gap-2 text-sm text-iron-600 hover:text-dlugomat-900 focus-visible:outline-none focus-visible:shadow-shield-focus rounded"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Wróć do listy płatności
        </Link>
      </div>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.18em] text-iron-500">
            Płatność · {p.id}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-fluid-h1 text-dlugomat-950">
              {fmtPLN(p.amount_pln)}
            </h1>
            <Badge tone={STATUS_TONE[p.status]} withDot>
              {p.status === "succeeded"
                ? "zrealizowana"
                : p.status === "pending"
                ? "oczekująca"
                : p.status === "failed"
                ? "nieudana"
                : "zwrócona"}
            </Badge>
          </div>
          <p className="text-iron-600">{p.description}</p>
        </div>
        <div className="flex gap-2">
          {p.invoice_no ? (
            <Button variant="secondary">
              <Download className="mr-2 h-4 w-4" aria-hidden />
              Pobierz fakturę
            </Button>
          ) : null}
          {p.status === "succeeded" && p.refund_amount_pln === 0 ? (
            <Button variant="danger">
              <RotateCcw className="mr-2 h-4 w-4" aria-hidden />
              Wykonaj zwrot
            </Button>
          ) : null}
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Szczegóły transakcji</CardTitle>
            <CardDescription>
              Dane procesora płatności, metody i powiązań księgowych.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-4 sm:grid-cols-2 text-sm">
              <Row label="Kwota" value={fmtPLN(p.amount_pln)} />
              <Row label="Waluta" value={p.currency} />
              <Row
                label="Metoda"
                value={
                  p.method === "card"
                    ? `${p.card_brand ?? "Karta"} •••• ${p.card_last4 ?? "0000"}`
                    : p.method === "blik"
                    ? "BLIK"
                    : p.method === "p24"
                    ? "Przelewy24"
                    : "Przelew tradycyjny"
                }
                icon={CreditCard}
              />
              <Row label="Procesor" value={`${p.processor} · ${p.processor_id}`} />
              <Row label="Faktura" value={p.invoice_no ?? "—"} icon={FileText} />
              <Row label="Data" value={fmtDate(p.created_at)} />
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Klient</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="flex items-center gap-2 text-dlugomat-900">
              <User className="h-4 w-4 text-iron-500" aria-hidden />
              {p.user_email}
            </p>
            <p className="text-xs text-iron-500">ID: {p.user_id}</p>
            <Button variant="ghost" size="sm" block asChild>
              <Link href={`/admin/uzytkownicy/${p.user_id}`}>Profil użytkownika</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Oś czasu zdarzeń</CardTitle>
          <CardDescription>Wszystkie webhooki i powiadomienia powiązane z transakcją.</CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="relative border-l border-iron-200 pl-6 space-y-4">
            {p.events.map((ev, i) => (
              <li key={i}>
                <span
                  className="absolute -left-[5px] mt-1.5 inline-block h-2.5 w-2.5 rounded-full bg-dlugomat-700"
                  aria-hidden
                />
                <p className="text-sm font-medium text-dlugomat-900">{ev.type}</p>
                <p className="text-xs text-iron-500">{fmtDate(ev.ts)}</p>
                {ev.note ? <p className="text-xs text-iron-600 mt-1">{ev.note}</p> : null}
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}

function Row({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
}) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-iron-500">{label}</dt>
      <dd className="mt-1 flex items-center gap-2 text-dlugomat-900">
        {Icon ? <Icon className="h-4 w-4 text-iron-500" aria-hidden /> : null}
        <span>{value}</span>
      </dd>
    </div>
  );
}
