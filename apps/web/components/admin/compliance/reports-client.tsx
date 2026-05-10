"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";

interface Report {
  id: string;
  kind: "dpia" | "ropa" | "soc2" | "audit_integrity";
  generated_at: string;
  generated_by: string | null;
  summary: Record<string, unknown> | null;
  payload?: Record<string, unknown> | null;
}

export function ComplianceReportsClient({
  initialReports,
}: {
  initialReports: Report[];
}) {
  const [reports, setReports] = useState<Report[]>(initialReports);
  const [open, setOpen] = useState<Report | null>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function generate(kind: Report["kind"]) {
    setError(null);
    startTransition(async () => {
      try {
        const r = await fetch("/api/compliance/reports?save=true", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ kind }),
        });
        if (!r.ok) {
          const j = await r.json().catch(() => ({}));
          throw new Error(j?.error ?? `http_${r.status}`);
        }
        const j = await r.json();
        setReports((prev) => [j as Report, ...prev]);
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

      <section className="flex flex-wrap gap-3">
        <Button onClick={() => generate("dpia")} loading={pending} variant="success">
          Wygeneruj DPIA
        </Button>
        <Button onClick={() => generate("ropa")} loading={pending}>
          Wygeneruj RoPA
        </Button>
        <Button onClick={() => generate("soc2")} loading={pending}>
          Wygeneruj SOC 2 Evidence
        </Button>
        <Button onClick={() => generate("audit_integrity")} loading={pending} variant="secondary">
          Sprawdź łańcuch audytu
        </Button>
      </section>

      <section className="rounded-lg border border-iron-200 dark:border-dlugomat-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-iron-50 dark:bg-dlugomat-850">
            <tr>
              <th className="text-left p-3">Typ</th>
              <th className="text-left p-3">Wygenerowano</th>
              <th className="text-left p-3">Podsumowanie</th>
              <th className="text-right p-3">Akcje</th>
            </tr>
          </thead>
          <tbody>
            {reports.length === 0 && (
              <tr>
                <td colSpan={4} className="p-6 text-center text-iron-500">
                  Brak zapisanych raportów. Wygeneruj pierwszy powyżej.
                </td>
              </tr>
            )}
            {reports.map((r) => (
              <tr key={r.id} className="border-t border-iron-200 dark:border-dlugomat-800">
                <td className="p-3 font-mono">{r.kind}</td>
                <td className="p-3">{new Date(r.generated_at).toLocaleString("pl-PL")}</td>
                <td className="p-3 text-iron-600 dark:text-iron-300 max-w-md truncate">
                  {summarize(r.summary)}
                </td>
                <td className="p-3 text-right">
                  <button
                    onClick={() => setOpen(r)}
                    className="text-dlugomat-600 hover:underline"
                  >
                    Podgląd
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {open && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={() => setOpen(null)}
        >
          <div
            className="bg-white dark:bg-dlugomat-900 rounded-lg max-w-3xl w-full max-h-[80vh] overflow-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold uppercase">{open.kind}</h2>
              <button onClick={() => setOpen(null)} className="text-iron-500">
                ✕
              </button>
            </header>
            <pre className="text-xs overflow-auto bg-iron-50 dark:bg-dlugomat-850 p-3 rounded">
              {JSON.stringify(open.payload ?? open.summary ?? {}, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

function summarize(s: Record<string, unknown> | null): string {
  if (!s) return "—";
  const keys = Object.keys(s);
  if (keys.length === 0) return "—";
  return keys
    .slice(0, 3)
    .map((k) => `${k}: ${JSON.stringify((s as any)[k]).slice(0, 40)}`)
    .join(" · ");
}
