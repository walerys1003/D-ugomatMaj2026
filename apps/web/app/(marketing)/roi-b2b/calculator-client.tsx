"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface RoiB2BResult {
  hours_saved_yearly: number;
  cost_saved_yearly_pln: number;
  capacity_increase_percent: number;
  dlugomat_cost_yearly_pln: number;
  net_benefit_yearly_pln: number;
  payback_months: number;
}

function compute(
  lawyers: number,
  hourlyCostPln: number,
  hoursPerLetter: number,
  lettersPerMonth: number,
  dlugomatMonthlyPln: number,
): RoiB2BResult {
  const totalLettersYear = lettersPerMonth * 12;
  const hoursManual = totalLettersYear * hoursPerLetter;
  const hoursWithDlugomat = totalLettersYear * (hoursPerLetter * 0.25); // 75% redukcji
  const hoursSaved = hoursManual - hoursWithDlugomat;
  const costSaved = hoursSaved * hourlyCostPln;
  const dlugomatYearly = dlugomatMonthlyPln * 12;
  const netBenefit = costSaved - dlugomatYearly;
  const monthlyBenefit = netBenefit / 12;
  const payback = monthlyBenefit > 0 ? dlugomatMonthlyPln / monthlyBenefit : Infinity;
  const totalCapacityHours = lawyers * 1600; // ~1600 produktywnych godzin/rok
  const capacityIncrease = totalCapacityHours > 0 ? (hoursSaved / totalCapacityHours) * 100 : 0;

  return {
    hours_saved_yearly: Math.round(hoursSaved),
    cost_saved_yearly_pln: Math.round(costSaved),
    capacity_increase_percent: Math.round(capacityIncrease * 10) / 10,
    dlugomat_cost_yearly_pln: dlugomatYearly,
    net_benefit_yearly_pln: Math.round(netBenefit),
    payback_months: Number.isFinite(payback) ? Math.round(payback * 10) / 10 : Infinity,
  };
}

export function RoiB2BCalculator() {
  const [lawyers, setLawyers] = useState(5);
  const [hourlyCost, setHourlyCost] = useState(250);
  const [hoursPerLetter, setHoursPerLetter] = useState(3);
  const [lettersPerMonth, setLettersPerMonth] = useState(40);
  const [planPln, setPlanPln] = useState(999);
  const [result, setResult] = useState<RoiB2BResult | null>(null);

  function handleCalculate() {
    setResult(compute(lawyers, hourlyCost, hoursPerLetter, lettersPerMonth, planPln));
  }

  return (
    <div className="grid lg:grid-cols-5 gap-6">
      <Card elevation="pop" className="lg:col-span-3">
        <CardHeader>
          <CardTitle>Twoja organizacja</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <NumField label="Liczba prawników w zespole" value={lawyers} onChange={setLawyers} step={1} min={1} />
          <NumField
            label="Koszt godziny pracy prawnika (PLN, koszt firmowy)"
            value={hourlyCost}
            onChange={setHourlyCost}
            step={25}
          />
          <NumField
            label="Średni czas tworzenia jednego pisma (godziny)"
            value={hoursPerLetter}
            onChange={setHoursPerLetter}
            step={0.5}
            min={0.5}
          />
          <NumField
            label="Liczba pism miesięcznie"
            value={lettersPerMonth}
            onChange={setLettersPerMonth}
            step={5}
            min={1}
          />
          <NumField
            label="Plan Długomat (PLN / miesiąc)"
            value={planPln}
            onChange={setPlanPln}
            step={50}
          />

          <Button onClick={handleCalculate} variant="primary" className="w-full">
            Policz oszczędność
          </Button>

          <p className="text-xs text-ink-500">
            Założenie: Długomat skraca czas pracy nad pismem o 75%. Walidowane na
            danych klientów segmentu kancelarie i działy windykacji.
          </p>
        </CardContent>
      </Card>

      <Card elevation="subtle" className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Wynik dla Twojej firmy</CardTitle>
        </CardHeader>
        <CardContent>
          {!result && (
            <p className="text-sm text-ink-500">Wypełnij dane, aby zobaczyć ROI.</p>
          )}
          {result && (
            <div className="space-y-4">
              <div className="rounded-lg bg-accent-50 dark:bg-accent-700/10 p-4 border border-accent-200 dark:border-accent-700/30">
                <div className="text-xs uppercase tracking-wider text-ink-500 mb-1">
                  Czysty zysk rocznie
                </div>
                <div className="font-display text-3xl font-semibold text-accent-700">
                  {result.net_benefit_yearly_pln.toLocaleString("pl-PL")} zł
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <Row
                  label="Zaoszczędzone godziny rocznie"
                  value={`${result.hours_saved_yearly.toLocaleString("pl-PL")} h`}
                />
                <Row
                  label="Wartość zaoszczędzonego czasu"
                  value={`${result.cost_saved_yearly_pln.toLocaleString("pl-PL")} zł`}
                />
                <Row
                  label="Koszt Długomat rocznie"
                  value={`${result.dlugomat_cost_yearly_pln.toLocaleString("pl-PL")} zł`}
                />
                <Row
                  label="Wzrost wydajności zespołu"
                  value={`+${result.capacity_increase_percent}%`}
                />
                {Number.isFinite(result.payback_months) && (
                  <Row
                    label="Zwrot inwestycji"
                    value={`${result.payback_months} miesiąca`}
                  />
                )}
              </div>

              <form method="post" action="/api/leads/roi-b2b" className="pt-3 border-t border-ink-200 dark:border-ink-800">
                <label className="block mb-2">
                  <span className="text-xs font-medium text-ink-700 dark:text-ink-300 mb-1 block">
                    Wyślij raport PDF na e-mail
                  </span>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="adres@firma.pl"
                    className="w-full rounded-lg border border-ink-300 dark:border-ink-700 bg-white dark:bg-ink-900 px-3 py-2 text-sm focus:outline-none focus-visible:shadow-shield-focus"
                  />
                </label>
                <input type="hidden" name="payload" value={JSON.stringify(result)} />
                <Button type="submit" variant="primary" className="w-full">
                  Wyślij raport
                </Button>
              </form>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-ink-600 dark:text-ink-400">{label}</span>
      <span className="font-medium text-ink-900 dark:text-ink-50 tabular-nums">{value}</span>
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
