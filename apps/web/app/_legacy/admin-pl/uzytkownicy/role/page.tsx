import * as React from "react";
import Link from "next/link";
import { Shield, Plus, Users, Lock, Edit3, Copy, Trash2, Key } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Role i uprawnienia - Dlugomat Admin",
  description: "Zarzadzanie rolami uzytkownikow i macierza uprawnien w systemie.",
};

type Role = {
  id: string;
  name: string;
  description: string;
  users: number;
  permissions: number;
  scope: "system" | "tenant" | "team";
  isBuiltIn: boolean;
  lastModified: string;
};

const ROLES: Role[] = [
  {
    id: "r-001",
    name: "Super Admin",
    description: "Pelen dostep do calego systemu - tylko 2 osoby z zarzadu",
    users: 2,
    permissions: 187,
    scope: "system",
    isBuiltIn: true,
    lastModified: "2026-01-15",
  },
  {
    id: "r-002",
    name: "Admin operacyjny",
    description: "Zarzadzanie sprawami, uzytkownikami, raportami bez dostepu do bilingu",
    users: 8,
    permissions: 124,
    scope: "system",
    isBuiltIn: true,
    lastModified: "2026-04-22",
  },
  {
    id: "r-003",
    name: "Customer Success Manager",
    description: "Obsluga klientow enterprise, wgla d w sprawy bez modyfikacji",
    users: 12,
    permissions: 67,
    scope: "tenant",
    isBuiltIn: true,
    lastModified: "2026-04-18",
  },
  {
    id: "r-004",
    name: "Doradca finansowy",
    description: "Pomoc dluznikom, propozycje planow splaty, generowanie pism",
    users: 34,
    permissions: 89,
    scope: "team",
    isBuiltIn: true,
    lastModified: "2026-04-10",
  },
  {
    id: "r-005",
    name: "Prawnik wewnetrzny",
    description: "Akceptacja pism AI, baza orzecznicza, audyt prawny",
    users: 6,
    permissions: 72,
    scope: "team",
    isBuiltIn: true,
    lastModified: "2026-03-28",
  },
  {
    id: "r-006",
    name: "Analityk danych",
    description: "Read-only do raportow, BI, eksportu danych w trybie anonimowym",
    users: 4,
    permissions: 34,
    scope: "system",
    isBuiltIn: false,
    lastModified: "2026-03-15",
  },
  {
    id: "r-007",
    name: "Compliance officer",
    description: "Audyt RODO, raporty regulacyjne, dostep do logow",
    users: 3,
    permissions: 56,
    scope: "system",
    isBuiltIn: true,
    lastModified: "2026-03-02",
  },
  {
    id: "r-008",
    name: "Marketing - kampanie",
    description: "Tworzenie kampanii, segmentow, szablonow notyfikacji",
    users: 7,
    permissions: 42,
    scope: "team",
    isBuiltIn: false,
    lastModified: "2026-02-20",
  },
];

const SCOPE_LABEL = {
  system: "Systemowa",
  tenant: "Tenant",
  team: "Zespol",
};

const SCOPE_TONE = {
  system: "danger" as const,
  tenant: "warning" as const,
  team: "info" as const,
};

const PERMISSION_GROUPS = [
  { name: "Uzytkownicy", count: 24, examples: "users.read, users.write, users.delete" },
  { name: "Sprawy", count: 31, examples: "cases.read, cases.write, cases.assign" },
  { name: "Dokumenty", count: 18, examples: "documents.read, documents.encrypt" },
  { name: "Finanse i platnosci", count: 22, examples: "payments.read, invoices.issue" },
  { name: "Raporty i BI", count: 14, examples: "reports.export, analytics.view" },
  { name: "System i audit", count: 19, examples: "system.config, audit.read" },
];

export default function RoleIUprawnieniaPage() {
  const numFmt = new Intl.NumberFormat("pl-PL");
  const dateFmt = new Intl.DateTimeFormat("pl-PL", { day: "numeric", month: "long", year: "numeric" });

  const totalUsers = ROLES.reduce((acc, r) => acc + r.users, 0);
  const totalPermissions = PERMISSION_GROUPS.reduce((acc, g) => acc + g.count, 0);

  return (
    <div className="min-h-screen bg-dlugomat-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Shield className="h-6 w-6 text-accent-600" aria-hidden />
              <h1 className="font-display text-3xl text-dlugomat-950">Role i uprawnienia</h1>
            </div>
            <p className="text-dlugomat-700 max-w-2xl">
              Macierz RBAC z granularnymi uprawnieniami. Kazda rola moze byc dostosowana do polityki organizacji.
            </p>
          </div>
          <Button variant="primary">
            <Plus className="h-4 w-4 mr-2" aria-hidden />
            Nowa rola
          </Button>
        </header>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-xs uppercase tracking-wide text-dlugomat-600 mb-1">Rol w systemie</div>
              <div className="font-display text-3xl text-dlugomat-950">{ROLES.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-xs uppercase tracking-wide text-dlugomat-600 mb-1">Uzytkownikow przypisanych</div>
              <div className="font-display text-3xl text-dlugomat-950">{numFmt.format(totalUsers)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-xs uppercase tracking-wide text-dlugomat-600 mb-1">Uprawnien lacznie</div>
              <div className="font-display text-3xl text-dlugomat-950">{totalPermissions}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-xs uppercase tracking-wide text-dlugomat-600 mb-1">Role wlasne</div>
              <div className="font-display text-3xl text-accent-700">
                {ROLES.filter((r) => !r.isBuiltIn).length}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Lista rol</CardTitle>
                <CardDescription>Kliknij w role aby zobaczyc szczegolowa macierz uprawnien</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs uppercase tracking-wide text-dlugomat-600 border-b border-iron-200">
                        <th className="py-3 pr-3">Nazwa</th>
                        <th className="py-3 pr-3">Zakres</th>
                        <th className="py-3 pr-3">Uzytkownicy</th>
                        <th className="py-3 pr-3">Uprawnien</th>
                        <th className="py-3 pr-3">Edycja</th>
                        <th className="py-3">Akcje</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ROLES.map((role) => (
                        <tr key={role.id} className="border-b border-iron-100 last:border-0 hover:bg-dlugomat-50">
                          <td className="py-3 pr-3">
                            <Link
                              href={`/admin/uzytkownicy/role/${role.id}`}
                              className="block focus-visible:shadow-shield-focus rounded"
                            >
                              <div className="font-medium text-dlugomat-950 flex items-center gap-2">
                                {role.name}
                                {role.isBuiltIn && <Badge tone="neutral">Wbudowana</Badge>}
                              </div>
                              <div className="text-xs text-dlugomat-600 mt-0.5 max-w-md">{role.description}</div>
                            </Link>
                          </td>
                          <td className="py-3 pr-3">
                            <Badge tone={SCOPE_TONE[role.scope]}>{SCOPE_LABEL[role.scope]}</Badge>
                          </td>
                          <td className="py-3 pr-3 text-dlugomat-900">
                            <span className="inline-flex items-center gap-1">
                              <Users className="h-3.5 w-3.5 text-dlugomat-500" aria-hidden />
                              {role.users}
                            </span>
                          </td>
                          <td className="py-3 pr-3 text-dlugomat-900">
                            <span className="inline-flex items-center gap-1">
                              <Key className="h-3.5 w-3.5 text-dlugomat-500" aria-hidden />
                              {role.permissions}
                            </span>
                          </td>
                          <td className="py-3 pr-3 text-dlugomat-700 text-xs">
                            {dateFmt.format(new Date(role.lastModified))}
                          </td>
                          <td className="py-3">
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                aria-label="Edytuj role"
                                className="p-1.5 rounded text-dlugomat-700 hover:bg-iron-100 focus-visible:shadow-shield-focus focus-visible:outline-none"
                              >
                                <Edit3 className="h-3.5 w-3.5" aria-hidden />
                              </button>
                              <button
                                type="button"
                                aria-label="Duplikuj role"
                                className="p-1.5 rounded text-dlugomat-700 hover:bg-iron-100 focus-visible:shadow-shield-focus focus-visible:outline-none"
                              >
                                <Copy className="h-3.5 w-3.5" aria-hidden />
                              </button>
                              {!role.isBuiltIn && (
                                <button
                                  type="button"
                                  aria-label="Usun role"
                                  className="p-1.5 rounded text-danger hover:bg-rose-50 focus-visible:shadow-shield-focus focus-visible:outline-none"
                                >
                                  <Trash2 className="h-3.5 w-3.5" aria-hidden />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          <aside className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Lock className="h-4 w-4 text-accent-600" aria-hidden />
                  Grupy uprawnien
                </CardTitle>
                <CardDescription>{totalPermissions} uprawnien w 6 grupach</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {PERMISSION_GROUPS.map((g) => (
                    <li key={g.name}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-dlugomat-950 text-sm">{g.name}</span>
                        <Badge tone="neutral">{g.count}</Badge>
                      </div>
                      <code className="block text-xs text-dlugomat-600 font-mono">{g.examples}</code>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-dlugomat-800 mb-3">
                  Zasada najmniejszych uprawnien - kazda rola otrzymuje tylko niezbedne uprawnienia. Audyt zmian
                  rejestrowany w dzienniku.
                </p>
                <Button variant="secondary" block asChild>
                  <Link href="/admin/audyt">Zobacz dziennik audytu</Link>
                </Button>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}
