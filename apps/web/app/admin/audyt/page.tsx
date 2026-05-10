import type { Metadata } from "next";
import Link from "next/link";

import { requireAdminOrRedirect } from "@/lib/admin/rbac";
import { listAuditEvents } from "@/lib/admin/admin-queries";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Audit log — Admin",
  robots: { index: false, follow: false },
};

export const revalidate = 30;

const COMMON_EVENT_TYPES = [
  { value: "", label: "Wszystkie" },
  { value: "case_created", label: "Utworzenie sprawy" },
  { value: "case_status_changed", label: "Zmiana statusu" },
  { value: "admin_case_status_changed", label: "Admin: zmiana statusu" },
  { value: "document_generated", label: "Generacja pisma" },
  { value: "document_downloaded", label: "Pobranie pisma" },
  { value: "payment_created", label: "Utworzenie płatności" },
  { value: "payment_completed", label: "Płatność zakończona" },
  { value: "rodo_data_exported", label: "RODO: eksport danych" },
  { value: "rodo_account_deleted", label: "RODO: usunięcie konta" },
];

const ACTOR_TONE: Record<string, "info" | "success" | "warning" | "neutral" | "danger"> = {
  user: "info",
  system: "neutral",
  ai: "info",
  payment: "success",
  admin: "warning",
};

function formatPL(date: string): string {
  return new Intl.DateTimeFormat("pl-PL", {
    dateStyle: "medium",
    timeStyle: "medium",
  }).format(new Date(date));
}

interface PageProps {
  searchParams?: {
    type?: string;
    case?: string;
    page?: string;
  };
}

const PAGE_SIZE = 100;

export default async function AdminAuditLogPage({ searchParams }: PageProps) {
  await requireAdminOrRedirect();

  const eventType = searchParams?.type ?? "";
  const caseId = searchParams?.case ?? "";
  const page = Math.max(1, parseInt(searchParams?.page ?? "1", 10) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  const { rows, total } = await listAuditEvents({
    limit: PAGE_SIZE,
    offset,
    eventType: eventType || undefined,
    caseId: caseId || undefined,
  });
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="text-fluid-xs font-semibold uppercase tracking-wider text-dlugomat-600 dark:text-dlugomat-300">
          Admin
        </p>
        <h1 className="mt-1 font-serif text-fluid-3xl font-semibold text-iron-900 dark:text-white">
          Audit log
        </h1>
        <p className="mt-2 text-fluid-sm text-iron-600 dark:text-iron-300">
          Przegląd zdarzeń <code>case_events</code>. {total.toLocaleString("pl-PL")} zdarzeń pasuje
          do filtrów. Strona {page} z {totalPages}.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-fluid-base">Filtry</CardTitle>
          <CardDescription className="text-fluid-xs">
            Filtruj po typie zdarzenia lub konkretnym ID sprawy (UUID).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form method="get" className="grid gap-3 md:grid-cols-[260px_1fr_auto]">
            <label className="flex flex-col gap-1 text-fluid-xs font-semibold text-iron-600 dark:text-iron-300">
              Typ zdarzenia
              <select
                name="type"
                defaultValue={eventType}
                className="rounded-md border border-iron-200 bg-white px-2 py-1 text-fluid-sm font-normal dark:border-dlugomat-700 dark:bg-dlugomat-900"
              >
                {COMMON_EVENT_TYPES.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-fluid-xs font-semibold text-iron-600 dark:text-iron-300">
              ID sprawy (UUID)
              <input
                type="text"
                name="case"
                defaultValue={caseId}
                placeholder="np. 8c3a..."
                className="rounded-md border border-iron-200 bg-white px-2 py-1 font-mono text-fluid-sm font-normal dark:border-dlugomat-700 dark:bg-dlugomat-900"
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
              <th className="px-4 py-3 text-left">Czas</th>
              <th className="px-4 py-3 text-left">Aktor</th>
              <th className="px-4 py-3 text-left">Zdarzenie</th>
              <th className="px-4 py-3 text-left">Sprawa</th>
              <th className="px-4 py-3 text-left">Metadane</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-iron-500">
                  Brak zdarzeń spełniających filtry.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-iron-100 align-top dark:border-dlugomat-800"
                >
                  <td className="whitespace-nowrap px-4 py-3 tabular-nums text-iron-500">
                    {formatPL(row.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={ACTOR_TONE[row.actor] ?? "neutral"}>
                      {row.actor}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 font-mono text-fluid-xs text-iron-700 dark:text-iron-200">
                    {row.event_type}
                  </td>
                  <td className="px-4 py-3 font-mono text-fluid-xs">
                    <Link
                      href={`/admin/sprawy/${row.case_id}`}
                      className="text-dlugomat-700 hover:underline dark:text-dlugomat-300"
                    >
                      {row.case_id.slice(0, 8)}…
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    {Object.keys(row.metadata).length > 0 ? (
                      <details className="cursor-pointer">
                        <summary className="text-fluid-xs text-iron-500 hover:text-dlugomat-700">
                          {Object.keys(row.metadata).length} pól
                        </summary>
                        <pre className="mt-2 max-w-md overflow-x-auto whitespace-pre-wrap break-words rounded bg-iron-50 p-2 text-fluid-xs dark:bg-dlugomat-950">
                          {JSON.stringify(row.metadata, null, 2)}
                        </pre>
                      </details>
                    ) : (
                      <span className="text-iron-400">—</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 ? (
        <nav className="flex items-center justify-between text-fluid-sm" aria-label="Paginacja">
          <Link
            href={{
              pathname: "/admin/audyt",
              query: {
                ...(eventType ? { type: eventType } : {}),
                ...(caseId ? { case: caseId } : {}),
                page: Math.max(1, page - 1),
              },
            }}
            className="rounded-md border border-iron-200 px-3 py-1.5 hover:border-dlugomat-300 hover:text-dlugomat-700 dark:border-dlugomat-700"
            aria-disabled={page <= 1}
          >
            ← Poprzednia
          </Link>
          <span className="text-iron-500">
            Strona {page} z {totalPages}
          </span>
          <Link
            href={{
              pathname: "/admin/audyt",
              query: {
                ...(eventType ? { type: eventType } : {}),
                ...(caseId ? { case: caseId } : {}),
                page: Math.min(totalPages, page + 1),
              },
            }}
            className="rounded-md border border-iron-200 px-3 py-1.5 hover:border-dlugomat-300 hover:text-dlugomat-700 dark:border-dlugomat-700"
            aria-disabled={page >= totalPages}
          >
            Następna →
          </Link>
        </nav>
      ) : null}
    </div>
  );
}
