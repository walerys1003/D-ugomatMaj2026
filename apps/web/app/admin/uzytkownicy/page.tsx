import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { requireFullAdmin } from "@/lib/admin/rbac";
import { createSupabaseAdminClient } from "@/lib/db/supabase-server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserRoleForm } from "./role-form";
import type { UserRole } from "@/lib/db/types";

export const metadata: Metadata = {
  title: "Użytkownicy — Admin",
  robots: { index: false, follow: false },
};

export const revalidate = 60;

interface UserListRow {
  id: string;
  email: string;
  role: UserRole;
  created_at: string;
  last_sign_in_at: string | null;
  cases_count: number;
}

function formatPL(date: string | null): string {
  if (!date) return "—";
  return new Intl.DateTimeFormat("pl-PL", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(date));
}

const ROLE_TONE: Record<UserRole, "info" | "warning" | "neutral"> = {
  admin: "warning",
  moderator: "info",
  user: "neutral",
};

interface PageProps {
  searchParams?: { q?: string; page?: string };
}

const PAGE_SIZE = 50;

async function loadUsers({
  search,
  page,
}: {
  search: string;
  page: number;
}): Promise<{ rows: UserListRow[]; total: number; totalPages: number }> {
  const supabase = createSupabaseAdminClient();

  // Pobierz użytkowników z auth.users (paginacja po stronie Supabase Admin API).
  const list = await supabase.auth.admin.listUsers({
    page,
    perPage: PAGE_SIZE,
  });
  if (list.error) {
    throw new Error(`Auth listUsers failed: ${list.error.message}`);
  }
  const users = list.data.users;
  const total = list.data.total ?? users.length;

  if (users.length === 0) {
    return { rows: [], total, totalPages: 1 };
  }

  const ids = users.map((u) => u.id);

  // Wzbogać o role z profiles + liczność spraw.
  const [profilesRes, casesRes] = await Promise.all([
    supabase.from("profiles").select("id, role").in("id", ids),
    supabase.from("cases").select("user_id").in("user_id", ids).is("deleted_at", null),
  ]);

  const roleById = new Map<string, UserRole>();
  for (const row of profilesRes.data ?? []) {
    roleById.set(row.id as string, (row.role as UserRole) ?? "user");
  }
  const casesByUser = new Map<string, number>();
  for (const row of casesRes.data ?? []) {
    const uid = row.user_id as string;
    casesByUser.set(uid, (casesByUser.get(uid) ?? 0) + 1);
  }

  const rows: UserListRow[] = users.map((u) => ({
    id: u.id,
    email: u.email ?? "—",
    role: roleById.get(u.id) ?? "user",
    created_at: u.created_at,
    last_sign_in_at: u.last_sign_in_at ?? null,
    cases_count: casesByUser.get(u.id) ?? 0,
  }));

  // Filtr e-maila w pamięci (po fetchu, bo Supabase admin API nie ma
  // server-side LIKE filter).
  const filtered = search.trim().length >= 2
    ? rows.filter((r) => r.email.toLowerCase().includes(search.trim().toLowerCase()))
    : rows;

  return {
    rows: filtered,
    total,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}

export default async function AdminUsersPage({ searchParams }: PageProps) {
  try {
    await requireFullAdmin();
  } catch {
    redirect("/admin");
  }

  const search = searchParams?.q ?? "";
  const page = Math.max(1, parseInt(searchParams?.page ?? "1", 10) || 1);
  const { rows, total, totalPages } = await loadUsers({ search, page });

  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="text-fluid-xs font-semibold uppercase tracking-wider text-dlugomat-600 dark:text-dlugomat-300">
          Admin
        </p>
        <h1 className="mt-1 font-serif text-fluid-3xl font-semibold text-iron-900 dark:text-white">
          Użytkownicy
        </h1>
        <p className="mt-2 text-fluid-sm text-iron-600 dark:text-iron-300">
          {total.toLocaleString("pl-PL")} użytkowników. Strona {page} z {totalPages}.
          Zmiana roli jest natychmiastowa i logowana w audit log.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-fluid-base">Filtry</CardTitle>
          <CardDescription className="text-fluid-xs">
            Filtr e-maila działa po stronie aplikacji w obrębie strony 50 osób.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form method="get" className="flex flex-wrap items-end gap-3">
            <label className="flex flex-col gap-1 text-fluid-xs font-semibold text-iron-600 dark:text-iron-300">
              Szukaj e-maila
              <input
                type="search"
                name="q"
                defaultValue={search}
                placeholder="np. anna@..."
                className="rounded-md border border-iron-200 bg-white px-2 py-1 text-fluid-sm font-normal dark:border-dlugomat-700 dark:bg-dlugomat-900"
              />
            </label>
            <button
              type="submit"
              className="rounded-md bg-dlugomat-700 px-4 py-2 text-fluid-sm font-semibold text-white hover:bg-dlugomat-800"
            >
              Szukaj
            </button>
          </form>
        </CardContent>
      </Card>

      <div className="overflow-x-auto rounded-2xl border border-iron-200 bg-white dark:border-dlugomat-800 dark:bg-dlugomat-900">
        <table className="w-full text-fluid-sm">
          <thead className="border-b border-iron-200 bg-iron-50/60 text-fluid-xs uppercase tracking-wide text-iron-500 dark:border-dlugomat-800 dark:bg-dlugomat-950">
            <tr>
              <th className="px-4 py-3 text-left">E-mail</th>
              <th className="px-4 py-3 text-left">Rola</th>
              <th className="px-4 py-3 text-right">Sprawy</th>
              <th className="px-4 py-3 text-left">Utworzono</th>
              <th className="px-4 py-3 text-left">Ostatnie logowanie</th>
              <th className="px-4 py-3 text-right">Akcje</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-iron-500">
                  Brak użytkowników spełniających filtry.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-iron-100 align-top dark:border-dlugomat-800"
                >
                  <td className="px-4 py-3">
                    <div className="text-iron-700 dark:text-iron-200">{row.email}</div>
                    <code className="text-fluid-xs text-iron-400">
                      {row.id.slice(0, 8)}…
                    </code>
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={ROLE_TONE[row.role]} withDot>
                      {row.role}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {row.cases_count}
                  </td>
                  <td className="px-4 py-3 text-iron-500 tabular-nums">
                    {formatPL(row.created_at)}
                  </td>
                  <td className="px-4 py-3 text-iron-500 tabular-nums">
                    {formatPL(row.last_sign_in_at)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <UserRoleForm userId={row.id} currentRole={row.role} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 ? (
        <nav className="flex items-center justify-between text-fluid-sm" aria-label="Paginacja">
          <a
            href={`?${new URLSearchParams({ ...(search ? { q: search } : {}), page: String(Math.max(1, page - 1)) }).toString()}`}
            className="rounded-md border border-iron-200 px-3 py-1.5 hover:border-dlugomat-300 hover:text-dlugomat-700 dark:border-dlugomat-700"
            aria-disabled={page <= 1}
          >
            ← Poprzednia
          </a>
          <span className="text-iron-500">
            Strona {page} z {totalPages}
          </span>
          <a
            href={`?${new URLSearchParams({ ...(search ? { q: search } : {}), page: String(Math.min(totalPages, page + 1)) }).toString()}`}
            className="rounded-md border border-iron-200 px-3 py-1.5 hover:border-dlugomat-300 hover:text-dlugomat-700 dark:border-dlugomat-700"
            aria-disabled={page >= totalPages}
          >
            Następna →
          </a>
        </nav>
      ) : null}
    </div>
  );
}
