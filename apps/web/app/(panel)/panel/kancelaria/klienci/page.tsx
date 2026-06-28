import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Klienci kancelarii | Dlugomat",
  description: "Baza klientow kancelarii z portfelem spraw i historia rozliczen.",
};

export default async function KancelariaKlienciPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in?next=/panel/kancelaria/klienci");

  return (
    <div className="space-y-8 px-6 py-8 lg:px-10">
      <header className="space-y-2">
        <Badge tone="info" withDot>
          Kancelaria
        </Badge>
        <h1 className="font-display text-3xl text-dlugomat-900">Klienci kancelarii</h1>
        <p className="max-w-2xl text-sm text-dlugomat-600">
          Baza klientow kancelarii z portfelem spraw i historia rozliczen.
        </p>
      </header>

      <Card elevation="subtle" className="p-6">
        <EmptyState
          title="Brak klientow"
          description="Modul klientow kancelarii nie zawiera jeszcze zadnych rekordow. Po wdrozeniu rejestru klientow lista pojawi sie tutaj automatycznie."
        />
      </Card>
    </div>
  );
}
