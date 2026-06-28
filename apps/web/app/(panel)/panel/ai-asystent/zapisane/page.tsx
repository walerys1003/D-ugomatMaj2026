import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Bookmark, Sparkles } from "lucide-react";

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
  title: "Zapisane prompty — AI asystent",
  description: "Twoje ulubione zapytania i szablony rozmów z asystentem prawnym.",
};

export default async function ZapisanePage() {
  const sb = await createSupabaseServerClient();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) {
    redirect("/sign-in?next=/panel/ai-asystent/zapisane");
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.18em] text-ink-500">
            AI asystent · biblioteka promptów
          </p>
          <h1 className="font-display text-fluid-h1 text-dlugomat-950">
            Zapisane prompty
          </h1>
          <p className="max-w-2xl text-ink-600">
            Twoje sprawdzone szablony zapytań do asystenta prawnego.
          </p>
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Biblioteka promptów</CardTitle>
          <CardDescription>
            Zapisane szablony zapytań
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={<Bookmark className="h-5 w-5" />}
            title="Brak zapisanych promptów"
            description="Nie masz jeszcze żadnych zapisanych szablonów zapytań. Funkcja zapisywania promptów nie jest jeszcze dostępna — w międzyczasie możesz rozpocząć rozmowę z asystentem."
            action={
              <Button asChild>
                <Link href="/panel/ai-asystent">
                  <Sparkles className="mr-2 h-4 w-4" aria-hidden />
                  Otwórz asystenta
                </Link>
              </Button>
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}
