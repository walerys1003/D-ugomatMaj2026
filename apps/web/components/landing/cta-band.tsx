import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";

import { Section } from "@/components/ui/section";
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
      <div className="dlu-cta-dark overflow-hidden">
        <div className="relative grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.4fr_1fr] lg:items-center lg:gap-12 lg:p-12">
          {/* LEFT — CTA copy */}
          <div className="flex flex-col gap-5">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-warn-500/30 bg-warn-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-warn-300">
              <span aria-hidden className="size-1.5 rounded-full bg-warn-500" />
              14 dni na sprzeciw
            </span>

            <h2
              id="cta-band-title"
              className="max-w-[18ch] text-balance text-3xl font-extrabold leading-[1.05] tracking-[-0.03em] text-white sm:text-4xl lg:text-5xl"
            >
              Masz 14 dni? My potrzebujemy{" "}
              <span className="text-dlugomat-300">12 minut</span>.
            </h2>

            <p className="max-w-[42ch] text-[17px] leading-relaxed text-ink-300">
              Zacznij od&nbsp;darmowego skanera. Bez zakładania konta. Bez podawania karty.
              Sprawdzimy Twoją sytuację i&nbsp;powiemy co masz zrobić jako pierwsze.
            </p>

            <div className="mt-2 flex flex-wrap items-center gap-3">
              <Link
                href="/skaner-nakazu"
                className="dlu-btn dlu-btn-lg group bg-white text-ink-900 hover:-translate-y-px hover:bg-dlugomat-50"
              >
                Zeskanuj nakaz
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
              </Link>
              <Link
                href="/jak-to-dziala"
                className="dlu-btn dlu-btn-lg border border-white/20 bg-transparent text-white hover:border-white/40 hover:bg-white/5"
              >
                Zobacz demo
              </Link>
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
              <p className="block max-w-[42ch] font-mono text-[12px] leading-relaxed text-ink-400">
                Długomat nie jest kancelarią prawną — pisma weryfikujesz przed
                wysyłką. Ale nad każdym szablonem czuwa radca prawny&nbsp;
                <span className="text-ink-200">
                  {radca.name}, KIRP nr&nbsp;{radca.kirp}
                </span>
                , który osobiście sprawdza je co&nbsp;kwartał pod kątem
                zgodności z&nbsp;KPC.
              </p>
            ) : (
              <p className="block max-w-[42ch] font-mono text-[12px] leading-relaxed text-ink-400">
                Długomat to fintech-narzędzie do generowania pism procesowych.
                Nie świadczy pomocy prawnej w&nbsp;rozumieniu ustawy
                o&nbsp;radcach prawnych. Każde pismo weryfikujesz przed
                wysyłką do&nbsp;sądu.
              </p>
            )}
          </div>

          {/* RIGHT — Reasons list */}
          <div className="flex flex-col gap-2">
            <span className="inline-flex w-fit items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-dlugomat-300">
              Co dostajesz w 90 sekund
            </span>
            <ul className="mt-2 flex flex-col gap-2.5">
              {REASONS.map((r) => (
                <li key={r} className="flex items-start gap-2.5">
                  <span
                    aria-hidden
                    className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-sm bg-accent-500/20 text-accent-300"
                  >
                    <Check className="size-3" strokeWidth={3} />
                  </span>
                  <span className="text-sm leading-relaxed text-ink-200">{r}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </Section>
  );
}
