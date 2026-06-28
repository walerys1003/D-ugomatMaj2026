/**
 * Tier 35 — Galeria szablonów pism procesowych.
 *
 * Source: GET /api/marketplace/templates/gallery.
 * Cele: pozwolić użytkownikowi przejrzeć premium szablony pism (certyfikowane
 * przez kancelarie) przed zakupem, z preview pierwszej strony.
 */
import Link from "next/link";
import type { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Galeria szablonów pism — Marketplace Długomat",
  description:
    "Premium wzory pism procesowych certyfikowane przez radców prawnych. Sprzeciw EPU, skarga komornicza, upadłość konsumencka, ugoda i więcej.",
  alternates: { canonical: "/marketplace/szablony" },
};

export const revalidate = 600;

interface Template {
  id: string;
  slug: string;
  title: string;
  category: string;            // "sprzeciw_epu" | "komornik" | "upadlosc" | ...
  module_key: string;          // D1..D16
  difficulty: "podstawowy" | "sredni" | "zaawansowany";
  page_count: number;
  certified_by: string;        // nazwa kancelarii certyfikującej
  legal_basis: string[];       // ["art. 505 KPC", "art. 118 KC"]
  preview_image_url: string | null;
  price_pln: number;
  bundle_price_pln: number | null;
  downloads_count: number;
  rating_avg: number;
  updated_at: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  sprzeciw_epu: "Sprzeciw od nakazu (EPU)",
  komornik: "Komornik / egzekucja",
  upadlosc: "Upadłość konsumencka",
  bik: "BIK / rejestry dłużników",
  cesja: "Cesja wierzytelności",
  ugoda: "Ugoda i raty",
  potracenia: "Potrącenia",
  inne: "Inne pisma",
};

const DIFFICULTY_BADGE: Record<Template["difficulty"], string> = {
  podstawowy: "bg-accent-100 text-accent-700",
  sredni: "bg-warn-50 text-warn-600",
  zaawansowany: "bg-danger-50 text-danger-600",
};

async function fetchTemplates(): Promise<Template[]> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/+$/, "") ?? "";
  try {
    const res = await fetch(`${baseUrl}/api/marketplace/templates/gallery`, {
      next: { revalidate: 600, tags: ["marketplace:templates"] },
    });
    if (!res.ok) return [];
    const json = (await res.json()) as { items?: Template[] };
    return json.items ?? [];
  } catch {
    return [];
  }
}

export default async function TemplatesGalleryPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const params = await searchParams;
  const templates = await fetchTemplates();
  const filtered = params.category
    ? templates.filter((t) => t.category === params.category)
    : templates;

  return (
    <div className="bg-gradient-to-b from-ink-50 to-white pb-20 dark:from-dlugomat-950 dark:to-dlugomat-900">
      <section className="container py-12 lg:py-20">
        <p className="mb-3 inline-flex items-center gap-2 text-fluid-xs font-semibold uppercase tracking-wider text-dlugomat-600 dark:text-dlugomat-300">
          <span className="h-px w-8 bg-dlugomat-600" />
          Szablony certyfikowane
        </p>
        <h1 className="font-display text-fluid-5xl font-bold leading-tight text-dlugomat-900 dark:text-ink-50">
          Wzory pism, którym sędziowie nie odmawiają
        </h1>
        <p className="mt-5 max-w-3xl text-fluid-lg leading-relaxed text-ink-700 dark:text-ink-200">
          Każdy szablon przeszedł audyt przez minimum dwóch radców prawnych. Cytujemy
          aktualne podstawy prawne, automatycznie aktualizujemy przy zmianach
          przepisów — Ty po prostu pobierasz najnowszą wersję.
        </p>

        <nav aria-label="Kategorie szablonów" className="mt-10 flex flex-wrap gap-2">
          <Link
            href="/marketplace/szablony"
            className={`rounded-full border px-4 py-2 text-fluid-sm font-medium ${
              !params.category
                ? "border-dlugomat-700 bg-dlugomat-700 text-white"
                : "border-ink-200 bg-white text-ink-700 hover:border-dlugomat-300 dark:border-dlugomat-800 dark:bg-dlugomat-900 dark:text-ink-200"
            }`}
          >
            Wszystkie ({templates.length})
          </Link>
          {Object.entries(CATEGORY_LABELS).map(([key, label]) => {
            const count = templates.filter((t) => t.category === key).length;
            if (count === 0) return null;
            return (
              <Link
                key={key}
                href={`/marketplace/szablony?category=${key}`}
                className={`rounded-full border px-4 py-2 text-fluid-sm font-medium ${
                  params.category === key
                    ? "border-dlugomat-700 bg-dlugomat-700 text-white"
                    : "border-ink-200 bg-white text-ink-700 hover:border-dlugomat-300 dark:border-dlugomat-800 dark:bg-dlugomat-900 dark:text-ink-200"
                }`}
              >
                {label} <span className="ml-1 text-ink-400">({count})</span>
              </Link>
            );
          })}
        </nav>
      </section>

      <section className="container">
        {filtered.length === 0 ? (
          <Card elevation="subtle" className="py-16 text-center">
            <CardContent>
              <p className="font-display text-fluid-xl text-ink-700">Brak szablonów w tej kategorii</p>
              <p className="mt-2 text-fluid-sm text-ink-500">
                Pracujemy nad nowymi wzorami. Wróć wkrótce.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((t) => (
              <Card
                key={t.id}
                elevation="subtle"
                className="group flex h-full flex-col overflow-hidden transition-shadow duration-base hover:shadow-pop"
              >
                <Link
                  href={`/marketplace/szablony/${t.slug}`}
                  className="flex aspect-[3/4] items-center justify-center border-b border-ink-200 bg-ink-50 dark:border-dlugomat-800 dark:bg-dlugomat-900"
                >
                  {t.preview_image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={t.preview_image_url}
                      alt=""
                      className="h-full w-full object-cover transition-transform duration-slow group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="text-center text-ink-300">
                      <p className="font-display text-fluid-4xl">PDF</p>
                      <p className="text-fluid-xs">{t.page_count} stron</p>
                    </div>
                  )}
                </Link>
                <CardContent className="flex flex-1 flex-col gap-3 p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">{CATEGORY_LABELS[t.category] ?? t.category}</Badge>
                    <span
                      className={`rounded-full px-2 py-0.5 text-fluid-xs font-semibold ${DIFFICULTY_BADGE[t.difficulty]}`}
                    >
                      {t.difficulty}
                    </span>
                  </div>
                  <h3 className="font-display text-fluid-lg font-semibold leading-tight text-dlugomat-900 dark:text-ink-50">
                    {t.title}
                  </h3>
                  <p className="text-fluid-xs text-ink-500">
                    Certyfikat: <span className="font-medium text-ink-700 dark:text-ink-200">{t.certified_by}</span>
                  </p>
                  <ul className="space-y-1 text-fluid-xs text-ink-600 dark:text-ink-300">
                    {t.legal_basis.slice(0, 2).map((b) => (
                      <li key={b} className="flex items-start gap-1.5">
                        <span aria-hidden className="mt-1 inline-block size-1 shrink-0 rounded-full bg-dlugomat-500" />
                        {b}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto flex items-center justify-between border-t border-ink-200 pt-3 dark:border-dlugomat-800">
                    <div>
                      <p className="font-display text-fluid-xl font-bold text-dlugomat-900 dark:text-ink-50">
                        {t.price_pln} zł
                      </p>
                      {t.bundle_price_pln != null && (
                        <p className="text-fluid-xs text-ink-500">
                          w pakiecie: {t.bundle_price_pln} zł
                        </p>
                      )}
                    </div>
                    <Button asChild size="sm" variant="primary">
                      <Link href={`/marketplace/szablony/${t.slug}`}>Zobacz</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
