"use client";

/**
 * Interaktywny kalkulator kwoty wolnej z emerytury / renty.
 *
 * Podstawa prawna: art. 139–141 ustawy z dnia 17 grudnia 1998 r.
 * o emeryturach i rentach z FUS.
 */
import * as React from "react";
import { Card } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Kategoria = "alimentacyjne" | "niealimentacyjne" | "nienależne" | "dps";

const KATEGORIE: ReadonlyArray<{ id: Kategoria; label: string }> = [
  { id: "niealimentacyjne", label: "Niealimentacyjne (zwykły dług)" },
  { id: "alimentacyjne", label: "Alimentacyjne" },
  { id: "nienależne", label: "Nienależnie pobrane świadczenia" },
  { id: "dps", label: "Odpłatność za pobyt w DPS" },
];

interface EmeryturaResult {
  kwotaWolnaGrosze: number;
  maksPotracenieGrosze: number;
  pozostaleGrosze: number;
  limitUlamkowy: number;
  kwotaWolnaWiazaca: boolean;
  podstawaPrawna: string;
  objasnienie: string;
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

export function CalculatorEmerytura() {
  const [brutto, setBrutto] = React.useState("");
  const [kategoria, setKategoria] = React.useState<Kategoria>("niealimentacyjne");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<EmeryturaResult | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);

    const bruttoGrosze = plnToGrosze(brutto);
    if (bruttoGrosze === null) {
      setError("Wpisz prawidłową kwotę świadczenia brutto (np. 2400,00).");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/calculators?type=emerytura", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ bruttoGrosze, kategoria }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        result?: EmeryturaResult;
        error?: string;
      };
      if (!res.ok || !data.ok || !data.result) {
        setError(
          data.error === "rate_limited"
            ? "Zbyt wiele zapytań — spróbuj za chwilę."
            : "Nie udało się obliczyć kwoty wolnej.",
        );
        return;
      }
      setResult(data.result);
    } catch {
      setError("Brak połączenia z serwerem.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card elevation="subtle" className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-ink-900 dark:text-ink-100">
          Kalkulator kwoty wolnej z emerytury / renty
        </h3>
        <p className="mt-1 text-sm text-ink-600 dark:text-ink-300">
          art. 139–141 ustawy o emeryturach i rentach z FUS — kwoty wolne
          waloryzowane co roku 1 marca razem z najniższą emeryturą.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField label="Świadczenie brutto (miesięczne)" htmlFor="calc-e-brutto" required>
          <Input
            id="calc-e-brutto"
            inputMode="decimal"
            placeholder="np. 2400,00"
            value={brutto}
            onChange={(e) => setBrutto(e.target.value)}
            required
          />
        </FormField>
        <FormField label="Kategoria potrącenia" htmlFor="calc-e-kat" required>
          <select
            id="calc-e-kat"
            value={kategoria}
            onChange={(e) => setKategoria(e.target.value as Kategoria)}
            className="flex h-11 w-full rounded-md border border-ink-200 bg-background px-3 py-2 text-sm text-ink-900 focus:border-dlugomat-500 focus:outline-none focus:shadow-shield-focus dark:border-dlugomat-800 dark:text-ink-100"
          >
            {KATEGORIE.map((k) => (
              <option key={k.id} value={k.id}>
                {k.label}
              </option>
            ))}
          </select>
        </FormField>

        <div className="md:col-span-2">
          <Button type="submit" disabled={loading}>
            {loading ? "Obliczam…" : "Oblicz kwotę wolną"}
          </Button>
        </div>
      </form>

      {error ? (
        <p role="alert" className="mt-4 text-sm text-danger-700 dark:text-danger-400">
          {error}
        </p>
      ) : null}

      {result ? (
        <div className="mt-6 space-y-4">
          <div className="grid grid-cols-1 gap-3 rounded-md border border-ink-200 bg-ink-50 p-4 dark:border-dlugomat-800 dark:bg-dlugomat-900 sm:grid-cols-3">
            <div>
              <div className="text-xs uppercase tracking-wide text-ink-500">
                Kwota wolna
              </div>
              <div className="font-semibold text-success-700 dark:text-success-400">
                {formatPLN(result.kwotaWolnaGrosze)}
              </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-ink-500">
                Maks. potrącenie
              </div>
              <div className="font-semibold text-danger-700 dark:text-danger-400">
                {formatPLN(result.maksPotracenieGrosze)}
              </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-ink-500">
                Pozostaje do wypłaty
              </div>
              <div className="font-semibold text-ink-900 dark:text-ink-100">
                {formatPLN(result.pozostaleGrosze)}
              </div>
            </div>
          </div>
          <p className="text-sm text-ink-700 dark:text-ink-200">{result.objasnienie}</p>
          <p className="text-xs text-ink-500 dark:text-ink-400">
            Podstawa prawna: {result.podstawaPrawna}. Wynik ma charakter
            informacyjny i nie stanowi porady prawnej.
          </p>
        </div>
      ) : null}
    </Card>
  );
}
