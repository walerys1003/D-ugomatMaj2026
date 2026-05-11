import { Card } from "@/components/ui/card";

interface Step {
  num: number;
  title: string;
  desc: string;
  detail: string;
}

const STEPS: readonly Step[] = [
  {
    num: 1,
    title: "Wczytaj dokument",
    desc: "Zrob zdjecie nakazu, listu komorniczego lub raportu BIK.",
    detail: "Plik nie opuszcza serwera w UE. Szyfrowanie AES-256.",
  },
  {
    num: 2,
    title: "OCR rozpozna tresc",
    desc: "Wyciagamy sygnature, kwote, date wymagalnosci i wierzyciela.",
    detail: "Sprawdzasz i zatwierdzasz dane w jednym kroku.",
  },
  {
    num: 3,
    title: "AI zbuduje pismo",
    desc: "Claude Sonnet 4.6 z baza orzeczen przygotuje pismo dopasowane do Twoich zarzutow.",
    detail: "Walidacja jakosci w tle przez Haiku 4.5.",
  },
  {
    num: 4,
    title: "Pobierz PDF i wyslij",
    desc: "Gotowe pismo procesowe w formacie sadowym - z miejscem na podpis i pelna lista zalacznikow.",
    detail: "E-mail i SMS przypomnienie o terminie.",
  },
];

/**
 * HowItWorks v2 - premium minimalist 4-step timeline (Design System Tarcza)
 * Z aria-progressbar, bez bouncy ikon, neutralna paleta.
 */
export function HowItWorks() {
  return (
    <section aria-labelledby="how-title" className="bg-white py-20">
      <div className="container px-6">
        <header className="mx-auto max-w-2xl text-center">
          <p className="text-xs uppercase tracking-wide text-dlugomat-500">Jak to dziala</p>
          <h2 id="how-title" className="mt-2 font-display text-3xl text-dlugomat-900 sm:text-4xl">
            Cztery kroki - bez prawnika, bez stresu
          </h2>
          <p className="mt-3 text-sm text-dlugomat-600">
            Sredni czas pelnej obslugi sprawy: 12 minut. 70% naszych uzytkownikow konczy proces na telefonie.
          </p>
        </header>

        <ol className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <li key={step.num}>
              <Card elevation="subtle" className="flex h-full flex-col p-6">
                <header className="flex items-center gap-3">
                  <span
                    aria-hidden
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-dlugomat-900 font-display text-base text-white"
                  >
                    {step.num}
                  </span>
                  <span className="text-xs uppercase tracking-wide text-dlugomat-500">
                    Krok {step.num} z {STEPS.length}
                  </span>
                </header>
                <h3 className="mt-4 font-display text-lg text-dlugomat-900">{step.title}</h3>
                <p className="mt-2 text-sm text-dlugomat-600">{step.desc}</p>
                <p className="mt-auto pt-4 font-mono text-xs text-dlugomat-500">{step.detail}</p>
                <div
                  role="progressbar"
                  aria-valuenow={(i + 1) * 25}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`Postep krokow: ${i + 1} z ${STEPS.length}`}
                  className="mt-4 h-1 w-full overflow-hidden rounded-full bg-dlugomat-100"
                >
                  <div
                    className="h-full rounded-full bg-accent-500"
                    style={{ width: `${(i + 1) * 25}%` }}
                  />
                </div>
              </Card>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
