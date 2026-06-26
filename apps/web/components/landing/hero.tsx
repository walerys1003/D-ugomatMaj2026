import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  FileText,
  Scan,
  Check,
  Sparkles,
} from "lucide-react";

/**
 * Press logos shown directly under the hero CTAs.
 */
const PRESS_HERO: readonly string[] = [
  "Rzeczpospolita",
  "Puls Biznesu",
  "Money.pl",
  "Forbes Polska",
];

/**
 * Hero v5 "Apex" — premium dark-mode breakthrough.
 *
 * Zmiany vs v4 (redesign 2026-06):
 *  - Pełny dark-mode (deep navy mesh) zamiast split jasny/granat — koniec
 *    z estetyką "SaaS 2018". Jednolite, kinowe tło.
 *  - Centralny wizual: emocjonalne zdjęcie przerażonej osoby trzymającej
 *    nakaz zapłaty i pisma windykacyjne — natychmiastowa identyfikacja
 *    („to o mnie") zamiast abstrakcji. Plik: /public/hero/hero-fear-v2.webp
 *  - Floating glass-chipy (Analiza AI / Generowanie pism / Terminy / Ochrona)
 *    jako cienkie, świetliste sygnały zamiast labeli na liniach.
 *  - Realny produktowy mini-panel (Skaner) jako glassmorphic overlay — dowód,
 *    że to działający produkt, nie ilustracja.
 *  - Typografia mocniejsza, większy oddech, świetlisty akcent na słowie kluczu.
 *
 * Layout: 2 kolumny na lg+ (copy lewo / wizual prawo), single-column mobile.
 */
export function Hero() {
  return (
    <section
      aria-labelledby="hero-headline"
      className="relative isolate overflow-hidden bg-dlugomat-950 text-white"
    >
      {/* ── Tło: mesh gradient + aurora glow + siatka "shield grid" ───────── */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-20">
        {/* baza: głęboki granat → prawie czerń */}
        <div className="absolute inset-0 bg-[radial-gradient(125%_125%_at_75%_10%,hsl(222_70%_18%)_0%,hsl(224_72%_9%)_42%,hsl(226_76%_5%)_100%)]" />
        {/* aurora — błękitna poświata z prawej, w stronę tarczy */}
        <div className="absolute -right-1/4 top-[-20%] h-[80%] w-[70%] rounded-full bg-[radial-gradient(closest-side,hsl(212_100%_55%/0.28),transparent)] blur-3xl" />
        {/* druga, chłodniejsza poświata przy dole-lewo dla balansu */}
        <div className="absolute -left-[10%] bottom-[-25%] h-[60%] w-[55%] rounded-full bg-[radial-gradient(closest-side,hsl(199_95%_55%/0.16),transparent)] blur-3xl" />
      </div>
      {/* siatka shield grid (subtelna) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.5] [background-image:linear-gradient(to_right,hsl(212_100%_70%/0.05)_1px,transparent_1px),linear-gradient(to_bottom,hsl(212_100%_70%/0.05)_1px,transparent_1px)] [background-size:54px_54px] [mask-image:radial-gradient(ellipse_at_top_right,black_30%,transparent_75%)]"
      />
      {/* hairline na górze dla "edge premium" */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent"
      />

      <div className="mx-auto w-full max-w-[1200px] px-5 py-24 sm:px-8 md:py-28 lg:py-32">
        <div className="grid items-center gap-14 lg:grid-cols-[1.02fr_0.98fr] lg:gap-12 xl:gap-16">
          {/* ── LEFT — editorial copy ─────────────────────────────────────── */}
          <div className="flex min-w-0 flex-col gap-7">
            {/* Eyebrow / brand chip */}
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-200/90 backdrop-blur">
              <span aria-hidden className="size-1.5 rounded-full bg-sky-400 shadow-[0_0_8px_2px_hsl(212_100%_60%/0.7)]" />
              AI legal-tech · nadzór radcy · zgodne z&nbsp;KPC
            </span>

            <h1
              id="hero-headline"
              className="font-display text-balance text-[40px] font-bold leading-[1.04] tracking-[-0.02em] text-white sm:text-[52px] lg:text-[58px] xl:text-[64px]"
            >
              <span className="whitespace-nowrap">Twoja tarcza w&nbsp;walce</span>
              <br />
              z&nbsp;
              <span className="relative whitespace-nowrap text-transparent bg-clip-text bg-gradient-to-r from-sky-300 via-sky-400 to-blue-500">
                długami
              </span>
              .
            </h1>

            <p className="max-w-[48ch] text-balance text-[16px] leading-relaxed text-slate-300 sm:text-[17px]">
              Wczytaj nakaz zapłaty, list od&nbsp;komornika lub raport BIK.
              AI&nbsp;Długomata rozpozna dokument, oceni przedawnienie
              i&nbsp;wygeneruje pismo procesowe — w&nbsp;12&nbsp;minut, bez
              prawnika.
            </p>

            <p className="-mt-2 max-w-[48ch] text-[13px] leading-relaxed text-slate-400">
              <span className="inline-flex items-center gap-1.5">
                <FileText className="size-3.5 text-sky-400/80" aria-hidden />
                Gotowe pismo wysyłasz sam (e-mail, ePUAP lub poczta) — pokazujemy
                jak, krok po kroku.
              </span>
            </p>

            {/* CTAs */}
            <div className="mt-1 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/skaner-nakazu"
                className="group inline-flex h-12 items-center justify-center gap-2 rounded-md bg-white px-6 text-[14px] font-semibold text-dlugomat-950 shadow-[0_8px_30px_-8px_hsl(212_100%_60%/0.5)] transition-all duration-150 ease-out hover:bg-sky-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-dlugomat-950"
              >
                <Scan className="size-4" aria-hidden />
                Zeskanuj nakaz — darmowe
                <ArrowRight
                  className="size-3.5 -mr-0.5 transition-transform duration-150 ease-out group-hover:translate-x-0.5"
                  aria-hidden
                />
              </Link>
              <Link
                href="/jak-to-dziala"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-white/15 bg-white/[0.04] px-6 text-[14px] font-semibold text-white backdrop-blur transition-colors duration-150 hover:border-white/30 hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-dlugomat-950"
              >
                Zobacz demo (90&nbsp;sek)
              </Link>
            </div>

            <p className="-mt-1 text-[12px] text-slate-400">
              <span className="inline-flex items-center gap-1.5">
                <Check className="size-3 text-sky-400/80" aria-hidden />
                Skaner i&nbsp;analiza AI — darmowe. Bez karty. Bez subskrypcji.
              </span>
            </p>

            {/* Trust row */}
            <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-white/10 pt-6 lg:grid-cols-4">
              <TrustStat value="12 min" label="średni czas od skanu do pisma" hint="mediana 2 851 spraw" />
              <TrustStat value="14 dni" label="ustawowy termin sprzeciwu EPU" hint="art. 502 §1 KPC" />
              <TrustStat value="70%" label="kończy na telefonie" hint="OCR z aparatu" />
              <TrustStat value="AES-256" label="szyfrowanie at-rest" hint="SOC 2 Type II w toku" />
            </dl>

            {/* Press */}
            <div className="mt-2 flex flex-col gap-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                Pisali o&nbsp;nas
              </p>
              <ul className="flex flex-wrap items-center gap-x-6 gap-y-1.5">
                {PRESS_HERO.map((p) => (
                  <li
                    key={p}
                    className="font-display text-[13px] font-semibold tracking-tight text-slate-400"
                  >
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* ── RIGHT — aegis 3D artwork + glass overlays ─────────────────── */}
          <div className="relative min-w-0">
            <HeroVisual />
          </div>
        </div>
      </div>

      {/* miękkie zejście do następnej sekcji (jasnej) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-background/0"
      />
    </section>
  );
}

/* ─── Right-side visual: generated aegis + floating glass chips ─────────── */

function HeroVisual() {
  return (
    <div className="relative mx-auto aspect-[4/3] w-full max-w-[600px] lg:max-w-[640px]">
      {/* halo za zdjęciem — chłodna poświata podbijająca dramat */}
      <div
        aria-hidden
        className="absolute -inset-4 -z-10 rounded-[28px] bg-[radial-gradient(closest-side,hsl(212_100%_55%/0.28),transparent)] blur-2xl"
      />

      {/* Emocjonalne zdjęcie — kadr w zaokrąglonej karcie z subtelną ramką.
          Postać z przerażeniem trzymająca nakazy/pisma windykacyjne — buduje
          natychmiastową identyfikację („to o mnie") mocniej niż abstrakcja. */}
      <div className="relative h-full w-full overflow-hidden rounded-2xl border border-white/10 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)] ring-1 ring-inset ring-white/[0.06]">
        <Image
          src="/hero/hero-fear-v2.webp"
          alt="Przerażony mężczyzna trzymający nakaz zapłaty i pisma windykacyjne — Długomat pomaga odzyskać kontrolę"
          fill
          priority
          sizes="(min-width: 1024px) 560px, 90vw"
          className="select-none object-cover object-[60%_top]"
        />
        {/* gradient na krawędziach kadru — wtapia zdjęcie w ciemne tło hero
            i poprawia czytelność nachodzących chipów */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,hsl(224_72%_6%/0.85)_0%,transparent_38%),linear-gradient(to_right,hsl(224_72%_6%/0.55)_0%,transparent_30%)]"
        />
        {/* górny vignette dla głębi */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_70%_15%,transparent_45%,hsl(224_72%_5%/0.55)_100%)]"
        />
      </div>

      {/* Glass chip — góra-lewo: Analiza AI */}
      <FloatingChip
        className="left-0 top-[10%] sm:-left-6"
        icon={<Scan className="size-3.5" aria-hidden />}
        title="Analiza AI"
        sub="wykrywa błędy w sprawie"
      />
      {/* Glass chip — góra-prawo: Generowanie pism */}
      <FloatingChip
        className="right-0 -top-3 sm:-right-6"
        icon={<FileText className="size-3.5" aria-hidden />}
        title="Generowanie pism"
        sub="sprzeciw · skarga · ugoda"
      />
      {/* Glass chip — dół-prawo: Twoja ochrona */}
      <FloatingChip
        className="-bottom-3 right-0 sm:-right-6"
        icon={<ShieldCheck className="size-3.5" aria-hidden />}
        title="Twoja ochrona"
        sub="przed windykacją i egzekucją"
      />

      {/* Mini-panel produktowy (dół-lewo) — dowód „to działa" */}
      <div className="absolute bottom-3 left-0 w-[58%] max-w-[250px] sm:-left-6">
        <div className="rounded-lg border border-white/10 bg-white/[0.06] p-3 shadow-[0_16px_40px_-12px_rgba(0,0,0,0.6)] backdrop-blur-xl">
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5">
              <span className="flex size-4 items-center justify-center rounded-sm bg-sky-500/90 text-white">
                <Sparkles className="size-2.5" aria-hidden />
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-300">
                Skaner nakazu
              </span>
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/15 px-1.5 py-0.5">
              <span aria-hidden className="size-1 rounded-full bg-emerald-400" />
              <span className="text-[9px] font-medium text-emerald-300">live</span>
            </span>
          </div>
          <div className="mt-2.5 flex flex-col gap-1.5">
            <PanelRow label="Kwota" value="3 247,18 zł" />
            <PanelRow label="Przedawnienie" value="408 dni" danger />
          </div>
          <div className="mt-2.5 inline-flex items-center gap-1.5 rounded-md bg-white/[0.06] px-2 py-1.5">
            <ShieldCheck className="size-3 text-emerald-300" aria-hidden />
            <span className="text-[10px] font-medium text-slate-200">
              Sprzeciw z zarzutem przedawnienia
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function FloatingChip({
  className,
  icon,
  title,
  sub,
}: {
  className?: string;
  icon: React.ReactNode;
  title: string;
  sub: string;
}) {
  return (
    <div
      className={`absolute z-10 flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.07] py-1.5 pl-2 pr-3.5 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.6)] backdrop-blur-xl ${className ?? ""}`}
    >
      <span className="flex size-7 items-center justify-center rounded-full bg-gradient-to-br from-sky-400/90 to-blue-600/90 text-white shadow-[0_0_12px_2px_hsl(212_100%_60%/0.45)]">
        {icon}
      </span>
      <span className="flex flex-col leading-tight">
        <span className="text-[12px] font-semibold text-white">{title}</span>
        <span className="text-[10px] text-slate-300">{sub}</span>
      </span>
    </div>
  );
}

function PanelRow({
  label,
  value,
  danger,
}: {
  label: string;
  value: string;
  danger?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-[10px] uppercase tracking-[0.1em] text-slate-400">
        {label}
      </span>
      <span
        className={`font-mono text-[11px] font-medium tabular-nums ${danger ? "text-rose-300" : "text-white"}`}
      >
        {value}
      </span>
    </div>
  );
}

function TrustStat({
  value,
  label,
  hint,
}: {
  value: string;
  label: string;
  hint: string;
}) {
  return (
    <div className="flex flex-col">
      <dt className="font-display text-[22px] font-semibold leading-none text-white tabular-nums">
        {value}
      </dt>
      <dd className="mt-1.5 text-[12px] leading-snug text-slate-300">{label}</dd>
      <dd className="mt-0.5 text-[10px] leading-snug text-slate-500">{hint}</dd>
    </div>
  );
}
