import { ShieldCheck, Lock, FileCheck2, Building2 } from "lucide-react";
import { Section } from "@/components/ui/section";
import { Surface } from "@/components/ui/surface";
import { Divider } from "@/components/ui/divider";
import { Eyebrow, Heading, Text, Stat } from "@/components/ui/typography";

/**
 * TrustBar v3 — Tarcza Stoic.
 *
 * Vs v2:
 *  - Surface primitive zamiast raw <li className="rounded-lg border…">.
 *  - Stat primitive dla KPI strip — eliminuje duplikację z Hero/Panel
 *    dashboard, jeden styl liczb w produkcie.
 *  - Eyebrow primitive zamiast 8 wariantów uppercase tracking.
 *  - Compliance row: ikony w mocnym ink-900 chip (squared), nie pill.
 *  - Section default tone (białe) zamiast specjalnego — KPI strip jest
 *    samonośny wizualnie przez border + tinted shadow.
 */

const COMPLIANCE: ReadonlyArray<{ icon: typeof ShieldCheck; label: string; sub: string }> = [
  { icon: ShieldCheck, label: "RODO + ISO 27001", sub: "Audyt zewnętrzny 2026" },
  { icon: Lock, label: "Szyfrowanie end-to-end", sub: "AES-256-GCM · klucze w pgcrypto" },
  { icon: Building2, label: "Hosting w UE", sub: "Supabase EU-West · Frankfurt" },
  { icon: FileCheck2, label: "Nadzór kancelarii", sub: "Templates podpisane przez r. pr." },
];

const STATS: ReadonlyArray<{ value: string; label: string; context: string; tone: "default" | "brand" | "success" }> = [
  { value: "12 min", label: "średni czas pisma", context: "Od skanu do gotowego PDF/DOCX", tone: "default" },
  { value: "94%", label: "skuteczność walidacji", context: "Pism przyjętych bez braków formalnych", tone: "success" },
  { value: "5–10×", label: "taniej niż prawnik", context: "Wobec 1 500–3 000 PLN za sprzeciw", tone: "brand" },
  { value: "0 PLN", label: "skaner nakazu", context: "Sprawdzasz sytuację bez konta", tone: "default" },
];

const PRESS: ReadonlyArray<string> = [
  "Gazeta Prawna",
  "Rzeczpospolita",
  "Puls Biznesu",
  "Money.pl",
  "Forbes Polska",
];

export function TrustBar() {
  return (
    <Section tone="default" density="compact" aria-labelledby="trust-title">
      <header className="mx-auto max-w-2xl text-center">
        <Eyebrow tone="brand">Dlaczego można nam zaufać</Eyebrow>
        <Heading level={1} id="trust-title" as="h2" className="mt-3">
          Bezpieczeństwo prawne i&nbsp;techniczne na&nbsp;poziomie kancelarii enterprise
        </Heading>
      </header>

      {/* Compliance row */}
      <ul className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {COMPLIANCE.map((c) => (
          <li key={c.label}>
            <Surface elevation="flat" padded="sm" className="flex items-start gap-3">
              <span
                aria-hidden
                className="grid size-9 shrink-0 place-items-center rounded bg-ink-900 text-white dark:bg-white dark:text-ink-900"
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
            </Surface>
          </li>
        ))}
      </ul>

      {/* KPI strip — Stat primitives */}
      <Surface
        elevation="raised"
        padded="none"
        className="mt-8 grid divide-ink-200 sm:grid-cols-2 sm:divide-x lg:grid-cols-4 dark:divide-ink-200"
      >
        {STATS.map((s) => (
          <div key={s.label} className="p-6">
            <Stat
              value={s.value}
              label={s.label}
              hint={s.context}
              tone={s.tone}
              size="md"
            />
          </div>
        ))}
      </Surface>

      {/* Press row */}
      <div className="mt-10">
        <Divider label="Cytowani przez" />
        <ul className="mt-5 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          {PRESS.map((p) => (
            <li
              key={p}
              className="font-display text-base font-medium text-ink-500 transition-colors hover:text-ink-800 dark:text-ink-500 dark:hover:text-ink-800"
            >
              {p}
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
