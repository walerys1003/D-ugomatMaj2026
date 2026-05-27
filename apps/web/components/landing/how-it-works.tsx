import { CheckCircle2 } from "lucide-react";

import { Section } from "@/components/ui/section";
import { Surface } from "@/components/ui/surface";
import { Eyebrow, Heading, Text, Mono } from "@/components/ui/typography";

interface Step {
  num: number;
  title: string;
  desc: string;
  detail: string;
  /**
   * Optional list of concrete sub-steps shown under the main detail.
   * Used in step 4 to spell out delivery channels (ePUAP / e-mail / poczta)
   * which was the most common pre-purchase question in user research.
   */
  bullets?: ReadonlyArray<{ label: string; hint: string }>;
}

const STEPS: readonly Step[] = [
  {
    num: 1,
    title: "Wczytaj dokument",
    desc: "Zrób zdjęcie nakazu, listu komorniczego lub raportu BIK.",
    detail: "Plik nie opuszcza serwera w UE. AES-256.",
  },
  {
    num: 2,
    title: "OCR rozpozna treść",
    desc: "Wyciągamy sygnaturę, kwotę, datę wymagalności i wierzyciela.",
    detail: "Sprawdzasz i zatwierdzasz dane w jednym kroku.",
  },
  {
    num: 3,
    title: "AI zbuduje pismo",
    desc: "Claude Sonnet 4.6 z bazą orzeczeń pisze procesowe zarzuty.",
    detail: "Walidacja jakości w tle przez Haiku 4.5.",
  },
  {
    num: 4,
    title: "Pobierz PDF i wyślij",
    desc: "Gotowe pismo procesowe w formacie sądowym, z listą załączników.",
    detail:
      "Trzy sposoby wysyłki — wybierasz najwygodniejszy. SMS + e-mail przypomnienie o terminie.",
    bullets: [
      {
        label: "ePUAP",
        hint: "najszybsze — pismo w 24h trafia do akt sądowych",
      },
      {
        label: "E-mail do sądu",
        hint: "z podpisem kwalifikowanym lub profilem zaufanym",
      },
      {
        label: "List polecony",
        hint: "z potwierdzeniem nadania jako dowód zachowania terminu",
      },
    ],
  },
];

/**
 * HowItWorks v3 — Tarcza Stoic.
 *
 * Vs v2:
 *  - Section primitive (compact density 48/64/80) zamiast hardcoded py-20.
 *  - Surface elevation=flat + interactive zamiast Card subtle.
 *  - Bez fake-progress bars per step (v2 anti-pattern). Numer kroku w
 *    mocnym square chip (Mono).
 *  - Heading level=2 (page-grade) dla h2 — modular type, nie ad-hoc text-3xl.
 *  - Eyebrow primitive zamiast 4 nieskoordynowanych klasy text-xs uppercase.
 *  - Number chip — square (rounded), font-mono, ink-900 bg (true neutral).
 */
export function HowItWorks() {
  return (
    <Section tone="default" density="compact" aria-labelledby="how-title">
      <header className="mx-auto max-w-2xl text-center">
        <Eyebrow tone="brand">Jak to działa</Eyebrow>
        <Heading level={1} id="how-title" className="mt-3" as="h2">
          Cztery kroki — bez prawnika, bez stresu
        </Heading>
        <Text size="base" tone="muted" className="mt-4">
          Średni czas pełnej obsługi sprawy: <strong className="text-ink-800 dark:text-ink-800 font-semibold">12 minut</strong>.
          70% naszych użytkowników kończy proces na telefonie.
        </Text>
      </header>

      {/* Grid w v5 ma 6 kolumn — kroki 1-3 zajmują po 2, krok 4 zajmuje
          całe 6 kolumn (full-width). To pozwala wyeksponować trzy sposoby
          wysyłki, które są największą ukrytą obiekcją "co potem?". */}
      <ol className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
        {STEPS.map((step) => {
          const isWide = !!step.bullets;
          return (
            <li
              key={step.num}
              className={isWide ? "lg:col-span-6" : "lg:col-span-2"}
            >
              <Surface
                elevation="flat"
                padded="md"
                className="group flex h-full flex-col gap-3"
              >
                <div className="flex items-center justify-between">
                  <span
                    aria-hidden
                    className="inline-flex h-6 w-6 items-center justify-center rounded bg-ink-900 font-mono text-[11px] font-semibold text-white dark:bg-white dark:text-ink-900"
                  >
                    {step.num}
                  </span>
                  <Mono size="xs" tone="muted">
                    {String(step.num).padStart(2, "0")} / 04
                  </Mono>
                </div>
                <Heading level={3} as="h3" className="mt-1">
                  {step.title}
                </Heading>
                <Text size="sm" tone="default">
                  {step.desc}
                </Text>
                <Text size="xs" tone="muted" className="pt-1">
                  {step.detail}
                </Text>

                {/* Bullets — tylko krok 4. Trzy sposoby wysyłki w 3-col grid
                    na lg, stacked na mobile. */}
                {step.bullets ? (
                  <ul className="mt-3 grid gap-3 border-t border-ink-200 pt-4 sm:grid-cols-3">
                    {step.bullets.map((b) => (
                      <li key={b.label} className="flex items-start gap-2.5">
                        <CheckCircle2
                          className="mt-0.5 size-4 shrink-0 text-accent-700"
                          aria-hidden
                        />
                        <div className="min-w-0">
                          <Text
                            size="sm"
                            tone="strong"
                            weight="semibold"
                            as="div"
                          >
                            {b.label}
                          </Text>
                          <Text
                            size="xs"
                            tone="muted"
                            as="div"
                            className="mt-0.5"
                          >
                            {b.hint}
                          </Text>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </Surface>
            </li>
          );
        })}
      </ol>
    </Section>
  );
}
