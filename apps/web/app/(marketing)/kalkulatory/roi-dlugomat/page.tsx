import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RoiCalculator } from "./calculator-client";

export const metadata: Metadata = {
  title: "Kalkulator ROI Długomat vs kancelaria | Długomat",
  description:
    "Oblicz, ile zaoszczędzisz rocznie używając Długomata zamiast tradycyjnej kancelarii prawnej.",
};

export default function RoiPage() {
  return (
    <main className="bg-iron-50 dark:bg-iron-950 pb-24">
      <section className="border-b border-iron-200 dark:border-iron-800 bg-white dark:bg-iron-900">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <p className="text-xs uppercase tracking-wider text-iron-500 mb-3">
            Kalkulatory prawne · 5 z 5
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-semibold text-iron-900 dark:text-iron-50 mb-4">
            ROI: Długomat vs kancelaria
          </h1>
          <p className="text-lg text-iron-700 dark:text-iron-300 max-w-2xl">
            Porównaj koszty obsługi prawnej z Długomatem do tradycyjnego modelu
            kancelaryjnego. Zobacz, ile zaoszczędzisz rocznie.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-10 max-w-4xl">
        <RoiCalculator />
      </section>

      <section className="container mx-auto px-4 max-w-4xl">
        <Card elevation="subtle">
          <CardHeader>
            <CardTitle>Gotowy zacząć oszczędzać?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-iron-700 dark:text-iron-300">
              Wypróbuj Długomat za darmo przez 14 dni — bez karty kredytowej.
            </p>
            <div className="flex flex-wrap gap-2">
              <Link href="/rejestracja">
                <Button variant="primary">Załóż konto</Button>
              </Link>
              <Link href="/cennik">
                <Button variant="secondary">Zobacz plany</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
