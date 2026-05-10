"use client";

/**
 * Interaktywny kalkulator kwoty wolnej z wynagrodzenia (art. 87, 87¹ KP).
 *
 * Używany na landing page modułu D4 (PotrąceniaStop). Pokazuje:
 *   - kwotę wolną dla danej kategorii potrącenia,
 *   - maksymalne dopuszczalne potrącenie (limit ułamkowy),
 *   - czy kwota wolna jest aktywnym ograniczeniem.
 */
import * as React from "react";
import { Card } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Kategoria =
  | "alimentacyjne"
  | "niealimentacyjne"
  | "zaliczki_pieniezne"
  | "kary_pieniezne"
  | "kilka_tytulow";

const KATEGORIE: ReadonlyArray<{ id: Kategoria; label: string }> = [
  { id: "niealimentacyjne", label: "Niealimentacyjne (zwykły dług)" },
  { id: "alimentacyjne", label: "Alimentacyjne" },
  { id: "zaliczki_pieniezne", label: "Zaliczki pieniężne od pracodawcy" },
  { id: "kary_pieniezne", label: "Kary pieniężne (art. 108 KP)" },
  { id: "kilka_tytulow", label: "Kilka tytułów wykonawczych" },
];

interface WynagrodzenieResult {
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

export function CalculatorWynagrodzenie() {
  const [netto, setNetto] = React.useState("");
  const [kategoria, setKategoria] = React.useState<Kategoria>("niealimentacyjne");
  const [etat, setEtat] = React.useState("1");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<WynagrodzenieResult | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);

    const nettoGrosze = plnToGrosze(netto);
    if (nettoGrosze === null) {
      setError("Wpisz prawidłowe wynagrodzenie netto (np. 4500,00).");
      return;
    }
    const etatNum = Number.parseFloat(etat.replace(",", "."));
    if (!Number.isFinite(etatNum) || etatNum <= 0 || etatNum > 1) {
      setError("Etat musi być wartością w zakresie 0,05 – 1,0.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/calculators?type=wynagrodzenie", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ nettoGrosze, kategoria, etat: etatNum }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        result?: WynagrodzenieResult;
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
        <h3 className="text-lg font-semibold text-iron-900 dark:text-iron-100">
          Kalkulator kwoty wolnej z wynagrodzenia
        </h3>
        <p className="mt-1 text-sm text-iron-600 dark:text-iron-300">
          art. 87 i 87¹ Kodeksu pracy — minimalna kwota netto, którą
          pracodawca musi pozostawić Ci do dyspozycji.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField label="Wynagrodzenie netto (miesięczne)" htmlFor="calc-w-netto" required>
          <Input
            id="calc-w-netto"
            inputMode="decimal"
            placeholder="np. 4500,00"
            value={netto}
            onChange={(e) => setNetto(e.target.value)}
            required
          />
        </FormField>
        <FormField label="Wymiar etatu" htmlFor="calc-w-etat" help="1,0 = pełen etat. 0,5 = pół etatu.">
          <Input
            id="calc-w-etat"
            inputMode="decimal"
            placeholder="1,0"
            value={etat}
            onChange={(e) => setEtat(e.target.value)}
          />
        </FormField>
        <FormField label="Kategoria potrącenia" htmlFor="calc-w-kat" required className="md:col-span-2">
          <select
            id="calc-w-kat"
            value={kategoria}
            onChange={(e) => setKategoria(e.target.value as Kategoria)}
            className="flex h-11 w-full rounded-md border border-iron-200 bg-background px-3 py-2 text-sm text-iron-900 focus:border-dlugomat-500 focus:outline-none focus:shadow-shield-focus dark:border-dlugomat-800 dark:text-iron-100"
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
          <div className="grid grid-cols-1 gap-3 rounded-md border border-iron-200 bg-iron-50 p-4 dark:border-dlugomat-800 dark:bg-dlugomat-900 sm:grid-cols-3">
            <div>
              <div className="text-xs uppercase tracking-wide text-iron-500">
                Kwota wolna
              </div>
              <div className="font-semibold text-success-700 dark:text-success-400">
                {formatPLN(result.kwotaWolnaGrosze)}
              </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-iron-500">
                Maks. potrącenie
              </div>
              <div className="font-semibold text-danger-700 dark:text-danger-400">
                {formatPLN(result.maksPotracenieGrosze)}
              </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-iron-500">
                Pozostaje do wypłaty
              </div>
              <div className="font-semibold text-iron-900 dark:text-iron-100">
                {formatPLN(result.pozostaleGrosze)}
              </div>
            </div>
          </div>
          <p className="text-sm text-iron-700 dark:text-iron-200">{result.objasnienie}</p>
          <p className="text-xs text-iron-500 dark:text-iron-400">
            Podstawa prawna: {result.podstawaPrawna}. Wynik ma charakter
            informacyjny i nie stanowi porady prawnej.
          </p>
        </div>
      ) : null}
    </Card>
  );
}
