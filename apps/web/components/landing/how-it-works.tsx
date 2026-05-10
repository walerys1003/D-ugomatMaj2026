import { Upload, ScanLine, Sparkles, FileDown } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    icon: Upload,
    title: "Wczytaj dokument",
    desc: "Zrób zdjęcie nakazu, listu komorniczego lub raportu BIK. Plik nigdy nie opuszcza serwera w UE.",
  },
  {
    icon: ScanLine,
    title: "OCR rozpozna treść",
    desc: "Wyciągniemy sygnaturę, kwotę, datę wymagalności i wierzyciela. Sprawdzisz i zatwierdzisz dane w jednym kroku.",
  },
  {
    icon: Sparkles,
    title: "AI zbuduje pismo",
    desc: "Claude Sonnet 4.6 z bazą orzeczeń przygotuje pismo dopasowane do Twoich zarzutów. Walidacja jakości w tle.",
  },
  {
    icon: FileDown,
    title: "Pobierz PDF i wyślij",
    desc: "Gotowe pismo procesowe w formacie sądowym. Z miejscem na podpis i pełną listą załączników.",
  },
] as const;

export function HowItWorks() {
  return (
    <section
      aria-labelledby="how-it-works-title"
      className="container py-20 sm:py-24"
    >
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-fluid-sm font-semibold uppercase tracking-wider text-dlugomat-600">
          Jak to działa
        </p>
        <h2
          id="how-it-works-title"
          className="mt-2 text-balance text-fluid-4xl font-bold tracking-tight text-dlugomat-900 dark:text-white"
        >
          Cztery kroki — bez prawnika, bez stresu, bez kosztów.
        </h2>
        <p className="mt-3 text-fluid-base text-iron-600 dark:text-iron-300">
          Średni czas pełnej obsługi sprawy: <strong>12 minut</strong>. 70% naszych
          użytkowników kończy proces na telefonie.
        </p>
      </div>

      <ol className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((step, i) => {
          const Icon = step.icon;
          return (
            <li
              key={step.title}
              className={cn(
                "relative rounded-xl border border-iron-200 bg-card p-6 shadow-card",
                "dark:border-dlugomat-800 dark:bg-dlugomat-900",
                "transition-shadow duration-base hover:shadow-pop"
              )}
            >
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-lg bg-dlugomat-100 text-dlugomat-700 dark:bg-dlugomat-850 dark:text-dlugomat-300">
                  <Icon className="size-5" aria-hidden />
                </span>
                <span className="font-mono text-fluid-xs font-bold uppercase tracking-wider text-iron-400">
                  Krok {i + 1}
                </span>
              </div>
              <h3 className="mt-4 text-fluid-lg font-semibold text-dlugomat-900 dark:text-iron-50">
                {step.title}
              </h3>
              <p className="mt-2 text-fluid-sm text-iron-600 dark:text-iron-300">
                {step.desc}
              </p>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
