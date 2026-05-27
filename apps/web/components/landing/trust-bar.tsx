import { ShieldCheck, Lock, FileCheck2, Building2 } from "lucide-react";
import { Section } from "@/components/ui/section";
import { Divider } from "@/components/ui/divider";

/**
 * TrustBar — sekcja zaufania zaraz przed cennikiem.
 *
 * Zastępuje stare SocialProof (które zostawiamy w repo dla kompatybilności,
 * ale wyciągamy z kompozycji landingu). Trzy poziomy zaufania w jednym bloku:
 *
 *  1. Compliance row — RODO, ISO, hosting w UE, kancelaria nadzorująca
 *  2. KPI strip — 4 liczby z kontekstem (5-10x taniej, 94% skuteczność, …)
 *  3. Press row — gdzie nas cytowano (subtelnie, sama typografia)
 *
 * Brand spec §3.5 mandatuje, żeby każdy „social proof" miał kontekst
 * numeryczny — same logo to dla nas anty-wzorzec.
 */

const COMPLIANCE: ReadonlyArray<{ icon: typeof ShieldCheck; label: string; sub: string }> = [
  { icon: ShieldCheck, label: "RODO + ISO 27001", sub: "Audyt zewnętrzny 2026" },
  { icon: Lock, label: "Szyfrowanie end-to-end", sub: "AES-256-GCM · klucze w pgcrypto" },
  { icon: Building2, label: "Hosting w UE", sub: "Supabase EU-West · Frankfurt" },
  { icon: FileCheck2, label: "Nadzór kancelarii", sub: "Templates podpisane przez r. pr." },
];

const STATS: ReadonlyArray<{ value: string; label: string; context: string }> = [
  { value: "12 min", label: "Średni czas pisma", context: "Od skanu do gotowego PDF/DOCX" },
  { value: "94%", label: "Skuteczność walidacji", context: "Pism przyjętych bez braków formalnych" },
  { value: "5–10×", label: "Taniej niż prawnik", context: "Wobec 1 500–3 000 PLN za sprzeciw" },
  { value: "0 PLN", label: "Skaner nakazu", context: "Sprawdzasz sytuację bez konta" },
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
        <p className="text-fluid-xs font-medium uppercase tracking-[0.18em] text-dlugomat-600 dark:text-dlugomat-300">
          Dlaczego można nam zaufać
        </p>
        <h2
          id="trust-title"
          className="mt-3 font-display text-fluid-3xl font-semibold tracking-tight text-iron-900 dark:text-white"
        >
          Bezpieczeństwo prawne i techniczne na poziomie kancelarii enterprise
        </h2>
      </header>

      {/* Compliance row */}
      <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {COMPLIANCE.map((c) => (
          <li
            key={c.label}
            className="flex items-start gap-3 rounded-lg border border-iron-200/80 bg-card p-4 dark:border-iron-800/60"
          >
            <span
              aria-hidden
              className="grid size-9 shrink-0 place-items-center rounded-md bg-dlugomat-100 text-dlugomat-700 dark:bg-dlugomat-850 dark:text-dlugomat-200"
            >
              <c.icon className="size-4" />
            </span>
            <div className="min-w-0">
              <p className="text-fluid-sm font-semibold text-iron-900 dark:text-iron-50">{c.label}</p>
              <p className="text-fluid-xs text-iron-500 dark:text-iron-400">{c.sub}</p>
            </div>
          </li>
        ))}
      </ul>

      {/* KPI strip */}
      <dl className="mt-10 grid divide-iron-200 rounded-lg border border-iron-200/80 bg-card sm:grid-cols-2 sm:divide-x lg:grid-cols-4 dark:divide-iron-800 dark:border-iron-800/60">
        {STATS.map((s) => (
          <div key={s.label} className="p-6">
            <dt className="sr-only">{s.label}</dt>
            <dd>
              <p className="font-display text-fluid-3xl font-semibold text-dlugomat-900 dark:text-white">
                {s.value}
              </p>
              <p className="mt-1.5 text-fluid-sm font-medium text-iron-800 dark:text-iron-100">{s.label}</p>
              <p className="mt-0.5 text-fluid-xs text-iron-500 dark:text-iron-400">{s.context}</p>
            </dd>
          </div>
        ))}
      </dl>

      {/* Press row */}
      <div className="mt-10">
        <Divider label="Cytowani przez" />
        <ul className="mt-5 flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
          {PRESS.map((p) => (
            <li
              key={p}
              className="font-display text-fluid-base font-medium text-iron-500 transition-colors hover:text-iron-700 dark:text-iron-400 dark:hover:text-iron-200"
            >
              {p}
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
