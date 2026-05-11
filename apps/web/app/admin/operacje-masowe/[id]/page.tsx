import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Pause,
  Play,
  StopCircle,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Operacja masowa — Admin Dlugomat",
  description: "Postep operacji masowej z podzialem na batche i bledami.",
};

type BulkOp = {
  id: string;
  name: string;
  type: "export" | "email" | "update" | "delete" | "import";
  status: "running" | "paused" | "completed" | "failed";
  startedAt: string;
  estimatedEnd: string;
  total: number;
  processed: number;
  succeeded: number;
  failed: number;
  initiator: string;
  scope: string;
};

type BatchRow = {
  id: string;
  range: string;
  status: "done" | "running" | "queued" | "failed";
  durationMs: number;
  errors: number;
};

const OPS: Record<string, BulkOp> = {
  "op-7821": {
    id: "op-7821",
    name: "Wysylka monitow do dluznikow przedawnionych",
    type: "email",
    status: "running",
    startedAt: "2026-05-10T10:14:00",
    estimatedEnd: "2026-05-10T12:30:00",
    total: 4820,
    processed: 3142,
    succeeded: 3098,
    failed: 44,
    initiator: "marek.wojcik@dlugomat.pl",
    scope: "Sprawy ze statusem &quot;przedawnione&quot;, ostatni kontakt > 90 dni",
  },
};

const BATCHES: BatchRow[] = [
  { id: "b-1", range: "1 - 500", status: "done", durationMs: 12400, errors: 4 },
  { id: "b-2", range: "501 - 1000", status: "done", durationMs: 11800, errors: 6 },
  { id: "b-3", range: "1001 - 1500", status: "done", durationMs: 12100, errors: 8 },
  { id: "b-4", range: "1501 - 2000", status: "done", durationMs: 12800, errors: 5 },
  { id: "b-5", range: "2001 - 2500", status: "done", durationMs: 13200, errors: 9 },
  { id: "b-6", range: "2501 - 3000", status: "done", durationMs: 12500, errors: 7 },
  { id: "b-7", range: "3001 - 3142", status: "running", durationMs: 0, errors: 5 },
  { id: "b-8", range: "3143 - 3642", status: "queued", durationMs: 0, errors: 0 },
  { id: "b-9", range: "3643 - 4142", status: "queued", durationMs: 0, errors: 0 },
  { id: "b-10", range: "4143 - 4642", status: "queued", durationMs: 0, errors: 0 },
  { id: "b-11", range: "4643 - 4820", status: "queued", durationMs: 0, errors: 0 },
];

const STATUS_TONE: Record<BulkOp["status"], "info" | "warning" | "success" | "danger"> = {
  running: "info",
  paused: "warning",
  completed: "success",
  failed: "danger",
};

const STATUS_LABEL: Record<BulkOp["status"], string> = {
  running: "W trakcie",
  paused: "Wstrzymane",
  completed: "Zakonczone",
  failed: "Bledne",
};

const BATCH_TONE: Record<
  BatchRow["status"],
  "success" | "info" | "neutral" | "danger"
> = {
  done: "success",
  running: "info",
  queued: "neutral",
  failed: "danger",
};

const BATCH_LABEL: Record<BatchRow["status"], string> = {
  done: "Gotowe",
  running: "W trakcie",
  queued: "W kolejce",
  failed: "Blad",
};

const fmtTime = (iso: string) =>
  new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));

const fmtMs = (ms: number) =>
  ms === 0 ? "—" : `${(ms / 1000).toFixed(1)} s`;

async function loadOp(id: string): Promise<BulkOp | null> {
  return OPS[id] ?? OPS["op-7821"] ?? null;
}

export default async function BulkOpDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const op = await loadOp(id);
  if (!op) return notFound();

  const progress = Math.round((op.processed / op.total) * 100);
  const successRate = ((op.succeeded / op.processed) * 100).toFixed(1);

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8">
        <Link
          href="/admin/operacje-masowe"
          className="text-sm text-slate-600 hover:text-slate-900"
        >
          ← Operacje masowe
        </Link>
        <div className="mt-3 flex items-start justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm text-slate-500">#{op.id}</span>
              <Badge tone={STATUS_TONE[op.status]} withDot>
                {STATUS_LABEL[op.status]}
              </Badge>
              <Badge tone="neutral">{op.type}</Badge>
            </div>
            <h1 className="mt-2 font-display text-2xl text-slate-900">
              {op.name}
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Uruchomione przez {op.initiator} · {fmtTime(op.startedAt)}
            </p>
          </div>
          <div className="flex gap-2">
            {op.status === "running" ? (
              <Button variant="secondary" size="sm">
                <Pause className="mr-1 h-4 w-4" />
                Wstrzymaj
              </Button>
            ) : (
              <Button variant="secondary" size="sm">
                <Play className="mr-1 h-4 w-4" />
                Wznow
              </Button>
            )}
            <Button variant="ghost" size="sm">
              <StopCircle className="mr-1 h-4 w-4" />
              Przerwij
            </Button>
          </div>
        </div>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        <Card elevation="subtle">
          <CardContent className="py-5">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Postep
            </p>
            <p className="mt-2 font-display text-2xl text-slate-900">
              {progress}%
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {op.processed.toLocaleString("pl-PL")} z{" "}
              {op.total.toLocaleString("pl-PL")}
            </p>
          </CardContent>
        </Card>
        <Card elevation="subtle">
          <CardContent className="py-5">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Skuteczność
            </p>
            <p className="mt-2 font-display text-2xl text-emerald-700">
              {successRate}%
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {op.succeeded.toLocaleString("pl-PL")} OK
            </p>
          </CardContent>
        </Card>
        <Card elevation="subtle">
          <CardContent className="py-5">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Bledy
            </p>
            <p className="mt-2 font-display text-2xl text-rose-700">
              {op.failed}
            </p>
            <p className="mt-1 text-xs text-slate-500">do recznej weryfikacji</p>
          </CardContent>
        </Card>
        <Card elevation="subtle">
          <CardContent className="py-5">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Szacowany koniec
            </p>
            <p className="mt-2 font-display text-lg text-slate-900">
              {fmtTime(op.estimatedEnd)}
            </p>
            <p className="mt-1 inline-flex items-center gap-1 text-xs text-slate-500">
              <Clock className="h-3 w-3" />
              ok. 1h 16 min
            </p>
          </CardContent>
        </Card>
      </div>

      <Card elevation="subtle" className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Postep wykonania</CardTitle>
          <CardDescription>Aktualizowane co 5 sekund</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-2 flex justify-between text-xs text-slate-500">
            <span>0</span>
            <span>{op.total.toLocaleString("pl-PL")}</span>
          </div>
          <div
            className="h-3 w-full overflow-hidden rounded-full bg-slate-100"
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full rounded-full bg-slate-900 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-3 text-sm text-slate-600">
            Zakres: <span className="font-medium text-slate-900">{op.scope}</span>
          </p>
        </CardContent>
      </Card>

      <Card elevation="subtle">
        <CardHeader>
          <CardTitle className="text-base">Batche</CardTitle>
          <CardDescription>{BATCHES.length} pakietow po 500 rekordow</CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-6 py-3 font-medium">Batch</th>
                <th className="px-6 py-3 font-medium">Zakres</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium text-right">Czas</th>
                <th className="px-6 py-3 font-medium text-right">Bledy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {BATCHES.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50">
                  <td className="px-6 py-3 font-mono text-xs text-slate-700">
                    {b.id}
                  </td>
                  <td className="px-6 py-3 text-slate-700">{b.range}</td>
                  <td className="px-6 py-3">
                    <Badge tone={BATCH_TONE[b.status]} withDot>
                      {BATCH_LABEL[b.status]}
                    </Badge>
                  </td>
                  <td className="px-6 py-3 text-right text-slate-600">
                    {fmtMs(b.durationMs)}
                  </td>
                  <td className="px-6 py-3 text-right">
                    {b.errors > 0 ? (
                      <span className="inline-flex items-center gap-1 text-xs text-rose-700">
                        <XCircle className="h-3 w-3" />
                        {b.errors}
                      </span>
                    ) : b.status === "done" ? (
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-700">
                        <CheckCircle2 className="h-3 w-3" />
                        0
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {op.failed > 0 ? (
        <Card urgency="warning" className="mt-6">
          <CardContent className="flex items-start gap-3 py-5">
            <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-600" />
            <div>
              <p className="text-sm font-medium text-slate-900">
                {op.failed} rekordow wymaga recznej weryfikacji
              </p>
              <p className="mt-1 text-xs text-slate-600">
                Glowne przyczyny: nieprawidlowy adres email (32), brak zgody
                marketingowej (12).
              </p>
              <div className="mt-3 flex gap-2">
                <Button variant="primary" size="sm">
                  Zobacz bledne rekordy
                </Button>
                <Button variant="ghost" size="sm">
                  Eksport CSV
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
