import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Pipeline · Partner · Długomat",
  description:
    "Lejek poleconych użytkowników: od rejestracji po konwersję na płatny plan.",
};

type RefStatus = "signed_up" | "converted" | "expired";

const STAGES: {
  key: RefStatus;
  label: string;
  tone: "neutral" | "info" | "warning" | "success" | "danger";
}[] = [
  { key: "signed_up", label: "Zarejestrowani", tone: "info" },
  { key: "converted", label: "Konwersja (płatni)", tone: "success" },
  { key: "expired", label: "Wygasłe", tone: "neutral" },
];

function fmtDate(value: string | null): string {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("pl-PL", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default async function PartnerPipelinePage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/logowanie?next=/panel/partner/pipeline");

  const { data: account } = await supabase
    .from("affiliate_accounts")
    .select("id, status")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!account) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <header className="flex flex-col gap-2">
          <p className="text-fluid-sm font-semibold uppercase tracking-wider text-dlugomat-600">
            Partner · Sprzedaż
          </p>
          <h1 className="text-fluid-3xl font-bold tracking-tight text-dlugomat-900 dark:text-white">
            Pipeline
          </h1>
        </header>
        <EmptyState
          title="Brak konta partnerskiego"
          description="Aby zobaczyć lejek poleconych użytkowników, dołącz najpierw do programu partnerskiego."
        />
      </div>
    );
  }

  const { data: referralsData } = await supabase
    .from("affiliate_referrals")
    .select("id, user_id, status, attributed_at, converted_at, attribution_expires_at")
    .eq("affiliate_id", account.id)
    .order("attributed_at", { ascending: false })
    .limit(500);

  const referrals = referralsData ?? [];
  const total = referrals.length;
  const converted = referrals.filter((r) => r.status === "converted").length;
  const convRate = total > 0 ? Math.round((converted / total) * 100) : 0;

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8">
      <header className="flex flex-col gap-2">
        <p className="text-fluid-sm font-semibold uppercase tracking-wider text-dlugomat-600">
          Partner · Sprzedaż
        </p>
        <h1 className="text-fluid-3xl font-bold tracking-tight text-dlugomat-900 dark:text-white">
          Pipeline
        </h1>
        <p className="max-w-2xl text-fluid-base text-ink-600 dark:text-ink-300">
          Lejek poleconych użytkowników na podstawie realnych atrybucji z programu
          partnerskiego: od rejestracji po konwersję na płatny plan.
        </p>
      </header>

      <section aria-label="Podsumowanie pipeline" className="grid gap-3 sm:grid-cols-3">
        <Stat label="Poleconych łącznie" value={String(total)} hint="Atrybuowani użytkownicy" />
        <Stat label="Konwersje" value={String(converted)} hint="Płatni klienci" />
        <Stat label="Wskaźnik konwersji" value={`${convRate}%`} hint="Konwersja / łącznie" />
      </section>

      {total === 0 ? (
        <EmptyState
          title="Brak poleconych użytkowników"
          description="Udostępniaj swój link partnerski, aby pozyskiwać polecenia. Pojawią się tutaj wraz ze statusem konwersji."
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-3">
          {STAGES.map((s) => {
            const items = referrals.filter((r) => r.status === s.key);
            return (
              <section
                key={s.key}
                aria-label={`Etap ${s.label}`}
                className="flex flex-col gap-2 rounded-xl border border-ink-200 bg-ink-50/40 p-3 dark:border-ink-800 dark:bg-dlugomat-900/30"
              >
                <header className="flex items-center justify-between">
                  <Badge tone={s.tone} withDot>
                    {s.label}
                  </Badge>
                  <span className="text-fluid-xs tabular-nums text-ink-500">{items.length}</span>
                </header>
                <ul className="flex flex-col gap-2">
                  {items.length === 0 ? (
                    <li className="rounded-md border border-dashed border-ink-200 p-3 text-center text-fluid-xs text-ink-500 dark:border-dlugomat-800">
                      Brak pozycji
                    </li>
                  ) : (
                    items.map((r) => (
                      <li key={r.id}>
                        <Card elevation="flat" className="bg-white dark:bg-ink-950">
                          <CardContent className="flex flex-col gap-1 p-3">
                            <span className="font-mono text-fluid-sm font-semibold text-ink-900 dark:text-ink-50">
                              {r.user_id.slice(0, 8)}
                            </span>
                            <span className="text-fluid-xs text-ink-500">
                              Atrybucja: {fmtDate(r.attributed_at)}
                            </span>
                            {r.converted_at ? (
                              <span className="text-fluid-xs text-emerald-600">
                                Konwersja: {fmtDate(r.converted_at)}
                              </span>
                            ) : (
                              <span className="text-fluid-xs text-ink-500">
                                Wygasa: {fmtDate(r.attribution_expires_at)}
                              </span>
                            )}
                          </CardContent>
                        </Card>
                      </li>
                    ))
                  )}
                </ul>
              </section>
            );
          })}
        </div>
      )}

      <Card elevation="subtle">
        <CardHeader>
          <CardTitle className="text-fluid-lg">Jak działa atrybucja</CardTitle>
          <CardDescription>
            Polecenie liczy się od momentu rejestracji przez Twój link i wygasa po
            okresie atrybucji. Konwersja następuje po pierwszej płatności.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="secondary">
            <Link href="/panel/partner/raporty">
              Zobacz raporty
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <Card elevation="subtle">
      <CardContent className="flex flex-col gap-1 p-5">
        <span className="text-fluid-xs font-semibold uppercase tracking-wider text-ink-500">
          {label}
        </span>
        <span className="text-fluid-2xl font-bold tabular-nums text-ink-900 dark:text-ink-50">
          {value}
        </span>
        <span className="text-fluid-xs text-ink-500">{hint}</span>
      </CardContent>
    </Card>
  );
}
