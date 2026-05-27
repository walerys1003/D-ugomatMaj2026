"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";

interface SecretMeta {
  id: string;
  name: string;
  description: string | null;
  rotation_period_days: number | null;
  last_rotated_at: string | null;
  created_at: string;
  updated_at: string;
}

export function SecretsClient({ initialSecrets }: { initialSecrets: SecretMeta[] }) {
  const [secrets, setSecrets] = useState<SecretMeta[]>(initialSecrets);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [revealed, setRevealed] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    name: "",
    value: "",
    description: "",
    rotation_period_days: 90,
  });

  async function save() {
    setError(null);
    if (!form.name.trim() || !form.value.trim()) {
      setError("Nazwa i wartość są wymagane.");
      return;
    }
    startTransition(async () => {
      try {
        const r = await fetch("/api/admin/secrets", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(form),
        });
        if (!r.ok) {
          const j = await r.json().catch(() => ({}));
          throw new Error(j?.error ?? `http_${r.status}`);
        }
        const j = await r.json();
        // Sprawdź czy nazwa już istnieje (upsert)
        setSecrets((prev) => {
          const idx = prev.findIndex((s) => s.name === j.name);
          if (idx >= 0) {
            const copy = [...prev];
            copy[idx] = j;
            return copy;
          }
          return [j, ...prev];
        });
        setForm({ name: "", value: "", description: "", rotation_period_days: 90 });
      } catch (e) {
        setError(String(e));
      }
    });
  }

  async function reveal(name: string) {
    setError(null);
    startTransition(async () => {
      try {
        const r = await fetch(
          `/api/admin/secrets?name=${encodeURIComponent(name)}&reveal=true`,
        );
        if (!r.ok) {
          const j = await r.json().catch(() => ({}));
          throw new Error(j?.error ?? `http_${r.status}`);
        }
        const j = await r.json();
        setRevealed((prev) => ({ ...prev, [name]: j.value }));
        // Auto-hide po 30s
        setTimeout(() => {
          setRevealed((prev) => {
            const copy = { ...prev };
            delete copy[name];
            return copy;
          });
        }, 30_000);
      } catch (e) {
        setError(String(e));
      }
    });
  }

  async function remove(name: string) {
    if (!confirm(`Usunąć sekret "${name}"? Akcja nieodwracalna.`)) return;
    startTransition(async () => {
      try {
        const r = await fetch(`/api/admin/secrets?name=${encodeURIComponent(name)}`, {
          method: "DELETE",
        });
        if (!r.ok) throw new Error(`http_${r.status}`);
        setSecrets((prev) => prev.filter((s) => s.name !== name));
      } catch (e) {
        setError(String(e));
      }
    });
  }

  return (
    <div className="space-y-6">
      {error && (
        <div role="alert" className="rounded-lg border border-danger-300 bg-danger-50 p-3 text-danger-700 text-sm">
          {error}
        </div>
      )}

      <section className="rounded-lg border border-ink-200 dark:border-dlugomat-800 p-4 bg-white dark:bg-dlugomat-900">
        <h2 className="font-semibold mb-3">Dodaj / zaktualizuj sekret</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <label className="flex flex-col gap-1 text-sm">
            <span>Nazwa</span>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="rounded-md border border-ink-300 dark:border-dlugomat-700 px-3 h-10 bg-transparent font-mono text-xs"
              placeholder="STRIPE_API_KEY"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm md:col-span-2">
            <span>Wartość</span>
            <input
              type="password"
              value={form.value}
              onChange={(e) => setForm({ ...form, value: e.target.value })}
              className="rounded-md border border-ink-300 dark:border-dlugomat-700 px-3 h-10 bg-transparent font-mono text-xs"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm md:col-span-2">
            <span>Opis</span>
            <input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="rounded-md border border-ink-300 dark:border-dlugomat-700 px-3 h-10 bg-transparent"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span>Rotation period (dni)</span>
            <input
              type="number"
              value={form.rotation_period_days}
              onChange={(e) =>
                setForm({ ...form, rotation_period_days: Number(e.target.value) })
              }
              className="rounded-md border border-ink-300 dark:border-dlugomat-700 px-3 h-10 bg-transparent"
            />
          </label>
        </div>
        <div className="mt-3">
          <Button onClick={save} loading={pending} variant="success">
            Zapisz
          </Button>
        </div>
      </section>

      <section className="rounded-lg border border-ink-200 dark:border-dlugomat-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-ink-50 dark:bg-dlugomat-850">
            <tr>
              <th className="text-left p-3">Nazwa</th>
              <th className="text-left p-3">Opis</th>
              <th className="text-left p-3">Ostatnia rotacja</th>
              <th className="text-left p-3">Rotation period</th>
              <th className="text-right p-3">Akcje</th>
            </tr>
          </thead>
          <tbody>
            {secrets.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-ink-500">
                  Brak sekretów w vault.
                </td>
              </tr>
            )}
            {secrets.map((s) => {
              const overdue =
                s.rotation_period_days &&
                s.last_rotated_at &&
                Date.now() -
                  new Date(s.last_rotated_at).getTime() >
                  s.rotation_period_days * 86400_000;
              return (
                <tr
                  key={s.id}
                  className="border-t border-ink-200 dark:border-dlugomat-800"
                >
                  <td className="p-3 font-mono text-xs">
                    {s.name}
                    {overdue && (
                      <span className="ml-2 px-1 py-0.5 rounded bg-danger-100 text-danger-700 text-[10px]">
                        DUE
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-ink-600 max-w-xs truncate">
                    {s.description ?? "—"}
                  </td>
                  <td className="p-3 text-ink-600">
                    {s.last_rotated_at
                      ? new Date(s.last_rotated_at).toLocaleString("pl-PL")
                      : "—"}
                  </td>
                  <td className="p-3 text-ink-600">
                    {s.rotation_period_days ? `${s.rotation_period_days} d` : "—"}
                  </td>
                  <td className="p-3 text-right space-x-3">
                    {revealed[s.name] ? (
                      <code className="bg-ink-100 dark:bg-dlugomat-800 px-2 py-1 rounded text-xs">
                        {revealed[s.name]}
                      </code>
                    ) : (
                      <button
                        onClick={() => reveal(s.name)}
                        className="text-dlugomat-600 hover:underline"
                      >
                        Pokaż
                      </button>
                    )}
                    <button onClick={() => remove(s.name)} className="text-danger-600 hover:underline">
                      Usuń
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </div>
  );
}
