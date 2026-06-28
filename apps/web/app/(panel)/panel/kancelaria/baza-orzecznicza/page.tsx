import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Baza orzecznicza - kancelaria | Dlugomat",
  description: "Wyszukiwarka orzeczen i odwolan prawnych z bazy Dlugomat.",
};

function fmtDay(value: string | null): string {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("pl-PL", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default async function KancelariaBazaOrzeczniczaPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in?next=/panel/kancelaria/baza-orzecznicza");

  const { data: refsData } = await supabase
    .from("legal_references")
    .select("id, citation, signature, abbreviation, ref_type, legal_area, publication_date, verified")
    .order("publication_date", { ascending: false, nullsFirst: false })
    .limit(50);

  const refs = refsData ?? [];

  return (
    <div className="space-y-8 px-6 py-8 lg:px-10">
      <header className="space-y-2">
        <Badge tone="info" withDot>
          Kancelaria
        </Badge>
        <h1 className="font-display text-3xl text-dlugomat-900">Baza orzecznicza</h1>
        <p className="max-w-2xl text-sm text-dlugomat-600">
          Orzeczenia i odwolania prawne dostepne w bazie Dlugomat.
        </p>
      </header>

      <section aria-label="Lista orzeczen">
        {refs.length === 0 ? (
          <EmptyState
            title="Brak orzeczen w bazie"
            description="Baza orzecznicza nie zawiera jeszcze zadnych rekordow."
          />
        ) : (
          <Card elevation="subtle" className="overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-dlugomat-50 text-xs uppercase tracking-wide text-dlugomat-500">
                <tr>
                  <th className="px-6 py-3">Sygnatura / cytat</th>
                  <th className="px-6 py-3">Typ</th>
                  <th className="px-6 py-3">Obszar</th>
                  <th className="px-6 py-3">Data</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dlugomat-100">
                {refs.map((r) => (
                  <tr key={r.id} className="text-dlugomat-700">
                    <td className="px-6 py-3 font-medium text-dlugomat-900">
                      <Link
                        href={`/panel/baza-orzecznicza/${r.id}`}
                        className="hover:text-accent-600 hover:underline"
                      >
                        {r.signature ?? r.abbreviation ?? r.citation}
                      </Link>
                    </td>
                    <td className="px-6 py-3 text-xs">{r.ref_type ?? "-"}</td>
                    <td className="px-6 py-3 text-xs">{r.legal_area ?? "-"}</td>
                    <td className="px-6 py-3 text-xs">{fmtDay(r.publication_date)}</td>
                    <td className="px-6 py-3">
                      {r.verified ? (
                        <Badge tone="success">zweryfikowane</Badge>
                      ) : (
                        <Badge tone="neutral">niezweryfikowane</Badge>
                      )}
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
