"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";

interface LegalHold {
  id: string;
  resource_type: string;
  resource_id: string;
  imposed_by: string;
  imposed_at: string;
  expires_at: string | null;
  reason: string;
  released_at: string | null;
}
interface EdiscoveryQuery {
  id: string;
  requested_by: string;
  query: Record<string, unknown>;
  status: "queued" | "running" | "completed" | "failed";
  items_count: number;
  created_at: string;
  completed_at: string | null;
}

export function LegalHoldClient({
  initialHolds,
  initialQueries,
}: {
  initialHolds: LegalHold[];
  initialQueries: EdiscoveryQuery[];
}) {
  const [holds, setHolds] = useState<LegalHold[]>(initialHolds);
  const [queries, setQueries] = useState<EdiscoveryQuery[]>(initialQueries);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [resType, setResType] = useState("case");
  const [resId, setResId] = useState("");
  const [reason, setReason] = useState("");
  const [edUser, setEdUser] = useState("");
  const [edTextSearch, setEdTextSearch] = useState("");
  const [edFrom, setEdFrom] = useState("");
  const [edTo, setEdTo] = useState("");

  async function impose() {
    setError(null);
    if (!resId.trim() || !reason.trim()) {
      setError("Wymagane: resource_id i powód.");
      return;
    }
    startTransition(async () => {
      try {
        const r = await fetch("/api/compliance/ediscovery", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            action: "impose_hold",
            resource_type: resType,
            resource_id: resId.trim(),
            reason,
          }),
        });
        if (!r.ok) {
          const j = await r.json().catch(() => ({}));
          throw new Error(j?.error ?? `http_${r.status}`);
        }
        const j = await r.json();
        setHolds((prev) => [j.hold as LegalHold, ...prev]);
        setResId("");
        setReason("");
      } catch (e) {
        setError(String(e));
      }
    });
  }

  async function release(id: string) {
    if (!confirm("Zwolnić ten legal hold? Akcja jest audytowana.")) return;
    startTransition(async () => {
      try {
        const r = await fetch("/api/compliance/ediscovery", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ action: "release_hold", hold_id: id }),
        });
        if (!r.ok) throw new Error(`http_${r.status}`);
        setHolds((prev) => prev.filter((h) => h.id !== id));
      } catch (e) {
        setError(String(e));
      }
    });
  }

  async function runQuery() {
    setError(null);
    startTransition(async () => {
      try {
        const r = await fetch("/api/compliance/ediscovery", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            action: "run_query",
            query: {
              user_id: edUser.trim() || undefined,
              text_search: edTextSearch.trim() || undefined,
              date_from: edFrom || undefined,
              date_to: edTo || undefined,
            },
          }),
        });
        if (!r.ok) {
          const j = await r.json().catch(() => ({}));
          throw new Error(j?.error ?? `http_${r.status}`);
        }
        const j = await r.json();
        setQueries((prev) => [j.query as EdiscoveryQuery, ...prev]);
      } catch (e) {
        setError(String(e));
      }
    });
  }

  return (
    <div className="space-y-8">
      {error && (
        <div role="alert" className="rounded-lg border border-danger-300 bg-danger-50 p-3 text-danger-700 text-sm">
          {error}
        </div>
      )}

      {/* IMPOSE HOLD */}
      <section className="rounded-lg border border-ink-200 dark:border-dlugomat-800 p-4 bg-white dark:bg-dlugomat-900">
        <h2 className="font-semibold mb-3">Nałóż nowy hold</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Typ zasobu</span>
            <select
              value={resType}
              onChange={(e) => setResType(e.target.value)}
              className="rounded-md border border-ink-300 dark:border-dlugomat-700 px-3 h-10 bg-transparent"
            >
              <option value="case">case</option>
              <option value="user">user</option>
              <option value="document">document</option>
              <option value="org">org</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm md:col-span-2">
            <span className="font-medium">Resource ID</span>
            <input
              value={resId}
              onChange={(e) => setResId(e.target.value)}
              className="rounded-md border border-ink-300 dark:border-dlugomat-700 px-3 h-10 bg-transparent"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm md:col-span-3">
            <span className="font-medium">Powód</span>
            <textarea
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="rounded-md border border-ink-300 dark:border-dlugomat-700 px-3 py-2 bg-transparent"
              placeholder="Sprawa sądowa nr ..., żądanie prokuratury ..., due diligence ..."
            />
          </label>
        </div>
        <div className="mt-3">
          <Button onClick={impose} loading={pending} variant="danger">
            Nałóż hold
          </Button>
        </div>
      </section>

      {/* HOLDS LIST */}
      <section className="rounded-lg border border-ink-200 dark:border-dlugomat-800 overflow-hidden">
        <h2 className="p-3 font-semibold border-b border-ink-200 dark:border-dlugomat-800">
          Aktywne legal holds ({holds.length})
        </h2>
        <table className="w-full text-sm">
          <thead className="bg-ink-50 dark:bg-dlugomat-850">
            <tr>
              <th className="text-left p-3">Zasób</th>
              <th className="text-left p-3">Powód</th>
              <th className="text-left p-3">Nałożono</th>
              <th className="text-right p-3">Akcje</th>
            </tr>
          </thead>
          <tbody>
            {holds.length === 0 && (
              <tr>
                <td colSpan={4} className="p-6 text-center text-ink-500">
                  Brak aktywnych holdów.
                </td>
              </tr>
            )}
            {holds.map((h) => (
              <tr key={h.id} className="border-t border-ink-200 dark:border-dlugomat-800">
                <td className="p-3 font-mono text-xs">
                  {h.resource_type}:{h.resource_id.slice(0, 8)}…
                </td>
                <td className="p-3 text-ink-600 max-w-md truncate">{h.reason}</td>
                <td className="p-3 text-ink-600">{new Date(h.imposed_at).toLocaleString("pl-PL")}</td>
                <td className="p-3 text-right">
                  <button onClick={() => release(h.id)} className="text-dlugomat-600 hover:underline">
                    Zwolnij
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* E-DISCOVERY QUERY */}
      <section className="rounded-lg border border-ink-200 dark:border-dlugomat-800 p-4 bg-white dark:bg-dlugomat-900">
        <h2 className="font-semibold mb-3">e-Discovery query</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <label className="flex flex-col gap-1 text-sm">
            <span>User ID</span>
            <input
              value={edUser}
              onChange={(e) => setEdUser(e.target.value)}
              className="rounded-md border border-ink-300 dark:border-dlugomat-700 px-3 h-10 bg-transparent"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm md:col-span-3">
            <span>Wyszukiwanie tekstowe</span>
            <input
              value={edTextSearch}
              onChange={(e) => setEdTextSearch(e.target.value)}
              className="rounded-md border border-ink-300 dark:border-dlugomat-700 px-3 h-10 bg-transparent"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span>Od</span>
            <input
              type="date"
              value={edFrom}
              onChange={(e) => setEdFrom(e.target.value)}
              className="rounded-md border border-ink-300 dark:border-dlugomat-700 px-3 h-10 bg-transparent"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span>Do</span>
            <input
              type="date"
              value={edTo}
              onChange={(e) => setEdTo(e.target.value)}
              className="rounded-md border border-ink-300 dark:border-dlugomat-700 px-3 h-10 bg-transparent"
            />
          </label>
        </div>
        <div className="mt-3">
          <Button onClick={runQuery} loading={pending}>
            Uruchom query
          </Button>
        </div>
      </section>

      {/* QUERIES LIST */}
      <section className="rounded-lg border border-ink-200 dark:border-dlugomat-800 overflow-hidden">
        <h2 className="p-3 font-semibold border-b border-ink-200 dark:border-dlugomat-800">
          Historia zapytań ({queries.length})
        </h2>
        <table className="w-full text-sm">
          <thead className="bg-ink-50 dark:bg-dlugomat-850">
            <tr>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">Wyniki</th>
              <th className="text-left p-3">Utworzono</th>
              <th className="text-left p-3">Ukończono</th>
              <th className="text-left p-3">Query</th>
            </tr>
          </thead>
          <tbody>
            {queries.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-ink-500">
                  Brak zapytań.
                </td>
              </tr>
            )}
            {queries.map((q) => (
              <tr key={q.id} className="border-t border-ink-200 dark:border-dlugomat-800">
                <td className="p-3">
                  <span
                    className={
                      "px-2 py-0.5 rounded text-xs font-semibold " +
                      (q.status === "completed"
                        ? "bg-accent-100 text-accent-800"
                        : q.status === "failed"
                        ? "bg-danger-100 text-danger-700"
                        : "bg-ink-100 text-ink-700")
                    }
                  >
                    {q.status}
                  </span>
                </td>
                <td className="p-3 font-mono">{q.items_count}</td>
                <td className="p-3 text-ink-600">
                  {new Date(q.created_at).toLocaleString("pl-PL")}
                </td>
                <td className="p-3 text-ink-600">
                  {q.completed_at ? new Date(q.completed_at).toLocaleString("pl-PL") : "—"}
                </td>
                <td className="p-3 text-xs font-mono text-ink-500 max-w-xs truncate">
                  {JSON.stringify(q.query)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
