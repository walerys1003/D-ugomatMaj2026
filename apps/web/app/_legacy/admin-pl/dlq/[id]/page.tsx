import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, RefreshCw, Trash2, XCircle } from "lucide-react";
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
  title: "Failed job — Admin Dlugomat",
  description: "Szczegoly nieudanego zadania z DLQ z mozliwoscia retry.",
};

type FailedJob = {
  id: string;
  queue: string;
  jobName: string;
  failedAt: string;
  attempts: number;
  maxAttempts: number;
  error: string;
  stackTrace: string[];
  payload: Record<string, unknown>;
  context: { worker: string; node: string; correlationId: string };
};

const JOBS: Record<string, FailedJob> = {
  "dlq-3047": {
    id: "dlq-3047",
    queue: "documents.ocr",
    jobName: "ProcessNakazPdf",
    failedAt: "2026-05-10T08:42:18",
    attempts: 5,
    maxAttempts: 5,
    error: "OCRTimeoutError: Tesseract worker timed out after 30s",
    stackTrace: [
      "at OcrWorker.process (workers/ocr.ts:142:11)",
      "at JobQueue.execute (queue/runner.ts:88:24)",
      "at async Worker.handleJob (queue/worker.ts:64:5)",
    ],
    payload: {
      documentId: "doc_4f8a2c",
      fileName: "Nakaz_4521_2026.pdf",
      fileSize: 4194304,
      uploadedBy: "usr_487",
      attempt: 5,
    },
    context: {
      worker: "ocr-worker-3",
      node: "node-eu-west-1b",
      correlationId: "corr_8f2d1a",
    },
  },
};

const fmtTime = (iso: string) =>
  new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(iso));

async function loadJob(id: string): Promise<FailedJob | null> {
  return JOBS[id] ?? JOBS["dlq-3047"] ?? null;
}

export default async function FailedJobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const job = await loadJob(id);
  if (!job) return notFound();

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-8">
        <Link
          href="/admin/dlq"
          className="text-sm text-slate-600 hover:text-slate-900"
        >
          ← Dead Letter Queue
        </Link>
        <div className="mt-3 flex items-start justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm text-slate-500">#{job.id}</span>
              <Badge tone="danger" withDot>
                Failed
              </Badge>
              <Badge tone="neutral">{job.queue}</Badge>
            </div>
            <h1 className="mt-2 font-display text-2xl text-slate-900">
              {job.jobName}
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              {fmtTime(job.failedAt)} · {job.attempts}/{job.maxAttempts} prob
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm">
              <RefreshCw className="mr-1 h-4 w-4" />
              Retry
            </Button>
            <Button variant="ghost" size="sm">
              <Trash2 className="mr-1 h-4 w-4" />
              Odrzuc
            </Button>
          </div>
        </div>
      </div>

      <Card urgency="critical" className="mb-6">
        <CardContent className="flex items-start gap-4 py-5">
          <XCircle className="mt-1 h-5 w-5 text-rose-600" />
          <div className="flex-1">
            <p className="font-medium text-slate-900">Blad krytyczny</p>
            <p className="mt-1 font-mono text-sm text-slate-700">{job.error}</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card elevation="subtle">
          <CardHeader>
            <CardTitle className="text-base">Payload</CardTitle>
            <CardDescription>Dane wejsciowe zadania</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="overflow-x-auto rounded-lg border border-slate-200 bg-slate-50 p-4 font-mono text-xs text-slate-700">
              {JSON.stringify(job.payload, null, 2)}
            </pre>
          </CardContent>
        </Card>

        <Card elevation="subtle">
          <CardHeader>
            <CardTitle className="text-base">Kontekst wykonania</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">Worker</dt>
                <dd className="font-mono text-xs text-slate-700">
                  {job.context.worker}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">Node</dt>
                <dd className="font-mono text-xs text-slate-700">
                  {job.context.node}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">Correlation ID</dt>
                <dd className="font-mono text-xs text-slate-700">
                  {job.context.correlationId}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">Proby</dt>
                <dd>
                  <Badge tone="danger">
                    {job.attempts}/{job.maxAttempts}
                  </Badge>
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>

      <Card elevation="subtle" className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertTriangle className="h-4 w-4 text-rose-600" />
            Stack trace
          </CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="overflow-x-auto rounded-lg border border-rose-200 bg-rose-50 p-4 font-mono text-xs text-slate-700">
            {job.stackTrace.join("\n")}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
