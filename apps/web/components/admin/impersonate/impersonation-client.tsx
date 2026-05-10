"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";

type Scope = "read_only" | "support" | "debug" | "full";

interface Session {
  id: string;
  target_user_id: string;
  scope: Scope;
  started_at: string;
  expires_at: string;
  ended_at: string | null;
  reason: string | null;
}

export function ImpersonationClient({
  initialSessions,
}: {
  initialSessions: Session[];
}) {
  const [sessions, setSessions] = useState<Session[]>(initialSessions);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [createdToken, setCreatedToken] = useState<string | null>(null);

  const [targetUserId, setTargetUserId] = useState("");
  const [scope, setScope] = useState<Scope>("read_only");
  const [reason, setReason] = useState("");
  const [ttlMin, setTtlMin] = useState(30);

  async function start() {
    setError(null);
    setCreatedToken(null);
    if (!targetUserId.trim() || !reason.trim()) {
      setError("Wymagane: target_user_id i powód.");
      return;
    }
    startTransition(async () => {
      try {
        const r = await fetch("/api/admin/impersonate", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            target_user_id: targetUserId.trim(),
            scope,
            reason,
            ttl_minutes: ttlMin,
          }),
        });
        if (!r.ok) {
          const j = await r.json().catch(() => ({}));
          throw new Error(j?.error ?? `http_${r.status}`);
        }
        const j = await r.json();
        setCreatedToken(j.token ?? null);
        if (j.session) setSessions((prev) => [j.session, ...prev]);
        setTargetUserId("");
        setReason("");
      } catch (e) {
        setError(String(e));
      }
    });
  }

  async function revoke(id: string) {
    if (!confirm("Zakończyć tę sesję impersonacji?")) return;
    startTransition(async () => {
      try {
        const r = await fetch(`/api/admin/impersonate?id=${encodeURIComponent(id)}`, {
          method: "DELETE",
        });
        if (!r.ok) throw new Error(`http_${r.status}`);
        setSessions((prev) => prev.filter((s) => s.id !== id));
      } catch (e) {
        setError(String(e));
      }
    });
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-iron-200 dark:border-dlugomat-800 p-4 bg-white dark:bg-dlugomat-900">
        <h2 className="font-semibold mb-3">Rozpocznij nową sesję</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">ID użytkownika (UUID)</span>
            <input
              type="text"
              value={targetUserId}
              onChange={(e) => setTargetUserId(e.target.value)}
              className="rounded-md border border-iron-300 dark:border-dlugomat-700 px-3 h-10 bg-transparent"
              placeholder="00000000-0000-0000-0000-000000000000"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Scope</span>
            <select
              value={scope}
              onChange={(e) => setScope(e.target.value as Scope)}
              className="rounded-md border border-iron-300 dark:border-dlugomat-700 px-3 h-10 bg-transparent"
            >
              <option value="read_only">read_only — tylko podgląd</option>
              <option value="support">support — odpowiedzi na ticket</option>
              <option value="debug">debug — diagnostyka błędów</option>
              <option value="full">full — krytyczne, audytowane</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm md:col-span-2">
            <span className="font-medium">Powód (wymagane, trafia do audit log)</span>
            <textarea
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="rounded-md border border-iron-300 dark:border-dlugomat-700 px-3 py-2 bg-transparent"
              placeholder="Ticket #12345 — użytkownik nie widzi swojej sprawy."
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">TTL (minuty)</span>
            <input
              type="number"
              min={5}
              max={240}
              value={ttlMin}
              onChange={(e) => setTtlMin(Number(e.target.value))}
              className="rounded-md border border-iron-300 dark:border-dlugomat-700 px-3 h-10 bg-transparent"
            />
          </label>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <Button onClick={start} loading={pending} variant="danger">
            Rozpocznij impersonację
          </Button>
          {error && <span className="text-danger-600 text-sm">{error}</span>}
        </div>
        {createdToken && (
          <div className="mt-4 rounded-md border border-accent-300 bg-accent-50 p-3 text-sm">
            <strong>Token (pokazywany jednorazowo):</strong>
            <pre className="mt-1 overflow-auto text-xs">{createdToken}</pre>
            <p className="text-iron-600 mt-2">
              Skopiuj go teraz — po zamknięciu modala nie będzie już dostępny.
            </p>
          </div>
        )}
      </section>

      <section className="rounded-lg border border-iron-200 dark:border-dlugomat-800 overflow-hidden">
        <h2 className="p-3 font-semibold border-b border-iron-200 dark:border-dlugomat-800">
          Aktywne sesje ({sessions.length})
        </h2>
        <table className="w-full text-sm">
          <thead className="bg-iron-50 dark:bg-dlugomat-850">
            <tr>
              <th className="text-left p-3">Cel</th>
              <th className="text-left p-3">Scope</th>
              <th className="text-left p-3">Powód</th>
              <th className="text-left p-3">Wygasa</th>
              <th className="text-right p-3">Akcje</th>
            </tr>
          </thead>
          <tbody>
            {sessions.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-iron-500">
                  Brak aktywnych sesji impersonacji.
                </td>
              </tr>
            )}
            {sessions.map((s) => (
              <tr key={s.id} className="border-t border-iron-200 dark:border-dlugomat-800">
                <td className="p-3 font-mono text-xs">{s.target_user_id.slice(0, 8)}…</td>
                <td className="p-3">
                  <span
                    className={
                      "inline-block px-2 py-0.5 rounded text-xs font-semibold " +
                      (s.scope === "full"
                        ? "bg-danger-100 text-danger-700"
                        : s.scope === "debug"
                        ? "bg-iron-100 text-iron-700"
                        : "bg-accent-100 text-accent-800")
                    }
                  >
                    {s.scope}
                  </span>
                </td>
                <td className="p-3 text-iron-600 dark:text-iron-300 max-w-md truncate">
                  {s.reason ?? "—"}
                </td>
                <td className="p-3 text-iron-600">
                  {new Date(s.expires_at).toLocaleString("pl-PL")}
                </td>
                <td className="p-3 text-right">
                  <button
                    onClick={() => revoke(s.id)}
                    className="text-danger-600 hover:underline"
                  >
                    Zakończ
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
