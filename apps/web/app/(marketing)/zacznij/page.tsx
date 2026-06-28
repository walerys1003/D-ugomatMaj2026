import type { Metadata } from "next";
import Link from "next/link";
import { Scan, UserPlus, Building2, ArrowRight, Lock } from "lucide-react";
import { PageHero, PageSection } from "@/components/marketing/premium-page";

export const metadata: Metadata = {
  title: "Zacznij teraz — wybierz swoją ścieżkę",
  description:
    "Sprawdź dokument za darmo, załóż konto albo umów demo dla kancelarii. " +
    "Zacznij bronić się przed nakazem zapłaty już dziś.",
  alternates: { canonical: "/zacznij" },
};

const PATHS = [
  {
    icon: Scan,
    tag: "Najszybciej",
    title: "Sprawdź dokument za darmo",
    desc: "Wgraj nakaz zapłaty lub pismo windykacyjne. AI zrobi pierwszą analizę bez logowania i bez opłat.",
    href: "/skaner-nakazu",
    cta: "Uruchom skaner",
    featured: true,
  },
  {
    icon: UserPlus,
    tag: "Pełny dostęp",
    title: "Załóż darmowe konto",
    desc: "Zapisuj sprawy, generuj pisma, korzystaj z asystenta terminów i całej bazy wiedzy.",
    href: "/sign-up",
    cta: "Załóż konto",
    featured: false,
  },
  {
    icon: Building2,
    tag: "Dla firm",
    title: "Umów demo dla kancelarii",
    desc: "White-label, API i obsługa wielu spraw. Zobacz, jak Długomat skaluje pracę zespołu.",
    href: "/kontakt/firmy",
    cta: "Umów demo",
    featured: false,
  },
];

export default function ZacznijPage() {
  return (
    <>
      <PageHero
        eyebrow="Zacznij teraz"
        title={
          <>
            Wybierz ścieżkę.{" "}
            <span className="text-dlugomat-600">Działaj jeszcze dziś.</span>
          </>
        }
        lede="Niezależnie od tego, czy chcesz tylko sprawdzić dokument, czy korzystać z pełnej platformy — start zajmuje mniej niż minutę."
      >
        <p className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-ink-500">
          <Lock className="size-4 text-dlugomat-600" aria-hidden />
          Bez zobowiązań. Pierwsza analiza za darmo.
        </p>
      </PageHero>

      <PageSection>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {PATHS.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.href}
                className={`dlu-card dlu-card-hover relative flex flex-col p-7 ${
                  p.featured
                    ? "bg-gradient-to-b from-dlugomat-50 to-card ring-1 ring-dlugomat-500/40"
                    : ""
                }`}
              >
                {p.featured ? (
                  <span className="absolute -top-3 left-7 rounded-full bg-dlugomat-700 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-white shadow-md">
                    Polecane
                  </span>
                ) : null}
                <span className="dlu-icon-grad mb-5">
                  <Icon className="size-6" aria-hidden />
                </span>
                <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-dlugomat-700">
                  {p.tag}
                </span>
                <h3 className="mt-2 text-[20px] font-extrabold leading-snug tracking-[-0.02em] text-ink-900 dark:text-white">
                  {p.title}
                </h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-600">{p.desc}</p>
                <Link
                  href={p.href}
                  className="dlu-btn dlu-btn-primary dlu-btn-block group mt-6"
                >
                  {p.cta}
                  <ArrowRight
                    className="size-4 transition-transform group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </Link>
              </div>
            );
          })}
        </div>
      </PageSection>
    </>
  );
}
