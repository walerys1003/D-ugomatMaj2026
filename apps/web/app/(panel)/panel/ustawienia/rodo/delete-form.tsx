"use client";

import { useState, useTransition } from "react";
import { AlertTriangle, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { deleteUserDataAction } from "@/lib/rodo/data-deletion";
import { useCsrfToken } from "@/lib/security/use-csrf";

interface DeletionResult {
  user_id_anon: string;
  deleted_at: string;
  hard_deleted: Record<string, number>;
  soft_deleted: Record<string, number>;
  anonymized: Record<string, number>;
}

export function DeleteAccountForm() {
  const [phrase, setPhrase] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DeletionResult | null>(null);
  const [isPending, startTransition] = useTransition();
  const csrf = useCsrfToken();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!csrf) {
      setError("Inicjalizacja sesji — odśwież stronę i spróbuj ponownie.");
      return;
    }
    startTransition(async () => {
      try {
        // Tier 5 zad. 203 — CSRF check (krytyczne: usunięcie konta).
        const r = await deleteUserDataAction({ confirmation: phrase, csrf });
        setResult({
          user_id_anon: r.user_id_anon,
          deleted_at: r.deleted_at,
          hard_deleted: r.hard_deleted,
          soft_deleted: r.soft_deleted,
          anonymized: r.anonymized,
        });
        // Po 5s przekieruj na stronę główną — sesja powinna być już
        // unieważniona przez admin.deleteUser, więc middleware odrzuci panel.
        setTimeout(() => {
          window.location.href = "/";
        }, 6000);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Nieznany błąd");
      }
    });
  };

  if (result) {
    const totalHard = Object.values(result.hard_deleted).reduce(
      (a, b) => a + b,
      0,
    );
    const totalSoft = Object.values(result.soft_deleted).reduce(
      (a, b) => a + b,
      0,
    );
    const totalAnon = Object.values(result.anonymized).reduce(
      (a, b) => a + b,
      0,
    );
    return (
      <div className="rounded-lg border border-shield-200 bg-shield-50/40 p-5 text-sm text-iron-800">
        <h3 className="mb-2 font-semibold text-iron-900">
          Konto usunięte — podsumowanie
        </h3>
        <ul className="list-disc space-y-1 pl-5">
          <li>Rekordów usuniętych na stałe: <strong>{totalHard}</strong></li>
          <li>Spraw zanonimizowanych (soft-delete): <strong>{totalSoft}</strong></li>
          <li>Płatności zanonimizowanych: <strong>{totalAnon}</strong></li>
          <li>
            Anonimowy hash konta:{" "}
            <code className="rounded bg-iron-100 px-1 py-0.5 text-xs">
              {result.user_id_anon}
            </code>
          </li>
        </ul>
        <p className="mt-3 text-iron-600">
          Za 6 sekund nastąpi automatyczne przekierowanie na stronę główną.
          Twoja sesja została unieważniona.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <div className="rounded-lg border border-temporal-amber-300 bg-temporal-amber-50/40 p-3 text-sm text-iron-800">
        <div className="flex items-start gap-2">
          <AlertTriangle
            className="mt-0.5 h-4 w-4 shrink-0 text-temporal-amber-600"
            aria-hidden
          />
          <div>
            <strong>Operacja nieodwracalna.</strong> Po potwierdzeniu:
            <ul className="mt-1 list-disc space-y-0.5 pl-5">
              <li>Twoje sprawy zostaną zanonimizowane (soft-delete).</li>
              <li>Wszystkie dokumenty, terminy, pliki OCR i powiadomienia zostaną trwale usunięte.</li>
              <li>Płatności zostaną zanonimizowane (zachowane 5 lat z mocy ustawy o rachunkowości — art. 71-74).</li>
              <li>Sesja zostanie wylogowana i konto Auth usunięte.</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="confirm">
          Aby potwierdzić, wpisz dokładnie:{" "}
          <code className="rounded bg-iron-100 px-1 py-0.5 text-xs">
            USUŃ MOJE KONTO
          </code>
        </Label>
        <Input
          id="confirm"
          value={phrase}
          onChange={(e) => setPhrase(e.target.value)}
          placeholder="USUŃ MOJE KONTO"
          autoComplete="off"
          autoCapitalize="characters"
          disabled={isPending}
        />
      </div>

      {error && (
        <p role="alert" className="text-fluid-sm text-temporal-red-600">
          {error}
        </p>
      )}

      <Button
        type="submit"
        variant="destructive"
        disabled={phrase.trim() !== "USUŃ MOJE KONTO" || isPending}
        loading={isPending}
      >
        <Trash2 className="mr-2 h-4 w-4" />
        Trwale usuń konto i dane
      </Button>
    </form>
  );
}
