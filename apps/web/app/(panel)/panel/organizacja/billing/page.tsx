import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";
import { getActiveOrgForUser } from "@/lib/orgs/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Rozliczenia | Organizacja | Długomat" };

interface Invoice {
  id: string;
  number: string;
  amount_pln: number;
  status: string;
  issued_at: string;
  pdf_url: string | null;
}

const STATUS_BADGE: Record<string, string> = {
  completed: "bg-accent-50 text-accent-700 border-accent-200",
  pending: "bg-warn-50 text-warn-700 border-warn-200",
  failed: "bg-danger-50 text-danger-700 border-danger-200",
  refunded: "bg-ink-100 text-ink-600 border-ink-200",
};

const STATUS_LABEL: Record<string, string> = {
  completed: "Opłacona",
  pending: "Oczekuje",
  failed: "Nieudana",
  refunded: "Zwrócona",
};

export default async function BillingPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/logowanie?next=/panel/organizacja/billing");

  const org = await getActiveOrgForUser(user.id);
  if (!org) {
    return (
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <p className="text-ink-600">Brak aktywnej organizacji.</p>
      </main>
    );
  }

  const [{ data: subscription }, { data: paymentsData }] = await Promise.all([
    supabase
      .from("subscriptions")
      .select("plan_code, plan_id, status, current_period_end")
      .eq("org_id", org.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("payments")
      .select(
        "id, amount, status, fakturownia_invoice_number, fakturownia_invoice_url, created_at",
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(100),
  ]);

  const planName = subscription?.plan_code ?? subscription?.plan_id ?? org.plan;
  const seatsTotal = org.seats_purchased ?? 0;

  const invoices: Invoice[] = (paymentsData ?? []).map((p) => ({
    id: p.id,
    number: p.fakturownia_invoice_number ?? p.id.slice(0, 8),
    amount_pln: (p.amount ?? 0) / 100,
    status: p.status,
    issued_at: p.created_at,
    pdf_url: p.fakturownia_invoice_url ?? null,
  }));

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
                {planName}
              </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-ink-500 mb-1">
                Status subskrypcji
              </div>
              <div className="text-sm text-ink-700 dark:text-ink-300">
                {subscription?.status ?? "Brak aktywnej subskrypcji"}
                {subscription?.current_period_end
                  ? ` · do ${new Date(subscription.current_period_end).toLocaleDateString("pl-PL")}`
                  : ""}
              </div>
              {seatsTotal > 0 ? (
                <div className="mt-1 text-xs text-ink-500">Miejsca w planie: {seatsTotal}</div>
              ) : null}
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
                    <th className="py-2 pr-3">Data</th>
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
                          className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_BADGE[inv.status] ?? "bg-ink-100 text-ink-600 border-ink-200"}`}
                        >
                          {STATUS_LABEL[inv.status] ?? inv.status}
                        </span>
                      </td>
                      <td className="py-2.5 pr-3 text-ink-600 dark:text-ink-400">
                        {new Date(inv.issued_at).toLocaleDateString("pl-PL")}
                      </td>
                      <td className="py-2.5 pr-3 text-right">
                        {inv.pdf_url ? (
                          <a
                            href={inv.pdf_url}
                            className="text-xs text-accent-700 hover:text-accent-800"
                          >
                            Pobierz PDF
                          </a>
                        ) : (
                          <span className="text-xs text-ink-400">—</span>
                        )}
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
