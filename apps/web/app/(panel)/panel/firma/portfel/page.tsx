import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import type { CaseStatus } from "@/lib/db/types";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";
import { getActiveOrgForUser } from "@/lib/orgs/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Portfel spraw - panel firmy | Dlugomat",
  description: "Lista spraw windykacyjnych firmy z filtrami status, kwota.",
};

const statusLabel: Record<CaseStatus, string> = {
  draft: "Szkic",
  analysis: "Analiza",
  generated: "Wygenerowana",
  paid: "Oplacona",
  downloaded: "Pobrana",
  completed: "Zakonczona",
  archived: "Zarchiwizowana",
};

const statusTone: Record<CaseStatus, "neutral" | "info" | "success" | "warning" | "danger"> = {
  draft: "neutral",
  analysis: "info",
  generated: "info",
  paid: "success",
  downloaded: "success",
  completed: "success",
  archived: "neutral",
};

const currency = new Intl.NumberFormat("pl-PL", {
  style: "currency",
  currency: "PLN",
  maximumFractionDigits: 0,
});

function fmtDay(value: string | null): string {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("pl-PL", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default async function FirmaPortfelPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in?next=/panel/firma/portfel");
  }

  const org = await getActiveOrgForUser(user.id);

  if (!org) {
    return (
      <div className="space-y-8 px-6 py-8 lg:px-10">
        <header className="space-y-2">
          <Badge tone="info" withDot>
            Panel firmy
          </Badge>
          <h1 className="font-display text-3xl text-dlugomat-900">Portfel spraw</h1>
        </header>
        <EmptyState
          title="Brak organizacji"
          description="Twoje konto nie jest przypisane do zadnej organizacji firmowej. Portfel spraw jest dostepny po dolaczeniu do organizacji."
        />
      </div>
    );
  }

  const { data: casesData } = await supabase
    .from("cases")
    .select("id, title, type, status, pozwany_nazwa, kwota_razem, data_doreczenia, updated_at")
    .eq("org_id", org.id)
    .is("deleted_at", null)
    .order("updated_at", { ascending: false })
    .limit(200);

  const cases = casesData ?? [];

  return (
    <div className="space-y-8 px-6 py-8 lg:px-10">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <Badge tone="info" withDot>
            Panel firmy
          </Badge>
          <h1 className="font-display text-3xl text-dlugomat-900">Portfel spraw</h1>
          <p className="max-w-2xl text-sm text-dlugomat-600">
            Pelna lista postepowan organizacji <strong>{org.name}</strong> z mozliwoscia podgladu salda,
            statusu i kontrahenta. Dane pochodza z rejestru spraw firmy.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="primary" size="md" asChild>
            <Link href="/panel/kreator">Nowa sprawa</Link>
          </Button>
        </div>
      </header>

      <section aria-label="Lista spraw">
        {cases.length === 0 ? (
          <EmptyState
            title="Brak spraw w portfelu"
            description="W tej organizacji nie ma jeszcze zadnych spraw. Utworz pierwsza sprawe w kreatorze."
          />
        ) : (
          <Card elevation="subtle" className="overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-dlugomat-50 text-xs uppercase tracking-wide text-dlugomat-500">
                <tr>
                  <th className="px-6 py-3">Sprawa</th>
                  <th className="px-6 py-3">Dluznik</th>
                  <th className="px-6 py-3">Saldo</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Doreczono</th>
                  <th className="px-6 py-3">Aktualizacja</th>
                  <th className="px-6 py-3 text-right">Akcje</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dlugomat-100">
                {cases.map((c) => (
                  <tr key={c.id} className="text-dlugomat-700">
                    <td className="px-6 py-3">
                      <div className="font-medium text-dlugomat-900">{c.title || "Sprawa"}</div>
                      <div className="font-mono text-xs text-dlugomat-500">{c.id.slice(0, 8)}</div>
                    </td>
                    <td className="px-6 py-3 text-dlugomat-700">{c.pozwany_nazwa ?? "-"}</td>
                    <td className="px-6 py-3 font-mono">
                      {c.kwota_razem != null ? currency.format(c.kwota_razem / 100) : "-"}
                    </td>
                    <td className="px-6 py-3">
                      <Badge tone={statusTone[c.status]}>{statusLabel[c.status]}</Badge>
                    </td>
                    <td className="px-6 py-3 text-xs text-dlugomat-500">{fmtDay(c.data_doreczenia)}</td>
                    <td className="px-6 py-3 text-xs text-dlugomat-500">{fmtDay(c.updated_at)}</td>
                    <td className="px-6 py-3 text-right">
                      <Link
                        href={`/panel/sprawa/${c.id}`}
                        className="text-xs font-medium text-accent-600 hover:underline"
                      >
                        Otworz
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
      </section>
    </div>
  );
}
