import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Kalendarz rozpraw - kancelaria | Dlugomat",
  description: "Kalendarz rozpraw sadowych, terminow procesowych i posiedzen.",
};

export default async function KancelariaRozprawyPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in?next=/panel/kancelaria/rozprawy");

  return (
    <div className="space-y-8 px-6 py-8 lg:px-10">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <Badge tone="info" withDot>
            Kancelaria
          </Badge>
          <h1 className="font-display text-3xl text-dlugomat-900">Kalendarz rozpraw</h1>
          <p className="max-w-2xl text-sm text-dlugomat-600">
            Kalendarz rozpraw sadowych, terminow procesowych i posiedzen.
          </p>
        </div>
        <Button variant="secondary" size="md" asChild>
          <a href="/panel/kalendarz">Otworz kalendarz terminow</a>
        </Button>
      </header>

      <Card elevation="subtle" className="p-6">
        <EmptyState
          title="Brak zaplanowanych rozpraw"
          description="Modul rozpraw kancelaryjnych nie zawiera jeszcze zadnych rekordow. Terminy procesowe znajdziesz w kalendarzu terminow."
        />
      </Card>
    </div>
  );
}
