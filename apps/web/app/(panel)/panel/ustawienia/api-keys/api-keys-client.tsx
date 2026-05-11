"use client";

import { useEffect, useState, useTransition } from "react";
import { Copy, KeyRound, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  scopes: string[];
  last_used_at: string | null;
  created_at: string;
  revoked: boolean;
}

const AVAILABLE_SCOPES = [
  { id: "cases.read", label: "Sprawy — odczyt" },
  { id: "cases.write", label: "Sprawy — zapis" },
  { id: "documents.read", label: "Dokumenty — odczyt" },
  { id: "documents.write", label: "Dokumenty — zapis" },
  { id: "webhooks.manage", label: "Webhooki" },
  { id: "agents.run", label: "Uruchamianie AI" },
];

export function ApiKeysClient() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [pending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [scopes, setScopes] = useState<string[]>([]);
  const [newToken, setNewToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    fetch("/api/security/api-keys")
      .then((r) => r.json())
      .then((d) => {
        setKeys(d.keys ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };
  useEffect(load, []);

  const create = () => {
    if (!name.trim() || scopes.length === 0) {
      setErr("Podaj nazwę i wybierz co najmniej jeden zakres.");
      return;
    }
    setErr(null);
    startTransition(async () => {
      const res = await fetch("/api/security/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, scopes }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErr(data?.error ?? "Nie udało się utworzyć klucza.");
        return;
      }
      setNewToken(data.token);
      setShowForm(false);
      setName("");
      setScopes([]);
      load();
    });
  };

  const revoke = (id: string) => {
    if (!confirm("Cofnąć ten klucz? Operacja jest nieodwracalna.")) return;
    startTransition(async () => {
      const res = await fetch(`/api/security/api-keys?id=${id}`, { method: "DELETE" });
      if (res.ok) load();
    });
  };

  const copy = () => {
    if (!newToken) return;
    navigator.clipboard.writeText(newToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-4">
      {newToken && (
        <div className="flex flex-col gap-2 rounded-lg border border-amber-300 bg-amber-50 p-4 dark:bg-amber-950">
          <p className="text-fluid-sm font-semibold text-amber-900 dark:text-amber-100">
            Token wygenerowany — kopiowany jest tylko raz!
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 truncate rounded bg-white px-3 py-2 font-mono text-fluid-xs dark:bg-dlugomat-950">
              {newToken}
            </code>
            <Button size="sm" variant="outline" onClick={copy}>
              <Copy className="h-4 w-4" />
              {copied ? "Skopiowano" : "Kopiuj"}
            </Button>
          </div>
          <Button size="sm" variant="ghost" onClick={() => setNewToken(null)}>
            Zamknij i ukryj
          </Button>
        </div>
      )}

      {!showForm && (
        <Button onClick={() => setShowForm(true)} disabled={pending}>
          <Plus className="h-4 w-4" />
          Nowy klucz API
        </Button>
      )}

      {showForm && (
        <div className="flex flex-col gap-3 rounded-lg border border-iron-200 p-4 dark:border-dlugomat-700">
          <div className="grid gap-2">
            <Label htmlFor="key-name">Nazwa (do identyfikacji)</Label>
            <Input
              id="key-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="np. Zapier — automatyzacja faktur"
              maxLength={80}
            />
          </div>
          <div className="grid gap-2">
            <Label>Zakresy (scopes)</Label>
            <div className="grid grid-cols-2 gap-2">
              {AVAILABLE_SCOPES.map((s) => (
                <label key={s.id} className="flex items-center gap-2 text-fluid-sm">
                  <input
                    type="checkbox"
                    checked={scopes.includes(s.id)}
                    onChange={(e) =>
                      setScopes((prev) =>
                        e.target.checked ? [...prev, s.id] : prev.filter((x) => x !== s.id),
                      )
                    }
                    className="h-4 w-4 rounded accent-dlugomat-600"
                  />
                  {s.label}
                </label>
              ))}
            </div>
          </div>
          {err && <p className="text-fluid-sm text-rose-600">{err}</p>}
          <div className="flex gap-2">
            <Button onClick={create} disabled={pending}>
              Utwórz
            </Button>
            <Button variant="ghost" onClick={() => setShowForm(false)}>
              Anuluj
            </Button>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-fluid-sm text-iron-500">Wczytuję klucze...</p>
      ) : keys.length === 0 ? (
        <p className="text-fluid-sm text-iron-500">Nie masz jeszcze żadnych kluczy.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {keys.map((k) => (
            <li
              key={k.id}
              className="flex items-start justify-between gap-3 rounded-lg border border-iron-200 p-3 dark:border-dlugomat-700"
            >
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <KeyRound className="h-4 w-4 text-dlugomat-600" />
                  <span className="text-fluid-sm font-semibold">{k.name}</span>
                  {k.revoked && (
                    <Badge tone="warning" withDot>
                      Cofnięty
                    </Badge>
                  )}
                </div>
                <code className="mt-1 font-mono text-fluid-xs text-iron-500">{k.prefix}…</code>
                <div className="mt-1 flex flex-wrap gap-1">
                  {k.scopes.map((s) => (
                    <span
                      key={s}
                      className="rounded bg-iron-100 px-1.5 py-0.5 text-fluid-xs text-iron-700 dark:bg-dlugomat-800 dark:text-iron-200"
                    >
                      {s}
                    </span>
                  ))}
                </div>
                <span className="mt-1 text-fluid-xs text-iron-400">
                  Utworzony {new Date(k.created_at).toLocaleDateString("pl-PL")} ·{" "}
                  {k.last_used_at
                    ? `użyty ${new Date(k.last_used_at).toLocaleDateString("pl-PL")}`
                    : "nigdy nie użyty"}
                </span>
              </div>
              {!k.revoked && (
                <Button variant="ghost" size="icon" onClick={() => revoke(k.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
