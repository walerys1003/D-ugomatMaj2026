import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RegistrationWizard } from "./wizard-client";

export const metadata: Metadata = {
  title: "Załóż konto | Długomat",
  description:
    "Załóż darmowe konto w Długomat w 90 sekund. Bez karty kredytowej, bez zobowiązań.",
  robots: { index: true, follow: true },
};

export default function RejestracjaPage() {
  return (
    <main className="bg-ink-50 dark:bg-ink-950 min-h-screen pb-20">
      <section className="border-b border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900">
        <div className="container mx-auto px-4 py-10 max-w-3xl text-center">
          <p className="text-xs uppercase tracking-wider text-ink-500 mb-2">
            Krok do tarczy
          </p>
          <h1 className="font-display text-3xl md:text-4xl font-semibold text-ink-900 dark:text-ink-50">
            Załóż konto
          </h1>
          <p className="text-ink-600 dark:text-ink-300 mt-2 max-w-xl mx-auto">
            14 dni darmowo · bez karty · pełen dostęp do modułów D1–D16
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-8 max-w-3xl">
        <RegistrationWizard />
      </section>

      <section className="container mx-auto px-4 max-w-3xl">
        <Card elevation="subtle">
          <CardHeader>
            <CardTitle className="text-base">Bezpieczeństwo Twoich danych</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-ink-600 dark:text-ink-400">
            <p>
              Twoje dane są szyfrowane (AES-256), zgodne z RODO. Możesz w każdej
              chwili wyeksportować lub usunąć konto (art. 15, 17, 20 RODO).
            </p>
            <p>
              <Link href="/rodo" className="text-accent-700 hover:underline">
                Polityka prywatności
              </Link>
              {" · "}
              <Link href="/regulamin" className="text-accent-700 hover:underline">
                Regulamin
              </Link>
              {" · "}
              <Link href="/dpa" className="text-accent-700 hover:underline">
                DPA
              </Link>
            </p>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
