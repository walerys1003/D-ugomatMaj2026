"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { adminUpdateUserRoleAction } from "@/lib/admin/admin-actions";
import { useCsrfToken } from "@/lib/security/use-csrf";
import type { UserRole } from "@/lib/db/types";

const ROLES: UserRole[] = ["user", "moderator", "admin"];

interface Props {
  userId: string;
  currentRole: UserRole;
}

export function UserRoleForm({ userId, currentRole }: Props) {
  const router = useRouter();
  const csrf = useCsrfToken();
  const [role, setRole] = React.useState<UserRole>(currentRole);
  const [pending, startTransition] = React.useTransition();
  const [feedback, setFeedback] = React.useState<{
    kind: "ok" | "err";
    text: string;
  } | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);
    if (role === currentRole) {
      setFeedback({ kind: "err", text: "Bez zmian." });
      return;
    }
    if (!csrf) {
      setFeedback({
        kind: "err",
        text: "Inicjalizacja sesji — odśwież stronę.",
      });
      return;
    }
    startTransition(async () => {
      try {
        // Tier 5 zad. 203 — CSRF token do admin server action.
        const result = await adminUpdateUserRoleAction({ userId, role, csrf });
        setFeedback({ kind: "ok", text: result.message });
        router.refresh();
      } catch (err) {
        setFeedback({
          kind: "err",
          text: err instanceof Error ? err.message : "Błąd zmiany roli.",
        });
      }
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col items-end gap-1 text-fluid-xs"
    >
      <div className="flex items-center gap-2">
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as UserRole)}
          disabled={pending}
          className="rounded-md border border-iron-200 bg-white px-2 py-1 text-fluid-xs dark:border-dlugomat-700 dark:bg-dlugomat-900"
        >
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={pending || role === currentRole}
          className="rounded-md bg-dlugomat-700 px-2 py-1 font-semibold text-white hover:bg-dlugomat-800 disabled:opacity-40"
        >
          {pending ? "…" : "Zapisz"}
        </button>
      </div>
      {feedback ? (
        <span
          role={feedback.kind === "ok" ? "status" : "alert"}
          className={
            feedback.kind === "ok"
              ? "text-accent-600 dark:text-accent-300"
              : "text-danger-600 dark:text-danger-200"
          }
        >
          {feedback.text}
        </span>
      ) : null}
    </form>
  );
}
