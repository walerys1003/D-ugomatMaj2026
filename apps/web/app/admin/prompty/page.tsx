import type { Metadata } from "next";
import Link from "next/link";

import { requireFullAdmin } from "@/lib/admin/rbac";
import { listPromptTemplates } from "@/lib/admin/admin-queries";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Prompty AI — Admin",
  robots: { index: false, follow: false },
};

export const revalidate = 60;

function formatPL(date: string): string {
  return new Intl.DateTimeFormat("pl-PL", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(date));
}

export default async function AdminPromptsPage() {
  try {
    await requireFullAdmin();
  } catch {
    redirect("/admin");
  }

  const rows = await listPromptTemplates();

  // Grupowanie po (case_type, variant) — pokazujemy najnowszą wersję
  // jako główny rekord, starsze jako historia (collapsible).
  const grouped = new Map<
    string,
    { active: typeof rows[number] | null; history: typeof rows }
  >();
  for (const row of rows) {
    const key = `${row.case_type}::${row.variant}`;
    const entry = grouped.get(key) ?? { active: null, history: [] };
    if (row.is_active && !entry.active) {
      entry.active = row;
    } else {
      entry.history.push(row);
    }
    grouped.set(key, entry);
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-fluid-xs font-semibold uppercase tracking-wider text-dlugomat-600 dark:text-dlugomat-300">
            Admin
          </p>
          <h1 className="mt-1 font-serif text-fluid-3xl font-semibold text-iron-900 dark:text-white">
            Prompty AI
          </h1>
          <p className="mt-2 max-w-2xl text-fluid-sm text-iron-600 dark:text-iron-300">
            System prompt + user prompt template dla każdego (case_type, variant).
            Wersjonowanie automatyczne — zapis zwiększa <code>version</code>,
            stara wersja zostaje w historii.
          </p>
        </div>
        <Link
          href="/admin/prompty/nowy"
          className="self-start rounded-md bg-dlugomat-700 px-4 py-2 text-fluid-sm font-semibold text-white hover:bg-dlugomat-800"
        >
          + Nowy prompt
        </Link>
      </header>

      {grouped.size === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-iron-500">
            Brak promptów. Dodaj pierwszy używając przycisku powyżej.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {Array.from(grouped.entries()).map(([key, group]) => {
            const active = group.active ?? group.history[0];
            if (!active) return null;
            return (
              <Card key={key}>
                <CardHeader>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <CardTitle className="flex flex-wrap items-center gap-2 text-fluid-base">
                        <code className="font-mono">{active.case_type}</code>
                        <span className="text-iron-400">·</span>
                        <span>{active.variant}</span>
                      </CardTitle>
                      <CardDescription className="mt-1 text-fluid-xs">
                        Model: <code>{active.model}</code> · temperature{" "}
                        <code>{active.temperature}</code> · max_tokens{" "}
                        <code>{active.max_tokens}</code>
                      </CardDescription>
                    </div>
                    <div className="flex flex-col items-end gap-1 text-fluid-xs">
                      {active.is_active ? (
                        <Badge tone="success" withDot>
                          aktywny
                        </Badge>
                      ) : (
                        <Badge tone="neutral">nieaktywny</Badge>
                      )}
                      <span className="text-iron-500">
                        v{active.version} · {formatPL(active.updated_at)}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap items-center gap-3">
                    <Link
                      href={`/admin/prompty/${active.id}`}
                      className="text-fluid-sm font-semibold text-dlugomat-700 hover:underline dark:text-dlugomat-300"
                    >
                      Edytuj →
                    </Link>
                    {group.history.length > 0 ? (
                      <details className="text-fluid-xs text-iron-500">
                        <summary className="cursor-pointer hover:text-dlugomat-700">
                          {group.history.length} wcześniejszych wersji
                        </summary>
                        <ul className="mt-2 flex flex-col gap-1">
                          {group.history.map((h) => (
                            <li key={h.id} className="flex items-center gap-2">
                              <Link
                                href={`/admin/prompty/${h.id}`}
                                className="font-mono text-dlugomat-700 hover:underline dark:text-dlugomat-300"
                              >
                                v{h.version}
                              </Link>
                              <span>· {formatPL(h.updated_at)}</span>
                              {h.is_active ? (
                                <Badge tone="success">aktywna</Badge>
                              ) : null}
                            </li>
                          ))}
                        </ul>
                      </details>
                    ) : null}
                  </div>
                  {active.notes ? (
                    <p className="mt-3 rounded-md bg-iron-50 p-2 text-fluid-xs text-iron-600 dark:bg-dlugomat-950 dark:text-iron-300">
                      {active.notes}
                    </p>
                  ) : null}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
