"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { adminCreateRefundAction } from "@/lib/admin/admin-actions";
import { Button } from "@/components/ui/button";
import { useCsrfToken } from "@/lib/security/use-csrf";

interface Props {
  paymentId: string;
  /** Pełna kwota płatności w groszach. */
  fullAmount: number;
  /** Już zrefundowana kwota w groszach (suma udanych refundów). */
  alreadyRefunded: number;
  productName: string;
}

/**
 * Tier 4 zad. 156 — Inline refund form per płatność.
 *
 * Flow:
 *   1. Klick "Refund" → expand panel z polami (amount, reason, note).
 *   2. Confirm → wywołanie `adminCreateRefundAction` z CSRF.
 *   3. Po sukcesie → reset + router.refresh() (revalidatePath po stronie serwera).
 *
 * UX guard:
 *   - Default amount = pozostała kwota (fullAmount - alreadyRefunded).
 *   - Walidacja po stronie klienta: amount > 0 && amount <= remaining.
 *   - Double-confirm dla refundów > 50% wartości.
 */
export function AdminRefundForm({
  paymentId,
  fullAmount,
  alreadyRefunded,
  productName,
}: Props) {
  const csrf = useCsrfToken();
  const router = useRouter();
  const [expanded, setExpanded] = React.useState(false);
  const [pending, startTransition] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const remaining = fullAmount - alreadyRefunded;
  const [amountPln, setAmountPln] = React.useState<string>(
    (remaining / 100).toFixed(2),
  );
  const [reason, setReason] = React.useState<
    "duplicate" | "fraudulent" | "requested_by_customer" | ""
  >("requested_by_customer");
  const [note, setNote] = React.useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const grosze = Math.round(Number(amountPln.replace(",", ".")) * 100);
    if (!Number.isFinite(grosze) || grosze <= 0) {
      setError("Podaj poprawną kwotę.");
      return;
    }
    if (grosze > remaining) {
      setError(
        `Maks. ${(remaining / 100).toFixed(2)} PLN (zostało po wcześniejszych refundach).`,
      );
      return;
    }
    if (!csrf) {
      setError("Inicjalizacja sesji — odśwież stronę i spróbuj ponownie.");
      return;
    }

    // Double-confirm dla refundów > 50% wartości
    if (grosze > fullAmount * 0.5) {
      const ok = window.confirm(
        `Zrefundować ${(grosze / 100).toFixed(2)} PLN za "${productName}"?\n\nTo ponad 50% wartości — operacja nieodwracalna.`,
      );
      if (!ok) return;
    }

    startTransition(async () => {
      try {
        const result = await adminCreateRefundAction({
          paymentId,
          amountGrosze: grosze,
          reason: reason || undefined,
          internalNote: note.trim() || undefined,
          csrf,
        });
        setSuccess(result.message);
        setExpanded(false);
        // Rewalidacja po stronie serwera (revalidatePath) + lokalny refresh
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      }
    });
  }

  if (!expanded) {
    return (
      <div className="flex flex-col gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpanded(true)}
          disabled={pending}
        >
          Refund
        </Button>
        {success && (
          <span className="text-fluid-xs text-accent-700 dark:text-accent-300">
            {success}
          </span>
        )}
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-2 rounded-md border border-iron-300 bg-iron-50 p-2 text-fluid-xs dark:border-iron-700 dark:bg-iron-900"
    >
      <label className="flex items-center gap-2">
        <span className="w-12 text-iron-600 dark:text-iron-400">Kwota</span>
        <input
          type="text"
          inputMode="decimal"
          value={amountPln}
          onChange={(e) => setAmountPln(e.target.value)}
          className="w-20 rounded border border-iron-300 px-1 py-0.5 font-mono dark:border-iron-700 dark:bg-iron-950"
          aria-label="Kwota refundu w PLN"
          required
        />
        <span className="text-iron-500">PLN</span>
      </label>
      <label className="flex items-center gap-2">
        <span className="w-12 text-iron-600 dark:text-iron-400">Powód</span>
        <select
          value={reason}
          onChange={(e) =>
            setReason(
              e.target.value as
                | "duplicate"
                | "fraudulent"
                | "requested_by_customer"
                | "",
            )
          }
          className="rounded border border-iron-300 px-1 py-0.5 dark:border-iron-700 dark:bg-iron-950"
        >
          <option value="requested_by_customer">na żądanie klienta</option>
          <option value="duplicate">duplikat</option>
          <option value="fraudulent">fraud</option>
          <option value="">(brak)</option>
        </select>
      </label>
      <label className="flex items-start gap-2">
        <span className="w-12 pt-1 text-iron-600 dark:text-iron-400">
          Notatka
        </span>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          maxLength={1000}
          className="flex-1 rounded border border-iron-300 px-1 py-0.5 dark:border-iron-700 dark:bg-iron-950"
          placeholder="audit note (opcjonalna)"
        />
      </label>
      {error && (
        <p
          role="alert"
          className="rounded bg-danger-50 px-2 py-1 text-danger-700 dark:bg-danger-950 dark:text-danger-300"
        >
          {error}
        </p>
      )}
      <div className="flex items-center gap-2">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Wykonuję…" : "Potwierdź refund"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setExpanded(false)}
          disabled={pending}
        >
          Anuluj
        </Button>
      </div>
    </form>
  );
}
