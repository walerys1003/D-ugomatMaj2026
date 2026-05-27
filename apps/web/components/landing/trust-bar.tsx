import { ShieldCheck, Lock, FileCheck2, Building2 } from "lucide-react";

import { Section } from "@/components/ui/section";
import { Eyebrow, Heading, Text } from "@/components/ui/typography";

/**
 * TrustBar v4 — Tarcza Stoic / first-section under hero.
 *
 * Zmiany vs v3 (audit V4 §3.1, §5.2 vs Stripe):
 *  - Usunięte KPI staty (4×) — duplikowały hero TrustStat (3×) i mieszały
 *    hierarchię. Tu trust = compliance + media, nie liczby.
 *  - Usunięty Surface elevation=raised wokół KPI — czyste in-flow layout
 *  - Section density=compact zachowane (py-16/20/24 8pt rytm)
 *  - 4 compliance items w grid bez border-card (jak Stripe trust strip)
 *  - Press row z divider — bez animacji (pasek instytucji typografią
 *    a nie raw logo)
 *  - Continuation tła z hero: bg-background (eliminacja "rwanej" hierarchii
 *    bg-iron/ink/white o której pisał audit V4)
 *
 * Cel: pierwsza sekcja pod hero = **lekka, niedużo informacji**, bo użytkownik
 * dopiero "wszedł" i nie chce dostać kolejnego flow. To strefa "ok, można im
 * zaufać" a nie "spójrz na 13 elementów".
 */

const COMPLIANCE: ReadonlyArray<{
  icon: typeof ShieldCheck;
  label: string;
  sub: string;
}> = [
  {
    icon: ShieldCheck,
    label: "RODO + ISO 27001",
    sub: "Audyt zewnętrzny 2026",
  },
  {
    icon: Lock,
    label: "Szyfrowanie at-rest",
    sub: "AES-256-GCM · klucze w pgcrypto",
  },
  {
    icon: Building2,
    label: "Hosting w UE",
    sub: "Supabase EU-West · Frankfurt",
  },
  {
    icon: FileCheck2,
    label: "Nadzór radcy prawnego",
    sub: "Szablony weryfikowane co kwartał",
  },
];

const PRESS: ReadonlyArray<string> = [
  "Rzeczpospolita",
  "Puls Biznesu",
  "Money.pl",
  "Forbes Polska",
  "Gazeta Prawna",
];

export function TrustBar() {
  return (
    <Section
      tone="default"
      density="compact"
      width="lg"
      aria-labelledby="trust-title"
    >
      <header className="mx-auto max-w-2xl text-center">
        <Eyebrow tone="brand">Bezpieczeństwo i nadzór</Eyebrow>
        <Heading level={2} as="h2" id="trust-title" className="mt-3 text-balance">
          Każde pismo trafia przed sąd. Każdy bajt jest zaszyfrowany.
        </Heading>
        <Text size="base" tone="muted" className="mx-auto mt-3 max-w-xl text-balance">
          Długomat operuje pod nadzorem polskiego radcy prawnego.
          Infrastruktura zgodna z&nbsp;RODO, hostowana wyłącznie w&nbsp;Unii Europejskiej.
        </Text>
      </header>

      {/* Compliance grid — flat, no card */}
      <ul className="mt-14 grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
        {COMPLIANCE.map((c) => (
          <li key={c.label} className="flex items-start gap-3">
            <span
              aria-hidden
              className="grid size-9 shrink-0 place-items-center rounded-sm border border-ink-200 bg-white text-ink-700"
            >
              <c.icon className="size-4" />
            </span>
            <div className="min-w-0 pt-0.5">
              <Text size="sm" tone="strong" weight="semibold" as="div">
                {c.label}
              </Text>
              <Text size="xs" tone="muted" as="div" className="mt-0.5">
                {c.sub}
              </Text>
            </div>
          </li>
        ))}
      </ul>

      {/* Press row — w stylu Stripe / Linear (typografia bez logo) */}
      <div className="mt-16 border-t border-ink-200 pt-7">
        <p className="text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-500">
          Cytowani przez
        </p>
        <ul className="mt-4 flex flex-wrap items-center justify-center gap-x-10 gap-y-3 lg:gap-x-14">
          {PRESS.map((p) => (
            <li
              key={p}
              className="font-display text-[15px] font-semibold tracking-tight text-ink-500 transition-colors hover:text-ink-800"
            >
              {p}
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
