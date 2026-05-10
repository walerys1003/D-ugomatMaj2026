import type { Metadata } from "next";
import { BookOpen, Database, AlertTriangle } from "lucide-react";

import { requireAdminOrRedirect } from "@/lib/admin/rbac";
import { getKnowledgeStats } from "@/lib/admin/admin-queries";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Baza wiedzy — Admin",
  robots: { index: false, follow: false },
};

export const revalidate = 120;

export default async function AdminKnowledgePage() {
  await requireAdminOrRedirect();
  const stats = await getKnowledgeStats();

  const coverage =
    stats.total_chunks > 0
      ? Math.round(
          (stats.embeddings_present / stats.total_chunks) * 1000,
        ) / 10
      : null;

  return (
    <div className="flex flex-col gap-8">
      <header>
        <p className="text-fluid-xs font-semibold uppercase tracking-wider text-dlugomat-600 dark:text-dlugomat-300">
          RAG · Retrieval-Augmented Generation
        </p>
        <h1 className="mt-1 font-serif text-fluid-3xl font-semibold text-iron-900 dark:text-white">
          Baza wiedzy prawnej
        </h1>
        <p className="mt-2 max-w-2xl text-fluid-sm text-iron-600 dark:text-iron-300">
          Chunki przepisów, orzecznictwa i wzorów dla modułów D1–D8.
          Embeddingi (pgvector) wykorzystywane przez retriever przed
          generacją pism w Claude Sonnet 4.5.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-fluid-sm font-medium text-iron-600 dark:text-iron-300">
              Chunki łącznie
            </CardTitle>
            <BookOpen className="h-4 w-4 text-iron-400" />
          </CardHeader>
          <CardContent>
            <div className="font-serif text-fluid-3xl font-semibold text-iron-900 dark:text-white">
              {stats.total_chunks.toLocaleString("pl-PL")}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-fluid-sm font-medium text-iron-600 dark:text-iron-300">
              Z embeddingiem
            </CardTitle>
            <Database className="h-4 w-4 text-accent-500" />
          </CardHeader>
          <CardContent>
            <div className="font-serif text-fluid-3xl font-semibold text-iron-900 dark:text-white">
              {stats.embeddings_present.toLocaleString("pl-PL")}
            </div>
            {coverage !== null ? (
              <p className="mt-1 text-fluid-xs">
                <Badge tone={coverage >= 99 ? "success" : "warning"}>
                  {coverage}% pokrycia
                </Badge>
              </p>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-fluid-sm font-medium text-iron-600 dark:text-iron-300">
              Brak embeddingu
            </CardTitle>
            <AlertTriangle
              className={
                stats.embeddings_missing > 0
                  ? "h-4 w-4 text-warning-500"
                  : "h-4 w-4 text-iron-400"
              }
            />
          </CardHeader>
          <CardContent>
            <div className="font-serif text-fluid-3xl font-semibold text-iron-900 dark:text-white">
              {stats.embeddings_missing}
            </div>
            {stats.embeddings_missing > 0 ? (
              <p className="mt-1 text-fluid-xs text-iron-500">
                Uruchom job <code>rag:reembed</code>.
              </p>
            ) : null}
          </CardContent>
        </Card>
      </section>

      <section>
        <Card>
          <CardHeader>
            <CardTitle className="text-fluid-base">Pokrycie modułów</CardTitle>
            <CardDescription className="text-fluid-xs">
              Liczba chunków per <code>case_type</code>. D1 (Skaner), D2 (EPU),
              D3 (Komornik), D4 (Potrącenia), D5 (BIK), D6 (Cesja), D7 (Ugoda),
              D8 (Upadłość).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-2 text-fluid-sm">
              {Object.entries(stats.by_case_type).length === 0 ? (
                <li className="text-iron-500">Brak danych.</li>
              ) : (
                Object.entries(stats.by_case_type)
                  .sort((a, b) => b[1] - a[1])
                  .map(([type, count]) => (
                    <li
                      key={type}
                      className="flex items-center justify-between border-b border-iron-100 pb-1 last:border-0 dark:border-dlugomat-800"
                    >
                      <code className="text-iron-700 dark:text-iron-200">
                        {type}
                      </code>
                      <span className="font-semibold text-iron-900 dark:text-white">
                        {count}
                      </span>
                    </li>
                  ))
              )}
            </ul>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
