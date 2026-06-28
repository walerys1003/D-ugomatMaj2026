"use client";

/**
 * Tier 35 — Klient kalkulatora przedawnienia.
 *
 * Stan: formularz + wynik. Walidacja inline, zero round-tripów na backend.
 * Logika: lib/calculators/legal-math.ts → calculateLimitation().
 */
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  calculateLimitation,
  type ClaimKind,
  type LimitationResult,
} from "@/lib/calculators/legal-math";

const KIND_OPTIONS: { value: ClaimKind; label: string; hint: string }[] = [
  { value: "consumer_general", label: "Konsumenckie (kredyt, karta, pożyczka)", hint: "3 lata" },
  { value: "consumer_periodic", label: "Okresowe (najem, abonament, media)", hint: "3 lata" },
  { value: "business_general", label: "Z działalności gospodarczej", hint: "3 lata" },
  { value: "tort", label: "Z czynu niedozwolonego (deliktowe)", hint: "3 lata od wiedzy, max 10 lat" },
  { value: "general_civil", label: "Ogólne cywilne (od 9.07.2018)", hint: "6 lat" },
  { value: "labor", label: "Ze stosunku pracy", hint: "3 lata" },
  { value: "tax", label: "Podatkowe", hint: "5 lat" },
];

export function PrzedawnienieCalculator() {
  const [dueDate, setDueDate] = useState("");
  const [kind, setKind] = useState<ClaimKind>("consumer_general");
  const [interrupted, setInterrupted] = useState(false);
  const [interruptionDate, setInterruptionDate] = useState("");
  const [result, setResult] = useState<LimitationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!dueDate) {
      setError("Podaj datę wymagalności roszczenia.");
      return;
    }
    if (interrupted && !interruptionDate) {
      setError("Zaznaczyłeś przerwanie — podaj datę przerwania biegu.");
      return;
    }
    try {
      const r = calculateLimitation({
        claimDueDate: dueDate,
        kind,
        interrupted,
        interruptionDate: interrupted ? interruptionDate : undefined,
      });
      setResult(r);
    } catch {
      setError("Nieprawidłowa data. Użyj formatu YYYY-MM-DD.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="dueDate" className="text-fluid-sm font-medium text-ink-800 dark:text-ink-100">
          Data wymagalności roszczenia
        </label>
        <input
          id="dueDate"
          name="dueDate"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          required
          className="mt-1 w-full rounded-md border border-ink-300 bg-white px-3 py-2 text-fluid-sm focus:border-dlugomat-500 focus:outline-none focus:ring-2 focus:ring-dlugomat-500/30 dark:border-dlugomat-700 dark:bg-dlugomat-900"
        />
        <p className="mt-1 text-fluid-xs text-ink-500">
          Najczęściej: data ostatniej raty / data wymagalności faktury / data zdarzenia.
        </p>
      </div>

      <div>
        <label htmlFor="kind" className="text-fluid-sm font-medium text-ink-800 dark:text-ink-100">
          Typ roszczenia
        </label>
        <select
          id="kind"
          value={kind}
          onChange={(e) => setKind(e.target.value as ClaimKind)}
          className="mt-1 w-full rounded-md border border-ink-300 bg-white px-3 py-2 text-fluid-sm focus:border-dlugomat-500 focus:outline-none focus:ring-2 focus:ring-dlugomat-500/30 dark:border-dlugomat-700 dark:bg-dlugomat-900"
        >
          {KIND_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label} — {o.hint}
            </option>
          ))}
        </select>
      </div>

      <div className="rounded-md border border-ink-200 bg-ink-50 p-4 dark:border-dlugomat-800 dark:bg-dlugomat-900">
        <label className="flex items-start gap-2 text-fluid-sm">
          <input
            type="checkbox"
            checked={interrupted}
            onChange={(e) => setInterrupted(e.target.checked)}
            className="mt-1"
          />
          <span className="text-ink-700 dark:text-ink-200">
            Bieg przedawnienia został <strong>przerwany</strong> (uznanie długu, pozew, mediacja).
          </span>
        </label>
        {interrupted && (
          <div className="mt-3 pl-6">
            <label htmlFor="interruption" className="text-fluid-xs font-medium text-ink-700 dark:text-ink-200">
              Data przerwania
            </label>
            <input
              id="interruption"
              type="date"
              value={interruptionDate}
              onChange={(e) => setInterruptionDate(e.target.value)}
              className="mt-1 w-full rounded-md border border-ink-300 bg-white px-3 py-2 text-fluid-sm focus:border-dlugomat-500 focus:outline-none focus:ring-2 focus:ring-dlugomat-500/30 dark:border-dlugomat-700 dark:bg-dlugomat-900"
            />
          </div>
        )}
      </div>

      {error && (
        <p role="alert" className="text-fluid-sm text-danger-600">
          {error}
        </p>
      )}

      <Button type="submit" variant="primary" size="lg" className="w-full">
        Oblicz przedawnienie
      </Button>

      {result && (
        <div
          role="status"
          aria-live="polite"
          className={`mt-6 rounded-lg border-l-4 p-5 ${
            result.isLimited
              ? "border-accent-600 bg-accent-50 dark:bg-dlugomat-900"
              : result.daysRemaining < 90
                ? "border-warn-500 bg-warn-50 dark:bg-dlugomat-900"
                : "border-dlugomat-500 bg-dlugomat-50 dark:bg-dlugomat-900"
          }`}
        >
          <div className="flex items-center gap-2">
            <Badge
              className={
                result.isLimited
                  ? "bg-accent-600 text-white"
                  : result.daysRemaining < 90
                    ? "bg-warn-500 text-white"
                    : "bg-dlugomat-700 text-white"
              }
            >
              {result.isLimited ? "Przedawnione" : "Nieprzedawnione"}
            </Badge>
            <span className="text-fluid-xs text-ink-500">Okres: {result.yearsApplicable} lat</span>
          </div>

          <p className="mt-3 font-display text-fluid-xl font-semibold text-dlugomat-900 dark:text-ink-50">
            {result.isLimited
              ? `Przedawnione od ${Math.abs(result.daysRemaining)} dni`
              : `Pozostało ${result.daysRemaining} dni`}
          </p>
          <p className="mt-1 text-fluid-sm text-ink-700 dark:text-ink-200">
            Data przedawnienia:{" "}
            <strong>
              {new Date(result.limitationEndDate).toLocaleDateString("pl-PL", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </strong>
          </p>

          {result.warning && (
            <p className="mt-3 text-fluid-sm font-medium text-ink-800 dark:text-ink-100">
              {result.warning}
            </p>
          )}

          <div className="mt-4 border-t border-ink-200 pt-3 dark:border-dlugomat-800">
            <p className="text-fluid-xs uppercase tracking-wide text-ink-500">Podstawa prawna</p>
            <ul className="mt-1 flex flex-wrap gap-1.5">
              {result.legalBasis.map((b) => (
                <li
                  key={b}
                  className="rounded bg-white px-2 py-0.5 font-mono text-fluid-xs text-ink-700 dark:bg-dlugomat-950 dark:text-ink-200"
                >
                  {b}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </form>
  );
}
