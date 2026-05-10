"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { adminUpdateCaseStatusAction } from "@/lib/admin/admin-actions";
import { Button } from "@/components/ui/button";
import { useCsrfToken } from "@/lib/security/use-csrf";
import type { CaseStatus } from "@/lib/db/types";

const STATUSES: CaseStatus[] = [
  "draft",
  "analysis",
  "generated",
  "paid",
  "downloaded",
  "completed",
  "archived",
];

interface Props {
  caseId: string;
  currentStatus: CaseStatus;
}

export function AdminCaseStatusForm({ caseId, currentStatus }: Props) {
  const router = useRouter();
  const [status, setStatus] = React.useState<CaseStatus>(currentStatus);
  const [reason, setReason] = React.useState("");
  const [pending, startTransition] = React.useTransition();
  const [message, setMessage] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const csrf = useCsrfToken();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setError(null);
    if (status === currentStatus) {
      setError("Status nie został zmieniony.");
      return;
    }
    if (reason.trim().length < 5) {
      setError("Podaj krótkie uzasadnienie (min. 5 znaków).");
      return;
    }
    if (!csrf) {
      setError("Inicjalizacja sesji — odśwież stronę i spróbuj ponownie.");
      return;
    }

    startTransition(async () => {
      try {
        // Tier 5 zad. 203 — CSRF token do admin server action.
        const result = await adminUpdateCaseStatusAction({
          caseId,
          status,
          reason: reason.trim(),
          csrf,
        });
        setMessage(result.message);
        setReason("");
        router.refresh();
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Nieznany błąd podczas zmiany statusu.",
        );
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <label className="flex flex-col gap-1 text-fluid-xs font-semibold text-iron-600 dark:text-iron-300">
        Nowy status
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as CaseStatus)}
          disabled={pending}
          className="rounded-md border border-iron-200 bg-white px-2 py-1 text-fluid-sm font-normal dark:border-dlugomat-700 dark:bg-dlugomat-900"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
              {s === currentStatus ? " (aktualny)" : ""}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-fluid-xs font-semibold text-iron-600 dark:text-iron-300">
        Uzasadnienie
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          disabled={pending}
          rows={3}
          maxLength={500}
          placeholder="np. Reklamacja użytkownika z 10.05.2026 — odblokowanie pobrania."
          className="resize-none rounded-md border border-iron-200 bg-white px-2 py-1 text-fluid-sm font-normal dark:border-dlugomat-700 dark:bg-dlugomat-900"
        />
        <span className="text-iron-500">
          Wartość zostanie zapisana w <code>case_events.metadata.reason</code>.
        </span>
      </label>

      <Button type="submit" disabled={pending} loading={pending}>
        Zapisz status
      </Button>

      {message ? (
        <p
          role="status"
          className="rounded-md bg-accent-100 px-3 py-2 text-fluid-xs text-accent-700 dark:bg-accent-700/20 dark:text-accent-300"
        >
          {message}
        </p>
      ) : null}
      {error ? (
        <p
          role="alert"
          className="rounded-md bg-danger-100 px-3 py-2 text-fluid-xs text-danger-700 dark:bg-danger-500/15 dark:text-danger-100"
        >
          {error}
        </p>
      ) : null}
    </form>
  );
}
