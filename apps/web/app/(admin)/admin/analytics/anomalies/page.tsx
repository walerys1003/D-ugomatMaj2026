import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "Anomalies | Admin Analytics | Długomat" };

interface Anomaly {
  id: string;
  metric: string;
  severity: "low" | "medium" | "high" | "critical";
  detected_at: string;
  baseline_value: number;
  observed_value: number;
  deviation_sigma: number;
  status: "open" | "investigating" | "resolved" | "ignored";
  hypothesis?: string;
  related_deploy_id?: string;
}

const SEVERITY_BADGE: Record<Anomaly["severity"], string> = {
  low: "bg-ink-100 text-ink-700 border-ink-200",
  medium: "bg-warn-50 text-warn-700 border-warn-200",
  high: "bg-warn-50 text-warn-800 border-warn-300",
  critical: "bg-danger-50 text-danger-700 border-danger-200",
};

const STATUS_BADGE: Record<Anomaly["status"], string> = {
  open: "bg-danger-50 text-danger-700 border-danger-200",
  investigating: "bg-warn-50 text-warn-700 border-warn-200",
  resolved: "bg-accent-50 text-accent-700 border-accent-200",
  ignored: "bg-ink-100 text-ink-600 border-ink-200",
};

async function fetchAnomalies(): Promise<Anomaly[]> {
  try {
    const res = await fetch("/api/admin/analytics/anomalies", { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return data.anomalies ?? [];
  } catch {
    return [];
  }
}

export default async function AnomaliesPage() {
  const anomalies = await fetchAnomalies();
  const open = anomalies.filter((a) => a.status === "open" || a.status === "investigating");

  return (
    <main className="container mx-auto px-4 py-8 max-w-6xl space-y-6">
      <div>
        <Link href="/admin/dashboard" className="text-xs text-ink-500 hover:text-ink-700">
          ← Admin
        </Link>
        <h1 className="font-display text-3xl font-semibold text-ink-900 dark:text-ink-50 mt-2">
          Wykrywanie anomalii
        </h1>
        <p className="text-sm text-ink-500 mt-1">
          Automatyczne wykrywanie odchyleń od baseline w kluczowych metrykach (z-score &gt; 2σ).
        </p>
      </div>

      {open.length > 0 && (
        <Card elevation="pop" urgency="critical">
          <CardHeader>
            <CardTitle className="text-danger-700">
              Aktywne ({open.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {open.map((a) => (
                <AnomalyRow key={a.id} anomaly={a} />
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Card elevation="subtle">
        <CardHeader>
          <CardTitle>Wszystkie wykryte ({anomalies.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {anomalies.length === 0 ? (
            <p className="text-sm text-ink-500">Brak anomalii — system działa stabilnie.</p>
          ) : (
            <ul className="space-y-2">
              {anomalies.map((a) => (
                <AnomalyRow key={a.id} anomaly={a} compact />
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </main>
  );
}

function AnomalyRow({ anomaly, compact = false }: { anomaly: Anomaly; compact?: boolean }) {
  const delta = anomaly.observed_value - anomaly.baseline_value;
  const deltaPct =
    anomaly.baseline_value !== 0 ? (delta / anomaly.baseline_value) * 100 : 0;
  return (
    <li className="rounded-lg border border-ink-200 dark:border-ink-800 p-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1">
        <div className="flex items-center gap-2">
          <span
            className={`text-xs px-2 py-0.5 rounded-full border ${SEVERITY_BADGE[anomaly.severity]}`}
          >
            {anomaly.severity}
          </span>
          <code className="font-mono text-sm text-ink-900 dark:text-ink-50">
            {anomaly.metric}
          </code>
          <span
            className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_BADGE[anomaly.status]}`}
          >
            {anomaly.status}
          </span>
        </div>
        <span className="text-xs text-ink-500">
          {new Date(anomaly.detected_at).toLocaleString("pl-PL")}
        </span>
      </div>
      <div className="text-sm text-ink-700 dark:text-ink-300">
        Baseline:{" "}
        <span className="font-mono">{anomaly.baseline_value.toLocaleString("pl-PL")}</span> →
        Obserwowane:{" "}
        <span className="font-mono font-semibold">
          {anomaly.observed_value.toLocaleString("pl-PL")}
        </span>{" "}
        <span
          className={`text-xs ${
            delta >= 0 ? "text-danger-700" : "text-accent-700"
          }`}
        >
          ({deltaPct >= 0 ? "+" : ""}
          {deltaPct.toFixed(1)}% · {anomaly.deviation_sigma.toFixed(1)}σ)
        </span>
      </div>
      {!compact && anomaly.hypothesis && (
        <div className="text-xs text-ink-600 dark:text-ink-400 mt-1">
          <strong>Hipoteza:</strong> {anomaly.hypothesis}
        </div>
      )}
      {!compact && anomaly.related_deploy_id && (
        <div className="text-xs text-ink-500 mt-1">
          Powiązany deploy:{" "}
          <code className="font-mono">{anomaly.related_deploy_id.slice(0, 8)}</code>
        </div>
      )}
    </li>
  );
}
