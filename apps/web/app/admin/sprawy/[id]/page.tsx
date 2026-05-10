import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { requireAdminOrRedirect } from "@/lib/admin/rbac";
import { getCaseDetailsForAdmin } from "@/lib/admin/admin-queries";
import { caseTypeMeta } from "@/lib/cases/case-types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AdminCaseStatusForm } from "./status-form";

export const metadata: Metadata = {
  title: "Sprawa — Admin",
  robots: { index: false, follow: false },
};

export const revalidate = 30;

function formatPL(date: string): string {
  return new Intl.DateTimeFormat("pl-PL", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

interface PageProps {
  params: { id: string };
}

export default async function AdminCaseDetailsPage({ params }: PageProps) {
  await requireAdminOrRedirect();

  const { case_row, events, user_email } = await getCaseDetailsForAdmin(
    params.id,
  );
  if (!case_row) notFound();

  const meta = caseTypeMeta[case_row.type];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/admin/sprawy"
          className="inline-flex items-center gap-1 text-fluid-sm text-iron-500 hover:text-dlugomat-700 dark:hover:text-white"
        >
          <ArrowLeft className="h-3 w-3" />
          Wróć do kolejki spraw
        </Link>
      </div>

      <header className="flex flex-col gap-2">
        <p className="text-fluid-xs font-semibold uppercase tracking-wider text-dlugomat-600 dark:text-dlugomat-300">
          {meta?.shortTitle ?? case_row.type}
        </p>
        <h1 className="font-serif text-fluid-3xl font-semibold text-iron-900 dark:text-white">
          Sprawa{" "}
          <code className="font-mono text-fluid-xl text-iron-500">
            {case_row.id.slice(0, 8)}
          </code>
        </h1>
        <div className="flex flex-wrap items-center gap-2 text-fluid-sm text-iron-600 dark:text-iron-300">
          <Badge tone="info" withDot>
            {case_row.status}
          </Badge>
          <span>·</span>
          <span>{user_email ?? <code>{case_row.user_id.slice(0, 8)}…</code>}</span>
          <span>·</span>
          <span>utworzono {formatPL(case_row.created_at)}</span>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader>
            <CardTitle className="text-fluid-base">Audit log sprawy</CardTitle>
            <CardDescription>
              Wszystkie zdarzenia powiązane z tą sprawą (do 200 ostatnich).
            </CardDescription>
          </CardHeader>
          <CardContent>
            {events.length === 0 ? (
              <p className="text-iron-500">Brak zdarzeń.</p>
            ) : (
              <ol className="flex flex-col gap-3">
                {events.map((event) => (
                  <li
                    key={event.id}
                    className="rounded-lg border border-iron-200 bg-iron-50/40 p-3 text-fluid-sm dark:border-dlugomat-800 dark:bg-dlugomat-950"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <code className="font-mono text-iron-700 dark:text-iron-200">
                        {event.event_type}
                      </code>
                      <span className="text-fluid-xs text-iron-500">
                        {formatPL(event.created_at)} · {event.actor}
                      </span>
                    </div>
                    {event.metadata && Object.keys(event.metadata).length > 0 ? (
                      <pre className="mt-2 overflow-x-auto whitespace-pre-wrap break-words rounded bg-white p-2 text-fluid-xs text-iron-600 dark:bg-dlugomat-900 dark:text-iron-300">
                        {JSON.stringify(event.metadata, null, 2)}
                      </pre>
                    ) : null}
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-fluid-base">Akcje admina</CardTitle>
              <CardDescription>
                Ręczna zmiana statusu sprawy z wymaganym uzasadnieniem.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AdminCaseStatusForm
                caseId={case_row.id}
                currentStatus={case_row.status}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-fluid-base">Metadane</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 gap-2 text-fluid-sm">
                <div>
                  <dt className="text-fluid-xs uppercase tracking-wide text-iron-500">
                    Typ
                  </dt>
                  <dd className="font-mono">{case_row.type}</dd>
                </div>
                <div>
                  <dt className="text-fluid-xs uppercase tracking-wide text-iron-500">
                    Aktualizacja
                  </dt>
                  <dd>{formatPL(case_row.updated_at)}</dd>
                </div>
                <div>
                  <dt className="text-fluid-xs uppercase tracking-wide text-iron-500">
                    User ID
                  </dt>
                  <dd className="font-mono text-fluid-xs break-all">
                    {case_row.user_id}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
