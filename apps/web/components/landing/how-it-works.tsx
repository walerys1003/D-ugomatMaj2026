import { CheckCircle2, Upload, ScanText, Sparkles, Send } from "lucide-react";

import { Section } from "@/components/ui/section";
import { Eyebrow, Heading, Text } from "@/components/ui/typography";

interface Step {
  num: number;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
  detail: string;
  time: string;
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
    icon: Upload,
    title: "Wczytaj dokument",
    desc: "Zrób zdjęcie nakazu, listu komorniczego lub raportu BIK.",
    detail: "Plik nie opuszcza serwera w UE. AES-256.",
    time: "~5 s",
  },
  {
    num: 2,
    icon: ScanText,
    title: "OCR rozpozna treść",
    desc: "Wyciągamy sygnaturę, kwotę, datę wymagalności i wierzyciela.",
    detail: "Sprawdzasz i zatwierdzasz dane w jednym kroku.",
    time: "~20 s",
  },
  {
    num: 3,
    icon: Sparkles,
    title: "AI zbuduje pismo",
    desc: "Claude Sonnet 4.6 z bazą orzeczeń pisze procesowe zarzuty.",
    detail: "Walidacja jakości w tle przez Haiku 4.5.",
    time: "~90 s",
  },
  {
    num: 4,
    icon: Send,
    title: "Pobierz PDF i wyślij",
    desc: "Gotowe pismo procesowe w formacie sądowym, z listą załączników.",
    detail:
      "Trzy sposoby wysyłki — wybierasz najwygodniejszy. SMS + e-mail przypomnienie o terminie.",
    time: "od razu",
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
 * HowItWorks v4 — Corporate Blue Light (01-DLUGOMAT-corporate-blue §6).
 *
 * Vs v3:
 *  - Dekoracyjny, masywny numer kroku (Inter 900/80px, blue-tint) w rogu
 *    karty (.dlu-step-num).
 *  - Gradientowy icon-square (#2E5BFF → #1E40AF, blue-glow) zamiast mono-chip
 *    (.dlu-icon-grad).
 *  - Time-pill (JetBrains Mono, blue-tint) per krok (.dlu-time-pill).
 *  - Karta .dlu-card + hover, tokeny --dlugomat-* / --ink-* → dark-mode out of box.
 *  - Krok 4 (full-width) zachowuje 3 kanały wysyłki — największa ukryta obiekcja.
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
          Średni czas pełnej obsługi sprawy:{" "}
          <strong className="font-semibold text-ink-800 dark:text-ink-800">12 minut</strong>.
          70% naszych użytkowników kończy proces na telefonie.
        </Text>
      </header>

      {/* Kroki 1-3 zajmują po 2 kolumny, krok 4 całe 6 (full-width) — by
          wyeksponować trzy sposoby wysyłki ("co potem?"). */}
      <ol className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-6">
        {STEPS.map((step) => {
          const isWide = !!step.bullets;
          const Icon = step.icon;
          return (
            <li
              key={step.num}
              className={isWide ? "lg:col-span-6" : "lg:col-span-2"}
            >
              <div className="dlu-card dlu-card-hover relative h-full overflow-hidden p-7">
                <span aria-hidden className="dlu-step-num absolute -top-2 right-5 select-none">
                  {step.num}
                </span>
                <div className="relative flex h-full flex-col">
                  <span className="dlu-icon-grad mb-5">
                    <Icon className="size-6" aria-hidden />
                  </span>
                  <Heading level={3} as="h3">
                    {step.title}
                  </Heading>
                  <Text size="sm" tone="default" className="mt-2.5">
                    {step.desc}
                  </Text>
                  <Text size="xs" tone="muted" className="mt-1.5">
                    {step.detail}
                  </Text>
                  <span className="dlu-time-pill mt-4 w-fit">{step.time}</span>

                  {/* Bullets — tylko krok 4. Trzy kanały wysyłki w 3-col grid. */}
                  {step.bullets ? (
                    <ul className="mt-6 grid gap-3 border-t border-ink-200 pt-5 sm:grid-cols-3">
                      {step.bullets.map((b) => (
                        <li key={b.label} className="flex items-start gap-2.5">
                          <CheckCircle2
                            className="mt-0.5 size-4 shrink-0 text-accent-700"
                            aria-hidden
                          />
                          <div className="min-w-0">
                            <Text size="sm" tone="strong" weight="semibold" as="div">
                              {b.label}
                            </Text>
                            <Text size="xs" tone="muted" as="div" className="mt-0.5">
                              {b.hint}
                            </Text>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </Section>
  );
}
