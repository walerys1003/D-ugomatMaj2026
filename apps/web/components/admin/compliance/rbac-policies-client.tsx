"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";

interface Policy {
  id: string;
  name: string;
  effect: "allow" | "deny";
  resource_pattern: string;
  action_pattern: string;
  roles: string[];
  condition: Record<string, unknown> | null;
  priority: number;
  enabled: boolean;
  created_at: string;
}

export function RbacPoliciesClient({ initialPolicies }: { initialPolicies: Policy[] }) {
  const [policies, setPolicies] = useState<Policy[]>(initialPolicies);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    effect: "allow" as "allow" | "deny",
    resource_pattern: "case:*",
    action_pattern: "case.read",
    roles: "viewer,member,admin,owner",
    condition: "",
    priority: 100,
  });

  async function save() {
    setError(null);
    if (!form.name.trim()) {
      setError("Nazwa wymagana.");
      return;
    }
    let cond: Record<string, unknown> | null = null;
    if (form.condition.trim()) {
      try {
        cond = JSON.parse(form.condition);
      } catch (e) {
        setError("Warunek musi być poprawnym JSON.");
        return;
      }
    }
    startTransition(async () => {
      try {
        const r = await fetch("/api/admin/rbac/policies", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            name: form.name.trim(),
            effect: form.effect,
            resource_pattern: form.resource_pattern.trim(),
            action_pattern: form.action_pattern.trim(),
            roles: form.roles
              .split(",")
              .map((r) => r.trim())
              .filter(Boolean),
            condition: cond,
            priority: form.priority,
            enabled: true,
          }),
        });
        if (!r.ok) {
          const j = await r.json().catch(() => ({}));
          throw new Error(j?.error ?? `http_${r.status}`);
        }
        const j = await r.json();
        setPolicies((prev) => [j as Policy, ...prev]);
        setForm({ ...form, name: "" });
      } catch (e) {
        setError(String(e));
      }
    });
  }

  async function remove(id: string) {
    if (!confirm("Usunąć tę politykę?")) return;
    startTransition(async () => {
      try {
        const r = await fetch(`/api/admin/rbac/policies?id=${encodeURIComponent(id)}`, {
          method: "DELETE",
        });
        if (!r.ok) throw new Error(`http_${r.status}`);
        setPolicies((prev) => prev.filter((p) => p.id !== id));
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

      <section className="rounded-lg border border-iron-200 dark:border-dlugomat-800 p-4 bg-white dark:bg-dlugomat-900">
        <h2 className="font-semibold mb-3">Nowa polityka</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <label className="flex flex-col gap-1 text-sm">
            <span>Nazwa</span>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="rounded-md border border-iron-300 dark:border-dlugomat-700 px-3 h-10 bg-transparent"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span>Effect</span>
            <select
              value={form.effect}
              onChange={(e) => setForm({ ...form, effect: e.target.value as any })}
              className="rounded-md border border-iron-300 dark:border-dlugomat-700 px-3 h-10 bg-transparent"
            >
              <option value="allow">allow</option>
              <option value="deny">deny</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span>Priority</span>
            <input
              type="number"
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: Number(e.target.value) })}
              className="rounded-md border border-iron-300 dark:border-dlugomat-700 px-3 h-10 bg-transparent"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span>Resource pattern</span>
            <input
              value={form.resource_pattern}
              onChange={(e) => setForm({ ...form, resource_pattern: e.target.value })}
              className="rounded-md border border-iron-300 dark:border-dlugomat-700 px-3 h-10 bg-transparent font-mono text-xs"
              placeholder="case:* / doc:abc / org:*"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span>Action pattern</span>
            <input
              value={form.action_pattern}
              onChange={(e) => setForm({ ...form, action_pattern: e.target.value })}
              className="rounded-md border border-iron-300 dark:border-dlugomat-700 px-3 h-10 bg-transparent font-mono text-xs"
              placeholder="case.read / case.* / *"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span>Roles (CSV)</span>
            <input
              value={form.roles}
              onChange={(e) => setForm({ ...form, roles: e.target.value })}
              className="rounded-md border border-iron-300 dark:border-dlugomat-700 px-3 h-10 bg-transparent"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm md:col-span-3">
            <span>Warunek (JSON, opcjonalnie)</span>
            <textarea
              rows={2}
              value={form.condition}
              onChange={(e) => setForm({ ...form, condition: e.target.value })}
              placeholder='{"ip_in_cidr": "10.0.0.0/8"}'
              className="rounded-md border border-iron-300 dark:border-dlugomat-700 px-3 py-2 bg-transparent font-mono text-xs"
            />
          </label>
        </div>
        <div className="mt-3">
          <Button onClick={save} loading={pending} variant="success">
            Zapisz politykę
          </Button>
        </div>
      </section>

      <section className="rounded-lg border border-iron-200 dark:border-dlugomat-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-iron-50 dark:bg-dlugomat-850">
            <tr>
              <th className="text-left p-3">Nazwa</th>
              <th className="text-left p-3">Effect</th>
              <th className="text-left p-3">Resource</th>
              <th className="text-left p-3">Action</th>
              <th className="text-left p-3">Roles</th>
              <th className="text-left p-3">Prio</th>
              <th className="text-right p-3"></th>
            </tr>
          </thead>
          <tbody>
            {policies.length === 0 && (
              <tr>
                <td colSpan={7} className="p-6 text-center text-iron-500">
                  Brak polityk. Dodaj pierwszą powyżej.
                </td>
              </tr>
            )}
            {policies.map((p) => (
              <tr key={p.id} className="border-t border-iron-200 dark:border-dlugomat-800">
                <td className="p-3 font-medium">{p.name}</td>
                <td className="p-3">
                  <span
                    className={
                      "px-2 py-0.5 rounded text-xs font-semibold " +
                      (p.effect === "allow"
                        ? "bg-accent-100 text-accent-800"
                        : "bg-danger-100 text-danger-700")
                    }
                  >
                    {p.effect}
                  </span>
                </td>
                <td className="p-3 font-mono text-xs">{p.resource_pattern}</td>
                <td className="p-3 font-mono text-xs">{p.action_pattern}</td>
                <td className="p-3 text-xs text-iron-600">{(p.roles ?? []).join(",")}</td>
                <td className="p-3 font-mono">{p.priority}</td>
                <td className="p-3 text-right">
                  <button onClick={() => remove(p.id)} className="text-danger-600 hover:underline">
                    Usuń
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
