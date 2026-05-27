"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  calculateRoi,
  type RoiInput,
  type RoiResult,
} from "@/lib/calculators/legal-math";

export function RoiCalculator() {
  const [hourlyRate, setHourlyRate] = useState<number>(350);
  const [hoursPerCase, setHoursPerCase] = useState<number>(8);
  const [casesPerYear, setCasesPerYear] = useState<number>(6);
  const [planPln, setPlanPln] = useState<number>(149);
  const [result, setResult] = useState<RoiResult | null>(null);

  function handleCalculate() {
    const input: RoiInput = {
      hourlyRateKancelaria: hourlyRate,
      hoursPerCase,
      casesPerYear,
      dlugomatPlanPln: planPln,
    };
    setResult(calculateRoi(input));
  }

  return (
    <div className="grid lg:grid-cols-5 gap-6">
      <Card elevation="pop" className="lg:col-span-3">
        <CardHeader>
          <CardTitle>Twoja sytuacja</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <NumField
            label="Stawka kancelarii (PLN / godzina)"
            value={hourlyRate}
            onChange={setHourlyRate}
            step={50}
          />
          <NumField
            label="Godziny pracy radcy nad jedną sprawą"
            value={hoursPerCase}
            onChange={setHoursPerCase}
            step={1}
            min={1}
          />
          <NumField
            label="Liczba spraw rocznie"
            value={casesPerYear}
            onChange={setCasesPerYear}
            step={1}
            min={1}
          />
          <NumField
            label="Plan Długomat (PLN / miesiąc)"
            value={planPln}
            onChange={setPlanPln}
            step={10}
          />

          <Button onClick={handleCalculate} variant="primary" className="w-full">
            Policz oszczędność
          </Button>
        </CardContent>
      </Card>

      <Card elevation="subtle" className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Wynik</CardTitle>
        </CardHeader>
        <CardContent>
          {!result && (
            <p className="text-sm text-ink-500">
              Wypełnij dane, aby zobaczyć porównanie.
            </p>
          )}
          {result && (
            <div className="space-y-4">
              <div className="rounded-lg bg-accent-50 dark:bg-accent-700/10 p-4 border border-accent-200 dark:border-accent-700/30">
                <div className="text-xs uppercase tracking-wider text-ink-500 mb-1">
                  Oszczędność rocznie
                </div>
                <div className="font-display text-3xl font-semibold text-accent-700">
                  {result.savingsYearly.toLocaleString("pl-PL")} zł
                </div>
                <div className="text-xs text-ink-500 mt-1">
                  {result.savingsPercent}% taniej
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-md bg-ink-50 dark:bg-ink-900 p-3">
                  <div className="text-xs text-ink-500">Kancelaria / rok</div>
                  <div className="font-medium text-ink-900 dark:text-ink-50">
                    {result.kancelariaCostYearly.toLocaleString("pl-PL")} zł
                  </div>
                </div>
                <div className="rounded-md bg-ink-50 dark:bg-ink-900 p-3">
                  <div className="text-xs text-ink-500">Długomat / rok</div>
                  <div className="font-medium text-ink-900 dark:text-ink-50">
                    {result.dlugomatCostYearly.toLocaleString("pl-PL")} zł
                  </div>
                </div>
              </div>

              {Number.isFinite(result.paybackMonths) && (
                <div className="rounded-md bg-ink-50 dark:bg-ink-900 p-3 text-sm">
                  <div className="text-xs text-ink-500">Zwrot inwestycji</div>
                  <div className="font-medium text-ink-900 dark:text-ink-50">
                    {result.paybackMonths} miesiąca
                  </div>
                </div>
              )}

              <p className="text-xs text-ink-500">
                Szacunek opiera się o wprowadzone dane. Realne oszczędności mogą się
                różnić w zależności od typu i skomplikowania spraw.
              </p>
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
      <span className="text-sm font-medium text-ink-700 dark:text-ink-300 mb-1.5 block">
        {label}
      </span>
      <input
        type="number"
        min={min}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className="w-full rounded-lg border border-ink-300 dark:border-ink-700 bg-white dark:bg-ink-900 px-3 py-2 text-ink-900 dark:text-ink-50 focus:outline-none focus-visible:shadow-shield-focus"
      />
    </label>
  );
}
