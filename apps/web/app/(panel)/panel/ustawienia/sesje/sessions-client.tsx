"use client";

import { useEffect, useState, useTransition } from "react";
import { Globe, LogOut, Monitor, Smartphone, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface SessionRow {
  id: string;
  device_label: string | null;
  user_agent: string | null;
  ip: string | null;
  geo_country: string | null;
  geo_city: string | null;
  last_seen_at: string;
  created_at: string;
  is_current: boolean;
}

function deviceIcon(ua: string | null) {
  if (!ua) return Monitor;
  return /mobile|android|iphone/i.test(ua) ? Smartphone : Monitor;
}

export function SessionsClient() {
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [pending, startTransition] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    fetch("/api/security/sessions")
      .then((r) => r.json())
      .then((data) => {
        setSessions(data.sessions ?? []);
        setLoading(false);
      })
      .catch(() => {
        setErr("Nie udało się pobrać listy sesji.");
        setLoading(false);
      });
  };

  useEffect(load, []);

  const revoke = (id: string) => {
    if (!confirm("Wylogować to urządzenie?")) return;
    startTransition(async () => {
      const res = await fetch(`/api/security/sessions?id=${id}`, { method: "DELETE" });
      if (res.ok) setSessions((prev) => prev.filter((s) => s.id !== id));
    });
  };

  const revokeAll = () => {
    if (!confirm("Wylogować wszystkie sesje poza bieżącą?")) return;
    const current = sessions.find((s) => s.is_current)?.id;
    startTransition(async () => {
      const res = await fetch(`/api/security/sessions?all_except=${current ?? ""}`, { method: "DELETE" });
      if (res.ok) load();
    });
  };

  if (loading) {
    return <p className="text-fluid-sm text-iron-500">Wczytuję sesje...</p>;
  }
  if (err) {
    return <p className="text-fluid-sm text-rose-600">{err}</p>;
  }
  if (sessions.length === 0) {
    return <p className="text-fluid-sm text-iron-500">Brak aktywnych sesji.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={revokeAll} disabled={pending}>
          <LogOut className="h-4 w-4" />
          Wyloguj pozostałe urządzenia
        </Button>
      </div>
      <ul className="flex flex-col gap-2">
        {sessions.map((s) => {
          const Icon = deviceIcon(s.user_agent);
          return (
            <li
              key={s.id}
              className="flex items-start justify-between gap-3 rounded-lg border border-iron-200 p-3 dark:border-dlugomat-700"
            >
              <div className="flex items-start gap-3">
                <div className="rounded-md bg-iron-100 p-2 dark:bg-dlugomat-800">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-fluid-sm font-semibold">{s.device_label ?? "Urządzenie"}</span>
                    {s.is_current && (
                      <Badge tone="success" withDot>
                        Bieżąca
                      </Badge>
                    )}
                  </div>
                  {s.user_agent && (
                    <span className="text-fluid-xs text-iron-500" title={s.user_agent}>
                      {s.user_agent.slice(0, 90)}
                      {s.user_agent.length > 90 ? "…" : ""}
                    </span>
                  )}
                  <span className="mt-1 inline-flex items-center gap-1 text-fluid-xs text-iron-500">
                    <Globe className="h-3 w-3" />
                    {[s.geo_city, s.geo_country].filter(Boolean).join(", ") || s.ip || "Nieznana lokalizacja"}
                  </span>
                  <span className="text-fluid-xs text-iron-400">
                    Ostatnia aktywność: {new Date(s.last_seen_at).toLocaleString("pl-PL")}
                  </span>
                </div>
              </div>
              {!s.is_current && (
                <Button variant="ghost" size="icon" onClick={() => revoke(s.id)} disabled={pending}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
