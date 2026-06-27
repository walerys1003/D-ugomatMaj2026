import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Pisma procesowe - kancelaria | Dlugomat",
  description: "Generator pism procesowych, wzory i dokumenty wychodzace z kancelarii.",
};

export default async function KancelariaPismaPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/logowanie?next=/panel/kancelaria/pisma");

  return (
    <div className="space-y-8 px-6 py-8 lg:px-10">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <Badge tone="info" withDot>
            Kancelaria
          </Badge>
          <h1 className="font-display text-3xl text-dlugomat-900">Pisma procesowe</h1>
          <p className="max-w-2xl text-sm text-dlugomat-600">
            Generator pism procesowych i dokumenty wychodzace z kancelarii.
          </p>
        </div>
        <Button variant="primary" size="md" asChild>
          <a href="/panel/kreator">Nowe pismo w kreatorze</a>
        </Button>
      </header>

      <Card elevation="subtle" className="p-6">
        <EmptyState
          title="Brak pism"
          description="Modul pism kancelaryjnych nie zawiera jeszcze zadnych rekordow. Pisma generowane w kreatorze beda dostepne w sekcji dokumentow."
        />
      </Card>
    </div>
  );
}
