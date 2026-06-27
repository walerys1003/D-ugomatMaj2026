import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";

import { Badge } from "@/components/ui/badge";
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
  title: "Edytor roli RBAC — Admin",
  robots: { index: false, follow: false },
};

interface PageProps {
  params: Promise<{ role: string }>;
}

interface PolicyRow {
  id: string;
  name: string;
  effect: "allow" | "deny";
  actions: string[];
  resources: string[];
  priority: number;
  enabled: boolean;
}

export default async function RbacRoleEditorPage({ params }: PageProps) {
  const { role } = await params;
  const supabase = await createSupabaseServerClient();

  // rbac_policies nie ma kolumny "role" — dopasowujemy po nazwie polityki
  // zawierajacej identyfikator roli (realne dane, bez fabrykacji).
  const { data: policiesData } = await supabase
    .from("rbac_policies")
    .select("id, name, effect, actions, resources, priority, enabled")
    .ilike("name", `%${role}%`)
    .order("priority", { ascending: false })
    .limit(100);

  const policies: PolicyRow[] = (policiesData ?? []).map((p) => ({
    id: p.id,
    name: p.name,
    effect: p.effect,
    actions: Array.isArray(p.actions) ? p.actions : [],
    resources: Array.isArray(p.resources) ? p.resources : [],
    priority: p.priority,
    enabled: p.enabled,
  }));

  const allowCount = policies.filter((p) => p.effect === "allow" && p.enabled).length;
  const denyCount = policies.filter((p) => p.effect === "deny" && p.enabled).length;

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin/rbac"
          className="inline-flex items-center gap-2 rounded text-sm text-ink-600 hover:text-dlugomat-900 focus-visible:shadow-shield-focus focus-visible:outline-none"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Wróć do listy ról
        </Link>
      </div>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.18em] text-ink-500">
            RBAC · polityki dla roli · {role}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-fluid-h1 text-dlugomat-950 capitalize">{role}</h1>
            <Badge tone="info">polityki ABAC/RBAC</Badge>
          </div>
          <p className="max-w-2xl text-ink-600">
            Polityki dostępu dopasowane do tej roli na podstawie rejestru rbac_policies.
          </p>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-3" aria-label="KPI roli">
        <Card>
          <CardHeader>
            <CardDescription>
              <Shield className="mr-1 inline h-3 w-3" aria-hidden />
              Polityki łącznie
            </CardDescription>
            <CardTitle className="font-display text-fluid-h2 text-dlugomat-950">
              {policies.length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Aktywne „allow”</CardDescription>
            <CardTitle className="font-display text-fluid-h2 text-accent-700">
              {allowCount}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Aktywne „deny”</CardDescription>
            <CardTitle className="font-display text-fluid-h2 text-dlugomat-950">
              {denyCount}
            </CardTitle>
          </CardHeader>
        </Card>
      </section>

      {policies.length === 0 ? (
        <EmptyState
          title="Brak polityk dla tej roli"
          description="Nie znaleziono żadnych polityk RBAC dopasowanych do tej roli w rejestrze rbac_policies."
        />
      ) : (
        <ul className="space-y-4" aria-label="Polityki RBAC">
          {policies.map((p) => (
            <li key={p.id}>
              <Card>
                <CardHeader>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <CardTitle>{p.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge tone={p.effect === "allow" ? "success" : "danger"}>{p.effect}</Badge>
                      {p.enabled ? (
                        <Badge tone="info">aktywna</Badge>
                      ) : (
                        <Badge tone="neutral">wyłączona</Badge>
                      )}
                      <Badge tone="neutral">priorytet {p.priority}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div>
                    <span className="text-xs uppercase tracking-wide text-ink-500">Akcje: </span>
                    <span className="font-mono text-xs">
                      {p.actions.length > 0 ? p.actions.join(", ") : "—"}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs uppercase tracking-wide text-ink-500">Zasoby: </span>
                    <span className="font-mono text-xs">
                      {p.resources.length > 0 ? p.resources.join(", ") : "—"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
