"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Link2, Unlink } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Provider {
  id: string;
  name: string;
  description: string;
  oauth_path: string;
  scopes_label: string;
}

interface Connected {
  scope?: string;
  expires_at?: string;
  created_at: string;
}

interface Props {
  providers: Provider[];
  initialConnected: Record<string, Connected>;
}

export function IntegrationsClient({ providers, initialConnected }: Props) {
  const [connected, setConnected] = useState(initialConnected);
  const [pending, startTransition] = useTransition();

  const disconnect = (id: string) => {
    if (!confirm(`Rozłączyć integrację: ${id}?`)) return;
    startTransition(async () => {
      const res = await fetch(`/api/integrations/oauth/${id}`, { method: "DELETE" });
      if (res.ok) {
        const next = { ...connected };
        delete next[id];
        setConnected(next);
      }
    });
  };

  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {providers.map((p) => {
        const conn = connected[p.id];
        const isConnected = !!conn;
        return (
          <li
            key={p.id}
            className="flex flex-col gap-2 rounded-xl border border-iron-200 bg-white p-4 dark:border-dlugomat-700 dark:bg-dlugomat-900"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <Link2 className="h-5 w-5 text-dlugomat-600" />
                <span className="text-fluid-base font-semibold">{p.name}</span>
              </div>
              {isConnected ? (
                <Badge tone="success" withDot>
                  <CheckCircle2 className="h-3 w-3" />
                  Połączone
                </Badge>
              ) : (
                <Badge tone="neutral">Dostępne</Badge>
              )}
            </div>
            <p className="text-fluid-sm text-iron-600 dark:text-iron-300">{p.description}</p>
            <code className="rounded bg-iron-100 px-2 py-1 font-mono text-fluid-xs text-iron-700 dark:bg-dlugomat-800 dark:text-iron-200">
              {p.scopes_label}
            </code>
            {isConnected ? (
              <div className="mt-1 flex items-center justify-between gap-2">
                <span className="text-fluid-xs text-iron-500">
                  Podłączono {new Date(conn.created_at).toLocaleDateString("pl-PL")}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => disconnect(p.id)}
                  disabled={pending}
                >
                  <Unlink className="h-4 w-4" />
                  Rozłącz
                </Button>
              </div>
            ) : (
              <Button asChild size="sm" className="mt-1 self-start">
                <a href={p.oauth_path}>
                  <Link2 className="h-4 w-4" />
                  Połącz
                </a>
              </Button>
            )}
          </li>
        );
      })}
    </ul>
  );
}
