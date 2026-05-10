"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { adminUpsertPromptTemplateAction } from "@/lib/admin/admin-actions";
import { useCsrfToken } from "@/lib/security/use-csrf";
import { Button } from "@/components/ui/button";

interface PromptInitial {
  id?: string;
  case_type: string;
  variant: string;
  system_prompt: string;
  user_prompt_template: string;
  required_variables: string[];
  model: string;
  temperature: number;
  max_tokens: number;
  is_active: boolean;
  notes: string | null;
}

interface Props {
  mode: "create" | "edit";
  initial?: PromptInitial;
}

const DEFAULT_INITIAL: PromptInitial = {
  case_type: "sprzeciw_epu",
  variant: "default",
  system_prompt:
    "Jesteś polskim prawnikiem-asystentem AI. Generujesz pisma procesowe " +
    "zgodne z polskim prawem. Styl: spokojny, rzeczowy, autorytatywny — " +
    "bez paniki i bez sugerowania osobistej porady prawnej.",
  user_prompt_template: "Wygeneruj pismo na podstawie następujących danych:\n\n{{dane}}",
  required_variables: [],
  model: "claude-sonnet-4-5",
  temperature: 0.2,
  max_tokens: 4000,
  is_active: false,
  notes: null,
};

export function PromptTemplateForm({ mode, initial }: Props) {
  const router = useRouter();
  const [state, setState] = React.useState<PromptInitial>(
    initial ?? DEFAULT_INITIAL,
  );
  const [requiredVarsRaw, setRequiredVarsRaw] = React.useState(
    (initial ?? DEFAULT_INITIAL).required_variables.join(", "),
  );
  const [pending, startTransition] = React.useTransition();
  const [message, setMessage] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  function set<K extends keyof PromptInitial>(key: K, value: PromptInitial[K]) {
    setState((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setError(null);

    const required_variables = requiredVarsRaw
      .split(/[,;\n]/)
      .map((s) => s.trim())
      .filter(Boolean);

    if (!csrf) {
      setError("Inicjalizacja sesji — odśwież stronę i spróbuj ponownie.");
      return;
    }

    startTransition(async () => {
      try {
        // Tier 5 zad. 203 — CSRF token do admin server action.
        const result = await adminUpsertPromptTemplateAction({
          id: state.id,
          case_type: state.case_type,
          variant: state.variant,
          system_prompt: state.system_prompt,
          user_prompt_template: state.user_prompt_template,
          required_variables,
          model: state.model,
          temperature: state.temperature,
          max_tokens: state.max_tokens,
          is_active: state.is_active,
          notes: state.notes,
          csrf,
        });
        setMessage(result.message);
        router.refresh();
        if (mode === "create") {
          // Po utworzeniu przekieruj do edycji świeżego rekordu.
          router.push(`/admin/prompty/${result.id}`);
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Nieznany błąd podczas zapisu promptu.",
        );
      }
    });
  }

  const inputCls =
    "w-full rounded-md border border-iron-200 bg-white px-2 py-1 text-fluid-sm font-normal dark:border-dlugomat-700 dark:bg-dlugomat-900";
  const labelCls =
    "flex flex-col gap-1 text-fluid-xs font-semibold text-iron-600 dark:text-iron-300";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid gap-3 md:grid-cols-2">
        <label className={labelCls}>
          case_type
          <input
            type="text"
            value={state.case_type}
            onChange={(e) => set("case_type", e.target.value)}
            disabled={pending}
            required
            className={`${inputCls} font-mono`}
          />
        </label>
        <label className={labelCls}>
          variant
          <input
            type="text"
            value={state.variant}
            onChange={(e) => set("variant", e.target.value)}
            disabled={pending}
            required
            className={`${inputCls} font-mono`}
          />
        </label>
      </div>

      <label className={labelCls}>
        system_prompt
        <textarea
          value={state.system_prompt}
          onChange={(e) => set("system_prompt", e.target.value)}
          disabled={pending}
          required
          rows={6}
          className={`${inputCls} font-mono`}
        />
        <span className="text-iron-500">
          {state.system_prompt.length.toLocaleString("pl-PL")} znaków
        </span>
      </label>

      <label className={labelCls}>
        user_prompt_template
        <textarea
          value={state.user_prompt_template}
          onChange={(e) => set("user_prompt_template", e.target.value)}
          disabled={pending}
          required
          rows={10}
          className={`${inputCls} font-mono`}
        />
        <span className="text-iron-500">
          Placeholdery <code>{"{{nazwa}}"}</code> zostaną podstawione na etapie
          composeVariables. {state.user_prompt_template.length.toLocaleString("pl-PL")}{" "}
          znaków.
        </span>
      </label>

      <label className={labelCls}>
        required_variables (oddzielone przecinkami)
        <input
          type="text"
          value={requiredVarsRaw}
          onChange={(e) => setRequiredVarsRaw(e.target.value)}
          disabled={pending}
          placeholder="np. powod, pozwany, sygnatura, kwota"
          className={`${inputCls} font-mono`}
        />
      </label>

      <div className="grid gap-3 md:grid-cols-3">
        <label className={labelCls}>
          model
          <input
            type="text"
            value={state.model}
            onChange={(e) => set("model", e.target.value)}
            disabled={pending}
            required
            className={`${inputCls} font-mono`}
          />
        </label>
        <label className={labelCls}>
          temperature (0–1)
          <input
            type="number"
            step="0.05"
            min={0}
            max={1}
            value={state.temperature}
            onChange={(e) => set("temperature", parseFloat(e.target.value) || 0)}
            disabled={pending}
            required
            className={inputCls}
          />
        </label>
        <label className={labelCls}>
          max_tokens
          <input
            type="number"
            min={256}
            max={64000}
            step={100}
            value={state.max_tokens}
            onChange={(e) => set("max_tokens", parseInt(e.target.value, 10) || 4000)}
            disabled={pending}
            required
            className={inputCls}
          />
        </label>
      </div>

      <label className={labelCls}>
        notes (opcjonalne)
        <textarea
          value={state.notes ?? ""}
          onChange={(e) => set("notes", e.target.value || null)}
          disabled={pending}
          rows={2}
          maxLength={1000}
          className={inputCls}
        />
      </label>

      <label className="flex items-center gap-2 text-fluid-sm text-iron-700 dark:text-iron-200">
        <input
          type="checkbox"
          checked={state.is_active}
          onChange={(e) => set("is_active", e.target.checked)}
          disabled={pending}
          className="h-4 w-4 rounded border-iron-300"
        />
        Aktywuj tę wersję — pozostałe warianty dla pary{" "}
        <code className="font-mono">
          ({state.case_type}, {state.variant})
        </code>{" "}
        zostaną zdezaktywowane.
      </label>

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={pending} loading={pending}>
          {mode === "create" ? "Utwórz prompt" : "Zapisz nową wersję"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.back()}
          disabled={pending}
        >
          Anuluj
        </Button>
      </div>

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
