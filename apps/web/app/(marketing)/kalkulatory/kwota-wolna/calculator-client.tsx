"use client";

/**
 * Tier 35 — Klient kalkulatora kwoty wolnej od egzekucji.
 */
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  calculateWageGarnishment,
  type WageGarnishmentResult,
} from "@/lib/calculators/legal-math";

export function KwotaWolnaCalculator() {
  const [netSalary, setNetSalary] = useState<string>("4500");
  const [debtKind, setDebtKind] = useState<"other" | "alimony">("other");
  const [dependents, setDependents] = useState<string>("0");
  const [result, setResult] = useState<WageGarnishmentResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const net = parseFloat(netSalary);
    const dep = parseInt(dependents, 10);
    if (!Number.isFinite(net) || net <= 0) {
      setError("Wpisz prawidłowe wynagrodzenie netto (PLN).");
      return;
    }
    if (!Number.isFinite(dep) || dep < 0) {
      setError("Liczba osób na utrzymaniu nie może być ujemna.");
      return;
    }
    setResult(calculateWageGarnishment({ netSalaryPln: net, debtKind, dependents: dep }));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="netSalary" className="text-fluid-sm font-medium text-ink-800 dark:text-ink-100">
          Wynagrodzenie netto miesięczne (PLN)
        </label>
        <input
          id="netSalary"
          type="number"
          inputMode="decimal"
          min="0"
          step="0.01"
          value={netSalary}
          onChange={(e) => setNetSalary(e.target.value)}
          className="mt-1 w-full rounded-md border border-ink-300 bg-white px-3 py-2 text-fluid-sm focus:border-dlugomat-500 focus:outline-none focus:ring-2 focus:ring-dlugomat-500/30 dark:border-dlugomat-700 dark:bg-dlugomat-900"
        />
        <p className="mt-1 text-fluid-xs text-ink-500">Kwota „na rękę”, którą faktycznie otrzymujesz.</p>
      </div>

      <div>
        <span className="text-fluid-sm font-medium text-ink-800 dark:text-ink-100">Rodzaj egzekucji</span>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          <label
            className={`cursor-pointer rounded-md border px-3 py-2 text-fluid-sm transition-colors ${
              debtKind === "other"
                ? "border-dlugomat-700 bg-dlugomat-50 dark:bg-dlugomat-900"
                : "border-ink-200 bg-white hover:border-dlugomat-300 dark:border-dlugomat-800 dark:bg-dlugomat-900"
            }`}
          >
            <input
              type="radio"
              name="debtKind"
              value="other"
              checked={debtKind === "other"}
              onChange={() => setDebtKind("other")}
              className="sr-only"
            />
            <span className="font-medium text-ink-800 dark:text-ink-100">Zwykła</span>
            <span className="block text-fluid-xs text-ink-500">max 50% wynagrodzenia</span>
          </label>
          <label
            className={`cursor-pointer rounded-md border px-3 py-2 text-fluid-sm transition-colors ${
              debtKind === "alimony"
                ? "border-dlugomat-700 bg-dlugomat-50 dark:bg-dlugomat-900"
                : "border-ink-200 bg-white hover:border-dlugomat-300 dark:border-dlugomat-800 dark:bg-dlugomat-900"
            }`}
          >
            <input
              type="radio"
              name="debtKind"
              value="alimony"
              checked={debtKind === "alimony"}
              onChange={() => setDebtKind("alimony")}
              className="sr-only"
            />
            <span className="font-medium text-ink-800 dark:text-ink-100">Alimentacyjna</span>
            <span className="block text-fluid-xs text-ink-500">max 60% wynagrodzenia</span>
          </label>
        </div>
      </div>

      <div>
        <label htmlFor="dependents" className="text-fluid-sm font-medium text-ink-800 dark:text-ink-100">
          Liczba osób na utrzymaniu (dzieci, niepracujący małżonek)
        </label>
        <input
          id="dependents"
          type="number"
          min="0"
          max="10"
          value={dependents}
          onChange={(e) => setDependents(e.target.value)}
          className="mt-1 w-full rounded-md border border-ink-300 bg-white px-3 py-2 text-fluid-sm focus:border-dlugomat-500 focus:outline-none focus:ring-2 focus:ring-dlugomat-500/30 dark:border-dlugomat-700 dark:bg-dlugomat-900"
        />
      </div>

      {error && (
        <p role="alert" className="text-fluid-sm text-danger-600">
          {error}
        </p>
      )}

      <Button type="submit" variant="primary" size="lg" className="w-full">
        Oblicz kwotę wolną
      </Button>

      {result && (
        <div
          role="status"
          aria-live="polite"
          className="mt-6 rounded-lg border-l-4 border-dlugomat-700 bg-dlugomat-50 p-5 dark:bg-dlugomat-900"
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-fluid-xs uppercase tracking-wide text-ink-500">
                Kwota wolna (chroniona)
              </p>
              <p className="mt-1 font-display text-fluid-2xl font-bold text-accent-700">
                {result.amountProtected.toLocaleString("pl-PL")} zł
              </p>
            </div>
            <div>
              <p className="text-fluid-xs uppercase tracking-wide text-ink-500">
                Maksimum do zajęcia
              </p>
              <p className="mt-1 font-display text-fluid-2xl font-bold text-danger-600">
                {result.amountSeizable.toLocaleString("pl-PL")} zł
              </p>
            </div>
          </div>

          <div className="mt-4 border-t border-ink-200 pt-3 dark:border-dlugomat-800">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">Max procent: {result.maxSeizurePercent}%</Badge>
              <Badge variant="outline">
                Min. wynagrodzenie: {result.minimumWageBase.toLocaleString("pl-PL")} zł
              </Badge>
            </div>
            <p className="mt-3 text-fluid-xs uppercase tracking-wide text-ink-500">Podstawa prawna</p>
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
