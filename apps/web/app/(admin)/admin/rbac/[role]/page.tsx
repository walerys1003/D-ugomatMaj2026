import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Lock, Save, Shield, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Edytor roli RBAC — Admin",
  robots: { index: false, follow: false },
};

interface PageProps {
  params: Promise<{ role: string }>;
}

interface PermissionGroup {
  id: string;
  label: string;
  perms: Array<{ id: string; label: string; description: string; granted: boolean }>;
}

interface RoleDetail {
  id: string;
  name: string;
  description: string;
  is_system: boolean;
  users_count: number;
  permissions: PermissionGroup[];
}

async function loadRole(roleId: string): Promise<RoleDetail> {
  return {
    id: roleId,
    name: roleId === "moderator" ? "Moderator" : roleId === "admin" ? "Administrator" : "Użytkownik",
    description: "Rola operacyjna z dostępem do obsługi spraw klientów oraz moderacji bazy wiedzy.",
    is_system: false,
    users_count: 18,
    permissions: [
      {
        id: "users",
        label: "Użytkownicy",
        perms: [
          { id: "users.read", label: "Odczyt", description: "Przeglądanie listy i profili kont", granted: true },
          { id: "users.update", label: "Edycja", description: "Aktualizacja danych konta (oprócz roli)", granted: true },
          { id: "users.delete", label: "Usuwanie", description: "Trwałe usunięcie konta (RODO art. 17)", granted: false },
          { id: "users.impersonate", label: "Impersonacja", description: "Wejście na konto w trybie read-only", granted: false },
        ],
      },
      {
        id: "cases",
        label: "Sprawy",
        perms: [
          { id: "cases.read", label: "Odczyt", description: "Przeglądanie wszystkich spraw", granted: true },
          { id: "cases.assign", label: "Przypisanie", description: "Przypisywanie prawnika do sprawy", granted: true },
          { id: "cases.status_change", label: "Zmiana statusu", description: "Aktualizacja statusu sprawy", granted: true },
          { id: "cases.delete", label: "Usuwanie", description: "Soft-delete sprawy z możliwością przywrócenia", granted: false },
        ],
      },
      {
        id: "payments",
        label: "Płatności",
        perms: [
          { id: "payments.read", label: "Odczyt", description: "Przeglądanie transakcji", granted: true },
          { id: "payments.refund", label: "Zwroty", description: "Wystawianie refundów (limit 5000 PLN)", granted: false },
          { id: "payments.export", label: "Eksport", description: "Eksport listy do CSV/XLSX", granted: true },
        ],
      },
      {
        id: "kb",
        label: "Baza wiedzy",
        perms: [
          { id: "kb.read", label: "Odczyt", description: "Przeglądanie artykułów (także szkiców)", granted: true },
          { id: "kb.write", label: "Edycja", description: "Tworzenie i modyfikacja artykułów", granted: true },
          { id: "kb.publish", label: "Publikacja", description: "Publikowanie i archiwizowanie artykułów", granted: true },
        ],
      },
      {
        id: "admin",
        label: "Administracja systemu",
        perms: [
          { id: "admin.audit_read", label: "Audyt — odczyt", description: "Wgląd w log audytu", granted: true },
          { id: "admin.flags", label: "Feature flagi", description: "Zarządzanie flagami funkcji", granted: false },
          { id: "admin.secrets", label: "Sekrety", description: "Zarządzanie kluczami API i tokenami", granted: false },
          { id: "admin.rbac", label: "RBAC", description: "Tworzenie i edycja ról RBAC", granted: false },
        ],
      },
    ],
  };
}

export default async function RbacRoleEditorPage({ params }: PageProps) {
  const { role } = await params;
  const r = await loadRole(role);

  const total = r.permissions.reduce((s, g) => s + g.perms.length, 0);
  const granted = r.permissions.reduce(
    (s, g) => s + g.perms.filter((p) => p.granted).length,
    0,
  );

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin/rbac"
          className="inline-flex items-center gap-2 text-sm text-iron-600 hover:text-dlugomat-900 focus-visible:outline-none focus-visible:shadow-shield-focus rounded"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Wróć do listy ról
        </Link>
      </div>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.18em] text-iron-500">
            RBAC · edytor roli · {r.id}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-fluid-h1 text-dlugomat-950">{r.name}</h1>
            {r.is_system ? (
              <Badge tone="warning" withDot>systemowa (read-only)</Badge>
            ) : (
              <Badge tone="info">niestandardowa</Badge>
            )}
          </div>
          <p className="max-w-2xl text-iron-600">{r.description}</p>
        </div>
        <Button variant="success" disabled={r.is_system}>
          <Save className="mr-2 h-4 w-4" aria-hidden />
          Zapisz uprawnienia
        </Button>
      </header>

      <section className="grid gap-4 sm:grid-cols-3" aria-label="KPI roli">
        <Card>
          <CardHeader>
            <CardDescription>
              <Users className="mr-1 inline h-3 w-3" aria-hidden />
              Użytkownicy z tą rolą
            </CardDescription>
            <CardTitle className="font-display text-fluid-h2 text-dlugomat-950">
              {r.users_count}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>
              <Shield className="mr-1 inline h-3 w-3" aria-hidden />
              Uprawnienia przyznane
            </CardDescription>
            <CardTitle className="font-display text-fluid-h2 text-accent-700">
              {granted} / {total}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>
              <Lock className="mr-1 inline h-3 w-3" aria-hidden />
              Pokrycie
            </CardDescription>
            <CardTitle className="font-display text-fluid-h2 text-dlugomat-950">
              {Math.round((granted / total) * 100)}%
            </CardTitle>
          </CardHeader>
        </Card>
      </section>

      <ul className="space-y-4" aria-label="Grupy uprawnień">
        {r.permissions.map((group) => (
          <li key={group.id}>
            <Card>
              <CardHeader>
                <CardTitle>{group.label}</CardTitle>
                <CardDescription>
                  {group.perms.filter((p) => p.granted).length} / {group.perms.length} uprawnień przyznanych
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {group.perms.map((p) => (
                    <li
                      key={p.id}
                      className="flex items-start gap-3 rounded-md border border-iron-200 p-3 has-[:checked]:border-accent-200 has-[:checked]:bg-accent-50/40"
                    >
                      <input
                        type="checkbox"
                        defaultChecked={p.granted}
                        disabled={r.is_system}
                        id={p.id}
                        className="mt-1"
                      />
                      <label htmlFor={p.id} className="flex-1 cursor-pointer">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium text-dlugomat-900">{p.label}</span>
                          <code className="font-mono text-xs text-iron-500">{p.id}</code>
                        </div>
                        <p className="mt-0.5 text-xs text-iron-600">{p.description}</p>
                      </label>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>

      {r.is_system ? (
        <Card urgency="warning">
          <CardContent className="flex items-start gap-3 p-5">
            <Lock className="mt-1 h-5 w-5 text-warn flex-shrink-0" aria-hidden />
            <div>
              <p className="font-semibold text-dlugomat-950">Rola systemowa</p>
              <p className="text-sm text-iron-700">
                Tej roli nie można modyfikować. Utwórz nową rolę niestandardową,
                aby dostosować uprawnienia do swoich potrzeb.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
