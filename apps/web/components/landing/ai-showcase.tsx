import { Sparkles, ShieldCheck, FileText, ArrowRight } from "lucide-react";
import { Section } from "@/components/ui/section";
import { Surface } from "@/components/ui/surface";
import { Badge } from "@/components/ui/badge";
import { Kbd } from "@/components/ui/kbd";
import { Divider } from "@/components/ui/divider";

/**
 * AIShowcase — drugi blok landingu, zaraz po hero.
 *
 * Cel: w 7 sekund pokazać KONKRETNIE jak AI Długomata pracuje na dokumencie,
 * zanim użytkownik dojdzie do "How it works" (które tłumaczy proces ogólnie).
 * To jest punkt różnicujący SaaS legal-tech — bez tego landing jest jak
 * setki innych „upload pdf, get magic".
 *
 * Konstrukcja: trójkolumnowy „dokument → analiza → pismo" z fake-mockiem
 * Skanera Nakazu (D1) — bo D1 jest darmowy i to ścieżka onboardingu.
 *
 * Brand spec §3.5 — pokazujemy ARTEFAKT (cytat z nakazu, znalezione ryzyka,
 * fragment generowanego pisma), nie ogólniki typu „AI Powered".
 *
 * Wszystko statyczne — żadnego JS. Wizualizacja, nie demo. Demo jest w D1.
 */

const FINDINGS: ReadonlyArray<{
  label: string;
  tone: "danger" | "warning" | "success" | "info";
  detail: string;
}> = [
  {
    label: "Przedawnienie roszczenia",
    tone: "danger",
    detail: "Termin upłynął 14.03.2024 — 408 dni temu",
  },
  {
    label: "Brak doręczenia osobistego",
    tone: "warning",
    detail: "Doręczenie zastępcze na adres zameldowania",
  },
  {
    label: "Termin sprzeciwu",
    tone: "info",
    detail: "Pozostało 12 dni (do 09.06.2026)",
  },
  {
    label: "Sygnatura sprawdzona w EPU",
    tone: "success",
    detail: "Nc-e 4118723/24 · Sąd Rejonowy Lublin-Zachód",
  },
];

export function AIShowcase() {
  return (
    <Section tone="muted" density="regular" surface aria-labelledby="ai-showcase-title">
      <header className="mx-auto max-w-2xl text-center">
        <Badge tone="info" withDot className="mx-auto">
          AI w pracy
        </Badge>
        <h2
          id="ai-showcase-title"
          className="mt-4 font-display text-fluid-4xl font-semibold tracking-tight text-iron-900 dark:text-white"
        >
          Od skanu nakazu do gotowego sprzeciwu — w jednym oknie
        </h2>
        <p className="mt-4 text-fluid-base text-iron-600 dark:text-iron-300">
          AI Długomata nie pisze ogólników. Czyta każdy paragraf, sprawdza terminy w kalendarzu sądowym,
          wykrywa przedawnienie i komponuje pismo procesowe na podstawie 14 sprawdzonych szablonów.
        </p>
      </header>

      <div className="mt-14 grid gap-6 lg:grid-cols-[1.05fr_1fr_1.05fr] lg:items-stretch">
        {/* Kolumna 1 — DOKUMENT WEJŚCIOWY */}
        <Surface elevation="raised" padded="md" className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-fluid-xs font-medium uppercase tracking-wider text-iron-500">
              <FileText className="size-3.5" aria-hidden />
              Nakaz zapłaty (EPU)
            </div>
            <Badge tone="neutral">PDF · 2 str.</Badge>
          </div>
          <Divider />
          <div className="space-y-3 font-mono text-[0.78rem] leading-relaxed text-iron-700 dark:text-iron-200">
            <p className="text-iron-500">Sygn. akt: <span className="text-iron-700 dark:text-iron-100">Nc-e 4118723/24</span></p>
            <p className="rounded-md bg-danger-50 px-2 py-1.5 text-iron-700 dark:bg-danger-500/10 dark:text-iron-100">
              „Nakazuje pozwanemu zapłatę kwoty <mark className="bg-warn-100 px-1 dark:bg-warn-500/20">3 247,18 PLN</mark>{" "}
              wraz z odsetkami od dnia <mark className="bg-warn-100 px-1 dark:bg-warn-500/20">12.08.2018</mark>…"
            </p>
            <p className="text-iron-500">Powód: <span className="text-iron-700 dark:text-iron-100">Ultimo Portfolio S.A.</span></p>
            <p className="text-iron-500">Wierzytelność pierwotna: <span className="text-iron-700 dark:text-iron-100">Plus GSM (T-Mobile)</span></p>
          </div>
          <div className="mt-auto flex items-center gap-1.5 text-fluid-xs text-iron-500">
            <Kbd>⌘</Kbd>
            <Kbd>O</Kbd>
            <span>aby otworzyć inny dokument</span>
          </div>
        </Surface>

        {/* Strzałka łącząca */}
        <Surface elevation="flat" padded="md" className="relative flex flex-col gap-3 bg-background/60 dark:bg-iron-950/60">
          <div className="flex items-center gap-2 text-fluid-xs font-medium uppercase tracking-wider text-dlugomat-700 dark:text-dlugomat-300">
            <Sparkles className="size-3.5" aria-hidden />
            Analiza AI · 4,2 s
          </div>
          <Divider />
          <ul className="space-y-2.5">
            {FINDINGS.map((f) => (
              <li key={f.label} className="flex items-start gap-2.5">
                <Badge tone={f.tone} withDot className="mt-0.5 shrink-0">
                  {f.tone === "danger" ? "krytyczne" : f.tone === "warning" ? "uwaga" : f.tone === "success" ? "ok" : "info"}
                </Badge>
                <div className="min-w-0">
                  <p className="text-fluid-sm font-medium text-iron-900 dark:text-iron-50">{f.label}</p>
                  <p className="text-fluid-xs text-iron-500 dark:text-iron-400">{f.detail}</p>
                </div>
              </li>
            ))}
          </ul>
        </Surface>

        {/* Kolumna 3 — PISMO WYJŚCIOWE */}
        <Surface elevation="raised" padded="md" className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-fluid-xs font-medium uppercase tracking-wider text-accent-700 dark:text-accent-300">
              <ShieldCheck className="size-3.5" aria-hidden />
              Sprzeciw od nakazu
            </div>
            <Badge tone="success">DOCX · gotowe</Badge>
          </div>
          <Divider />
          <div className="space-y-2.5 font-serif text-[0.82rem] leading-relaxed text-iron-800 dark:text-iron-100">
            <p className="text-center font-semibold uppercase tracking-wide text-iron-700 dark:text-iron-200">Sprzeciw</p>
            <p className="text-center text-iron-500">od nakazu zapłaty w EPU</p>
            <p className="text-iron-500">Sygn. akt: Nc-e 4118723/24</p>
            <p className="mt-3">
              Niniejszym, działając w imieniu własnym, wnoszę sprzeciw od nakazu zapłaty
              wydanego dnia 02.05.2026 r., zaskarżając go w całości.
            </p>
            <p>
              <span className="font-semibold">Zarzuty:</span> przedawnienie roszczenia (art. 118
              k.c. — termin 3-letni dla świadczeń okresowych)…
            </p>
          </div>
          <div className="mt-auto flex items-center justify-between gap-2 text-fluid-xs">
            <span className="text-iron-500">Strona 1 z 4 · 14 cytatów źródłowych</span>
            <span className="inline-flex items-center gap-1 font-medium text-dlugomat-700 dark:text-dlugomat-300">
              Wyślij <ArrowRight className="size-3.5" aria-hidden />
            </span>
          </div>
        </Surface>
      </div>

      <p className="mx-auto mt-10 max-w-2xl text-center text-fluid-xs text-iron-500">
        Każde pismo przechodzi walidację drugim modelem (Claude Haiku 4.5) i kontrolę zgodności z KPC
        przed pokazaniem użytkownikowi. Nigdy nie pokazujemy „surowego" outputu.
      </p>
    </Section>
  );
}
