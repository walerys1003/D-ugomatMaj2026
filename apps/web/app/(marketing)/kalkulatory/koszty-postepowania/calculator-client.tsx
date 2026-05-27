"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  calculateCourtFees,
  type CourtFeesInput,
  type CourtFeesResult,
} from "@/lib/calculators/legal-math";

const PROCEDURE_OPTIONS: Array<{
  value: CourtFeesInput["procedureKind"];
  label: string;
  hint: string;
}> = [
  { value: "epu", label: "EPU (e-sąd)", hint: "1,25% wartości, min. 30 zł" },
  { value: "regular", label: "Postępowanie zwykłe", hint: "5% wartości, max 200 000 zł" },
  { value: "small_claims", label: "Postępowanie uproszczone", hint: "Stała opłata 100/250/500 zł" },
  { value: "appeal", label: "Apelacja", hint: "Identyczna co od pozwu" },
];

export function KosztyPostepowaniaCalculator() {
  const [claimValue, setClaimValue] = useState<number>(5000);
  const [procedureKind, setProcedureKind] =
    useState<CourtFeesInput["procedureKind"]>("regular");
  const [result, setResult] = useState<CourtFeesResult | null>(null);

  function handleCalculate() {
    setResult(calculateCourtFees({ claimValue, procedureKind }));
  }

  return (
    <div className="grid lg:grid-cols-5 gap-6">
      <Card elevation="pop" className="lg:col-span-3">
        <CardHeader>
          <CardTitle>Parametry sprawy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <label className="block">
            <span className="text-sm font-medium text-ink-700 dark:text-ink-300 mb-1.5 block">
              Wartość przedmiotu sporu (PLN)
            </span>
            <input
              type="number"
              min={0}
              step={100}
              value={claimValue}
              onChange={(e) => setClaimValue(Number(e.target.value) || 0)}
              className="w-full rounded-lg border border-ink-300 dark:border-ink-700 bg-white dark:bg-ink-900 px-3 py-2 text-ink-900 dark:text-ink-50 focus:outline-none focus-visible:shadow-shield-focus"
            />
          </label>

          <div>
            <span className="text-sm font-medium text-ink-700 dark:text-ink-300 mb-2 block">
              Typ postępowania
            </span>
            <div className="grid sm:grid-cols-2 gap-2">
              {PROCEDURE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setProcedureKind(opt.value)}
                  className={`text-left rounded-lg border px-3 py-2.5 transition focus:outline-none focus-visible:shadow-shield-focus ${
                    procedureKind === opt.value
                      ? "border-accent-600 bg-accent-50 dark:bg-accent-700/10"
                      : "border-ink-300 dark:border-ink-700 hover:border-ink-400"
                  }`}
                >
                  <div className="text-sm font-medium text-ink-900 dark:text-ink-50">
                    {opt.label}
                  </div>
                  <div className="text-xs text-ink-500 mt-0.5">{opt.hint}</div>
                </button>
              ))}
            </div>
          </div>

          <Button onClick={handleCalculate} variant="primary" className="w-full">
            Oblicz koszty
          </Button>
        </CardContent>
      </Card>

      <Card elevation="subtle" className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Szacowane koszty</CardTitle>
        </CardHeader>
        <CardContent>
          {!result && (
            <p className="text-sm text-ink-500">
              Wprowadź wartość i wybierz typ postępowania, aby zobaczyć wynik.
            </p>
          )}
          {result && (
            <div className="space-y-4">
              <div className="rounded-lg bg-accent-50 dark:bg-accent-700/10 p-4 border border-accent-200 dark:border-accent-700/30">
                <div className="text-xs uppercase tracking-wider text-ink-500 mb-1">
                  Opłata sądowa od pozwu
                </div>
                <div className="font-display text-3xl font-semibold text-accent-700">
                  {result.filingFee.toLocaleString("pl-PL")} zł
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-md bg-ink-50 dark:bg-ink-900 p-3">
                  <div className="text-xs text-ink-500">Apelacja</div>
                  <div className="font-medium text-ink-900 dark:text-ink-50">
                    {result.appealFee.toLocaleString("pl-PL")} zł
                  </div>
                </div>
                <div className="rounded-md bg-ink-50 dark:bg-ink-900 p-3">
                  <div className="text-xs text-ink-500">Kasacja</div>
                  <div className="font-medium text-ink-900 dark:text-ink-50">
                    {result.cassationFee.toLocaleString("pl-PL")} zł
                  </div>
                </div>
                <div className="rounded-md bg-ink-50 dark:bg-ink-900 p-3 col-span-2">
                  <div className="text-xs text-ink-500">Komornik (szacunek 10%)</div>
                  <div className="font-medium text-ink-900 dark:text-ink-50">
                    {result.bailiffFee.toLocaleString("pl-PL")} zł
                  </div>
                </div>
              </div>

              <div className="border-t border-ink-200 dark:border-ink-800 pt-3">
                <div className="text-xs uppercase tracking-wider text-ink-500 mb-1.5">
                  Podstawa prawna
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {result.legalBasis.map((b) => (
                    <span
                      key={b}
                      className="text-xs px-2 py-0.5 rounded-full bg-ink-100 dark:bg-ink-800 text-ink-700 dark:text-ink-300"
                    >
                      {b}
                    </span>
                  ))}
                </div>
              </div>

              <ul className="space-y-1 text-xs text-ink-600 dark:text-ink-400 list-disc list-inside">
                {result.notes.map((n, i) => (
                  <li key={i}>{n}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
