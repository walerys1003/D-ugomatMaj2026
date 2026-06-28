import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Gauge } from "lucide-react";

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
  title: "Limity · Organizacja · Długomat",
};

function fmtDay(value: string | null): string {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("pl-PL", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default async function LimityPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in?next=/panel/organizacja/limity");

  const { data: usage } = await supabase
    .from("subscription_usage")
    .select("period_start, period_end, cases_created, ai_generations")
    .eq("user_id", user.id)
    .order("period_start", { ascending: false })
    .limit(1)
    .maybeSingle();

  const items = usage
    ? [
        { id: "cases", resource: "Utworzone sprawy w okresie", used: usage.cases_created ?? 0, unit: "spraw" },
        {
          id: "ai",
          resource: "Generacje AI w okresie",
          used: usage.ai_generations ?? 0,
          unit: "generacji",
        },
      ]
    : [];

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8">
      <header className="flex flex-col gap-2">
        <p className="text-fluid-sm font-semibold uppercase tracking-wider text-dlugomat-600">
          Organizacja
        </p>
        <h1 className="text-fluid-3xl font-bold tracking-tight text-dlugomat-900 dark:text-white">
          Limity i zużycie
        </h1>
        <p className="max-w-2xl text-fluid-base text-ink-600 dark:text-ink-300">
          Aktualne wykorzystanie zasobów w bieżącym okresie rozliczeniowym.
          {usage
            ? ` Okres: ${fmtDay(usage.period_start)} – ${fmtDay(usage.period_end)}.`
            : ""}
        </p>
      </header>

      {!usage ? (
        <EmptyState
          title="Brak danych o zużyciu"
          description="Nie zarejestrowano jeszcze żadnego zużycia w bieżącym okresie rozliczeniowym. Liczniki pojawią się po pierwszej aktywności."
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {items.map((l) => (
            <Card key={l.id} elevation="subtle">
              <CardHeader>
                <span className="text-fluid-xs font-semibold uppercase tracking-wider text-ink-500">
                  {l.resource}
                </span>
                <CardTitle className="mt-2 text-fluid-2xl tabular-nums">
                  {l.used.toLocaleString("pl-PL")}{" "}
                  <span className="text-fluid-base font-medium text-ink-500">{l.unit}</span>
                </CardTitle>
                <CardDescription>
                  {fmtDay(usage.period_start)} – {fmtDay(usage.period_end)}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      <Card elevation="subtle">
        <CardHeader>
          <span
            aria-hidden
            className="grid size-9 place-items-center rounded-lg bg-dlugomat-100 text-dlugomat-700 dark:bg-dlugomat-850 dark:text-dlugomat-300"
          >
            <Gauge className="size-5" />
          </span>
          <CardTitle className="mt-2 text-fluid-lg">Plan i rozliczenia</CardTitle>
          <CardDescription>
            Szczegóły planu oraz historię faktur znajdziesz w sekcji rozliczeń.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link
            href="/panel/organizacja/billing"
            className="inline-flex items-center gap-1 text-fluid-sm font-semibold text-dlugomat-600 hover:underline"
          >
            Przejdź do rozliczeń
            <ArrowRight className="size-4" />
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
