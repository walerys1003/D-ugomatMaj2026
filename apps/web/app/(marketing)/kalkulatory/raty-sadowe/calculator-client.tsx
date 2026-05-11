"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  evaluateCostsExemption,
  type CostsExemptionInput,
  type CostsExemptionResult,
} from "@/lib/calculators/legal-math";

const REC_LABELS: Record<CostsExemptionResult["exemptionRecommendation"], { label: string; color: string }> = {
  full: { label: "Zwolnienie w całości", color: "text-accent-700 bg-accent-50 border-accent-200" },
  partial: { label: "Zwolnienie w części", color: "text-accent-700 bg-accent-50 border-accent-200" },
  installments: { label: "Rozłożenie na raty", color: "text-warn-700 bg-warn-50 border-warn-200" },
  none: { label: "Niskie szanse", color: "text-danger-700 bg-danger-50 border-danger-200" },
};

export function RatySadoweCalculator() {
  const [income, setIncome] = useState<number>(3000);
  const [household, setHousehold] = useState<number>(2);
  const [expenses, setExpenses] = useState<number>(2500);
  const [assets, setAssets] = useState<number>(500);
  const [result, setResult] = useState<CostsExemptionResult | null>(null);

  function handleCalculate() {
    const input: CostsExemptionInput = {
      monthlyIncomeNet: income,
      householdSize: household,
      monthlyExpenses: expenses,
      liquidAssets: assets,
    };
    setResult(evaluateCostsExemption(input));
  }

  return (
    <div className="grid lg:grid-cols-5 gap-6">
      <Card elevation="pop" className="lg:col-span-3">
        <CardHeader>
          <CardTitle>Sytuacja majątkowa</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <NumField label="Dochód netto miesięcznie (PLN)" value={income} onChange={setIncome} step={100} />
          <NumField label="Liczba osób w gospodarstwie" value={household} onChange={setHousehold} step={1} min={1} />
          <NumField label="Stałe wydatki miesięczne (PLN)" value={expenses} onChange={setExpenses} step={100} />
          <NumField label="Oszczędności i aktywa płynne (PLN)" value={assets} onChange={setAssets} step={500} />

          <Button onClick={handleCalculate} variant="primary" className="w-full">
            Oceń szanse
          </Button>
        </CardContent>
      </Card>

      <Card elevation="subtle" className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Wynik wstępnej oceny</CardTitle>
        </CardHeader>
        <CardContent>
          {!result && (
            <p className="text-sm text-iron-500">
              Wypełnij dane finansowe, by zobaczyć rekomendację.
            </p>
          )}
          {result && (
            <div className="space-y-4">
              <div className={`rounded-lg border px-4 py-3 ${REC_LABELS[result.exemptionRecommendation].color}`}>
                <div className="text-xs uppercase tracking-wider mb-1 opacity-80">
                  Rekomendacja
                </div>
                <div className="font-display text-xl font-semibold">
                  {REC_LABELS[result.exemptionRecommendation].label}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs text-iron-500 mb-1.5">
                  <span>Wskaźnik kwalifikowalności</span>
                  <span className="font-medium text-iron-900 dark:text-iron-50">
                    {result.eligibilityScore} / 100
                  </span>
                </div>
                <div className="h-2 rounded-full bg-iron-100 dark:bg-iron-800 overflow-hidden">
                  <div
                    className="h-full bg-accent-600 transition-all"
                    style={{ width: `${result.eligibilityScore}%` }}
                  />
                </div>
              </div>

              {result.installmentMonthsRecommended > 0 && (
                <div className="rounded-md bg-iron-50 dark:bg-iron-900 p-3 text-sm">
                  <div className="text-xs text-iron-500">Sugerowana liczba rat</div>
                  <div className="font-medium text-iron-900 dark:text-iron-50">
                    {result.installmentMonthsRecommended} miesięcy
                  </div>
                </div>
              )}

              <div className="border-t border-iron-200 dark:border-iron-800 pt-3">
                <div className="text-xs uppercase tracking-wider text-iron-500 mb-1.5">
                  Podstawa prawna
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {result.legalBasis.map((b) => (
                    <span
                      key={b}
                      className="text-xs px-2 py-0.5 rounded-full bg-iron-100 dark:bg-iron-800 text-iron-700 dark:text-iron-300"
                    >
                      {b}
                    </span>
                  ))}
                </div>
              </div>

              <ul className="space-y-1 text-xs text-iron-600 dark:text-iron-400 list-disc list-inside">
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

function NumField({
  label,
  value,
  onChange,
  step = 1,
  min = 0,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
  min?: number;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-iron-700 dark:text-iron-300 mb-1.5 block">
        {label}
      </span>
      <input
        type="number"
        min={min}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className="w-full rounded-lg border border-iron-300 dark:border-iron-700 bg-white dark:bg-iron-900 px-3 py-2 text-iron-900 dark:text-iron-50 focus:outline-none focus-visible:shadow-shield-focus"
      />
    </label>
  );
}
