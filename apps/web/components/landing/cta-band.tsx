import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";

import { Section } from "@/components/ui/section";
import { Surface } from "@/components/ui/surface";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eyebrow, Heading, Text, Mono } from "@/components/ui/typography";
import { getRadcaInfo } from "@/lib/features/radca-flag";

/**
 * CtaBand v3 — Tarcza Stoic.
 *
 * Vs v2:
 *  - Surface elevation=raised na Section default zamiast Card pop +
 *    urgency strip warning (which was decorative anti-pattern).
 *  - Heading level=1 + Display feel via large size 4xl/5xl.
 *  - Reasons list używa Check ikon + Text primitive (zamiast custom dots).
 *  - Mono dla disclaimer fine-print (sygnał "fine print" wizualnie).
 *  - Padding adjusted to 8pt grid.
 */

const REASONS = [
  "Skaner OCR analizuje nakaz w 90 sekund",
  "Ocena przedawnienia z odwołaniem do KC i orzecznictwa SN",
  "Sugestia kolejnego kroku — bez konta i bez karty",
  "Dane szyfrowane AES-256, przechowywane w UE",
];

export function CtaBand() {
  // Feature flag — disclaimer dynamiczny zależnie od dostępności danych radcy.
  // Patrz: lib/features/radca-flag.ts oraz docs/RADCA_CONSENT_CHECKLIST.md.
  const radca = getRadcaInfo();

  return (
    <Section tone="default" density="compact" aria-labelledby="cta-band-title">
      <Surface
        elevation="raised"
        padded="none"
        className="overflow-hidden"
      >
        <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.4fr_1fr] lg:items-center lg:gap-12 lg:p-12">
          {/* LEFT — CTA copy */}
          <div className="flex flex-col gap-5">
            <Badge tone="warning">
              <span aria-hidden className="size-1.5 rounded-full bg-warn-500" />
              14 dni na sprzeciw
            </Badge>

            <Heading level={1} id="cta-band-title" as="h2" className="max-w-[18ch]">
              Masz 14 dni? My potrzebujemy <span className="text-dlugomat-700 dark:text-dlugomat-300">12 minut</span>.
            </Heading>

            <Text size="base" tone="default" className="max-w-[42ch]">
              Zacznij od&nbsp;darmowego skanera. Bez zakładania konta. Bez podawania karty.
              Sprawdzimy Twoją sytuację i&nbsp;powiemy co masz zrobić jako pierwsze.
            </Text>

            <div className="mt-2 flex flex-wrap items-center gap-3">
              <Button asChild size="lg">
                <Link href="/skaner-nakazu">Zeskanuj nakaz</Link>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <Link href="/jak-to-dziala" className="gap-2">
                  Zobacz demo
                  <ArrowRight className="size-3.5" aria-hidden />
                </Link>
              </Button>
            </div>

            {/*
              V5 disclaimer — gated feature flag.
              - radca === null  → wariant defensywny (zgodny z ustawą o radcach
                                  prawnych — Długomat to fintech-narzędzie,
                                  nie świadczy pomocy prawnej).
              - radca !== null  → wariant ofensywny (audit §3.10): "mamy radcę,
                                  który osobiście sprawdza szablony".
              W obu wariantach ten sam Mono component i ten sam max-width,
              żeby layout cta-band był identyczny niezależnie od stanu flagi.
            */}
            {radca ? (
              <Mono size="xs" tone="muted" className="block max-w-[42ch]">
                Długomat nie jest kancelarią prawną — pisma weryfikujesz przed
                wysyłką. Ale nad każdym szablonem czuwa radca prawny&nbsp;
                <span className="text-ink-700">
                  {radca.name}, KIRP nr&nbsp;{radca.kirp}
                </span>
                , który osobiście sprawdza je co&nbsp;kwartał pod kątem
                zgodności z&nbsp;KPC.
              </Mono>
            ) : (
              <Mono size="xs" tone="muted" className="block max-w-[42ch]">
                Długomat to fintech-narzędzie do generowania pism procesowych.
                Nie świadczy pomocy prawnej w&nbsp;rozumieniu ustawy
                o&nbsp;radcach prawnych. Każde pismo weryfikujesz przed
                wysyłką do&nbsp;sądu.
              </Mono>
            )}
          </div>

          {/* RIGHT — Reasons list */}
          <div className="flex flex-col gap-2">
            <Eyebrow tone="brand">Co dostajesz w 90 sekund</Eyebrow>
            <ul className="mt-2 flex flex-col gap-2.5">
              {REASONS.map((r) => (
                <li key={r} className="flex items-start gap-2.5">
                  <span
                    aria-hidden
                    className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-sm bg-accent-100 text-accent-700 dark:bg-accent-700/20 dark:text-accent-300"
                  >
                    <Check className="size-3" strokeWidth={3} />
                  </span>
                  <Text size="sm" tone="default">{r}</Text>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Surface>
    </Section>
  );
}
