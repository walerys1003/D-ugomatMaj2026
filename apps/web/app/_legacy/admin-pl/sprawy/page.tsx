import type { Metadata } from "next";
import Link from "next/link";

import { requireAdminOrRedirect } from "@/lib/admin/rbac";
import { listCasesForAdmin } from "@/lib/admin/admin-queries";
import { caseTypeMeta } from "@/lib/cases/case-types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { CaseStatus, CaseType } from "@/lib/db/types";

export const metadata: Metadata = {
  title: "Kolejka spraw — Admin",
  robots: { index: false, follow: false },
};

export const revalidate = 30;

const STATUS_OPTIONS: Array<{ value: CaseStatus | "all"; label: string }> = [
  { value: "all", label: "Wszystkie" },
  { value: "draft", label: "Szkic" },
  { value: "analysis", label: "Analiza" },
  { value: "generated", label: "Wygenerowane" },
  { value: "paid", label: "Opłacone" },
  { value: "downloaded", label: "Pobrane" },
  { value: "completed", label: "Zakończone" },
  { value: "archived", label: "Zarchiwizowane" },
];

const STATUS_TONE: Record<CaseStatus, "info" | "success" | "warning" | "neutral"> = {
  draft: "neutral",
  analysis: "warning",
  generated: "info",
  paid: "success",
  downloaded: "success",
  completed: "success",
  archived: "neutral",
};

function formatPL(date: string): string {
  return new Intl.DateTimeFormat("pl-PL", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(date));
}

interface PageProps {
  searchParams?: {
    status?: string;
    type?: string;
    q?: string;
    page?: string;
  };
}

const PAGE_SIZE = 50;

export default async function AdminCasesQueuePage({ searchParams }: PageProps) {
  await requireAdminOrRedirect();

  const status = (searchParams?.status as CaseStatus | "all") ?? "all";
  const caseType = (searchParams?.type as CaseType | "all") ?? "all";
  const search = searchParams?.q ?? "";
  const page = Math.max(1, parseInt(searchParams?.page ?? "1", 10) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  const { rows, total } = await listCasesForAdmin({
    status,
    caseType,
    search,
    limit: PAGE_SIZE,
    offset,
  });

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="text-fluid-xs font-semibold uppercase tracking-wider text-dlugomat-600 dark:text-dlugomat-300">
          Admin
        </p>
        <h1 className="mt-1 font-serif text-fluid-3xl font-semibold text-iron-900 dark:text-white">
          Kolejka spraw
        </h1>
        <p className="mt-2 text-fluid-sm text-iron-600 dark:text-iron-300">
          {total.toLocaleString("pl-PL")} spraw spełnia filtry. Strona {page} z {totalPages}.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-fluid-base">Filtry</CardTitle>
          <CardDescription className="text-fluid-xs">
            Wszystkie filtry przekazywane przez query string — łatwy share/bookmark.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            method="get"
            className="grid gap-3 md:grid-cols-[160px_220px_1fr_auto]"
          >
            <label className="flex flex-col gap-1 text-fluid-xs font-semibold text-iron-600 dark:text-iron-300">
              Status
              <select
                name="status"
                defaultValue={status}
                className="rounded-md border border-iron-200 bg-white px-2 py-1 text-fluid-sm font-normal dark:border-dlugomat-700 dark:bg-dlugomat-900"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-fluid-xs font-semibold text-iron-600 dark:text-iron-300">
              Typ sprawy
              <select
                name="type"
                defaultValue={caseType}
                className="rounded-md border border-iron-200 bg-white px-2 py-1 text-fluid-sm font-normal dark:border-dlugomat-700 dark:bg-dlugomat-900"
              >
                <option value="all">Wszystkie</option>
                {Object.entries(caseTypeMeta).map(([type, meta]) => (
                  <option key={type} value={type}>
                    {meta.shortTitle}
                  </option>
                ))}
              </select>
            </label>
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
              className="self-end rounded-md bg-dlugomat-700 px-4 py-2 text-fluid-sm font-semibold text-white hover:bg-dlugomat-800"
            >
              Filtruj
            </button>
          </form>
        </CardContent>
      </Card>

      <div className="overflow-x-auto rounded-2xl border border-iron-200 bg-white dark:border-dlugomat-800 dark:bg-dlugomat-900">
        <table className="w-full text-fluid-sm">
          <thead className="border-b border-iron-200 bg-iron-50/60 text-fluid-xs uppercase tracking-wide text-iron-500 dark:border-dlugomat-800 dark:bg-dlugomat-950">
            <tr>
              <th className="px-4 py-3 text-left">Sprawa</th>
              <th className="px-4 py-3 text-left">Użytkownik</th>
              <th className="px-4 py-3 text-left">Typ</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-right">Pism</th>
              <th className="px-4 py-3 text-left">Płatność</th>
              <th className="px-4 py-3 text-left">Utworzono</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-iron-500">
                  Brak spraw spełniających filtry.
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const meta = caseTypeMeta[row.type];
                return (
                  <tr
                    key={row.id}
                    className="border-b border-iron-100 transition-colors hover:bg-iron-50/40 dark:border-dlugomat-800 dark:hover:bg-dlugomat-850"
                  >
                    <td className="px-4 py-3 font-mono text-fluid-xs text-iron-600 dark:text-iron-300">
                      <Link
                        href={`/admin/sprawy/${row.id}`}
                        className="hover:underline"
                      >
                        {row.id.slice(0, 8)}…
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-iron-700 dark:text-iron-200">
                        {row.user_email ?? (
                          <code className="text-iron-400">
                            {row.user_id.slice(0, 8)}…
                          </code>
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span title={meta?.title ?? row.type}>
                        {meta?.shortTitle ?? row.type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={STATUS_TONE[row.status]} withDot>
                        {row.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {row.document_count}
                    </td>
                    <td className="px-4 py-3">
                      {row.has_payment ? (
                        <Badge tone="success" withDot>
                          opłacone
                        </Badge>
                      ) : (
                        <span className="text-iron-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-iron-500 tabular-nums">
                      {formatPL(row.created_at)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 ? (
        <nav className="flex items-center justify-between text-fluid-sm" aria-label="Paginacja">
          <Link
            href={{
              pathname: "/admin/sprawy",
              query: {
                ...(status !== "all" ? { status } : {}),
                ...(caseType !== "all" ? { type: caseType } : {}),
                ...(search ? { q: search } : {}),
                page: Math.max(1, page - 1),
              },
            }}
            className="rounded-md border border-iron-200 px-3 py-1.5 hover:border-dlugomat-300 hover:text-dlugomat-700 disabled:opacity-50 dark:border-dlugomat-700"
            aria-disabled={page <= 1}
          >
            ← Poprzednia
          </Link>
          <span className="text-iron-500">
            Strona {page} z {totalPages}
          </span>
          <Link
            href={{
              pathname: "/admin/sprawy",
              query: {
                ...(status !== "all" ? { status } : {}),
                ...(caseType !== "all" ? { type: caseType } : {}),
                ...(search ? { q: search } : {}),
                page: Math.min(totalPages, page + 1),
              },
            }}
            className="rounded-md border border-iron-200 px-3 py-1.5 hover:border-dlugomat-300 hover:text-dlugomat-700 disabled:opacity-50 dark:border-dlugomat-700"
            aria-disabled={page >= totalPages}
          >
            Następna →
          </Link>
        </nav>
      ) : null}
    </div>
  );
}
