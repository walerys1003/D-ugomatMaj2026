import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Zespol prawnikow - kancelaria | Dlugomat",
  description: "Zarzadzanie zespolem prawnikow, aplikantow i pracownikow administracyjnych kancelarii.",
};

export default async function KancelariaZespolPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in?next=/panel/kancelaria/zespol");

  return (
    <div className="space-y-8 px-6 py-8 lg:px-10">
      <header className="space-y-2">
        <Badge tone="info" withDot>
          Kancelaria
        </Badge>
        <h1 className="font-display text-3xl text-dlugomat-900">Zespol prawnikow</h1>
        <p className="max-w-2xl text-sm text-dlugomat-600">
          Zarzadzanie zespolem prawnikow, aplikantow i pracownikow administracyjnych kancelarii.
        </p>
      </header>

      <Card elevation="subtle" className="p-6">
        <EmptyState
          title="Brak czlonkow zespolu"
          description="Modul zespolu kancelarii nie zawiera jeszcze zadnych rekordow. Zarzadzanie uzytkownikami organizacji dostepne jest w panelu organizacji."
        />
      </Card>
    </div>
  );
}
