import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Hero v2 — premium minimalist, bez ozdobników, z konkretną ofertą.
 *
 * Zasady:
 *  - Headline max 8 słów, mówiący co i dla kogo
 *  - Subhead z konkretnym dowodem (czas, liczby)
 *  - Jeden CTA główny, jeden zapasowy (link, nie przycisk)
 *  - Pasek dowodu społecznego pod CTA, bez gwiazdek i bez NPS
 */
export function HeroV2() {
  return (
    <section
      aria-labelledby="hero-v2-headline"
      className="relative overflow-hidden bg-white dark:bg-iron-950"
    >
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,theme(colors.dlugomat.50)_0%,transparent_70%)] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,theme(colors.dlugomat.700)/15_0%,transparent_70%)]"
      />

      <div className="container relative mx-auto px-4 py-20 md:py-28 max-w-5xl">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-iron-200 dark:border-iron-800 bg-white dark:bg-iron-900 px-3 py-1 text-xs text-iron-600 dark:text-iron-400 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-500" />
            Platforma legaltech nr 1 w Polsce
          </div>

          <h1
            id="hero-v2-headline"
            className="font-display text-4xl md:text-6xl font-semibold leading-[1.05] tracking-tight text-iron-900 dark:text-iron-50"
          >
            Pisma procesowe gotowe
            <br />
            <span className="text-accent-700">w 12 minut.</span>
          </h1>

          <p className="mt-6 text-lg md:text-xl text-iron-600 dark:text-iron-300 max-w-2xl mx-auto leading-relaxed">
            Sprzeciw od nakazu, skarga komornicza, korekta BIK, propozycja ugody.
            Każde pismo z cytowaniem KC/KPC i zgodne z aktualnym orzecznictwem.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Link href="/rejestracja">
              <Button variant="primary" className="min-w-[200px]">
                Sprawdź swoją sprawę
                <ArrowRight className="w-4 h-4 ml-1" aria-hidden />
              </Button>
            </Link>
            <Link
              href="/jak-to-dziala"
              className="text-sm text-iron-700 dark:text-iron-300 hover:text-accent-700 transition focus:outline-none focus-visible:shadow-shield-focus rounded px-2 py-1"
            >
              Zobacz, jak to działa →
            </Link>
          </div>

          <p className="mt-6 text-xs text-iron-500">
            14 dni za darmo · bez karty · pierwsza wiadomość prawnika w 2h
          </p>
        </div>
      </div>
    </section>
  );
}
