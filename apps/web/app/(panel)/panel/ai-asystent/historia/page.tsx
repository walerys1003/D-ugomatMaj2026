import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { MessageSquare, History } from "lucide-react";

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
  title: "Historia rozmów — AI asystent",
  description: "Poprzednie rozmowy z asystentem prawnym Długomat.",
};

export default async function AiAsystentHistoriaPage() {
  const sb = await createSupabaseServerClient();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) {
    redirect("/logowanie?next=/panel/ai-asystent/historia");
  }

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.18em] text-ink-500">
          AI asystent · historia
        </p>
        <h1 className="font-display text-fluid-h1 text-dlugomat-950">
          Twoje rozmowy
        </h1>
        <p className="max-w-2xl text-ink-600">
          Historia rozmów z asystentem prawnym.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Historia rozmów</CardTitle>
          <CardDescription>
            Rozmowy z asystentem prawnym
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={<History className="h-5 w-5" />}
            title="Brak zapisanych rozmów"
            description="Trwałe przechowywanie historii rozmów z asystentem AI nie jest jeszcze włączone. Rozmowy są obecnie ulotne (per sesja). Rozpocznij nową rozmowę, aby skorzystać z asystenta."
            action={
              <Button asChild>
                <Link href="/panel/ai-asystent">
                  <MessageSquare className="mr-2 h-4 w-4" aria-hidden />
                  Nowa rozmowa
                </Link>
              </Button>
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}
