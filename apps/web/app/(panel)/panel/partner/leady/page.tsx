import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Leady | Partner | Długomat" };

function fmtDate(value: string | null): string {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("pl-PL", { day: "2-digit", month: "2-digit", year: "numeric" });
}

const STATUS_LABEL: Record<string, string> = {
  signed_up: "Zarejestrowany",
  converted: "Konwersja",
  expired: "Wygasły",
};

const STATUS_TONE: Record<string, "neutral" | "info" | "success"> = {
  signed_up: "info",
  converted: "success",
  expired: "neutral",
};

export default async function PartnerLeadyPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in?next=/panel/partner/leady");

  const { data: account } = await supabase
    .from("affiliate_accounts")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  let referrals: {
    id: string;
    user_id: string;
    status: string;
    attributed_at: string;
    converted_at: string | null;
  }[] = [];

  if (account) {
    const { data } = await supabase
      .from("affiliate_referrals")
      .select("id, user_id, status, attributed_at, converted_at")
      .eq("affiliate_id", account.id)
      .order("attributed_at", { ascending: false })
      .limit(200);
    referrals = data ?? [];
  }

  return (
    <main className="container mx-auto max-w-5xl space-y-6 px-4 py-8">
      <div>
        <Link href="/panel/partner" className="text-xs text-ink-500 hover:text-ink-700">
          ← Panel partnera
        </Link>
        <h1 className="mt-2 font-display text-3xl font-semibold text-ink-900 dark:text-ink-50">
          Leady partnerskie
        </h1>
        <p className="mt-1 text-sm text-ink-500">
          Użytkownicy polecani przez Twój link partnerski wraz ze statusem atrybucji.
        </p>
      </div>

      {!account ? (
        <EmptyState
          title="Brak konta partnerskiego"
          description="Aby śledzić leady, dołącz najpierw do programu partnerskiego."
        />
      ) : referrals.length === 0 ? (
        <EmptyState
          title="Brak leadów"
          description="Nie zarejestrowano jeszcze żadnych poleceń przez Twój link partnerski."
        />
      ) : (
        <Card elevation="subtle" className="overflow-hidden">
          <CardHeader>
            <CardTitle className="text-fluid-lg">Polecenia</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto p-0">
            <table className="w-full text-fluid-sm">
              <thead className="border-y border-ink-200 bg-ink-50/60 dark:border-dlugomat-800 dark:bg-dlugomat-900/40">
                <tr className="text-left text-ink-600 dark:text-ink-300">
                  <th className="px-5 py-3 font-semibold">Użytkownik</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Atrybucja</th>
                  <th className="px-5 py-3 font-semibold">Konwersja</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100 dark:divide-dlugomat-800">
                {referrals.map((r) => (
                  <tr key={r.id}>
                    <td className="px-5 py-3 font-mono text-xs">{r.user_id.slice(0, 8)}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${
                          STATUS_TONE[r.status] === "success"
                            ? "bg-emerald-50 text-emerald-700"
                            : STATUS_TONE[r.status] === "info"
                              ? "bg-accent-50 text-accent-700"
                              : "bg-ink-100 text-ink-600"
                        }`}
                      >
                        {STATUS_LABEL[r.status] ?? r.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs">{fmtDate(r.attributed_at)}</td>
                    <td className="px-5 py-3 text-xs">{fmtDate(r.converted_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
          <div className="border-t border-ink-100 p-4 dark:border-dlugomat-800">
            <Link href="/panel/partner/pipeline">
              <Button variant="ghost" size="sm">
                Zobacz pipeline
              </Button>
            </Link>
          </div>
        </Card>
      )}
    </main>
  );
}
