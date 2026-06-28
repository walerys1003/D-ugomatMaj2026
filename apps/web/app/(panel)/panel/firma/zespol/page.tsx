import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";
import { getActiveOrgForUser } from "@/lib/orgs/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Zespol firmy - panel firmy | Dlugomat",
  description: "Zarzadzanie uzytkownikami firmy: role, uprawnienia, zaproszenia, audyt logowan.",
};

const ROLE_LABELS: Record<string, string> = {
  owner: "Wlasciciel",
  admin: "Administrator",
  member: "Czlonek",
  viewer: "Obserwator",
  billing: "Rozliczenia",
};

const roleTone: Record<string, "neutral" | "info" | "success" | "warning" | "danger"> = {
  owner: "info",
  admin: "info",
  member: "neutral",
  viewer: "neutral",
  billing: "neutral",
};

function fmtDate(value: string | null): string {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function fmtDay(value: string | null): string {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("pl-PL", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function roleLabel(role: string): string {
  return ROLE_LABELS[role] ?? role;
}

export default async function FirmaZespolPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in?next=/panel/firma/zespol");
  }

  const org = await getActiveOrgForUser(user.id);

  if (!org) {
    return (
      <div className="space-y-8 px-6 py-8 lg:px-10">
        <header className="space-y-2">
          <Badge tone="info" withDot>
            Panel firmy - administracja
          </Badge>
          <h1 className="font-display text-3xl text-dlugomat-900">Zespol firmy</h1>
        </header>
        <EmptyState
          title="Brak organizacji"
          description="Twoje konto nie jest przypisane do zadnej organizacji firmowej. Utworz organizacje lub popros administratora o zaproszenie."
        />
      </div>
    );
  }

  const [{ data: membersData }, { data: invitesData }] = await Promise.all([
    supabase
      .from("org_memberships")
      .select("user_id, role, joined_at, last_active_at")
      .eq("org_id", org.id)
      .order("joined_at", { ascending: true }),
    supabase
      .from("org_invitations")
      .select("id, email, role, accepted_at, expires_at, created_at")
      .eq("org_id", org.id)
      .is("accepted_at", null)
      .order("created_at", { ascending: false }),
  ]);

  const members = membersData ?? [];
  const now = Date.now();
  const pending = (invitesData ?? []).filter((inv) => {
    const exp = new Date(inv.expires_at).getTime();
    return Number.isNaN(exp) ? true : exp > now;
  });

  const seatsTotal = org.seats_purchased ?? 0;
  const seatsUsed = members.length;

  return (
    <div className="space-y-8 px-6 py-8 lg:px-10">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <Badge tone="info" withDot>
            Panel firmy - administracja
          </Badge>
          <h1 className="font-display text-3xl text-dlugomat-900">Zespol firmy</h1>
          <p className="max-w-2xl text-sm text-dlugomat-600">
            Zarzadzaj rolami i uprawnieniami uzytkownikow w organizacji <strong>{org.name}</strong>.
            Deleguj sprawy do operatorow i kontroluj dostepy do raportow finansowych.
          </p>
        </div>
        <Button variant="primary" size="md" asChild>
          <a href="/panel/organizacja/zespol">Zapros uzytkownika</a>
        </Button>
      </header>

      <section aria-label="Statystyki zespolu" className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card elevation="subtle" className="p-5">
          <p className="text-xs uppercase tracking-wide text-dlugomat-500">Uzytkownikow aktywnych</p>
          <p className="mt-2 font-display text-2xl text-dlugomat-900">{seatsUsed}</p>
        </Card>
        <Card elevation="subtle" className="p-5">
          <p className="text-xs uppercase tracking-wide text-dlugomat-500">Zaproszenia oczekujace</p>
          <p className="mt-2 font-display text-2xl text-dlugomat-900">{pending.length}</p>
        </Card>
        <Card elevation="subtle" className="p-5">
          <p className="text-xs uppercase tracking-wide text-dlugomat-500">Plan</p>
          <p className="mt-2 font-display text-2xl text-dlugomat-900 capitalize">{org.plan}</p>
        </Card>
        <Card elevation="subtle" className="p-5">
          <p className="text-xs uppercase tracking-wide text-dlugomat-500">Limit planu</p>
          <p className="mt-2 font-display text-2xl text-dlugomat-900">
            {seatsTotal > 0 ? `${seatsTotal} osob` : "-"}
          </p>
        </Card>
      </section>

      <section aria-label="Lista zespolu">
        <Card elevation="subtle" className="overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-dlugomat-50 text-xs uppercase tracking-wide text-dlugomat-500">
              <tr>
                <th className="px-6 py-3">Uzytkownik</th>
                <th className="px-6 py-3">Rola</th>
                <th className="px-6 py-3">Dolaczyl</th>
                <th className="px-6 py-3">Ostatnia aktywnosc</th>
                <th className="px-6 py-3 text-right">Akcje</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dlugomat-100">
              {members.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-sm text-dlugomat-500">
                    Brak czlonkow w tej organizacji.
                  </td>
                </tr>
              ) : (
                members.map((u) => (
                  <tr key={u.user_id} className="text-dlugomat-700">
                    <td className="px-6 py-3">
                      <div className="font-medium text-dlugomat-900">
                        {u.user_id === user.id ? "Ty" : "Uzytkownik"}
                      </div>
                      <div className="font-mono text-xs text-dlugomat-500">{u.user_id.slice(0, 8)}</div>
                    </td>
                    <td className="px-6 py-3">
                      <Badge tone={roleTone[u.role] ?? "neutral"}>{roleLabel(u.role)}</Badge>
                    </td>
                    <td className="px-6 py-3 text-xs">{fmtDay(u.joined_at)}</td>
                    <td className="px-6 py-3 text-xs">{fmtDate(u.last_active_at)}</td>
                    <td className="px-6 py-3 text-right">
                      <a
                        href="/panel/organizacja/zespol"
                        className="text-xs font-medium text-accent-600 hover:underline"
                      >
                        Zarzadzaj
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </Card>
      </section>

      {pending.length > 0 ? (
        <section aria-label="Zaproszenia oczekujace">
          <Card elevation="subtle" className="p-6">
            <h2 className="font-display text-lg text-dlugomat-900">Zaproszenia oczekujace</h2>
            <ul className="mt-4 space-y-3 text-sm">
              {pending.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between rounded-md bg-dlugomat-50 px-4 py-3"
                >
                  <div>
                    <div className="font-medium text-dlugomat-900">{p.email}</div>
                    <div className="text-xs text-dlugomat-500">
                      Rola: {roleLabel(p.role)} - wyslano {fmtDay(p.created_at)} - wygasa{" "}
                      {fmtDay(p.expires_at)}
                    </div>
                  </div>
                  <Badge tone="warning">Oczekuje</Badge>
                </li>
              ))}
            </ul>
          </Card>
        </section>
      ) : null}
    </div>
  );
}
