import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { fetchCurrentOrg } from "@/lib/orgs/membership";

export const metadata: Metadata = { title: "Rozliczenia | Organizacja | Długomat" };

interface Invoice {
  id: string;
  number: string;
  amount_pln: number;
  status: "paid" | "open" | "overdue" | "void";
  issued_at: string;
  due_at: string;
  pdf_url: string;
}

async function fetchInvoices(): Promise<Invoice[]> {
  try {
    const res = await fetch("/api/orgs/billing/invoices", { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return data.invoices ?? [];
  } catch {
    return [];
  }
}

const STATUS_BADGE: Record<Invoice["status"], string> = {
  paid: "bg-accent-50 text-accent-700 border-accent-200",
  open: "bg-warn-50 text-warn-700 border-warn-200",
  overdue: "bg-danger-50 text-danger-700 border-danger-200",
  void: "bg-ink-100 text-ink-600 border-ink-200",
};

const STATUS_LABEL: Record<Invoice["status"], string> = {
  paid: "Opłacona",
  open: "Otwarta",
  overdue: "Zaległa",
  void: "Anulowana",
};

export default async function BillingPage() {
  const [org, invoices] = await Promise.all([fetchCurrentOrg(), fetchInvoices()]);
  if (!org) {
    return (
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <p className="text-ink-600">Brak aktywnej organizacji.</p>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-6xl space-y-6">
      <div>
        <Link href="/panel/organizacja" className="text-xs text-ink-500 hover:text-ink-700">
          ← Organizacja
        </Link>
        <h1 className="font-display text-3xl font-semibold text-ink-900 dark:text-ink-50 mt-2">
          Rozliczenia
        </h1>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card elevation="pop">
          <CardHeader>
            <CardTitle>Aktualny plan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="text-xs uppercase tracking-wider text-ink-500">Plan</div>
              <div className="font-display text-2xl font-semibold text-ink-900 dark:text-ink-50 capitalize">
                {org.plan}
              </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-ink-500 mb-1">
                Wykorzystanie miejsc
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="flex-1 h-2 rounded-full bg-ink-100 dark:bg-ink-800 overflow-hidden">
                  <div
                    className="h-full bg-accent-600"
                    style={{ width: `${(org.seats_used / org.seats_total) * 100}%` }}
                  />
                </div>
                <span className="text-ink-700 dark:text-ink-300 font-medium">
                  {org.seats_used} / {org.seats_total}
                </span>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Link href="/cennik">
                <Button variant="primary">Zmień plan</Button>
              </Link>
              <form method="post" action="/api/orgs/billing/portal">
                <Button type="submit" variant="secondary">
                  Portal klienta
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>

        <Card elevation="subtle">
          <CardHeader>
            <CardTitle>Dane do faktury</CardTitle>
          </CardHeader>
          <CardContent>
            <form method="post" action="/api/orgs/billing/details" className="space-y-3 text-sm">
              <Field label="Nazwa firmy" name="company_name" />
              <Field label="NIP" name="tax_id" placeholder="123-456-78-90" />
              <Field label="Adres" name="address_line" />
              <Field label="Kod / miasto" name="postal_city" />
              <Button type="submit" variant="secondary">
                Zapisz
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card elevation="subtle">
        <CardHeader>
          <CardTitle>Faktury</CardTitle>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <p className="text-sm text-ink-500">Brak faktur.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b border-ink-200 dark:border-ink-800 text-xs uppercase tracking-wider text-ink-500">
                    <th className="py-2 pr-3">Numer</th>
                    <th className="py-2 pr-3">Kwota</th>
                    <th className="py-2 pr-3">Status</th>
                    <th className="py-2 pr-3">Termin</th>
                    <th className="py-2 pr-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="border-b border-ink-100 dark:border-ink-900">
                      <td className="py-2.5 pr-3 font-mono text-xs text-ink-900 dark:text-ink-50">
                        {inv.number}
                      </td>
                      <td className="py-2.5 pr-3 font-medium text-ink-900 dark:text-ink-50">
                        {inv.amount_pln.toLocaleString("pl-PL")} zł
                      </td>
                      <td className="py-2.5 pr-3">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_BADGE[inv.status]}`}
                        >
                          {STATUS_LABEL[inv.status]}
                        </span>
                      </td>
                      <td className="py-2.5 pr-3 text-ink-600 dark:text-ink-400">
                        {new Date(inv.due_at).toLocaleDateString("pl-PL")}
                      </td>
                      <td className="py-2.5 pr-3 text-right">
                        <a
                          href={inv.pdf_url}
                          className="text-xs text-accent-700 hover:text-accent-800"
                        >
                          Pobierz PDF
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}

function Field({
  label,
  name,
  placeholder,
}: {
  label: string;
  name: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-ink-700 dark:text-ink-300 mb-1 block">
        {label}
      </span>
      <input
        type="text"
        name={name}
        placeholder={placeholder}
        className="w-full rounded-lg border border-ink-300 dark:border-ink-700 bg-white dark:bg-ink-900 px-3 py-2 focus:outline-none focus-visible:shadow-shield-focus"
      />
    </label>
  );
}
