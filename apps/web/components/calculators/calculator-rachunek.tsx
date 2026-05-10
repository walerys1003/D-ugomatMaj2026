"use client";

/**
 * Interaktywny kalkulator kwoty wolnej z rachunku bankowego (art. 54 PB).
 *
 * Używany na landing page modułu D3 (Komornik) — przekonuje użytkownika,
 * że zna swoje prawa i pokazuje konkretną kwotę chronioną.
 *
 * Wywołuje publiczne API /api/calculators?type=rachunek (rate-limit 60/min).
 * Tarcza ton: stanowczy, bez paniki, z dyskleimerem prawnym.
 */
import * as React from "react";
import { Card } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface RachunekResult {
  limitMiesiecznyGrosze: number;
  pozostalyLimitGrosze: number;
  swiadczeniaWylaczoneGrosze: number;
  lacznieChronioneGrosze: number;
  doDyspozycjiGrosze: number;
  doZajeciaGrosze: number;
  limitWyczerpany: boolean;
  podstawaPrawna: string;
  objasnienie: string;
}

interface ApiResponse {
  ok?: boolean;
  type?: string;
  result?: RachunekResult;
  error?: string;
  issues?: unknown;
}

function formatPLN(grosze: number): string {
  return `${(grosze / 100).toFixed(2).replace(".", ",")} zł`;
}

function plnToGrosze(value: string): number | null {
  const cleaned = value.replace(/\s/g, "").replace(",", ".");
  const num = Number.parseFloat(cleaned);
  if (!Number.isFinite(num) || num < 0) return null;
  return Math.round(num * 100);
}

export function CalculatorRachunek() {
  const [saldo, setSaldo] = React.useState("");
  const [wplywy, setWplywy] = React.useState("");
  const [swiadczenia, setSwiadczenia] = React.useState("");
  const [wykorzystana, setWykorzystana] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<RachunekResult | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);

    const saldoGrosze = plnToGrosze(saldo);
    const wplywyGrosze = plnToGrosze(wplywy);
    if (saldoGrosze === null || wplywyGrosze === null) {
      setError("Wpisz prawidłowe kwoty (np. 1500,00).");
      return;
    }

    const swGrosze = swiadczenia ? plnToGrosze(swiadczenia) : 0;
    const wykGrosze = wykorzystana ? plnToGrosze(wykorzystana) : 0;
    if (swGrosze === null || wykGrosze === null) {
      setError("Wpisz prawidłowe kwoty (np. 1500,00).");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/calculators?type=rachunek", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          saldoGrosze,
          wplywyMiesieczneGrosze: wplywyGrosze,
          swiadczeniaWylaczoneGrosze: swGrosze,
          juzWykorzystanaGrosze: wykGrosze,
        }),
      });
      const data = (await res.json()) as ApiResponse;
      if (!res.ok || !data.ok || !data.result) {
        setError(
          data.error === "rate_limited"
            ? "Zbyt wiele zapytań — spróbuj za chwilę."
            : "Nie udało się obliczyć kwoty wolnej. Spróbuj ponownie.",
        );
        return;
      }
      setResult(data.result);
    } catch {
      setError("Brak połączenia z serwerem. Spróbuj ponownie.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card elevation="subtle" className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-iron-900 dark:text-iron-100">
          Kalkulator kwoty wolnej z rachunku bankowego
        </h3>
        <p className="mt-1 text-sm text-iron-600 dark:text-iron-300">
          art. 54 ust. 1 Prawa bankowego — limit 75% minimalnego wynagrodzenia
          miesięcznie. Świadczenia z art. 833 § 6 KPC (500+, alimenty)
          chronione dodatkowo.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField label="Saldo zajętego rachunku" htmlFor="calc-saldo" required>
          <Input
            id="calc-saldo"
            inputMode="decimal"
            placeholder="np. 4500,00"
            value={saldo}
            onChange={(e) => setSaldo(e.target.value)}
            required
          />
        </FormField>
        <FormField label="Suma wpływów w tym miesiącu" htmlFor="calc-wplywy" required>
          <Input
            id="calc-wplywy"
            inputMode="decimal"
            placeholder="np. 5000,00"
            value={wplywy}
            onChange={(e) => setWplywy(e.target.value)}
            required
          />
        </FormField>
        <FormField
          label="Świadczenia wyłączone (500+, alimenty)"
          htmlFor="calc-sw"
          help="Pole opcjonalne — kwoty chronione poza limitem UFG (art. 833 § 6 KPC)."
        >
          <Input
            id="calc-sw"
            inputMode="decimal"
            placeholder="0,00"
            value={swiadczenia}
            onChange={(e) => setSwiadczenia(e.target.value)}
          />
        </FormField>
        <FormField
          label="Już wykorzystana kwota wolna"
          htmlFor="calc-wyk"
          help="Pole opcjonalne — wcześniejsze wypłaty z bieżącego miesiąca."
        >
          <Input
            id="calc-wyk"
            inputMode="decimal"
            placeholder="0,00"
            value={wykorzystana}
            onChange={(e) => setWykorzystana(e.target.value)}
          />
        </FormField>

        <div className="md:col-span-2">
          <Button type="submit" disabled={loading}>
            {loading ? "Obliczam…" : "Oblicz kwotę wolną"}
          </Button>
        </div>
      </form>

      {error ? (
        <p
          role="alert"
          className="mt-4 text-sm text-danger-700 dark:text-danger-400"
        >
          {error}
        </p>
      ) : null}

      {result ? (
        <div className="mt-6 space-y-4">
          <div className="grid grid-cols-1 gap-3 rounded-md border border-iron-200 bg-iron-50 p-4 dark:border-dlugomat-800 dark:bg-dlugomat-900 sm:grid-cols-3">
            <div>
              <div className="text-xs uppercase tracking-wide text-iron-500">
                Limit UFG (75% min. wynagr.)
              </div>
              <div className="font-semibold text-iron-900 dark:text-iron-100">
                {formatPLN(result.limitMiesiecznyGrosze)}
              </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-iron-500">
                Łącznie chronione
              </div>
              <div className="font-semibold text-success-700 dark:text-success-400">
                {formatPLN(result.lacznieChronioneGrosze)}
              </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-iron-500">
                Do zajęcia przez komornika
              </div>
              <div className="font-semibold text-danger-700 dark:text-danger-400">
                {formatPLN(result.doZajeciaGrosze)}
              </div>
            </div>
          </div>

          <p className="text-sm text-iron-700 dark:text-iron-200">
            {result.objasnienie}
          </p>

          <p className="text-xs text-iron-500 dark:text-iron-400">
            Podstawa prawna: {result.podstawaPrawna}. Wynik ma charakter
            informacyjny i nie stanowi porady prawnej. W przypadku wątpliwości
            skonsultuj się z radcą prawnym lub adwokatem.
          </p>
        </div>
      ) : null}
    </Card>
  );
}
